# DeckForge Security Audit

**Date:** 2026-02-26  
**Auditor:** Automated Security Review  
**Status:** ✅ All issues resolved

---

## 1. Dependency Scan

**Result:** ✅ Clean — 0 vulnerabilities across 922 dependencies.

## 2. Secret Detection

**Result:** ✅ No hardcoded secrets found.
- `src/renderer/.../SettingsView.tsx:191` — `type="password"` on input field (correct usage)
- `src/renderer/.../aiStore.test.ts:50` — `apiKey: 'sk-test'` (test fixture, not a real key)

## 3. IPC Security Review (`src/main/ipc.ts`)

| Handler | Issue | Fix |
|---------|-------|-----|
| `image:get-path` | Path traversal via filename | Already fixed (uses `path.basename`) |
| `image:import-buffer` | ⚠️ `data.filename` used unsanitized for `path.extname` | **Fixed** — now uses `path.basename` before extracting ext |
| `deck:load` | No type validation on `id` param | **Fixed** — added string type check |
| `deck:delete` | No type validation on `id` param | **Fixed** — added string type check |
| `deck:save` | Accepts arbitrary object | Low risk — SQLite parameterized queries prevent injection |
| `image:import` | Uses native dialog (user-selected paths) | ✅ Safe |
| `export:save-file` | Uses native save dialog | ✅ Safe |
| `psd:import` | Uses native dialog | ✅ Safe |

**No shell injection or prototype pollution risks found.**

## 4. Electron Security (`src/main/index.ts`)

| Setting | Before | After |
|---------|--------|-------|
| `nodeIntegration` | Not set (default false) | **Explicitly set to `false`** |
| `contextIsolation` | Not set (default true) | **Explicitly set to `true`** |
| `webSecurity` | `true` ✅ | No change |
| `sandbox` | `false` | Kept `false` (required for preload with `@electron-toolkit`) |
| CSP headers | ❌ Missing | **Added** via `session.defaultSession.webRequest.onHeadersReceived` |
| `shell.openExternal` | ⚠️ Unvalidated URLs | **Fixed** — now only allows `http:` and `https:` protocols |

## 5. Preload Exposure (`src/preload/index.ts`)

**Result:** ✅ Good — exposes only structured API calls via `contextBridge`. No raw `ipcRenderer.on/send` exposed. All calls use `ipcRenderer.invoke` (request-response only).

## 6. XSS Vectors

**Result:** ✅ No `dangerouslySetInnerHTML`, `.innerHTML`, or unescaped user input in DOM found across all source files.

## 7. Verification

- `npx tsc --noEmit -p tsconfig.web.json` — ✅ No errors
- `npx vitest run` — ✅ 79/79 tests passing (9 test files)

## Summary of Changes

1. **`src/main/index.ts`** — Added explicit `nodeIntegration: false`, `contextIsolation: true`, CSP headers, and URL protocol validation for `shell.openExternal`
2. **`src/main/ipc.ts`** — Sanitized `data.filename` in `image:import-buffer`, added input validation on `deck:load` and `deck:delete`
