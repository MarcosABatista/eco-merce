import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import * as fc from 'fast-check'
import { useProductStore } from '@/stores/useProductStore'

/**
 * Feature: marketplace-vitrine, Property 6: hasMorePages correctness
 * Validates: Requirements 8.3, 8.4
 *
 * For any currentPage (integer >= 0) and totalPages (integer >= 1),
 * hasMorePages shall be true iff currentPage < totalPages - 1.
 */
describe('useProductStore - hasMorePages correctness', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('hasMorePages is true iff currentPage < totalPages - 1', () => {
    fc.assert(
      fc.property(
        fc.nat(), // currentPage >= 0
        fc.integer({ min: 1, max: 1000 }), // totalPages >= 1
        (currentPage, totalPages) => {
          const store = useProductStore()

          store.currentPage = currentPage
          store.totalPages = totalPages

          const expected = currentPage < totalPages - 1

          expect(store.hasMorePages).toBe(expected)
        }
      ),
      { numRuns: 100 }
    )
  })
})
