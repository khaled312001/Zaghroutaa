import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { waState } from "@/lib/wa/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** حالة الواتساب الحيّة (للوحة التحكم) — الحالة + كود الـ QR */
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });
  const s = waState();
  return NextResponse.json({ ok: true, state: s.state, qr: s.qr });
}
