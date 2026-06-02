"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

async function assertAdmin() {
  const s = await getSession();
  if (!s) throw new Error("غير مصرّح");
  return s;
}

export type CouponInput = {
  code: string;
  percent: number;
  active: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
  usageLimit?: number | null;
  note?: string | null;
};

export async function createCouponAction(input: CouponInput) {
  await assertAdmin();
  const code = input.code.trim().toUpperCase();
  if (!code) throw new Error("اكتبي الكود");
  const percent = Math.max(1, Math.min(100, Math.round(input.percent || 0)));
  const exists = await prisma.coupon.findUnique({ where: { code } });
  if (exists) throw new Error("الكود ده موجود قبل كده");
  await prisma.coupon.create({
    data: {
      code,
      percent,
      active: input.active,
      startsAt: input.startsAt ? new Date(input.startsAt) : null,
      endsAt: input.endsAt ? new Date(input.endsAt) : null,
      usageLimit: input.usageLimit && input.usageLimit > 0 ? input.usageLimit : null,
      note: input.note?.trim() || null,
    },
  });
  revalidatePath("/admin/coupons");
}

export async function toggleCouponAction(id: number, active: boolean) {
  await assertAdmin();
  await prisma.coupon.update({ where: { id }, data: { active } });
  revalidatePath("/admin/coupons");
}

export async function deleteCouponAction(id: number) {
  await assertAdmin();
  await prisma.coupon.delete({ where: { id } });
  revalidatePath("/admin/coupons");
}
