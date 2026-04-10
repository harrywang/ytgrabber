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

## Run Locally (Recommended)

Running locally is the simplest and most reliable way to use YT Grabber. YouTube blocks requests from cloud/datacenter IPs, but your home IP works without any extra setup.

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel (Requires YouTube Cookies)

YouTube blocks datacenter IPs (Vercel, AWS, etc.) with "Sign in to confirm you're not a bot." To make the deployed version work, you need to provide your YouTube cookies:

### Step 1: Export cookies from Firefox

1. Open Firefox and log in to [youtube.com](https://www.youtube.com)
2. Install the [cookies.txt extension](https://addons.mozilla.org/en-US/firefox/addon/cookies-txt/)
3. Go to youtube.com, click the extension icon, and export cookies for the current site
4. Open the downloaded `cookies.txt` file and copy its entire contents

> **Note:** Use Firefox, not Chrome. Chrome encrypts cookies since v127, making extraction difficult.

### Step 2: Add environment variable on Vercel

1. Go to your Vercel project → Settings → Environment Variables
2. Add a new variable:
   - **Name:** `YOUTUBE_COOKIES`
   - **Value:** Paste the entire contents of your `cookies.txt` file
3. Redeploy the project

### Step 3: Refresh cookies periodically

YouTube cookies expire every ~2 weeks. When downloads start failing, repeat steps 1-2 with fresh cookies.

## How It Works

1. Paste a YouTube URL and click **Grab** to fetch video info
2. Choose video quality (720p, 360p, 144p)
3. Optionally enable subtitle download, pick a language and format (SRT/TXT)
4. Click **Download** — files save directly to your browser

## Credits

- Logo from [SVG Repo](https://www.svgrepo.com/svg/404660/youtube-video-movie-film-multimedia-social-media)
- Video downloading powered by [ytgrab](https://github.com/harrywang/ytgrab)
