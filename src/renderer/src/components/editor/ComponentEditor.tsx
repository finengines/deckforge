import React, { useRef, useState } from 'react'
import { Stage, Layer, Rect, Text, Image as KonvaImage, Transformer } from 'react-konva'
import Konva from 'konva'
import { useComponentStore } from '../../stores/componentStore'
import { useEditorStore } from '../../stores/editorStore'
import { useImage } from '../../hooks/useImage'
import type { ComponentSlot, ComponentSlotType, ComponentDefinition } from '../../types'
import { PROMPT_BANK, formatPrompt, type PromptTemplate } from '../../lib/promptBank'

/** Scale factor: 3px per mm */
const SCREEN_SCALE = 3

const SLOT_TYPE_COLORS: Record<ComponentSlotType, string> = {
  text: '#3b82f6',
  'stat-label': '#f59e0b',
  'stat-value': '#10b981',
  'stat-bar-fill': '#8b5cf6',
  image: '#ec4899'
}

const SLOT_TYPE_LABELS: Record<ComponentSlotType, string> = {
  text: 'Text',
  'stat-label': 'Stat Label',
  'stat-value': 'Stat Value',
  'stat-bar-fill': 'Stat Bar Fill',
  image: 'Image'
}

function SlotNode({
  slot,
  isSelected,
  onSelect,
  onDragEnd,
  onTransformEnd
}: {
  slot: ComponentSlot
  isSelected: boolean
  onSelect: () => void
  onDragEnd: (x: number, y: number) => void
  onTransformEnd: (x: number, y: number, width: number, height: number) => void
}): React.JSX.Element {
  const rectRef = useRef<Konva.Rect>(null)
  const trRef = useRef<Konva.Transformer>(null)

  React.useEffect(() => {
    if (isSelected && trRef.current && rectRef.current) {
      trRef.current.nodes([rectRef.current])
      trRef.current.getLayer()?.batchDraw()
    }
  }, [isSelected])

  return (
    <>
      <Rect
        ref={rectRef}
        x={slot.bounds.x * SCREEN_SCALE}
        y={slot.bounds.y * SCREEN_SCALE}
        width={slot.bounds.width * SCREEN_SCALE}
        height={slot.bounds.height * SCREEN_SCALE}
        fill="transparent"
        stroke={SLOT_TYPE_COLORS[slot.type]}
        strokeWidth={isSelected ? 2 : 1}
        dash={[4, 4]}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={(e) => {
          const node = e.target
          onDragEnd(node.x() / SCREEN_SCALE, node.y() / SCREEN_SCALE)
        }}
        onTransformEnd={() => {
          const node = rectRef.current
          if (!node) return
          const scaleX = node.scaleX()
          const scaleY = node.scaleY()
          node.scaleX(1)
          node.scaleY(1)
          onTransformEnd(
            node.x() / SCREEN_SCALE,
            node.y() / SCREEN_SCALE,
            (node.width() * scaleX) / SCREEN_SCALE,
            (node.height() * scaleY) / SCREEN_SCALE
          )
        }}
      />
      {/* Label */}
      <Text
        x={slot.bounds.x * SCREEN_SCALE + 4}
        y={slot.bounds.y * SCREEN_SCALE + 2}
        text={slot.name}
        fontSize={10}
        fill={SLOT_TYPE_COLORS[slot.type]}
        listening={false}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          rotateEnabled={false}
          borderStroke={SLOT_TYPE_COLORS[slot.type]}
          anchorStroke={SLOT_TYPE_COLORS[slot.type]}
          anchorFill="white"
          anchorSize={8}
        />
      )}
    </>
  )
}

function ComponentCanvas(): React.JSX.Element {
  const stageRef = useRef<Konva.Stage>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const component = useComponentStore((s) => s.currentComponent)
  const selectedSlotIds = useComponentStore((s) => s.selectedSlotIds)
  const selectSlots = useComponentStore((s) => s.selectSlots)
  const updateSlot = useComponentStore((s) => s.updateSlot)
  const [zoom, setZoom] = useState(1)

  const [bgImage] = useImage(component?.backgroundImage)

  // Auto-fit zoom on mount / component change
  React.useEffect(() => {
    if (!component || !containerRef.current) return
    const container = containerRef.current
    const padding = 80
    const availW = container.clientWidth - padding
    const availH = container.clientHeight - padding
    const compW = component.width * SCREEN_SCALE
    const compH = component.height * SCREEN_SCALE
    const fitZoom = Math.min(availW / compW, availH / compH, 4)
    setZoom(Math.max(fitZoom, 0.5))
  }, [component?.width, component?.height])

  if (!component) return <div />

  const canvasWidth = component.width * SCREEN_SCALE
  const canvasHeight = component.height * SCREEN_SCALE

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>): void => {
    if (e.target === e.target.getStage()) {
      selectSlots([])
    }
  }

  const handleWheel = (e: React.WheelEvent): void => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault()
      const delta = e.deltaY > 0 ? 0.9 : 1.1
      setZoom((z) => Math.min(Math.max(z * delta, 0.25), 8))
    }
  }

  return (
    <div
      ref={containerRef}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: '#1a1a1a',
        overflow: 'hidden',
        minWidth: 0
      }}
    >
      {/* Zoom controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 12px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-tertiary)',
        flexShrink: 0
      }}>
        <button className="btn btn-ghost btn-sm" style={{ fontSize: 14, padding: '2px 8px' }} onClick={() => setZoom((z) => Math.max(z * 0.8, 0.25))}>−</button>
        <span style={{ fontSize: 11, color: 'var(--text-secondary)', minWidth: 45, textAlign: 'center' }}>{Math.round(zoom * 100)}%</span>
        <button className="btn btn-ghost btn-sm" style={{ fontSize: 14, padding: '2px 8px' }} onClick={() => setZoom((z) => Math.min(z * 1.2, 8))}>+</button>
        <button className="btn btn-ghost btn-sm" style={{ fontSize: 10 }} onClick={() => setZoom(1)}>100%</button>
        <button className="btn btn-ghost btn-sm" style={{ fontSize: 10 }} onClick={() => {
          if (!containerRef.current) return
          const p = 80
          const fitZ = Math.min((containerRef.current.clientWidth - p) / canvasWidth, (containerRef.current.clientHeight - p) / canvasHeight, 4)
          setZoom(Math.max(fitZ, 0.5))
        }}>Fit</button>
      </div>

      {/* Canvas area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'auto',
          padding: 40
        }}
        onWheel={handleWheel}
      >
        <div
          style={{
            background: '#2a2a2a',
            borderRadius: 8,
            padding: 16,
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            transform: `scale(${zoom})`,
            transformOrigin: 'center center'
          }}
        >
          <Stage ref={stageRef} width={canvasWidth} height={canvasHeight} onClick={handleStageClick}>
            <Layer>
              <Rect x={0} y={0} width={canvasWidth} height={canvasHeight} fill={bgImage ? 'transparent' : '#ffffff'} stroke="#666" strokeWidth={1} />
              {bgImage && <KonvaImage x={0} y={0} width={canvasWidth} height={canvasHeight} image={bgImage} />}
              {component.slots.map((slot) => (
                <SlotNode
                  key={slot.id}
                  slot={slot}
                  isSelected={selectedSlotIds.includes(slot.id)}
                  onSelect={() => selectSlots([slot.id])}
                  onDragEnd={(x, y) => updateSlot(slot.id, { bounds: { ...slot.bounds, x, y } })}
                  onTransformEnd={(x, y, width, height) => updateSlot(slot.id, { bounds: { x, y, width, height } })}
                />
              ))}
            </Layer>
          </Stage>
        </div>
      </div>
    </div>
  )
}

function SlotListSidebar(): React.JSX.Element {
  const component = useComponentStore((s) => s.currentComponent)
  const selectedSlotIds = useComponentStore((s) => s.selectedSlotIds)
  const selectSlots = useComponentStore((s) => s.selectSlots)
  const removeSlot = useComponentStore((s) => s.removeSlot)
  const addSlot = useComponentStore((s) => s.addSlot)

  if (!component) return <div />

  const handleAddSlot = (type: ComponentSlotType): void => {
    addSlot({
      name: `${SLOT_TYPE_LABELS[type]} ${component.slots.length + 1}`,
      type,
      bounds: { x: 5, y: 5, width: 20, height: 6 },
      textStyle: type === 'text' || type === 'stat-label' || type === 'stat-value'
        ? { fontSize: 3, fontFamily: 'Inter', fill: '#000000', align: 'left', verticalAlign: 'middle' }
        : undefined
    })
  }

  return (
    <div style={{ width: 200, flexShrink: 0, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
      <div className="panel-header">Slots</div>
      <div style={{ padding: 8, borderBottom: '1px solid var(--border)' }}>
        <button
          className="btn btn-sm"
          style={{ width: '100%', marginBottom: 4 }}
          onClick={() => handleAddSlot('text')}
        >
          + Text Slot
        </button>
        <button
          className="btn btn-sm"
          style={{ width: '100%', marginBottom: 4 }}
          onClick={() => handleAddSlot('stat-label')}
        >
          + Stat Label
        </button>
        <button
          className="btn btn-sm"
          style={{ width: '100%', marginBottom: 4 }}
          onClick={() => handleAddSlot('stat-value')}
        >
          + Stat Value
        </button>
        <button
          className="btn btn-sm"
          style={{ width: '100%', marginBottom: 4 }}
          onClick={() => handleAddSlot('stat-bar-fill')}
        >
          + Stat Bar Fill
        </button>
        <button
          className="btn btn-sm"
          style={{ width: '100%' }}
          onClick={() => handleAddSlot('image')}
        >
          + Image Slot
        </button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
        {component.slots.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: 11, textAlign: 'center', padding: 16 }}>
            No slots yet. Click a button above to add one.
          </div>
        ) : (
          component.slots.map((slot) => (
            <div
              key={slot.id}
              style={{
                padding: 8,
                marginBottom: 4,
                background: selectedSlotIds.includes(slot.id) ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
                border: `1px solid ${selectedSlotIds.includes(slot.id) ? SLOT_TYPE_COLORS[slot.type] : 'var(--border)'}`,
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 11
              }}
              onClick={() => selectSlots([slot.id])}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 2,
                      background: SLOT_TYPE_COLORS[slot.type]
                    }}
                  />
                  <span style={{ fontWeight: 600 }}>{slot.name}</span>
                </div>
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ padding: 2, fontSize: 10 }}
                  onClick={(e) => {
                    e.stopPropagation()
                    removeSlot(slot.id)
                  }}
                >
                  ✕
                </button>
              </div>
              <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>
                {SLOT_TYPE_LABELS[slot.type]}
                {slot.bindTo && ` • ${slot.bindTo}`}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function SlotPropertiesSidebar(): React.JSX.Element {
  const component = useComponentStore((s) => s.currentComponent)
  const selectedSlotIds = useComponentStore((s) => s.selectedSlotIds)
  const updateSlot = useComponentStore((s) => s.updateSlot)
  const deck = useEditorStore((s) => s.currentDeck)

  if (!component) return <div />

  const selectedSlot = selectedSlotIds.length === 1
    ? component.slots.find((sl) => sl.id === selectedSlotIds[0])
    : undefined

  if (!selectedSlot) {
    return (
      <div style={{ width: 200, borderLeft: '1px solid var(--border)', flexShrink: 0 }}>
        <div className="panel-header">Slot Properties</div>
        <div style={{ padding: 16, color: 'var(--text-muted)', fontSize: 11 }}>
          Select a slot to edit
        </div>
      </div>
    )
  }

  const update = (updates: Partial<ComponentSlot>): void => {
    updateSlot(selectedSlot.id, updates)
  }

  return (
    <div style={{ width: 240, flexShrink: 0, borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
      <div className="panel-header">Slot Properties</div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
        <div className="form-group">
          <label className="input-label">Name</label>
          <input
            className="input"
            value={selectedSlot.name}
            onChange={(e) => update({ name: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="input-label">Type</label>
          <select
            className="input"
            value={selectedSlot.type}
            onChange={(e) => update({ type: e.target.value as ComponentSlotType })}
          >
            {Object.entries(SLOT_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="input-label">Data Binding</label>
          <select
            className="input"
            value={selectedSlot.bindTo || '__none__'}
            onChange={(e) => update({ bindTo: e.target.value === '__none__' ? undefined : e.target.value })}
          >
            <option value="__none__">None</option>
            <option value="name">Card Name</option>
            <option value="description">Description</option>
            <option value="funFact">Fun Fact</option>
            <option value="image">Card Image</option>
            {deck?.categories.map((cat) => (
              <React.Fragment key={cat.id}>
                <option value={`stat:${cat.id}`}>{cat.name} (value)</option>
                <option value={`stat-label:${cat.id}`}>{cat.name} (label)</option>
              </React.Fragment>
            ))}
          </select>
        </div>

        {(selectedSlot.type === 'text' || selectedSlot.type === 'stat-label' || selectedSlot.type === 'stat-value') && (
          <>
            <div style={{ fontSize: 10, fontWeight: 600, marginTop: 16, marginBottom: 8, color: 'var(--text-muted)' }}>
              TEXT STYLE
            </div>
            <div className="form-group">
              <label className="input-label">Font Size (mm)</label>
              <input
                className="input"
                type="number"
                value={selectedSlot.textStyle?.fontSize || 3}
                onChange={(e) => update({
                  textStyle: { ...selectedSlot.textStyle, fontSize: parseFloat(e.target.value) || 3 }
                })}
              />
            </div>
            <div className="form-group">
              <label className="input-label">Font Family</label>
              <input
                className="input"
                value={selectedSlot.textStyle?.fontFamily || 'Inter'}
                onChange={(e) => update({
                  textStyle: { ...selectedSlot.textStyle, fontFamily: e.target.value }
                })}
              />
            </div>
            <div className="form-group">
              <label className="input-label">Color</label>
              <input
                className="input"
                type="color"
                value={selectedSlot.textStyle?.fill || '#000000'}
                onChange={(e) => update({
                  textStyle: { ...selectedSlot.textStyle, fill: e.target.value }
                })}
              />
            </div>
            <div className="form-group">
              <label className="input-label">Align</label>
              <select
                className="input"
                value={selectedSlot.textStyle?.align || 'left'}
                onChange={(e) => update({
                  textStyle: { ...selectedSlot.textStyle, align: e.target.value as 'left' | 'center' | 'right' }
                })}
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
          </>
        )}

        {selectedSlot.type === 'stat-bar-fill' && (
          <>
            <div style={{ fontSize: 10, fontWeight: 600, marginTop: 16, marginBottom: 8, color: 'var(--text-muted)' }}>
              BAR SETTINGS
            </div>
            <div className="form-group">
              <label className="input-label">Direction</label>
              <select
                className="input"
                value={selectedSlot.barDirection || 'horizontal'}
                onChange={(e) => update({ barDirection: e.target.value as 'horizontal' | 'vertical' })}
              >
                <option value="horizontal">Horizontal</option>
                <option value="vertical">Vertical</option>
              </select>
            </div>
            <div className="form-group">
              <label className="input-label">Min Value</label>
              <input
                className="input"
                type="number"
                value={selectedSlot.minValue || 0}
                onChange={(e) => update({ minValue: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="form-group">
              <label className="input-label">Max Value</label>
              <input
                className="input"
                type="number"
                value={selectedSlot.maxValue || 100}
                onChange={(e) => update({ maxValue: parseFloat(e.target.value) || 100 })}
              />
            </div>
          </>
        )}

        {selectedSlot.type === 'image' && (
          <>
            <div style={{ fontSize: 10, fontWeight: 600, marginTop: 16, marginBottom: 8, color: 'var(--text-muted)' }}>
              IMAGE SETTINGS
            </div>
            <div className="form-group">
              <label className="input-label">Fit</label>
              <select
                className="input"
                value={selectedSlot.imageFit || 'cover'}
                onChange={(e) => update({ imageFit: e.target.value as 'cover' | 'contain' | 'fill' })}
              >
                <option value="cover">Cover</option>
                <option value="contain">Contain</option>
                <option value="fill">Fill</option>
              </select>
            </div>
          </>
        )}

        <div style={{ fontSize: 10, fontWeight: 600, marginTop: 16, marginBottom: 8, color: 'var(--text-muted)' }}>
          POSITION & SIZE
        </div>
        <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div className="form-group">
            <label className="input-label">X (mm)</label>
            <input
              className="input"
              type="number"
              value={selectedSlot.bounds.x.toFixed(1)}
              onChange={(e) => update({
                bounds: { ...selectedSlot.bounds, x: parseFloat(e.target.value) || 0 }
              })}
            />
          </div>
          <div className="form-group">
            <label className="input-label">Y (mm)</label>
            <input
              className="input"
              type="number"
              value={selectedSlot.bounds.y.toFixed(1)}
              onChange={(e) => update({
                bounds: { ...selectedSlot.bounds, y: parseFloat(e.target.value) || 0 }
              })}
            />
          </div>
        </div>
        <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div className="form-group">
            <label className="input-label">Width (mm)</label>
            <input
              className="input"
              type="number"
              value={selectedSlot.bounds.width.toFixed(1)}
              onChange={(e) => update({
                bounds: { ...selectedSlot.bounds, width: parseFloat(e.target.value) || 1 }
              })}
            />
          </div>
          <div className="form-group">
            <label className="input-label">Height (mm)</label>
            <input
              className="input"
              type="number"
              value={selectedSlot.bounds.height.toFixed(1)}
              onChange={(e) => update({
                bounds: { ...selectedSlot.bounds, height: parseFloat(e.target.value) || 1 }
              })}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function ComponentEditorToolbar(): React.JSX.Element {
  const component = useComponentStore((s) => s.currentComponent)
  const updateComponent = useComponentStore((s) => s.updateComponent)
  const setBackgroundImage = useComponentStore((s) => s.setBackgroundImage)
  const setDimensions = useComponentStore((s) => s.setDimensions)
  const closeComponent = useComponentStore((s) => s.closeComponent)
  const deck = useEditorStore((s) => s.currentDeck)

  if (!component) return <div />

  const handleLoadImage = (): void => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/jpeg,image/png,image/webp,image/svg+xml'
    input.onchange = () => {
      const file = input.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = () => {
        setBackgroundImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
    input.click()
  }

  const handleSaveToLibrary = (): void => {
    if (!deck) return
    // Add component to deck's component library
    const updatedComponents = [...deck.components]
    const existingIndex = updatedComponents.findIndex((c) => c.id === component.id)
    if (existingIndex >= 0) {
      updatedComponents[existingIndex] = component
    } else {
      updatedComponents.push(component)
    }
    // TODO: Update deck in store
    alert('Component saved to library!')
    closeComponent()
  }

  return (
    <div
      style={{
        height: 56,
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: 12
      }}
    >
      <button className="btn btn-ghost btn-sm" onClick={closeComponent} title="Back to editor">
        ← Back
      </button>
      <div style={{ width: 1, height: 24, background: 'var(--border)' }} />
      
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12 }}>
        <input
          className="input"
          style={{ width: 200 }}
          value={component.name}
          onChange={(e) => updateComponent({ name: e.target.value })}
          placeholder="Component Name"
        />
        <select
          className="input"
          style={{ width: 140 }}
          value={component.category}
          onChange={(e) => updateComponent({ category: e.target.value as any })}
        >
          <option value="stat-bar">Stat Bar</option>
          <option value="title">Title</option>
          <option value="image-frame">Image Frame</option>
          <option value="badge">Badge</option>
          <option value="decoration">Decoration</option>
          <option value="custom">Custom</option>
        </select>
        
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <label className="input-label" style={{ fontSize: 10 }}>W:</label>
          <input
            className="input"
            style={{ width: 50 }}
            type="number"
            value={component.width}
            onChange={(e) => setDimensions(parseFloat(e.target.value) || 10, component.height)}
          />
          <label className="input-label" style={{ fontSize: 10 }}>H:</label>
          <input
            className="input"
            style={{ width: 50 }}
            type="number"
            value={component.height}
            onChange={(e) => setDimensions(component.width, parseFloat(e.target.value) || 10)}
          />
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>mm</span>
        </div>
      </div>

      <button className="btn btn-sm" onClick={handleLoadImage}>
        🖼 Load Background
      </button>
      <button className="btn btn-sm btn-primary" onClick={handleSaveToLibrary}>
        💾 Save to Library
      </button>
    </div>
  )
}

function ComponentLibraryView(): React.JSX.Element {
  const deck = useEditorStore((s) => s.currentDeck)
  const createComponent = useComponentStore((s) => s.createComponent)
  const loadComponent = useComponentStore((s) => s.loadComponent)
  const [selectedCategory, setSelectedCategory] = useState<ComponentDefinition['category']>('stat-bar')

  if (!deck) return <div />

  const categories: { key: ComponentDefinition['category']; label: string; icon: string }[] = [
    { key: 'stat-bar', label: 'Stat Bars', icon: '📊' },
    { key: 'title', label: 'Titles', icon: '🏷️' },
    { key: 'image-frame', label: 'Frames', icon: '🖼️' },
    { key: 'badge', label: 'Badges', icon: '🏅' },
    { key: 'decoration', label: 'Decorations', icon: '✨' },
    { key: 'custom', label: 'Custom', icon: '🎨' }
  ]

  const components = deck.components.filter((c) => c.category === selectedCategory)

  const handleNewComponent = (): void => {
    createComponent(`New ${selectedCategory}`, selectedCategory)
  }

  const handleDeleteComponent = (id: string): void => {
    if (!confirm('Delete this component?')) return
    // TODO: Remove from deck.components
    alert('Component deleted')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{
        height: 56,
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        justifyContent: 'space-between'
      }}>
        <h2 style={{ fontSize: 16, fontWeight: 700 }}>🧩 Component Library</h2>
        <button className="btn btn-primary btn-sm" onClick={handleNewComponent}>
          + New Component
        </button>
      </div>

      {/* Category tabs */}
      <div style={{
        display: 'flex',
        gap: 4,
        padding: 12,
        borderBottom: '1px solid var(--border)',
        flexWrap: 'wrap'
      }}>
        {categories.map((cat) => (
          <button
            key={cat.key}
            className={`btn btn-sm ${selectedCategory === cat.key ? 'btn-active' : ''}`}
            onClick={() => setSelectedCategory(cat.key)}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {/* Component grid */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        {components.length === 0 ? (
          <div style={{
            textAlign: 'center',
            color: 'var(--text-muted)',
            padding: 40
          }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🌟</div>
            <div style={{ fontSize: 13, marginBottom: 8 }}>No {selectedCategory} components yet</div>
            <div style={{ fontSize: 11, marginBottom: 16 }}>
              Create custom components with images + smart slots
            </div>
            <button className="btn btn-sm btn-primary" onClick={handleNewComponent}>
              + Create First Component
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 12
          }}>
            {components.map((comp) => (
              <div
                key={comp.id}
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  padding: 12,
                  background: 'var(--bg-secondary)',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s'
                }}
                onClick={() => loadComponent(comp)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)'
                }}
              >
                {/* Thumbnail */}
                <div style={{
                  width: '100%',
                  height: 100,
                  background: comp.backgroundImage ? `url(${comp.backgroundImage}) center/cover` : 'var(--bg-tertiary)',
                  borderRadius: 4,
                  marginBottom: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)',
                  fontSize: 24
                }}>
                  {!comp.backgroundImage && '🧩'}
                </div>
                
                {/* Info */}
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                  {comp.name}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 8 }}>
                  {comp.slots.length} slot{comp.slots.length !== 1 ? 's' : ''}
                  {' • '}
                  {comp.width}×{comp.height}mm
                </div>
                
                {/* Actions */}
                <div style={{ display: 'flex', gap: 4 }}>
                  <button
                    className="btn btn-sm btn-ghost"
                    style={{ flex: 1, fontSize: 10 }}
                    onClick={(e) => {
                      e.stopPropagation()
                      loadComponent(comp)
                    }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    className="btn btn-sm btn-ghost"
                    style={{ fontSize: 10 }}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteComponent(comp.id)
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function PromptBankDialog({ onClose }: { onClose: () => void }): React.JSX.Element {
  const [selectedCat, setSelectedCat] = useState(PROMPT_BANK[0]?.id ?? '')
  const [themeColor, setThemeColor] = useState('blue')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const category = PROMPT_BANK.find((c) => c.id === selectedCat)

  const handleCopy = (template: PromptTemplate): void => {
    const prompt = formatPrompt(template, { THEME_COLOR: themeColor })
    navigator.clipboard.writeText(prompt)
    setCopiedId(template.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)'
    }} onClick={onClose}>
      <div style={{
        background: 'var(--bg-secondary)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', width: '90%', maxWidth: 800,
        maxHeight: '85vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
      }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding: 16, borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700 }}>🎨 AI Prompt Templates</h2>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
              Copy a prompt, paste into your image generator (Midjourney, DALL-E, Flux, etc.), then import the result
            </p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>

        {/* Theme color picker */}
        <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Theme color:</span>
          {['blue', 'red', 'green', 'purple', 'gold', 'orange', 'teal', 'silver', 'black'].map((c) => (
            <button
              key={c}
              onClick={() => setThemeColor(c)}
              style={{
                width: 20, height: 20, borderRadius: 4,
                border: themeColor === c ? '2px solid var(--accent)' : '1px solid var(--border)',
                background: c === 'gold' ? '#d4a843' : c === 'silver' ? '#999' : c,
                cursor: 'pointer'
              }}
            />
          ))}
          <input
            className="input"
            style={{ width: 80, fontSize: 11 }}
            value={themeColor}
            onChange={(e) => setThemeColor(e.target.value)}
            placeholder="custom..."
          />
        </div>

        <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          {/* Category sidebar */}
          <div style={{ width: 180, borderRight: '1px solid var(--border)', overflowY: 'auto', padding: 8 }}>
            {PROMPT_BANK.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat.id)}
                style={{
                  width: '100%', textAlign: 'left', padding: '8px 10px',
                  fontSize: 12, borderRadius: 4, border: 'none', cursor: 'pointer',
                  background: selectedCat === cat.id ? 'var(--accent-muted)' : 'transparent',
                  color: selectedCat === cat.id ? 'var(--accent)' : 'var(--text-primary)',
                  fontWeight: selectedCat === cat.id ? 600 : 400, marginBottom: 2
                }}
              >
                {cat.icon} {cat.name}
                <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>
                  {cat.templates.length} templates
                </div>
              </button>
            ))}
          </div>

          {/* Templates list */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
            {category?.templates.map((tmpl) => {
              const formattedPrompt = formatPrompt(tmpl, { THEME_COLOR: themeColor })
              return (
                <div key={tmpl.id} style={{
                  border: '1px solid var(--border)', borderRadius: 8,
                  padding: 12, marginBottom: 12, background: 'var(--bg-tertiary)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{tmpl.name}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                        {tmpl.description} • {tmpl.dimensions.width}×{tmpl.dimensions.height}px
                      </div>
                    </div>
                    <button
                      className="btn btn-sm"
                      style={{
                        fontSize: 11, flexShrink: 0,
                        background: copiedId === tmpl.id ? 'var(--success)' : 'var(--accent)',
                        color: 'white', border: 'none'
                      }}
                      onClick={() => handleCopy(tmpl)}
                    >
                      {copiedId === tmpl.id ? '✅ Copied!' : '📋 Copy Prompt'}
                    </button>
                  </div>
                  <div style={{
                    fontSize: 11, color: 'var(--text-secondary)',
                    background: 'var(--bg-primary)', padding: 8, borderRadius: 4,
                    fontFamily: 'monospace', lineHeight: 1.5,
                    wordBreak: 'break-word'
                  }}>
                    {formattedPrompt}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export function ComponentEditor(): React.JSX.Element {
  const component = useComponentStore((s) => s.currentComponent)
  const [showPrompts, setShowPrompts] = useState(false)

  if (!component) {
    return <ComponentLibraryView />
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <ComponentEditorToolbar />
      {/* AI Prompts button bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '4px 16px', borderBottom: '1px solid var(--border)',
        background: 'var(--bg-tertiary)', flexShrink: 0
      }}>
        <button className="btn btn-sm" onClick={() => setShowPrompts(true)} style={{ fontSize: 11 }}>
          🎨 AI Prompt Templates
        </button>
        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
          Generate component images with AI → Load Background → Add Slots
        </span>
      </div>
      <div style={{ display: 'flex', flex: '1 1 0px', overflow: 'hidden', minHeight: 0, minWidth: 0 }}>
        <SlotListSidebar />
        <ComponentCanvas />
        <SlotPropertiesSidebar />
      </div>
      {showPrompts && <PromptBankDialog onClose={() => setShowPrompts(false)} />}
    </div>
  )
}
