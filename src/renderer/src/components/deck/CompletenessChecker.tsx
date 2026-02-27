import React from 'react'
import { useEditorStore } from '../../stores/editorStore'

interface CompletenessIssue {
  cardId: string
  cardName: string
  type: 'image' | 'stat' | 'description' | 'category-empty'
  severity: 'error' | 'warning'
  message: string
}

export const CompletenessChecker = React.memo(function CompletenessChecker(): React.JSX.Element {
  const deck = useEditorStore((s) => s.currentDeck)
  const selectCard = useEditorStore((s) => s.selectCard)
  const setView = useEditorStore((s) => s.setView)

  if (!deck) return <div className="panel" />

  const issues: CompletenessIssue[] = []

  // Check each card for completeness
  for (const card of deck.cards) {
    // Missing image
    if (!card.image || card.image.trim() === '') {
      issues.push({
        cardId: card.id,
        cardName: card.name,
        type: 'image',
        severity: 'warning',
        message: 'Missing card image'
      })
    }

    // Missing description
    if (!card.description || card.description.trim() === '') {
      issues.push({
        cardId: card.id,
        cardName: card.name,
        type: 'description',
        severity: 'warning',
        message: 'Missing description'
      })
    }

    // Missing stats for categories
    for (const category of deck.categories) {
      if (card.stats[category.id] === undefined || card.stats[category.id] === null) {
        issues.push({
          cardId: card.id,
          cardName: card.name,
          type: 'stat',
          severity: 'error',
          message: `Missing stat: ${category.name}`
        })
      }
    }
  }

  // Check for empty categories
  if (deck.categories.length === 0) {
    issues.push({
      cardId: '',
      cardName: 'Deck',
      type: 'category-empty',
      severity: 'error',
      message: 'No stat categories defined'
    })
  }

  const errorCount = issues.filter((i) => i.severity === 'error').length
  const warningCount = issues.filter((i) => i.severity === 'warning').length
  const totalCards = deck.cards.length
  const completeCards = deck.cards.filter((card) => {
    const hasImage = card.image && card.image.trim() !== ''
    const hasDescription = card.description && card.description.trim() !== ''
    const hasAllStats = deck.categories.every((cat) => card.stats[cat.id] !== undefined && card.stats[cat.id] !== null)
    return hasImage && hasDescription && hasAllStats
  }).length

  const completionPercent = totalCards > 0 ? Math.round((completeCards / totalCards) * 100) : 0

  return (
    <div className="panel">
      <div className="panel-header">Deck Health</div>
      <div className="panel-content">
        {/* Summary */}
        <div style={{
          background: 'var(--bg-secondary)',
          padding: 12,
          borderRadius: 6,
          marginBottom: 12
        }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
            Completion: {completionPercent}%
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
                width: `${completionPercent}%`,
                height: '100%',
                background: completionPercent === 100 ? '#22c55e' : completionPercent >= 50 ? '#f59e0b' : '#ef4444',
                transition: 'width 0.3s'
              }}
            />
          </div>
          <div style={{
            display: 'flex',
            gap: 12,
            marginTop: 8,
            fontSize: 12
          }}>
            <div>
              <span style={{ color: '#22c55e' }}>✓</span> {completeCards}/{totalCards} cards
            </div>
            {errorCount > 0 && (
              <div>
                <span style={{ color: '#ef4444' }}>●</span> {errorCount} errors
              </div>
            )}
            {warningCount > 0 && (
              <div>
                <span style={{ color: '#f59e0b' }}>●</span> {warningCount} warnings
              </div>
            )}
          </div>
        </div>

        {/* Issues list */}
        {issues.length > 0 ? (
          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            {issues.map((issue, i) => (
              <div
                key={i}
                style={{
                  padding: 8,
                  marginBottom: 4,
                  background: 'var(--bg-secondary)',
                  borderRadius: 4,
                  borderLeft: `3px solid ${issue.severity === 'error' ? '#ef4444' : '#f59e0b'}`,
                  cursor: issue.cardId ? 'pointer' : 'default',
                  fontSize: 12
                }}
                onClick={() => {
                  if (issue.cardId) {
                    selectCard(issue.cardId)
                    setView('data')
                  }
                }}
              >
                <div style={{ fontWeight: 500 }}>{issue.cardName}</div>
                <div style={{ opacity: 0.7, marginTop: 2 }}>{issue.message}</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: 24,
            color: '#22c55e'
          }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>✓</div>
            <div style={{ fontWeight: 600 }}>All Good!</div>
            <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
              Your deck is complete and ready to export
            </div>
          </div>
        )}
      </div>
    </div>
  )
})
