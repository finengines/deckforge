import React, { useMemo } from 'react'
import { useEditorStore } from '../../stores/editorStore'
import type { CardCategory } from '../../types'

interface RadarChartProps {
  categories: CardCategory[]
  stats: Record<string, number>
  size?: number
  color?: string
  fillOpacity?: number
}

function RadarChart({ categories, stats, size = 120, color = '#4a9eff', fillOpacity = 0.3 }: RadarChartProps): React.JSX.Element {
  const points = useMemo(() => {
    const center = size / 2
    const radius = size / 2 - 10
    const angleStep = (2 * Math.PI) / categories.length

    return categories.map((cat, i) => {
      const value = stats[cat.id] ?? cat.min
      const ratio = (value - cat.min) / (cat.max - cat.min)
      const angle = angleStep * i - Math.PI / 2
      const x = center + radius * ratio * Math.cos(angle)
      const y = center + radius * ratio * Math.sin(angle)
      return { x, y }
    })
  }, [categories, stats, size])

  const pathData = points.length > 0
    ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map((p) => `L ${p.x} ${p.y}`).join(' ') + ' Z'
    : ''

  // Background polygon (max values)
  const bgPoints = useMemo(() => {
    const center = size / 2
    const radius = size / 2 - 10
    const angleStep = (2 * Math.PI) / categories.length

    return categories.map((_cat, i) => {
      const angle = angleStep * i - Math.PI / 2
      const x = center + radius * Math.cos(angle)
      const y = center + radius * Math.sin(angle)
      return { x, y }
    })
  }, [categories, size])

  const bgPathData = bgPoints.length > 0
    ? `M ${bgPoints[0].x} ${bgPoints[0].y} ` + bgPoints.slice(1).map((p) => `L ${p.x} ${p.y}`).join(' ') + ' Z'
    : ''

  return (
    <svg width={size} height={size}>
      {/* Background */}
      <path d={bgPathData} fill="none" stroke="var(--border)" strokeWidth="1" />

      {/* Data */}
      <path d={pathData} fill={color} fillOpacity={fillOpacity} stroke={color} strokeWidth="2" />

      {/* Points */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill={color} />
      ))}
    </svg>
  )
}

export function BalanceAnalyzer(): React.JSX.Element {
  const deck = useEditorStore((s) => s.currentDeck)

  if (!deck || deck.cards.length === 0 || deck.categories.length === 0) {
    return (
      <div className="panel">
        <div className="panel-header">Balance Analyzer</div>
        <div className="panel-content">
          <div style={{ color: 'var(--text-muted)', fontSize: 12, padding: 16, textAlign: 'center' }}>
            Add cards and categories to analyze balance
          </div>
        </div>
      </div>
    )
  }

  // Calculate total stat sum for each card
  const cardTotals = useMemo(() => {
    return deck.cards.map((card) => {
      const total = deck.categories.reduce((sum, cat) => {
        return sum + (card.stats[cat.id] ?? cat.min)
      }, 0)
      return { card, total }
    })
  }, [deck.cards, deck.categories])

  // Find outliers (top 3 strongest, bottom 3 weakest)
  const sorted = [...cardTotals].sort((a, b) => b.total - a.total)
  const strongest = sorted.slice(0, 3)
  const weakest = sorted.slice(-3).reverse()

  // Calculate balance score (0-100)
  const totals = cardTotals.map((c) => c.total)
  const mean = totals.reduce((a, b) => a + b, 0) / totals.length
  const variance = totals.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / totals.length
  const stdDev = Math.sqrt(variance)
  const coefficientOfVariation = stdDev / mean
  const balanceScore = Math.max(0, Math.min(100, Math.round((1 - coefficientOfVariation) * 100)))

  // Histogram data
  const histogram = useMemo(() => {
    const min = Math.min(...totals)
    const max = Math.max(...totals)
    const binCount = 10
    const binSize = (max - min) / binCount
    const bins = Array(binCount).fill(0)

    for (const total of totals) {
      const binIndex = Math.min(Math.floor((total - min) / binSize), binCount - 1)
      bins[binIndex]++
    }

    return { bins, min, max, binSize }
  }, [totals])

  const maxBinCount = Math.max(...histogram.bins)

  return (
    <div className="panel">
      <div className="panel-header">Balance Analyzer</div>
      <div className="panel-content" style={{ padding: 12 }}>
        {/* Balance Score */}
        <div style={{
          background: 'var(--bg-secondary)',
          padding: 12,
          borderRadius: 6,
          marginBottom: 12
        }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
            Balance Score: {balanceScore}/100
          </div>
          <div style={{
            width: '100%',
            height: 8,
            background: 'var(--bg-tertiary)',
            borderRadius: 4,
            overflow: 'hidden'
          }}>
            <div
              style={{
                width: `${balanceScore}%`,
                height: '100%',
                background: balanceScore >= 70 ? '#22c55e' : balanceScore >= 40 ? '#f59e0b' : '#ef4444',
                transition: 'width 0.3s'
              }}
            />
          </div>
          <div style={{ fontSize: 11, marginTop: 6, opacity: 0.7 }}>
            {balanceScore >= 70 && 'Well balanced deck!'}
            {balanceScore >= 40 && balanceScore < 70 && 'Moderate balance - some cards are dominant'}
            {balanceScore < 40 && 'Unbalanced - consider adjusting stats'}
          </div>
        </div>

        {/* Strongest Cards */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>💪 Strongest Cards</div>
          {strongest.map(({ card, total }) => (
            <div
              key={card.id}
              style={{
                padding: 6,
                background: 'var(--bg-secondary)',
                borderRadius: 4,
                marginBottom: 4,
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 11
              }}
            >
              <span>{card.name}</span>
              <span style={{ fontWeight: 600, color: '#22c55e' }}>{total}</span>
            </div>
          ))}
        </div>

        {/* Weakest Cards */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>🤏 Weakest Cards</div>
          {weakest.map(({ card, total }) => (
            <div
              key={card.id}
              style={{
                padding: 6,
                background: 'var(--bg-secondary)',
                borderRadius: 4,
                marginBottom: 4,
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 11
              }}
            >
              <span>{card.name}</span>
              <span style={{ fontWeight: 600, color: '#ef4444' }}>{total}</span>
            </div>
          ))}
        </div>

        {/* Histogram */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>📊 Distribution</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 60 }}>
            {histogram.bins.map((count, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: `${(count / maxBinCount) * 100}%`,
                  background: 'var(--accent)',
                  borderRadius: '2px 2px 0 0',
                  minHeight: count > 0 ? 4 : 0,
                  transition: 'height 0.3s'
                }}
                title={`${Math.round(histogram.min + i * histogram.binSize)} - ${Math.round(histogram.min + (i + 1) * histogram.binSize)}: ${count} cards`}
              />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, opacity: 0.5, marginTop: 4 }}>
            <span>{Math.round(histogram.min)}</span>
            <span>{Math.round(histogram.max)}</span>
          </div>
        </div>

        {/* Radar Charts - Top 5 Cards */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>🎯 Top 5 Card Profiles</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 8 }}>
            {strongest.slice(0, 5).map(({ card }) => (
              <div key={card.id} style={{ textAlign: 'center' }}>
                <RadarChart
                  categories={deck.categories}
                  stats={card.stats}
                  size={100}
                  color="#4a9eff"
                  fillOpacity={0.3}
                />
                <div style={{ fontSize: 10, marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {card.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
