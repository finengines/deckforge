# ADR-003: SQLite over localStorage/IndexedDB for Persistence

## Status

Accepted

## Context

DeckForge is a local-first application. All deck data (decks, cards, images metadata) must persist between sessions. Options considered:

1. **localStorage** — Simple key-value, 5-10MB limit, synchronous, string-only
2. **IndexedDB** — Async, larger storage, complex API, browser-only
3. **JSON files** — Simple, unlimited size, no query capability
4. **SQLite via better-sqlite3** — Full relational database, synchronous in Node.js, unlimited size

## Decision

We chose **SQLite** via **better-sqlite3** running in the Electron main process.

### Schema Design

Three tables: `decks`, `cards`, `images` with JSON columns for flexible nested data (dimensions, theme, templates, stats) and relational foreign keys for deck↔card and deck↔image relationships.

### Reasons

1. **Relational queries**: Listing decks with card counts, ordering cards by `sort_order`, cascading deletes — all handled by SQL with `ON DELETE CASCADE`.

2. **Transactional writes**: `saveDeck()` uses a single transaction to upsert the deck row, delete existing cards, and reinsert all cards. This prevents partial saves on crash.

3. **WAL mode**: `PRAGMA journal_mode = WAL` enables concurrent reads during writes, which matters when auto-save triggers while the UI is reading.

4. **No size limits**: Decks with hundreds of cards and large JSON templates easily exceed localStorage's 5-10MB limit.

5. **Synchronous API**: better-sqlite3 is synchronous, which simplifies IPC handlers — no async chains needed in the main process. This is safe because SQLite operations are fast (~1ms for typical reads).

6. **Proven reliability**: SQLite is the most deployed database engine in the world. better-sqlite3 is the fastest Node.js SQLite binding.

7. **Portable**: The entire database is a single file (`deckforge.db`) in the user data directory, easy to backup or transfer.

## Consequences

### Positive
- ACID transactions protect data integrity
- SQL queries are powerful and well-understood
- Single file — easy backup, no server needed
- Synchronous API simplifies main process code
- Scales to thousands of decks/cards without issue

### Negative
- Native addon requires compilation per-platform (handled by electron-builder's `install-app-deps`)
- Adds ~2MB to the app binary (native SQLite library)
- JSON columns lose SQL query capability for nested fields (acceptable trade-off for flexibility)
- Only accessible from main process — renderer must use IPC
