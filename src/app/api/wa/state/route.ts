import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** حالة الواتساب الحيّة (للوحة التحكم) — بتتقري من اللي المحرّك الخارجي بيبلّغ بيه */
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });
  const rows = await prisma.setting.findMany({
    where: { key: { in: ["waWorkerState", "waWorkerQr", "waWorkerLastSeen"] } },
  });
  const m = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  // لو آخر نبضة بقالها أكتر من دقيقتين نعتبر المحرّك مش شغّال
  const lastSeen = m.waWorkerLastSeen ? new Date(m.waWorkerLastSeen).getTime() : 0;
  const stale = !lastSeen || Date.now() - lastSeen > 120000;
  const state = stale ? "offline" : m.waWorkerState || "idle";
  return NextResponse.json({ ok: true, state, qr: state === "qr" ? m.waWorkerQr || "" : "", lastSeen: m.waWorkerLastSeen || "" });
}
