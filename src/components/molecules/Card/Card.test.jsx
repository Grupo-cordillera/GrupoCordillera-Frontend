import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Card } from './Card.jsx'

describe('Card', () => {
  it('renders children and classes', () => {
    const { container } = render(
      <Card className="custom" shadow="large">
        <span>Content</span>
      </Card>
    )

    expect(screen.getByText(/content/i)).toBeInTheDocument()

    const card = container.firstChild
    expect(card).toHaveClass('card')
    expect(card).toHaveClass('card--large')
    expect(card).toHaveClass('custom')
  })
})
