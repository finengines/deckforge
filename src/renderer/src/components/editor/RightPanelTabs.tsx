import React, { useState } from 'react'
import { LayerPanel } from './LayerPanel'
import { PropertiesPanel } from './PropertiesPanel'
import ComponentLibrary from '../library/ComponentLibrary'
import { useEditorStore } from '../../stores/editorStore'

type TabId = 'layers' | 'properties' | 'components'

const tabs: { id: TabId; label: string; icon: string }[] = [
  { id: 'layers', label: 'Layers', icon: '📑' },
  { id: 'properties', label: 'Properties', icon: '⚙' },
  { id: 'components', label: 'Components', icon: '🧩' }
]

export function RightPanelTabs(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<TabId>('layers')
  const selectedLayerIds = useEditorStore((s) => s.selectedLayerIds)

  // Auto-switch to properties when a layer is selected
  React.useEffect(() => {
    if (selectedLayerIds.length > 0) {
      setActiveTab('properties')
    }
  }, [selectedLayerIds])

  return (
    <div className="panel" style={{ width: 280, display: 'flex', flexDirection: 'column' }}>
      {/* Tab bar */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-tertiary)',
        flexShrink: 0
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              padding: '8px 4px',
              fontSize: 11,
              fontWeight: activeTab === tab.id ? 600 : 400,
              color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-muted)',
              background: activeTab === tab.id ? 'var(--bg-secondary)' : 'transparent',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid var(--accent)' : '2px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.15s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            {tab.id === 'layers' && (
              <span style={{
                fontSize: 9,
                background: 'var(--bg-tertiary)',
                padding: '1px 4px',
                borderRadius: 8,
                color: 'var(--text-muted)'
              }}>
                {useEditorStore.getState().currentDeck?.frontTemplate.frontLayers.length ?? 0}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {activeTab === 'layers' && <LayerPanel />}
        {activeTab === 'properties' && <PropertiesPanel />}
        {activeTab === 'components' && (
          <div style={{ flex: 1, overflow: 'auto' }}>
            <ComponentLibrary
              onAddLayers={(layers) => {
                const store = useEditorStore.getState()
                layers.forEach((layer) => store.addLayer(layer))
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
