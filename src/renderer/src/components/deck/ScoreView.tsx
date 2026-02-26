import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { useEditorStore } from '../../stores/editorStore'

/** Get a color between red→yellow→green based on 0-1 ratio */
function valueColor(ratio: number): string {
  if (ratio < 0.5) {
    const r = 220
    const g = Math.round(ratio * 2 * 200)
    return `rgb(${r},${g},60)`
  }
  const r = Math.round((1 - (ratio - 0.5) * 2) * 220)
  const g = 200
  return `rgb(${r},${g},60)`
}

export function ScoreView(): React.JSX.Element {
  const deck = useEditorStore((s) => s.currentDeck)
  const updateCard = useEditorStore((s) => s.updateCard)
  const cards = deck?.cards ?? []
  const categories = deck?.categories ?? []

  const [cardOrder, setCardOrder] = useState<string[]>(() => cards.map((c) => c.id))
  const [currentIdx, setCurrentIdx] = useState(0)
  const [direction, setDirection] = useState<'left' | 'right' | null>(null)
  const [localStats, setLocalStats] = useState<Record<string, number>>({})
  const animRef = useRef<HTMLDivElement>(null)

  // Sync order when cards change
  useEffect(() => {
    setCardOrder((prev) => {
      const currentIds = new Set(cards.map((c) => c.id))
      const kept = prev.filter((id) => currentIds.has(id))
      const newIds = cards.map((c) => c.id).filter((id) => !new Set(kept).has(id))
      return [...kept, ...newIds]
    })
  }, [cards.length])

  const currentCard = useMemo(() => {
    const id = cardOrder[currentIdx]
    return cards.find((c) => c.id === id) ?? null
  }, [cards, cardOrder, currentIdx])

  // Load stats when card changes
  useEffect(() => {
    if (currentCard) {
      setLocalStats({ ...currentCard.stats })
    }
  }, [currentCard?.id])

  const saveCurrentStats = useCallback(() => {
    if (currentCard) {
      updateCard(currentCard.id, { stats: { ...localStats } })
    }
  }, [currentCard, localStats, updateCard])

  const navigate = useCallback(
    (dir: 'left' | 'right') => {
      saveCurrentStats()
      setDirection(dir)
      setTimeout(() => {
        setCurrentIdx((prev) => {
          if (dir === 'right') return Math.min(prev + 1, cardOrder.length - 1)
          return Math.max(prev - 1, 0)
        })
        setDirection(null)
      }, 200)
    },
    [saveCurrentStats, cardOrder.length]
  )

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent): void => {
      if (e.key === 'ArrowLeft') navigate('left')
      else if (e.key === 'ArrowRight') navigate('right')
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [navigate])

  const scoredCount = useMemo(() => {
    return cards.filter((c) => categories.length > 0 && categories.every((cat) => c.stats[cat.id] !== undefined)).length
  }, [cards, categories])

  const progressPct = cards.length > 0 ? Math.round((scoredCount / cards.length) * 100) : 0

  // Stats summary across all cards
  const statsSummary = useMemo(() => {
    const summary: Record<string, { min: number; max: number; avg: number; count: number }> = {}
    for (const cat of categories) {
      const vals = cards.map((c) => c.stats[cat.id]).filter((v) => v !== undefined)
      if (vals.length > 0) {
        summary[cat.id] = {
          min: Math.min(...vals),
          max: Math.max(...vals),
          avg: vals.reduce((a, b) => a + b, 0) / vals.length,
          count: vals.length
        }
      }
    }
    return summary
  }, [cards, categories])

  const handleAutoFill = useCallback(() => {
    if (!deck) return
    for (const card of cards) {
      const hasAllStats = categories.every((cat) => card.stats[cat.id] !== undefined)
      if (!hasAllStats) {
        const newStats = { ...card.stats }
        for (const cat of categories) {
          if (newStats[cat.id] === undefined) {
            newStats[cat.id] = Math.round(cat.min + Math.random() * (cat.max - cat.min))
          }
        }
        updateCard(card.id, { stats: newStats })
      }
    }
    // Also update local stats for current card
    if (currentCard) {
      const newLocal = { ...localStats }
      for (const cat of categories) {
        if (newLocal[cat.id] === undefined) {
          newLocal[cat.id] = Math.round(cat.min + Math.random() * (cat.max - cat.min))
        }
      }
      setLocalStats(newLocal)
    }
  }, [deck, cards, categories, updateCard, currentCard, localStats])

  const handleShuffle = useCallback(() => {
    const shuffled = [...cardOrder]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    setCardOrder(shuffled)
    setCurrentIdx(0)
  }, [cardOrder])

  if (!deck || cards.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎯</div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>No cards to score</div>
          <div style={{ fontSize: 13, marginTop: 4 }}>Add cards in the Data view first, then come back to score them.</div>
        </div>
      </div>
    )
  }

  if (categories.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📊</div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>No categories defined</div>
          <div style={{ fontSize: 13, marginTop: 4 }}>Add stat categories in the Data view first.</div>
        </div>
      </div>
    )
  }

  const isScored = currentCard
    ? categories.every((cat) => currentCard.stats[cat.id] !== undefined)
    : false

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 20, overflow: 'auto' }}>
      {/* Progress bar */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
          <span>{scoredCount} of {cards.length} cards scored</span>
          <span>{progressPct}%</span>
        </div>
        <div style={{ height: 6, borderRadius: 3, background: 'var(--bg-tertiary)', overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${progressPct}%`,
              background: progressPct === 100 ? '#4caf50' : 'var(--accent)',
              borderRadius: 3,
              transition: 'width 0.3s ease'
            }}
          />
        </div>
      </div>

      {/* Action buttons row */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, justifyContent: 'center' }}>
        <button className="btn btn-sm btn-ghost" onClick={handleShuffle}>🔀 Shuffle</button>
        <button className="btn btn-sm btn-ghost" onClick={handleAutoFill}>🎲 Auto-fill remaining</button>
      </div>

      {/* Main card area */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, flex: 1, minHeight: 0 }}>
        {/* Previous button */}
        <button
          className="btn btn-ghost"
          onClick={() => navigate('left')}
          disabled={currentIdx === 0}
          style={{ fontSize: 32, padding: '16px 20px', borderRadius: 12, opacity: currentIdx === 0 ? 0.3 : 1 }}
        >
          ←
        </button>

        {/* Card */}
        <div
          ref={animRef}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            maxWidth: 420,
            width: '100%',
            transition: 'transform 0.2s ease, opacity 0.2s ease',
            transform: direction === 'left' ? 'translateX(40px)' : direction === 'right' ? 'translateX(-40px)' : 'translateX(0)',
            opacity: direction ? 0.5 : 1
          }}
        >
          {/* Card preview */}
          <div
            style={{
              width: '100%',
              aspectRatio: '62 / 80',
              maxHeight: 280,
              borderRadius: 12,
              background: isScored ? 'linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary))' : 'var(--bg-tertiary)',
              border: `2px solid ${isScored ? 'var(--accent)' : 'var(--border)'}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12,
              overflow: 'hidden',
              transition: 'border-color 0.3s ease'
            }}
          >
            {currentCard?.image ? (
              <img
                src={currentCard.image}
                alt={currentCard.name}
                style={{ width: '100%', height: '70%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{ fontSize: 64, opacity: 0.3 }}>🃏</div>
            )}
            <div style={{ padding: '8px 16px', textAlign: 'center', width: '100%' }}>
              <div style={{ fontSize: 18, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {currentCard?.name ?? 'Unknown'}
              </div>
            </div>
          </div>

          {/* Card counter */}
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
            Card {currentIdx + 1} of {cardOrder.length}
            {isScored && <span style={{ marginLeft: 8, color: '#4caf50' }}>✓ Scored</span>}
          </div>

          {/* Stat sliders */}
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {categories.map((cat) => {
              const val = localStats[cat.id] ?? cat.min
              const ratio = cat.max > cat.min ? (val - cat.min) / (cat.max - cat.min) : 0
              const color = valueColor(ratio)
              return (
                <div key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 90, fontSize: 12, fontWeight: 600, textAlign: 'right', flexShrink: 0 }}>
                    {cat.name}
                    {cat.unit && <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}> ({cat.unit})</span>}
                  </div>
                  <input
                    type="range"
                    min={cat.min}
                    max={cat.max}
                    value={val}
                    onChange={(e) =>
                      setLocalStats((prev) => ({ ...prev, [cat.id]: Number(e.target.value) }))
                    }
                    style={{
                      flex: 1,
                      height: 28,
                      accentColor: color,
                      cursor: 'pointer'
                    }}
                  />
                  <input
                    type="number"
                    min={cat.min}
                    max={cat.max}
                    value={val}
                    onChange={(e) => {
                      const n = Number(e.target.value)
                      if (!isNaN(n)) {
                        setLocalStats((prev) => ({
                          ...prev,
                          [cat.id]: Math.max(cat.min, Math.min(cat.max, n))
                        }))
                      }
                    }}
                    onBlur={saveCurrentStats}
                    style={{
                      width: 56,
                      textAlign: 'center',
                      fontSize: 13,
                      fontWeight: 700,
                      color,
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border)',
                      borderRadius: 4,
                      padding: '4px 2px'
                    }}
                  />
                </div>
              )
            })}
          </div>
        </div>

        {/* Next button */}
        <button
          className="btn btn-ghost"
          onClick={() => navigate('right')}
          disabled={currentIdx === cardOrder.length - 1}
          style={{ fontSize: 32, padding: '16px 20px', borderRadius: 12, opacity: currentIdx === cardOrder.length - 1 ? 0.3 : 1 }}
        >
          →
        </button>
      </div>

      {/* Stats summary bar chart */}
      {Object.keys(statsSummary).length > 0 && (
        <div style={{ marginTop: 20, padding: 12, background: 'var(--bg-secondary)', borderRadius: 8, border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600 }}>
            📊 Running Balance (across {scoredCount} scored cards)
          </div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {categories.map((cat) => {
              const s = statsSummary[cat.id]
              if (!s) return null
              const range = cat.max - cat.min || 1
              const minPct = ((s.min - cat.min) / range) * 100
              const maxPct = ((s.max - cat.min) / range) * 100
              const avgPct = ((s.avg - cat.min) / range) * 100
              return (
                <div key={cat.id} style={{ flex: '1 1 120px', minWidth: 100 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, marginBottom: 3 }}>{cat.name}</div>
                  <div style={{ height: 14, background: 'var(--bg-tertiary)', borderRadius: 3, position: 'relative', overflow: 'hidden' }}>
                    {/* Range bar */}
                    <div
                      style={{
                        position: 'absolute',
                        left: `${minPct}%`,
                        width: `${Math.max(maxPct - minPct, 2)}%`,
                        height: '100%',
                        background: 'var(--accent)',
                        opacity: 0.3,
                        borderRadius: 3
                      }}
                    />
                    {/* Avg marker */}
                    <div
                      style={{
                        position: 'absolute',
                        left: `${avgPct}%`,
                        top: 0,
                        width: 2,
                        height: '100%',
                        background: 'var(--accent)',
                        borderRadius: 1
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>
                    <span>min {Math.round(s.min)}</span>
                    <span>avg {Math.round(s.avg)}</span>
                    <span>max {Math.round(s.max)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
