import { useEffect, useRef } from 'react'
import { useEditorStore } from '../stores/editorStore'
import type { EditorMode, Layer } from '../types'

const NUDGE_SMALL = 1  // mm
const NUDGE_LARGE = 10 // mm

export function useKeyboardShortcuts(): void {
  const clipboardRef = useRef<Layer[]>([])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't intercept when typing in inputs
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      const ctrl = e.ctrlKey || e.metaKey
      const shift = e.shiftKey
      const store = useEditorStore.getState()
      const { selectedLayerIds, currentDeck, editingSide } = store

      // --- Delete ---
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault()
        for (const id of selectedLayerIds) {
          store.removeLayer(id)
        }
        return
      }

      // --- Undo/Redo ---
      if (ctrl && !shift && e.key === 'z') {
        e.preventDefault()
        useEditorStore.temporal.getState().undo()
        return
      }
      if (ctrl && shift && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault()
        useEditorStore.temporal.getState().redo()
        return
      }

      // --- Duplicate ---
      if (ctrl && e.key === 'd') {
        e.preventDefault()
        for (const id of selectedLayerIds) {
          store.duplicateLayer(id)
        }
        return
      }

      // --- Copy ---
      if (ctrl && e.key === 'c') {
        e.preventDefault()
        if (!currentDeck) return
        const template = editingSide === 'front' ? currentDeck.frontTemplate : currentDeck.backTemplate
        const layers = editingSide === 'back' && template.backLayers !== null
          ? template.backLayers
          : template.frontLayers
        clipboardRef.current = layers.filter((l) => selectedLayerIds.includes(l.id))
        return
      }

      // --- Paste ---
      if (ctrl && e.key === 'v') {
        e.preventDefault()
        for (const layer of clipboardRef.current) {
          const clone: Layer = {
            ...JSON.parse(JSON.stringify(layer)),
            id: crypto.randomUUID(),
            name: `${layer.name} (copy)`,
            x: layer.x + 5,
            y: layer.y + 5
          }
          store.addLayer(clone)
        }
        return
      }

      // --- Arrow keys: nudge ---
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault()
        const amount = shift ? NUDGE_LARGE : NUDGE_SMALL
        const dx = e.key === 'ArrowLeft' ? -amount : e.key === 'ArrowRight' ? amount : 0
        const dy = e.key === 'ArrowUp' ? -amount : e.key === 'ArrowDown' ? amount : 0
        if (!currentDeck) return
        const template = editingSide === 'front' ? currentDeck.frontTemplate : currentDeck.backTemplate
        const nudgeLayers = editingSide === 'back' && template.backLayers !== null
          ? template.backLayers
          : template.frontLayers
        for (const id of selectedLayerIds) {
          const layer = nudgeLayers.find((l) => l.id === id)
          if (layer) {
            store.updateLayer(id, { x: layer.x + dx, y: layer.y + dy })
          }
        }
        return
      }

      // --- Tool shortcuts (single key, no modifiers) ---
      if (!ctrl && !shift && !e.altKey) {
        const toolMap: Record<string, EditorMode> = {
          v: 'select',
          t: 'text',
          r: 'shape',
          i: 'image',
          h: 'pan'
        }
        const mode = toolMap[e.key.toLowerCase()]
        if (mode) {
          e.preventDefault()
          store.setMode(mode)
          return
        }
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])
}
