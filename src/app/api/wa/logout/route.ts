import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { waLogout } from "@/lib/wa/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** فصل/تسجيل خروج الواتساب (هيطلب QR تاني) */
export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });
  await waLogout();
  return NextResponse.json({ ok: true });
}
