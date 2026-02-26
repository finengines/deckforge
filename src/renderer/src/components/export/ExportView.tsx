import React from "react"
import { useState, useCallback } from 'react'
import { usePrintStore } from '../../stores/printStore'
import { useEditorStore } from '../../stores/editorStore'
import { generatePDF, generateTestSheet, type GeneratePDFProgress } from '../../lib/pdf'
import { exportAllCards } from '../../lib/renderer'

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function downloadBytes(bytes: Uint8Array, filename: string): void {
  // Copy to a plain ArrayBuffer to avoid SharedArrayBuffer TS issues
  const ab = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer
  downloadBlob(new Blob([ab], { type: 'application/pdf' }), filename)
}

export function ExportView(): React.JSX.Element {
  const deck = useEditorStore((s) => s.currentDeck)
  const settings = usePrintStore()

  const [exporting, setExporting] = useState(false)
  const [progress, setProgress] = useState('')
  const [error, setError] = useState('')

  const handleExportPDF = useCallback(async () => {
    if (!deck) return
    setExporting(true)
    setError('')
    try {
      const bytes = await generatePDF(deck, settings, (p: GeneratePDFProgress) => {
        if (p.phase === 'rendering') {
          setProgress(`Rendering cards… ${p.current + 1}/${p.total}`)
        } else {
          setProgress(`Composing pages… ${p.current + 1}/${p.total}`)
        }
      })
      downloadBytes(bytes, `${deck.name}.pdf`)
      setProgress('✅ PDF exported!')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setExporting(false)
    }
  }, [deck, settings])

  const handleExportImages = useCallback(async () => {
    if (!deck) return
    setExporting(true)
    setError('')
    try {
      const format = settings.format === 'jpeg' ? 'jpeg' : 'png'
      const blobs = await exportAllCards(deck, format, settings.dpi, (cur, tot) => {
        setProgress(`Exporting card ${cur + 1}/${tot}…`)
      })
      // Download each
      for (let i = 0; i < blobs.length; i++) {
        const card = deck.cards[i]
        const ext = format === 'jpeg' ? 'jpg' : 'png'
        downloadBlob(blobs[i], `${card.name.replace(/[^a-zA-Z0-9]/g, '_')}_front.${ext}`)
      }
      setProgress(`✅ Exported ${blobs.length} card images!`)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setExporting(false)
    }
  }, [deck, settings])

  const handleTestSheet = useCallback(async () => {
    if (!deck) return
    setExporting(true)
    setError('')
    try {
      setProgress('Generating test sheet…')
      const bytes = await generateTestSheet(settings, deck.dimensions)
      downloadBytes(bytes, `${deck.name}_test_sheet.pdf`)
      setProgress('✅ Test sheet exported!')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setExporting(false)
    }
  }, [deck, settings])

  if (!deck) return <div />

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>🖨️ Export & Print</h2>

      <div style={{ display: 'flex', gap: 24 }}>
        {/* Settings */}
        <div style={{ width: 320 }}>
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius)', padding: 16 }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Paper Settings</h3>

            <div className="form-group">
              <label className="input-label">Paper Size</label>
              <select
                className="input"
                value={settings.paperSize}
                onChange={(e) => settings.updateSettings({ paperSize: e.target.value as any })}
              >
                <option value="a4">A4 (210 × 297mm)</option>
                <option value="a3">A3 (297 × 420mm)</option>
                <option value="letter">Letter (216 × 279mm)</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div className="form-group">
              <label className="input-label">Orientation</label>
              <div className="form-row">
                <button
                  className={`btn btn-sm ${settings.orientation === 'portrait' ? 'btn-active' : ''}`}
                  onClick={() => settings.updateSettings({ orientation: 'portrait' })}
                  style={{ flex: 1 }}
                >
                  Portrait
                </button>
                <button
                  className={`btn btn-sm ${settings.orientation === 'landscape' ? 'btn-active' : ''}`}
                  onClick={() => settings.updateSettings({ orientation: 'landscape' })}
                  style={{ flex: 1 }}
                >
                  Landscape
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="input-label">Format</label>
              <select
                className="input"
                value={settings.format}
                onChange={(e) => settings.updateSettings({ format: e.target.value as any })}
              >
                <option value="pdf">PDF</option>
                <option value="png">PNG (per card)</option>
                <option value="jpeg">JPEG (per card)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="input-label">DPI</label>
              <select
                className="input"
                value={settings.dpi}
                onChange={(e) => settings.updateSettings({ dpi: parseInt(e.target.value) })}
              >
                <option value="150">150 (draft)</option>
                <option value="300">300 (standard)</option>
                <option value="600">600 (high quality)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="input-label">Card Spacing (mm)</label>
              <input
                className="input"
                type="number"
                min={0}
                max={20}
                value={settings.cardSpacing}
                onChange={(e) => settings.updateSettings({ cardSpacing: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={settings.trimMarks}
                  onChange={(e) => settings.updateSettings({ trimMarks: e.target.checked })}
                />
                Show trim marks
              </label>
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={settings.showBleed}
                  onChange={(e) => settings.updateSettings({ showBleed: e.target.checked })}
                />
                Show bleed area
              </label>
            </div>

            <div className="section-divider" />
            <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>
              Print Alignment (mm)
            </h3>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>
              Adjust front/back offset to align double-sided prints
            </p>

            <div className="form-group">
              <label className="input-label">Front Offset</label>
              <div className="form-row">
                <input
                  className="input"
                  type="number"
                  step={0.5}
                  value={settings.frontOffset.x}
                  onChange={(e) =>
                    settings.setFrontOffset({ ...settings.frontOffset, x: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="X"
                />
                <input
                  className="input"
                  type="number"
                  step={0.5}
                  value={settings.frontOffset.y}
                  onChange={(e) =>
                    settings.setFrontOffset({ ...settings.frontOffset, y: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="Y"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="input-label">Back Offset</label>
              <div className="form-row">
                <input
                  className="input"
                  type="number"
                  step={0.5}
                  value={settings.backOffset.x}
                  onChange={(e) =>
                    settings.setBackOffset({ ...settings.backOffset, x: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="X"
                />
                <input
                  className="input"
                  type="number"
                  step={0.5}
                  value={settings.backOffset.y}
                  onChange={(e) =>
                    settings.setBackOffset({ ...settings.backOffset, y: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="Y"
                />
              </div>
            </div>

            <button className="btn btn-sm" onClick={settings.resetOffsets} style={{ marginBottom: 16 }}>
              Reset Offsets
            </button>
          </div>

          {/* Action buttons */}
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button className="btn btn-primary" onClick={handleExportPDF} disabled={exporting}>
              📄 Export Cards as PDF <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>{deck.cards.length}</span>
            </button>
            <button className="btn" onClick={handleExportImages} disabled={exporting}>
              🖼️ Export All Cards as Images
            </button>
            <button className="btn" onClick={handleTestSheet} disabled={exporting}>
              📐 Generate Test Sheet
            </button>
          </div>

          <div className="section-divider" />

          {/* Progress / Error */}
          {progress && (
            <div style={{
              padding: 10, background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius)', fontSize: 12
            }}>
              <div style={{ marginBottom: 6 }}>{progress}</div>
              {exporting && (
                <div className="progress-bar">
                  <div className="progress-bar-fill" style={{ width: '60%' }} />
                </div>
              )}
            </div>
          )}
          {error && (
            <div style={{
              marginTop: 12, padding: 10, background: '#2a1515',
              borderRadius: 'var(--radius)', fontSize: 12, color: '#ff6b6b'
            }}>
              ⚠ {error}
            </div>
          )}
        </div>

        {/* Preview */}
        <div style={{ flex: 1 }}>
          <div
            style={{
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius)',
              padding: 16,
              minHeight: 400,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)'
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📄</div>
              <p>Print preview will appear here</p>
              <p style={{ fontSize: 11, marginTop: 4 }}>
                {deck.cards.length} cards • {deck.dimensions.width}×{deck.dimensions.height}mm •{' '}
                {settings.dpi} DPI
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
