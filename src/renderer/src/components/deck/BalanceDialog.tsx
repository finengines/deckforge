import React, { useState, useCallback } from 'react'
import { useEditorStore } from '../../stores/editorStore'
import { useAIStore } from '../../stores/aiStore'
import { balanceDeckStats, type BalanceAdjustment } from '../../lib/ai'
import { Spinner } from '../Spinner'

export function BalanceDialog({ onClose }: { onClose: () => void }): React.JSX.Element {
  const deck = useEditorStore((s) => s.currentDeck)
  const updateCard = useEditorStore((s) => s.updateCard)
  const providers = useAIStore((s) => s.providers)
  const defaults = useAIStore((s) => s.defaults)

  const [loading, setLoading] = useState(false)
  const [adjustments, setAdjustments] = useState<BalanceAdjustment[] | null>(null)
  const [error, setError] = useState('')

  const handleAnalyze = useCallback(async () => {
    if (!deck) return
    const config = providers.find((p) => p.id === defaults.stats)
    if (!config) { setError('No stats provider configured'); return }
    if (deck.cards.length < 2) { setError('Need at least 2 cards to balance'); return }
    if (deck.categories.length === 0) { setError('No stat categories defined'); return }

    setLoading(true)
    setError('')
    try {
      const result = await balanceDeckStats(
        config,
        deck.cards.map((c) => ({ id: c.id, name: c.name, stats: c.stats })),
        deck.categories.map((c) => ({ id: c.id, name: c.name, min: c.min, max: c.max }))
      )
      setAdjustments(result)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [deck, providers, defaults])

  const handleApply = (): void => {
    if (!adjustments || !deck) return
    for (const adj of adjustments) {
      const card = deck.cards.find((c) => c.id === adj.cardId)
      if (card) {
        updateCard(adj.cardId, { stats: { ...card.stats, ...adj.adjustments } })
      }
    }
    onClose()
  }

  if (!deck) return <div />

  const getAdjustmentForCard = (cardId: string): Record<string, number> | undefined =>
    adjustments?.find((a) => a.cardId === cardId)?.adjustments

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }} onClick={(e) => { if (e.target === e.currentTarget && !loading) onClose() }}>
      <div style={{
        background: 'var(--bg-primary)', borderRadius: 'var(--radius)', padding: 24,
        width: 600, maxHeight: '80vh', overflow: 'auto'
      }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>⚖️ Balance Stats</h3>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
          AI analyzes all card stats and suggests adjustments so no single card dominates.
        </p>

        {!adjustments && !loading && (
          <button className="btn btn-primary" onClick={handleAnalyze} style={{ width: '100%', marginBottom: 12 }}>
            🔍 Analyze & Suggest
          </button>
        )}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, gap: 8 }}>
            <Spinner size={20} /> <span style={{ fontSize: 12 }}>Analyzing deck balance…</span>
          </div>
        )}

        {error && (
          <div style={{ padding: 8, background: '#2a1515', borderRadius: 4, fontSize: 12, color: '#ff6b6b', marginBottom: 12 }}>
            {error}
          </div>
        )}

        {adjustments && (
          <>
            {adjustments.length === 0 ? (
              <div style={{ padding: 16, textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
                ✅ Deck is already well-balanced! No changes suggested.
              </div>
            ) : (
              <div style={{ overflowX: 'auto', marginBottom: 16 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                  <thead>
                    <tr>
                      <th style={thStyle}>Card</th>
                      {deck.categories.map((cat) => (
                        <th key={cat.id} style={thStyle}>{cat.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {deck.cards.map((card) => {
                      const adj = getAdjustmentForCard(card.id)
                      return (
                        <tr key={card.id} style={{ borderTop: '1px solid var(--border)' }}>
                          <td style={tdStyle}>{card.name}</td>
                          {deck.categories.map((cat) => {
                            const current = card.stats[cat.id] ?? 0
                            const suggested = adj?.[cat.id]
                            const changed = suggested !== undefined && suggested !== current
                            return (
                              <td key={cat.id} style={{ ...tdStyle, background: changed ? 'rgba(255,180,0,0.1)' : undefined }}>
                                {changed ? (
                                  <span>
                                    <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)' }}>{current}</span>
                                    {' → '}
                                    <span style={{ fontWeight: 600, color: 'var(--accent)' }}>{suggested}</span>
                                  </span>
                                ) : (
                                  <span>{current}</span>
                                )}
                              </td>
                            )
                          })}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-sm" onClick={() => setAdjustments(null)}>Re-analyze</button>
              {adjustments.length > 0 && (
                <button className="btn btn-primary btn-sm" onClick={handleApply}>
                  ✅ Apply Changes
                </button>
              )}
            </div>
          </>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
          <button className="btn btn-sm" onClick={onClose} disabled={loading}>Close</button>
        </div>
      </div>
    </div>
  )
}

const thStyle: React.CSSProperties = {
  padding: '6px 8px', textAlign: 'left', fontWeight: 600, fontSize: 10,
  color: 'var(--text-secondary)', background: 'var(--bg-tertiary)', textTransform: 'uppercase'
}
const tdStyle: React.CSSProperties = { padding: '4px 8px', verticalAlign: 'middle' }
