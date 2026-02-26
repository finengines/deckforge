import { usePrintStore } from '../../stores/printStore'
import { useEditorStore } from '../../stores/editorStore'

export function ExportView(): JSX.Element {
  const deck = useEditorStore((s) => s.currentDeck)
  const settings = usePrintStore()

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

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={settings.testSheet}
                  onChange={(e) => settings.updateSettings({ testSheet: e.target.checked })}
                />
                Generate test sheet (outlines only)
              </label>
            </div>

            <h3 style={{ fontSize: 13, fontWeight: 600, margin: '16px 0 12px' }}>
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

          <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
            <button className="btn btn-primary" style={{ flex: 1 }}>
              📄 Export {deck.cards.length} Cards
            </button>
          </div>
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
                {deck.cards.length} cards • {deck.dimensions.width}×{deck.dimensions.height}mm
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
