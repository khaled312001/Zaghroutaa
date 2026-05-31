import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// نفس المجلد الدائم اللي بيكتب فيه /api/upload
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");

const TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  avif: "image/avif",
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ file: string }> },
) {
  const { file } = await params;
  const safe = path.basename(file); // يمنع path traversal
  if (safe !== file || safe.includes("..")) {
    return new NextResponse("Bad request", { status: 400 });
  }
  const ext = safe.split(".").pop()?.toLowerCase() ?? "";
  if (!TYPES[ext]) return new NextResponse("Not found", { status: 404 });

  try {
    const buf = await readFile(path.join(UPLOAD_DIR, safe));
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "Content-Type": TYPES[ext],
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
