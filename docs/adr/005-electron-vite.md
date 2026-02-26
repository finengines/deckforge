# ADR-005: electron-vite as Build System

## Status

Accepted

## Context

Electron apps have three build targets: main process (Node.js), preload scripts (sandboxed Node.js), and renderer (browser). We need a build system that:

- Handles all three targets with distinct configurations
- Provides fast HMR for renderer development
- Supports TypeScript across all targets
- Integrates with React Fast Refresh
- Works with native modules (better-sqlite3)
- Produces optimized production builds

Alternatives: **electron-forge** (webpack-based), **electron-builder** + manual webpack/vite, **electron-vite**.

## Decision

We chose **electron-vite** as the unified build system, with **electron-builder** for packaging.

### Reasons

1. **Vite-native**: electron-vite extends Vite to handle all three Electron targets from a single `electron.vite.config.ts`. Vite's dev server provides near-instant HMR for the renderer process.

2. **Three-target config**: One config file defines main, preload, and renderer builds. Each can have its own plugins, externals, and output settings. This replaces the complexity of managing separate webpack configs.

3. **React Fast Refresh**: Via `@vitejs/plugin-react`, the renderer gets component-level hot reloading without losing state. Critical for canvas editor development.

4. **Native module support**: electron-vite correctly externalizes native modules like `better-sqlite3` and handles Electron's module resolution. electron-builder's `install-app-deps` rebuilds native modules for the target platform.

5. **Tailwind CSS 4**: The `@tailwindcss/vite` plugin integrates seamlessly with Vite's pipeline for zero-runtime CSS utility generation.

6. **Fast builds**: Vite uses esbuild for transforms and Rollup for production bundles. Dev startup is sub-second; production builds complete in seconds.

7. **Electron Toolkit integration**: `@electron-toolkit/*` packages provide preconfigured TSConfig, ESLint configs, preload utilities, and app utilities that work out of the box with electron-vite.

## Consequences

### Positive
- Sub-second dev server startup with HMR
- Single config for all three Electron targets
- TypeScript, React, Tailwind all work out of the box
- Clean separation of main/preload/renderer builds
- electron-builder handles packaging and native module compilation

### Negative
- electron-vite is a newer project with a smaller community than electron-forge
- Some Vite plugins may not work correctly in the main/preload Node.js targets
- Debugging requires understanding Vite's module resolution differences from webpack
