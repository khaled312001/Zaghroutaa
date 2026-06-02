import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { startWa, waState } from "@/lib/wa/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** الأدمن بتدوس «اربطي واتساب» → بنبدأ الاتصال ويطلع QR */
export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });
  try {
    await startWa();
    return NextResponse.json({ ok: true, state: waState().state });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e instanceof Error ? e.message : e) }, { status: 500 });
  }
}
