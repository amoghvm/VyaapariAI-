import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { ProductForm } from '@/features/products/ProductForm'

describe('ProductForm', () => {
  it('renders add product form', () => {
    render(
      <BrowserRouter>
        <ProductForm />
      </BrowserRouter>
    )
    expect(screen.getByText(/Add Product/i)).toBeInTheDocument()
  })
})
