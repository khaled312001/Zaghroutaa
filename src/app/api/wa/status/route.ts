import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authed(req: Request): boolean {
  const token = process.env.WA_WORKER_TOKEN;
  if (!token) return false;
  const header = req.headers.get("authorization") || "";
  const bearer = header.startsWith("Bearer ") ? header.slice(7) : "";
  return bearer === token || new URL(req.url).searchParams.get("token") === token;
}

async function put(key: string, value: string) {
  await prisma.setting.upsert({ where: { key }, update: { value }, create: { key, value } });
}

/**
 * نبضة الـ worker: بيبلّغ حالته (متصل / محتاج QR / مفصول) وممكن يبعت صورة QR
 * عشان إيمان تمسحها من لوحة التحكم من غير ما تفتح السيرفر.
 */
export async function POST(req: Request) {
  if (!authed(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json().catch(() => ({}));
    const state = String(body.state || "unknown");
    await put("waWorkerState", state);
    await put("waWorkerLastSeen", new Date().toISOString());
    if (typeof body.qr === "string") await put("waWorkerQr", state === "qr" ? body.qr : "");
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("wa status error", e);
    return NextResponse.json({ ok: false, error: "server error" }, { status: 500 });
  }
}
