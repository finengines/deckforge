import type { Deck } from '../types'

/**
 * .deckforge file format — JSON with base64-encoded images embedded.
 */

export interface DeckForgeFile {
  version: 1
  deck: Deck
  /** base64-encoded images keyed by original path/id */
  images: Record<string, string>
}

/**
 * Serialize a deck to .deckforge format (JSON string with embedded images).
 * Image embedding is best-effort: if images are data URLs they're kept inline;
 * file paths would need IPC to read — handled by the main process save handler.
 */
export function serializeDeck(deck: Deck): string {
  const images: Record<string, string> = {}

  // Collect data-URL images from cards
  for (const card of deck.cards) {
    if (card.image && card.image.startsWith('data:')) {
      images[card.id] = card.image
    }
  }

  const file: DeckForgeFile = {
    version: 1,
    deck,
    images
  }

  return JSON.stringify(file)
}

/**
 * Deserialize a .deckforge file back to a Deck.
 */
export function deserializeDeck(json: string): Deck {
  const file: DeckForgeFile = JSON.parse(json)

  if (file.version !== 1) {
    throw new Error(`Unsupported .deckforge file version: ${file.version}`)
  }

  // Restore embedded images to cards
  const deck = file.deck
  if (file.images) {
    for (const card of deck.cards) {
      if (file.images[card.id]) {
        card.image = file.images[card.id]
      }
    }
  }

  return deck
}
