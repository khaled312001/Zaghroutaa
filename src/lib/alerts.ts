import type { OrderStatusKey } from "./orderStatus";

/**
 * محرّك الأولوية والتنبيهات الذكي لزُغْرُوطَة.
 * بيحسب لكل أوردر مستوى الإلحاح بناءً على ميعاد التسليم/المناسبة وحالته،
 * عشان إيمان تعرف تبدأ بإيه وتشتري الخامات في الوقت المناسب.
 */

export type UrgencyLevel =
  | "overdue" // فات ميعاد تجهيزه
  | "critical" // خلال يومين
  | "soon" // خلال أسبوع
  | "upcoming" // قريّب
  | "later" // لسه بدري
  | "none"; // متسلّم أو ملغي

export type AlertOrderInput = {
  id: number;
  status: OrderStatusKey;
  eventDate: Date | string | null;
  readyByDate: Date | string | null;
  createdAt: Date | string;
  priorityBump?: number | null;
  remindersOn?: boolean | null;
};

export type Urgency = {
  level: UrgencyLevel;
  score: number; // الأكبر = الأهم (للترتيب)
  dueInDays: number | null; // موجب = فاضل، سالب = فات، null = مفيش ميعاد
  readyBy: Date | null;
  needsFollowup: boolean; // أوردر جديد محتاج تتواصلي معاه
  label: string;
  chip: string;
  dot: string;
  hex: string;
};

const DAY = 86_400_000;

export const DEFAULT_BUFFER_DAYS = 3; // بنجهّز القطعة قبل المناسبة بكام يوم

export const URGENCY_META: Record<
  UrgencyLevel,
  { label: string; chip: string; dot: string; hex: string; rank: number }
> = {
  overdue: { label: "فات ميعاده", chip: "bg-rose-100 text-rose-700", dot: "bg-rose-600", hex: "#E11D48", rank: 5 },
  critical: { label: "عاجل جدًا", chip: "bg-orange-100 text-orange-700", dot: "bg-orange-500", hex: "#F97316", rank: 4 },
  soon: { label: "عاجل", chip: "bg-amber-100 text-amber-700", dot: "bg-amber-500", hex: "#F59E0B", rank: 3 },
  upcoming: { label: "قريّب", chip: "bg-blue-100 text-blue-700", dot: "bg-blue-500", hex: "#3B82F6", rank: 2 },
  later: { label: "في الوقت", chip: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500", hex: "#10B981", rank: 1 },
  none: { label: "خلص", chip: "bg-espresso-100 text-espresso-500", dot: "bg-espresso-300", hex: "#A8A29E", rank: 0 },
};

function toDate(v: Date | string | null | undefined): Date | null {
  if (!v) return null;
  const d = v instanceof Date ? v : new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

function startOfDay(d: Date): number {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
}

/** عدد الأيام بين تاريخين (بالأيام الكاملة، حسب اليوم مش الساعة) */
export function dayDiff(target: Date, now: Date): number {
  return Math.round((startOfDay(target) - startOfDay(now)) / DAY);
}

/** آخر ميعاد لازم القطعة تخلص فيه: اليدوي أولًا، وإلا المناسبة ناقص البَفر */
export function effectiveReadyBy(
  order: Pick<AlertOrderInput, "eventDate" | "readyByDate">,
  bufferDays = DEFAULT_BUFFER_DAYS,
): Date | null {
  const manual = toDate(order.readyByDate);
  if (manual) return manual;
  const event = toDate(order.eventDate);
  if (!event) return null;
  return new Date(event.getTime() - bufferDays * DAY);
}

/** نص عربي ودود لميعاد التسليم */
export function dueLabel(dueInDays: number | null): string {
  if (dueInDays === null) return "مفيش ميعاد محدّد";
  if (dueInDays < 0) return `فات بـ ${Math.abs(dueInDays)} يوم`;
  if (dueInDays === 0) return "النهاردة";
  if (dueInDays === 1) return "بكرة";
  if (dueInDays === 2) return "بعد بكرة";
  return `فاضل ${dueInDays} يوم`;
}

export function computeUrgency(
  order: AlertOrderInput,
  now: Date,
  bufferDays = DEFAULT_BUFFER_DAYS,
): Urgency {
  const bump = order.priorityBump ?? 0;
  const readyBy = effectiveReadyBy(order, bufferDays);
  const dueInDays = readyBy ? dayDiff(readyBy, now) : null;

  // متسلّم أو ملغي → خلص
  if (order.status === "DONE" || order.status === "CANCELLED") {
    const m = URGENCY_META.none;
    return { level: "none", score: -1, dueInDays, readyBy, needsFollowup: false, label: m.label, chip: m.chip, dot: m.dot, hex: m.hex };
  }

  // محتاج متابعة: جديد أو لسه اتكلّم بس عدّى عليه أكتر من ١٢ ساعة
  const created = toDate(order.createdAt);
  const hoursSince = created ? (now.getTime() - created.getTime()) / 3_600_000 : 0;
  const needsFollowup =
    (order.status === "NEW" || order.status === "CONTACTED") && hoursSince > 12;

  let level: UrgencyLevel;
  if (dueInDays === null) {
    level = needsFollowup ? "soon" : "later";
  } else if (dueInDays <= 0) level = "overdue";
  else if (dueInDays <= 2) level = "critical";
  else if (dueInDays <= 6) level = "soon";
  else if (dueInDays <= 12) level = "upcoming";
  else level = "later";

  const meta = URGENCY_META[level];
  // نقاط الترتيب: الرفع اليدوي أقوى حاجة، بعده مستوى الإلحاح، بعده المتابعة، وكسر التعادل بالأقرب ميعاد
  const closeness = dueInDays === null ? 0 : Math.max(0, 30 - dueInDays);
  const score = bump * 1000 + meta.rank * 100 + (needsFollowup ? 40 : 0) + closeness;

  return {
    level,
    score,
    dueInDays,
    readyBy,
    needsFollowup,
    label: meta.label,
    chip: meta.chip,
    dot: meta.dot,
    hex: meta.hex,
  };
}

export type ScoredOrder<T extends AlertOrderInput> = T & { urgency: Urgency };

/** يرتّب الأوردرات من الأهم للأقل أهمية */
export function rankOrders<T extends AlertOrderInput>(
  orders: T[],
  now: Date,
  bufferDays = DEFAULT_BUFFER_DAYS,
): ScoredOrder<T>[] {
  return orders
    .map((o) => ({ ...o, urgency: computeUrgency(o, now, bufferDays) }))
    .sort((a, b) => {
      if (b.urgency.score !== a.urgency.score) return b.urgency.score - a.urgency.score;
      const da = a.urgency.dueInDays ?? 9999;
      const db = b.urgency.dueInDays ?? 9999;
      return da - db;
    });
}

export const ACTIVE_STATUSES: OrderStatusKey[] = ["NEW", "CONTACTED", "CONFIRMED"];
