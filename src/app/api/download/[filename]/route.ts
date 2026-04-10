import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    const dir = request.nextUrl.searchParams.get("dir");

    if (!dir || !filename) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const filePath = path.join(dir, decodeURIComponent(filename));

    if (!filePath.startsWith(dir) || !fs.existsSync(filePath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    const ext = path.extname(filename).toLowerCase();

    const mimeTypes: Record<string, string> = {
      ".mp4": "video/mp4",
      ".webm": "video/webm",
      ".mkv": "video/x-matroska",
      ".ts": "video/mp2t",
      ".vtt": "text/vtt",
      ".srt": "application/x-subrip",
      ".ass": "text/x-ssa",
      ".json": "application/json",
      ".txt": "text/plain",
    };

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": mimeTypes[ext] || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
        "Content-Length": fileBuffer.length.toString(),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "File download failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
