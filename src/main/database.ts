import Database from 'better-sqlite3'
import { app } from 'electron'
import path from 'path'
import fs from 'fs'

let db: Database.Database | null = null

export function getDbPath(): string {
  const userDataPath = app.getPath('userData')
  return path.join(userDataPath, 'deckforge.db')
}

export function getImagesDir(): string {
  const userDataPath = app.getPath('userData')
  const imagesDir = path.join(userDataPath, 'images')
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true })
  }
  return imagesDir
}

export function initDatabase(): Database.Database {
  if (db) return db

  const dbPath = getDbPath()
  db = new Database(dbPath)

  // Enable WAL mode for better concurrent read/write
  db.pragma('journal_mode = WAL')

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS decks (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      dimensions TEXT NOT NULL,  -- JSON
      categories TEXT NOT NULL,  -- JSON array
      theme TEXT NOT NULL,       -- JSON
      front_template TEXT NOT NULL,  -- JSON
      back_template TEXT NOT NULL,   -- JSON
      components TEXT DEFAULT '[]',  -- JSON array
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS cards (
      id TEXT PRIMARY KEY,
      deck_id TEXT NOT NULL,
      name TEXT NOT NULL,
      image TEXT,
      description TEXT DEFAULT '',
      fun_fact TEXT DEFAULT '',
      stats TEXT DEFAULT '{}',       -- JSON
      custom_fields TEXT DEFAULT '{}', -- JSON
      ai_generated TEXT DEFAULT '{}',  -- JSON
      sort_order INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (deck_id) REFERENCES decks(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS images (
      id TEXT PRIMARY KEY,
      deck_id TEXT,
      filename TEXT NOT NULL,
      original_name TEXT,
      mime_type TEXT NOT NULL,
      width INTEGER,
      height INTEGER,
      file_path TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (deck_id) REFERENCES decks(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_cards_deck_id ON cards(deck_id);
    CREATE INDEX IF NOT EXISTS idx_cards_sort_order ON cards(sort_order);
    CREATE INDEX IF NOT EXISTS idx_images_deck_id ON images(deck_id);
  `)

  return db
}

export function getDatabase(): Database.Database {
  if (!db) throw new Error('Database not initialized. Call initDatabase() first.')
  return db
}

// --- Deck Operations ---

export function saveDeck(deck: any): void {
  const db = getDatabase()
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO decks (id, name, description, dimensions, categories, theme, front_template, back_template, components, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const now = new Date().toISOString()

  db.transaction(() => {
    stmt.run(
      deck.id,
      deck.name,
      deck.description,
      JSON.stringify(deck.dimensions),
      JSON.stringify(deck.categories),
      JSON.stringify(deck.theme),
      JSON.stringify(deck.frontTemplate),
      JSON.stringify(deck.backTemplate),
      JSON.stringify(deck.components || []),
      deck.createdAt || now,
      now
    )

    // Save cards
    const deleteCards = db.prepare('DELETE FROM cards WHERE deck_id = ?')
    deleteCards.run(deck.id)

    const insertCard = db.prepare(`
      INSERT INTO cards (id, deck_id, name, image, description, fun_fact, stats, custom_fields, ai_generated, sort_order, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    deck.cards?.forEach((card: any, index: number) => {
      insertCard.run(
        card.id,
        deck.id,
        card.name,
        card.image || null,
        card.description || '',
        card.funFact || '',
        JSON.stringify(card.stats || {}),
        JSON.stringify(card.customFields || {}),
        JSON.stringify(card.aiGenerated || {}),
        index,
        card.createdAt || now,
        card.updatedAt || now
      )
    })
  })()
}

export function loadDeck(id: string): any | null {
  const db = getDatabase()
  const deckRow = db.prepare('SELECT * FROM decks WHERE id = ?').get(id) as any
  if (!deckRow) return null

  const cards = db
    .prepare('SELECT * FROM cards WHERE deck_id = ? ORDER BY sort_order')
    .all(id) as any[]

  return {
    id: deckRow.id,
    name: deckRow.name,
    description: deckRow.description,
    dimensions: JSON.parse(deckRow.dimensions),
    categories: JSON.parse(deckRow.categories),
    theme: JSON.parse(deckRow.theme),
    frontTemplate: JSON.parse(deckRow.front_template),
    backTemplate: JSON.parse(deckRow.back_template),
    components: JSON.parse(deckRow.components || '[]'),
    cards: cards.map((c) => ({
      id: c.id,
      name: c.name,
      image: c.image,
      description: c.description,
      funFact: c.fun_fact,
      stats: JSON.parse(c.stats),
      customFields: JSON.parse(c.custom_fields),
      aiGenerated: JSON.parse(c.ai_generated),
      createdAt: c.created_at,
      updatedAt: c.updated_at
    })),
    createdAt: deckRow.created_at,
    updatedAt: deckRow.updated_at
  }
}

export function listDecks(): any[] {
  const db = getDatabase()
  const rows = db
    .prepare('SELECT id, name, description, created_at, updated_at FROM decks ORDER BY updated_at DESC')
    .all() as any[]

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    cardCount: (db.prepare('SELECT COUNT(*) as count FROM cards WHERE deck_id = ?').get(r.id) as any).count,
    createdAt: r.created_at,
    updatedAt: r.updated_at
  }))
}

export function deleteDeck(id: string): void {
  const db = getDatabase()
  db.prepare('DELETE FROM decks WHERE id = ?').run(id)
}

// --- Image Operations ---

export function saveImage(image: {
  id: string
  deckId?: string
  filename: string
  originalName?: string
  mimeType: string
  width?: number
  height?: number
  filePath: string
}): void {
  const db = getDatabase()
  db.prepare(`
    INSERT OR REPLACE INTO images (id, deck_id, filename, original_name, mime_type, width, height, file_path, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    image.id,
    image.deckId || null,
    image.filename,
    image.originalName || null,
    image.mimeType,
    image.width || null,
    image.height || null,
    image.filePath,
    new Date().toISOString()
  )
}

export function closeDatabase(): void {
  if (db) {
    db.close()
    db = null
  }
}
