import React, { useState, useCallback } from 'react'
import { LayerPanel } from './LayerPanel'
import { PropertiesPanel } from './PropertiesPanel'
import ComponentLibrary from '../library/ComponentLibrary'
import { AssetBrowser } from '../assets/AssetBrowser'
import { useEditorStore } from '../../stores/editorStore'

type TabId = 'layers' | 'properties' | 'components' | 'assets'

const tabs: { id: TabId; label: string; icon: string }[] = [
  { id: 'layers', label: 'Layers', icon: '📑' },
  { id: 'properties', label: 'Properties', icon: '⚙' },
  { id: 'components', label: 'Components', icon: '🧩' },
  { id: 'assets', label: 'Assets', icon: '🖼' }
]

export function RightPanelTabs(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<TabId>('layers')

  const currentIndex = tabs.findIndex((t) => t.id === activeTab)

  const goNext = useCallback(() => {
    const next = (currentIndex + 1) % tabs.length
    setActiveTab(tabs[next].id)
  }, [currentIndex])

  const goPrev = useCallback(() => {
    const prev = (currentIndex - 1 + tabs.length) % tabs.length
    setActiveTab(tabs[prev].id)
  }, [currentIndex])

  return (
    <div style={{
      width: 280,
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-secondary)',
      borderLeft: '1px solid var(--border)',
      height: '100%',
      minHeight: 0,
      overflow: 'hidden'
    }}>
      {/* Tab bar with nav arrows */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-tertiary)',
        flexShrink: 0
      }}>
        {/* Previous arrow */}
        <button
          onClick={goPrev}
          style={{
            padding: '8px 6px',
            fontSize: 12,
            color: 'var(--text-muted)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            flexShrink: 0,
            lineHeight: 1
          }}
          title="Previous tab"
        >
          ◀
        </button>

        {/* Tab buttons */}
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              padding: '8px 2px',
              fontSize: 10,
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
              gap: 3,
              whiteSpace: 'nowrap',
              overflow: 'hidden'
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}

        {/* Next arrow */}
        <button
          onClick={goNext}
          style={{
            padding: '8px 6px',
            fontSize: 12,
            color: 'var(--text-muted)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            flexShrink: 0,
            lineHeight: 1
          }}
          title="Next tab"
        >
          ▶
        </button>
      </div>

      {/* Tab content — this is the scrollable area */}
      <div style={{
        flex: '1 1 0px',
        minHeight: 0,
        overflowY: 'auto',
        overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch' as never
      }}>
        {activeTab === 'layers' && <LayerPanel />}
        {activeTab === 'properties' && <PropertiesPanel />}
        {activeTab === 'components' && (
          <ComponentLibrary
            onAddLayers={(layers) => {
              const store = useEditorStore.getState()
              layers.forEach((layer) => store.addLayer(layer))
            }}
          />
        )}
        {activeTab === 'assets' && <AssetBrowser compact />}
      </div>
    </div>
  )
}
