import { v4 as uuid } from 'uuid'
import type { ComponentDefinition, ComponentSlot, Layer } from '../types'

/**
 * Built-in component presets for DeckForge
 * These are SIMPLE, CLEAN, MODERN designs - NOT trying to fake ornate designs with shapes.
 * For professional ornate cards, users should use AI generation or import Photoshop assets.
 */

function id(): string {
  return uuid()
}

// ─── STAT BARS ───────────────────────────────────────────────

const modernStatBar: ComponentDefinition = {
  id: 'preset-modern-stat-bar',
  name: 'Modern Stat Bar',
  description: 'Clean horizontal stat bar with label and value',
  category: 'stat-bar',
  width: 54,
  height: 6,
  layers: [
    // Background bar
    {
      id: id(),
      type: 'shape',
      name: 'Bar Background',
      x: 0,
      y: 0,
      width: 54,
      height: 6,
      rotation: 0,
      opacity: 0.15,
      visible: true,
      locked: true,
      shapeKind: 'rect',
      fill: '#000000',
      stroke: '',
      strokeWidth: 0,
      cornerRadius: 3
    } as Layer
  ],
  slots: [
    {
      id: id(),
      name: 'Label',
      type: 'stat-label',
      bounds: { x: 2, y: 0, width: 25, height: 6 },
      textStyle: {
        fontSize: 2.8,
        fontFamily: 'Inter',
        fontWeight: '600',
        fill: '#333333',
        align: 'left',
        verticalAlign: 'middle'
      }
    },
    {
      id: id(),
      name: 'Value',
      type: 'stat-value',
      bounds: { x: 28, y: 0, width: 24, height: 6 },
      textStyle: {
        fontSize: 3.5,
        fontFamily: 'Inter',
        fontWeight: 'bold',
        fill: '#1a1a1a',
        align: 'right',
        verticalAlign: 'middle'
      }
    },
    {
      id: id(),
      name: 'Fill',
      type: 'stat-bar-fill',
      bounds: { x: 0, y: 0, width: 54, height: 6 },
      minValue: 0,
      maxValue: 100,
      barDirection: 'horizontal',
      textStyle: {
        fill: '#3b82f6'  // Blue fill color
      }
    }
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

const pillStatBar: ComponentDefinition = {
  id: 'preset-pill-stat-bar',
  name: 'Pill Stat Bar',
  description: 'Rounded pill-shaped stat bar',
  category: 'stat-bar',
  width: 54,
  height: 7,
  layers: [
    {
      id: id(),
      type: 'shape',
      name: 'Pill Background',
      x: 0,
      y: 0,
      width: 54,
      height: 7,
      rotation: 0,
      opacity: 0.12,
      visible: true,
      locked: true,
      shapeKind: 'rect',
      fill: '#000000',
      stroke: '',
      strokeWidth: 0,
      cornerRadius: 3.5
    } as Layer
  ],
  slots: [
    {
      id: id(),
      name: 'Label',
      type: 'stat-label',
      bounds: { x: 3, y: 0, width: 24, height: 7 },
      textStyle: {
        fontSize: 2.6,
        fontFamily: 'Inter',
        fontWeight: '600',
        fill: '#1a1a1a',
        align: 'left',
        verticalAlign: 'middle'
      }
    },
    {
      id: id(),
      name: 'Value',
      type: 'stat-value',
      bounds: { x: 28, y: 0, width: 23, height: 7 },
      textStyle: {
        fontSize: 4,
        fontFamily: 'Inter',
        fontWeight: '800',
        fill: '#0066cc',
        align: 'right',
        verticalAlign: 'middle'
      }
    },
    {
      id: id(),
      name: 'Fill',
      type: 'stat-bar-fill',
      bounds: { x: 0, y: 0, width: 54, height: 7 },
      minValue: 0,
      maxValue: 100,
      barDirection: 'horizontal',
      textStyle: {
        fill: '#e0f2ff'  // Light blue tint
      }
    }
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

// ─── TITLE BANNERS ───────────────────────────────────────────

const simpleTitleBar: ComponentDefinition = {
  id: 'preset-simple-title',
  name: 'Simple Title Bar',
  description: 'Clean title bar with centered text',
  category: 'title',
  width: 62,
  height: 12,
  layers: [
    {
      id: id(),
      type: 'shape',
      name: 'Title Background',
      x: 0,
      y: 0,
      width: 62,
      height: 12,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: true,
      shapeKind: 'rect',
      fill: '#1a1a1a',
      stroke: '',
      strokeWidth: 0,
      cornerRadius: 0
    } as Layer
  ],
  slots: [
    {
      id: id(),
      name: 'Title',
      type: 'text',
      bounds: { x: 4, y: 0, width: 54, height: 12 },
      bindTo: 'name',
      textStyle: {
        fontSize: 5,
        fontFamily: 'Inter',
        fontWeight: 'bold',
        fill: '#ffffff',
        align: 'center',
        verticalAlign: 'middle'
      }
    }
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

const gradientTitleBar: ComponentDefinition = {
  id: 'preset-gradient-title',
  name: 'Gradient Title Bar',
  description: 'Title bar with subtle gradient effect (simulated)',
  category: 'title',
  width: 62,
  height: 14,
  layers: [
    {
      id: id(),
      type: 'shape',
      name: 'Gradient Dark',
      x: 0,
      y: 0,
      width: 62,
      height: 14,
      rotation: 0,
      opacity: 0.9,
      visible: true,
      locked: true,
      shapeKind: 'rect',
      fill: '#0f172a',
      stroke: '',
      strokeWidth: 0
    } as Layer,
    {
      id: id(),
      type: 'shape',
      name: 'Gradient Light',
      x: 0,
      y: 10,
      width: 62,
      height: 4,
      rotation: 0,
      opacity: 0.3,
      visible: true,
      locked: true,
      shapeKind: 'rect',
      fill: '#334155',
      stroke: '',
      strokeWidth: 0
    } as Layer
  ],
  slots: [
    {
      id: id(),
      name: 'Title',
      type: 'text',
      bounds: { x: 4, y: 0, width: 54, height: 14 },
      bindTo: 'name',
      textStyle: {
        fontSize: 5.5,
        fontFamily: 'Inter',
        fontWeight: 'bold',
        fill: '#ffffff',
        align: 'center',
        verticalAlign: 'middle'
      }
    }
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

// ─── IMAGE FRAMES ────────────────────────────────────────────

const simpleImageFrame: ComponentDefinition = {
  id: 'preset-simple-frame',
  name: 'Simple Image Frame',
  description: 'Clean rectangular image frame',
  category: 'image-frame',
  width: 54,
  height: 40,
  layers: [
    {
      id: id(),
      type: 'shape',
      name: 'Frame Border',
      x: 0,
      y: 0,
      width: 54,
      height: 40,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: true,
      shapeKind: 'rect',
      fill: '#f5f5f5',
      stroke: '#d0d0d0',
      strokeWidth: 0.3,
      cornerRadius: 2
    } as Layer
  ],
  slots: [
    {
      id: id(),
      name: 'Image',
      type: 'image',
      bounds: { x: 1, y: 1, width: 52, height: 38 },
      bindTo: 'image',
      imageFit: 'cover'
    }
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

const roundedImageFrame: ComponentDefinition = {
  id: 'preset-rounded-frame',
  name: 'Rounded Image Frame',
  description: 'Image frame with rounded corners',
  category: 'image-frame',
  width: 54,
  height: 40,
  layers: [
    {
      id: id(),
      type: 'shape',
      name: 'Frame Border',
      x: 0,
      y: 0,
      width: 54,
      height: 40,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: true,
      shapeKind: 'rect',
      fill: '#ffffff',
      stroke: '#bbb',
      strokeWidth: 0.4,
      cornerRadius: 4
    } as Layer
  ],
  slots: [
    {
      id: id(),
      name: 'Image',
      type: 'image',
      bounds: { x: 1.5, y: 1.5, width: 51, height: 37 },
      bindTo: 'image',
      imageFit: 'cover'
    }
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

// ─── BADGES ──────────────────────────────────────────────────

const numberBadge: ComponentDefinition = {
  id: 'preset-number-badge',
  name: 'Number Badge',
  description: 'Small circular number badge',
  category: 'badge',
  width: 10,
  height: 10,
  layers: [
    {
      id: id(),
      type: 'shape',
      name: 'Circle',
      x: 0,
      y: 0,
      width: 10,
      height: 10,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: true,
      shapeKind: 'circle',
      fill: '#1a1a1a',
      stroke: '#666',
      strokeWidth: 0.3
    } as Layer
  ],
  slots: [
    {
      id: id(),
      name: 'Number',
      type: 'text',
      bounds: { x: 0, y: 0, width: 10, height: 10 },
      defaultValue: '1',
      textStyle: {
        fontSize: 4.5,
        fontFamily: 'Inter',
        fontWeight: 'bold',
        fill: '#ffffff',
        align: 'center',
        verticalAlign: 'middle'
      }
    }
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

const labelBadge: ComponentDefinition = {
  id: 'preset-label-badge',
  name: 'Label Badge',
  description: 'Small pill-shaped label badge',
  category: 'badge',
  width: 18,
  height: 6,
  layers: [
    {
      id: id(),
      type: 'shape',
      name: 'Pill',
      x: 0,
      y: 0,
      width: 18,
      height: 6,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: true,
      shapeKind: 'rect',
      fill: '#3b82f6',
      stroke: '',
      strokeWidth: 0,
      cornerRadius: 3
    } as Layer
  ],
  slots: [
    {
      id: id(),
      name: 'Label',
      type: 'text',
      bounds: { x: 0, y: 0, width: 18, height: 6 },
      defaultValue: 'RARE',
      textStyle: {
        fontSize: 2.5,
        fontFamily: 'Inter',
        fontWeight: 'bold',
        fill: '#ffffff',
        align: 'center',
        verticalAlign: 'middle'
      }
    }
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

// ─── DECORATIONS ─────────────────────────────────────────────

const simpleDivider: ComponentDefinition = {
  id: 'preset-simple-divider',
  name: 'Simple Divider',
  description: 'Clean horizontal divider line',
  category: 'decoration',
  width: 54,
  height: 1,
  layers: [
    {
      id: id(),
      type: 'shape',
      name: 'Line',
      x: 0,
      y: 0,
      width: 54,
      height: 0.5,
      rotation: 0,
      opacity: 0.3,
      visible: true,
      locked: true,
      shapeKind: 'rect',
      fill: '#333333',
      stroke: '',
      strokeWidth: 0
    } as Layer
  ],
  slots: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

const textBlock: ComponentDefinition = {
  id: 'preset-text-block',
  name: 'Text Block',
  description: 'Simple text area for descriptions',
  category: 'decoration',
  width: 54,
  height: 20,
  layers: [
    {
      id: id(),
      type: 'shape',
      name: 'Background',
      x: 0,
      y: 0,
      width: 54,
      height: 20,
      rotation: 0,
      opacity: 0.05,
      visible: true,
      locked: true,
      shapeKind: 'rect',
      fill: '#000000',
      stroke: '',
      strokeWidth: 0,
      cornerRadius: 2
    } as Layer
  ],
  slots: [
    {
      id: id(),
      name: 'Text',
      type: 'text',
      bounds: { x: 2, y: 2, width: 50, height: 16 },
      bindTo: 'description',
      textStyle: {
        fontSize: 2.5,
        fontFamily: 'Inter',
        fontWeight: 'normal',
        fill: '#333333',
        align: 'left',
        verticalAlign: 'top'
      }
    }
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

// ─── EXPORT ──────────────────────────────────────────────────

export const componentPresets: ComponentDefinition[] = [
  modernStatBar,
  pillStatBar,
  simpleTitleBar,
  gradientTitleBar,
  simpleImageFrame,
  roundedImageFrame,
  numberBadge,
  labelBadge,
  simpleDivider,
  textBlock
]

export function getPresetsByCategory(category: ComponentDefinition['category']): ComponentDefinition[] {
  return componentPresets.filter((p) => p.category === category)
}

export function getPresetById(presetId: string): ComponentDefinition | undefined {
  return componentPresets.find((p) => p.id === presetId)
}

export const presetCategories: { key: ComponentDefinition['category']; label: string; icon: string }[] = [
  { key: 'stat-bar', label: 'Stat Bars', icon: '📊' },
  { key: 'title', label: 'Titles', icon: '🏷️' },
  { key: 'image-frame', label: 'Frames', icon: '🖼️' },
  { key: 'badge', label: 'Badges', icon: '🏅' },
  { key: 'decoration', label: 'Decorations', icon: '✨' },
  { key: 'custom', label: 'Custom', icon: '🎨' }
]
