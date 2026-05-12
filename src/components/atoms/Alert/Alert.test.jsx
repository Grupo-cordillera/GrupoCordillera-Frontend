import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Alert } from './Alert.jsx'

describe('Alert', () => {
  it('renders message and calls onClose', () => {
    const onClose = vi.fn()
    render(<Alert type="error" message="Boom" onClose={onClose} />)

    expect(screen.getByText(/boom/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
