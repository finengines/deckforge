import type Konva from 'konva'

const SNAP_THRESHOLD = 5 // pixels

export function snapToGrid(value: number, gridSize: number): number {
  return Math.round(value / gridSize) * gridSize
}

export interface SnapLine {
  direction: 'horizontal' | 'vertical'
  position: number
}

interface NodeBounds {
  left: number
  right: number
  top: number
  bottom: number
  centerX: number
  centerY: number
}

function getNodeBounds(node: Konva.Node): NodeBounds {
  const box = node.getClientRect({ relativeTo: node.getParent() ?? undefined })
  return {
    left: box.x,
    right: box.x + box.width,
    top: box.y,
    bottom: box.y + box.height,
    centerX: box.x + box.width / 2,
    centerY: box.y + box.height / 2
  }
}

export interface SnapResult {
  x: number | null
  y: number | null
  lines: SnapLine[]
}

export function getSnapLines(movingNode: Konva.Node, allNodes: Konva.Node[]): SnapResult {
  const moving = getNodeBounds(movingNode)
  const lines: SnapLine[] = []
  let snapX: number | null = null
  let snapY: number | null = null
  let minDX = SNAP_THRESHOLD
  let minDY = SNAP_THRESHOLD

  for (const other of allNodes) {
    if (other === movingNode || other.id() === movingNode.id()) continue
    const b = getNodeBounds(other)

    // Vertical snaps (x-axis alignment)
    const vChecks = [
      { moving: moving.left, target: b.left },
      { moving: moving.left, target: b.right },
      { moving: moving.right, target: b.left },
      { moving: moving.right, target: b.right },
      { moving: moving.centerX, target: b.centerX }
    ]
    for (const { moving: m, target: t } of vChecks) {
      const d = Math.abs(m - t)
      if (d < minDX) {
        minDX = d
        snapX = movingNode.x() + (t - m)
        // We'll add the line at the target position
      }
    }

    // Horizontal snaps (y-axis alignment)
    const hChecks = [
      { moving: moving.top, target: b.top },
      { moving: moving.top, target: b.bottom },
      { moving: moving.bottom, target: b.top },
      { moving: moving.bottom, target: b.bottom },
      { moving: moving.centerY, target: b.centerY }
    ]
    for (const { moving: m, target: t } of hChecks) {
      const d = Math.abs(m - t)
      if (d < minDY) {
        minDY = d
        snapY = movingNode.y() + (t - m)
      }
    }
  }

  // Rebuild lines based on final snap positions
  if (snapX !== null) {
    // Recalculate the snapped moving bounds
    const dx = snapX - movingNode.x()
    const snappedLeft = moving.left + dx
    const snappedRight = moving.right + dx
    const snappedCX = moving.centerX + dx
    for (const other of allNodes) {
      if (other === movingNode || other.id() === movingNode.id()) continue
      const b = getNodeBounds(other)
      for (const pos of [b.left, b.right, b.centerX]) {
        if (
          Math.abs(snappedLeft - pos) < 1 ||
          Math.abs(snappedRight - pos) < 1 ||
          Math.abs(snappedCX - pos) < 1
        ) {
          lines.push({ direction: 'vertical', position: pos })
        }
      }
    }
  }

  if (snapY !== null) {
    const dy = snapY - movingNode.y()
    const snappedTop = moving.top + dy
    const snappedBottom = moving.bottom + dy
    const snappedCY = moving.centerY + dy
    for (const other of allNodes) {
      if (other === movingNode || other.id() === movingNode.id()) continue
      const b = getNodeBounds(other)
      for (const pos of [b.top, b.bottom, b.centerY]) {
        if (
          Math.abs(snappedTop - pos) < 1 ||
          Math.abs(snappedBottom - pos) < 1 ||
          Math.abs(snappedCY - pos) < 1
        ) {
          lines.push({ direction: 'horizontal', position: pos })
        }
      }
    }
  }

  return { x: snapX, y: snapY, lines }
}
