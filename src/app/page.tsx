"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Download, Loader2, RotateCcw, FolderOpen, FileVideo, FileText, File, Check } from "lucide-react";

interface VideoInfo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: number;
  uploader: string;
  view_count: number;
  upload_date: string;
  subtitles: string[];
  automatic_captions: string[];
}

interface DownloadedFile {
  name: string;
  size: number;
  type: "video" | "subtitle" | "other";
}

interface DownloadResult {
  downloadDir: string;
  files: DownloadedFile[];
}

const fileTypeIcon = {
  video: FileVideo,
  subtitle: FileText,
  other: File,
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0)
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const langFallback: Record<string, string> = {
  aa: "Afar", ab: "Abkhazian", ak: "Akan", an: "Aragonese", av: "Avaric",
  ay: "Aymara", ba: "Bashkir", bi: "Bislama", bm: "Bambara", ce: "Chechen",
  ch: "Chamorro", cr: "Cree", cv: "Chuvash", dv: "Divehi", dz: "Dzongkha",
  ee: "Ewe", fj: "Fijian", ff: "Fula", gn: "Guarani", gv: "Manx",
  ho: "Hiri Motu", hz: "Herero", ia: "Interlingua", ie: "Interlingue",
  ig: "Igbo", ii: "Sichuan Yi", ik: "Inupiaq", io: "Ido", iu: "Inuktitut",
  kj: "Kuanyama", kr: "Kanuri", ks: "Kashmiri", kv: "Komi", kw: "Cornish",
  la: "Latin", li: "Limburgish", ln: "Lingala", lu: "Luba-Katanga",
  mh: "Marshallese", na: "Nauru", nd: "Northern Ndebele", ng: "Ndonga",
  nr: "Southern Ndebele", nv: "Navajo", ny: "Chichewa", oc: "Occitan",
  oj: "Ojibwe", om: "Oromo", os: "Ossetian", pi: "Pali", rn: "Kirundi",
  rw: "Kinyarwanda", sc: "Sardinian", sg: "Sango", sm: "Samoan",
  sn: "Shona", ss: "Swati", st: "Southern Sotho", su: "Sundanese",
  tn: "Tswana", to: "Tongan", ts: "Tsonga", tw: "Twi", ty: "Tahitian",
  ve: "Venda", vo: "Volapük", wa: "Walloon", wo: "Wolof", xh: "Xhosa",
  yo: "Yoruba", za: "Zhuang",
};
const langNames = new Intl.DisplayNames(["en"], { type: "language" });
function langLabel(code: string): string {
  try {
    const name = langNames.of(code);
    if (name && name !== code) return name;
  } catch { /* fall through */ }
  return langFallback[code] || code;
}

function formatViewCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M views`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K views`;
  return `${count} views`;
}

const sampleVideos = [
  { label: "Jobs: It Comes Down to Taste", url: "https://www.youtube.com/watch?v=5y03eFMmOKY" },
  { label: "Naval Ravikant - 44 Harsh Truths", url: "https://www.youtube.com/watch?v=KyfUysrNaco" },
  { label: "Boris Cherny - Coding is largely solved", url: "https://www.youtube.com/watch?v=We7BZVKbCVw" },
  { label: "Andrej Karpathy - Intro to LLMs", url: "https://www.youtube.com/watch?v=zjkBMFhNj_g" },
];

export default function Home() {
  const [isDeployed, setIsDeployed] = useState(false);

  useEffect(() => {
    const host = window.location.hostname;
    if (!host.includes("localhost") && !host.includes("127.0.0.1")) {
      setIsDeployed(true);
    }
  }, []);

  if (isDeployed) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 bg-gradient-to-b from-background to-muted/30">
        <div className="w-full max-w-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="w-full shadow-lg border-border/60">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-center gap-3 mb-1">
                <Image
                  src="/ytgrabber-logo.svg"
                  alt="YT Grabber Logo"
                  width={36}
                  height={36}
                />
                <CardTitle className="text-2xl md:text-3xl tracking-tight">
                  YT Grabber
                </CardTitle>
              </div>
              <CardDescription className="text-center text-sm">
                Download YouTube videos and subtitles
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="text-center space-y-3">
                <p className="text-sm text-muted-foreground">
                  YT Grabber is a free, open-source desktop app. Download it and run locally for the best experience — no ads, no tracking, no cloud servers.
                </p>
                <p className="text-xs text-muted-foreground/70">
                  YouTube blocks requests from cloud servers, so the app must run on your own computer.
                </p>
              </div>

              <div className="space-y-2">
                <a
                  href="https://github.com/harrywang/ytgrabber/releases/latest"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="w-full" size="lg">
                    <Download className="h-4 w-4" />
                    Download Desktop App
                  </Button>
                </a>
              </div>

              <div className="text-xs text-muted-foreground/70 text-center space-y-1">
                <p>Available for macOS (Intel & Apple Silicon) and Windows</p>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-2 pt-0">
              <div className="text-xs text-muted-foreground/60 text-center">
                Or run from source:
              </div>
              <code className="block w-full bg-muted rounded px-3 py-2 text-xs font-mono text-muted-foreground text-center">
                git clone https://github.com/harrywang/ytgrabber && cd ytgrabber && pnpm install && pnpm dev
              </code>
            </CardFooter>
          </Card>
        </div>

        <div className="mt-5 mb-2 flex items-center gap-2 text-sm text-muted-foreground/70">
          <a
            href="https://github.com/harrywang/ytgrabber"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
          </a>
          <span>
            Made by{" "}
            <a href="https://harrywang.me/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2">Harry Wang</a>
            {" "}using{" "}
            <a href="https://github.com/harrywang/ytgrab" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2">ytgrab</a>
          </span>
        </div>
      </div>
    );
  }

  const [url, setUrl] = useState("");
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [isLoadingInfo, setIsLoadingInfo] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [format, setFormat] = useState("best");
  const [downloadSubs, setDownloadSubs] = useState(false);
  const [subLang, setSubLang] = useState("en");
  const [subFormatSrt, setSubFormatSrt] = useState(true);
  const [subFormatTxt, setSubFormatTxt] = useState(true);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadStatus, setDownloadStatus] = useState("");
  const [completedDownload, setCompletedDownload] = useState<DownloadResult | null>(null);
  const downloadAbortRef = useRef<AbortController | null>(null);

  const fetchInfo = async () => {
    if (!url.trim()) return;
    setError(null);
    setVideoInfo(null);

    setIsLoadingInfo(true);

    try {
      const res = await fetch("/api/info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(res.ok ? "Invalid response from server" : `Server error (${res.status})`);
      }
      if (!res.ok) throw new Error(data.error || `Server error (${res.status})`);
      setVideoInfo(data);
      // Warn if YouTube returned incomplete data (likely IP blocked)
      if (!data.title && !data.duration) {
        setError("YouTube returned limited data — this server's IP may be blocked. Downloads may fail.");
      }
      // Set default subtitle language
      const allLangs = [...(data.subtitles || []), ...(data.automatic_captions || [])];
      if (allLangs.includes("en")) {
        setSubLang("en");
      } else if (allLangs.length > 0) {
        setSubLang(allLangs[0]);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch video info");
    } finally {
      setIsLoadingInfo(false);
    }
  };

  const handleDownload = async () => {
    if (!url.trim()) return;
    setError(null);
    setIsDownloading(true);
    setDownloadProgress(0);
    setDownloadStatus("Starting download...");

    const controller = new AbortController();
    downloadAbortRef.current = controller;

    try {
      const res = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: url.trim(),
          format,
          writeSubtitles: downloadSubs,
          subtitleLangs: subLang,
          subFormatSrt,
          subFormatTxt,
        }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const text = await res.text();
        throw new Error(text || `Server error (${res.status})`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let downloadResult: DownloadResult | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = JSON.parse(line.slice(6));

          if (data.type === "status") {
            setDownloadStatus(data.message);
          } else if (data.type === "progress") {
            const pct = data.fragment_count
              ? Math.round((data.fragment_index / data.fragment_count) * 100)
              : 0;
            setDownloadProgress(pct);
            setDownloadStatus(
              `Downloading fragment ${data.fragment_index}/${data.fragment_count}`
            );
          } else if (data.type === "done") {
            setDownloadProgress(100);
            setDownloadStatus("Saving files...");
            downloadResult = data;
          } else if (data.type === "error") {
            throw new Error(data.error);
          }
        }
      }

      if (downloadResult && downloadResult.files.length > 0) {
        setCompletedDownload(downloadResult);
      } else {
        throw new Error("Download failed — no files were produced.");
      }
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") {
        // User cancelled
      } else {
        setError(err instanceof Error ? err.message : "Download failed");
      }
    } finally {
      downloadAbortRef.current = null;
      setIsDownloading(false);
      setDownloadProgress(0);
      setDownloadStatus("");
    }
  };

  const cancelDownload = () => {
    downloadAbortRef.current?.abort();
  };

  const resetAll = () => {
    setUrl("");
    setVideoInfo(null);
    setError(null);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 bg-gradient-to-b from-background to-muted/30">
      <div className="w-full max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Card className="w-full shadow-lg border-border/60">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-center gap-3 mb-1">
              <Image
                src="/ytgrabber-logo.svg"
                alt="YT Grabber Logo"
                width={36}
                height={36}
              />
              <CardTitle className="text-2xl md:text-3xl tracking-tight">
                YT Grabber
              </CardTitle>
            </div>
            <CardDescription className="text-center text-sm">
              Download YouTube videos and subtitles
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* URL Input */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !isLoadingInfo) fetchInfo();
                  }}
                  className="font-mono text-sm pr-8"
                />
                {url && (
                  <button
                    onClick={resetAll}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    type="button"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                )}
              </div>
              <Button
                onClick={fetchInfo}
                disabled={isLoadingInfo || !url.trim()}
                variant="outline"
                className="shrink-0 min-w-[70px]"
              >
                {isLoadingInfo ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Grab"
                )}
              </Button>
            </div>

            {/* Sample Videos */}
            {!videoInfo && <div className="flex flex-wrap gap-1.5">
              {sampleVideos.map((video) => (
                <button
                  key={video.url}
                  onClick={() => setUrl(video.url)}
                  className="text-xs px-2.5 py-1 rounded-full border border-border/60 hover:bg-accent hover:text-accent-foreground hover:border-border transition-all text-muted-foreground cursor-pointer"
                >
                  {video.label}
                </button>
              ))}
            </div>}

            {/* Error */}
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg border border-destructive/20 animate-in fade-in slide-in-from-top-2 duration-300">
                {error}
              </div>
            )}

            {/* Video Info */}
            {videoInfo && (
              <div className="animate-in fade-in slide-in-from-bottom-3 duration-400">
                <Card className="border-border/50 shadow-sm overflow-hidden">
                  <a
                    href={`https://www.youtube.com/watch?v=${videoInfo.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block relative aspect-video w-full group"
                  >
                    <img
                      src={`https://img.youtube.com/vi/${videoInfo.id}/maxresdefault.jpg`}
                      alt={videoInfo.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-black/70 group-hover:bg-red-600 transition-colors flex items-center justify-center">
                        <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </a>
                  <CardContent className="p-5 space-y-3">
                    <h3 className="font-semibold text-base leading-snug">
                      {videoInfo.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                      {videoInfo.uploader && (
                        <span className="bg-muted px-2 py-0.5 rounded-md">{videoInfo.uploader}</span>
                      )}
                      {videoInfo.duration > 0 && (
                        <span className="bg-muted px-2 py-0.5 rounded-md">{formatDuration(videoInfo.duration)}</span>
                      )}
                      {videoInfo.view_count > 0 && (
                        <span className="bg-muted px-2 py-0.5 rounded-md">{formatViewCount(videoInfo.view_count)}</span>
                      )}
                    </div>

                    {(videoInfo.subtitles.length > 0 ||
                      videoInfo.automatic_captions.length > 0) && (
                      <div className="text-xs text-muted-foreground/80 space-y-0.5 pt-1 border-t border-border/40">
                        <p>
                          <span className="text-muted-foreground">Subtitles:</span>{" "}
                          {videoInfo.subtitles.length > 0
                            ? videoInfo.subtitles.join(", ")
                            : "none"}
                        </p>
                        <p>
                          <span className="text-muted-foreground">Auto captions:</span>{" "}
                          {videoInfo.automatic_captions.length > 0
                            ? videoInfo.automatic_captions.slice(0, 10).join(", ")
                            : "none"}
                          {videoInfo.automatic_captions.length > 10 &&
                            ` +${videoInfo.automatic_captions.length - 10} more`}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Download Options */}
            {videoInfo && (
              <div className="animate-in fade-in slide-in-from-bottom-3 duration-400 delay-100 fill-both">
                <Card className="border-border/50 shadow-sm">
                  <CardContent className="p-5 space-y-4">
                    <h3 className="text-sm font-semibold tracking-tight">Download Options</h3>

                    {/* Video Quality */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Video Quality</Label>
                      <Select value={format} onValueChange={setFormat}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="best">Best (720p)</SelectItem>
                          <SelectItem value="720p">720p</SelectItem>
                          <SelectItem value="360p">360p</SelectItem>
                          <SelectItem value="144p">144p</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Subtitles */}
                    {(videoInfo.subtitles.length > 0 || videoInfo.automatic_captions.length > 0) && (
                      <div className="space-y-3 pt-1 border-t border-border/40">
                        <div className="flex items-center gap-2 pt-2">
                          <Checkbox
                            id="download-subs"
                            checked={downloadSubs}
                            onCheckedChange={(checked) => setDownloadSubs(checked === true)}
                          />
                          <Label htmlFor="download-subs" className="text-sm cursor-pointer font-normal">
                            Download subtitles
                          </Label>
                        </div>

                        {downloadSubs && (
                          <div className="space-y-3 pl-6">
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground">Language</Label>
                                <Select value={subLang} onValueChange={setSubLang}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="max-h-60">
                                    {videoInfo.subtitles.length > 0 && (
                                      <SelectGroup>
                                        <SelectLabel>Manual subtitles</SelectLabel>
                                        {videoInfo.subtitles.map(lang => (
                                          <SelectItem key={`sub-${lang}`} value={lang}>{langLabel(lang)}</SelectItem>
                                        ))}
                                      </SelectGroup>
                                    )}
                                    {videoInfo.automatic_captions.length > 0 && (
                                      <SelectGroup>
                                        <SelectLabel>Auto-generated captions</SelectLabel>
                                        {videoInfo.automatic_captions.map(lang => (
                                          <SelectItem key={`auto-${lang}`} value={lang}>{langLabel(lang)}</SelectItem>
                                        ))}
                                      </SelectGroup>
                                    )}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground">Formats</Label>
                                <div className="flex items-center gap-4 h-9">
                                  <div className="flex items-center gap-1.5">
                                    <Checkbox
                                      id="sub-srt"
                                      checked={subFormatSrt}
                                      onCheckedChange={(checked) => setSubFormatSrt(checked === true)}
                                    />
                                    <Label htmlFor="sub-srt" className="text-sm cursor-pointer font-normal">SRT</Label>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <Checkbox
                                      id="sub-txt"
                                      checked={subFormatTxt}
                                      onCheckedChange={(checked) => setSubFormatTxt(checked === true)}
                                    />
                                    <Label htmlFor="sub-txt" className="text-sm cursor-pointer font-normal">TXT</Label>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

          </CardContent>

          <CardFooter className="flex flex-col gap-2.5 pt-0">
            {/* Download button */}
            {videoInfo && !isDownloading && !completedDownload && (
              <Button
                onClick={handleDownload}
                className="w-full"
                size="lg"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
            )}

            {/* Progress */}
            {isDownloading && (
              <div className="w-full space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{downloadStatus}</span>
                  <span>{downloadProgress}%</span>
                </div>
                <Progress value={downloadProgress} />
                <Button
                  onClick={cancelDownload}
                  className="w-full"
                  size="lg"
                  variant="outline"
                >
                  Cancel Download
                </Button>
              </div>
            )}

            {/* Completed download */}
            {completedDownload && (
              <div className="w-full space-y-3 animate-in fade-in slide-in-from-bottom-3 duration-400">
                <div className="flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-400">
                  <Check className="h-4 w-4" />
                  Saved to ~/Downloads/ytgrabber
                </div>
                <div className="space-y-1">
                  {completedDownload.files.map((file) => {
                    const Icon = fileTypeIcon[file.type];
                    return (
                      <div
                        key={file.name}
                        className="flex items-center gap-3 py-2 px-3 rounded-lg bg-muted/40 text-sm"
                      >
                        <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="truncate flex-1">{file.name}</span>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {formatFileSize(file.size)}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <Button
                  onClick={() => {
                    fetch("/api/open-folder", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ dir: completedDownload.downloadDir }),
                    });
                  }}
                  className="w-full"
                  variant="outline"
                >
                  <FolderOpen className="h-4 w-4" />
                  Open in Finder
                </Button>
              </div>
            )}

            <Button
              onClick={() => {
                resetAll();
                setCompletedDownload(null);
              }}
              className="w-full"
              variant="outline"
              disabled={isDownloading || isLoadingInfo}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-5 mb-2 flex items-center gap-2 text-sm text-muted-foreground/70">
        <a
          href="https://github.com/harrywang/ytgrabber"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="View source on GitHub"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
        </a>
        <span>
          Made by{" "}
          <a
            href="https://harrywang.me/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
          >
            Harry Wang
          </a>
          {" "}using{" "}
          <a
            href="https://github.com/harrywang/ytgrab"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
          >
            ytgrab
          </a>
        </span>
      </div>
    </div>
  );
}
