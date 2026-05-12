import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Button } from './Button.jsx'

describe('Button', () => {
  it('applies variants and sizes', () => {
    render(
      <Button variant="secondary" size="small" fullWidth>
        Save
      </Button>
    )

    const button = screen.getByRole('button', { name: /save/i })
    expect(button.className).toContain('button--secondary')
    expect(button.className).toContain('button--small')
    expect(button.className).toContain('button--full-width')
  })

  it('shows loading state', () => {
    render(<Button isLoading>Save</Button>)

    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveTextContent(/cargando/i)
  })
})
