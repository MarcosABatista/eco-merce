import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import { useFormatters } from '@/composables/useFormatters'

/**
 * Feature: marketplace-vitrine
 * Property 4: Price formatting as BRL currency
 * Validates: Requirements 6.4
 */

describe('Property 4: Price formatting as BRL currency', () => {
  const { formatPrice } = useFormatters()

  it('formatted output starts with "R$"', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 999999.99, noNaN: true }),
        (value) => {
          const formatted = formatPrice(value)
          // Intl may use non-breaking space (U+00A0) after R$
          expect(formatted.startsWith('R$')).toBe(true)
        },
      ),
      { numRuns: 100 },
    )
  })

  it('uses comma as decimal separator with exactly 2 decimal places', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 999999.99, noNaN: true }),
        (value) => {
          const formatted = formatPrice(value)
          // The formatted string should end with a comma followed by exactly 2 digits
          expect(formatted).toMatch(/,\d{2}$/)
        },
      ),
      { numRuns: 100 },
    )
  })

  it('numeric value parsed back equals original value rounded to 2 decimal places', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 999999.99, noNaN: true }),
        (value) => {
          const formatted = formatPrice(value)

          // Reverse the locale format:
          // 1. Remove "R$" prefix (and any non-breaking space)
          // 2. Replace period (thousands separator) with empty string
          // 3. Replace comma (decimal separator) with period
          const numericStr = formatted
            .replace(/R\$\s?/, '')   // Remove currency symbol + optional space (including \u00A0)
            .replace(/\u00a0/g, '')  // Remove any remaining non-breaking spaces
            .replace(/\./g, '')      // Remove thousands separator (period)
            .replace(',', '.')       // Convert decimal separator (comma) to period
            .trim()

          const parsedValue = parseFloat(numericStr)
          const expectedValue = Math.round(value * 100) / 100

          expect(parsedValue).toBeCloseTo(expectedValue, 2)
        },
      ),
      { numRuns: 100 },
    )
  })
})
