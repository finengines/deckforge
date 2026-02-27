import React from "react"
import { useEditorStore } from './stores/editorStore'
import { useDeckPersistence } from './hooks/useDeckPersistence'
import { Toolbar } from './components/editor/Toolbar'
import { Canvas } from './components/editor/Canvas'
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
  const { saveStatus } = useDeckPersistence()
  useKeyboardShortcuts()

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
