# Building DeckForge

## Prerequisites

- **Node.js** 18+ (recommended: 22)
- **npm** 9+
- **macOS** for .dmg builds (or Linux for AppImage/deb)

## Quick Start (Development)

```bash
git clone https://github.com/finengines/deckforge.git
cd deckforge
npm install
npm run dev
```

This opens the app in development mode with hot-reload.

## Running Tests

```bash
# Unit tests (79 tests)
npm test

# Watch mode
npm run test:watch

# E2E tests (requires built app)
npm run build
npx playwright test
```

## Building for macOS

```bash
# Build the app bundle
npm run build:mac

# Output: dist/DeckForge-1.0.0.dmg
#         dist/DeckForge-1.0.0-mac.zip
```

The `.dmg` is a standard macOS disk image. The `.zip` is a portable version.

### First Launch on macOS

Since the app isn't code-signed (yet), you'll need to:
1. Right-click the app → Open
2. Click "Open" in the dialog
3. Or: `System Preferences → Privacy & Security → Open Anyway`

## Building for Windows

```bash
npm run build:win
# Output: dist/deckforge-1.0.0-setup.exe
```

## Building for Linux

```bash
npm run build:linux
# Output: dist/DeckForge-1.0.0.AppImage
#         dist/DeckForge-1.0.0.deb
```

## Build Output

All build artifacts go to the `dist/` directory.

## Troubleshooting

### `better-sqlite3` native module errors
```bash
npm run postinstall  # rebuilds native modules for Electron
```

### Build fails on macOS with signing errors
The app is configured with `notarize: false` for local builds. If you want to distribute, you'll need an Apple Developer certificate.

### Electron not found
```bash
npx electron-builder install-app-deps
```
