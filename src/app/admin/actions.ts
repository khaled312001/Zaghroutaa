"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  verifyCredentials,
  createSession,
  destroySession,
  getSession,
} from "@/lib/auth";
import { SETTING_KEYS } from "@/lib/settings";
import type { OrderStatusKey } from "@/lib/orderStatus";

async function assertAdmin() {
  const session = await getSession();
  if (!session) throw new Error("غير مصرّح");
  return session;
}

export type LoginState = { error?: string };

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  if (!email || !password) return { error: "اكتبي البريد وكلمة المرور" };

  const user = await verifyCredentials(email, password);
  if (!user) return { error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" };

  await createSession(user);
  redirect("/admin");
}

export async function logoutAction() {
  await destroySession();
  redirect("/admin/login");
}

export async function updateOrderStatusAction(id: number, status: OrderStatusKey) {
  await assertAdmin();
  await prisma.order.update({ where: { id }, data: { status } });
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
}

export async function deleteOrderAction(id: number) {
  await assertAdmin();
  await prisma.order.delete({ where: { id } });
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
}

export async function toggleReviewAction(id: number, isActive: boolean) {
  await assertAdmin();
  await prisma.review.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/reviews");
  revalidatePath("/reviews");
  revalidatePath("/");
}

export async function deleteReviewAction(id: number) {
  await assertAdmin();
  await prisma.review.delete({ where: { id } });
  revalidatePath("/admin/reviews");
  revalidatePath("/reviews");
}

export async function addReviewAction(imageUrl: string, name?: string, text?: string) {
  await assertAdmin();
  const url = imageUrl.trim();
  if (!url) throw new Error("لازم رابط صورة");
  const max = await prisma.review.aggregate({ _max: { order: true } });
  await prisma.review.create({
    data: {
      imageUrl: url,
      name: name?.trim() || null,
      text: text?.trim() || null,
      isActive: true,
      order: (max._max.order ?? 0) + 1,
    },
  });
  revalidatePath("/admin/reviews");
  revalidatePath("/reviews");
  revalidatePath("/");
}

export async function updateProductAction(
  id: number,
  data: {
    basePrice?: number;
    oldPrice?: number | null;
    badge?: string | null;
    isActive?: boolean;
    isFeatured?: boolean;
  },
) {
  await assertAdmin();
  await prisma.product.update({ where: { id }, data });
  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");
}

export type SettingsState = { ok?: boolean };

export async function updateSettingsAction(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  await assertAdmin();
  for (const key of SETTING_KEYS) {
    const value = String(formData.get(key) ?? "");
    await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }
  revalidatePath("/", "layout");
  return { ok: true };
}
