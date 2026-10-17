import { useState, useRef, useCallback, useEffect } from 'react'
import { transcribeAudio } from '@/lib/sarvam-service'

export type RecordingState = 'idle' | 'recording' | 'processing' | 'success' | 'error'

export function useSpeechInput() {
  const [state, setState] = useState<RecordingState>('idle')
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<BlobPart[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<number | null>(null)
  const startTimeRef = useRef<number>(0)

  const getSupportedMimeType = useCallback(() => {
    const mimeTypes = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/ogg',
      'audio/mp4',
      'audio/wav',
    ]
    for (const mime of mimeTypes) {
      if (MediaRecorder.isTypeSupported(mime)) {
        return mime
      }
    }
    return undefined
  }, [])

  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now()
    timerRef.current = window.setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000))
    }, 1000)
  }, [])

  const stopTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const startRecording = useCallback(async () => {
    try {
      setError(null)
      setTranscript('')
      setElapsedTime(0)

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const mimeType = getSupportedMimeType()
      const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        stopTimer()
        const blob = new Blob(chunksRef.current, { type: mimeType || 'audio/webm' })
        if (blob.size === 0) {
          setState('error')
          setError('Recording is empty')
          return
        }
        setState('processing')
        try {
          const result = await transcribeAudio(blob)
          setTranscript(result.transcript)
          setState('success')
        } catch (err) {
          setState('error')
          setError(err instanceof Error ? err.message : 'Transcription failed')
        }
      }

      mediaRecorder.onerror = () => {
        stopTimer()
        setState('error')
        setError('Recording failed')
      }

      mediaRecorder.start()
      setState('recording')
      startTimer()
    } catch (err) {
      stopTimer()
      setState('error')
      setError(err instanceof Error ? err.message : 'Microphone permission denied or not available')
    }
  }, [getSupportedMimeType, startTimer, stopTimer])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
  }, [])

  const cancel = useCallback(() => {
    stopTimer()
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setState('idle')
    setTranscript('')
    setError(null)
    setElapsedTime(0)
  }, [stopTimer])

  const clear = useCallback(() => {
    setState('idle')
    setTranscript('')
    setError(null)
    setElapsedTime(0)
  }, [])

  const retry = useCallback(() => {
    startRecording()
  }, [startRecording])

  useEffect(() => {
    return () => {
      stopTimer()
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [stopTimer])

  return {
    state,
    transcript,
    error,
    elapsedTime,
    startRecording,
    stopRecording,
    cancel,
    clear,
    retry,
    setTranscript,
  }
}
