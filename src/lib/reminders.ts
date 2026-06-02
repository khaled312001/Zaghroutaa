import "server-only";
import { prisma } from "./prisma";
import { getSettings } from "./settings";
import { SITE_URL } from "./seo";
import { normalizeWhatsappNumber } from "./whatsapp";
import {
  computeUrgency,
  effectiveReadyBy,
  dueLabel,
  DEFAULT_BUFFER_DAYS,
  URGENCY_META,
  type Urgency,
} from "./alerts";

type OrderRow = {
  id: number;
  productName: string;
  variantName: string | null;
  customerName: string;
  brideName: string | null;
  groomName: string | null;
  phone: string;
  governorate: string;
  status: "NEW" | "CONTACTED" | "CONFIRMED" | "DONE" | "CANCELLED";
  eventDate: Date | null;
  eventType: string | null;
  readyByDate: Date | null;
  priorityBump: number;
  remindersOn: boolean;
  createdAt: Date;
  shoppingItems: { name: string; qty: string | null; bought: boolean }[];
  product: { slug: string } | null;
};

/** أجزاء التاريخ والوقت بتوقيت القاهرة (عشان الملخص اليومي يطلع في الميعاد الصح) */
function cairoParts(now: Date) {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Cairo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = Object.fromEntries(fmt.formatToParts(now).map((p) => [p.type, p.value]));
  return {
    ymd: `${parts.year}-${parts.month}-${parts.day}`,
    minutes: Number(parts.hour) * 60 + Number(parts.minute),
  };
}

function customerLink(phone: string): string {
  return `https://wa.me/${normalizeWhatsappNumber(phone)}`;
}

function orderTitle(o: OrderRow, u: Urgency): string {
  return `${u.label}: ${o.productName} — ${o.customerName}`;
}

function orderBody(o: OrderRow, u: Urgency): string {
  const couple =
    o.brideName || o.groomName ? `\n💍 ${o.brideName || "-"} و ${o.groomName || "-"}` : "";
  const ev = o.eventDate
    ? `\n🗓️ المناسبة: ${o.eventType ? o.eventType + " — " : ""}${o.eventDate.toLocaleDateString("ar-EG", { timeZone: "Africa/Cairo" })}`
    : "";
  const unbought = o.shoppingItems.filter((s) => !s.bought);
  const mats = unbought.length
    ? `\n🛒 خامات مستنية: ${unbought.map((s) => s.name).join("، ")}`
    : "";
  return [
    `🔔 ${u.label} — ${dueLabel(u.dueInDays)}`,
    `🧵 ${o.productName}${o.variantName ? " — " + o.variantName : ""}`,
    `👰 ${o.customerName} — ${o.governorate}${couple}${ev}${mats}`,
    `📞 ${o.phone}`,
    `👉 كلّميها: ${customerLink(o.phone)}`,
  ].join("\n");
}

function materialsBody(o: OrderRow, u: Urgency): string {
  const unbought = o.shoppingItems.filter((s) => !s.bought);
  const list = unbought.map((s) => `• ${s.name}${s.qty ? ` (${s.qty})` : ""}`).join("\n");
  return [
    `🛒 خامات لازم تتشتري لأوردر ${o.customerName} (${dueLabel(u.dueInDays)}):`,
    list,
    `🧵 ${o.productName}`,
  ].join("\n");
}

function followupBody(o: OrderRow): string {
  return [
    `📞 أوردر جديد محتاج تتواصلي معاه:`,
    `🧵 ${o.productName}${o.variantName ? " — " + o.variantName : ""}`,
    `👰 ${o.customerName} — ${o.governorate}`,
    `📞 ${o.phone}`,
    `👉 ${customerLink(o.phone)}`,
  ].join("\n");
}

/** رسالة بتتبعت للعروسة نفسها لو حجزت ومكمّلتش تأكيد الحجز */
function customerFollowupBody(o: OrderRow): string {
  const link = o.product?.slug ? `${SITE_URL}/products/${o.product.slug}` : SITE_URL;
  return [
    `أهلاً يا ${o.customerName} 🌸`,
    `إحنا في زُغْرُوطَة شايفين إنك بدأتي حجز (${o.productName}) ومستنيينك تأكّدي الحجز عشان نلحق نبدأ تنفيذ أوردرك فعليًا.`,
    `لو محتاجة أي مساعدة أو استفسار إحنا معاكي 💛`,
    `أكّدي حجزك من هنا: ${link}`,
  ].join("\n");
}

/** يضيف تذكير للطابور من غير تكرار (بالاعتماد على dedupeKey) */
async function enqueue(data: {
  orderId?: number | null;
  kind: string;
  title: string;
  body: string;
  toNumber: string;
  priority: number;
  scheduledAt: Date;
  dedupeKey: string;
}): Promise<boolean> {
  try {
    await prisma.reminder.create({
      data: {
        orderId: data.orderId ?? null,
        kind: data.kind,
        title: data.title,
        body: data.body,
        toNumber: data.toNumber,
        priority: data.priority,
        scheduledAt: data.scheduledAt,
        dedupeKey: data.dedupeKey,
        status: "PENDING",
      },
    });
    return true;
  } catch {
    // غالبًا P2002 (التذكير موجود قبل كده) — بنتجاهله
    return false;
  }
}

export type GenerateResult = { created: number; skipped?: string };

/**
 * بيولّد تنبيهات الواتساب المستحقة دلوقتي ويحطّها في الطابور (Outbox).
 * بيتنادى من /api/wa/outbox كل دقيقة (من الـ worker) ومن زر التحديث اليدوي.
 */
export async function generateReminders(now: Date = new Date()): Promise<GenerateResult> {
  const settings = await getSettings();
  if (settings.alertsEnabled !== "1") return { created: 0, skipped: "alerts_disabled" };

  const to = normalizeWhatsappNumber(settings.waAlertNumber);
  if (!to || to.length < 10) return { created: 0, skipped: "no_alert_number" };

  const buffer = Number(settings.prepBufferDays) || DEFAULT_BUFFER_DAYS;
  const { ymd, minutes } = cairoParts(now);

  const orders = (await prisma.order.findMany({
    where: { status: { in: ["NEW", "CONTACTED", "CONFIRMED"] }, remindersOn: true },
    include: { shoppingItems: true, product: { select: { slug: true } } },
  })) as unknown as OrderRow[];

  const customerFollowup = settings.customerFollowupOn === "1";
  let created = 0;

  for (const o of orders) {
    const u = computeUrgency(
      {
        id: o.id,
        status: o.status,
        eventDate: o.eventDate,
        readyByDate: o.readyByDate,
        createdAt: o.createdAt,
        priorityBump: o.priorityBump,
        remindersOn: o.remindersOn,
      },
      now,
      buffer,
    );

    // 1) تنبيهات الميعاد
    if (u.dueInDays !== null) {
      if (u.dueInDays <= 0) {
        // فات الميعاد → تذكير يومي
        if (
          await enqueue({
            orderId: o.id,
            kind: "due_soon",
            title: orderTitle(o, u),
            body: orderBody(o, u),
            toNumber: to,
            priority: u.score,
            scheduledAt: now,
            dedupeKey: `order:${o.id}:overdue:${ymd}`,
          })
        )
          created++;
      } else if (u.dueInDays <= 2) {
        // عاجل جدًا → تذكير يومي
        if (
          await enqueue({
            orderId: o.id,
            kind: "due_soon",
            title: orderTitle(o, u),
            body: orderBody(o, u),
            toNumber: to,
            priority: u.score,
            scheduledAt: now,
            dedupeKey: `order:${o.id}:critical:${ymd}`,
          })
        )
          created++;
      } else if (u.dueInDays <= 3) {
        if (
          await enqueue({
            orderId: o.id,
            kind: "due_soon",
            title: orderTitle(o, u),
            body: orderBody(o, u),
            toNumber: to,
            priority: u.score,
            scheduledAt: now,
            dedupeKey: `order:${o.id}:due:3`,
          })
        )
          created++;
      } else if (u.dueInDays <= 7) {
        if (
          await enqueue({
            orderId: o.id,
            kind: "due_soon",
            title: orderTitle(o, u),
            body: orderBody(o, u),
            toNumber: to,
            priority: u.score,
            scheduledAt: now,
            dedupeKey: `order:${o.id}:due:7`,
          })
        )
          created++;
      }
    }

    // 2) تنبيه الخامات (لو فيه خامات مش متشترية والميعاد خلال أسبوع)
    const unbought = o.shoppingItems.filter((s) => !s.bought);
    if (unbought.length && u.dueInDays !== null && u.dueInDays <= 7) {
      if (
        await enqueue({
          orderId: o.id,
          kind: "materials",
          title: `🛒 خامات: ${o.productName} — ${o.customerName}`,
          body: materialsBody(o, u),
          toNumber: to,
          priority: u.score + 10,
          scheduledAt: now,
          dedupeKey: `order:${o.id}:materials:${ymd}`,
        })
      )
        created++;
    }

    // 3) متابعة الأوردرات الجديدة (تذكير لإيمان — مرة واحدة)
    if (u.needsFollowup) {
      if (
        await enqueue({
          orderId: o.id,
          kind: "followup",
          title: `📞 تابعي ${o.customerName}`,
          body: followupBody(o),
          toNumber: to,
          priority: u.score,
          scheduledAt: now,
          dedupeKey: `order:${o.id}:followup`,
        })
      )
        created++;
    }

    // 4) تذكير العروسة نفسها لو حجزت ومكمّلتش (مرة واحدة بعد ٣ ساعات)
    if (customerFollowup && o.status === "NEW") {
      const hoursSince = (now.getTime() - new Date(o.createdAt).getTime()) / 3_600_000;
      const custTo = normalizeWhatsappNumber(o.phone);
      if (hoursSince >= 3 && custTo.length >= 10) {
        if (
          await enqueue({
            orderId: o.id,
            kind: "customer_followup",
            title: `تذكير العميلة ${o.customerName}`,
            body: customerFollowupBody(o),
            toNumber: custTo,
            priority: 60,
            scheduledAt: now,
            dedupeKey: `order:${o.id}:cust_followup`,
          })
        )
          created++;
      }
    }
  }

  // 5) الملخّص اليومي (مرة في اليوم بعد ميعاده)
  const digestMinutes = parseTime(settings.dailyDigestTime);
  if (digestMinutes !== null && minutes >= digestMinutes) {
    const body = buildDigest(orders, now, buffer);
    if (
      await enqueue({
        kind: "digest",
        title: "📋 ملخّص شغل النهاردة — زُغْرُوطَة",
        body,
        toNumber: to,
        priority: 200,
        scheduledAt: now,
        dedupeKey: `digest:${ymd}`,
      })
    )
      created++;
  }

  return { created };
}

function parseTime(hhmm: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec((hhmm || "").trim());
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
}

function buildDigest(orders: OrderRow[], now: Date, buffer: number): string {
  const scored = orders
    .map((o) => ({
      o,
      u: computeUrgency(
        {
          id: o.id,
          status: o.status,
          eventDate: o.eventDate,
          readyByDate: o.readyByDate,
          createdAt: o.createdAt,
          priorityBump: o.priorityBump,
        },
        now,
        buffer,
      ),
    }))
    .sort((a, b) => b.u.score - a.u.score);

  const count = (lvls: string[]) => scored.filter((x) => lvls.includes(x.u.level)).length;
  const top = scored
    .filter((x) => x.u.level !== "none" && x.u.level !== "later")
    .slice(0, 5)
    .map((x, i) => `${i + 1}. ${x.o.productName} — ${x.o.customerName} (${dueLabel(x.u.dueInDays)})`)
    .join("\n");

  const materialsCount = orders.reduce(
    (n, o) => n + o.shoppingItems.filter((s) => !s.bought).length,
    0,
  );

  return [
    "📋 صباح الخير يا إيمان! ملخّص شغل النهاردة:",
    "",
    `${URGENCY_META.overdue.label}: ${count(["overdue"])}`,
    `${URGENCY_META.critical.label}: ${count(["critical"])}`,
    `${URGENCY_META.soon.label}: ${count(["soon"])}`,
    `${URGENCY_META.upcoming.label}: ${count(["upcoming"])}`,
    "",
    top ? "🎯 أهم الأوردرات:\n" + top : "مفيش أوردرات عاجلة النهاردة 🤍",
    "",
    `🛒 خامات مستنية شراء: ${materialsCount} صنف`,
    "بالتوفيق 🌷",
  ].join("\n");
}

export { effectiveReadyBy };
