import { v4 as uuid } from 'uuid'
import type { Layer } from '../types'

function id(): string {
  return uuid()
}

export interface ComponentPreset {
  id: string
  name: string
  category: 'stat-display' | 'title-bar' | 'image-frame' | 'badge' | 'decorative' | 'divider'
  description: string
  layers: Layer[]
  width: number  // mm
  height: number // mm
}

// ─── Stat Displays ───────────────────────────────────────────

const statHorizontalBar: ComponentPreset = {
  id: 'preset-stat-horizontal-bar',
  name: 'Horizontal Bar',
  category: 'stat-display',
  description: 'Classic Top Trumps horizontal stat bar with label and value.',
  width: 54,
  height: 5.5,
  layers: [
    { id: id(), type: 'shape', name: 'Bar BG', x: 0, y: 0, width: 54, height: 5.5, rotation: 0, opacity: 1, visible: true, locked: true, shapeKind: 'rect', fill: '#E3F2FD', stroke: '', strokeWidth: 0, cornerRadius: 1 } as Layer,
    { id: id(), type: 'shape', name: 'Bar Fill', x: 0, y: 0, width: 38, height: 5.5, rotation: 0, opacity: 0.6, visible: true, locked: false, shapeKind: 'rect', fill: '#1565C0', stroke: '', strokeWidth: 0, cornerRadius: 1 } as Layer,
    { id: id(), type: 'text', name: 'Label', x: 1, y: 0, width: 28, height: 5.5, rotation: 0, opacity: 1, visible: true, locked: false, text: 'Category', fontSize: 3, fontFamily: 'Inter, sans-serif', fontWeight: '600', fontStyle: 'normal', fill: '#333333', align: 'left', verticalAlign: 'middle', lineHeight: 1, letterSpacing: 0.3, textDecoration: '' } as Layer,
    { id: id(), type: 'text', name: 'Value', x: 34, y: 0, width: 19, height: 5.5, rotation: 0, opacity: 1, visible: true, locked: false, text: '85', fontSize: 3.5, fontFamily: 'Inter, sans-serif', fontWeight: 'bold', fontStyle: 'normal', fill: '#0D47A1', align: 'right', verticalAlign: 'middle', lineHeight: 1, letterSpacing: 0, textDecoration: '' } as Layer,
  ]
}

const statNumberBlock: ComponentPreset = {
  id: 'preset-stat-number-block',
  name: 'Number Block',
  category: 'stat-display',
  description: 'Big bold number with small label below.',
  width: 14,
  height: 14,
  layers: [
    { id: id(), type: 'shape', name: 'Block BG', x: 0, y: 0, width: 14, height: 14, rotation: 0, opacity: 1, visible: true, locked: true, shapeKind: 'rect', fill: '#1565C0', stroke: '', strokeWidth: 0, cornerRadius: 2 } as Layer,
    { id: id(), type: 'text', name: 'Number', x: 0, y: 0, width: 14, height: 10, rotation: 0, opacity: 1, visible: true, locked: false, text: '85', fontSize: 8, fontFamily: 'Inter, sans-serif', fontWeight: '900', fontStyle: 'normal', fill: '#ffffff', align: 'center', verticalAlign: 'middle', lineHeight: 1, letterSpacing: 0, textDecoration: '' } as Layer,
    { id: id(), type: 'text', name: 'Label', x: 0, y: 9, width: 14, height: 5, rotation: 0, opacity: 1, visible: true, locked: false, text: 'SPD', fontSize: 2.5, fontFamily: 'Inter, sans-serif', fontWeight: '600', fontStyle: 'normal', fill: '#B3D4FC', align: 'center', verticalAlign: 'middle', lineHeight: 1, letterSpacing: 1, textDecoration: '' } as Layer,
  ]
}

const statProgressDots: ComponentPreset = {
  id: 'preset-stat-progress-dots',
  name: 'Progress Dots',
  category: 'stat-display',
  description: 'Row of dots indicating level (filled vs empty).',
  width: 54,
  height: 5,
  layers: [
    { id: id(), type: 'text', name: 'Label', x: 0, y: 0, width: 20, height: 5, rotation: 0, opacity: 1, visible: true, locked: false, text: 'Power', fontSize: 2.8, fontFamily: 'Inter, sans-serif', fontWeight: '600', fontStyle: 'normal', fill: '#333333', align: 'left', verticalAlign: 'middle', lineHeight: 1, letterSpacing: 0, textDecoration: '' } as Layer,
    { id: id(), type: 'text', name: 'Dots', x: 20, y: 0, width: 34, height: 5, rotation: 0, opacity: 1, visible: true, locked: false, text: '● ● ● ● ○ ○', fontSize: 3, fontFamily: 'Inter, sans-serif', fontWeight: 'normal', fontStyle: 'normal', fill: '#1565C0', align: 'right', verticalAlign: 'middle', lineHeight: 1, letterSpacing: 1, textDecoration: '' } as Layer,
  ]
}

// ─── Title Bars ──────────────────────────────────────────────

const titleClassicBanner: ComponentPreset = {
  id: 'preset-title-classic-banner',
  name: 'Classic Banner',
  category: 'title-bar',
  description: 'Full-width colored banner with centered white text.',
  width: 62,
  height: 14,
  layers: [
    { id: id(), type: 'shape', name: 'Banner BG', x: 0, y: 0, width: 62, height: 14, rotation: 0, opacity: 1, visible: true, locked: true, shapeKind: 'rect', fill: '#0D47A1', stroke: '', strokeWidth: 0 } as Layer,
    { id: id(), type: 'text', name: 'Title', x: 3, y: 2, width: 56, height: 10, rotation: 0, opacity: 1, visible: true, locked: false, text: 'Card Name', fontSize: 5.5, fontFamily: 'Inter, sans-serif', fontWeight: 'bold', fontStyle: 'normal', fill: '#ffffff', align: 'center', verticalAlign: 'middle', lineHeight: 1.1, letterSpacing: 0.5, textDecoration: '' } as Layer,
  ]
}

const titleRibbon: ComponentPreset = {
  id: 'preset-title-ribbon',
  name: 'Ribbon',
  category: 'title-bar',
  description: 'Ribbon-style title bar that extends slightly beyond card edges.',
  width: 62,
  height: 12,
  layers: [
    { id: id(), type: 'shape', name: 'Ribbon Shadow', x: 1, y: 2, width: 60, height: 10, rotation: 0, opacity: 0.2, visible: true, locked: true, shapeKind: 'rect', fill: '#000000', stroke: '', strokeWidth: 0 } as Layer,
    { id: id(), type: 'shape', name: 'Ribbon', x: 0, y: 0, width: 62, height: 10, rotation: 0, opacity: 1, visible: true, locked: true, shapeKind: 'rect', fill: '#D32F2F', stroke: '', strokeWidth: 0 } as Layer,
    { id: id(), type: 'text', name: 'Title', x: 4, y: 0, width: 54, height: 10, rotation: 0, opacity: 1, visible: true, locked: false, text: 'Card Name', fontSize: 5, fontFamily: 'Inter, sans-serif', fontWeight: 'bold', fontStyle: 'normal', fill: '#ffffff', align: 'center', verticalAlign: 'middle', lineHeight: 1.1, letterSpacing: 0, textDecoration: '' } as Layer,
  ]
}

const titleGradientFade: ComponentPreset = {
  id: 'preset-title-gradient-fade',
  name: 'Gradient Fade',
  category: 'title-bar',
  description: 'Fading gradient title bar from dark to transparent.',
  width: 62,
  height: 14,
  layers: [
    { id: id(), type: 'shape', name: 'Gradient Dark', x: 0, y: 0, width: 62, height: 14, rotation: 0, opacity: 0.8, visible: true, locked: true, shapeKind: 'rect', fill: '#000000', stroke: '', strokeWidth: 0 } as Layer,
    { id: id(), type: 'shape', name: 'Gradient Mid', x: 0, y: 8, width: 62, height: 6, rotation: 0, opacity: 0.4, visible: true, locked: true, shapeKind: 'rect', fill: '#000000', stroke: '', strokeWidth: 0 } as Layer,
    { id: id(), type: 'text', name: 'Title', x: 4, y: 2, width: 54, height: 10, rotation: 0, opacity: 1, visible: true, locked: false, text: 'Card Name', fontSize: 5, fontFamily: 'Inter, sans-serif', fontWeight: '300', fontStyle: 'normal', fill: '#ffffff', align: 'left', verticalAlign: 'middle', lineHeight: 1.1, letterSpacing: 1, textDecoration: '' } as Layer,
  ]
}

const titleRoundedTab: ComponentPreset = {
  id: 'preset-title-rounded-tab',
  name: 'Rounded Tab',
  category: 'title-bar',
  description: 'Rounded tab-style title with colored background.',
  width: 50,
  height: 10,
  layers: [
    { id: id(), type: 'shape', name: 'Tab BG', x: 0, y: 0, width: 50, height: 10, rotation: 0, opacity: 1, visible: true, locked: true, shapeKind: 'rect', fill: '#FF5722', stroke: '', strokeWidth: 0, cornerRadius: 5 } as Layer,
    { id: id(), type: 'text', name: 'Title', x: 3, y: 0, width: 44, height: 10, rotation: 0, opacity: 1, visible: true, locked: false, text: 'Card Name', fontSize: 4.5, fontFamily: 'Inter, sans-serif', fontWeight: '700', fontStyle: 'normal', fill: '#ffffff', align: 'center', verticalAlign: 'middle', lineHeight: 1, letterSpacing: 0.5, textDecoration: '' } as Layer,
  ]
}

// ─── Image Frames ────────────────────────────────────────────

const frameRoundedRect: ComponentPreset = {
  id: 'preset-frame-rounded-rect',
  name: 'Rounded Rectangle',
  category: 'image-frame',
  description: 'Rounded rectangle image frame with subtle border.',
  width: 54,
  height: 34,
  layers: [
    { id: id(), type: 'shape', name: 'Frame', x: 0, y: 0, width: 54, height: 34, rotation: 0, opacity: 1, visible: true, locked: true, shapeKind: 'rect', fill: '#E0E0E0', stroke: '#BDBDBD', strokeWidth: 0.5, cornerRadius: 4 } as Layer,
    { id: id(), type: 'image', name: 'Image', x: 1, y: 1, width: 52, height: 32, rotation: 0, opacity: 1, visible: true, locked: false, src: '', fit: 'cover' as const, filters: { brightness: 100, contrast: 100, saturation: 100, blur: 0, grayscale: false } } as Layer,
  ]
}

const frameCircle: ComponentPreset = {
  id: 'preset-frame-circle',
  name: 'Circle',
  category: 'image-frame',
  description: 'Circular image frame.',
  width: 30,
  height: 30,
  layers: [
    { id: id(), type: 'shape', name: 'Circle Frame', x: 0, y: 0, width: 30, height: 30, rotation: 0, opacity: 1, visible: true, locked: true, shapeKind: 'circle', fill: '#E0E0E0', stroke: '#9E9E9E', strokeWidth: 0.5 } as Layer,
    { id: id(), type: 'image', name: 'Image', x: 1, y: 1, width: 28, height: 28, rotation: 0, opacity: 1, visible: true, locked: false, src: '', fit: 'cover' as const, filters: { brightness: 100, contrast: 100, saturation: 100, blur: 0, grayscale: false } } as Layer,
  ]
}

const frameDiamond: ComponentPreset = {
  id: 'preset-frame-diamond',
  name: 'Diamond',
  category: 'image-frame',
  description: 'Diamond-shaped rotated image frame.',
  width: 30,
  height: 30,
  layers: [
    { id: id(), type: 'shape', name: 'Diamond BG', x: 0, y: 0, width: 30, height: 30, rotation: 45, opacity: 1, visible: true, locked: true, shapeKind: 'rect', fill: '#E0E0E0', stroke: '#9E9E9E', strokeWidth: 0.5, cornerRadius: 1 } as Layer,
    { id: id(), type: 'image', name: 'Image', x: 3, y: 3, width: 24, height: 24, rotation: 0, opacity: 1, visible: true, locked: false, src: '', fit: 'cover' as const, filters: { brightness: 100, contrast: 100, saturation: 100, blur: 0, grayscale: false } } as Layer,
  ]
}

const framePolaroid: ComponentPreset = {
  id: 'preset-frame-polaroid',
  name: 'Polaroid',
  category: 'image-frame',
  description: 'Polaroid-style frame with white border and bottom caption area.',
  width: 40,
  height: 46,
  layers: [
    { id: id(), type: 'shape', name: 'Polaroid Border', x: 0, y: 0, width: 40, height: 46, rotation: 0, opacity: 1, visible: true, locked: true, shapeKind: 'rect', fill: '#ffffff', stroke: '#E0E0E0', strokeWidth: 0.3, cornerRadius: 0 } as Layer,
    { id: id(), type: 'image', name: 'Image', x: 2, y: 2, width: 36, height: 34, rotation: 0, opacity: 1, visible: true, locked: false, src: '', fit: 'cover' as const, filters: { brightness: 100, contrast: 100, saturation: 100, blur: 0, grayscale: false } } as Layer,
    { id: id(), type: 'text', name: 'Caption', x: 2, y: 37, width: 36, height: 7, rotation: 0, opacity: 1, visible: true, locked: false, text: 'Caption', fontSize: 3, fontFamily: 'Inter, sans-serif', fontWeight: 'normal', fontStyle: 'normal', fill: '#666666', align: 'center', verticalAlign: 'middle', lineHeight: 1, letterSpacing: 0, textDecoration: '' } as Layer,
  ]
}

// ─── Badges ──────────────────────────────────────────────────

const badgeRankCircle: ComponentPreset = {
  id: 'preset-badge-rank-circle',
  name: 'Rank Circle',
  category: 'badge',
  description: 'Circular badge with rank number.',
  width: 10,
  height: 10,
  layers: [
    { id: id(), type: 'shape', name: 'Circle', x: 0, y: 0, width: 10, height: 10, rotation: 0, opacity: 1, visible: true, locked: true, shapeKind: 'circle', fill: '#FFD700', stroke: '#C9A84C', strokeWidth: 0.5 } as Layer,
    { id: id(), type: 'text', name: 'Rank', x: 0, y: 0, width: 10, height: 10, rotation: 0, opacity: 1, visible: true, locked: false, text: '#1', fontSize: 4, fontFamily: 'Inter, sans-serif', fontWeight: '900', fontStyle: 'normal', fill: '#333333', align: 'center', verticalAlign: 'middle', lineHeight: 1, letterSpacing: 0, textDecoration: '' } as Layer,
  ]
}

const badgeStar: ComponentPreset = {
  id: 'preset-badge-star',
  name: 'Star Badge',
  category: 'badge',
  description: 'Star-shaped badge for highlighting.',
  width: 12,
  height: 12,
  layers: [
    { id: id(), type: 'shape', name: 'Star', x: 0, y: 0, width: 12, height: 12, rotation: 0, opacity: 1, visible: true, locked: true, shapeKind: 'star', fill: '#FFD700', stroke: '#FFA000', strokeWidth: 0.3, numPoints: 5, innerRadius: 4 } as Layer,
    { id: id(), type: 'text', name: 'Star Text', x: 0, y: 0, width: 12, height: 12, rotation: 0, opacity: 1, visible: true, locked: false, text: '★', fontSize: 4, fontFamily: 'Inter, sans-serif', fontWeight: 'bold', fontStyle: 'normal', fill: '#ffffff', align: 'center', verticalAlign: 'middle', lineHeight: 1, letterSpacing: 0, textDecoration: '' } as Layer,
  ]
}

const badgeRarity: ComponentPreset = {
  id: 'preset-badge-rarity',
  name: 'Rarity Indicator',
  category: 'badge',
  description: 'Colored pill showing rarity level (Common/Rare/Epic/Legendary).',
  width: 20,
  height: 6,
  layers: [
    { id: id(), type: 'shape', name: 'Pill BG', x: 0, y: 0, width: 20, height: 6, rotation: 0, opacity: 1, visible: true, locked: true, shapeKind: 'rect', fill: '#9C27B0', stroke: '', strokeWidth: 0, cornerRadius: 3 } as Layer,
    { id: id(), type: 'text', name: 'Rarity', x: 0, y: 0, width: 20, height: 6, rotation: 0, opacity: 1, visible: true, locked: false, text: 'EPIC', fontSize: 2.5, fontFamily: 'Inter, sans-serif', fontWeight: 'bold', fontStyle: 'normal', fill: '#ffffff', align: 'center', verticalAlign: 'middle', lineHeight: 1, letterSpacing: 1, textDecoration: '' } as Layer,
  ]
}

const badgeCardNumber: ComponentPreset = {
  id: 'preset-badge-card-number',
  name: 'Card Number',
  category: 'badge',
  description: 'Small card number badge.',
  width: 12,
  height: 6,
  layers: [
    { id: id(), type: 'shape', name: 'Number BG', x: 0, y: 0, width: 12, height: 6, rotation: 0, opacity: 0.8, visible: true, locked: true, shapeKind: 'rect', fill: '#000000', stroke: '', strokeWidth: 0, cornerRadius: 1 } as Layer,
    { id: id(), type: 'text', name: 'Number', x: 0, y: 0, width: 12, height: 6, rotation: 0, opacity: 1, visible: true, locked: false, text: '01/30', fontSize: 2.5, fontFamily: 'Inter, sans-serif', fontWeight: '600', fontStyle: 'normal', fill: '#ffffff', align: 'center', verticalAlign: 'middle', lineHeight: 1, letterSpacing: 0.5, textDecoration: '' } as Layer,
  ]
}

// ─── Decorative ──────────────────────────────────────────────

const decoCornerFlourish: ComponentPreset = {
  id: 'preset-deco-corner-flourish',
  name: 'Corner Flourish',
  category: 'decorative',
  description: 'Decorative corner accent with overlapping shapes.',
  width: 10,
  height: 10,
  layers: [
    { id: id(), type: 'shape', name: 'Corner L', x: 0, y: 0, width: 10, height: 1, rotation: 0, opacity: 0.6, visible: true, locked: true, shapeKind: 'rect', fill: '#C9A84C', stroke: '', strokeWidth: 0 } as Layer,
    { id: id(), type: 'shape', name: 'Corner T', x: 0, y: 0, width: 1, height: 10, rotation: 0, opacity: 0.6, visible: true, locked: true, shapeKind: 'rect', fill: '#C9A84C', stroke: '', strokeWidth: 0 } as Layer,
    { id: id(), type: 'shape', name: 'Corner Dot', x: 0, y: 0, width: 2, height: 2, rotation: 0, opacity: 0.8, visible: true, locked: true, shapeKind: 'circle', fill: '#C9A84C', stroke: '', strokeWidth: 0 } as Layer,
  ]
}

const decoDividerLine: ComponentPreset = {
  id: 'preset-deco-divider-line',
  name: 'Decorative Divider',
  category: 'decorative',
  description: 'Ornamental divider with center dot.',
  width: 40,
  height: 3,
  layers: [
    { id: id(), type: 'shape', name: 'Line Left', x: 0, y: 1.2, width: 17, height: 0.3, rotation: 0, opacity: 0.5, visible: true, locked: true, shapeKind: 'rect', fill: '#C9A84C', stroke: '', strokeWidth: 0 } as Layer,
    { id: id(), type: 'shape', name: 'Center Dot', x: 18.5, y: 0.5, width: 3, height: 2, rotation: 0, opacity: 0.7, visible: true, locked: true, shapeKind: 'circle', fill: '#C9A84C', stroke: '', strokeWidth: 0 } as Layer,
    { id: id(), type: 'shape', name: 'Line Right', x: 23, y: 1.2, width: 17, height: 0.3, rotation: 0, opacity: 0.5, visible: true, locked: true, shapeKind: 'rect', fill: '#C9A84C', stroke: '', strokeWidth: 0 } as Layer,
  ]
}

const decoPatternStrip: ComponentPreset = {
  id: 'preset-deco-pattern-strip',
  name: 'Pattern Strip',
  category: 'decorative',
  description: 'Horizontal pattern strip using alternating colored blocks.',
  width: 54,
  height: 3,
  layers: [
    { id: id(), type: 'shape', name: 'Strip BG', x: 0, y: 0, width: 54, height: 3, rotation: 0, opacity: 1, visible: true, locked: true, shapeKind: 'rect', fill: '#1565C0', stroke: '', strokeWidth: 0 } as Layer,
    { id: id(), type: 'shape', name: 'Pattern 1', x: 0, y: 0, width: 6, height: 3, rotation: 0, opacity: 0.3, visible: true, locked: true, shapeKind: 'rect', fill: '#ffffff', stroke: '', strokeWidth: 0 } as Layer,
    { id: id(), type: 'shape', name: 'Pattern 2', x: 12, y: 0, width: 6, height: 3, rotation: 0, opacity: 0.3, visible: true, locked: true, shapeKind: 'rect', fill: '#ffffff', stroke: '', strokeWidth: 0 } as Layer,
    { id: id(), type: 'shape', name: 'Pattern 3', x: 24, y: 0, width: 6, height: 3, rotation: 0, opacity: 0.3, visible: true, locked: true, shapeKind: 'rect', fill: '#ffffff', stroke: '', strokeWidth: 0 } as Layer,
    { id: id(), type: 'shape', name: 'Pattern 4', x: 36, y: 0, width: 6, height: 3, rotation: 0, opacity: 0.3, visible: true, locked: true, shapeKind: 'rect', fill: '#ffffff', stroke: '', strokeWidth: 0 } as Layer,
    { id: id(), type: 'shape', name: 'Pattern 5', x: 48, y: 0, width: 6, height: 3, rotation: 0, opacity: 0.3, visible: true, locked: true, shapeKind: 'rect', fill: '#ffffff', stroke: '', strokeWidth: 0 } as Layer,
  ]
}

// ─── Dividers ────────────────────────────────────────────────

const dividerSolid: ComponentPreset = {
  id: 'preset-divider-solid',
  name: 'Solid Line',
  category: 'divider',
  description: 'Simple solid line divider.',
  width: 54,
  height: 0.5,
  layers: [
    { id: id(), type: 'shape', name: 'Line', x: 0, y: 0, width: 54, height: 0.5, rotation: 0, opacity: 0.6, visible: true, locked: true, shapeKind: 'rect', fill: '#333333', stroke: '', strokeWidth: 0 } as Layer,
  ]
}

const dividerDotted: ComponentPreset = {
  id: 'preset-divider-dotted',
  name: 'Dotted Line',
  category: 'divider',
  description: 'Dotted line divider using small circles.',
  width: 54,
  height: 1,
  layers: [
    { id: id(), type: 'text', name: 'Dots', x: 0, y: 0, width: 54, height: 1, rotation: 0, opacity: 0.5, visible: true, locked: true, text: '· · · · · · · · · · · · · · · · · · · · · ·', fontSize: 2, fontFamily: 'Inter, sans-serif', fontWeight: 'bold', fontStyle: 'normal', fill: '#666666', align: 'center', verticalAlign: 'middle', lineHeight: 1, letterSpacing: 0, textDecoration: '' } as Layer,
  ]
}

const dividerGradientFade: ComponentPreset = {
  id: 'preset-divider-gradient-fade',
  name: 'Gradient Fade',
  category: 'divider',
  description: 'Divider that fades from center outward.',
  width: 54,
  height: 0.5,
  layers: [
    { id: id(), type: 'shape', name: 'Center', x: 12, y: 0, width: 30, height: 0.5, rotation: 0, opacity: 0.6, visible: true, locked: true, shapeKind: 'rect', fill: '#333333', stroke: '', strokeWidth: 0 } as Layer,
    { id: id(), type: 'shape', name: 'Left Fade', x: 4, y: 0, width: 12, height: 0.5, rotation: 0, opacity: 0.2, visible: true, locked: true, shapeKind: 'rect', fill: '#333333', stroke: '', strokeWidth: 0 } as Layer,
    { id: id(), type: 'shape', name: 'Right Fade', x: 38, y: 0, width: 12, height: 0.5, rotation: 0, opacity: 0.2, visible: true, locked: true, shapeKind: 'rect', fill: '#333333', stroke: '', strokeWidth: 0 } as Layer,
  ]
}

// ─── Export ──────────────────────────────────────────────────

export const componentPresets: ComponentPreset[] = [
  // Stat displays
  statHorizontalBar,
  statNumberBlock,
  statProgressDots,
  // Title bars
  titleClassicBanner,
  titleRibbon,
  titleGradientFade,
  titleRoundedTab,
  // Image frames
  frameRoundedRect,
  frameCircle,
  frameDiamond,
  framePolaroid,
  // Badges
  badgeRankCircle,
  badgeStar,
  badgeRarity,
  badgeCardNumber,
  // Decorative
  decoCornerFlourish,
  decoDividerLine,
  decoPatternStrip,
  // Dividers
  dividerSolid,
  dividerDotted,
  dividerGradientFade,
]

export function getPresetsByCategory(category: ComponentPreset['category']): ComponentPreset[] {
  return componentPresets.filter((p) => p.category === category)
}

export function getPresetById(presetId: string): ComponentPreset | undefined {
  return componentPresets.find((p) => p.id === presetId)
}

export const presetCategories: { key: ComponentPreset['category']; label: string; icon: string }[] = [
  { key: 'stat-display', label: 'Stat Displays', icon: '📊' },
  { key: 'title-bar', label: 'Title Bars', icon: '🏷️' },
  { key: 'image-frame', label: 'Image Frames', icon: '🖼️' },
  { key: 'badge', label: 'Badges', icon: '🏅' },
  { key: 'decorative', label: 'Decorative', icon: '✨' },
  { key: 'divider', label: 'Dividers', icon: '➖' },
]
