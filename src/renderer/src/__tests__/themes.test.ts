import { describe, it, expect } from 'vitest'
import { builtInThemes, getThemeById } from '../lib/themes'

describe('themes', () => {
  it('has 5 built-in themes', () => {
    expect(builtInThemes).toHaveLength(5)
  })

  it('each theme has required fields', () => {
    for (const theme of builtInThemes) {
      expect(theme.id).toBeTruthy()
      expect(theme.name).toBeTruthy()
      expect(theme.variables['--bg-primary']).toBeTruthy()
      expect(theme.variables['--accent']).toBeTruthy()
      expect(theme.variables['--text-primary']).toBeTruthy()
    }
  })

  it('getThemeById returns correct theme', () => {
    expect(getThemeById('dark')?.name).toBe('Dark')
    expect(getThemeById('light')?.name).toBe('Light')
    expect(getThemeById('nonexistent')).toBeUndefined()
  })
})
