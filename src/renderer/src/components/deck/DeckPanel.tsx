import React, { useState, useCallback, type DragEvent as ReactDragEvent } from "react"
import { useEditorStore } from '../../stores/editorStore'

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']

function isImageFile(file: File): boolean {
  if (ALLOWED_IMAGE_TYPES.includes(file.type)) return true
  const ext = '.' + file.name.split('.').pop()?.toLowerCase()
  return ALLOWED_EXTENSIONS.includes(ext)
}

export function DeckPanel(): React.JSX.Element {
  const deck = useEditorStore((s) => s.currentDeck)
  const selectedCardId = useEditorStore((s) => s.selectedCardId)
  const selectCard = useEditorStore((s) => s.selectCard)
  const addCard = useEditorStore((s) => s.addCard)
  const removeCard = useEditorStore((s) => s.removeCard)
  const duplicateCard = useEditorStore((s) => s.duplicateCard)
  const updateCard = useEditorStore((s) => s.updateCard)

  const [dragOverCardId, setDragOverCardId] = useState<string | null>(null)

  const handleCardDragOver = useCallback((e: ReactDragEvent<HTMLDivElement>, cardId: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer.types.includes('Files')) {
      e.dataTransfer.dropEffect = 'copy'
      setDragOverCardId(cardId)
    }
  }, [])

  const handleCardDragLeave = useCallback((e: ReactDragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOverCardId(null)
  }, [])

  const handleCardDrop = useCallback(async (e: ReactDragEvent<HTMLDivElement>, cardId: string) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOverCardId(null)

    const file = Array.from(e.dataTransfer.files).find(isImageFile)
    if (!file) return

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Array.from(new Uint8Array(arrayBuffer))
    const result = await window.api.image.importBuffer({ buffer, filename: file.name })
    if (result.success && result.data) {
      updateCard(cardId, { image: result.data.filePath })
    }
  }, [updateCard])

  if (!deck) return <div className="panel" />

  return (
    <div className="panel">
      <div className="panel-header">
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          Cards <span className="badge">{deck.cards.length}</span>
        </span>
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
        {deck.cards.map((card, index) => (
          <div
            key={card.id}
            className={`card-item ${selectedCardId === card.id ? 'active' : ''}${dragOverCardId === card.id ? ' drop-zone-active' : ''}`}
            onClick={() => selectCard(card.id)}
            onDragOver={(e) => handleCardDragOver(e, card.id)}
            onDragLeave={handleCardDragLeave}
            onDrop={(e) => handleCardDrop(e, card.id)}
          >
            <div className="card-item-thumb" style={{ position: 'relative' }}>
              <span className="card-item-number">{index + 1}</span>
              {card.image ? (
                <img
                  src={`file://${card.image}`}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: 'var(--text-muted)' }}>
                  🃏
                </div>
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
