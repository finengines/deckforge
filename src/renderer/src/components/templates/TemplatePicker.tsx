import React from "react"
import { useCallback } from 'react'
import { useEditorStore } from '../../stores/editorStore'
import { builtInTemplates } from '../../lib/templates'
import type { CardTemplate } from '../../types'

const TEMPLATE_COLORS: Record<string, string> = {
  'tt-classic': '#0D47A1',
  'tt-sports-star': '#D32F2F',
  'tt-animals-nature': '#2E7D32',
  'tt-speed-machines': '#F44336',
  'tt-superheroes': '#FF6F00',
  'tt-space-explorer': '#00E5FF',
  'tt-history-legends': '#8D6E63',
  'tt-food-cooking': '#E65100',
  'tt-music-culture': '#9C27B0',
  'tt-kids-cartoon': '#FF5722',
  'tt-photo-minimal': '#607D8B',
  'tt-premium-gold': '#C9A84C'
}

const TEMPLATE_ICONS: Record<string, string> = {
  'tt-classic': '🃏',
  'tt-sports-star': '⚽',
  'tt-animals-nature': '🦁',
  'tt-speed-machines': '🏎️',
  'tt-superheroes': '🦸',
  'tt-space-explorer': '🚀',
  'tt-history-legends': '📜',
  'tt-food-cooking': '🍳',
  'tt-music-culture': '🎵',
  'tt-kids-cartoon': '🎨',
  'tt-photo-minimal': '📷',
  'tt-premium-gold': '👑'
}

export function TemplatePicker(): React.JSX.Element {
  const deck = useEditorStore((s) => s.currentDeck)
  const loadDeck = useEditorStore((s) => s.loadDeck)

  const applyTemplate = useCallback(
    (template: CardTemplate) => {
      if (!deck) return
      loadDeck({
        ...deck,
        frontTemplate: { ...template, builtIn: false, id: deck.frontTemplate.id },
        updatedAt: new Date().toISOString()
      })
    },
    [deck, loadDeck]
  )

  // Gather all templates: built-in + any custom from the deck's current template if it's not built-in
  const allTemplates = [...builtInTemplates]

  const activeTemplateId = deck?.frontTemplate?.name

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ color: 'var(--text-primary, #fff)', fontSize: 16, marginBottom: 4 }}>Choose a Template</h2>
      <p style={{ color: 'var(--text-muted, #999)', fontSize: 12, marginBottom: 16 }}>
        Select a template to apply to your deck's front design. This replaces the current front layers.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 12
        }}
      >
        {allTemplates.map((tpl) => {
          const isActive = activeTemplateId === tpl.name
          const color = TEMPLATE_COLORS[tpl.id] ?? '#888'
          const icon = TEMPLATE_ICONS[tpl.id] ?? '📄'

          return (
            <div
              key={tpl.id}
              onClick={() => applyTemplate(tpl)}
              style={{
                background: 'var(--bg-secondary, #16213e)',
                border: `2px solid ${isActive ? color : 'var(--border, #333)'}`,
                borderRadius: 8,
                padding: 16,
                cursor: 'pointer',
                transition: 'border-color 0.15s, transform 0.15s',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLDivElement).style.borderColor = color
                ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLDivElement).style.borderColor = isActive ? color : 'var(--border, #333)'
                ;(e.currentTarget as HTMLDivElement).style.transform = 'none'
              }}
            >
              {isActive && (
                <div
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    background: color,
                    color: '#fff',
                    fontSize: 9,
                    padding: '2px 6px',
                    borderRadius: 8,
                    fontWeight: 600
                  }}
                >
                  ACTIVE
                </div>
              )}

              <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
              <div style={{ color: 'var(--text-primary, #fff)', fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
                {tpl.name}
              </div>
              <div style={{ color: 'var(--text-muted, #999)', fontSize: 11, lineHeight: 1.4 }}>
                {tpl.description}
              </div>
              <div style={{ marginTop: 8, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {tpl.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      background: `${color}22`,
                      color,
                      fontSize: 9,
                      padding: '2px 6px',
                      borderRadius: 4,
                      fontWeight: 500
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div style={{ color: 'var(--text-muted, #666)', fontSize: 10, marginTop: 8 }}>
                {tpl.frontLayers.length} layers
                {tpl.builtIn && ' · Built-in'}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
