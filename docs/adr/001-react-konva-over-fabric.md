# ADR-001: React-Konva over Fabric.js for Canvas Rendering

## Status

Accepted

## Context

DeckForge needs a 2D canvas engine for the card template editor. Users design card layouts by placing and manipulating text, images, shapes, and groups on a canvas. The engine must support:

- Layer-based rendering with z-ordering
- Text with rich formatting (fonts, alignment, shadows, decorations)
- Image loading and transformation
- Shape primitives (rect, circle, ellipse, star, line)
- Group nesting
- Offscreen rendering to data URLs for export
- Good integration with React's component model

The main contenders were **Konva.js** (with react-konva) and **Fabric.js**.

## Decision

We chose **Konva.js** with **react-konva** bindings.

### Reasons

1. **React-native integration**: react-konva provides declarative React components (`<Stage>`, `<Layer>`, `<Rect>`, `<Text>`, etc.) that map directly to our layer model. Fabric.js has no official React wrapper — integration requires imperative canvas manipulation inside `useEffect` hooks.

2. **Component model alignment**: Our `Layer` type hierarchy (text, image, shape, group) maps 1:1 to Konva node types. The recursive `ComponentLayerRenderer` renders layers as React components, making the code declarative and easy to reason about.

3. **Offscreen rendering**: Konva supports creating offscreen `Stage` instances for export rendering without touching the DOM-visible canvas. This powers our `renderCard()` function for PDF/PNG export.

4. **TypeScript support**: Konva has first-class TypeScript definitions. Fabric.js TypeScript support has historically been weaker.

5. **Bundle size**: Konva (~70KB gzip) is comparable to Fabric.js (~90KB gzip) while providing a cleaner API surface for our needs.

6. **Active maintenance**: Both are maintained, but react-konva tracks React versions closely (react-konva 19.x for React 19).

## Consequences

### Positive
- Declarative canvas rendering via JSX
- Clean mapping from data model to visual output
- Easy offscreen rendering for export pipeline
- React devtools work with canvas components

### Negative
- Konva's text rendering is basic compared to DOM text — no auto-hyphenation, limited rich text
- Canvas-based rendering means no CSS styling on canvas elements
- Konva's coordinate system requires manual DPI scaling for print export
