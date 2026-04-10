import { NextRequest, NextResponse } from "next/server";
import { YtGrab } from "ytgrab";

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const yt = new YtGrab();
    const info = await yt.getInfo(url);

    // Subtitles and automatic_captions are already in the info object
    const subtitles = info.subtitles || {};
    const automaticCaptions = (info as Record<string, unknown>).automatic_captions as Record<string, unknown> || {};

    return NextResponse.json({
      id: info.id,
      title: info.title,
      description: info.description,
      thumbnail: info.thumbnail,
      duration: info.duration,
      uploader: info.uploader || info.channel,
      view_count: info.view_count,
      upload_date: info.upload_date,
      subtitles: Object.keys(subtitles),
      automatic_captions: Object.keys(automaticCaptions),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch video info";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
