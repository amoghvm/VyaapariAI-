export function SpeechInput({ onSubmit }: { onSubmit: (text: string) => void }) {
  return (
    <div>
      <button type="button" aria-label="Start voice recording">Start Voice Recording</button>
    </div>
  )
}
