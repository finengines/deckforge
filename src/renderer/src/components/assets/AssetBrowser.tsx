import React, { useState, useEffect } from 'react'
import { useAssetStore } from '../../stores/assetStore'
import { useEditorStore } from '../../stores/editorStore'
import { searchAssets } from '../../lib/assetApi'
import type { AssetProvider, AssetResult } from '../../stores/assetStore'
import { v4 as uuid } from 'uuid'
import type { ImageLayer } from '../../types'

const PROVIDERS: { id: AssetProvider; label: string; requiresKey: boolean }[] = [
  { id: 'iconify', label: 'Iconify', requiresKey: false },
  { id: 'svgrepo', label: 'SVG Repo', requiresKey: false },
  { id: 'undraw', label: 'unDraw', requiresKey: false },
  { id: 'unsplash', label: 'Unsplash', requiresKey: true },
  { id: 'pexels', label: 'Pexels', requiresKey: true },
  { id: 'pixabay', label: 'Pixabay', requiresKey: true }
]

interface AssetBrowserProps {
  compact?: boolean
}

export function AssetBrowser({ compact = false }: AssetBrowserProps): React.JSX.Element {
  const assetStore = useAssetStore()
  const editorStore = useEditorStore()
  const [searchInput, setSearchInput] = useState('')

  const handleSearch = async (newQuery?: string) => {
    const q = newQuery ?? searchInput
    if (!q.trim()) {
      assetStore.setError('Please enter a search term')
      return
    }

    assetStore.setQuery(q)
    assetStore.setLoading(true)
    assetStore.setError(null)
    assetStore.resetPagination()
    assetStore.clearResults()

    try {
      const results = await searchAssets(
        assetStore.selectedProvider,
        q,
        assetStore.apiKeys,
        1
      )
      assetStore.setResults(results)
      assetStore.setHasMore(results.length >= 20)
    } catch (err) {
      assetStore.setError(err instanceof Error ? err.message : 'Search failed')
    } finally {
      assetStore.setLoading(false)
    }
  }

  const handleLoadMore = async () => {
    if (!assetStore.query.trim() || assetStore.loading || !assetStore.hasMore) return

    assetStore.setLoading(true)
    assetStore.nextPage()

    try {
      const results = await searchAssets(
        assetStore.selectedProvider,
        assetStore.query,
        assetStore.apiKeys,
        assetStore.page
      )
      assetStore.appendResults(results)
      assetStore.setHasMore(results.length >= 20)
    } catch (err) {
      assetStore.setError(err instanceof Error ? err.message : 'Failed to load more')
    } finally {
      assetStore.setLoading(false)
    }
  }

  const handleInsertAsset = async (asset: AssetResult) => {
    const deck = editorStore.currentDeck
    if (!deck) return

    try {
      // Download the asset
      const res = await fetch(asset.fullUrl)
      if (!res.ok) throw new Error('Failed to download asset')

      const blob = await res.blob()
      const reader = new FileReader()

      reader.onload = () => {
        const dataUrl = reader.result as string

        // Create an image layer
        const layer: ImageLayer = {
          id: uuid(),
          type: 'image',
          name: asset.title || 'Asset',
          x: 10,
          y: 10,
          width: asset.type === 'svg' ? 100 : 150,
          height: asset.type === 'svg' ? 100 : 150,
          rotation: 0,
          opacity: 1,
          visible: true,
          locked: false,
          src: dataUrl,
          fit: 'contain',
          filters: {
            brightness: 0,
            contrast: 0,
            saturation: 0,
            blur: 0,
            grayscale: false
          }
        }

        editorStore.addLayer(layer)
        editorStore.setView('design')
      }

      reader.readAsDataURL(blob)
    } catch (err) {
      assetStore.setError(err instanceof Error ? err.message : 'Failed to insert asset')
    }
  }

  const canUseProvider = (provider: AssetProvider): boolean => {
    if (provider === 'unsplash') return assetStore.hasAPIKey('unsplash')
    if (provider === 'pexels') return assetStore.hasAPIKey('pexels')
    if (provider === 'pixabay') return assetStore.hasAPIKey('pixabay')
    return true
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        padding: compact ? 8 : 12
      }}
    >
      {/* Search bar */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <input
            className="input"
            type="text"
            placeholder="Search assets..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearch()
            }}
            style={{ flex: 1, fontSize: compact ? 11 : 13 }}
          />
          <button
            className="btn btn-primary"
            onClick={() => handleSearch()}
            disabled={assetStore.loading}
            style={{ fontSize: compact ? 11 : 13 }}
          >
            {assetStore.loading ? '⏳' : '🔍'}
          </button>
        </div>
      </div>

      {/* Provider tabs */}
      <div
        style={{
          display: 'flex',
          gap: 4,
          marginBottom: 12,
          flexWrap: 'wrap',
          fontSize: compact ? 10 : 11
        }}
      >
        {PROVIDERS.map((prov) => {
          const active = assetStore.selectedProvider === prov.id
          const disabled = prov.requiresKey && !canUseProvider(prov.id)
          return (
            <button
              key={prov.id}
              onClick={() => {
                if (!disabled) {
                  assetStore.setProvider(prov.id)
                  if (assetStore.query) handleSearch(assetStore.query)
                }
              }}
              disabled={disabled}
              title={
                disabled
                  ? `Set ${prov.label} API key in Settings to enable`
                  : undefined
              }
              style={{
                padding: '4px 8px',
                fontSize: 'inherit',
                fontWeight: active ? 600 : 400,
                color: disabled
                  ? 'var(--text-muted)'
                  : active
                    ? 'var(--text-primary)'
                    : 'var(--text-secondary)',
                background: active ? 'var(--accent)' : 'var(--bg-tertiary)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.5 : 1,
                transition: 'all 0.15s'
              }}
            >
              {prov.label}
              {prov.requiresKey && !canUseProvider(prov.id) && ' 🔒'}
            </button>
          )
        })}
      </div>

      {/* Error */}
      {assetStore.error && (
        <div
          style={{
            padding: 8,
            marginBottom: 12,
            background: 'rgba(255, 100, 100, 0.1)',
            border: '1px solid rgba(255, 100, 100, 0.3)',
            borderRadius: 'var(--radius-sm)',
            color: '#ff6464',
            fontSize: compact ? 10 : 11
          }}
        >
          ⚠️ {assetStore.error}
        </div>
      )}

      {/* Results grid */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          display: 'grid',
          gridTemplateColumns: compact
            ? 'repeat(auto-fill, minmax(60px, 1fr))'
            : 'repeat(auto-fill, minmax(100px, 1fr))',
          gap: compact ? 6 : 10,
          alignContent: 'start'
        }}
      >
        {assetStore.results.map((asset) => (
          <div
            key={asset.id}
            onClick={() => handleInsertAsset(asset)}
            title={`${asset.title}\n${asset.attribution || ''}`}
            style={{
              aspectRatio: '1',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent)'
              e.currentTarget.style.transform = 'scale(1.05)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            <img
              src={asset.previewUrl}
              alt={asset.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </div>
        ))}
      </div>

      {/* Load more */}
      {assetStore.results.length > 0 && assetStore.hasMore && (
        <div style={{ marginTop: 12 }}>
          <button
            className="btn"
            onClick={handleLoadMore}
            disabled={assetStore.loading}
            style={{ width: '100%', fontSize: compact ? 11 : 13 }}
          >
            {assetStore.loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}

      {/* Attribution notice */}
      {assetStore.results.length > 0 &&
        ['unsplash', 'pexels', 'pixabay'].includes(assetStore.selectedProvider) && (
          <div
            style={{
              marginTop: 12,
              padding: 6,
              fontSize: compact ? 9 : 10,
              color: 'var(--text-muted)',
              background: 'var(--bg-tertiary)',
              borderRadius: 'var(--radius-sm)',
              textAlign: 'center'
            }}
          >
            ℹ️ Attribution required when using images from {assetStore.selectedProvider}
          </div>
        )}

      {/* Empty state */}
      {!assetStore.loading && assetStore.results.length === 0 && assetStore.query && (
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)',
            fontSize: compact ? 11 : 13
          }}
        >
          No results found
        </div>
      )}

      {!assetStore.loading && assetStore.results.length === 0 && !assetStore.query && (
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)',
            fontSize: compact ? 11 : 13,
            textAlign: 'center',
            padding: 20
          }}
        >
          🖼️
          <br />
          Search for icons, illustrations, or photos
        </div>
      )}
    </div>
  )
}
