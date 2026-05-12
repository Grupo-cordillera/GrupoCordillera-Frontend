import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { LoginForm } from './LoginForm.jsx'

describe('LoginForm', () => {
  it('shows required errors when submitting empty form', async () => {
    const handleSubmit = vi.fn().mockResolvedValue(undefined)

    render(<LoginForm onSubmit={handleSubmit} isLoading={false} error={null} />)

    fireEvent.click(screen.getByRole('button', { name: /inicia/i }))

    const messages = await screen.findAllByText(/requerid/i)
    expect(messages).toHaveLength(2)
    expect(handleSubmit).not.toHaveBeenCalled()
  })

  it('submits credentials when valid', async () => {
    const handleSubmit = vi.fn().mockResolvedValue(undefined)

    render(<LoginForm onSubmit={handleSubmit} isLoading={false} error={null} />)

    fireEvent.change(screen.getByLabelText(/usuario/i), {
      target: { value: 'demo.user' },
    })
    fireEvent.change(screen.getByLabelText(/contrase/i), {
      target: { value: 'secret123' },
    })

    fireEvent.click(screen.getByRole('button', { name: /inicia/i }))

    await waitFor(() =>
      expect(handleSubmit).toHaveBeenCalledWith({
        username: 'demo.user',
        password: 'secret123',
      })
    )
  })

  it('shows loading state on the submit button', () => {
    const handleSubmit = vi.fn()

    render(<LoginForm onSubmit={handleSubmit} isLoading={true} error={null} />)

    const button = screen.getByRole('button', { name: /cargando/i })
    expect(button).toBeDisabled()
  })

  it('shows fallback error message on non-error rejection', async () => {
    const handleSubmit = vi.fn().mockRejectedValue('fail')

    render(<LoginForm onSubmit={handleSubmit} isLoading={false} error={null} />)

    fireEvent.change(screen.getByLabelText(/usuario/i), {
      target: { value: 'demo' },
    })
    fireEvent.change(screen.getByLabelText(/contrase/i), {
      target: { value: 'secret123' },
    })

    fireEvent.click(screen.getByRole('button', { name: /inicia/i }))

    expect(await screen.findByText(/error al iniciar sesi[oó]n/i)).toBeInTheDocument()
  })
})
