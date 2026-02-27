import React from "react"
import { useState, useCallback, useRef } from 'react'
import { useAIStore } from '../../stores/aiStore'
import { useEditorStore } from '../../stores/editorStore'
import {
  generateCardDescription,
  generateFunFact,
  generateCardStats,
  describeCardFromImage
} from '../../lib/ai'

interface BatchOptions {
  descriptions: boolean
  funFacts: boolean
  stats: boolean
}

interface CardResult {
  cardId: string
  cardName: string
  status: 'pending' | 'generating' | 'done' | 'error'
  error?: string
  preview?: { description?: string; funFact?: string }
}

export function BatchGenerate({ onClose }: { onClose: () => void }): React.JSX.Element {
  const deck = useEditorStore((s) => s.currentDeck)
  const updateCard = useEditorStore((s) => s.updateCard)
  const providers = useAIStore((s) => s.providers)
  const defaults = useAIStore((s) => s.defaults)
  const { setGenerating } = useAIStore()

  const [opts, setOpts] = useState<BatchOptions>({ descriptions: true, funFacts: true, stats: true })
  const [running, setRunning] = useState(false)
  const [results, setResults] = useState<CardResult[]>([])
  const [delay, setDelay] = useState(1000)
  const cancelRef = useRef(false)

  const handleGenerate = useCallback(async () => {
    if (!deck) return
    const textConfig = providers.find((p) => p.id === defaults.text)
    const statsConfig = providers.find((p) => p.id === defaults.stats)
    if (!textConfig && (opts.descriptions || opts.funFacts)) return
    if (!statsConfig && opts.stats) return

    cancelRef.current = false
    setRunning(true)
    setGenerating(true, 'Batch generating…')

    const cards = deck.cards
    const initial: CardResult[] = cards.map((c) => ({
      cardId: c.id, cardName: c.name, status: 'pending'
    }))
    setResults(initial)

    for (let i = 0; i < cards.length; i++) {
      if (cancelRef.current) break

      const card = cards[i]
      setResults((prev) => prev.map((r, idx) =>
        idx === i ? { ...r, status: 'generating' } : r
      ))

      try {
        const updates: Record<string, any> = {}
        const aiFlags: Record<string, boolean> = { ...card.aiGenerated }
        const preview: CardResult['preview'] = {}

        // If card has an image, use vision-based generation for richer context
        const hasImage = !!card.image
        const visionConfig = providers.find((p) => p.id === defaults.vision) ?? textConfig

        if (hasImage && visionConfig && (opts.descriptions || opts.stats)) {
          // Vision-based: analyze image + generate description, stats, fun fact in one call
          try {
            const b64 = card.image!.startsWith('data:')
              ? card.image!.split(',')[1]
              : card.image!
            const cats = deck.categories.map((c) => ({ name: c.name, min: c.min, max: c.max }))
            const result = await describeCardFromImage(visionConfig, b64, cats)

            if (opts.descriptions && result.description) {
              updates.description = result.description
              aiFlags.description = true
              preview.description = result.description
            }
            if (opts.funFacts && result.funFact) {
              updates.funFact = result.funFact
              aiFlags.funFact = true
              preview.funFact = result.funFact
            }
            if (opts.stats && result.stats && Object.keys(result.stats).length > 0) {
              const mapped: Record<string, number> = {}
              for (const cat of deck.categories) {
                if (result.stats[cat.name] !== undefined) {
                  mapped[cat.id] = Math.min(cat.max, Math.max(cat.min, result.stats[cat.name]))
                }
              }
              updates.stats = { ...card.stats, ...mapped }
              aiFlags.stats = true
            }
          } catch {
            // Fallback to text-based if vision fails
            if (opts.descriptions && textConfig) {
              updates.description = await generateCardDescription(textConfig, card.name, deck.description)
              aiFlags.description = true
              preview.description = updates.description
            }
          }
        } else {
          // Text-based generation (no image available)
          if (opts.descriptions && textConfig) {
            updates.description = await generateCardDescription(textConfig, card.name, deck.description)
            aiFlags.description = true
            preview.description = updates.description
          }
        }
        if (cancelRef.current) break

        // Generate fun facts separately if not already done via vision
        if (opts.funFacts && textConfig && !updates.funFact) {
          updates.funFact = await generateFunFact(textConfig, card.name)
          aiFlags.funFact = true
          preview.funFact = updates.funFact
        }
        if (cancelRef.current) break

        // Generate stats separately if not already done via vision
        if (opts.stats && statsConfig && deck.categories.length > 0 && !updates.stats) {
          const cats = deck.categories.map((c) => ({ name: c.name, min: c.min, max: c.max }))
          const raw = await generateCardStats(statsConfig, card.name, cats, deck.description)
          const mapped: Record<string, number> = {}
          for (const cat of deck.categories) {
            if (raw[cat.name] !== undefined) {
              mapped[cat.id] = Math.min(cat.max, Math.max(cat.min, raw[cat.name]))
            }
          }
          updates.stats = { ...card.stats, ...mapped }
          aiFlags.stats = true
        }

        updates.aiGenerated = aiFlags
        updateCard(card.id, updates)

        setResults((prev) => prev.map((r, idx) =>
          idx === i ? { ...r, status: 'done', preview } : r
        ))
      } catch (e: any) {
        setResults((prev) => prev.map((r, idx) =>
          idx === i ? { ...r, status: 'error', error: e.message } : r
        ))
      }

      // Rate limiting delay
      if (i < cards.length - 1 && !cancelRef.current) {
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }

    setRunning(false)
    setGenerating(false)
  }, [deck, opts, providers, defaults, delay])

  const handleCancel = (): void => {
    cancelRef.current = true
  }

  if (!deck) return <div />

  const doneCount = results.filter((r) => r.status === 'done').length
  const errorCount = results.filter((r) => r.status === 'error').length
  const total = results.length
  const pct = total > 0 ? Math.round((doneCount + errorCount) / total * 100) : 0
  const finished = total > 0 && !running && (doneCount + errorCount) === total

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }} onClick={(e) => { if (e.target === e.currentTarget && !running) onClose() }}>
      <div style={{
        background: 'var(--bg-primary)', borderRadius: 'var(--radius)', padding: 24,
        width: 480, maxHeight: '80vh', overflow: 'auto'
      }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>🤖 Batch AI Generation</h3>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
          Generate content for all {deck.cards.length} cards using AI.
        </p>

        <div style={{ marginBottom: 16 }}>
          {([
            ['descriptions', 'Descriptions', '2-3 sentence descriptions'],
            ['funFacts', 'Fun Facts', 'One surprising fact per card'],
            ['stats', 'Stats', 'AI-generated stat values']
          ] as const).map(([key, label, desc]) => (
            <label key={key} style={{
              display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8, cursor: 'pointer', fontSize: 12
            }}>
              <input type="checkbox" checked={opts[key]}
                onChange={(e) => setOpts((o) => ({ ...o, [key]: e.target.checked }))}
                disabled={running} style={{ marginTop: 2 }} />
              <div>
                <div style={{ fontWeight: 500 }}>{label}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{desc}</div>
              </div>
            </label>
          ))}
        </div>

        {/* Rate limiting config */}
        <div style={{ marginBottom: 16 }}>
          <label className="input-label" style={{ fontSize: 11 }}>
            Delay between cards: {delay}ms
          </label>
          <input type="range" min={200} max={5000} step={100} value={delay}
            onChange={(e) => setDelay(parseInt(e.target.value))}
            disabled={running}
            style={{ width: '100%' }} />
        </div>

        {/* Progress bar */}
        {results.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, marginBottom: 4, display: 'flex', justifyContent: 'space-between' }}>
              <span>{doneCount}/{total} completed{errorCount > 0 ? ` (${errorCount} errors)` : ''}</span>
              <span>{pct}%</span>
            </div>
            <div style={{ height: 8, background: 'var(--bg-tertiary)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${pct}%`,
                background: errorCount > 0 ? 'linear-gradient(90deg, var(--accent), #ff6b6b)' : 'var(--accent)',
                borderRadius: 4, transition: 'width 0.3s'
              }} />
            </div>
          </div>
        )}

        {/* Card results */}
        {results.length > 0 && (
          <div style={{ marginBottom: 16, maxHeight: 200, overflow: 'auto' }}>
            {results.map((r) => (
              <div key={r.cardId} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0',
                fontSize: 11, borderBottom: '1px solid var(--border)'
              }}>
                <span style={{ width: 18, textAlign: 'center' }}>
                  {r.status === 'pending' && '⏳'}
                  {r.status === 'generating' && '🔄'}
                  {r.status === 'done' && '✅'}
                  {r.status === 'error' && '❌'}
                </span>
                <span style={{ flex: 1, fontWeight: r.status === 'generating' ? 600 : 400 }}>
                  {r.cardName}
                </span>
                {r.status === 'done' && r.preview?.description && (
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {r.preview.description.substring(0, 50)}…
                  </span>
                )}
                {r.status === 'error' && (
                  <span style={{ fontSize: 10, color: '#ff6b6b' }} title={r.error}>⚠ {r.error?.substring(0, 30)}</span>
                )}
              </div>
            ))}
          </div>
        )}

        {finished && (
          <div style={{ marginBottom: 12, padding: 8, background: '#152a15', borderRadius: 4, fontSize: 12, color: '#6bff6b' }}>
            ✅ Completed! Generated content for {doneCount} cards.
            {errorCount > 0 && <span style={{ color: '#ff6b6b' }}> ({errorCount} failed)</span>}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          {running && (
            <button className="btn btn-sm" onClick={handleCancel} style={{ color: '#ff6b6b' }}>
              ⏹ Cancel
            </button>
          )}
          <button className="btn btn-sm" onClick={onClose} disabled={running}>Close</button>
          {!running && (
            <button className="btn btn-primary btn-sm" onClick={handleGenerate}
              disabled={!opts.descriptions && !opts.funFacts && !opts.stats}>
              ✨ Generate for {deck.cards.length} Cards
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
