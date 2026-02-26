export interface AppTheme {
  id: string
  name: string
  variables: Record<string, string>
}

export const builtInThemes: AppTheme[] = [
  {
    id: 'dark',
    name: 'Dark',
    variables: {
      '--bg-primary': '#0a0a0a',
      '--bg-secondary': '#141414',
      '--bg-tertiary': '#1e1e1e',
      '--bg-hover': '#2a2a2a',
      '--bg-active': '#333333',
      '--border': '#2a2a2a',
      '--border-light': '#3a3a3a',
      '--text-primary': '#e8e8e8',
      '--text-secondary': '#999999',
      '--text-muted': '#666666',
      '--accent': '#6366f1',
      '--accent-hover': '#818cf8',
      '--accent-muted': 'rgba(99, 102, 241, 0.15)',
      '--canvas-bg': '#1a1a1a'
    }
  },
  {
    id: 'light',
    name: 'Light',
    variables: {
      '--bg-primary': '#f5f5f5',
      '--bg-secondary': '#ffffff',
      '--bg-tertiary': '#e8e8e8',
      '--bg-hover': '#d4d4d4',
      '--bg-active': '#c0c0c0',
      '--border': '#d4d4d4',
      '--border-light': '#b0b0b0',
      '--text-primary': '#1a1a1a',
      '--text-secondary': '#555555',
      '--text-muted': '#888888',
      '--accent': '#2563eb',
      '--accent-hover': '#1d4ed8',
      '--accent-muted': 'rgba(37, 99, 235, 0.12)',
      '--canvas-bg': '#e0e0e0'
    }
  },
  {
    id: 'midnight',
    name: 'Midnight',
    variables: {
      '--bg-primary': '#0a0e27',
      '--bg-secondary': '#101638',
      '--bg-tertiary': '#131842',
      '--bg-hover': '#1c2350',
      '--bg-active': '#252e5e',
      '--border': '#1c2350',
      '--border-light': '#2a3468',
      '--text-primary': '#e0e4ff',
      '--text-secondary': '#8890c0',
      '--text-muted': '#5a6299',
      '--accent': '#6366f1',
      '--accent-hover': '#818cf8',
      '--accent-muted': 'rgba(99, 102, 241, 0.2)',
      '--canvas-bg': '#0c1030'
    }
  },
  {
    id: 'forest',
    name: 'Forest',
    variables: {
      '--bg-primary': '#0a1a0a',
      '--bg-secondary': '#122012',
      '--bg-tertiary': '#1a2e1a',
      '--bg-hover': '#243824',
      '--bg-active': '#2e422e',
      '--border': '#1e321e',
      '--border-light': '#2e4a2e',
      '--text-primary': '#d8f0d8',
      '--text-secondary': '#88b088',
      '--text-muted': '#5a8a5a',
      '--accent': '#22c55e',
      '--accent-hover': '#16a34a',
      '--accent-muted': 'rgba(34, 197, 94, 0.15)',
      '--canvas-bg': '#0e1e0e'
    }
  },
  {
    id: 'sunset',
    name: 'Sunset',
    variables: {
      '--bg-primary': '#1a0a0a',
      '--bg-secondary': '#201212',
      '--bg-tertiary': '#2e1a1a',
      '--bg-hover': '#3a2424',
      '--bg-active': '#442e2e',
      '--border': '#321e1e',
      '--border-light': '#4a2e2e',
      '--text-primary': '#f0d8d8',
      '--text-secondary': '#b08888',
      '--text-muted': '#8a5a5a',
      '--accent': '#f97316',
      '--accent-hover': '#ea580c',
      '--accent-muted': 'rgba(249, 115, 22, 0.15)',
      '--canvas-bg': '#1e0e0e'
    }
  }
]

/**
 * Apply a theme by setting CSS variables on :root
 */
export function applyTheme(theme: AppTheme): void {
  const root = document.documentElement
  for (const [prop, value] of Object.entries(theme.variables)) {
    root.style.setProperty(prop, value)
  }
}

/**
 * Get a theme by ID
 */
export function getThemeById(id: string): AppTheme | undefined {
  return builtInThemes.find((t) => t.id === id)
}
