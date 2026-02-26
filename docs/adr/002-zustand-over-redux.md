# ADR-002: Zustand + Immer + Zundo over Redux

## Status

Accepted

## Context

DeckForge has complex editor state: the current deck with nested cards, templates with nested layers, canvas viewport state, selection state, and AI/print settings. We need:

- Centralized state with fine-grained subscriptions (canvas re-renders must be minimal)
- Immutable updates for deeply nested layer trees
- Undo/redo with bounded history
- Persistence for AI settings
- Simple API — the team is small and boilerplate is a tax

Redux (with Redux Toolkit) and Zustand were the primary candidates.

## Decision

We chose **Zustand** with **Immer** middleware and **Zundo** for temporal (undo/redo) support.

### Architecture

- **`editorStore`**: Zustand + Immer + Zundo (temporal, limit: 100). Core deck/canvas/layer state.
- **`aiStore`**: Zustand + Immer + persist (localStorage). AI provider configs and defaults.
- **`printStore`**: Zustand + Immer. Print/export settings.

### Reasons

1. **Zero boilerplate**: Zustand stores are plain functions. No action types, no reducers, no dispatch, no Provider wrapper. A store is ~50 lines vs ~200+ with Redux Toolkit for equivalent functionality.

2. **Fine-grained selectors**: `useEditorStore(s => s.zoom)` only re-renders when zoom changes. This is critical for canvas performance — property panel changes shouldn't trigger canvas re-renders.

3. **Immer integration**: The `immer` middleware lets us write mutations (`s.currentDeck.name = name`) that produce immutable updates. This is essential for our deeply nested `Deck → Template → Layer[]` structure. Without Immer, updating a nested layer requires spread operators 4-5 levels deep.

4. **Zundo for undo/redo**: Zundo adds temporal middleware with configurable history limits. One line of middleware gives us full undo/redo for the editor store. Redux would require a custom middleware or `redux-undo` with more configuration.

5. **No Provider needed**: Zustand stores work outside React (e.g., in `useDeckPersistence` we call `useEditorStore.getState()` directly). Redux requires a `<Provider>` wrapper and hook-only access patterns.

6. **Bundle size**: Zustand (~2KB) + Immer (~6KB) + Zundo (~1KB) = ~9KB total vs Redux Toolkit (~30KB+).

## Consequences

### Positive
- Minimal boilerplate — fast to add new state and actions
- Excellent performance with selector-based subscriptions
- Immer makes nested state updates readable and safe
- Undo/redo "for free" with Zundo
- Stores are testable as plain JavaScript

### Negative
- Less ecosystem tooling than Redux (no Redux DevTools, though Zustand has its own devtools middleware)
- Multiple stores means cross-store coordination requires manual wiring (not an issue yet)
- Immer adds a small runtime overhead for structural sharing
