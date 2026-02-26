import type { Deck } from '../types'

function escapeCSVField(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return '"' + value.replace(/"/g, '""') + '"'
  }
  return value
}

/**
 * Export deck cards as CSV. Columns: name, description, funFact, ...stat categories
 */
export function exportCSV(deck: Deck): string {
  const headers = ['name', 'description', 'funFact', ...deck.categories.map((c) => c.name)]
  const lines = [headers.map(escapeCSVField).join(',')]

  for (const card of deck.cards) {
    const row = [
      card.name,
      card.description ?? '',
      card.funFact ?? '',
      ...deck.categories.map((c) => String(card.stats[c.id] ?? ''))
    ]
    lines.push(row.map(escapeCSVField).join(','))
  }

  return lines.join('\n')
}

/**
 * Export full deck as pretty-printed JSON.
 */
export function exportJSON(deck: Deck): string {
  return JSON.stringify(deck, null, 2)
}
