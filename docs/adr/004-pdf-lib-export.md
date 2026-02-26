# ADR-004: pdf-lib for PDF Generation

## Status

Accepted

## Context

DeckForge must generate print-ready PDFs with:
- Multiple cards laid out on standard paper sizes (A4, A3, Letter)
- Trim marks for professional cutting
- Bleed area support
- Front and back pages with mirrored columns for double-sided printing
- Front/back offset adjustment for printer alignment
- Test sheets with dashed outlines

Alternatives considered: **jsPDF**, **pdfkit**, **pdf-lib**.

## Decision

We chose **pdf-lib** for client-side PDF generation in the renderer process.

### Reasons

1. **Pure JavaScript**: pdf-lib runs entirely in the browser/renderer with no native dependencies. jsPDF is also pure JS, but pdfkit requires Node.js streams.

2. **Low-level control**: pdf-lib provides direct page manipulation — custom page sizes, precise coordinate placement, line drawing for trim marks, image embedding. This is essential for print-ready output with bleed and trim marks.

3. **Image embedding**: pdf-lib supports embedding PNG and JPEG images directly from `Uint8Array`, which integrates cleanly with our Konva `stage.toDataURL()` → base64 → bytes pipeline.

4. **Small and focused**: At ~200KB gzip, pdf-lib is smaller than jsPDF (~250KB) and much smaller than pdfkit (~400KB+ with dependencies).

5. **No canvas dependency**: Unlike jsPDF's `html2canvas` approach, pdf-lib builds PDFs programmatically. We already have high-quality card renders from Konva — we just need to place them on pages.

6. **Active maintenance**: pdf-lib has a clean API and good TypeScript types.

## Consequences

### Positive
- Full control over page layout, coordinates, and print marks
- Clean integration with Konva's data URL output
- Runs in renderer process — no IPC needed for PDF generation
- Supports custom paper sizes and orientations
- Small bundle footprint

### Negative
- No high-level layout engine — grid calculation, centering, and trim mark drawing are manual (implemented in `lib/pdf.ts`)
- Text rendering in PDFs requires font embedding for non-standard fonts (currently using page.drawText for labels only)
- Large decks with high-DPI renders can consume significant memory during generation
