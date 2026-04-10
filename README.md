# YT Grabber

A desktop app to download YouTube videos and subtitles. Built with Electron, Next.js, and [ytgrab](https://github.com/harrywang/ytgrab).

## Features

- Paste a YouTube URL to preview video info (title, thumbnail, duration, views)
- Watch video preview with clickable thumbnail
- Download videos up to 720p as proper MP4 files (no FFmpeg required)
- Download subtitles (manual or auto-generated) in SRT and/or plain text formats
- Choose from 150+ subtitle languages with full language names
- Real-time download progress bar
- Files saved to `~/Downloads/ytgrabber/` with "Open in Finder" button
- Built-in sample YouTube URLs for quick testing

## Install

Download the latest release from the [Releases](https://github.com/harrywang/ytgrabber/releases) page:

- **macOS**: `YTGrabber-x.x.x.dmg` (Intel) or `YTGrabber-x.x.x-arm64.dmg` (Apple Silicon)
- **Windows**: `YTGrabber-x.x.x.exe`

## Development

### Run as web app

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Run as desktop app (dev mode)

```bash
pnpm build && pnpm electron:prepare && npx electron .
```

### Build desktop app for distribution

```bash
# macOS
pnpm electron:build:mac

# Windows
pnpm electron:build:win
```

Output goes to `dist-electron/`.

### Release

Push a version tag to trigger the GitHub Actions release workflow:

```bash
git tag v0.1.0
git push origin v0.1.0
```

This builds macOS DMG and Windows exe, then creates a GitHub Release with the artifacts.

## Tech Stack

- [Electron](https://www.electronjs.org/) for desktop packaging
- [Next.js](https://nextjs.org/) 16 with App Router (standalone mode)
- [React](https://react.dev/) 19
- [TypeScript](https://www.typescriptlang.org/) 6
- [Tailwind CSS](https://tailwindcss.com/) 4
- [shadcn/ui](https://ui.shadcn.com/) components
- [ytgrab](https://github.com/harrywang/ytgrab) for YouTube downloading

## How It Works

1. Paste a YouTube URL and click **Grab** to fetch video info
2. Choose video quality (720p, 360p, 144p)
3. Optionally enable subtitle download, pick a language and format (SRT/TXT)
4. Click **Download** — files save to `~/Downloads/ytgrabber/`
5. Click **Open in Finder** to view downloaded files

## Credits

- Logo from [SVG Repo](https://www.svgrepo.com/svg/404660/youtube-video-movie-film-multimedia-social-media)
- Video downloading powered by [ytgrab](https://github.com/harrywang/ytgrab)
