import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { Sales } from '@/features/sales/Sales'

describe('Sales', () => {
  it('renders sales page header', () => {
    render(
      <BrowserRouter>
        <Sales />
      </BrowserRouter>
    )
    expect(screen.getByText('Sales')).toBeInTheDocument()
  })
})
