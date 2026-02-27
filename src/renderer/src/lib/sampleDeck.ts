/**
 * Sample deck that ships with DeckForge as a demo
 */
import { v4 as uuid } from 'uuid'
import { builtInTemplates } from './templates'
import type { Deck, CardData, CardCategory } from '../types'

const categories: CardCategory[] = [
  { id: 'cat-speed', name: 'Speed', min: 0, max: 100, unit: 'mph', higherIsBetter: true },
  { id: 'cat-power', name: 'Power', min: 0, max: 100, higherIsBetter: true },
  { id: 'cat-skill', name: 'Skill', min: 0, max: 100, higherIsBetter: true },
  { id: 'cat-cool', name: 'Coolness', min: 0, max: 100, higherIsBetter: true }
]

const sampleCards: CardData[] = [
  {
    id: uuid(),
    name: 'Fire Dragon',
    description: 'A legendary beast that breathes scorching flames across the battlefield.',
    funFact: 'Can reach temperatures of 2000°C!',
    stats: { 'cat-speed': 72, 'cat-power': 95, 'cat-skill': 60, 'cat-cool': 88 },
    customFields: {},
    aiGenerated: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: uuid(),
    name: 'Ice Phoenix',
    description: 'Born from glacial storms, this majestic bird freezes everything in its path.',
    funFact: 'Can survive being frozen for 1000 years!',
    stats: { 'cat-speed': 88, 'cat-power': 70, 'cat-skill': 85, 'cat-cool': 95 },
    customFields: {},
    aiGenerated: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: uuid(),
    name: 'Shadow Wolf',
    description: 'A stealthy predator that hunts under the cover of darkness.',
    funFact: 'Can run completely silently at full speed!',
    stats: { 'cat-speed': 92, 'cat-power': 65, 'cat-skill': 90, 'cat-cool': 78 },
    customFields: {},
    aiGenerated: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: uuid(),
    name: 'Thunder Giant',
    description: 'A towering colossus whose footsteps cause earthquakes for miles.',
    funFact: 'Each step generates 10,000 volts of electricity!',
    stats: { 'cat-speed': 30, 'cat-power': 99, 'cat-skill': 45, 'cat-cool': 82 },
    customFields: {},
    aiGenerated: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: uuid(),
    name: 'Crystal Mage',
    description: 'A mysterious sorcerer who channels power through enchanted crystals.',
    funFact: 'Her crystal staff was carved from a meteorite!',
    stats: { 'cat-speed': 55, 'cat-power': 80, 'cat-skill': 98, 'cat-cool': 90 },
    customFields: {},
    aiGenerated: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: uuid(),
    name: 'Storm Serpent',
    description: 'A colossal sea serpent that summons hurricanes and tidal waves.',
    funFact: 'Can hold its breath for an entire year!',
    stats: { 'cat-speed': 78, 'cat-power': 88, 'cat-skill': 72, 'cat-cool': 85 },
    customFields: {},
    aiGenerated: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: uuid(),
    name: 'Forest Spirit',
    description: 'An ancient guardian of the woodland, invisible to those with impure hearts.',
    funFact: 'Plants grow twice as fast in her presence!',
    stats: { 'cat-speed': 40, 'cat-power': 50, 'cat-skill': 95, 'cat-cool': 92 },
    customFields: {},
    aiGenerated: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: uuid(),
    name: 'Lava Golem',
    description: 'A walking volcano forged in the heart of a mountain, melting everything it touches.',
    funFact: 'Its core temperature is hotter than the surface of the sun!',
    stats: { 'cat-speed': 15, 'cat-power': 97, 'cat-skill': 30, 'cat-cool': 75 },
    customFields: {},
    aiGenerated: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

export function createSampleDeck(): Deck {
  const now = new Date().toISOString()
  const template = builtInTemplates[0] // Classic Top Trumps

  return {
    id: uuid(),
    name: 'Mythical Creatures',
    description: 'A sample Top Trumps deck featuring mythical creatures — edit or delete to start your own!',
    dimensions: {
      width: 62,
      height: 100,
      bleed: 3,
      cornerRadius: 3,
      dpi: 300
    },
    categories,
    cards: sampleCards,
    frontTemplate: { ...template, id: uuid() },
    backTemplate: {
      id: uuid(),
      name: 'Back',
      description: 'Card back design',
      frontLayers: [
        {
          id: uuid(),
          type: 'shape',
          name: 'Background',
          x: 0, y: 0, width: 62, height: 100,
          rotation: 0, opacity: 1, visible: true, locked: true,
          shapeKind: 'rect' as const,
          fill: '#1a1a2e',
          stroke: '',
          strokeWidth: 0,
          cornerRadius: 3
        },
        {
          id: uuid(),
          type: 'text',
          name: 'Logo Text',
          x: 6, y: 35, width: 50, height: 30,
          rotation: 0, opacity: 0.3, visible: true, locked: false,
          text: '🃏',
          fontSize: 20,
          fontFamily: 'Inter, sans-serif',
          fontWeight: 'bold',
          fontStyle: 'normal',
          fill: '#e94560',
          align: 'center' as const,
          verticalAlign: 'middle' as const,
          lineHeight: 1,
          letterSpacing: 0,
          textDecoration: ''
        },
        {
          id: uuid(),
          type: 'text',
          name: 'Deck Name',
          x: 6, y: 65, width: 50, height: 10,
          rotation: 0, opacity: 0.5, visible: true, locked: false,
          text: 'MYTHICAL CREATURES',
          fontSize: 3,
          fontFamily: 'Inter, sans-serif',
          fontWeight: 'bold',
          fontStyle: 'normal',
          fill: '#ffffff',
          align: 'center' as const,
          verticalAlign: 'middle' as const,
          lineHeight: 1,
          letterSpacing: 3,
          textDecoration: ''
        }
      ],
      backLayers: null,
      tags: [],
      builtIn: false,
      createdAt: now,
      updatedAt: now
    },
    components: [],
    theme: {
      primaryColor: '#1a1a2e',
      secondaryColor: '#16213e',
      backgroundColor: '#0f3460',
      textColor: '#ffffff',
      accentColor: '#e94560',
      fontFamily: 'Inter, sans-serif',
      headingFontFamily: 'Inter, sans-serif'
    },
    createdAt: now,
    updatedAt: now
  }
}
