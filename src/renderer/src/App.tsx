import React from "react"
import { useEditorStore } from './stores/editorStore'
import { useDeckPersistence } from './hooks/useDeckPersistence'
import { Toolbar } from './components/editor/Toolbar'
import { Canvas } from './components/editor/Canvas'
import { LayerPanel } from './components/editor/LayerPanel'
import { PropertiesPanel } from './components/editor/PropertiesPanel'
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
import ComponentLibrary from './components/library/ComponentLibrary'
import './assets/app.css'

function App(): React.JSX.Element {
  const view = useEditorStore((s) => s.view)
  const currentDeck = useEditorStore((s) => s.currentDeck)
  const { saveStatus } = useDeckPersistence()

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
            <div className="right-panels">
              <div className="panel">
                <div className="panel-header">Components</div>
                <div className="panel-content" style={{ padding: 0 }}>
                  <ComponentLibrary
                    onAddLayers={(layers) => {
                      const store = useEditorStore.getState()
                      layers.forEach((layer) => store.addLayer(layer))
                    }}
                  />
                </div>
              </div>
              <LayerPanel />
              <PropertiesPanel />
            </div>
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
    </div>
  )
}

export default App
