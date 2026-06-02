import "server-only";
import { prisma } from "./prisma";

export type CouponCheck =
  | { ok: true; code: string; percent: number }
  | { ok: false; reason: string };

/** يتأكد إن الكود صالح (مفعّل + في الموسم + لسه فيه استخدام) */
export async function validateCoupon(rawCode: string, now: Date = new Date()): Promise<CouponCheck> {
  const code = (rawCode || "").trim().toUpperCase();
  if (!code) return { ok: false, reason: "اكتبي كود الخصم" };

  const c = await prisma.coupon.findUnique({ where: { code } });
  if (!c || !c.active) return { ok: false, reason: "الكود ده مش صحيح أو متوقف" };
  if (c.startsAt && now < c.startsAt) return { ok: false, reason: "الكود ده لسه مبدأش" };
  if (c.endsAt && now > c.endsAt) return { ok: false, reason: "للأسف صلاحية الكود خلصت" };
  if (c.usageLimit != null && c.usedCount >= c.usageLimit)
    return { ok: false, reason: "الكود ده خلص عدد استخدامه" };

  return { ok: true, code: c.code, percent: c.percent };
}
