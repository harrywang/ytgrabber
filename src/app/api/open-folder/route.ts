import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";

export async function POST(request: NextRequest) {
  try {
    const { dir } = await request.json();
    if (!dir) {
      return NextResponse.json({ error: "Missing directory" }, { status: 400 });
    }

    // Open folder in system file manager
    const platform = process.platform;
    if (platform === "darwin") {
      exec(`open "${dir}"`);
    } else if (platform === "win32") {
      exec(`explorer "${dir}"`);
    } else {
      exec(`xdg-open "${dir}"`);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to open folder" }, { status: 500 });
  }
}
