import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4"

const SARVAM_API_KEY = Deno.env.get("SARVAM_API_KEY")
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")

const MAX_AUDIO_BYTES = 25 * 1024 * 1024 // 25MB
const MAX_DURATION_SECONDS = 600 // 10 minutes

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  })
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== "POST") {
    return jsonResponse(405, { error: { message: "Method not allowed", code: "invalid_request_error" } })
  }

  try {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return jsonResponse(500, { error: { message: "Server configuration error", code: "internal_server_error" } })
    }

    const authHeader = req.headers.get("Authorization")
    if (!authHeader) {
      return jsonResponse(401, { error: { message: "Missing authorization header", code: "authentication_error" } })
    }

    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    })

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return jsonResponse(401, { error: { message: "Invalid authentication", code: "authentication_error" } })
    }

    if (!SARVAM_API_KEY) {
      return jsonResponse(500, { error: { message: "Server missing API key", code: "internal_server_error" } })
    }

    const contentType = req.headers.get("Content-Type") || ""
    if (!contentType.includes("multipart/form-data")) {
      return jsonResponse(400, { error: { message: "Content-Type must be multipart/form-data", code: "invalid_request_error" } })
    }

    const formData = await req.formData()

    const file = formData.get("file") as File | null
    if (!file) {
      return jsonResponse(400, { error: { message: "Missing 'file' in request", code: "invalid_request_error" } })
    }

    const bytes = await file.arrayBuffer()
    if (bytes.byteLength === 0) {
      return jsonResponse(400, { error: { message: "Audio file is empty", code: "invalid_request_error" } })
    }
    if (bytes.byteLength > MAX_AUDIO_BYTES) {
      return jsonResponse(413, { error: { message: "Audio exceeds size limit of 25MB", code: "invalid_request_error" } })
    }

    const languageCode = formData.get("language_code") as string | null
    const withTimestamps = formData.get("with_timestamps") as string | null
    const inputAudioCodec = formData.get("input_audio_codec") as string | null
    const keyterms = formData.get("keyterms") as string | null

    const sarvamForm = new FormData()
    const fileBlob = new Blob([bytes], { type: file.type || "application/octet-stream" })
    sarvamForm.append("file", fileBlob, file.name || "audio")

    sarvamForm.append("model", "saaras:v4")

    if (languageCode) {
      sarvamForm.append("language_code", languageCode)
    }
    if (withTimestamps !== null) {
      sarvamForm.append("with_timestamps", withTimestamps)
    }
    if (inputAudioCodec) {
      sarvamForm.append("input_audio_codec", inputAudioCodec)
    }
    if (keyterms) {
      sarvamForm.append("keyterms", keyterms)
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000)

    const sarvamRes = await fetch("https://api.sarvam.ai/speech-to-text", {
      method: "POST",
      headers: {
        "api-subscription-key": SARVAM_API_KEY,
      },
      body: sarvamForm,
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    let data: any
    try {
      data = await sarvamRes.json()
    } catch (e) {
      return jsonResponse(502, { error: { message: "Invalid response from Sarvam", code: "gateway_timeout_error" } })
    }

    if (!sarvamRes.ok) {
      const errorMsg = data?.error?.message || data?.message || "Sarvam API error"
      const errorCode = data?.error?.code || "model_call_error"
      return jsonResponse(sarvamRes.status >= 500 ? 502 : sarvamRes.status, {
        error: { message: errorMsg, code: errorCode },
      })
    }

    const response = {
      request_id: data?.request_id ?? null,
      transcript: data?.transcript ?? "",
      language_code: data?.language_code ?? null,
      timestamps: data?.timestamps ?? undefined,
      language_probability: data?.language_probability ?? undefined,
    }

    return jsonResponse(200, response)
  } catch (err: any) {
    if (err?.name === "AbortError") {
      return jsonResponse(504, { error: { message: "Request timeout", code: "gateway_timeout_error" } })
    }
    return jsonResponse(500, { error: { message: "Internal server error", code: "internal_server_error" } })
  }
})
