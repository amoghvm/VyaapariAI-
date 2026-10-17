import { Bot, Send, Loader2 } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { SpeechInput } from '@/components/SpeechInput'

export function Assistant() {
  const [messages, setMessages] = useState<Array<{ id: string; role: 'user' | 'assistant'; content: string }>>([
    { id: '1', role: 'assistant', content: 'Welcome to VyapariAI! How can I help you with your business today?' },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = { id: Date.now().toString(), role: 'user' as const, content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    await new Promise((r) => setTimeout(r, 1000))

    const assistantMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant' as const,
      content: 'This is a placeholder response. The AI assistant integration will be implemented with transcription, intent recognition, and business operation execution.',
    }
    setMessages((prev) => [...prev, assistantMessage])
    setLoading(false)
  }

  const handleVoiceSubmit = (text: string) => {
    if (!text.trim() || loading) return
    const userMessage = { id: Date.now().toString(), role: 'user' as const, content: text }
    setMessages((prev) => [...prev, userMessage])
    setLoading(true)
    setTimeout(() => {
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: 'This is a placeholder response. The AI assistant integration will be implemented with transcription, intent recognition, and business operation execution.',
      }
      setMessages((prev) => [...prev, assistantMessage])
      setLoading(false)
    }, 1000)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Bot className="h-6 w-6 text-primary-600" />
          AI Assistant
        </h1>
        <p className="text-gray-600 mt-1">Ask questions or give commands in natural language</p>
      </div>
      <div className="card flex-1 flex flex-col overflow-hidden">
        <div className="card-body flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                  msg.role === 'user'
                    ? 'bg-primary-600 text-white rounded-br-md'
                    : 'bg-gray-100 text-gray-900 rounded-bl-md'
                }`}
              >
                <p className="text-sm">{msg.content}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="border-t border-gray-200 p-4">
          <form onSubmit={handleSubmit} className="flex gap-2 mb-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="input flex-1"
              disabled={loading}
            />
            <button type="submit" className="btn-primary" disabled={loading || !input.trim()}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </form>
          <SpeechInput onSubmit={handleVoiceSubmit} />
          <p className="text-xs text-gray-500 mt-2 text-center">Voice transcription via secure server-side API</p>
        </div>
      </div>
    </div>
  )
}
