import React from "react"
import { useEditorStore } from '../../stores/editorStore'
// import type { CardCategory } from '../../types'

export function DataView(): React.JSX.Element {
  const deck = useEditorStore((s) => s.currentDeck)
  const updateCard = useEditorStore((s) => s.updateCard)
  const addCard = useEditorStore((s) => s.addCard)
  const removeCard = useEditorStore((s) => s.removeCard)
  const addCategory = useEditorStore((s) => s.addCategory)
  const removeCategory = useEditorStore((s) => s.removeCategory)
  const updateCategory = useEditorStore((s) => s.updateCategory)

  if (!deck) return <div />

  const handleAddCategory = (): void => {
    addCategory({
      name: 'New Stat',
      min: 0,
      max: 100,
      higherIsBetter: true
    })
  }

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600 }}>📊 Card Data</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-sm" onClick={handleAddCategory}>
            + Add Stat Category
          </button>
          <button className="btn btn-sm btn-primary" onClick={() => addCard()}>
            + Add Card
          </button>
        </div>
      </div>

      {/* Categories config */}
      {deck.categories.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>
            Stat Categories
          </h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {deck.categories.map((cat) => (
              <div
                key={cat.id}
                style={{
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  padding: '6px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 12
                }}
              >
                <input
                  className="input"
                  value={cat.name}
                  onChange={(e) => updateCategory(cat.id, { name: e.target.value })}
                  style={{ width: 100 }}
                />
                <input
                  className="input"
                  type="number"
                  value={cat.min}
                  onChange={(e) => updateCategory(cat.id, { min: parseInt(e.target.value) || 0 })}
                  style={{ width: 50 }}
                  placeholder="Min"
                />
                <span style={{ color: 'var(--text-muted)' }}>–</span>
                <input
                  className="input"
                  type="number"
                  value={cat.max}
                  onChange={(e) => updateCategory(cat.id, { max: parseInt(e.target.value) || 100 })}
                  style={{ width: 50 }}
                  placeholder="Max"
                />
                <input
                  className="input"
                  value={cat.unit ?? ''}
                  onChange={(e) => updateCategory(cat.id, { unit: e.target.value })}
                  style={{ width: 50 }}
                  placeholder="Unit"
                />
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => removeCategory(cat.id)}
                  style={{ padding: 2 }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cards table */}
      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: 12,
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius)',
            overflow: 'hidden'
          }}
        >
          <thead>
            <tr>
              <th style={thStyle}>#</th>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Description</th>
              <th style={thStyle}>Fun Fact</th>
              {deck.categories.map((cat) => (
                <th key={cat.id} style={thStyle}>
                  {cat.name}
                  {cat.unit && <span style={{ color: 'var(--text-muted)' }}> ({cat.unit})</span>}
                </th>
              ))}
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {deck.cards.map((card, i) => (
              <tr key={card.id} style={{ borderTop: '1px solid var(--border)' }}>
                <td style={tdStyle}>{i + 1}</td>
                <td style={tdStyle}>
                  <input
                    className="input"
                    value={card.name}
                    onChange={(e) => updateCard(card.id, { name: e.target.value })}
                  />
                </td>
                <td style={tdStyle}>
                  <input
                    className="input"
                    value={card.description ?? ''}
                    onChange={(e) => updateCard(card.id, { description: e.target.value })}
                  />
                </td>
                <td style={tdStyle}>
                  <input
                    className="input"
                    value={card.funFact ?? ''}
                    onChange={(e) => updateCard(card.id, { funFact: e.target.value })}
                  />
                </td>
                {deck.categories.map((cat) => (
                  <td key={cat.id} style={tdStyle}>
                    <input
                      className="input"
                      type="number"
                      min={cat.min}
                      max={cat.max}
                      value={card.stats[cat.id] ?? ''}
                      onChange={(e) =>
                        updateCard(card.id, {
                          stats: { ...card.stats, [cat.id]: parseInt(e.target.value) || 0 }
                        })
                      }
                      style={{ width: 70 }}
                    />
                  </td>
                ))}
                <td style={tdStyle}>
                  <button className="btn btn-ghost btn-sm" onClick={() => removeCard(card.id)}>
                    🗑
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {deck.cards.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: 40,
            color: 'var(--text-muted)'
          }}
        >
          No cards yet. Click "+ Add Card" to get started.
        </div>
      )}
    </div>
  )
}

const thStyle: React.CSSProperties = {
  padding: '8px 10px',
  textAlign: 'left',
  fontWeight: 600,
  fontSize: 11,
  color: 'var(--text-secondary)',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  background: 'var(--bg-tertiary)'
}

const tdStyle: React.CSSProperties = {
  padding: '4px 8px',
  verticalAlign: 'middle'
}
