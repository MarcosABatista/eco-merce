import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import { useFormatters } from '@/composables/useFormatters'

/**
 * Feature: marketplace-vitrine
 * Property 2: Banner title truncation
 * Validates: Requirements 3.2, 3.4
 */

describe('Property 2: Banner title truncation', () => {
  const { truncateText } = useFormatters()

  it('if input ≤ 60 chars, output equals input unchanged', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 0, maxLength: 60 }),
        (input) => {
          const output = truncateText(input, 60)
          expect(output).toBe(input)
        },
      ),
      { numRuns: 100 },
    )
  })

  it('if input > 60 chars, output equals first 60 chars + "…" (61 chars total)', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 61, maxLength: 300 }),
        (input) => {
          const output = truncateText(input, 60)
          expect(output).toBe(input.slice(0, 60) + '\u2026')
          expect(output.length).toBe(61)
        },
      ),
      { numRuns: 100 },
    )
  })
})
