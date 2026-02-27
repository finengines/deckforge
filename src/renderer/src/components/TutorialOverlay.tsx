import React, { useState, useCallback, useEffect } from 'react'
import { useEditorStore } from '../stores/editorStore'

interface TutorialStep {
  id: string
  title: string
  description: string
  target?: string // CSS selector or area name
  position: 'top' | 'bottom' | 'left' | 'right' | 'center'
  highlight?: string // area to highlight
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    title: '🃏 Welcome to DeckForge!',
    description: 'DeckForge helps you create professional Top Trumps card games. Let\'s walk through the basics.',
    position: 'center'
  },
  {
    id: 'base-template',
    title: '📐 Base Template',
    description: 'This canvas is your Base Template — the master design for ALL cards in your deck. Any layers you add here appear on every card. Think of it like a mail-merge template.',
    position: 'center',
    highlight: 'canvas'
  },
  {
    id: 'tools',
    title: '🔧 Design Tools',
    description: 'Use the toolbar to add Text (T), Shapes (R), and Images (I) to your template. You can also press these keyboard shortcuts directly.',
    position: 'bottom',
    highlight: 'toolbar'
  },
  {
    id: 'data-binding',
    title: '🔗 Data Binding — The Key Feature',
    description: 'Select any layer and open Properties → Data Binding. Bind text layers to "Card Name", "Description", stats, etc. Bound layers automatically show each card\'s data!',
    position: 'left',
    highlight: 'right-panel'
  },
  {
    id: 'cards',
    title: '🃏 Cards Panel (Left)',
    description: 'Add cards in the left panel. Each card uses the Base Template but shows its own data in bound layers. Click a card to preview its data on the canvas.',
    position: 'right',
    highlight: 'left-panel'
  },
  {
    id: 'card-preview',
    title: '👁 Preview Cards',
    description: 'Use the card selector in the toolbar (next to "Base Template") to switch which card\'s data you\'re previewing. Unbound layers stay the same across all cards.',
    position: 'bottom',
    highlight: 'toolbar'
  },
  {
    id: 'data-view',
    title: '📊 Data View',
    description: 'Switch to the Data tab to manage card data in a spreadsheet-like view. Import CSV files to bulk-add cards. Each row becomes a card.',
    position: 'center'
  },
  {
    id: 'categories',
    title: '🎯 Stat Categories',
    description: 'In Settings, define stat categories (Speed, Power, etc.) with min/max ranges. These are the stats players compare in Top Trumps!',
    position: 'center'
  },
  {
    id: 'components',
    title: '🧩 Components & Assets',
    description: 'The right panel has tabs for Layers, Properties, Components, and Assets. Use ◀ ▶ arrows to navigate between them. Components are reusable design elements.',
    position: 'left',
    highlight: 'right-panel'
  },
  {
    id: 'shortcuts',
    title: '⌨️ Keyboard Shortcuts',
    description: 'Key shortcuts: Delete/Backspace = delete, Ctrl+G = group, Ctrl+Z = undo, Ctrl+D = duplicate, Space (hold) = pan, [ ] = layer order. Arrow keys nudge selected layers.',
    position: 'center'
  },
  {
    id: 'export',
    title: '📤 Export & Print',
    description: 'When your deck is ready, go to the Export tab to generate print-ready PDFs or images. Check the Score tab to analyze card balance.',
    position: 'center'
  },
  {
    id: 'done',
    title: '✅ You\'re Ready!',
    description: 'Start by adding a few cards, designing your template, and binding data fields. You can restart this tutorial anytime from Settings. Have fun creating!',
    position: 'center'
  }
]

const TUTORIAL_STORAGE_KEY = 'deckforge-tutorial-completed'

export function TutorialOverlay(): React.JSX.Element | null {
  const [active, setActive] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const currentDeck = useEditorStore((s) => s.currentDeck)

  // Auto-show on first use
  useEffect(() => {
    if (currentDeck && !localStorage.getItem(TUTORIAL_STORAGE_KEY)) {
      // Small delay so the UI renders first
      const timer = setTimeout(() => setActive(true), 500)
      return () => clearTimeout(timer)
    }
  }, [currentDeck])

  const handleNext = useCallback(() => {
    if (stepIndex < TUTORIAL_STEPS.length - 1) {
      setStepIndex((i) => i + 1)
    } else {
      setActive(false)
      localStorage.setItem(TUTORIAL_STORAGE_KEY, 'true')
    }
  }, [stepIndex])

  const handlePrev = useCallback(() => {
    setStepIndex((i) => Math.max(0, i - 1))
  }, [])

  const handleSkip = useCallback(() => {
    setActive(false)
    localStorage.setItem(TUTORIAL_STORAGE_KEY, 'true')
  }, [])

  if (!active) return null

  const step = TUTORIAL_STEPS[stepIndex]
  const isFirst = stepIndex === 0
  const isLast = stepIndex === TUTORIAL_STEPS.length - 1

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(2px)'
    }}>
      {/* Tutorial card */}
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: 24,
        maxWidth: 480,
        width: '90%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        position: 'relative'
      }}>
        {/* Progress bar */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: 'var(--bg-tertiary)',
          borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            width: `${((stepIndex + 1) / TUTORIAL_STEPS.length) * 100}%`,
            background: 'var(--accent)',
            transition: 'width 0.3s ease'
          }} />
        </div>

        {/* Step counter */}
        <div style={{
          fontSize: 10,
          color: 'var(--text-muted)',
          marginBottom: 12
        }}>
          Step {stepIndex + 1} of {TUTORIAL_STEPS.length}
        </div>

        {/* Title */}
        <h3 style={{
          fontSize: 16,
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: 8
        }}>
          {step.title}
        </h3>

        {/* Description */}
        <p style={{
          fontSize: 13,
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
          marginBottom: 20
        }}>
          {step.description}
        </p>

        {/* Buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <button
            onClick={handleSkip}
            style={{
              fontSize: 11,
              color: 'var(--text-muted)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '4px 8px'
            }}
          >
            Skip Tutorial
          </button>

          <div style={{ display: 'flex', gap: 8 }}>
            {!isFirst && (
              <button
                onClick={handlePrev}
                className="btn btn-sm btn-ghost"
                style={{ fontSize: 12 }}
              >
                ← Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="btn btn-sm"
              style={{
                fontSize: 12,
                background: 'var(--accent)',
                color: 'white',
                border: 'none',
                padding: '6px 16px',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              {isLast ? '✅ Get Started' : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/** Restart tutorial — call this from Settings */
export function resetTutorial(): void {
  localStorage.removeItem(TUTORIAL_STORAGE_KEY)
}
