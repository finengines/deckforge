import { describe, it, expect } from 'vitest'
import { snapToGrid } from '../lib/snapping'

describe('snapToGrid', () => {
  it('snaps to nearest grid point', () => {
    expect(snapToGrid(12, 10)).toBe(10)
    expect(snapToGrid(17, 10)).toBe(20)
    expect(snapToGrid(15, 10)).toBe(20)
    expect(snapToGrid(0, 10)).toBe(0)
    expect(snapToGrid(100, 10)).toBe(100)
  })

  it('works with different grid sizes', () => {
    expect(snapToGrid(7, 5)).toBe(5)
    expect(snapToGrid(13, 5)).toBe(15)
    expect(snapToGrid(3, 1)).toBe(3)
  })

  it('handles negative values', () => {
    expect(snapToGrid(-7, 10)).toBe(-10)
    expect(snapToGrid(-3, 10)).toBe(-0) // Math.round(-0.3) * 10 = -0
  })
})
