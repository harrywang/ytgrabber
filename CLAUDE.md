# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Run Commands

```bash
# Web dev server
pnpm dev                    # http://localhost:3000

# Production build
pnpm build

# Desktop app (dev mode)
STANDALONE=true pnpm build && pnpm electron:prepare && npx electron .

# Desktop app (distributable)
pnpm electron:build:mac     # macOS DMG (x64 + arm64)
pnpm electron:build:win     # Windows NSIS exe

# Release (triggers GitHub Actions to build both platforms)
git tag v0.x.x && git push origin v0.x.x
```

## Architecture

**Hybrid Electron + Next.js desktop app.** Electron spawns a Next.js standalone server as a utility process, then loads `http://127.0.0.1:PORT` in a BrowserWindow. Runs locally to avoid YouTube's datacenter IP blocking.

### Key Flow

1. `electron/main.mjs` → starts Next.js server from `electron/server/server.js`
2. Frontend (`src/app/page.tsx`) → single-page app with URL input, video preview, download options
3. `POST /api/info` → calls `YtGrab.getInfo()` for video metadata + subtitle languages
4. `POST /api/download` → calls `YtGrab.download()`, streams progress via SSE, saves to `~/Downloads/ytgrabber/`
5. `POST /api/open-folder` → opens download directory in Finder/Explorer

### Standalone Build Pipeline

`pnpm build` → `scripts/prepare-electron.mjs` → `electron-builder`

The prepare script is critical: it copies Next.js standalone output to `electron/server/`, hoists pnpm's `.pnpm` virtual store into flat `node_modules/`, resolves all symlinks, prunes unused packages, and copies `ytgrab/vendor/` (solver scripts loaded via `fs.readFileSync` at runtime — not traced by Next.js bundler).

### Deployed vs Local Mode

`src/app/page.tsx` detects hostname: on non-localhost, renders a landing page directing users to download the desktop app. On localhost/127.0.0.1, renders the full download UI.

## Key Dependencies

- **ytgrab** (`npm:ytgrab`) — YouTube video/subtitle downloader. Provides `YtGrab` class. Its `vendor/yt.solver.core.js` must be present at runtime for n-parameter solving. The prepare script handles copying this.
- **mux.js** — Pure JS MPEG-TS to MP4 transmuxer (no FFmpeg dependency). Bundled by Next.js.

## Important Patterns

- `next.config.ts`: `output: "standalone"` is conditional on `STANDALONE=true` env var. Vercel needs default output; Electron needs standalone.
- API download route uses `ReadableStream` with SSE (`text/event-stream`) for real-time progress.
- Subtitle post-processing (SRT→TXT conversion, format filtering) happens in the download API route, not in ytgrab.
- Language codes mapped to full names using `Intl.DisplayNames` with a fallback map for obscure codes.
- Cross-platform: `electron:clean` script uses Node.js instead of `rm -rf`. Workflow sets `STANDALONE` via env, not shell prefix.
