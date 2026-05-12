import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Logo } from './Logo.jsx'

describe('Logo', () => {
  it('renders brand text', () => {
    render(<Logo />)

    expect(screen.getByText(/grupocordillera/i)).toBeInTheDocument()
  })
})
