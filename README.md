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

### macOS: "Not Opened" warning

Since the app is not notarized with Apple, macOS will show a warning the first time you open it. To fix this:

1. Open **System Settings → Privacy & Security**
2. Scroll down to the Security section
3. Click **Open Anyway** next to the YTGrabber message
4. Or run this command in Terminal:
   ```bash
   xattr -cr /Applications/YTGrabber.app
   ```

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

### Code signing (macOS)

The macOS build requires an Apple Developer account ($99/year). Add these secrets to the GitHub repo (Settings → Secrets → Actions):

| Secret | How to get it |
|--------|---------------|
| `CERTIFICATE_P12` | Open Keychain Access → find your **Developer ID Application** certificate → right-click → Export → save as `.p12` → run `base64 -i certificate.p12 \| pbcopy` → paste |
| `CERTIFICATE_PASSWORD` | The password you set when exporting the `.p12` file |
| `APPLE_ID` | Your Apple ID email (e.g. `you@example.com`) |
| `APPLE_TEAM_ID` | Found at [developer.apple.com/account](https://developer.apple.com/account) → Membership → Team ID |
| `APPLE_APP_SPECIFIC_PASSWORD` | Generate at [appleid.apple.com](https://appleid.apple.com/account/manage) → Sign-In and Security → App-Specific Passwords |

If you don't have a Developer ID certificate yet:
1. Go to [developer.apple.com/account/resources/certificates](https://developer.apple.com/account/resources/certificates/list)
2. Click **+** → select **Developer ID Application** → follow the steps
3. Download and double-click to install in Keychain Access

### Release

Push a version tag to trigger the GitHub Actions release workflow:

```bash
git tag v0.1.0
git push origin v0.1.0
```

This builds macOS DMG (signed) and Windows exe, then creates a GitHub Release with the artifacts.

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
