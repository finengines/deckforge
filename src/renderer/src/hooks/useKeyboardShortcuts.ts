import { useEffect, useRef } from 'react'
import { useEditorStore } from '../stores/editorStore'
import type { EditorMode, Layer } from '../types'

/**
 * Check if the event target is an editable element (input, textarea, contenteditable)
 * Prevents keyboard shortcuts from interfering with text editing
 */
const isEditableTarget = (target: EventTarget | null): boolean => {
  if (!target || !(target instanceof HTMLElement)) {
    return false
  }
  if (target.isContentEditable) {
    return true
  }
  const tagName = target.tagName
  if (tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT') {
    return true
  }
  return Boolean(
    target.closest('input, textarea, select, [contenteditable="true"]')
  )
}

export function useKeyboardShortcuts(): void {
  const clipboardRef = useRef<Layer[]>([])
  const spacePressedRef = useRef(false)
  const spacePrevModeRef = useRef<EditorMode | null>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.defaultPrevented) {
        return
      }

      const store = useEditorStore.getState()
      const { selectedLayerIds, currentDeck, editingSide, mode } = store

      // --- Escape: deselect all / exit current mode → select mode ---
      if (e.key === 'Escape') {
        e.preventDefault()
        if (selectedLayerIds.length > 0) {
          store.selectLayers([])
        }
        if (mode !== 'select') {
          store.setMode('select')
        }
        return
      }

      // --- Ctrl/Cmd+A: select all layers ---
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'a') {
        if (isEditableTarget(e.target)) {
          return // Let browser handle select all in input fields
        }
        e.preventDefault()
        if (!currentDeck) return
        const template = editingSide === 'front' ? currentDeck.frontTemplate : currentDeck.backTemplate
        const layers = editingSide === 'back' && template.backLayers !== null
          ? template.backLayers
          : template.frontLayers
        const allVisibleIds = layers.filter(l => l.visible).map(l => l.id)
        if (allVisibleIds.length > 0) {
          store.selectLayers(allVisibleIds)
        }
        return
      }

      // --- Space (hold): temporary pan mode ---
      if (e.code === 'Space') {
        if (e.metaKey || e.ctrlKey || e.altKey) {
          return
        }
        if (isEditableTarget(e.target)) {
          return
        }
        e.preventDefault()
        if (!spacePressedRef.current) {
          spacePressedRef.current = true
          spacePrevModeRef.current = mode
          if (mode !== 'pan') {
            store.setMode('pan')
          }
        }
        return
      }

      // --- Ctrl/Cmd+G: group selected layers ---
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key.toLowerCase() === 'g') {
        if (isEditableTarget(e.target)) {
          return
        }
        if (selectedLayerIds.length > 1) {
          e.preventDefault()
          store.groupLayers(selectedLayerIds)
        }
        return
      }

      // --- Ctrl/Cmd+Shift+G: ungroup selected group ---
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'g') {
        if (isEditableTarget(e.target)) {
          return
        }
        if (selectedLayerIds.length === 1) {
          e.preventDefault()
          store.ungroupLayer(selectedLayerIds[0])
        }
        return
      }

      // --- [ and ]: send backward / bring forward ---
      if (e.key === '[') {
        if (isEditableTarget(e.target)) {
          return
        }
        if (selectedLayerIds.length > 0) {
          e.preventDefault()
          store.sendBackward(selectedLayerIds)
        }
        return
      }

      if (e.key === ']') {
        if (isEditableTarget(e.target)) {
          return
        }
        if (selectedLayerIds.length > 0) {
          e.preventDefault()
          store.bringForward(selectedLayerIds)
        }
        return
      }

      // --- Ctrl/Cmd+[ and Ctrl/Cmd+]: send to back / bring to front ---
      if ((e.metaKey || e.ctrlKey) && e.key === '[') {
        if (isEditableTarget(e.target)) {
          return
        }
        if (selectedLayerIds.length > 0) {
          e.preventDefault()
          store.sendToBack(selectedLayerIds)
        }
        return
      }

      if ((e.metaKey || e.ctrlKey) && e.key === ']') {
        if (isEditableTarget(e.target)) {
          return
        }
        if (selectedLayerIds.length > 0) {
          e.preventDefault()
          store.bringToFront(selectedLayerIds)
        }
        return
      }

      // --- Ctrl/Cmd+0: zoom to fit ---
      if ((e.metaKey || e.ctrlKey) && e.key === '0') {
        e.preventDefault()
        store.zoomToFit()
        return
      }

      // --- Ctrl/Cmd+1: zoom to 100% ---
      if ((e.metaKey || e.ctrlKey) && e.key === '1') {
        e.preventDefault()
        store.setZoom(1)
        return
      }

      // --- Ctrl/Cmd++: zoom in ---
      if ((e.metaKey || e.ctrlKey) && (e.key === '+' || e.key === '=')) {
        e.preventDefault()
        store.zoomIn()
        return
      }

      // --- Ctrl/Cmd+-: zoom out ---
      if ((e.metaKey || e.ctrlKey) && e.key === '-') {
        e.preventDefault()
        store.zoomOut()
        return
      }

      // --- Ctrl/Cmd+L: toggle lock on selected layers ---
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'l') {
        if (isEditableTarget(e.target)) {
          return
        }
        if (selectedLayerIds.length > 0) {
          e.preventDefault()
          store.toggleLockLayers(selectedLayerIds)
        }
        return
      }

      // --- Delete ---
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (isEditableTarget(e.target)) {
          return
        }
        if (selectedLayerIds.length > 0) {
          e.preventDefault()
          for (const id of selectedLayerIds) {
            store.removeLayer(id)
          }
        }
        return
      }

      // --- Undo/Redo ---
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key === 'z') {
        if (isEditableTarget(e.target)) {
          return
        }
        e.preventDefault()
        useEditorStore.temporal.getState().undo()
        return
      }

      if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 'z' || e.key === 'Z')) {
        if (isEditableTarget(e.target)) {
          return
        }
        e.preventDefault()
        useEditorStore.temporal.getState().redo()
        return
      }

      // --- Duplicate ---
      if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
        if (isEditableTarget(e.target)) {
          return
        }
        e.preventDefault()
        if (!currentDeck) return
        
        // Collect all layers to duplicate first
        const template = editingSide === 'front' ? currentDeck.frontTemplate : currentDeck.backTemplate
        const layers = editingSide === 'back' && template.backLayers !== null
          ? template.backLayers
          : template.frontLayers
        
        const layersToDuplicate = layers.filter(l => selectedLayerIds.includes(l.id))
        const newIds: string[] = []
        
        // Duplicate all selected layers
        for (const layer of layersToDuplicate) {
          const clone: Layer = {
            ...JSON.parse(JSON.stringify(layer)),
            id: crypto.randomUUID(),
            name: `${layer.name} (copy)`,
            x: layer.x + 5,
            y: layer.y + 5
          }
          store.addLayer(clone)
          newIds.push(clone.id)
        }
        
        // Select all duplicated layers
        if (newIds.length > 0) {
          store.selectLayers(newIds)
        }
        return
      }

      // --- Copy ---
      if ((e.metaKey || e.ctrlKey) && e.key === 'c') {
        if (isEditableTarget(e.target)) {
          return
        }
        if (selectedLayerIds.length > 0) {
          e.preventDefault()
          if (!currentDeck) return
          const template = editingSide === 'front' ? currentDeck.frontTemplate : currentDeck.backTemplate
          const layers = editingSide === 'back' && template.backLayers !== null
            ? template.backLayers
            : template.frontLayers
          clipboardRef.current = layers.filter((l) => selectedLayerIds.includes(l.id))
        }
        return
      }

      // --- Paste ---
      if ((e.metaKey || e.ctrlKey) && e.key === 'v') {
        if (isEditableTarget(e.target)) {
          return
        }
        if (clipboardRef.current.length > 0) {
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
        }
        return
      }

      // --- Arrow keys: nudge ---
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        if (isEditableTarget(e.target)) {
          return
        }
        if (selectedLayerIds.length > 0) {
          e.preventDefault()
          const amount = e.shiftKey ? store.nudgeLarge : store.nudgeSmall
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
        }
        return
      }

      // --- Tool shortcuts (single key, no modifiers) ---
      // Don't interfere with modifier keys for mode switching
      if (e.metaKey || e.ctrlKey || e.altKey) {
        return
      }

      if (isEditableTarget(e.target)) {
        return
      }

      const key = e.key.toLowerCase()
      const toolMap: Record<string, EditorMode> = {
        v: 'select',
        t: 'text',
        r: 'shape',
        i: 'image',
        h: 'pan',
        z: 'zoom'
      }
      const newMode = toolMap[key]
      if (newMode) {
        e.preventDefault()
        store.setMode(newMode)
        return
      }
    }

    const resetSpaceMode = (): void => {
      if (!spacePressedRef.current) {
        return
      }
      spacePressedRef.current = false
      const previousMode = spacePrevModeRef.current
      spacePrevModeRef.current = null
      if (!previousMode) {
        return
      }
      const currentMode = useEditorStore.getState().mode
      if (currentMode !== previousMode) {
        useEditorStore.getState().setMode(previousMode)
      }
    }

    const handleKeyUp = (e: KeyboardEvent): void => {
      if (e.code === 'Space') {
        e.preventDefault()
        resetSpaceMode()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('blur', resetSpaceMode)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('blur', resetSpaceMode)
    }
  }, [])
}
