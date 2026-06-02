import { NextResponse } from "next/server";
import { validateCoupon } from "@/lib/coupons";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { code } = await req.json().catch(() => ({}));
    const res = await validateCoupon(String(code || ""));
    if (!res.ok) return NextResponse.json({ ok: false, error: res.reason });
    return NextResponse.json({ ok: true, code: res.code, percent: res.percent });
  } catch {
    return NextResponse.json({ ok: false, error: "حصل خطأ، حاولي تاني" }, { status: 500 });
  }
}
