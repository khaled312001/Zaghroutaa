import Link from "next/link";
import { ShoppingBag, BellRing, CheckCircle2, Package, Star, ArrowLeft, Wallet, Images } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { ORDER_STATUS, ORDER_STATUS_KEYS, type OrderStatusKey } from "@/lib/orderStatus";
import { computeUrgency, dueLabel } from "@/lib/alerts";
import { OrdersChart } from "@/components/admin/OrdersChart";
import { formatArabicDateTime, formatPriceEGP, toArabicDigits, cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUS_HEX: Record<OrderStatusKey, string> = {
  NEW: "#3B82F6",
  CONTACTED: "#F59E0B",
  CONFIRMED: "#8B5CF6",
  EMBROIDERING: "#6366F1",
  PACKING: "#06B6D4",
  SHIPPING: "#14B8A6",
  DONE: "#22C55E",
  CANCELLED: "#F43F5E",
};

export default async function AdminHome() {
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - 6);

  const [totalOrders, newOrders, confirmed, products, reviews, gallery, recent, last7, statusGroups, revenueAgg, activeOrders, settings] =
    await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: "NEW" } }),
      prisma.order.count({ where: { status: "CONFIRMED" } }),
      prisma.product.count(),
      prisma.review.count({ where: { isActive: true } }),
      prisma.galleryItem.count({ where: { isActive: true } }),
      prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
      prisma.order.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
      prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.order.aggregate({ _sum: { price: true }, where: { status: { in: ["CONFIRMED", "DONE"] } } }),
      prisma.order.findMany({ where: { status: { in: ["NEW", "CONTACTED", "CONFIRMED"] } } }),
      getSettings(),
    ]);

  const revenue = revenueAgg._sum.price ?? 0;

  // أولويات التنبيهات الذكية
  const now = new Date();
  const buffer = Number(settings.prepBufferDays) || 3;
  const topAlerts = activeOrders
    .map((o) => ({ o, u: computeUrgency({ id: o.id, status: o.status, eventDate: o.eventDate, readyByDate: o.readyByDate, createdAt: o.createdAt, priorityBump: o.priorityBump, remindersOn: o.remindersOn }, now, buffer) }))
    .filter((x) => x.u.level === "overdue" || x.u.level === "critical" || x.u.level === "soon" || x.u.needsFollowup)
    .sort((a, b) => b.u.score - a.u.score)
    .slice(0, 5);
  const urgentCount = activeOrders
    .map((o) => computeUrgency({ id: o.id, status: o.status, eventDate: o.eventDate, readyByDate: o.readyByDate, createdAt: o.createdAt, priorityBump: o.priorityBump }, now, buffer))
    .filter((u) => u.level === "overdue" || u.level === "critical").length;

  // بيانات رسم آخر ٧ أيام
  const days: { key: string; label: string; value: number }[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    days.push({
      key: d.toDateString(),
      label: new Intl.DateTimeFormat("ar-EG", { weekday: "short" }).format(d),
      value: 0,
    });
  }
  for (const o of last7) {
    const k = new Date(o.createdAt);
    k.setHours(0, 0, 0, 0);
    const day = days.find((x) => x.key === k.toDateString());
    if (day) day.value++;
  }

  const statusMap = Object.fromEntries(statusGroups.map((g) => [g.status, g._count._all]));
  const statuses = ORDER_STATUS_KEYS.map((k) => ({
    label: ORDER_STATUS[k].label,
    value: (statusMap[k] as number) ?? 0,
    color: STATUS_HEX[k],
  }));

  const stats = [
    { label: "كل الطلبات", value: toArabicDigits(totalOrders), icon: ShoppingBag, color: "text-gold-600 bg-gold-50" },
    { label: "طلبات جديدة", value: toArabicDigits(newOrders), icon: BellRing, color: "text-blue-600 bg-blue-50" },
    { label: "طلبات مؤكّدة", value: toArabicDigits(confirmed), icon: CheckCircle2, color: "text-green-600 bg-green-50" },
    { label: "إجمالي المؤكّد", value: formatPriceEGP(revenue), icon: Wallet, color: "text-emerald-600 bg-emerald-50" },
    { label: "المنتجات", value: toArabicDigits(products), icon: Package, color: "text-violet-600 bg-violet-50" },
    { label: "آراء ظاهرة", value: toArabicDigits(reviews), icon: Star, color: "text-amber-600 bg-amber-50" },
    { label: "صور الأعمال", value: toArabicDigits(gallery), icon: Images, color: "text-rose-600 bg-rose-50" },
  ];

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold text-espresso-900 sm:text-3xl">نظرة عامة</h1>
        <p className="mt-1 text-sm text-espresso-500">ملخّص سريع لحركة متجر زُغْرُوطَة.</p>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-7">
        {stats.map((s) => (
          <div key={s.label} className="card-zg p-4">
            <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${s.color}`}>
              <s.icon className="h-5 w-5" />
            </div>
            <div className="mt-3 font-display text-xl font-extrabold text-espresso-900 sm:text-2xl">
              {s.value}
            </div>
            <div className="text-xs text-espresso-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* مركز التنبيهات الذكي — أهم الأولويات */}
      <div className="card-zg mt-6 overflow-hidden">
        <div className="flex items-center justify-between border-b border-gold-100 px-5 py-4">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-espresso-900">
            <BellRing className="h-5 w-5 text-gold-600" /> أولويات النهاردة
            {urgentCount > 0 && (
              <span className="chip bg-rose-100 text-rose-700">{toArabicDigits(urgentCount)} عاجل</span>
            )}
          </h2>
          <Link href="/admin/alerts" className="flex items-center gap-1 text-sm font-semibold text-gold-700 hover:text-gold-800">
            مركز التنبيهات <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>
        {topAlerts.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-espresso-400">مفيش حاجة عاجلة دلوقتي — كله تمام 🤍</div>
        ) : (
          <ul className="divide-y divide-gold-50">
            {topAlerts.map(({ o, u }) => (
              <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", u.dot)} />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-espresso-900">{o.productName}</p>
                    <p className="truncate text-xs text-espresso-500">{o.customerName} • {o.governorate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {u.needsFollowup && <span className="chip bg-sky-100 text-sky-700">متابعة</span>}
                  <span className={cn("chip", u.chip)}>{u.label}</span>
                  <span className="text-xs font-semibold text-espresso-600">{dueLabel(u.dueInDays)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <OrdersChart days={days} statuses={statuses} />

      <div className="card-zg mt-6 overflow-hidden">
        <div className="flex items-center justify-between border-b border-gold-100 px-5 py-4">
          <h2 className="font-display text-lg font-bold text-espresso-900">أحدث الطلبات</h2>
          <Link href="/admin/orders" className="flex items-center gap-1 text-sm font-semibold text-gold-700 hover:text-gold-800">
            كل الطلبات <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-espresso-400">لسه مفيش طلبات.</p>
            <p className="mt-1 text-xs text-espresso-400">أول ما عروسة تضغط «أكّدي الحجز» هيظهر الطلب هنا فورًا.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gold-50">
            {recent.map((o) => {
              const st = ORDER_STATUS[o.status as OrderStatusKey];
              return (
                <li key={o.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-espresso-900">{o.productName}</p>
                    <p className="text-xs text-espresso-500">
                      {o.customerName} • {o.governorate} • {formatArabicDateTime(o.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {o.price ? <span className="text-sm font-bold text-gold-700">{formatPriceEGP(o.price)}</span> : null}
                    <span className={`chip ${st.badge}`}>{st.label}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
