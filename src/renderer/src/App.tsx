import React from "react"
import { useEditorStore } from './stores/editorStore'
import { useDeckPersistence } from './hooks/useDeckPersistence'
import { Toolbar } from './components/editor/Toolbar'
import { Canvas } from './components/editor/Canvas'
import { ComponentEditor } from './components/editor/ComponentEditor'
// LayerPanel and PropertiesPanel are now used inside RightPanelTabs
import { DeckPanel } from './components/deck/DeckPanel'
import { DataView } from './components/deck/DataView'
import { ScoreView } from './components/deck/ScoreView'
import { ExportView } from './components/export/ExportView'
import { SettingsView } from './components/settings/SettingsView'
import { WelcomeScreen } from './components/WelcomeScreen'
import { ToastContainer } from './components/Toast'
import { KeyboardShortcuts } from './components/KeyboardShortcuts'
import { AboutDialog } from './components/AboutDialog'
import { StatusBar } from './components/StatusBar'
import { RightPanelTabs } from './components/editor/RightPanelTabs'
import { TutorialOverlay } from './components/TutorialOverlay'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import './assets/app.css'

function App(): React.JSX.Element {
  const view = useEditorStore((s) => s.view)
  const currentDeck = useEditorStore((s) => s.currentDeck)
  const { saveStatus, saveDeck, loadDeck } = useDeckPersistence()
  useKeyboardShortcuts()

  // Menu actions (native macOS menu)
  React.useEffect(() => {
    const api = (window as any).api
    if (!api?.on) return

    const unsubs: Array<() => void> = []

    unsubs.push(api.on('menu:save', () => saveDeck()))
    unsubs.push(api.on('menu:save-as', async () => {
      const deck = useEditorStore.getState().currentDeck
      if (!deck) return
      const json = JSON.stringify(deck, null, 2)
      await api.deckFile.save(json, `${deck.name || 'Untitled Deck'}.deckforge`)
    }))
    unsubs.push(api.on('menu:open-file', async () => {
      const result = await api.deckFile.open()
      if (result?.success && result.data) {
        try {
          const deck = JSON.parse(result.data)
          useEditorStore.getState().loadDeck(deck)
        } catch (err) {
          alert('Failed to open deck file: invalid JSON')
        }
      }
    }))
    unsubs.push(api.on('menu:open-recent', (id: string) => loadDeck(id)))
    unsubs.push(api.on('menu:new-deck', () => useEditorStore.getState().closeDeck()))

    return () => { unsubs.forEach((u) => u()) }
  }, [saveDeck, loadDeck])

  if (!currentDeck) {
    return (
      <>
        <WelcomeScreen />
        <ToastContainer />
      </>
    )
  }

  return (
    <div className="app">
      <Toolbar saveStatus={saveStatus} />
      <div className="app-body">
        {view === 'design' && (
          <>
            <DeckPanel />
            <Canvas />
            <RightPanelTabs />
          </>
        )}
        {view === 'components' && <ComponentEditor />}
        {view === 'data' && <DataView />}
        {view === 'score' && <ScoreView />}
        {view === 'export' && <ExportView />}
        {view === 'settings' && <SettingsView />}
      </div>
      <StatusBar saveStatus={saveStatus} />
      <ToastContainer />
      <KeyboardShortcuts />
      <AboutDialog />
      <TutorialOverlay />
    </div>
  )
}

export default App
