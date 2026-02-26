import React from "react"
import { useEditorStore } from '../../stores/editorStore'

export function DeckPanel(): React.JSX.Element {
  const deck = useEditorStore((s) => s.currentDeck)
  const selectedCardId = useEditorStore((s) => s.selectedCardId)
  const selectCard = useEditorStore((s) => s.selectCard)
  const addCard = useEditorStore((s) => s.addCard)
  const removeCard = useEditorStore((s) => s.removeCard)
  const duplicateCard = useEditorStore((s) => s.duplicateCard)

  if (!deck) return <div className="panel" />

  return (
    <div className="panel">
      <div className="panel-header">
        <span>Cards ({deck.cards.length})</span>
        <button className="btn btn-sm btn-ghost" onClick={() => addCard()}>
          +
        </button>
      </div>
      <div className="panel-content">
        {deck.cards.length === 0 && (
          <div style={{ color: 'var(--text-muted)', fontSize: 11, padding: 8, textAlign: 'center' }}>
            No cards yet.
            <br />
            <button className="btn btn-sm btn-primary" style={{ marginTop: 8 }} onClick={() => addCard()}>
              ✨ Add First Card
            </button>
          </div>
        )}
        {deck.cards.map((card) => (
          <div
            key={card.id}
            className={`card-item ${selectedCardId === card.id ? 'active' : ''}`}
            onClick={() => selectCard(card.id)}
          >
            <div className="card-item-thumb">
              {card.image && (
                <img
                  src={card.image}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              )}
            </div>
            <div className="card-item-info">
              <div className="card-item-name">{card.name}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                {Object.keys(card.stats).length} stats
              </div>
            </div>
            <div style={{ display: 'flex', gap: 2 }}>
              <button
                className="btn btn-ghost btn-sm"
                style={{ padding: 2, fontSize: 10 }}
                onClick={(e) => {
                  e.stopPropagation()
                  duplicateCard(card.id)
                }}
                title="Duplicate"
              >
                📋
              </button>
              <button
                className="btn btn-ghost btn-sm"
                style={{ padding: 2, fontSize: 10 }}
                onClick={(e) => {
                  e.stopPropagation()
                  removeCard(card.id)
                }}
                title="Delete"
              >
                🗑
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
