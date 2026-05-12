import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Input } from './Input.jsx'

describe('Input', () => {
  it('renders label and error message', () => {
    render(<Input id="user" label="User" error="Required" />)

    expect(screen.getByLabelText(/user/i)).toBeInTheDocument()
    expect(screen.getByText(/required/i)).toBeInTheDocument()
  })
})
