import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { computeUrgency, dueLabel, URGENCY_META, type UrgencyLevel } from "@/lib/alerts";
import { AlertsBoard, type AlertOrder, type ReminderRow } from "@/components/admin/AlertsBoard";

export const dynamic = "force-dynamic";

export default async function AlertsPage() {
  const settings = await getSettings();
  const buffer = Number(settings.prepBufferDays) || 3;
  const now = new Date();

  const [orders, reminders, statusRows] = await Promise.all([
    prisma.order.findMany({
      where: { status: { in: ["NEW", "CONTACTED", "CONFIRMED"] } },
      include: { shoppingItems: { orderBy: { createdAt: "asc" } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.reminder.findMany({ orderBy: { createdAt: "desc" }, take: 25 }),
    prisma.setting.findMany({
      where: { key: { in: ["waWorkerState", "waWorkerLastSeen", "waWorkerQr"] } },
    }),
  ]);

  const sMap = Object.fromEntries(statusRows.map((r) => [r.key, r.value]));

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
          remindersOn: o.remindersOn,
        },
        now,
        buffer,
      ),
    }))
    .sort((a, b) => b.u.score - a.u.score || (a.u.dueInDays ?? 9999) - (b.u.dueInDays ?? 9999));

  const alertOrders: AlertOrder[] = scored.map(({ o, u }) => ({
    id: o.id,
    productName: o.productName,
    variantName: o.variantName,
    customerName: o.customerName,
    brideName: o.brideName,
    groomName: o.groomName,
    phone: o.phone,
    governorate: o.governorate,
    status: o.status,
    eventDate: o.eventDate ? o.eventDate.toISOString() : null,
    eventType: o.eventType,
    readyByDate: o.readyByDate ? o.readyByDate.toISOString() : null,
    priorityBump: o.priorityBump,
    remindersOn: o.remindersOn,
    createdAt: o.createdAt.toISOString(),
    shopping: o.shoppingItems.map((s) => ({ id: s.id, name: s.name, qty: s.qty, bought: s.bought })),
    level: u.level,
    levelLabel: u.label,
    dueInDays: u.dueInDays,
    dueText: dueLabel(u.dueInDays),
    needsFollowup: u.needsFollowup,
  }));

  const counts = {} as Record<UrgencyLevel, number>;
  (Object.keys(URGENCY_META) as UrgencyLevel[]).forEach((k) => (counts[k] = 0));
  let followups = 0;
  let materials = 0;
  for (const { o, u } of scored) {
    counts[u.level]++;
    if (u.needsFollowup) followups++;
    materials += o.shoppingItems.filter((s) => !s.bought).length;
  }

  const remindersLog: ReminderRow[] = reminders.map((r) => ({
    id: r.id,
    kind: r.kind,
    title: r.title,
    status: r.status,
    scheduledAt: r.scheduledAt.toISOString(),
    sentAt: r.sentAt ? r.sentAt.toISOString() : null,
    error: r.error,
  }));

  return (
    <AlertsBoard
      orders={alertOrders}
      reminders={remindersLog}
      counts={counts}
      followups={followups}
      materialsCount={materials}
      alertNumber={settings.waAlertNumber}
      alertsEnabled={settings.alertsEnabled === "1"}
      worker={{
        state: sMap.waWorkerState || "",
        lastSeen: sMap.waWorkerLastSeen || "",
        qr: sMap.waWorkerQr || "",
      }}
    />
  );
}
