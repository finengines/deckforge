import { v4 as uuid } from 'uuid'
import type { CardTemplate, Layer } from '../types'

function id(): string {
  return uuid()
}

const now = new Date().toISOString()

// Helper to create a stat row (bar bg + label + value) at a given Y position
function statRow(
  y: number,
  statIndex: number,
  label: string,
  defaultValue: string,
  colors: {
    barBg: string
    barFill: string
    labelColor: string
    valueColor: string
    labelFont?: string
    valueFont?: string
    labelSize?: number
    valueSize?: number
    barWidth?: number
    barHeight?: number
    barRadius?: number
    barOpacity?: number
  }
): Layer[] {
  const barH = colors.barHeight ?? 5.5
  const barW = colors.barWidth ?? 54
  const barR = colors.barRadius ?? 1
  const lFont = colors.labelFont ?? 'Inter, sans-serif'
  const vFont = colors.valueFont ?? 'Inter, sans-serif'
  const lSize = colors.labelSize ?? 3
  const vSize = colors.valueSize ?? 3.5
  return [
    // Bar background
    {
      id: id(), type: 'shape', name: `Stat ${statIndex + 1} Bar BG`, x: 4, y, width: barW, height: barH,
      rotation: 0, opacity: colors.barOpacity ?? 1, visible: true, locked: true,
      shapeKind: 'rect', fill: colors.barBg, stroke: '', strokeWidth: 0, cornerRadius: barR
    } as Layer,
    // Bar fill (decorative, shows theme color)
    {
      id: id(), type: 'shape', name: `Stat ${statIndex + 1} Bar Fill`, x: 4, y, width: barW * 0.7, height: barH,
      rotation: 0, opacity: 0.6, visible: true, locked: true,
      shapeKind: 'rect', fill: colors.barFill, stroke: '', strokeWidth: 0, cornerRadius: barR
    } as Layer,
    // Label
    {
      id: id(), type: 'text', name: `Stat ${statIndex + 1} Label`, x: 5, y, width: 28, height: barH,
      rotation: 0, opacity: 1, visible: true, locked: false,
      text: label, fontSize: lSize, fontFamily: lFont, fontWeight: '600',
      fontStyle: 'normal', fill: colors.labelColor, align: 'left', verticalAlign: 'middle',
      lineHeight: 1, letterSpacing: 0.3, textDecoration: ''
    } as Layer,
    // Value (bound to stat)
    {
      id: id(), type: 'text', name: `Stat ${statIndex + 1} Value`, x: 38, y, width: 19, height: barH,
      rotation: 0, opacity: 1, visible: true, locked: false, bindTo: `stat:${statIndex}`,
      text: defaultValue, fontSize: vSize, fontFamily: vFont, fontWeight: 'bold',
      fontStyle: 'normal', fill: colors.valueColor, align: 'right', verticalAlign: 'middle',
      lineHeight: 1, letterSpacing: 0, textDecoration: ''
    } as Layer,
  ]
}

// ═══════════════════════════════════════════════════════════════
// 1. Classic TT — Blue gradient header, white stats, bold bars
// ═══════════════════════════════════════════════════════════════
const classicTT: CardTemplate = {
  id: 'tt-classic',
  name: 'Classic TT',
  description: 'Traditional Top Trumps — blue gradient header, white stat area with bold horizontal bars.',
  thumbnail: undefined,
  tags: ['classic', 'top-trumps', 'blue'],
  builtIn: true,
  createdAt: now,
  updatedAt: now,
  backLayers: null,
  frontLayers: [
    // Card background
    { id: id(), type: 'shape', name: 'Card BG', x: 0, y: 0, width: 62, height: 100, rotation: 0, opacity: 1, visible: true, locked: true, shapeKind: 'rect', fill: '#ffffff', stroke: '#cccccc', strokeWidth: 0.3, cornerRadius: 2 } as Layer,
    // Blue header gradient (two overlapping rects)
    { id: id(), type: 'shape', name: 'Header Gradient Dark', x: 0, y: 0, width: 62, height: 14, rotation: 0, opacity: 1, visible: true, locked: true, shapeKind: 'rect', fill: '#0D47A1', stroke: '', strokeWidth: 0, cornerRadius: 0 } as Layer,
    { id: id(), type: 'shape', name: 'Header Gradient Light', x: 0, y: 0, width: 62, height: 8, rotation: 0, opacity: 0.4, visible: true, locked: true, shapeKind: 'rect', fill: '#42A5F5', stroke: '', strokeWidth: 0, cornerRadius: 0 } as Layer,
    // Title
    { id: id(), type: 'text', name: 'Card Name', x: 3, y: 2, width: 56, height: 10, rotation: 0, opacity: 1, visible: true, locked: false, bindTo: 'name', text: '{{name}}', fontSize: 5.5, fontFamily: 'Inter, sans-serif', fontWeight: 'bold', fontStyle: 'normal', fill: '#ffffff', align: 'center', verticalAlign: 'middle', lineHeight: 1.1, letterSpacing: 0.5, textDecoration: '' } as Layer,
    // Image area
    { id: id(), type: 'image', name: 'Card Image', x: 3, y: 16, width: 56, height: 34, rotation: 0, opacity: 1, visible: true, locked: false, bindTo: 'image', src: '', fit: 'cover' as const, filters: { brightness: 100, contrast: 100, saturation: 100, blur: 0, grayscale: false } } as Layer,
    // Description
    { id: id(), type: 'text', name: 'Description', x: 4, y: 52, width: 54, height: 7, rotation: 0, opacity: 1, visible: true, locked: false, bindTo: 'description', text: '{{description}}', fontSize: 2.4, fontFamily: 'Inter, sans-serif', fontWeight: 'normal', fontStyle: 'italic', fill: '#555555', align: 'center', verticalAlign: 'middle', lineHeight: 1.3, letterSpacing: 0, textDecoration: '' } as Layer,
    // Divider
    { id: id(), type: 'shape', name: 'Stats Divider', x: 4, y: 59.5, width: 54, height: 0.4, rotation: 0, opacity: 0.3, visible: true, locked: true, shapeKind: 'rect', fill: '#0D47A1', stroke: '', strokeWidth: 0 } as Layer,
    // 5 stat rows
    ...statRow(61, 0, 'Speed', '85', { barBg: '#E3F2FD', barFill: '#1565C0', labelColor: '#333333', valueColor: '#0D47A1' }),
    ...statRow(67, 1, 'Power', '72', { barBg: '#E3F2FD', barFill: '#1565C0', labelColor: '#333333', valueColor: '#0D47A1' }),
    ...statRow(73, 2, 'Skill', '90', { barBg: '#E3F2FD', barFill: '#1565C0', labelColor: '#333333', valueColor: '#0D47A1' }),
    ...statRow(79, 3, 'Stamina', '65', { barBg: '#E3F2FD', barFill: '#1565C0', labelColor: '#333333', valueColor: '#0D47A1' }),
    ...statRow(85, 4, 'Rating', '78', { barBg: '#E3F2FD', barFill: '#1565C0', labelColor: '#333333', valueColor: '#0D47A1' }),
    // Fun fact footer
    { id: id(), type: 'shape', name: 'Footer BG', x: 0, y: 92, width: 62, height: 8, rotation: 0, opacity: 1, visible: true, locked: true, shapeKind: 'rect', fill: '#0D47A1', stroke: '', strokeWidth: 0 } as Layer,
    { id: id(), type: 'text', name: 'Fun Fact', x: 3, y: 93, width: 56, height: 6, rotation: 0, opacity: 1, visible: true, locked: false, bindTo: 'funFact', text: '{{funFact}}', fontSize: 2, fontFamily: 'Inter, sans-serif', fontWeight: 'normal', fontStyle: 'normal', fill: '#B3D4FC', align: 'center', verticalAlign: 'middle', lineHeight: 1.2, letterSpacing: 0, textDecoration: '' } as Layer,
  ]
}

// ═══════════════════════════════════════════════════════════════
// 2. Sports Star — Red header, dynamic action feel
// ═══════════════════════════════════════════════════════════════
const sportsStar: CardTemplate = {
  id: 'tt-sports-star',
  name: 'Sports Star',
  description: 'Bold red header with dynamic action feel and round stat indicators.',
  thumbnail: undefined,
  tags: ['sports', 'action', 'red'],
  builtIn: true,
  createdAt: now,
  updatedAt: now,
  backLayers: null,
  frontLayers: [
    { id: id(), type: 'shape', name: 'Card BG', x: 0, y: 0, width: 62, height: 100, rotation: 0, opacity: 1, visible: true, locked: true, shapeKind: 'rect', fill: '#1B1B1B', stroke: '', strokeWidth: 0, cornerRadius: 2 } as Layer,
    // Red diagonal accent
    { id: id(), type: 'shape', name: 'Red Accent Top', x: 0, y: 0, width: 62, height: 16, rotation: 0, opacity: 1, visible: true, locked: true, shapeKind: 'rect', fill: '#D32F2F', stroke: '', strokeWidth: 0 } as Layer,
    { id: id(), type: 'shape', name: 'Red Accent Stripe', x: 0, y: 14, width: 62, height: 3, rotation: 0, opacity: 0.7, visible: true, locked: true, shapeKind: 'rect', fill: '#FF5252', stroke: '', strokeWidth: 0 } as Layer,
    // Title
    { id: id(), type: 'text', name: 'Card Name', x: 3, y: 2, width: 56, height: 12, rotation: 0, opacity: 1, visible: true, locked: false, bindTo: 'name', text: '{{name}}', fontSize: 5.5, fontFamily: 'Inter, sans-serif', fontWeight: '900', fontStyle: 'normal', fill: '#ffffff', align: 'left', verticalAlign: 'middle', lineHeight: 1.1, letterSpacing: 1, textDecoration: '' } as Layer,
    // Image
    { id: id(), type: 'image', name: 'Card Image', x: 2, y: 18, width: 58, height: 35, rotation: 0, opacity: 1, visible: true, locked: false, bindTo: 'image', src: '', fit: 'cover' as const, filters: { brightness: 100, contrast: 110, saturation: 110, blur: 0, grayscale: false } } as Layer,
    // Description
    { id: id(), type: 'text', name: 'Description', x: 4, y: 54, width: 54, height: 6, rotation: 0, opacity: 1, visible: true, locked: false, bindTo: 'description', text: '{{description}}', fontSize: 2.2, fontFamily: 'Inter, sans-serif', fontWeight: 'normal', fontStyle: 'normal', fill: '#BDBDBD', align: 'left', verticalAlign: 'middle', lineHeight: 1.3, letterSpacing: 0, textDecoration: '' } as Layer,
    // Stats
    ...statRow(61, 0, 'Goals', '45', { barBg: '#2C2C2C', barFill: '#D32F2F', labelColor: '#E0E0E0', valueColor: '#FF5252', barRadius: 2 }),
    ...statRow(67, 1, 'Assists', '32', { barBg: '#2C2C2C', barFill: '#D32F2F', labelColor: '#E0E0E0', valueColor: '#FF5252', barRadius: 2 }),
    ...statRow(73, 2, 'Speed', '88', { barBg: '#2C2C2C', barFill: '#D32F2F', labelColor: '#E0E0E0', valueColor: '#FF5252', barRadius: 2 }),
    ...statRow(79, 3, 'Tackling', '71', { barBg: '#2C2C2C', barFill: '#D32F2F', labelColor: '#E0E0E0', valueColor: '#FF5252', barRadius: 2 }),
    ...statRow(85, 4, 'Overall', '82', { barBg: '#2C2C2C', barFill: '#D32F2F', labelColor: '#E0E0E0', valueColor: '#FF5252', barRadius: 2 }),
    // Footer
    { id: id(), type: 'shape', name: 'Footer', x: 0, y: 92, width: 62, height: 8, rotation: 0, opacity: 1, visible: true, locked: true, shapeKind: 'rect', fill: '#D32F2F', stroke: '', strokeWidth: 0 } as Layer,
    { id: id(), type: 'text', name: 'Fun Fact', x: 3, y: 93, width: 56, height: 6, rotation: 0, opacity: 1, visible: true, locked: false, bindTo: 'funFact', text: '{{funFact}}', fontSize: 2, fontFamily: 'Inter, sans-serif', fontWeight: 'bold', fontStyle: 'normal', fill: '#ffffff', align: 'center', verticalAlign: 'middle', lineHeight: 1.2, letterSpacing: 0, textDecoration: '' } as Layer,
  ]
}

// ═══════════════════════════════════════════════════════════════
// 3. Animals & Nature — Green earth tones, organic borders
// ═══════════════════════════════════════════════════════════════
const animalsNature: CardTemplate = {
  id: 'tt-animals-nature',
  name: 'Animals & Nature',
  description: 'Earthy green tones with organic leaf-like borders and nature vibes.',
  thumbnail: undefined,
  tags: ['animals', 'nature', 'green'],
  builtIn: true,
  createdAt: now,
  updatedAt: now,
  backLayers: null,
  frontLayers: [
    { id: id(), type: 'shape', name: 'Card BG', x: 0, y: 0, width: 62, height: 100, rotation: 0, opacity: 1, visible: true, locked: true, shapeKind: 'rect', fill: '#F1F8E9', stroke: '#81C784', strokeWidth: 1, cornerRadius: 3 } as Layer,
    // Green header
    { id: id(), type: 'shape', name: 'Header BG', x: 0, y: 0, width: 62, height: 14, rotation: 0, opacity: 1, visible: true, locked: true, shapeKind: 'rect', fill: '#2E7D32', stroke: '', strokeWidth: 0 } as Layer,
    { id: id(), type: 'shape', name: 'Header Leaf Accent', x: 0, y: 12, width: 62, height: 4, rotation: 0, opacity: 0.5, visible: true, locked: true, shapeKind: 'rect', fill: '#66BB6A', stroke: '', strokeWidth: 0, cornerRadius: 0 } as Layer,
    // Title
    { id: id(), type: 'text', name: 'Card Name', x: 3, y: 2, width: 56, height: 10, rotation: 0, opacity: 1, visible: true, locked: false, bindTo: 'name', text: '{{name}}', fontSize: 5, fontFamily: 'Georgia, serif', fontWeight: 'bold', fontStyle: 'normal', fill: '#ffffff', align: 'center', verticalAlign: 'middle', lineHeight: 1.1, letterSpacing: 0.5, textDecoration: '' } as Layer,
    // Image with border
    { id: id(), type: 'shape', name: 'Image Border', x: 3, y: 17, width: 56, height: 34, rotation: 0, opacity: 1, visible: true, locked: true, shapeKind: 'rect', fill: '#A5D6A7', stroke: '', strokeWidth: 0, cornerRadius: 4 } as Layer,
    { id: id(), type: 'image', name: 'Card Image', x: 4, y: 18, width: 54, height: 32, rotation: 0, opacity: 1, visible: true, locked: false, bindTo: 'image', src: '', fit: 'cover' as const, filters: { brightness: 100, contrast: 100, saturation: 110, blur: 0, grayscale: false } } as Layer,
    // Description
    { id: id(), type: 'text', name: 'Description', x: 4, y: 52, width: 54, height: 7, rotation: 0, opacity: 1, visible: true, locked: false, bindTo: 'description', text: '{{description}}', fontSize: 2.3, fontFamily: 'Georgia, serif', fontWeight: 'normal', fontStyle: 'italic', fill: '#4E342E', align: 'center', verticalAlign: 'middle', lineHeight: 1.3, letterSpacing: 0, textDecoration: '' } as Layer,
    // Divider
    { id: id(), type: 'shape', name: 'Divider', x: 10, y: 59.5, width: 42, height: 0.4, rotation: 0, opacity: 0.4, visible: true, locked: true, shapeKind: 'rect', fill: '#2E7D32', stroke: '', strokeWidth: 0 } as Layer,
    // Stats
    ...statRow(61, 0, 'Size', '75', { barBg: '#E8F5E9', barFill: '#43A047', labelColor: '#33691E', valueColor: '#2E7D32', labelFont: 'Georgia, serif' }),
    ...statRow(67, 1, 'Speed', '82', { barBg: '#E8F5E9', barFill: '#43A047', labelColor: '#33691E', valueColor: '#2E7D32', labelFont: 'Georgia, serif' }),
    ...statRow(73, 2, 'Danger', '60', { barBg: '#E8F5E9', barFill: '#43A047', labelColor: '#33691E', valueColor: '#2E7D32', labelFont: 'Georgia, serif' }),
    ...statRow(79, 3, 'Lifespan', '45', { barBg: '#E8F5E9', barFill: '#43A047', labelColor: '#33691E', valueColor: '#2E7D32', labelFont: 'Georgia, serif' }),
    ...statRow(85, 4, 'Rarity', '90', { barBg: '#E8F5E9', barFill: '#43A047', labelColor: '#33691E', valueColor: '#2E7D32', labelFont: 'Georgia, serif' }),
    // Footer
    { id: id(), type: 'shape', name: 'Footer', x: 0, y: 92, width: 62, height: 8, rotation: 0, opacity: 1, visible: true, locked: true, shapeKind: 'rect', fill: '#2E7D32', stroke: '', strokeWidth: 0 } as Layer,
    { id: id(), type: 'text', name: 'Fun Fact', x: 3, y: 93, width: 56, height: 6, rotation: 0, opacity: 1, visible: true, locked: false, bindTo: 'funFact', text: '{{funFact}}', fontSize: 2, fontFamily: 'Georgia, serif', fontWeight: 'normal', fontStyle: 'italic', fill: '#C8E6C9', align: 'center', verticalAlign: 'middle', lineHeight: 1.2, letterSpacing: 0, textDecoration: '' } as Layer,
  ]
}

// ═══════════════════════════════════════════════════════════════
// 4. Speed Machines — Dark metallic, red accents, speedometer
// ═══════════════════════════════════════════════════════════════
const speedMachines: CardTemplate = {
  id: 'tt-speed-machines',
  name: 'Speed Machines',
  description: 'Dark metallic with red accents and speedometer aesthetic.',
  thumbnail: undefined,
  tags: ['vehicles', 'speed', 'metallic', 'dark'],
  builtIn: true,
  createdAt: now,
  updatedAt: now,
  backLayers: null,
  frontLayers: [
    { id: id(), type: 'shape', name: 'Card BG', x: 0, y: 0, width: 62, height: 100, rotation: 0, opacity: 1, visible: true, locked: true, shapeKind: 'rect', fill: '#1A1A1A', stroke: '#333333', strokeWidth: 0.5, cornerRadius: 2 } as Layer,
    // Metallic header
    { id: id(), type: 'shape', name: 'Header Metal', x: 0, y: 0, width: 62, height: 14, rotation: 0, opacity: 1, visible: true, locked: true, shapeKind: 'rect', fill: '#37474F', stroke: '', strokeWidth: 0 } as Layer,
    { id: id(), type: 'shape', name: 'Header Red Line', x: 0, y: 13, width: 62, height: 1.5, rotation: 0, opacity: 1, visible: true, locked: true, shapeKind: 'rect', fill: '#F44336', stroke: '', strokeWidth: 0 } as Layer,
    // Title
    { id: id(), type: 'text', name: 'Card Name', x: 3, y: 2, width: 56, height: 10, rotation: 0, opacity: 1, visible: true, locked: false, bindTo: 'name', text: '{{name}}', fontSize: 5, fontFamily: 'Inter, sans-serif', fontWeight: '900', fontStyle: 'normal', fill: '#F44336', align: 'left', verticalAlign: 'middle', lineHeight: 1.1, letterSpacing: 1.5, textDecoration: '' } as Layer,
    // Image
    { id: id(), type: 'image', name: 'Card Image', x: 2, y: 16, width: 58, height: 36, rotation: 0, opacity: 1, visible: true, locked: false, bindTo: 'image', src: '', fit: 'cover' as const, filters: { brightness: 100, contrast: 115, saturation: 100, blur: 0, grayscale: false } } as Layer,
    // Description
    { id: id(), type: 'text', name: 'Description', x: 4, y: 53, width: 54, height: 6, rotation: 0, opacity: 1, visible: true, locked: false, bindTo: 'description', text: '{{description}}', fontSize: 2.2, fontFamily: 'Inter, sans-serif', fontWeight: 'normal', fontStyle: 'normal', fill: '#9E9E9E', align: 'left', verticalAlign: 'middle', lineHeight: 1.3, letterSpacing: 0, textDecoration: '' } as Layer,
    // Stats
    ...statRow(60, 0, 'Top Speed', '95', { barBg: '#263238', barFill: '#F44336', labelColor: '#B0BEC5', valueColor: '#F44336' }),
    ...statRow(66, 1, '0-60 mph', '88', { barBg: '#263238', barFill: '#F44336', labelColor: '#B0BEC5', valueColor: '#F44336' }),
    ...statRow(72, 2, 'Power (HP)', '78', { barBg: '#263238', barFill: '#F44336', labelColor: '#B0BEC5', valueColor: '#F44336' }),
    ...statRow(78, 3, 'Handling', '70', { barBg: '#263238', barFill: '#F44336', labelColor: '#B0BEC5', valueColor: '#F44336' }),
    ...statRow(84, 4, 'Cool Factor', '92', { barBg: '#263238', barFill: '#F44336', labelColor: '#B0BEC5', valueColor: '#F44336' }),
    // Footer
    { id: id(), type: 'shape', name: 'Footer', x: 0, y: 91, width: 62, height: 9, rotation: 0, opacity: 1, visible: true, locked: true, shapeKind: 'rect', fill: '#37474F', stroke: '', strokeWidth: 0 } as Layer,
    { id: id(), type: 'shape', name: 'Footer Red Line', x: 0, y: 91, width: 62, height: 1, rotation: 0, opacity: 1, visible: true, locked: true, shapeKind: 'rect', fill: '#F44336', stroke: '', strokeWidth: 0 } as Layer,
    { id: id(), type: 'text', name: 'Fun Fact', x: 3, y: 92.5, width: 56, height: 6, rotation: 0, opacity: 1, visible: true, locked: false, bindTo: 'funFact', text: '{{funFact}}', fontSize: 2, fontFamily: 'Inter, sans-serif', fontWeight: 'normal', fontStyle: 'normal', fill: '#78909C', align: 'center', verticalAlign: 'middle', lineHeight: 1.2, letterSpacing: 0, textDecoration: '' } as Layer,
  ]
}

// ═══════════════════════════════════════════════════════════════
// 5. Superheroes — Comic halftone, POW shapes, energy bars
// ═══════════════════════════════════════════════════════════════
const superheroes: CardTemplate = {
  id: 'tt-superheroes',
  name: 'Superheroes',
  description: 'Comic book style with halftone dot patterns and energy stat bars.',
  thumbnail: undefined,
  tags: ['comic', 'superhero', 'bold'],
  builtIn: true,
  createdAt: now,
  updatedAt: now,
  backLayers: null,
  frontLayers: [
    { id: id(), type: 'shape', name: 'Card BG', x: 0, y: 0, width: 62, height: 100, rotation: 0, opacity: 1, visible: true, locked: true, shapeKind: 'rect', fill: '#FFF176', stroke: '#000000', strokeWidth: 1, cornerRadius: 2 } as Layer,
    // Halftone-like dot pattern (approximated with colored blocks)
    { id: id(), type: 'shape', name: 'Dot Pattern', x: 0, y: 0, width: 62, height: 100, rotation: 0, opacity: 0.05, visible: true, locked: true, shapeKind: 'rect', fill: '#FF5722', stroke: '', strokeWidth: 0 } as Layer,
    // Header with POW shape
    { id: id(), type: 'shape', name: 'Header BG', x: 0, y: 0, width: 62, height: 15, rotation: 0, opacity: 1, visible: true, locked: true, shapeKind: 'rect', fill: '#D32F2F', stroke: '#000000', strokeWidth: 0.8 } as Layer,
    { id: id(), type: 'shape', name: 'Header Inner', x: 1, y: 1, width: 60, height: 13, rotation: 0, opacity: 0.3, visible: true, locked: true, shapeKind: 'rect', fill: '#FF8A65', stroke: '', strokeWidth: 0 } as Layer,
    // Title
    { id: id(), type: 'text', name: 'Card Name', x: 3, y: 1, width: 56, height: 13, rotation: 0, opacity: 1, visible: true, locked: false, bindTo: 'name', text: '{{name}}', fontSize: 6, fontFamily: 'Impact, sans-serif', fontWeight: 'bold', fontStyle: 'normal', fill: '#FFFFFF', align: 'center', verticalAlign: 'middle', lineHeight: 1, letterSpacing: 1, textDecoration: '', stroke: '#000000', strokeWidth: 0.5 } as Layer,
    // Image
    { id: id(), type: 'shape', name: 'Image Border', x: 3, y: 17, width: 56, height: 34, rotation: 0, opacity: 1, visible: true, locked: true, shapeKind: 'rect', fill: '#000000', stroke: '', strokeWidth: 0, cornerRadius: 0 } as Layer,
    { id: id(), type: 'image', name: 'Card Image', x: 4, y: 18, width: 54, height: 32, rotation: 0, opacity: 1, visible: true, locked: false, bindTo: 'image', src: '', fit: 'cover' as const, filters: { brightness: 105, contrast: 115, saturation: 120, blur: 0, grayscale: false } } as Layer,
    // Description
    { id: id(), type: 'text', name: 'Description', x: 4, y: 52, width: 54, height: 7, rotation: 0, opacity: 1, visible: true, locked: false, bindTo: 'description', text: '{{description}}', fontSize: 2.3, fontFamily: 'Inter, sans-serif', fontWeight: 'bold', fontStyle: 'normal', fill: '#333333', align: 'center', verticalAlign: 'middle', lineHeight: 1.3, letterSpacing: 0, textDecoration: '' } as Layer,
    // Stats (energy bars)
    ...statRow(60, 0, 'Strength', '95', { barBg: '#FFECB3', barFill: '#FF6F00', labelColor: '#333333', valueColor: '#D32F2F', labelFont: 'Impact, sans-serif', barRadius: 0 }),
    ...statRow(66, 1, 'Speed', '80', { barBg: '#FFECB3', barFill: '#FF6F00', labelColor: '#333333', valueColor: '#D32F2F', labelFont: 'Impact, sans-serif', barRadius: 0 }),
    ...statRow(72, 2, 'Intelligence', '88', { barBg: '#FFECB3', barFill: '#FF6F00', labelColor: '#333333', valueColor: '#D32F2F', labelFont: 'Impact, sans-serif', barRadius: 0 }),
    ...statRow(78, 3, 'Durability', '75', { barBg: '#FFECB3', barFill: '#FF6F00', labelColor: '#333333', valueColor: '#D32F2F', labelFont: 'Impact, sans-serif', barRadius: 0 }),
    ...statRow(84, 4, 'Fighting', '92', { barBg: '#FFECB3', barFill: '#FF6F00', labelColor: '#333333', valueColor: '#D32F2F', labelFont: 'Impact, sans-serif', barRadius: 0 }),
    // Footer
    { id: id(), type: 'shape', name: 'Footer', x: 0, y: 91, width: 62, height: 9, rotation: 0, opacity: 1, visible: true, locked: true, shapeKind: 'rect', fill: '#D32F2F', stroke: '#000000', strokeWidth: 0.8 } as Layer,
    { id: id(), type: 'text', name: 'Fun Fact', x: 3, y: 92, width: 56, height: 7, rotation: 0, opacity: 1, visible: true, locked: false, bindTo: 'funFact', text: '{{funFact}}', fontSize: 2, fontFamily: 'Impact, sans-serif', fontWeight: 'normal', fontStyle: 'normal', fill: '#FFF176', align: 'center', verticalAlign: 'middle', lineHeight: 1.2, letterSpacing: 0.5, textDecoration: '' } as Layer,
  ]
}

// ═══════════════════════════════════════════════════════════════
// 6. Space Explorer — Deep space, neon stat bars, tech font
// ═══════════════════════════════════════════════════════════════
const spaceExplorer: CardTemplate = {
  id: 'tt-space-explorer',
  name: 'Space Explorer',
  description: 'Deep space dark background with holographic neon stat bars.',
  thumbnail: undefined,
  tags: ['space', 'sci-fi', 'neon', 'dark'],
  builtIn: true,
  createdAt: now,
  updatedAt: now,
  backLayers: null,
  frontLayers: [
    { id: id(), type: 'shape', name: 'Card BG', x: 0, y: 0, width: 62, height: 100, rotation: 0, opacity: 1, visible: true, locked: true, shapeKind: 'rect', fill: '#0A0E27', stroke: '#1A237E', strokeWidth: 0.5, cornerRadius: 2 } as Layer,
    // Stars effect (subtle lighter rect)
    { id: id(), type: 'shape', name: 'Stars Overlay', x: 0, y: 0, width: 62, height: 100, rotation: 0, opacity: 0.03, visible: true, locked: true, shapeKind: 'rect', fill: '#E8EAF6', stroke: '', strokeWidth: 0 } as Layer,
    // Header
    { id: id(), type: 'shape', name: 'Header', x: 0, y: 0, width: 62, height: 14, rotation: 0, opacity: 0.8, visible: true, locked: true, shapeKind: 'rect', fill: '#1A237E', stroke: '', strokeWidth: 0 } as Layer,
    { id: id(), type: 'shape', name: 'Header Glow', x: 0, y: 12, width: 62, height: 2, rotation: 0, opacity: 0.6, visible: true, locked: true, shapeKind: 'rect', fill: '#00E5FF', stroke: '', strokeWidth: 0 } as Layer,
    // Title
    { id: id(), type: 'text', name: 'Card Name', x: 3, y: 2, width: 56, height: 10, rotation: 0, opacity: 1, visible: true, locked: false, bindTo: 'name', text: '{{name}}', fontSize: 5, fontFamily: 'Inter, sans-serif', fontWeight: '700', fontStyle: 'normal', fill: '#00E5FF', align: 'center', verticalAlign: 'middle', lineHeight: 1.1, letterSpacing: 2, textDecoration: '' } as Layer,
    // Image
    { id: id(), type: 'image', name: 'Card Image', x: 3, y: 16, width: 56, height: 34, rotation: 0, opacity: 1, visible: true, locked: false, bindTo: 'image', src: '', fit: 'cover' as const, filters: { brightness: 100, contrast: 100, saturation: 100, blur: 0, grayscale: false } } as Layer,
    // Description
    { id: id(), type: 'text', name: 'Description', x: 4, y: 52, width: 54, height: 7, rotation: 0, opacity: 1, visible: true, locked: false, bindTo: 'description', text: '{{description}}', fontSize: 2.2, fontFamily: 'Inter, sans-serif', fontWeight: 'normal', fontStyle: 'normal', fill: '#7986CB', align: 'center', verticalAlign: 'middle', lineHeight: 1.3, letterSpacing: 0.5, textDecoration: '' } as Layer,
    // Neon stats
    ...statRow(60, 0, 'Distance (ly)', '88', { barBg: '#0D1642', barFill: '#00E5FF', labelColor: '#B0BEC5', valueColor: '#00E5FF', barOpacity: 0.8 }),
    ...statRow(66, 1, 'Temperature', '65', { barBg: '#0D1642', barFill: '#76FF03', labelColor: '#B0BEC5', valueColor: '#76FF03', barOpacity: 0.8 }),
    ...statRow(72, 2, 'Mass', '92', { barBg: '#0D1642', barFill: '#E040FB', labelColor: '#B0BEC5', valueColor: '#E040FB', barOpacity: 0.8 }),
    ...statRow(78, 3, 'Gravity', '55', { barBg: '#0D1642', barFill: '#FFAB40', labelColor: '#B0BEC5', valueColor: '#FFAB40', barOpacity: 0.8 }),
    ...statRow(84, 4, 'Habitable', '30', { barBg: '#0D1642', barFill: '#69F0AE', labelColor: '#B0BEC5', valueColor: '#69F0AE', barOpacity: 0.8 }),
    // Footer
    { id: id(), type: 'shape', name: 'Footer', x: 0, y: 92, width: 62, height: 8, rotation: 0, opacity: 0.8, visible: true, locked: true, shapeKind: 'rect', fill: '#1A237E', stroke: '', strokeWidth: 0 } as Layer,
    { id: id(), type: 'text', name: 'Fun Fact', x: 3, y: 93, width: 56, height: 6, rotation: 0, opacity: 1, visible: true, locked: false, bindTo: 'funFact', text: '{{funFact}}', fontSize: 2, fontFamily: 'Inter, sans-serif', fontWeight: 'normal', fontStyle: 'normal', fill: '#536DFE', align: 'center', verticalAlign: 'middle', lineHeight: 1.2, letterSpacing: 0.5, textDecoration: '' } as Layer,
  ]
}

// ═══════════════════════════════════════════════════════════════
// 7. History Legends — Parchment, serif fonts, vintage feel
// ═══════════════════════════════════════════════════════════════
const historyLegends: CardTemplate = {
  id: 'tt-history-legends',
  name: 'History Legends',
  description: 'Parchment background with serif fonts and vintage feel.',
  thumbnail: undefined,
  tags: ['history', 'vintage', 'parchment'],
  builtIn: true,
  createdAt: now,
  updatedAt: now,
  backLayers: null,
  frontLayers: [
    { id: id(), type: 'shape', name: 'Card BG', x: 0, y: 0, width: 62, height: 100, rotation: 0, opacity: 1, visible: true, locked: true, shapeKind: 'rect', fill: '#F5F0E1', stroke: '#8D6E63', strokeWidth: 1, cornerRadius: 2 } as Layer,
    // Aged paper overlay
    { id: id(), type: 'shape', name: 'Parchment Tint', x: 1, y: 1, width: 60, height: 98, rotation: 0, opacity: 0.15, visible: true, locked: true, shapeKind: 'rect', fill: '#D7CCC8', stroke: '', strokeWidth: 0, cornerRadius: 1 } as Layer,
    // Header
    { id: id(), type: 'shape', name: 'Header', x: 0, y: 0, width: 62, height: 14, rotation: 0, opacity: 1, visible: true, locked: true, shapeKind: 'rect', fill: '#5D4037', stroke: '', strokeWidth: 0 } as Layer,
    { id: id(), type: 'shape', name: 'Header Gold Line', x: 0, y: 13, width: 62, height: 1.5, rotation: 0, opacity: 1, visible: true, locked: true, shapeKind: 'rect', fill: '#C8A951', stroke: '', strokeWidth: 0 } as Layer,
    // Title
    { id: id(), type: 'text', name: 'Card Name', x: 3, y: 2, width: 56, height: 10, rotation: 0, opacity: 1, visible: true, locked: false, bindTo: 'name', text: '{{name}}', fontSize: 5, fontFamily: 'Georgia, serif', fontWeight: 'bold', fontStyle: 'normal', fill: '#C8A951', align: 'center', verticalAlign: 'middle', lineHeight: 1.1, letterSpacing: 1, textDecoration: '' } as Layer,
    // Image with vintage frame
    { id: id(), type: 'shape', name: 'Image Frame', x: 5, y: 17, width: 52, height: 33, rotation: 0, opacity: 1, visible: true, locked: true, shapeKind: 'rect', fill: '#8D6E63', stroke: '#C8A951', strokeWidth: 0.5, cornerRadius: 1 } as Layer,
    { id: id(), type: 'image', name: 'Card Image', x: 6, y: 18, width: 50, height: 31, rotation: 0, opacity: 1, visible: true, locked: false, bindTo: 'image', src: '', fit: 'cover' as const, filters: { brightness: 95, contrast: 100, saturation: 80, blur: 0, grayscale: false } } as Layer,
    // Description
    { id: id(), type: 'text', name: 'Description', x: 4, y: 52, width: 54, height: 7, rotation: 0, opacity: 1, visible: true, locked: false, bindTo: 'description', text: '{{description}}', fontSize: 2.2, fontFamily: 'Georgia, serif', fontWeight: 'normal', fontStyle: 'italic', fill: '#5D4037', align: 'center', verticalAlign: 'middle', lineHeight: 1.3, letterSpacing: 0, textDecoration: '' } as Layer,
    // Ornamental divider
    { id: id(), type: 'shape', name: 'Divider', x: 15, y: 59.5, width: 32, height: 0.3, rotation: 0, opacity: 0.5, visible: true, locked: true, shapeKind: 'rect', fill: '#C8A951', stroke: '', strokeWidth: 0 } as Layer,
    // Stats
    ...statRow(61, 0, 'Reign (yrs)', '45', { barBg: '#EFEBE9', barFill: '#8D6E63', labelColor: '#5D4037', valueColor: '#5D4037', labelFont: 'Georgia, serif', valueFont: 'Georgia, serif' }),
    ...statRow(67, 1, 'Battles Won', '82', { barBg: '#EFEBE9', barFill: '#8D6E63', labelColor: '#5D4037', valueColor: '#5D4037', labelFont: 'Georgia, serif', valueFont: 'Georgia, serif' }),
    ...statRow(73, 2, 'Influence', '90', { barBg: '#EFEBE9', barFill: '#8D6E63', labelColor: '#5D4037', valueColor: '#5D4037', labelFont: 'Georgia, serif', valueFont: 'Georgia, serif' }),
    ...statRow(79, 3, 'Wealth', '68', { barBg: '#EFEBE9', barFill: '#8D6E63', labelColor: '#5D4037', valueColor: '#5D4037', labelFont: 'Georgia, serif', valueFont: 'Georgia, serif' }),
    ...statRow(85, 4, 'Legacy', '95', { barBg: '#EFEBE9', barFill: '#8D6E63', labelColor: '#5D4037', valueColor: '#5D4037', labelFont: 'Georgia, serif', valueFont: 'Georgia, serif' }),
    // Footer
    { id: id(), type: 'shape', name: 'Footer', x: 0, y: 92, width: 62, height: 8, rotation: 0, opacity: 1, visible: true, locked: true, shapeKind: 'rect', fill: '#5D4037', stroke: '', strokeWidth: 0 } as Layer,
    { id: id(), type: 'text', name: 'Fun Fact', x: 3, y: 93, width: 56, height: 6, rotation: 0, opacity: 1, visible: true, locked: false, bindTo: 'funFact', text: '{{funFact}}', fontSize: 2, fontFamily: 'Georgia, serif', fontWeight: 'normal', fontStyle: 'italic', fill: '#BCAAA4', align: 'center', verticalAlign: 'middle', lineHeight: 1.2, letterSpacing: 0, textDecoration: '' } as Layer,
  ]
}

// ═══════════════════════════════════════════════════════════════
// 8. Food & Cooking — Warm yellows/oranges, recipe-card style
// ═══════════════════════════════════════════════════════════════
const foodCooking: CardTemplate = {
  id: 'tt-food-cooking',
  name: 'Food & Cooking',
  description: 'Warm yellows and oranges with recipe-card style and star ratings.',
  thumbnail: undefined,
  tags: ['food', 'cooking', 'warm', 'recipe'],
  builtIn: true,
  createdAt: now,
  updatedAt: now,
  backLayers: null,
  frontLayers: [
    { id: id(), type: 'shape', name: 'Card BG', x: 0, y: 0, width: 62, height: 100, rotation: 0, opacity: 1, visible: true, locked: true, shapeKind: 'rect', fill: '#FFF8E1', stroke: '#FFB74D', strokeWidth: 0.8, cornerRadius: 3 } as Layer,
    // Warm header
    { id: id(), type: 'shape', name: 'Header', x: 0, y: 0, width: 62, height: 14, rotation: 0, opacity: 1, visible: true, locked: true, shapeKind: 'rect', fill: '#E65100', stroke: '', strokeWidth: 0 } as Layer,
    { id: id(), type: 'shape', name: 'Header Warm Glow', x: 0, y: 10, width: 62, height: 5, rotation: 0, opacity: 0.4, visible: true, locked: true, shapeKind: 'rect', fill: '#FF9800', stroke: '', strokeWidth: 0 } as Layer,
    // Title
    { id: id(), type: 'text', name: 'Card Name', x: 3, y: 2, width: 56, height: 10, rotation: 0, opacity: 1, visible: true, locked: false, bindTo: 'name', text: '{{name}}', fontSize: 5, fontFamily: 'Georgia, serif', fontWeight: 'bold', fontStyle: 'normal', fill: '#ffffff', align: 'center', verticalAlign: 'middle', lineHeight: 1.1, letterSpacing: 0.5, textDecoration: '' } as Layer,
    // Image
    { id: id(), type: 'shape', name: 'Image Frame', x: 4, y: 17, width: 54, height: 33, rotation: 0, opacity: 1, visible: true, locked: true, shapeKind: 'rect', fill: '#FFE0B2', stroke: '#FFB74D', strokeWidth: 0.5, cornerRadius: 3 } as Layer,
    { id: id(), type: 'image', name: 'Card Image', x: 5, y: 18, width: 52, height: 31, rotation: 0, opacity: 1, visible: true, locked: false, bindTo: 'image', src: '', fit: 'cover' as const, filters: { brightness: 105, contrast: 100, saturation: 110, blur: 0, grayscale: false } } as Layer,
    // Description
    { id: id(), type: 'text', name: 'Description', x: 4, y: 52, width: 54, height: 7, rotation: 0, opacity: 1, visible: true, locked: false, bindTo: 'description', text: '{{description}}', fontSize: 2.3, fontFamily: 'Georgia, serif', fontWeight: 'normal', fontStyle: 'italic', fill: '#795548', align: 'center', verticalAlign: 'middle', lineHeight: 1.3, letterSpacing: 0, textDecoration: '' } as Layer,
    // Dashed divider
    { id: id(), type: 'shape', name: 'Divider', x: 4, y: 59.5, width: 54, height: 0.3, rotation: 0, opacity: 0.4, visible: true, locked: true, shapeKind: 'rect', fill: '#E65100', stroke: '', strokeWidth: 0 } as Layer,
    // Stats
    ...statRow(61, 0, 'Tastiness', '92', { barBg: '#FFF3E0', barFill: '#FF9800', labelColor: '#5D4037', valueColor: '#E65100', labelFont: 'Georgia, serif' }),
    ...statRow(67, 1, 'Difficulty', '65', { barBg: '#FFF3E0', barFill: '#FF9800', labelColor: '#5D4037', valueColor: '#E65100', labelFont: 'Georgia, serif' }),
    ...statRow(73, 2, 'Prep Time', '40', { barBg: '#FFF3E0', barFill: '#FF9800', labelColor: '#5D4037', valueColor: '#E65100', labelFont: 'Georgia, serif' }),
    ...statRow(79, 3, 'Calories', '78', { barBg: '#FFF3E0', barFill: '#FF9800', labelColor: '#5D4037', valueColor: '#E65100', labelFont: 'Georgia, serif' }),
    ...statRow(85, 4, 'Popularity', '88', { barBg: '#FFF3E0', barFill: '#FF9800', labelColor: '#5D4037', valueColor: '#E65100', labelFont: 'Georgia, serif' }),
    // Footer
    { id: id(), type: 'shape', name: 'Footer', x: 0, y: 92, width: 62, height: 8, rotation: 0, opacity: 1, visible: true, locked: true, shapeKind: 'rect', fill: '#E65100', stroke: '', strokeWidth: 0 } as Layer,
    { id: id(), type: 'text', name: 'Fun Fact', x: 3, y: 93, width: 56, height: 6, rotation: 0, opacity: 1, visible: true, locked: false, bindTo: 'funFact', text: '{{funFact}}', fontSize: 2, fontFamily: 'Georgia, serif', fontWeight: 'normal', fontStyle: 'normal', fill: '#FFE0B2', align: 'center', verticalAlign: 'middle', lineHeight: 1.2, letterSpacing: 0, textDecoration: '' } as Layer,
  ]
}

// ═══════════════════════════════════════════════════════════════
// 9. Music & Culture — Neon gradient, equalizer-style bars
// ═══════════════════════════════════════════════════════════════
const musicCulture: CardTemplate = {
  id: 'tt-music-culture',
  name: 'Music & Culture',
  description: 'Neon gradient vibes with bold sans-serif and equalizer-style stat bars.',
  thumbnail: undefined,
  tags: ['music', 'neon', 'culture', 'gradient'],
  builtIn: true,
  createdAt: now,
  updatedAt: now,
  backLayers: null,
  frontLayers: [
    { id: id(), type: 'shape', name: 'Card BG', x: 0, y: 0, width: 62, height: 100, rotation: 0, opacity: 1, visible: true, locked: true, shapeKind: 'rect', fill: '#1A1A2E', stroke: '', strokeWidth: 0, cornerRadius: 2 } as Layer,
    // Gradient layers
    { id: id(), type: 'shape', name: 'Gradient Purple', x: 0, y: 0, width: 62, height: 50, rotation: 0, opacity: 0.3, visible: true, locked: true, shapeKind: 'rect', fill: '#9C27B0', stroke: '', strokeWidth: 0 } as Layer,
    { id: id(), type: 'shape', name: 'Gradient Pink', x: 0, y: 30, width: 62, height: 40, rotation: 0, opacity: 0.15, visible: true, locked: true, shapeKind: 'rect', fill: '#E91E63', stroke: '', strokeWidth: 0 } as Layer,
    // Header
    { id: id(), type: 'shape', name: 'Header Glow', x: 0, y: 0, width: 62, height: 15, rotation: 0, opacity: 0.5, visible: true, locked: true, shapeKind: 'rect', fill: '#7B1FA2', stroke: '', strokeWidth: 0 } as Layer,
    // Title
    { id: id(), type: 'text', name: 'Card Name', x: 3, y: 2, width: 56, height: 11, rotation: 0, opacity: 1, visible: true, locked: false, bindTo: 'name', text: '{{name}}', fontSize: 5.5, fontFamily: 'Inter, sans-serif', fontWeight: '900', fontStyle: 'normal', fill: '#E040FB', align: 'center', verticalAlign: 'middle', lineHeight: 1.1, letterSpacing: 1, textDecoration: '' } as Layer,
    // Image
    { id: id(), type: 'image', name: 'Card Image', x: 3, y: 16, width: 56, height: 34, rotation: 0, opacity: 1, visible: true, locked: false, bindTo: 'image', src: '', fit: 'cover' as const, filters: { brightness: 100, contrast: 100, saturation: 100, blur: 0, grayscale: false } } as Layer,
    // Description
    { id: id(), type: 'text', name: 'Description', x: 4, y: 52, width: 54, height: 7, rotation: 0, opacity: 1, visible: true, locked: false, bindTo: 'description', text: '{{description}}', fontSize: 2.2, fontFamily: 'Inter, sans-serif', fontWeight: 'normal', fontStyle: 'normal', fill: '#CE93D8', align: 'center', verticalAlign: 'middle', lineHeight: 1.3, letterSpacing: 0.3, textDecoration: '' } as Layer,
    // Equalizer stats
    ...statRow(60, 0, 'Hits', '88', { barBg: '#2A1A3E', barFill: '#E040FB', labelColor: '#CE93D8', valueColor: '#E040FB' }),
    ...statRow(66, 1, 'Albums', '72', { barBg: '#2A1A3E', barFill: '#00BCD4', labelColor: '#CE93D8', valueColor: '#00BCD4' }),
    ...statRow(72, 2, 'Fame', '95', { barBg: '#2A1A3E', barFill: '#FF4081', labelColor: '#CE93D8', valueColor: '#FF4081' }),
    ...statRow(78, 3, 'Influence', '80', { barBg: '#2A1A3E', barFill: '#76FF03', labelColor: '#CE93D8', valueColor: '#76FF03' }),
    ...statRow(84, 4, 'Live Shows', '65', { barBg: '#2A1A3E', barFill: '#FFAB40', labelColor: '#CE93D8', valueColor: '#FFAB40' }),
    // Footer
    { id: id(), type: 'shape', name: 'Footer', x: 0, y: 92, width: 62, height: 8, rotation: 0, opacity: 0.7, visible: true, locked: true, shapeKind: 'rect', fill: '#7B1FA2', stroke: '', strokeWidth: 0 } as Layer,
    { id: id(), type: 'text', name: 'Fun Fact', x: 3, y: 93, width: 56, height: 6, rotation: 0, opacity: 1, visible: true, locked: false, bindTo: 'funFact', text: '{{funFact}}', fontSize: 2, fontFamily: 'Inter, sans-serif', fontWeight: 'normal', fontStyle: 'normal', fill: '#CE93D8', align: 'center', verticalAlign: 'middle', lineHeight: 1.2, letterSpacing: 0, textDecoration: '' } as Layer,
  ]
}

// ═══════════════════════════════════════════════════════════════
// 10. Kids Cartoon — Bright primary colors, bubbly everything
// ═══════════════════════════════════════════════════════════════
const kidsCartoon: CardTemplate = {
  id: 'tt-kids-cartoon',
  name: 'Kids Cartoon',
  description: 'Bright primary colors with bubbly rounded shapes and fun vibes.',
  thumbnail: undefined,
  tags: ['kids', 'cartoon', 'colorful', 'fun'],
  builtIn: true,
  createdAt: now,
  updatedAt: now,
  backLayers: null,
  frontLayers: [
    { id: id(), type: 'shape', name: 'Card BG', x: 0, y: 0, width: 62, height: 100, rotation: 0, opacity: 1, visible: true, locked: true, shapeKind: 'rect', fill: '#FFEB3B', stroke: '#FF9800', strokeWidth: 1.5, cornerRadius: 4 } as Layer,
    // Colorful accent blocks
    { id: id(), type: 'shape', name: 'Blue Corner', x: 0, y: 0, width: 20, height: 8, rotation: 0, opacity: 0.3, visible: true, locked: true, shapeKind: 'rect', fill: '#2196F3', stroke: '', strokeWidth: 0, cornerRadius: 4 } as Layer,
    { id: id(), type: 'shape', name: 'Green Corner', x: 42, y: 0, width: 20, height: 8, rotation: 0, opacity: 0.3, visible: true, locked: true, shapeKind: 'rect', fill: '#4CAF50', stroke: '', strokeWidth: 0, cornerRadius: 4 } as Layer,
    // Header
    { id: id(), type: 'shape', name: 'Header', x: 2, y: 2, width: 58, height: 12, rotation: 0, opacity: 1, visible: true, locked: true, shapeKind: 'rect', fill: '#FF5722', stroke: '#E64A19', strokeWidth: 0.5, cornerRadius: 6 } as Layer,
    // Title
    { id: id(), type: 'text', name: 'Card Name', x: 4, y: 3, width: 54, height: 10, rotation: 0, opacity: 1, visible: true, locked: false, bindTo: 'name', text: '{{name}}', fontSize: 5.5, fontFamily: 'Inter, sans-serif', fontWeight: '900', fontStyle: 'normal', fill: '#ffffff', align: 'center', verticalAlign: 'middle', lineHeight: 1.1, letterSpacing: 0.5, textDecoration: '' } as Layer,
    // Image with rounded border
    { id: id(), type: 'shape', name: 'Image Frame', x: 4, y: 16, width: 54, height: 33, rotation: 0, opacity: 1, visible: true, locked: true, shapeKind: 'rect', fill: '#ffffff', stroke: '#FF9800', strokeWidth: 1, cornerRadius: 5 } as Layer,
    { id: id(), type: 'image', name: 'Card Image', x: 5, y: 17, width: 52, height: 31, rotation: 0, opacity: 1, visible: true, locked: false, bindTo: 'image', src: '', fit: 'cover' as const, filters: { brightness: 105, contrast: 100, saturation: 115, blur: 0, grayscale: false } } as Layer,
    // Description
    { id: id(), type: 'text', name: 'Description', x: 4, y: 51, width: 54, height: 7, rotation: 0, opacity: 1, visible: true, locked: false, bindTo: 'description', text: '{{description}}', fontSize: 2.4, fontFamily: 'Inter, sans-serif', fontWeight: 'bold', fontStyle: 'normal', fill: '#333333', align: 'center', verticalAlign: 'middle', lineHeight: 1.3, letterSpacing: 0, textDecoration: '' } as Layer,
    // Stats with colorful bars
    ...statRow(59, 0, 'Cuteness', '95', { barBg: '#FFF9C4', barFill: '#FF5722', labelColor: '#333333', valueColor: '#FF5722', barRadius: 3 }),
    ...statRow(65, 1, 'Silliness', '88', { barBg: '#E1F5FE', barFill: '#2196F3', labelColor: '#333333', valueColor: '#2196F3', barRadius: 3 }),
    ...statRow(71, 2, 'Bravery', '72', { barBg: '#E8F5E9', barFill: '#4CAF50', labelColor: '#333333', valueColor: '#4CAF50', barRadius: 3 }),
    ...statRow(77, 3, 'Fun Level', '90', { barBg: '#F3E5F5', barFill: '#9C27B0', labelColor: '#333333', valueColor: '#9C27B0', barRadius: 3 }),
    ...statRow(83, 4, 'Magic', '80', { barBg: '#FFF3E0', barFill: '#FF9800', labelColor: '#333333', valueColor: '#FF9800', barRadius: 3 }),
    // Footer
    { id: id(), type: 'shape', name: 'Footer', x: 2, y: 90, width: 58, height: 8, rotation: 0, opacity: 1, visible: true, locked: true, shapeKind: 'rect', fill: '#FF5722', stroke: '', strokeWidth: 0, cornerRadius: 4 } as Layer,
    { id: id(), type: 'text', name: 'Fun Fact', x: 4, y: 91, width: 54, height: 6, rotation: 0, opacity: 1, visible: true, locked: false, bindTo: 'funFact', text: '{{funFact}}', fontSize: 2, fontFamily: 'Inter, sans-serif', fontWeight: 'bold', fontStyle: 'normal', fill: '#ffffff', align: 'center', verticalAlign: 'middle', lineHeight: 1.2, letterSpacing: 0, textDecoration: '' } as Layer,
  ]
}

// ═══════════════════════════════════════════════════════════════
// 11. Photo Minimal — Full-bleed image, translucent overlay
// ═══════════════════════════════════════════════════════════════
const photoMinimal: CardTemplate = {
  id: 'tt-photo-minimal',
  name: 'Photo Minimal',
  description: 'Full-bleed image with translucent stat overlay for clean modern look.',
  thumbnail: undefined,
  tags: ['photo', 'minimal', 'modern', 'clean'],
  builtIn: true,
  createdAt: now,
  updatedAt: now,
  backLayers: null,
  frontLayers: [
    // Full bleed image
    { id: id(), type: 'image', name: 'Card Image', x: 0, y: 0, width: 62, height: 100, rotation: 0, opacity: 1, visible: true, locked: false, bindTo: 'image', src: '', fit: 'cover' as const, filters: { brightness: 100, contrast: 100, saturation: 100, blur: 0, grayscale: false } } as Layer,
    // Top name overlay
    { id: id(), type: 'shape', name: 'Name Overlay', x: 0, y: 0, width: 62, height: 14, rotation: 0, opacity: 0.7, visible: true, locked: true, shapeKind: 'rect', fill: '#000000', stroke: '', strokeWidth: 0 } as Layer,
    { id: id(), type: 'text', name: 'Card Name', x: 4, y: 2, width: 54, height: 10, rotation: 0, opacity: 1, visible: true, locked: false, bindTo: 'name', text: '{{name}}', fontSize: 5, fontFamily: 'Inter, sans-serif', fontWeight: '300', fontStyle: 'normal', fill: '#ffffff', align: 'left', verticalAlign: 'middle', lineHeight: 1.1, letterSpacing: 1, textDecoration: '' } as Layer,
    // Bottom translucent stat area
    { id: id(), type: 'shape', name: 'Stat Overlay', x: 0, y: 50, width: 62, height: 50, rotation: 0, opacity: 0.75, visible: true, locked: true, shapeKind: 'rect', fill: '#000000', stroke: '', strokeWidth: 0 } as Layer,
    // Description
    { id: id(), type: 'text', name: 'Description', x: 4, y: 52, width: 54, height: 7, rotation: 0, opacity: 1, visible: true, locked: false, bindTo: 'description', text: '{{description}}', fontSize: 2.2, fontFamily: 'Inter, sans-serif', fontWeight: '300', fontStyle: 'normal', fill: '#E0E0E0', align: 'left', verticalAlign: 'middle', lineHeight: 1.3, letterSpacing: 0.3, textDecoration: '' } as Layer,
    // Thin white divider
    { id: id(), type: 'shape', name: 'Divider', x: 4, y: 59.5, width: 54, height: 0.2, rotation: 0, opacity: 0.4, visible: true, locked: true, shapeKind: 'rect', fill: '#ffffff', stroke: '', strokeWidth: 0 } as Layer,
    // Stats - minimal style
    ...statRow(61, 0, 'Category 1', '85', { barBg: 'transparent', barFill: '#ffffff', labelColor: '#BDBDBD', valueColor: '#ffffff', barOpacity: 0.1, barHeight: 5 }),
    ...statRow(67, 1, 'Category 2', '72', { barBg: 'transparent', barFill: '#ffffff', labelColor: '#BDBDBD', valueColor: '#ffffff', barOpacity: 0.1, barHeight: 5 }),
    ...statRow(73, 2, 'Category 3', '90', { barBg: 'transparent', barFill: '#ffffff', labelColor: '#BDBDBD', valueColor: '#ffffff', barOpacity: 0.1, barHeight: 5 }),
    ...statRow(79, 3, 'Category 4', '65', { barBg: 'transparent', barFill: '#ffffff', labelColor: '#BDBDBD', valueColor: '#ffffff', barOpacity: 0.1, barHeight: 5 }),
    ...statRow(85, 4, 'Category 5', '78', { barBg: 'transparent', barFill: '#ffffff', labelColor: '#BDBDBD', valueColor: '#ffffff', barOpacity: 0.1, barHeight: 5 }),
    // Fun fact
    { id: id(), type: 'text', name: 'Fun Fact', x: 4, y: 92, width: 54, height: 6, rotation: 0, opacity: 0.7, visible: true, locked: false, bindTo: 'funFact', text: '{{funFact}}', fontSize: 1.8, fontFamily: 'Inter, sans-serif', fontWeight: '300', fontStyle: 'italic', fill: '#9E9E9E', align: 'center', verticalAlign: 'middle', lineHeight: 1.2, letterSpacing: 0.3, textDecoration: '' } as Layer,
  ]
}

// ═══════════════════════════════════════════════════════════════
// 12. Premium Gold — Black & gold, luxury embossed feel
// ═══════════════════════════════════════════════════════════════
const premiumGold: CardTemplate = {
  id: 'tt-premium-gold',
  name: 'Premium Gold',
  description: 'Black and gold luxury design with elegant embossed feel.',
  thumbnail: undefined,
  tags: ['premium', 'gold', 'luxury', 'elegant'],
  builtIn: true,
  createdAt: now,
  updatedAt: now,
  backLayers: null,
  frontLayers: [
    { id: id(), type: 'shape', name: 'Card BG', x: 0, y: 0, width: 62, height: 100, rotation: 0, opacity: 1, visible: true, locked: true, shapeKind: 'rect', fill: '#0A0A0A', stroke: '#C9A84C', strokeWidth: 1, cornerRadius: 2 } as Layer,
    // Gold inner border
    { id: id(), type: 'shape', name: 'Inner Border', x: 2, y: 2, width: 58, height: 96, rotation: 0, opacity: 0.15, visible: true, locked: true, shapeKind: 'rect', fill: 'transparent', stroke: '#C9A84C', strokeWidth: 0.3, cornerRadius: 1 } as Layer,
    // Header
    { id: id(), type: 'shape', name: 'Header Accent', x: 4, y: 4, width: 54, height: 0.5, rotation: 0, opacity: 0.6, visible: true, locked: true, shapeKind: 'rect', fill: '#C9A84C', stroke: '', strokeWidth: 0 } as Layer,
    // Title
    { id: id(), type: 'text', name: 'Card Name', x: 4, y: 5, width: 54, height: 10, rotation: 0, opacity: 1, visible: true, locked: false, bindTo: 'name', text: '{{name}}', fontSize: 5, fontFamily: 'Georgia, serif', fontWeight: 'bold', fontStyle: 'normal', fill: '#C9A84C', align: 'center', verticalAlign: 'middle', lineHeight: 1.1, letterSpacing: 2, textDecoration: '' } as Layer,
    { id: id(), type: 'shape', name: 'Title Underline', x: 15, y: 15, width: 32, height: 0.3, rotation: 0, opacity: 0.5, visible: true, locked: true, shapeKind: 'rect', fill: '#C9A84C', stroke: '', strokeWidth: 0 } as Layer,
    // Image with gold frame
    { id: id(), type: 'shape', name: 'Image Frame', x: 5, y: 17, width: 52, height: 33, rotation: 0, opacity: 1, visible: true, locked: true, shapeKind: 'rect', fill: '#1A1A1A', stroke: '#C9A84C', strokeWidth: 0.5, cornerRadius: 1 } as Layer,
    { id: id(), type: 'image', name: 'Card Image', x: 6, y: 18, width: 50, height: 31, rotation: 0, opacity: 1, visible: true, locked: false, bindTo: 'image', src: '', fit: 'cover' as const, filters: { brightness: 95, contrast: 110, saturation: 90, blur: 0, grayscale: false } } as Layer,
    // Description
    { id: id(), type: 'text', name: 'Description', x: 5, y: 52, width: 52, height: 7, rotation: 0, opacity: 1, visible: true, locked: false, bindTo: 'description', text: '{{description}}', fontSize: 2.2, fontFamily: 'Georgia, serif', fontWeight: 'normal', fontStyle: 'italic', fill: '#8D8D8D', align: 'center', verticalAlign: 'middle', lineHeight: 1.3, letterSpacing: 0.3, textDecoration: '' } as Layer,
    // Gold divider
    { id: id(), type: 'shape', name: 'Divider', x: 10, y: 59.5, width: 42, height: 0.3, rotation: 0, opacity: 0.5, visible: true, locked: true, shapeKind: 'rect', fill: '#C9A84C', stroke: '', strokeWidth: 0 } as Layer,
    // Stats - gold on black
    ...statRow(61, 0, 'Prestige', '95', { barBg: '#1A1A1A', barFill: '#C9A84C', labelColor: '#8D8D8D', valueColor: '#C9A84C', labelFont: 'Georgia, serif', valueFont: 'Georgia, serif', barOpacity: 0.3 }),
    ...statRow(67, 1, 'Rarity', '88', { barBg: '#1A1A1A', barFill: '#C9A84C', labelColor: '#8D8D8D', valueColor: '#C9A84C', labelFont: 'Georgia, serif', valueFont: 'Georgia, serif', barOpacity: 0.3 }),
    ...statRow(73, 2, 'Value', '92', { barBg: '#1A1A1A', barFill: '#C9A84C', labelColor: '#8D8D8D', valueColor: '#C9A84C', labelFont: 'Georgia, serif', valueFont: 'Georgia, serif', barOpacity: 0.3 }),
    ...statRow(79, 3, 'Condition', '75', { barBg: '#1A1A1A', barFill: '#C9A84C', labelColor: '#8D8D8D', valueColor: '#C9A84C', labelFont: 'Georgia, serif', valueFont: 'Georgia, serif', barOpacity: 0.3 }),
    ...statRow(85, 4, 'Demand', '82', { barBg: '#1A1A1A', barFill: '#C9A84C', labelColor: '#8D8D8D', valueColor: '#C9A84C', labelFont: 'Georgia, serif', valueFont: 'Georgia, serif', barOpacity: 0.3 }),
    // Footer
    { id: id(), type: 'shape', name: 'Footer Line', x: 4, y: 92, width: 54, height: 0.3, rotation: 0, opacity: 0.5, visible: true, locked: true, shapeKind: 'rect', fill: '#C9A84C', stroke: '', strokeWidth: 0 } as Layer,
    { id: id(), type: 'text', name: 'Fun Fact', x: 4, y: 93, width: 54, height: 5, rotation: 0, opacity: 1, visible: true, locked: false, bindTo: 'funFact', text: '{{funFact}}', fontSize: 1.8, fontFamily: 'Georgia, serif', fontWeight: 'normal', fontStyle: 'italic', fill: '#8D6E63', align: 'center', verticalAlign: 'middle', lineHeight: 1.2, letterSpacing: 0.5, textDecoration: '' } as Layer,
  ]
}

// ═══════════════════════════════════════════════════════════════
// Export all templates
// ═══════════════════════════════════════════════════════════════

export const builtInTemplates: CardTemplate[] = [
  classicTT,
  sportsStar,
  animalsNature,
  speedMachines,
  superheroes,
  spaceExplorer,
  historyLegends,
  foodCooking,
  musicCulture,
  kidsCartoon,
  photoMinimal,
  premiumGold,
]

export function getTemplateById(templateId: string): CardTemplate | undefined {
  return builtInTemplates.find((t) => t.id === templateId)
}
