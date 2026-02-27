import React, { useState } from 'react'
import { useEditorStore } from '../../stores/editorStore'
import type { CardData, CardCategory } from '../../types'

interface SimulationResult {
  cardId: string
  wins: number
  losses: number
  winRate: number
}

interface CategoryStats {
  categoryId: string
  categoryName: string
  decisiveCount: number
}

function simulateGame(
  cards: CardData[],
  categories: CardCategory[],
  rounds: number
): { cardResults: SimulationResult[]; categoryStats: CategoryStats[] } {
  const cardWins = new Map<string, number>()
  const categoryWins = new Map<string, number>()

  // Initialize
  for (const card of cards) {
    cardWins.set(card.id, 0)
  }
  for (const cat of categories) {
    categoryWins.set(cat.id, 0)
  }

  // Run simulations
  for (let i = 0; i < rounds; i++) {
    // Pick two random cards
    const idx1 = Math.floor(Math.random() * cards.length)
    let idx2 = Math.floor(Math.random() * cards.length)
    while (idx2 === idx1 && cards.length > 1) {
      idx2 = Math.floor(Math.random() * cards.length)
    }
    const card1 = cards[idx1]
    const card2 = cards[idx2]

    // Pick a random category
    const cat = categories[Math.floor(Math.random() * categories.length)]
    const val1 = card1.stats[cat.id] ?? cat.min
    const val2 = card2.stats[cat.id] ?? cat.min

    // Determine winner
    let winner: CardData | null = null
    if (cat.higherIsBetter) {
      winner = val1 > val2 ? card1 : val2 > val1 ? card2 : null
    } else {
      winner = val1 < val2 ? card1 : val2 < val1 ? card2 : null
    }

    if (winner) {
      cardWins.set(winner.id, (cardWins.get(winner.id) ?? 0) + 1)
      categoryWins.set(cat.id, (categoryWins.get(cat.id) ?? 0) + 1)
    }
  }

  const cardResults: SimulationResult[] = cards.map((card) => {
    const wins = cardWins.get(card.id) ?? 0
    const losses = rounds - wins
    return {
      cardId: card.id,
      wins,
      losses,
      winRate: rounds > 0 ? (wins / rounds) * 100 : 0
    }
  })

  const categoryStats: CategoryStats[] = categories.map((cat) => ({
    categoryId: cat.id,
    categoryName: cat.name,
    decisiveCount: categoryWins.get(cat.id) ?? 0
  }))

  return { cardResults, categoryStats }
}

export function GameSimulator(): React.JSX.Element {
  const deck = useEditorStore((s) => s.currentDeck)
  const [simulating, setSimulating] = useState(false)
  const [simRounds, setSimRounds] = useState(1000)
  const [results, setResults] = useState<{
    cardResults: SimulationResult[]
    categoryStats: CategoryStats[]
  } | null>(null)

  const handleRunSimulation = (): void => {
    if (!deck || deck.cards.length < 2 || deck.categories.length === 0) return
    setSimulating(true)
    // Use setTimeout to not block UI
    setTimeout(() => {
      const simResults = simulateGame(deck.cards, deck.categories, simRounds)
      setResults(simResults)
      setSimulating(false)
    }, 100)
  }

  if (!deck || deck.cards.length < 2 || deck.categories.length === 0) {
    return (
      <div className="panel">
        <div className="panel-header">🎮 Game Simulator</div>
        <div className="panel-content">
          <div style={{ color: 'var(--text-muted)', fontSize: 12, padding: 16, textAlign: 'center' }}>
            Need at least 2 cards and 1 category to simulate
          </div>
        </div>
      </div>
    )
  }

  const sortedCardResults = results
    ? [...results.cardResults].sort((a, b) => b.winRate - a.winRate)
    : []
  const sortedCategoryStats = results
    ? [...results.categoryStats].sort((a, b) => b.decisiveCount - a.decisiveCount)
    : []

  return (
    <div className="panel">
      <div className="panel-header">🎮 Game Simulator</div>
      <div className="panel-content" style={{ padding: 12 }}>
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: 6,
          padding: 12,
          marginBottom: 12
        }}>
          <div style={{ fontSize: 12, marginBottom: 8 }}>
            Simulates {simRounds.toLocaleString()} rounds of Top Trumps gameplay to analyze card balance
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              type="number"
              className="input"
              value={simRounds}
              onChange={(e) => setSimRounds(Math.max(100, Math.min(100000, parseInt(e.target.value) || 1000)))}
              min="100"
              max="100000"
              step="100"
              style={{ width: 100, fontSize: 12 }}
            />
            <button
              className="btn btn-sm btn-primary"
              onClick={handleRunSimulation}
              disabled={simulating}
              style={{ flex: 1 }}
            >
              {simulating ? '⏳ Running...' : '▶️ Run Simulation'}
            </button>
          </div>
        </div>

        {results && (
          <>
            {/* Card Win Rates */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>🏆 Win Rates</div>
              <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                {sortedCardResults.map((result, i) => {
                  const card = deck.cards.find((c) => c.id === result.cardId)
                  if (!card) return null
                  const barColor = i === 0 ? '#22c55e' : i === sortedCardResults.length - 1 ? '#ef4444' : '#4a9eff'
                  return (
                    <div
                      key={result.cardId}
                      style={{
                        marginBottom: 4,
                        padding: 6,
                        background: 'var(--bg-secondary)',
                        borderRadius: 4,
                        fontSize: 11
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span>{card.name}</span>
                        <span style={{ fontWeight: 600, color: barColor }}>
                          {result.winRate.toFixed(1)}%
                        </span>
                      </div>
                      <div style={{
                        width: '100%',
                        height: 4,
                        background: 'var(--bg-tertiary)',
                        borderRadius: 2,
                        overflow: 'hidden'
                      }}>
                        <div
                          style={{
                            width: `${result.winRate}%`,
                            height: '100%',
                            background: barColor,
                            transition: 'width 0.3s'
                          }}
                        />
                      </div>
                      <div style={{ fontSize: 9, opacity: 0.6, marginTop: 2 }}>
                        {result.wins} wins / {result.losses} losses
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Most Decisive Categories */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>📊 Most Decisive Categories</div>
              {sortedCategoryStats.map((stat) => {
                const percentage = (stat.decisiveCount / simRounds) * 100
                return (
                  <div
                    key={stat.categoryId}
                    style={{
                      marginBottom: 4,
                      padding: 6,
                      background: 'var(--bg-secondary)',
                      borderRadius: 4,
                      fontSize: 11
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>{stat.categoryName}</span>
                      <span style={{ fontWeight: 600 }}>
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div style={{
                      width: '100%',
                      height: 4,
                      background: 'var(--bg-tertiary)',
                      borderRadius: 2,
                      overflow: 'hidden',
                      marginTop: 4
                    }}>
                      <div
                        style={{
                          width: `${percentage}%`,
                          height: '100%',
                          background: 'var(--accent)',
                          transition: 'width 0.3s'
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Insights */}
            <div style={{
              marginTop: 12,
              padding: 10,
              background: 'var(--bg-secondary)',
              borderRadius: 6,
              fontSize: 11,
              opacity: 0.8
            }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>💡 Insights:</div>
              {sortedCardResults[0] && (
                <div>
                  • <strong>{deck.cards.find((c) => c.id === sortedCardResults[0].cardId)?.name}</strong> is the strongest card
                </div>
              )}
              {sortedCardResults[sortedCardResults.length - 1] && (
                <div>
                  • <strong>{deck.cards.find((c) => c.id === sortedCardResults[sortedCardResults.length - 1].cardId)?.name}</strong> is the weakest card
                </div>
              )}
              {sortedCategoryStats[0] && (
                <div>
                  • <strong>{sortedCategoryStats[0].categoryName}</strong> is the most important stat
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
