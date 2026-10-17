export interface SarvamTranscribeResponse {
  request_id: string | null
  transcript: string
  language_code: string | null
  timestamps?: {
    words: string[]
    start_time_seconds: number[]
    end_time_seconds: number[]
  }
  language_probability?: number | null
}

export interface SarvamTranscribeError {
  error: {
    message: string
    code: string
    request_id?: string | null
  }
}
