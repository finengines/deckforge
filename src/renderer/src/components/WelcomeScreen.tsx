import React from "react"
import { useEffect, useState } from 'react'
import { useEditorStore } from '../stores/editorStore'
import { createSampleDeck } from '../lib/sampleDeck'

interface DeckSummary {
  id: string
  name: string
  description: string
  cardCount: number
  createdAt: string
  updatedAt: string
}

export function WelcomeScreen(): React.JSX.Element {
  const createDeck = useEditorStore((s) => s.createDeck)
  const loadDeck = useEditorStore((s) => s.loadDeck)
  const [recentDecks, setRecentDecks] = useState<DeckSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRecentDecks()
  }, [])

  const loadRecentDecks = async (): Promise<void> => {
    try {
      if (window.api?.deck) {
        const result = await window.api.deck.list()
        if (result.success && result.data) {
          setRecentDecks(result.data)
        }
      }
    } catch {
      // No API available (dev/test), that's fine
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDeck = async (id: string): Promise<void> => {
    try {
      const result = await window.api.deck.load(id)
      if (result.success && result.data) {
        loadDeck(result.data)
      }
    } catch (err) {
      console.error('Failed to load deck:', err)
    }
  }

  const handleDeleteDeck = async (id: string, name: string): Promise<void> => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    try {
      await window.api.deck.delete(id)
      setRecentDecks((decks) => decks.filter((d) => d.id !== id))
    } catch (err) {
      console.error('Failed to delete deck:', err)
    }
  }

  const handleNewDeck = (): void => {
    createDeck('My Card Deck', 'A custom card deck')
  }

  const formatDate = (iso: string): string => {
    try {
      return new Date(iso).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    } catch {
      return ''
    }
  }

  return (
    <div className="welcome">
      <div className="welcome-hero">🃏</div>
      <h1>DeckForge</h1>
      <p>Design, create, and print custom card decks</p>

      <div className="welcome-actions">
        <button className="btn btn-primary" onClick={handleNewDeck}>
          ✨ New Deck
        </button>
        <button
          className="btn"
          onClick={() => loadDeck(createSampleDeck())}
        >
          🎮 Try Sample Deck
        </button>
      </div>
      <div className="welcome-shortcut">⌘N to create a new deck</div>

      {!loading && recentDecks.length > 0 && (
        <div style={{ marginTop: 24, width: '100%', maxWidth: 500 }}>
          <h3 style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Recent Decks
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {recentDecks.map((deck) => (
              <div
                key={deck.id}
                className="card-item"
                onClick={() => handleOpenDeck(deck.id)}
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  padding: '10px 14px'
                }}
              >
                <div style={{ fontSize: 20 }}>🃏</div>
                <div className="card-item-info">
                  <div className="card-item-name" style={{ fontSize: 14 }}>
                    {deck.name}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {deck.cardCount} cards • {formatDate(deck.updatedAt)}
                  </div>
                </div>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteDeck(deck.id, deck.name)
                  }}
                  style={{ opacity: 0.4 }}
                >
                  🗑
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
