# YT Grabber

A web app to download YouTube videos and subtitles. Built with Next.js and [ytgrab](https://github.com/harrywang/ytgrab).

## Features

- Paste a YouTube URL to preview video info (title, thumbnail, duration, views)
- Watch video preview with clickable thumbnail
- Download videos up to 720p as proper MP4 files (no FFmpeg required)
- Download subtitles (manual or auto-generated) in SRT and/or plain text formats
- Choose from 150+ subtitle languages with full language names
- Real-time download progress bar
- Built-in sample YouTube URLs for quick testing
- Cancel downloads in progress

## Tech Stack

- [Next.js](https://nextjs.org/) 16 with App Router
- [React](https://react.dev/) 19
- [TypeScript](https://www.typescriptlang.org/) 6
- [Tailwind CSS](https://tailwindcss.com/) 4
- [shadcn/ui](https://ui.shadcn.com/) components
- [ytgrab](https://github.com/harrywang/ytgrab) for YouTube downloading

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## How It Works

1. Paste a YouTube URL and click **Grab** to fetch video info
2. Choose video quality (720p, 360p, 144p)
3. Optionally enable subtitle download, pick a language and format (SRT/TXT)
4. Click **Download** — files save directly to your browser

## Credits

- Logo from [SVG Repo](https://www.svgrepo.com/svg/404660/youtube-video-movie-film-multimedia-social-media)
- Video downloading powered by [ytgrab](https://github.com/harrywang/ytgrab)
