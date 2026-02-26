import { v4 as uuid } from 'uuid'
import type { CardTemplate, Layer } from '../types'

function id(): string {
  return uuid()
}

const now = new Date().toISOString()

// ─── 1. Classic Top Trumps ───────────────────────────────────────
const classicTopTrumps: CardTemplate = {
  id: 'builtin-classic-top-trumps',
  name: 'Classic Top Trumps',
  description: 'Traditional Top Trumps layout with header bar, image area, and stat rows.',
  thumbnail: undefined,
  tags: ['classic', 'top-trumps', 'stats'],
  builtIn: true,
  createdAt: now,
  updatedAt: now,
  backLayers: null,
  frontLayers: [
    // Background
    {
      id: id(), type: 'shape', name: 'Background', x: 0, y: 0, width: 62, height: 100,
      rotation: 0, opacity: 1, visible: true, locked: true,
      shapeKind: 'rect', fill: '#1a1a2e', stroke: '', strokeWidth: 0, cornerRadius: 3
    } as Layer,
    // Header bar
    {
      id: id(), type: 'shape', name: 'Header Bar', x: 0, y: 0, width: 62, height: 14,
      rotation: 0, opacity: 1, visible: true, locked: false,
      shapeKind: 'rect', fill: '#e94560', stroke: '', strokeWidth: 0, cornerRadius: 0
    } as Layer,
    // Card name
    {
      id: id(), type: 'text', name: 'Card Name', x: 3, y: 2, width: 56, height: 10,
      rotation: 0, opacity: 1, visible: true, locked: false, bindTo: 'name',
      text: '{{name}}', fontSize: 5, fontFamily: 'Inter, sans-serif', fontWeight: 'bold',
      fontStyle: 'normal', fill: '#ffffff', align: 'center', verticalAlign: 'middle',
      lineHeight: 1.2, letterSpacing: 0, textDecoration: ''
    } as Layer,
    // Image area
    {
      id: id(), type: 'image', name: 'Card Image', x: 3, y: 16, width: 56, height: 36,
      rotation: 0, opacity: 1, visible: true, locked: false, bindTo: 'image',
      src: '', fit: 'cover' as const,
      filters: { brightness: 100, contrast: 100, saturation: 100, blur: 0, grayscale: false }
    } as Layer,
    // Divider
    {
      id: id(), type: 'shape', name: 'Divider', x: 3, y: 54, width: 56, height: 0.5,
      rotation: 0, opacity: 0.6, visible: true, locked: true,
      shapeKind: 'rect', fill: '#e94560', stroke: '', strokeWidth: 0
    } as Layer,
    // Stat labels area (row 1)
    {
      id: id(), type: 'text', name: 'Stat 1 Label', x: 4, y: 57, width: 30, height: 6,
      rotation: 0, opacity: 1, visible: true, locked: false,
      text: 'Speed', fontSize: 3.2, fontFamily: 'Inter, sans-serif', fontWeight: 'normal',
      fontStyle: 'normal', fill: '#cccccc', align: 'left', verticalAlign: 'middle',
      lineHeight: 1, letterSpacing: 0, textDecoration: ''
    } as Layer,
    {
      id: id(), type: 'text', name: 'Stat 1 Value', x: 36, y: 57, width: 22, height: 6,
      rotation: 0, opacity: 1, visible: true, locked: false,
      text: '85', fontSize: 4, fontFamily: 'Inter, sans-serif', fontWeight: 'bold',
      fontStyle: 'normal', fill: '#ffffff', align: 'right', verticalAlign: 'middle',
      lineHeight: 1, letterSpacing: 0, textDecoration: ''
    } as Layer,
    // Stat row 2
    {
      id: id(), type: 'text', name: 'Stat 2 Label', x: 4, y: 64, width: 30, height: 6,
      rotation: 0, opacity: 1, visible: true, locked: false,
      text: 'Power', fontSize: 3.2, fontFamily: 'Inter, sans-serif', fontWeight: 'normal',
      fontStyle: 'normal', fill: '#cccccc', align: 'left', verticalAlign: 'middle',
      lineHeight: 1, letterSpacing: 0, textDecoration: ''
    } as Layer,
    {
      id: id(), type: 'text', name: 'Stat 2 Value', x: 36, y: 64, width: 22, height: 6,
      rotation: 0, opacity: 1, visible: true, locked: false,
      text: '72', fontSize: 4, fontFamily: 'Inter, sans-serif', fontWeight: 'bold',
      fontStyle: 'normal', fill: '#ffffff', align: 'right', verticalAlign: 'middle',
      lineHeight: 1, letterSpacing: 0, textDecoration: ''
    } as Layer,
    // Stat row 3
    {
      id: id(), type: 'text', name: 'Stat 3 Label', x: 4, y: 71, width: 30, height: 6,
      rotation: 0, opacity: 1, visible: true, locked: false,
      text: 'Skill', fontSize: 3.2, fontFamily: 'Inter, sans-serif', fontWeight: 'normal',
      fontStyle: 'normal', fill: '#cccccc', align: 'left', verticalAlign: 'middle',
      lineHeight: 1, letterSpacing: 0, textDecoration: ''
    } as Layer,
    {
      id: id(), type: 'text', name: 'Stat 3 Value', x: 36, y: 71, width: 22, height: 6,
      rotation: 0, opacity: 1, visible: true, locked: false,
      text: '90', fontSize: 4, fontFamily: 'Inter, sans-serif', fontWeight: 'bold',
      fontStyle: 'normal', fill: '#ffffff', align: 'right', verticalAlign: 'middle',
      lineHeight: 1, letterSpacing: 0, textDecoration: ''
    } as Layer,
    // Bottom bar
    {
      id: id(), type: 'shape', name: 'Bottom Bar', x: 0, y: 90, width: 62, height: 10,
      rotation: 0, opacity: 1, visible: true, locked: true,
      shapeKind: 'rect', fill: '#16213e', stroke: '', strokeWidth: 0
    } as Layer,
    {
      id: id(), type: 'text', name: 'Footer Text', x: 3, y: 92, width: 56, height: 6,
      rotation: 0, opacity: 1, visible: true, locked: false,
      text: 'TOP TRUMPS', fontSize: 2.5, fontFamily: 'Inter, sans-serif', fontWeight: 'bold',
      fontStyle: 'normal', fill: '#e94560', align: 'center', verticalAlign: 'middle',
      lineHeight: 1, letterSpacing: 2, textDecoration: ''
    } as Layer
  ]
}

// ─── 2. Modern Minimal ──────────────────────────────────────────
const modernMinimal: CardTemplate = {
  id: 'builtin-modern-minimal',
  name: 'Modern Minimal',
  description: 'Clean white design with centered image and subtle stat display.',
  thumbnail: undefined,
  tags: ['modern', 'minimal', 'clean'],
  builtIn: true,
  createdAt: now,
  updatedAt: now,
  backLayers: null,
  frontLayers: [
    {
      id: id(), type: 'shape', name: 'Background', x: 0, y: 0, width: 62, height: 100,
      rotation: 0, opacity: 1, visible: true, locked: true,
      shapeKind: 'rect', fill: '#fafafa', stroke: '#e0e0e0', strokeWidth: 0.3, cornerRadius: 3
    } as Layer,
    {
      id: id(), type: 'text', name: 'Card Name', x: 4, y: 4, width: 54, height: 8,
      rotation: 0, opacity: 1, visible: true, locked: false, bindTo: 'name',
      text: '{{name}}', fontSize: 4.5, fontFamily: 'Inter, sans-serif', fontWeight: '300',
      fontStyle: 'normal', fill: '#222222', align: 'left', verticalAlign: 'top',
      lineHeight: 1.2, letterSpacing: 0.5, textDecoration: ''
    } as Layer,
    {
      id: id(), type: 'shape', name: 'Accent Line', x: 4, y: 13, width: 12, height: 0.4,
      rotation: 0, opacity: 1, visible: true, locked: true,
      shapeKind: 'rect', fill: '#2196F3', stroke: '', strokeWidth: 0
    } as Layer,
    {
      id: id(), type: 'image', name: 'Card Image', x: 8, y: 18, width: 46, height: 40,
      rotation: 0, opacity: 1, visible: true, locked: false, bindTo: 'image',
      src: '', fit: 'contain' as const,
      filters: { brightness: 100, contrast: 100, saturation: 100, blur: 0, grayscale: false }
    } as Layer,
    {
      id: id(), type: 'text', name: 'Description', x: 4, y: 62, width: 54, height: 8,
      rotation: 0, opacity: 1, visible: true, locked: false, bindTo: 'description',
      text: '{{description}}', fontSize: 2.5, fontFamily: 'Inter, sans-serif', fontWeight: 'normal',
      fontStyle: 'italic', fill: '#888888', align: 'center', verticalAlign: 'top',
      lineHeight: 1.4, letterSpacing: 0, textDecoration: ''
    } as Layer,
    {
      id: id(), type: 'text', name: 'Stat Row', x: 4, y: 74, width: 54, height: 20,
      rotation: 0, opacity: 1, visible: true, locked: false,
      text: 'SPD 85  ·  PWR 72  ·  SKL 90', fontSize: 2.8, fontFamily: 'Inter, sans-serif',
      fontWeight: '500', fontStyle: 'normal', fill: '#444444', align: 'center',
      verticalAlign: 'top', lineHeight: 2, letterSpacing: 0.3, textDecoration: ''
    } as Layer
  ]
}

// ─── 3. Bold Stats ──────────────────────────────────────────────
const boldStats: CardTemplate = {
  id: 'builtin-bold-stats',
  name: 'Bold Stats',
  description: 'Large numbers, vibrant colors, and prominent stat bars.',
  thumbnail: undefined,
  tags: ['bold', 'colorful', 'stats'],
  builtIn: true,
  createdAt: now,
  updatedAt: now,
  backLayers: null,
  frontLayers: [
    {
      id: id(), type: 'shape', name: 'Background', x: 0, y: 0, width: 62, height: 100,
      rotation: 0, opacity: 1, visible: true, locked: true,
      shapeKind: 'rect', fill: '#0d0d0d', stroke: '', strokeWidth: 0, cornerRadius: 3
    } as Layer,
    {
      id: id(), type: 'shape', name: 'Top Accent', x: 0, y: 0, width: 62, height: 3,
      rotation: 0, opacity: 1, visible: true, locked: true,
      shapeKind: 'rect', fill: '#FF6B35', stroke: '', strokeWidth: 0
    } as Layer,
    {
      id: id(), type: 'image', name: 'Card Image', x: 3, y: 6, width: 25, height: 25,
      rotation: 0, opacity: 1, visible: true, locked: false, bindTo: 'image',
      src: '', fit: 'cover' as const,
      filters: { brightness: 100, contrast: 100, saturation: 100, blur: 0, grayscale: false }
    } as Layer,
    {
      id: id(), type: 'text', name: 'Card Name', x: 31, y: 6, width: 28, height: 14,
      rotation: 0, opacity: 1, visible: true, locked: false, bindTo: 'name',
      text: '{{name}}', fontSize: 5, fontFamily: 'Inter, sans-serif', fontWeight: 'bold',
      fontStyle: 'normal', fill: '#ffffff', align: 'left', verticalAlign: 'top',
      lineHeight: 1.1, letterSpacing: 0, textDecoration: ''
    } as Layer,
    // Stat bar backgrounds + values
    {
      id: id(), type: 'shape', name: 'Stat Bar 1 BG', x: 4, y: 38, width: 54, height: 5,
      rotation: 0, opacity: 1, visible: true, locked: true,
      shapeKind: 'rect', fill: '#1a1a1a', stroke: '', strokeWidth: 0, cornerRadius: 1
    } as Layer,
    {
      id: id(), type: 'shape', name: 'Stat Bar 1 Fill', x: 4, y: 38, width: 46, height: 5,
      rotation: 0, opacity: 0.9, visible: true, locked: false,
      shapeKind: 'rect', fill: '#FF6B35', stroke: '', strokeWidth: 0, cornerRadius: 1
    } as Layer,
    {
      id: id(), type: 'text', name: 'Stat 1', x: 5, y: 38, width: 50, height: 5,
      rotation: 0, opacity: 1, visible: true, locked: false,
      text: 'SPEED  85', fontSize: 3, fontFamily: 'Inter, sans-serif', fontWeight: 'bold',
      fontStyle: 'normal', fill: '#ffffff', align: 'left', verticalAlign: 'middle',
      lineHeight: 1, letterSpacing: 1, textDecoration: ''
    } as Layer,
    {
      id: id(), type: 'shape', name: 'Stat Bar 2 BG', x: 4, y: 46, width: 54, height: 5,
      rotation: 0, opacity: 1, visible: true, locked: true,
      shapeKind: 'rect', fill: '#1a1a1a', stroke: '', strokeWidth: 0, cornerRadius: 1
    } as Layer,
    {
      id: id(), type: 'shape', name: 'Stat Bar 2 Fill', x: 4, y: 46, width: 39, height: 5,
      rotation: 0, opacity: 0.9, visible: true, locked: false,
      shapeKind: 'rect', fill: '#00C9A7', stroke: '', strokeWidth: 0, cornerRadius: 1
    } as Layer,
    {
      id: id(), type: 'text', name: 'Stat 2', x: 5, y: 46, width: 50, height: 5,
      rotation: 0, opacity: 1, visible: true, locked: false,
      text: 'POWER  72', fontSize: 3, fontFamily: 'Inter, sans-serif', fontWeight: 'bold',
      fontStyle: 'normal', fill: '#ffffff', align: 'left', verticalAlign: 'middle',
      lineHeight: 1, letterSpacing: 1, textDecoration: ''
    } as Layer,
    {
      id: id(), type: 'shape', name: 'Stat Bar 3 BG', x: 4, y: 54, width: 54, height: 5,
      rotation: 0, opacity: 1, visible: true, locked: true,
      shapeKind: 'rect', fill: '#1a1a1a', stroke: '', strokeWidth: 0, cornerRadius: 1
    } as Layer,
    {
      id: id(), type: 'shape', name: 'Stat Bar 3 Fill', x: 4, y: 54, width: 49, height: 5,
      rotation: 0, opacity: 0.9, visible: true, locked: false,
      shapeKind: 'rect', fill: '#845EC2', stroke: '', strokeWidth: 0, cornerRadius: 1
    } as Layer,
    {
      id: id(), type: 'text', name: 'Stat 3', x: 5, y: 54, width: 50, height: 5,
      rotation: 0, opacity: 1, visible: true, locked: false,
      text: 'SKILL  90', fontSize: 3, fontFamily: 'Inter, sans-serif', fontWeight: 'bold',
      fontStyle: 'normal', fill: '#ffffff', align: 'left', verticalAlign: 'middle',
      lineHeight: 1, letterSpacing: 1, textDecoration: ''
    } as Layer,
    // Big number
    {
      id: id(), type: 'text', name: 'Overall Score', x: 4, y: 65, width: 54, height: 30,
      rotation: 0, opacity: 0.15, visible: true, locked: true,
      text: '85', fontSize: 28, fontFamily: 'Inter, sans-serif', fontWeight: '900',
      fontStyle: 'normal', fill: '#FF6B35', align: 'right', verticalAlign: 'bottom',
      lineHeight: 1, letterSpacing: -2, textDecoration: ''
    } as Layer
  ]
}

// ─── 4. Photo Card ──────────────────────────────────────────────
const photoCard: CardTemplate = {
  id: 'builtin-photo-card',
  name: 'Photo Card',
  description: 'Full-bleed image with sleek overlay text and gradient.',
  thumbnail: undefined,
  tags: ['photo', 'full-bleed', 'overlay'],
  builtIn: true,
  createdAt: now,
  updatedAt: now,
  backLayers: null,
  frontLayers: [
    {
      id: id(), type: 'image', name: 'Full Bleed Image', x: 0, y: 0, width: 62, height: 100,
      rotation: 0, opacity: 1, visible: true, locked: false, bindTo: 'image',
      src: '', fit: 'cover' as const,
      filters: { brightness: 100, contrast: 100, saturation: 100, blur: 0, grayscale: false }
    } as Layer,
    // Bottom gradient overlay
    {
      id: id(), type: 'shape', name: 'Gradient Overlay', x: 0, y: 55, width: 62, height: 45,
      rotation: 0, opacity: 0.85, visible: true, locked: true,
      shapeKind: 'rect', fill: '#000000', stroke: '', strokeWidth: 0
    } as Layer,
    {
      id: id(), type: 'text', name: 'Card Name', x: 5, y: 68, width: 52, height: 12,
      rotation: 0, opacity: 1, visible: true, locked: false, bindTo: 'name',
      text: '{{name}}', fontSize: 6, fontFamily: 'Inter, sans-serif', fontWeight: 'bold',
      fontStyle: 'normal', fill: '#ffffff', align: 'left', verticalAlign: 'bottom',
      lineHeight: 1.1, letterSpacing: 0, textDecoration: '',
      shadowColor: '#000000', shadowBlur: 4, shadowOffsetX: 0, shadowOffsetY: 2
    } as Layer,
    {
      id: id(), type: 'text', name: 'Description', x: 5, y: 82, width: 52, height: 10,
      rotation: 0, opacity: 0.8, visible: true, locked: false, bindTo: 'description',
      text: '{{description}}', fontSize: 2.5, fontFamily: 'Inter, sans-serif', fontWeight: 'normal',
      fontStyle: 'normal', fill: '#dddddd', align: 'left', verticalAlign: 'top',
      lineHeight: 1.4, letterSpacing: 0, textDecoration: ''
    } as Layer,
    // Small stat chips at top
    {
      id: id(), type: 'shape', name: 'Stat Chip BG', x: 3, y: 3, width: 18, height: 7,
      rotation: 0, opacity: 0.7, visible: true, locked: false,
      shapeKind: 'rect', fill: '#000000', stroke: '', strokeWidth: 0, cornerRadius: 2
    } as Layer,
    {
      id: id(), type: 'text', name: 'Stat Chip', x: 4, y: 3.5, width: 16, height: 6,
      rotation: 0, opacity: 1, visible: true, locked: false,
      text: '⭐ 85', fontSize: 3, fontFamily: 'Inter, sans-serif', fontWeight: 'bold',
      fontStyle: 'normal', fill: '#FFD700', align: 'center', verticalAlign: 'middle',
      lineHeight: 1, letterSpacing: 0, textDecoration: ''
    } as Layer
  ]
}

// ─── 5. Trading Card ────────────────────────────────────────────
const tradingCard: CardTemplate = {
  id: 'builtin-trading-card',
  name: 'Trading Card',
  description: 'Pokemon/MTG style frame with bordered image window and stat block.',
  thumbnail: undefined,
  tags: ['trading', 'tcg', 'pokemon', 'mtg'],
  builtIn: true,
  createdAt: now,
  updatedAt: now,
  backLayers: null,
  frontLayers: [
    // Outer frame
    {
      id: id(), type: 'shape', name: 'Outer Frame', x: 0, y: 0, width: 62, height: 100,
      rotation: 0, opacity: 1, visible: true, locked: true,
      shapeKind: 'rect', fill: '#C9A84C', stroke: '#8B6914', strokeWidth: 0.5, cornerRadius: 3
    } as Layer,
    // Inner card area
    {
      id: id(), type: 'shape', name: 'Inner Frame', x: 2, y: 2, width: 58, height: 96,
      rotation: 0, opacity: 1, visible: true, locked: true,
      shapeKind: 'rect', fill: '#F5E6C8', stroke: '#C9A84C', strokeWidth: 0.3, cornerRadius: 2
    } as Layer,
    // Name bar
    {
      id: id(), type: 'shape', name: 'Name Bar', x: 4, y: 4, width: 54, height: 9,
      rotation: 0, opacity: 1, visible: true, locked: true,
      shapeKind: 'rect', fill: '#FFFFFF', stroke: '#C9A84C', strokeWidth: 0.3, cornerRadius: 1
    } as Layer,
    {
      id: id(), type: 'text', name: 'Card Name', x: 6, y: 5, width: 36, height: 7,
      rotation: 0, opacity: 1, visible: true, locked: false, bindTo: 'name',
      text: '{{name}}', fontSize: 4, fontFamily: 'Inter, sans-serif', fontWeight: 'bold',
      fontStyle: 'normal', fill: '#333333', align: 'left', verticalAlign: 'middle',
      lineHeight: 1, letterSpacing: 0, textDecoration: ''
    } as Layer,
    {
      id: id(), type: 'text', name: 'HP', x: 42, y: 5, width: 14, height: 7,
      rotation: 0, opacity: 1, visible: true, locked: false,
      text: 'HP 120', fontSize: 3.5, fontFamily: 'Inter, sans-serif', fontWeight: 'bold',
      fontStyle: 'normal', fill: '#CC0000', align: 'right', verticalAlign: 'middle',
      lineHeight: 1, letterSpacing: 0, textDecoration: ''
    } as Layer,
    // Image window with border
    {
      id: id(), type: 'shape', name: 'Image Border', x: 4, y: 15, width: 54, height: 36,
      rotation: 0, opacity: 1, visible: true, locked: true,
      shapeKind: 'rect', fill: '#888888', stroke: '#C9A84C', strokeWidth: 0.5, cornerRadius: 0
    } as Layer,
    {
      id: id(), type: 'image', name: 'Card Image', x: 5, y: 16, width: 52, height: 34,
      rotation: 0, opacity: 1, visible: true, locked: false, bindTo: 'image',
      src: '', fit: 'cover' as const,
      filters: { brightness: 100, contrast: 100, saturation: 100, blur: 0, grayscale: false }
    } as Layer,
    // Info / type bar
    {
      id: id(), type: 'shape', name: 'Type Bar', x: 4, y: 53, width: 54, height: 6,
      rotation: 0, opacity: 1, visible: true, locked: true,
      shapeKind: 'rect', fill: '#FFFFFF', stroke: '#C9A84C', strokeWidth: 0.3, cornerRadius: 1
    } as Layer,
    {
      id: id(), type: 'text', name: 'Type Text', x: 6, y: 53.5, width: 50, height: 5,
      rotation: 0, opacity: 1, visible: true, locked: false,
      text: 'Stage 1 — Evolves from Basic', fontSize: 2.2, fontFamily: 'Inter, sans-serif',
      fontWeight: '500', fontStyle: 'normal', fill: '#555555', align: 'left',
      verticalAlign: 'middle', lineHeight: 1, letterSpacing: 0, textDecoration: ''
    } as Layer,
    // Ability block
    {
      id: id(), type: 'shape', name: 'Ability Block', x: 4, y: 61, width: 54, height: 28,
      rotation: 0, opacity: 1, visible: true, locked: true,
      shapeKind: 'rect', fill: '#FFFFFF', stroke: '#C9A84C', strokeWidth: 0.3, cornerRadius: 1
    } as Layer,
    {
      id: id(), type: 'text', name: 'Ability Name', x: 6, y: 63, width: 30, height: 5,
      rotation: 0, opacity: 1, visible: true, locked: false,
      text: 'Special Attack', fontSize: 3.2, fontFamily: 'Inter, sans-serif', fontWeight: 'bold',
      fontStyle: 'normal', fill: '#333333', align: 'left', verticalAlign: 'middle',
      lineHeight: 1, letterSpacing: 0, textDecoration: ''
    } as Layer,
    {
      id: id(), type: 'text', name: 'Ability Damage', x: 42, y: 63, width: 14, height: 5,
      rotation: 0, opacity: 1, visible: true, locked: false,
      text: '80', fontSize: 4, fontFamily: 'Inter, sans-serif', fontWeight: 'bold',
      fontStyle: 'normal', fill: '#333333', align: 'right', verticalAlign: 'middle',
      lineHeight: 1, letterSpacing: 0, textDecoration: ''
    } as Layer,
    {
      id: id(), type: 'text', name: 'Flavor Text', x: 6, y: 70, width: 50, height: 16,
      rotation: 0, opacity: 1, visible: true, locked: false, bindTo: 'description',
      text: '{{description}}', fontSize: 2, fontFamily: 'Inter, sans-serif', fontWeight: 'normal',
      fontStyle: 'italic', fill: '#666666', align: 'left', verticalAlign: 'top',
      lineHeight: 1.4, letterSpacing: 0, textDecoration: ''
    } as Layer,
    // Bottom bar
    {
      id: id(), type: 'shape', name: 'Bottom Bar', x: 4, y: 91, width: 54, height: 6,
      rotation: 0, opacity: 1, visible: true, locked: true,
      shapeKind: 'rect', fill: '#C9A84C', stroke: '', strokeWidth: 0, cornerRadius: 1
    } as Layer,
    {
      id: id(), type: 'text', name: 'Set Info', x: 6, y: 91.5, width: 50, height: 5,
      rotation: 0, opacity: 1, visible: true, locked: false,
      text: '042/165  ★  Rare', fontSize: 2, fontFamily: 'Inter, sans-serif', fontWeight: '500',
      fontStyle: 'normal', fill: '#FFFFFF', align: 'right', verticalAlign: 'middle',
      lineHeight: 1, letterSpacing: 0, textDecoration: ''
    } as Layer
  ]
}

export const builtInTemplates: CardTemplate[] = [
  classicTopTrumps,
  modernMinimal,
  boldStats,
  photoCard,
  tradingCard
]

export function getTemplateById(id: string): CardTemplate | undefined {
  return builtInTemplates.find((t) => t.id === id)
}
