import { useEditorStore } from '../stores/editorStore'

export function WelcomeScreen(): JSX.Element {
  const createDeck = useEditorStore((s) => s.createDeck)

  const handleNewDeck = (): void => {
    createDeck('My Card Deck', 'A custom card deck')
  }

  return (
    <div className="welcome">
      <h1>🃏 DeckForge</h1>
      <p>Design, create, and print custom card decks</p>
      <div className="welcome-actions">
        <button className="btn btn-primary" onClick={handleNewDeck}>
          ✨ New Deck
        </button>
        <button className="btn">📂 Open Deck</button>
      </div>
    </div>
  )
}
