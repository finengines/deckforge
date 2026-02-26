import React, { useState, useCallback } from 'react'
import { parseCSV, suggestMapping, type ColumnMapping, type ParsedCSV } from '../../lib/csvImport'
import { deserializeDeck } from '../../lib/deckFile'
import { useEditorStore } from '../../stores/editorStore'
import type { Deck } from '../../types'

interface ImportDialogProps {
  onClose: () => void
}

type ImportMode = 'merge' | 'replace'

export function ImportDialog({ onClose }: ImportDialogProps): React.JSX.Element {
  const [parsed, setParsed] = useState<ParsedCSV | null>(null)
  const [mapping, setMapping] = useState<ColumnMapping>({})
  const [importMode, setImportMode] = useState<ImportMode>('merge')
  const [fileType, setFileType] = useState<'csv' | 'json' | null>(null)
  const [jsonDeck, setJsonDeck] = useState<Deck | null>(null)
  const [error, setError] = useState('')

  const deck = useEditorStore((s) => s.currentDeck)
  const addCard = useEditorStore((s) => s.addCard)
  const removeCard = useEditorStore((s) => s.removeCard)
  const loadDeck = useEditorStore((s) => s.loadDeck)
  const addCategory = useEditorStore((s) => s.addCategory)

  const handleFileSelect = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.csv,.json,.deckforge'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      setError('')
      const text = await file.text()

      if (file.name.endsWith('.csv')) {
        setFileType('csv')
        const result = parseCSV(text)
        if (result.headers.length === 0) {
          setError('No data found in CSV file')
          return
        }
        setParsed(result)
        const suggested = suggestMapping(result.headers, result.rows)
        setMapping(suggested.mapping)
      } else if (file.name.endsWith('.json') || file.name.endsWith('.deckforge')) {
        setFileType('json')
        try {
          let importedDeck: Deck
          if (file.name.endsWith('.deckforge')) {
            importedDeck = deserializeDeck(text)
          } else {
            importedDeck = JSON.parse(text)
          }
          if (!importedDeck.cards || !Array.isArray(importedDeck.cards)) {
            setError('Invalid deck JSON: missing cards array')
            return
          }
          setJsonDeck(importedDeck)
        } catch {
          setError('Failed to parse JSON file')
        }
      } else {
        setError('Unsupported file type')
      }
    }
    input.click()
  }, [])

  const handleImportCSV = useCallback(() => {
    if (!parsed || !deck) return

    // Clear existing cards if replacing
    if (importMode === 'replace') {
      for (const card of [...deck.cards]) {
        removeCard(card.id)
      }
    }

    // Determine stat columns and ensure categories exist
    const statColumns: { header: string; categoryId: string }[] = []
    for (const [header, role] of Object.entries(mapping)) {
      if (role === 'stat') {
        // Find or create category
        let cat = deck.categories.find((c) => c.name.toLowerCase() === header.toLowerCase())
        if (!cat) {
          addCategory({ name: header, min: 0, max: 100, higherIsBetter: true })
          // Re-read — addCategory is sync via immer
          const updatedDeck = useEditorStore.getState().currentDeck
          cat = updatedDeck?.categories.find((c) => c.name.toLowerCase() === header.toLowerCase())
        }
        if (cat) {
          statColumns.push({ header, categoryId: cat.id })
        }
      }
    }

    // Find mapped columns
    const nameCol = Object.entries(mapping).find(([, v]) => v === 'name')?.[0]
    const descCol = Object.entries(mapping).find(([, v]) => v === 'description')?.[0]
    const funFactCol = Object.entries(mapping).find(([, v]) => v === 'funFact')?.[0]
    const imageCol = Object.entries(mapping).find(([, v]) => v === 'image')?.[0]

    for (const row of parsed.rows) {
      const stats: Record<string, number> = {}
      for (const sc of statColumns) {
        const val = Number(row[sc.header])
        if (!isNaN(val)) stats[sc.categoryId] = val
      }

      addCard({
        name: nameCol ? row[nameCol] || 'Untitled' : 'Untitled',
        description: descCol ? row[descCol] : undefined,
        funFact: funFactCol ? row[funFactCol] : undefined,
        image: imageCol ? row[imageCol] : undefined,
        stats
      })
    }

    onClose()
  }, [parsed, deck, mapping, importMode, addCard, removeCard, addCategory, onClose])

  const handleImportJSON = useCallback(() => {
    if (!jsonDeck) return

    if (importMode === 'replace') {
      loadDeck(jsonDeck)
    } else if (deck) {
      // Merge: add cards from imported deck
      for (const card of jsonDeck.cards) {
        addCard({ ...card })
      }
    }

    onClose()
  }, [jsonDeck, importMode, deck, loadDeck, addCard, onClose])

  const fieldOptions: { value: ColumnMapping[string]; label: string }[] = [
    { value: 'name', label: 'Card Name' },
    { value: 'description', label: 'Description' },
    { value: 'funFact', label: 'Fun Fact' },
    { value: 'image', label: 'Image' },
    { value: 'stat', label: 'Stat' },
    { value: 'skip', label: 'Skip' }
  ]

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-lg)',
          padding: 24,
          width: 700,
          maxHeight: '80vh',
          overflow: 'auto',
          border: '1px solid var(--border)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>📥 Import Cards</h2>

        {/* Mode toggle */}
        <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
          <label style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
            <input
              type="radio"
              checked={importMode === 'merge'}
              onChange={() => setImportMode('merge')}
            />
            Merge (add to existing)
          </label>
          <label style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
            <input
              type="radio"
              checked={importMode === 'replace'}
              onChange={() => setImportMode('replace')}
            />
            Replace (clear existing)
          </label>
        </div>

        {/* File picker */}
        {!parsed && !jsonDeck && (
          <div style={{ textAlign: 'center', padding: 32 }}>
            <button className="btn btn-primary" onClick={handleFileSelect}>
              📁 Choose File (.csv, .json, .deckforge)
            </button>
          </div>
        )}

        {error && (
          <div style={{ color: 'var(--danger)', fontSize: 12, marginBottom: 12 }}>⚠ {error}</div>
        )}

        {/* CSV mapping */}
        {fileType === 'csv' && parsed && (
          <>
            <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Column Mapping</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {parsed.headers.map((h) => (
                <div
                  key={h}
                  style={{
                    background: 'var(--bg-tertiary)',
                    padding: '4px 8px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 12,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <span style={{ fontWeight: 500 }}>{h}</span>
                  <span style={{ color: 'var(--text-muted)' }}>→</span>
                  <select
                    className="input"
                    value={mapping[h] ?? 'skip'}
                    onChange={(e) =>
                      setMapping((m) => ({ ...m, [h]: e.target.value as ColumnMapping[string] }))
                    }
                    style={{ width: 110 }}
                  >
                    {fieldOptions.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            {/* Preview */}
            <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
              Preview ({Math.min(5, parsed.rows.length)} of {parsed.rows.length} rows)
            </h3>
            <div style={{ overflowX: 'auto', marginBottom: 16 }}>
              <table className="data-table" style={{ fontSize: 11 }}>
                <thead>
                  <tr>
                    {parsed.headers
                      .filter((h) => mapping[h] !== 'skip')
                      .map((h) => (
                        <th key={h} style={{ padding: '4px 8px', background: 'var(--bg-tertiary)' }}>
                          {h}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {parsed.rows.slice(0, 5).map((row, i) => (
                    <tr key={i}>
                      {parsed.headers
                        .filter((h) => mapping[h] !== 'skip')
                        .map((h) => (
                          <td key={h} style={{ padding: '4px 8px' }}>
                            {row[h]}
                          </td>
                        ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn" onClick={onClose}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleImportCSV}>
                Import {parsed.rows.length} Cards
              </button>
            </div>
          </>
        )}

        {/* JSON preview */}
        {fileType === 'json' && jsonDeck && (
          <>
            <div style={{ fontSize: 13, marginBottom: 16 }}>
              <p>
                <strong>{jsonDeck.name}</strong> — {jsonDeck.cards.length} cards
              </p>
              {jsonDeck.description && (
                <p style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{jsonDeck.description}</p>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn" onClick={onClose}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleImportJSON}>
                Import {jsonDeck.cards.length} Cards
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
