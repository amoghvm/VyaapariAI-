import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { CustomerForm } from '@/features/customers/CustomerForm'

describe('CustomerForm', () => {
  it('renders add customer form', () => {
    render(
      <BrowserRouter>
        <CustomerForm />
      </BrowserRouter>
    )
    expect(screen.getByText(/Add Customer/i)).toBeInTheDocument()
  })
})
