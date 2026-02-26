import { useState, useCallback } from 'react'
import { useAIStore } from '../../stores/aiStore'
import { useEditorStore } from '../../stores/editorStore'
import {
  generateCardDescription,
  generateFunFact,
  generateCardStats
} from '../../lib/ai'

interface BatchOptions {
  descriptions: boolean
  funFacts: boolean
  stats: boolean
}

export function BatchGenerate({ onClose }: { onClose: () => void }): JSX.Element {
  const deck = useEditorStore((s) => s.currentDeck)
  const updateCard = useEditorStore((s) => s.updateCard)
  const providers = useAIStore((s) => s.providers)
  const defaults = useAIStore((s) => s.defaults)
  const { setGenerating } = useAIStore()

  const [opts, setOpts] = useState<BatchOptions>({ descriptions: true, funFacts: true, stats: true })
  const [progress, setProgress] = useState(0)
  const [total, setTotal] = useState(0)
  const [running, setRunning] = useState(false)
  const [currentCard, setCurrentCard] = useState('')
  const [errors, setErrors] = useState<string[]>([])

  const handleGenerate = useCallback(async () => {
    if (!deck) return
    const textConfig = providers.find((p) => p.id === defaults.text)
    const statsConfig = providers.find((p) => p.id === defaults.stats)
    if (!textConfig && (opts.descriptions || opts.funFacts)) {
      setErrors(['No text provider configured'])
      return
    }
    if (!statsConfig && opts.stats) {
      setErrors(['No stats provider configured'])
      return
    }

    setRunning(true)
    setGenerating(true, 'Batch generating…')
    setErrors([])
    const cards = deck.cards
    setTotal(cards.length)
    setProgress(0)

    const errs: string[] = []
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i]
      setCurrentCard(card.name)
      setProgress(i)

      try {
        const updates: Record<string, any> = {}
        const aiFlags: Record<string, boolean> = { ...card.aiGenerated }

        if (opts.descriptions && textConfig) {
          updates.description = await generateCardDescription(textConfig, card.name, deck.description)
          aiFlags.description = true
        }
        if (opts.funFacts && textConfig) {
          updates.funFact = await generateFunFact(textConfig, card.name)
          aiFlags.funFact = true
        }
        if (opts.stats && statsConfig && deck.categories.length > 0) {
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
      } catch (e: any) {
        errs.push(`${card.name}: ${e.message}`)
      }
    }

    setProgress(cards.length)
    setErrors(errs)
    setRunning(false)
    setGenerating(false)
    setCurrentCard('')
  }, [deck, opts, providers, defaults])

  if (!deck) return <div />

  const pct = total > 0 ? Math.round((progress / total) * 100) : 0

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }} onClick={(e) => { if (e.target === e.currentTarget && !running) onClose() }}>
      <div style={{
        background: 'var(--bg-primary)', borderRadius: 'var(--radius)', padding: 24,
        width: 420, maxHeight: '80vh', overflow: 'auto'
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

        {running && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, marginBottom: 4 }}>
              {currentCard ? `Processing: ${currentCard}` : 'Starting…'} ({progress}/{total})
            </div>
            <div style={{ height: 6, background: 'var(--bg-tertiary)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${pct}%`, background: 'var(--accent)',
                borderRadius: 3, transition: 'width 0.3s'
              }} />
            </div>
          </div>
        )}

        {errors.length > 0 && (
          <div style={{ marginBottom: 12, padding: 8, background: '#2a1515', borderRadius: 4, fontSize: 11 }}>
            {errors.map((e, i) => <div key={i} style={{ color: '#ff6b6b' }}>⚠ {e}</div>)}
          </div>
        )}

        {progress === total && total > 0 && !running && (
          <div style={{ marginBottom: 12, padding: 8, background: '#152a15', borderRadius: 4, fontSize: 12, color: '#6bff6b' }}>
            ✅ Completed! Generated content for {total} cards.
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button className="btn btn-sm" onClick={onClose} disabled={running}>Cancel</button>
          <button className="btn btn-primary btn-sm" onClick={handleGenerate}
            disabled={running || (!opts.descriptions && !opts.funFacts && !opts.stats)}>
            {running ? '⏳ Generating…' : `✨ Generate for ${deck.cards.length} Cards`}
          </button>
        </div>
      </div>
    </div>
  )
}
