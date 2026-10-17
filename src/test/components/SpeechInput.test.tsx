import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SpeechInput } from '@/components/SpeechInput'

describe('SpeechInput', () => {
  const onSubmit = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders idle state with start button', () => {
    render(<SpeechInput onSubmit={onSubmit} />)
    expect(screen.getByText(/Start Voice Recording/i)).toBeInTheDocument()
  })
})
