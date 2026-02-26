import React, { useState, useEffect } from "react"
import { useAIStore } from '../../stores/aiStore'
import { useEditorStore } from '../../stores/editorStore'
import type { AIProvider } from '../../types'
import { builtInThemes, applyTheme, getThemeById } from '../../lib/themes'

const FONT_OPTIONS = [
  'Inter, sans-serif',
  'Roboto, sans-serif',
  "'Playfair Display', serif",
  "'Fira Code', monospace",
  'system-ui, sans-serif',
  'Georgia, serif',
  "'Courier New', monospace"
]

export function SettingsView(): React.JSX.Element {
  const deck = useEditorStore((s) => s.currentDeck)
  const updateDimensions = useEditorStore((s) => s.updateDimensions)
  const updateTheme = useEditorStore((s) => s.updateTheme)
  const updateDeckName = useEditorStore((s) => s.updateDeckName)
  const updateDeckDescription = useEditorStore((s) => s.updateDeckDescription)
  const aiStore = useAIStore()
  const [activeThemeId, setActiveThemeId] = useState('dark')
  const [useGradient, setUseGradient] = useState(false)

  // Apply saved theme on mount
  useEffect(() => {
    const saved = localStorage.getItem('deckforge-theme')
    if (saved) {
      const theme = getThemeById(saved)
      if (theme) {
        applyTheme(theme)
        setActiveThemeId(saved)
      }
    }
  }, [])

  if (!deck) return <div />

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>⚙️ Settings</h2>

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        {/* Deck Settings */}
        <div style={{ width: 320 }}>
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius)', padding: 16 }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Deck Info</h3>

            <div className="form-group">
              <label className="input-label">Deck Name</label>
              <input className="input" value={deck.name} onChange={(e) => updateDeckName(e.target.value)} />
            </div>

            <div className="form-group">
              <label className="input-label">Description</label>
              <textarea
                className="input"
                rows={3}
                value={deck.description}
                onChange={(e) => updateDeckDescription(e.target.value)}
              />
            </div>
          </div>

          <div
            style={{
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius)',
              padding: 16,
              marginTop: 16
            }}
          >
            <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Card Dimensions</h3>

            <div className="form-group">
              <label className="input-label">Preset</label>
              <select
                className="input"
                onChange={(e) => {
                  const presets: Record<string, { width: number; height: number }> = {
                    'top-trumps': { width: 62, height: 100 },
                    poker: { width: 63.5, height: 88.9 },
                    tarot: { width: 70, height: 120 },
                    mini: { width: 44, height: 67 },
                    square: { width: 70, height: 70 }
                  }
                  const p = presets[e.target.value]
                  if (p) updateDimensions(p)
                }}
              >
                <option value="">Custom</option>
                <option value="top-trumps">Top Trumps (62×100mm)</option>
                <option value="poker">Poker (63.5×88.9mm)</option>
                <option value="tarot">Tarot (70×120mm)</option>
                <option value="mini">Mini (44×67mm)</option>
                <option value="square">Square (70×70mm)</option>
              </select>
            </div>

            <div className="form-group">
              <div className="form-row">
                <div style={{ flex: 1 }}>
                  <label className="input-label">Width (mm)</label>
                  <input
                    className="input"
                    type="number"
                    value={deck.dimensions.width}
                    onChange={(e) => updateDimensions({ width: parseFloat(e.target.value) || 62 })}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="input-label">Height (mm)</label>
                  <input
                    className="input"
                    type="number"
                    value={deck.dimensions.height}
                    onChange={(e) => updateDimensions({ height: parseFloat(e.target.value) || 100 })}
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <div className="form-row">
                <div style={{ flex: 1 }}>
                  <label className="input-label">Bleed (mm)</label>
                  <input
                    className="input"
                    type="number"
                    value={deck.dimensions.bleed}
                    onChange={(e) => updateDimensions({ bleed: parseFloat(e.target.value) || 3 })}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="input-label">Corner Radius (mm)</label>
                  <input
                    className="input"
                    type="number"
                    value={deck.dimensions.cornerRadius}
                    onChange={(e) => updateDimensions({ cornerRadius: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* App Theme */}
        <div style={{ width: 320 }}>
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius)', padding: 16, marginBottom: 16 }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>🎨 App Theme</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {builtInThemes.map((theme) => (
                <div
                  key={theme.id}
                  onClick={() => {
                    applyTheme(theme)
                    setActiveThemeId(theme.id)
                    localStorage.setItem('deckforge-theme', theme.id)
                  }}
                  style={{
                    cursor: 'pointer',
                    borderRadius: 'var(--radius-sm)',
                    border: activeThemeId === theme.id ? '2px solid var(--accent)' : '2px solid transparent',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{ display: 'flex', height: 32 }}>
                    <div style={{ flex: 1, background: theme.variables['--bg-primary'] }} />
                    <div style={{ flex: 1, background: theme.variables['--bg-secondary'] }} />
                    <div style={{ flex: 1, background: theme.variables['--accent'] }} />
                  </div>
                  <div style={{ fontSize: 10, textAlign: 'center', padding: '3px 0', background: theme.variables['--bg-tertiary'], color: theme.variables['--text-primary'] }}>
                    {theme.name}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Deck Theme */}
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius)', padding: 16 }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Deck Theme</h3>

            {(
              [
                ['primaryColor', 'Primary'],
                ['secondaryColor', 'Secondary'],
                ['backgroundColor', 'Background'],
                ['textColor', 'Text'],
                ['accentColor', 'Accent']
              ] as const
            ).map(([key, label]) => (
              <div className="form-group" key={key}>
                <label className="input-label">{label}</label>
                <div className="form-row">
                  <input
                    type="color"
                    value={deck.theme[key]}
                    onChange={(e) => updateTheme({ [key]: e.target.value })}
                    style={{ width: 32, height: 28, border: 'none', padding: 0 }}
                  />
                  <input
                    className="input"
                    value={deck.theme[key]}
                    onChange={(e) => updateTheme({ [key]: e.target.value })}
                  />
                </div>
              </div>
            ))}

            <div className="form-group">
              <label className="input-label">Font Family</label>
              <select
                className="input"
                value={deck.theme.fontFamily}
                onChange={(e) => updateTheme({ fontFamily: e.target.value })}
              >
                {FONT_OPTIONS.map((f) => (
                  <option key={f} value={f}>{f.split(',')[0].replace(/'/g, '')}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="input-label">Heading Font</label>
              <select
                className="input"
                value={deck.theme.headingFontFamily}
                onChange={(e) => updateTheme({ headingFontFamily: e.target.value })}
              >
                {FONT_OPTIONS.map((f) => (
                  <option key={f} value={f}>{f.split(',')[0].replace(/'/g, '')}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={useGradient}
                  onChange={(e) => setUseGradient(e.target.checked)}
                />
                Gradient background
              </label>
            </div>

            {/* Mini card preview */}
            <div style={{ marginTop: 12 }}>
              <label className="input-label" style={{ marginBottom: 6 }}>Preview</label>
              <div
                style={{
                  width: 120,
                  height: 180,
                  borderRadius: 8,
                  overflow: 'hidden',
                  border: '1px solid var(--border)',
                  background: useGradient
                    ? `linear-gradient(135deg, ${deck.theme.primaryColor}, ${deck.theme.secondaryColor})`
                    : deck.theme.backgroundColor,
                  color: deck.theme.textColor,
                  fontFamily: deck.theme.fontFamily,
                  padding: 10,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4
                }}
              >
                <div style={{ fontFamily: deck.theme.headingFontFamily, fontWeight: 700, fontSize: 11 }}>
                  Card Title
                </div>
                <div style={{ width: '100%', height: 50, background: deck.theme.accentColor, borderRadius: 4, opacity: 0.3 }} />
                <div style={{ fontSize: 8, opacity: 0.7 }}>Description text here</div>
                <div style={{ marginTop: 'auto', fontSize: 8, color: deck.theme.accentColor, fontWeight: 600 }}>
                  ★ 85 / 100
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Settings */}
        <div style={{ width: 320 }}>
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius)', padding: 16 }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>🤖 AI Providers</h3>

            {aiStore.providers.map((provider) => (
              <div
                key={provider.id}
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  padding: 10,
                  marginBottom: 8
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontWeight: 600, fontSize: 12 }}>{provider.name}</span>
                  <label style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <input
                      type="checkbox"
                      checked={provider.enabled}
                      onChange={(e) => aiStore.updateProvider(provider.id, { enabled: e.target.checked })}
                    />
                    Enabled
                  </label>
                </div>

                {provider.provider !== 'ollama' && (
                  <div className="form-group">
                    <label className="input-label">API Key</label>
                    <input
                      className="input"
                      type="password"
                      value={provider.apiKey ?? ''}
                      onChange={(e) => aiStore.updateProvider(provider.id, { apiKey: e.target.value })}
                      placeholder="Enter API key"
                    />
                  </div>
                )}

                {provider.provider === 'ollama' && (
                  <div className="form-group">
                    <label className="input-label">Base URL</label>
                    <input
                      className="input"
                      value={provider.baseUrl ?? ''}
                      onChange={(e) => aiStore.updateProvider(provider.id, { baseUrl: e.target.value })}
                    />
                  </div>
                )}

                <div className="form-group">
                  <label className="input-label">Text Model</label>
                  <input
                    className="input"
                    value={provider.textModel}
                    onChange={(e) => aiStore.updateProvider(provider.id, { textModel: e.target.value })}
                  />
                </div>

                {provider.imageModel !== undefined && (
                  <div className="form-group">
                    <label className="input-label">Image Model</label>
                    <input
                      className="input"
                      value={provider.imageModel ?? ''}
                      onChange={(e) => aiStore.updateProvider(provider.id, { imageModel: e.target.value })}
                    />
                  </div>
                )}
              </div>
            ))}

            <button
              className="btn btn-sm"
              onClick={() =>
                aiStore.addProvider({
                  provider: 'custom' as AIProvider,
                  name: 'Custom Provider',
                  enabled: false,
                  textModel: '',
                  baseUrl: ''
                })
              }
            >
              + Add Provider
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
