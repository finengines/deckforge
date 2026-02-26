import React from "react"
import { useState, useCallback } from 'react'
import { useAIStore } from '../../stores/aiStore'
import { useEditorStore } from '../../stores/editorStore'
import { generateImage } from '../../lib/ai'
import { v4 as uuid } from 'uuid'
import type { ImageLayer } from '../../types'

const STYLE_SUGGESTIONS = [
  'photorealistic', 'digital art', 'watercolor painting', 'oil painting',
  'cartoon', 'anime', 'pixel art', 'pencil sketch', '3D render', 'pop art'
]

export function ImageGenDialog({ onClose }: { onClose: () => void }): React.JSX.Element {
  const deck = useEditorStore((s) => s.currentDeck)
  const selectedCardId = useEditorStore((s) => s.selectedCardId)
  const updateCard = useEditorStore((s) => s.updateCard)
  const addLayer = useEditorStore((s) => s.addLayer)
  const providers = useAIStore((s) => s.providers)
  const defaults = useAIStore((s) => s.defaults)
  const { generating, setGenerating } = useAIStore()

  const [prompt, setPrompt] = useState('')
  const [providerId, setProviderId] = useState(defaults.image)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState('')

  const selectedCard = deck?.cards.find((c) => c.id === selectedCardId)
  const enabledProviders = providers.filter((p) => p.enabled && p.imageModel)

  const handleGenerate = useCallback(async () => {
    const config = providers.find((p) => p.id === providerId)
    if (!config || !prompt) return
    setGenerating(true, 'Generating image…')
    setError('')
    setPreview(null)
    try {
      const buffers = await generateImage(config, { prompt })
      if (buffers.length > 0) {
        const b64 = buffers[0] instanceof Buffer
          ? buffers[0].toString('base64')
          : btoa(String.fromCharCode(...new Uint8Array(buffers[0] as any)))
        setPreview(`data:image/png;base64,${b64}`)
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setGenerating(false)
    }
  }, [providerId, prompt, providers])

  const applyAsCardImage = () => {
    if (!preview || !selectedCard) return
    updateCard(selectedCard.id, { image: preview })
    onClose()
  }

  const applyAsLayer = () => {
    if (!preview || !deck) return
    const layer: ImageLayer = {
      id: uuid(),
      type: 'image',
      name: 'AI Generated Image',
      x: 5, y: 5,
      width: deck.dimensions.width - 10,
      height: deck.dimensions.height / 2,
      rotation: 0, opacity: 1, visible: true, locked: false,
      src: preview,
      fit: 'cover',
      filters: { brightness: 100, contrast: 100, saturation: 100, blur: 0, grayscale: false }
    }
    addLayer(layer)
    onClose()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }} onClick={(e) => { if (e.target === e.currentTarget && !generating) onClose() }}>
      <div style={{
        background: 'var(--bg-primary)', borderRadius: 'var(--radius)', padding: 24,
        width: 480, maxHeight: '80vh', overflow: 'auto'
      }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>🎨 AI Image Generation</h3>

        <div className="form-group">
          <label className="input-label">Provider</label>
          <select className="input" value={providerId} onChange={(e) => setProviderId(e.target.value)}>
            <option value="">Select…</option>
            {enabledProviders.map((p) => (
              <option key={p.id} value={p.id}>{p.name} ({p.imageModel})</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="input-label">Prompt</label>
          <textarea className="input" rows={3} value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A majestic dragon breathing fire over a medieval castle…"
            style={{ resize: 'vertical' }} />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label className="input-label" style={{ marginBottom: 4 }}>Style Suggestions</label>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {STYLE_SUGGESTIONS.map((s) => (
              <button key={s} className="btn btn-sm" style={{ fontSize: 10, padding: '2px 6px' }}
                onClick={() => setPrompt((p) => `${p}, ${s} style`.trim())}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <button className="btn btn-primary" onClick={handleGenerate}
          disabled={generating || !prompt || !providerId}
          style={{ width: '100%', marginBottom: 12 }}>
          {generating ? '⏳ Generating…' : '🎨 Generate Image'}
        </button>

        {error && (
          <div style={{ padding: 8, background: '#2a1515', borderRadius: 4, fontSize: 12, color: '#ff6b6b', marginBottom: 12 }}>
            {error}
          </div>
        )}

        {preview && (
          <div style={{ marginBottom: 12 }}>
            <img src={preview} alt="Preview" style={{ width: '100%', borderRadius: 4, marginBottom: 8 }} />
            <div style={{ display: 'flex', gap: 8 }}>
              {selectedCard && (
                <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={applyAsCardImage}>
                  📷 Set as Card Image
                </button>
              )}
              <button className="btn btn-sm" style={{ flex: 1 }} onClick={applyAsLayer}>
                📐 Add as Layer
              </button>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-sm" onClick={onClose} disabled={generating}>Close</button>
        </div>
      </div>
    </div>
  )
}
