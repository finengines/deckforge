import { useEffect, useRef, useCallback, useState } from 'react'
import { useEditorStore } from '../stores/editorStore'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export function useDeckPersistence(): { saveStatus: SaveStatus; saveDeck: () => Promise<void>; loadDeck: (id: string) => Promise<void> } {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const currentDeck = useEditorStore((s) => s.currentDeck)
  const loadDeckAction = useEditorStore((s) => s.loadDeck)

  const saveDeck = useCallback(async () => {
    const deck = useEditorStore.getState().currentDeck
    if (!deck) return

    try {
      setSaveStatus('saving')
      const result = await window.api.deck.save(deck)
      if (result.success) {
        setSaveStatus('saved')
        setTimeout(() => setSaveStatus('idle'), 2000)
      } else {
        console.error('Save failed:', result.error)
        setSaveStatus('error')
      }
    } catch (err) {
      console.error('Save error:', err)
      setSaveStatus('error')
    }
  }, [])

  const loadDeck = useCallback(async (id: string) => {
    try {
      const result = await window.api.deck.load(id)
      if (result.success && result.data) {
        loadDeckAction(result.data)
      }
    } catch (err) {
      console.error('Load error:', err)
    }
  }, [loadDeckAction])

  // Auto-save with debounce
  useEffect(() => {
    if (!currentDeck) return

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      saveDeck()
    }, 2000) // Save 2s after last change

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [currentDeck, saveDeck])

  return { saveStatus, saveDeck, loadDeck }
}
