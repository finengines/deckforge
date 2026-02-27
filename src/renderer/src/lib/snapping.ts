import type Konva from 'konva'

const BASE_SNAP_THRESHOLD = 5 // base pixels threshold

export interface SnapConfig {
  /** Snap to grid */
  snapToGrid: boolean
  /** Snap to other elements */
  snapToElements: boolean
  /** Snap to canvas center and edges */
  snapToCanvas: boolean
  /** Grid size in mm */
  gridSize: number
  /** Current zoom level (affects snap threshold) */
  zoom: number
  /** Canvas dimensions in px (for canvas snapping) */
  canvasWidth: number
  canvasHeight: number
}

export function snapToGrid(value: number, gridSize: number): number {
  return Math.round(value / gridSize) * gridSize
}

export interface SnapLine {
  id: string
  direction: 'horizontal' | 'vertical'
  position: number // in canvas coordinates
  start: number
  end: number
  type: 'edge' | 'center' | 'element'
}

interface NodeBounds {
  left: number
  right: number
  top: number
  bottom: number
  centerX: number
  centerY: number
  width: number
  height: number
}

function getNodeBounds(node: Konva.Node): NodeBounds {
  const box = node.getClientRect({ relativeTo: node.getParent() ?? undefined })
  return {
    left: box.x,
    right: box.x + box.width,
    top: box.y,
    bottom: box.y + box.height,
    centerX: box.x + box.width / 2,
    centerY: box.y + box.height / 2,
    width: box.width,
    height: box.height
  }
}

export interface SnapResult {
  x: number | null
  y: number | null
  lines: SnapLine[]
}

/**
 * Get snap lines for a moving node, adapted from Penpot and Onlook
 * Includes canvas-aware snapping (edges, center) and zoom-aware threshold
 */
export function getSnapLines(
  movingNode: Konva.Node,
  allNodes: Konva.Node[],
  config: SnapConfig
): SnapResult {
  const moving = getNodeBounds(movingNode)
  const lines: SnapLine[] = []
  let snapX: number | null = null
  let snapY: number | null = null
  
  // Zoom-aware threshold (like Penpot's snap-accuracy)
  const threshold = BASE_SNAP_THRESHOLD / config.zoom
  
  let minDX = threshold
  let minDY = threshold

  const snapTargets: Array<{
    position: number
    type: 'edge' | 'center' | 'element'
    direction: 'horizontal' | 'vertical'
    bounds?: NodeBounds
  }> = []

  // --- Canvas snap points (if enabled) ---
  if (config.snapToCanvas) {
    const canvasCenterX = config.canvasWidth / 2
    const canvasCenterY = config.canvasHeight / 2

    // Vertical canvas snaps (edges and center)
    snapTargets.push(
      { position: 0, type: 'edge', direction: 'vertical' },
      { position: config.canvasWidth, type: 'edge', direction: 'vertical' },
      { position: canvasCenterX, type: 'center', direction: 'vertical' }
    )

    // Horizontal canvas snaps (edges and center)
    snapTargets.push(
      { position: 0, type: 'edge', direction: 'horizontal' },
      { position: config.canvasHeight, type: 'edge', direction: 'horizontal' },
      { position: canvasCenterY, type: 'center', direction: 'horizontal' }
    )
  }

  // --- Element snap points (if enabled) ---
  if (config.snapToElements) {
    for (const other of allNodes) {
      if (other === movingNode || other.id() === movingNode.id()) continue
      const b = getNodeBounds(other)

      // Vertical snaps (left, right, center)
      snapTargets.push(
        { position: b.left, type: 'element', direction: 'vertical', bounds: b },
        { position: b.right, type: 'element', direction: 'vertical', bounds: b },
        { position: b.centerX, type: 'element', direction: 'vertical', bounds: b }
      )

      // Horizontal snaps (top, bottom, center)
      snapTargets.push(
        { position: b.top, type: 'element', direction: 'horizontal', bounds: b },
        { position: b.bottom, type: 'element', direction: 'horizontal', bounds: b },
        { position: b.centerY, type: 'element', direction: 'horizontal', bounds: b }
      )
    }
  }

  // --- Calculate snaps ---
  const vSnaps: Array<{ offset: number; position: number; target: typeof snapTargets[0] }> = []
  const hSnaps: Array<{ offset: number; position: number; target: typeof snapTargets[0] }> = []

  for (const target of snapTargets) {
    if (target.direction === 'vertical') {
      // Check moving node's left, right, center against this target
      const checks = [
        { edge: moving.left, name: 'left' },
        { edge: moving.right, name: 'right' },
        { edge: moving.centerX, name: 'center' }
      ]
      
      for (const check of checks) {
        const distance = Math.abs(check.edge - target.position)
        if (distance < minDX) {
          const offset = target.position - check.edge
          vSnaps.push({ offset, position: target.position, target })
          minDX = distance
        }
      }
    } else {
      // Horizontal
      const checks = [
        { edge: moving.top, name: 'top' },
        { edge: moving.bottom, name: 'bottom' },
        { edge: moving.centerY, name: 'center' }
      ]
      
      for (const check of checks) {
        const distance = Math.abs(check.edge - target.position)
        if (distance < minDY) {
          const offset = target.position - check.edge
          hSnaps.push({ offset, position: target.position, target })
          minDY = distance
        }
      }
    }
  }

  // --- Apply best snaps ---
  if (vSnaps.length > 0) {
    // Take the best vertical snap (smallest distance)
    vSnaps.sort((a, b) => Math.abs(a.offset) - Math.abs(b.offset))
    const best = vSnaps[0]
    snapX = movingNode.x() + best.offset

    // Create visual line
    const lineExtension = 160
    const start = Math.min(moving.top, best.target.bounds?.top ?? 0) - lineExtension
    const end = Math.max(moving.bottom, best.target.bounds?.bottom ?? config.canvasHeight) + lineExtension

    lines.push({
      id: `v-${best.position}`,
      direction: 'vertical',
      position: best.position,
      start,
      end,
      type: best.target.type
    })
  }

  if (hSnaps.length > 0) {
    // Take the best horizontal snap
    hSnaps.sort((a, b) => Math.abs(a.offset) - Math.abs(b.offset))
    const best = hSnaps[0]
    snapY = movingNode.y() + best.offset

    // Create visual line
    const lineExtension = 160
    const start = Math.min(moving.left, best.target.bounds?.left ?? 0) - lineExtension
    const end = Math.max(moving.right, best.target.bounds?.right ?? config.canvasWidth) + lineExtension

    lines.push({
      id: `h-${best.position}`,
      direction: 'horizontal',
      position: best.position,
      start,
      end,
      type: best.target.type
    })
  }

  return { x: snapX, y: snapY, lines }
}
