import { NextRequest } from "next/server";
import { YtGrab } from "ytgrab";
import path from "path";
import fs from "fs";
import os from "os";

export async function POST(request: NextRequest) {
  try {
    const { url, format, writeSubtitles, subtitleLangs, subFormatSrt = true, subFormatTxt = true } = await request.json();

    if (!url) {
      return Response.json({ error: "URL is required" }, { status: 400 });
    }

    const downloadDir = path.join(os.tmpdir(), "ytgrabber", Date.now().toString());
    fs.mkdirSync(downloadDir, { recursive: true });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const send = (data: Record<string, unknown>) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        };

        try {
          const options: Record<string, unknown> = {
            format: format || "best",
            paths: { home: downloadDir },
            writeSubtitles: writeSubtitles || false,
            writeAutoSubtitles: writeSubtitles || false,
            subtitleLanguages: subtitleLangs ? subtitleLangs.split(",").map((s: string) => s.trim()) : ["en"],
            progressHooks: [(progress: Record<string, unknown>) => {
              if (progress.status === "downloading") {
                send({
                  type: "progress",
                  fragment_index: progress.fragment_index,
                  fragment_count: progress.fragment_count,
                  downloaded_bytes: progress.downloaded_bytes,
                  speed: progress.speed,
                });
              }
            }],
          };

          const yt = new YtGrab(options);

          send({ type: "status", message: "Fetching video info..." });

          const results = await yt.download(url);
          const info = results[0];

          // Process subtitle files based on format options
          const allFiles = fs.readdirSync(downloadDir);
          for (const f of allFiles) {
            if (/\.(srt|vtt)$/i.test(f)) {
              const subPath = path.join(downloadDir, f);
              const subContent = fs.readFileSync(subPath, "utf-8");

              // Generate plain text version if requested
              if (subFormatTxt) {
                const textLines = subContent
                  .split("\n")
                  .filter(line => {
                    const trimmed = line.trim();
                    if (!trimmed) return false;
                    if (/^\d+$/.test(trimmed)) return false;
                    if (/^\d{2}:\d{2}/.test(trimmed) && trimmed.includes("-->")) return false;
                    if (trimmed === "WEBVTT" || trimmed.startsWith("Kind:") || trimmed.startsWith("Language:")) return false;
                    return true;
                  })
                  .map(line => line.replace(/<[^>]+>/g, "").trim())
                  .filter(Boolean);
                const txtName = f.replace(/\.(srt|vtt)$/i, ".txt");
                fs.writeFileSync(path.join(downloadDir, txtName), textLines.join("\n"), "utf-8");
              }

              // Remove SRT/VTT if not requested
              if (!subFormatSrt) {
                fs.unlinkSync(subPath);
              }
            }
          }

          const files = fs.readdirSync(downloadDir);
          const videoFile = files.find(f => /\.(mp4|webm|mkv|ts)$/i.test(f));
          const subtitleFiles = files.filter(f => /\.(vtt|srt|ass|json|txt)$/i.test(f));

          send({
            type: "done",
            title: info?.title || "Unknown",
            downloadDir,
            files: files.map(f => ({
              name: f,
              size: fs.statSync(path.join(downloadDir, f)).size,
              type: videoFile === f ? "video" : subtitleFiles.includes(f) ? "subtitle" : "other",
            })),
          });
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : "Download failed";
          send({ type: "error", error: message });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Download failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
