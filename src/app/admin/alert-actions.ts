"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { normalizeWhatsappNumber } from "@/lib/whatsapp";
import { generateReminders } from "@/lib/reminders";

async function assertAdmin() {
  const session = await getSession();
  if (!session) throw new Error("غير مصرّح");
  return session;
}

function refresh() {
  revalidatePath("/admin/alerts");
  revalidatePath("/admin");
}

export async function setOrderReadyByAction(orderId: number, iso: string | null) {
  await assertAdmin();
  await prisma.order.update({
    where: { id: orderId },
    data: { readyByDate: iso ? new Date(iso) : null },
  });
  refresh();
}

export async function setOrderPriorityAction(orderId: number, bump: number) {
  await assertAdmin();
  await prisma.order.update({
    where: { id: orderId },
    data: { priorityBump: Math.max(0, Math.min(3, Math.round(bump))) },
  });
  refresh();
}

export async function toggleOrderRemindersAction(orderId: number, on: boolean) {
  await assertAdmin();
  await prisma.order.update({ where: { id: orderId }, data: { remindersOn: on } });
  refresh();
}

export async function addShoppingItemAction(orderId: number | null, name: string, qty?: string) {
  await assertAdmin();
  const n = name.trim();
  if (!n) throw new Error("اكتبي اسم الخامة");
  await prisma.shoppingItem.create({
    data: { orderId: orderId ?? null, name: n, qty: qty?.trim() || null },
  });
  refresh();
}

export async function toggleShoppingItemAction(id: number, bought: boolean) {
  await assertAdmin();
  await prisma.shoppingItem.update({ where: { id }, data: { bought } });
  refresh();
}

export async function deleteShoppingItemAction(id: number) {
  await assertAdmin();
  await prisma.shoppingItem.delete({ where: { id } });
  refresh();
}

export async function dismissReminderAction(id: number) {
  await assertAdmin();
  await prisma.reminder.update({ where: { id }, data: { status: "CANCELLED" } });
  refresh();
}

export async function clearSentRemindersAction() {
  await assertAdmin();
  await prisma.reminder.deleteMany({ where: { status: { in: ["SENT", "FAILED", "CANCELLED"] } } });
  refresh();
}

export async function regenerateRemindersAction(): Promise<{ created: number; skipped?: string }> {
  await assertAdmin();
  const res = await generateReminders(new Date());
  refresh();
  return res;
}

export async function sendTestReminderAction(): Promise<{ ok: boolean; error?: string }> {
  await assertAdmin();
  const settings = await getSettings();
  const to = normalizeWhatsappNumber(settings.waAlertNumber);
  if (!to || to.length < 10) return { ok: false, error: "حطّي رقم استقبال التنبيهات في الإعدادات الأول" };
  await prisma.reminder.create({
    data: {
      kind: "custom",
      title: "رسالة تجربة",
      body: "🔔 رسالة تجربة من زُغْرُوطَة — نظام التنبيهات شغّال تمام ✅🌷",
      toNumber: to,
      priority: 999,
      scheduledAt: new Date(),
      status: "PENDING",
    },
  });
  refresh();
  return { ok: true };
}
