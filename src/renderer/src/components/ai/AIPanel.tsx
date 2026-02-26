import React from "react"
import { useState, useCallback } from 'react'
import { useAIStore } from '../../stores/aiStore'
import { useEditorStore } from '../../stores/editorStore'
import {
  generateText,
  generateImage,
  generateCardStats,
  describeImage,
  describeCardFromImage,
  type GenerateTextOptions,
  type CardDescriptionFromImage
} from '../../lib/ai'
import type { AIProviderConfig, AITask } from '../../types'

function ProviderSelect({
  task,
  value,
  onChange
}: {
  task: AITask
  value: string
  onChange: (id: string) => void
}): React.JSX.Element {
  const providers = useAIStore((s) => s.providers.filter((p) => p.enabled))
  return (
    <select className="input" value={value} onChange={(e) => onChange(e.target.value)} style={{ fontSize: 11 }}>
      <option value="">Select provider…</option>
      {providers.map((p) => (
        <option key={p.id} value={p.id}>
          {p.name} ({task === 'image' ? p.imageModel : task === 'vision' ? p.visionModel : p.textModel})
        </option>
      ))}
    </select>
  )
}

function Section({
  title,
  icon,
  children
}: {
  title: string
  icon: string
  children: React.ReactNode
}): React.JSX.Element {
  const [open, setOpen] = useState(true)
  return (
    <div style={{ marginBottom: 12 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', background: 'var(--bg-tertiary)', border: 'none', color: 'var(--text-primary)',
          padding: '8px 10px', borderRadius: 'var(--radius)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600
        }}
      >
        <span>{icon}</span> {title} <span style={{ marginLeft: 'auto', fontSize: 10 }}>{open ? '▼' : '▶'}</span>
      </button>
      {open && <div style={{ padding: '10px 4px 0' }}>{children}</div>}
    </div>
  )
}

export function AIPanel(): React.JSX.Element {
  const deck = useEditorStore((s) => s.currentDeck)
  const selectedCardId = useEditorStore((s) => s.selectedCardId)
  const updateCard = useEditorStore((s) => s.updateCard)
  const providers = useAIStore((s) => s.providers)
  const defaults = useAIStore((s) => s.defaults)
  const { generating, setGenerating } = useAIStore()

  const [textPrompt, setTextPrompt] = useState('')
  const [textProvider, setTextProvider] = useState(defaults.text)
  const [textResult, setTextResult] = useState('')

  const [imgPrompt, setImgPrompt] = useState('')
  const [imgProvider, setImgProvider] = useState(defaults.image)
  const [imgResult, setImgResult] = useState<string | null>(null)

  const [statsProvider, setStatsProvider] = useState(defaults.stats)
  const [statsResult, setStatsResult] = useState<Record<string, number> | null>(null)

  const [visionProvider, setVisionProvider] = useState(defaults.vision)
  const [visionResult, setVisionResult] = useState('')
  const [describeResult, setDescribeResult] = useState<CardDescriptionFromImage | null>(null)

  const selectedCard = deck?.cards.find((c) => c.id === selectedCardId)
  const getConfig = (id: string): AIProviderConfig | undefined => providers.find((p) => p.id === id)

  const handleGenerateText = useCallback(async () => {
    const config = getConfig(textProvider)
    if (!config || !textPrompt) return
    setGenerating(true, 'Generating text…')
    try {
      const result = await generateText(config, { prompt: textPrompt } as GenerateTextOptions)
      setTextResult(result)
    } catch (e: any) {
      setTextResult(`Error: ${e.message}`)
    } finally {
      setGenerating(false)
    }
  }, [textProvider, textPrompt])

  const handleGenerateImage = useCallback(async () => {
    const config = getConfig(imgProvider)
    if (!config || !imgPrompt) return
    setGenerating(true, 'Generating image…')
    try {
      const buffers = await generateImage(config, { prompt: imgPrompt })
      if (buffers.length > 0) {
        const b64 = buffers[0] instanceof Buffer
          ? buffers[0].toString('base64')
          : btoa(String.fromCharCode(...new Uint8Array(buffers[0] as any)))
        setImgResult(`data:image/png;base64,${b64}`)
      }
    } catch (e: any) {
      setImgResult(null)
      setTextResult(`Image error: ${e.message}`)
    } finally {
      setGenerating(false)
    }
  }, [imgProvider, imgPrompt])

  const handleGenerateStats = useCallback(async () => {
    const config = getConfig(statsProvider)
    if (!config || !deck || !selectedCard) return
    setGenerating(true, 'Generating stats…')
    try {
      const cats = deck.categories.map((c) => ({ name: c.name, min: c.min, max: c.max }))
      const result = await generateCardStats(config, selectedCard.name, cats, deck.description)
      // Map by category name back to category id
      const mapped: Record<string, number> = {}
      for (const cat of deck.categories) {
        if (result[cat.name] !== undefined) {
          mapped[cat.id] = Math.min(cat.max, Math.max(cat.min, result[cat.name]))
        }
      }
      setStatsResult(mapped)
    } catch (e: any) {
      setStatsResult(null)
    } finally {
      setGenerating(false)
    }
  }, [statsProvider, deck, selectedCard])

  const handleDescribeImage = useCallback(async () => {
    const config = getConfig(visionProvider)
    if (!config || !selectedCard?.image) return
    setGenerating(true, 'Analyzing image…')
    try {
      const b64 = selectedCard.image.startsWith('data:')
        ? selectedCard.image.split(',')[1]
        : selectedCard.image
      const result = await describeImage(config, b64)
      setVisionResult(result)
    } catch (e: any) {
      setVisionResult(`Error: ${e.message}`)
    } finally {
      setGenerating(false)
    }
  }, [visionProvider, selectedCard])

  const handleDescribeFromImage = useCallback(async () => {
    const config = getConfig(visionProvider)
    if (!config || !selectedCard?.image) return
    setGenerating(true, 'AI describing card…')
    try {
      const b64 = selectedCard.image.startsWith('data:')
        ? selectedCard.image.split(',')[1]
        : selectedCard.image
      const cats = deck?.categories.map((c) => ({ name: c.name, min: c.min, max: c.max })) ?? []
      const result = await describeCardFromImage(config, b64, cats)
      setDescribeResult(result)
    } catch (e: any) {
      setDescribeResult(null)
    } finally {
      setGenerating(false)
    }
  }, [visionProvider, selectedCard, deck])

  const applyDescription = (): void => {
    if (!describeResult || !selectedCard || !deck) return
    const updates: Record<string, any> = {}
    if (describeResult.name) updates.name = describeResult.name
    if (describeResult.description) updates.description = describeResult.description
    if (describeResult.funFact) updates.funFact = describeResult.funFact
    if (describeResult.stats && Object.keys(describeResult.stats).length > 0) {
      const mapped: Record<string, number> = { ...selectedCard.stats }
      for (const cat of deck.categories) {
        if (describeResult.stats[cat.name] !== undefined) {
          mapped[cat.id] = Math.min(cat.max, Math.max(cat.min, describeResult.stats[cat.name]))
        }
      }
      updates.stats = mapped
    }
    updateCard(selectedCard.id, updates)
    setDescribeResult(null)
  }

  if (!deck) {
    return (
      <div style={{ padding: 16, color: 'var(--text-muted)', fontSize: 12 }}>
        Open a deck to use AI features.
      </div>
    )
  }

  return (
    <div style={{
      width: 300, background: 'var(--bg-secondary)', borderLeft: '1px solid var(--border)',
      overflow: 'auto', padding: 12, fontSize: 12
    }}>
      <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>🤖 AI Panel</h3>
      {providers.filter((p) => p.enabled).length === 0 && (
        <div style={{
          padding: 16, textAlign: 'center', background: 'var(--bg-tertiary)',
          borderRadius: 'var(--radius)', marginBottom: 12, lineHeight: 1.6
        }}>
          <div style={{ fontSize: 24, marginBottom: 8, opacity: 0.5 }}>🔑</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500, marginBottom: 4 }}>
            No AI provider configured
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10 }}>
            Add an API key in Settings to unlock AI features
          </div>
          <button className="btn btn-sm btn-primary" onClick={() => useEditorStore.getState().setView('settings')}>
            ⚙️ Open Settings
          </button>
        </div>
      )}
      {selectedCard && (
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12 }}>
          Card: <strong>{selectedCard.name}</strong>
        </div>
      )}

      {/* Generate Text */}
      <Section title="Generate Text" icon="✏️">
        <ProviderSelect task="text" value={textProvider} onChange={setTextProvider} />
        <textarea
          className="input" rows={3} placeholder="Describe what you want…"
          value={textPrompt} onChange={(e) => setTextPrompt(e.target.value)}
          style={{ marginTop: 6, resize: 'vertical', fontSize: 11 }}
        />
        <button className="btn btn-primary btn-sm" onClick={handleGenerateText}
          disabled={generating || !textPrompt} style={{ marginTop: 6, width: '100%' }}>
          {generating ? '⏳ Generating…' : '✨ Generate'}
        </button>
        {textResult && (
          <div style={{ marginTop: 8, padding: 8, background: 'var(--bg-tertiary)', borderRadius: 4, whiteSpace: 'pre-wrap' }}>
            {textResult}
            {selectedCard && (
              <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                <button className="btn btn-sm" onClick={() => { updateCard(selectedCard.id, { description: textResult }); }}>
                  → Description
                </button>
                <button className="btn btn-sm" onClick={() => { updateCard(selectedCard.id, { funFact: textResult }); }}>
                  → Fun Fact
                </button>
              </div>
            )}
          </div>
        )}
      </Section>

      {/* Generate Image */}
      <Section title="Generate Image" icon="🖼️">
        <ProviderSelect task="image" value={imgProvider} onChange={setImgProvider} />
        <textarea
          className="input" rows={2} placeholder="Describe the image…"
          value={imgPrompt} onChange={(e) => setImgPrompt(e.target.value)}
          style={{ marginTop: 6, resize: 'vertical', fontSize: 11 }}
        />
        <div style={{ marginTop: 4, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {['photorealistic', 'cartoon', 'watercolor', 'pixel art'].map((s) => (
            <button key={s} className="btn btn-sm" style={{ fontSize: 10 }}
              onClick={() => setImgPrompt((p) => `${p} ${s} style`.trim())}>
              {s}
            </button>
          ))}
        </div>
        <button className="btn btn-primary btn-sm" onClick={handleGenerateImage}
          disabled={generating || !imgPrompt} style={{ marginTop: 6, width: '100%' }}>
          {generating ? '⏳ Generating…' : '🎨 Generate Image'}
        </button>
        {imgResult && (
          <div style={{ marginTop: 8 }}>
            <img src={imgResult} alt="Generated" style={{ width: '100%', borderRadius: 4 }} />
            {selectedCard && (
              <button className="btn btn-primary btn-sm" style={{ marginTop: 6, width: '100%' }}
                onClick={() => updateCard(selectedCard.id, { image: imgResult })}>
                Apply to Card
              </button>
            )}
          </div>
        )}
      </Section>

      {/* Generate Stats */}
      <Section title="Generate Stats" icon="📊">
        <ProviderSelect task="stats" value={statsProvider} onChange={setStatsProvider} />
        {deck.categories.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', marginTop: 6 }}>No categories defined.</p>
        ) : (
          <>
            <button className="btn btn-primary btn-sm" onClick={handleGenerateStats}
              disabled={generating || !selectedCard} style={{ marginTop: 6, width: '100%' }}>
              {generating ? '⏳ Generating…' : '🎲 Generate Stats'}
            </button>
            {statsResult && selectedCard && (
              <div style={{ marginTop: 8, padding: 8, background: 'var(--bg-tertiary)', borderRadius: 4 }}>
                {deck.categories.map((cat) => (
                  <div key={cat.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                    <span>{cat.name}</span>
                    <span>{statsResult[cat.id] ?? '—'}{cat.unit ? ` ${cat.unit}` : ''}</span>
                  </div>
                ))}
                <button className="btn btn-primary btn-sm" style={{ marginTop: 6, width: '100%' }}
                  onClick={() => updateCard(selectedCard.id, { stats: { ...selectedCard.stats, ...statsResult } })}>
                  Apply Stats
                </button>
              </div>
            )}
          </>
        )}
      </Section>

      {/* Describe Image */}
      <Section title="Describe Image" icon="👁️">
        <ProviderSelect task="vision" value={visionProvider} onChange={setVisionProvider} />
        <button className="btn btn-primary btn-sm" onClick={handleDescribeImage}
          disabled={generating || !selectedCard?.image} style={{ marginTop: 6, width: '100%' }}>
          {generating ? '⏳ Analyzing…' : '👁️ Describe Card Image'}
        </button>
        {!selectedCard?.image && (
          <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>Selected card has no image.</p>
        )}
        {visionResult && (
          <div style={{ marginTop: 8, padding: 8, background: 'var(--bg-tertiary)', borderRadius: 4, whiteSpace: 'pre-wrap' }}>
            {visionResult}
            {selectedCard && (
              <button className="btn btn-sm" style={{ marginTop: 6 }}
                onClick={() => updateCard(selectedCard.id, { description: visionResult })}>
                → Description
              </button>
            )}
          </div>
        )}
      </Section>

      {/* AI Describe Card (full) */}
      <Section title="AI Describe Card" icon="🔮">
        <ProviderSelect task="vision" value={visionProvider} onChange={setVisionProvider} />
        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
          Analyzes card image and suggests name, description, fun fact, and stats.
        </p>
        <button className="btn btn-primary btn-sm" onClick={handleDescribeFromImage}
          disabled={generating || !selectedCard?.image} style={{ marginTop: 6, width: '100%' }}>
          {generating ? '⏳ Analyzing…' : '🔮 AI Describe Card'}
        </button>
        {describeResult && (
          <div style={{ marginTop: 8, padding: 8, background: 'var(--bg-tertiary)', borderRadius: 4, fontSize: 11 }}>
            {describeResult.name && <div><strong>Name:</strong> {describeResult.name}</div>}
            {describeResult.description && <div style={{ marginTop: 4 }}><strong>Description:</strong> {describeResult.description}</div>}
            {describeResult.funFact && <div style={{ marginTop: 4 }}><strong>Fun Fact:</strong> {describeResult.funFact}</div>}
            {Object.keys(describeResult.stats).length > 0 && (
              <div style={{ marginTop: 4 }}>
                <strong>Stats:</strong>
                {Object.entries(describeResult.stats).map(([k, v]) => (
                  <div key={k} style={{ paddingLeft: 8 }}>{k}: {v}</div>
                ))}
              </div>
            )}
            <button className="btn btn-primary btn-sm" style={{ marginTop: 8, width: '100%' }} onClick={applyDescription}>
              ✅ Apply to Card
            </button>
          </div>
        )}
      </Section>
    </div>
  )
}
