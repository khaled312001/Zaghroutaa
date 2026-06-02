import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateReminders } from "@/lib/reminders";
import { getWaToken, tokenFromReq } from "@/lib/wa/token";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_ATTEMPTS = 5;
const BATCH = 20;

/** المحرّك الخارجي بينده هنا: بنولّد المستحق ونرجّع الرسائل الجاهزة للإرسال */
export async function GET(req: Request) {
  const valid = await getWaToken();
  if (!valid) {
    return NextResponse.json({ ok: false, error: "token not configured" }, { status: 503 });
  }
  if (tokenFromReq(req) !== valid) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const now = new Date();
  let generated = 0;
  try {
    // تنظيف الرسائل اللي فشلت كتير
    await prisma.reminder.updateMany({
      where: { status: "PENDING", attempts: { gte: MAX_ATTEMPTS } },
      data: { status: "FAILED", error: "تجاوز عدد محاولات الإرسال" },
    });

    const gen = await generateReminders(now);
    generated = gen.created;

    const due = await prisma.reminder.findMany({
      where: { status: "PENDING", scheduledAt: { lte: now }, attempts: { lt: MAX_ATTEMPTS } },
      orderBy: [{ priority: "desc" }, { scheduledAt: "asc" }],
      take: BATCH,
    });

    if (due.length) {
      await prisma.reminder.updateMany({
        where: { id: { in: due.map((d) => d.id) } },
        data: { attempts: { increment: 1 } },
      });
    }

    return NextResponse.json({
      ok: true,
      generated,
      count: due.length,
      reminders: due.map((d) => ({ id: d.id, to: d.toNumber, title: d.title, body: d.body })),
    });
  } catch (e) {
    console.error("wa outbox GET error", e);
    return NextResponse.json({ ok: false, error: "server error", generated }, { status: 500 });
  }
}

/** المحرّك بيرجّع نتيجة الإرسال: { id, ok, error? } أو { results: [...] } */
export async function POST(req: Request) {
  const valid = await getWaToken();
  if (!valid || tokenFromReq(req) !== valid) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  try {
    const json = await req.json().catch(() => ({}));
    const results = Array.isArray(json.results) ? json.results : [json];
    let updated = 0;
    for (const r of results) {
      const id = Number(r?.id);
      if (!Number.isInteger(id)) continue;
      if (r.ok) {
        await prisma.reminder
          .update({ where: { id }, data: { status: "SENT", sentAt: new Date(), error: null } })
          .then(() => updated++)
          .catch(() => {});
      } else {
        await prisma.reminder
          .update({ where: { id }, data: { error: String(r.error || "فشل الإرسال").slice(0, 500) } })
          .catch(() => {});
      }
    }
    return NextResponse.json({ ok: true, updated });
  } catch (e) {
    console.error("wa outbox POST error", e);
    return NextResponse.json({ ok: false, error: "server error" }, { status: 500 });
  }
}
