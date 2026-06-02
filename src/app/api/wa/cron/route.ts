import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateReminders } from "@/lib/reminders";
import { startWa, waSend, waState, waConnected } from "@/lib/wa/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_ATTEMPTS = 5;
const BATCH = 10;

// التوكن بييجي من الداتابيز (waCronToken) أو من البيئة — عشان نقدر نغيّره من غير restart للسيرفر
async function getCronToken(): Promise<string | null> {
  const row = await prisma.setting.findUnique({ where: { key: "waCronToken" } }).catch(() => null);
  return (row?.value || process.env.WA_WORKER_TOKEN || "").trim() || null;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * نقطة الكرون: Hostinger بينده عليها كل دقيقة.
 * بتتأكد إن الواتساب شغّال، بتولّد التذكيرات المستحقة، وبتبعت اللي في الطابور.
 */
export async function GET(req: Request) {
  const valid = await getCronToken();
  if (!valid) {
    return NextResponse.json({ ok: false, error: "cron token not set" }, { status: 503 });
  }
  const header = req.headers.get("authorization") || "";
  const bearer = header.startsWith("Bearer ") ? header.slice(7) : "";
  const provided = bearer || new URL(req.url).searchParams.get("token") || "";
  if (provided !== valid) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  // 1) نتأكد إن الاتصال شغّال (بيفضل صاحي بين النداءات)
  await startWa().catch(() => {});

  // 2) تنظيف + توليد المستحق
  await prisma.reminder.updateMany({
    where: { status: "PENDING", attempts: { gte: MAX_ATTEMPTS } },
    data: { status: "FAILED", error: "تجاوز عدد محاولات الإرسال" },
  });
  const gen = await generateReminders(new Date());

  // 3) الإرسال (بس لو متصل)
  let sent = 0;
  let failed = 0;
  if (waConnected()) {
    const due = await prisma.reminder.findMany({
      where: { status: "PENDING", scheduledAt: { lte: new Date() }, attempts: { lt: MAX_ATTEMPTS } },
      orderBy: [{ priority: "desc" }, { scheduledAt: "asc" }],
      take: BATCH,
    });
    for (const r of due) {
      try {
        await waSend(r.toNumber, r.body);
        await prisma.reminder.update({ where: { id: r.id }, data: { status: "SENT", sentAt: new Date(), error: null } });
        sent++;
        await sleep(1500 + Math.floor(Math.random() * 1500));
      } catch (e) {
        await prisma.reminder.update({
          where: { id: r.id },
          data: { attempts: { increment: 1 }, error: String(e instanceof Error ? e.message : e).slice(0, 300) },
        });
        failed++;
      }
    }
  }

  return NextResponse.json({ ok: true, state: waState().state, generated: gen.created, sent, failed });
}
