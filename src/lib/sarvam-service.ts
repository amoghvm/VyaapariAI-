import { supabase } from './supabase'
import type { SarvamTranscribeResponse, SarvamTranscribeError } from '@/types/stt'

export async function transcribeAudio(
  file: Blob | File,
  options?: {
    languageCode?: string
    withTimestamps?: boolean
    inputAudioCodec?: string
    keyterms?: string[]
  }
): Promise<SarvamTranscribeResponse> {
  const formData = new FormData()
  formData.append('file', file)

  if (options?.languageCode) {
    formData.append('language_code', options.languageCode)
  }
  if (options?.withTimestamps) {
    formData.append('with_timestamps', 'true')
  }
  if (options?.inputAudioCodec) {
    formData.append('input_audio_codec', options.inputAudioCodec)
  }
  if (options?.keyterms) {
    formData.append('keyterms', JSON.stringify(options.keyterms))
  }

  const { data, error } = await supabase.functions.invoke('sarvam-transcribe', {
    body: formData,
  })

  if (error) {
    const err = error as unknown
    const e = err as SarvamTranscribeError & { message?: string }
    throw new Error(e?.error?.message || e?.message || 'Transcription failed')
  }

  if (!data) {
    throw new Error('No response data from transcription service')
  }

  return data as SarvamTranscribeResponse
}
