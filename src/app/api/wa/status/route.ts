import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getWaToken, tokenFromReq } from "@/lib/wa/token";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function put(key: string, value: string) {
  await prisma.setting.upsert({ where: { key }, update: { value }, create: { key, value } });
}

/**
 * نبضة المحرّك: بيبلّغ حالته (متصل / محتاج QR / مفصول) وممكن يبعت صورة QR
 * عشان إيمان تمسحها من لوحة التحكم.
 */
export async function POST(req: Request) {
  const valid = await getWaToken();
  if (!valid || tokenFromReq(req) !== valid) {
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
