import Link from "next/link";
import { ShoppingBag, BellRing, CheckCircle2, Package, Star, ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ORDER_STATUS, type OrderStatusKey } from "@/lib/orderStatus";
import { formatArabicDateTime, formatPriceEGP, toArabicDigits } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const [totalOrders, newOrders, confirmed, products, reviews, recent] =
    await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: "NEW" } }),
      prisma.order.count({ where: { status: "CONFIRMED" } }),
      prisma.product.count(),
      prisma.review.count({ where: { isActive: true } }),
      prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
    ]);

  const stats = [
    { label: "كل الطلبات", value: totalOrders, icon: ShoppingBag, color: "text-gold-600 bg-gold-50" },
    { label: "طلبات جديدة", value: newOrders, icon: BellRing, color: "text-blue-600 bg-blue-50" },
    { label: "طلبات مؤكّدة", value: confirmed, icon: CheckCircle2, color: "text-green-600 bg-green-50" },
    { label: "المنتجات", value: products, icon: Package, color: "text-violet-600 bg-violet-50" },
    { label: "آراء ظاهرة", value: reviews, icon: Star, color: "text-amber-600 bg-amber-50" },
  ];

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold text-espresso-900 sm:text-3xl">
          نظرة عامة
        </h1>
        <p className="mt-1 text-sm text-espresso-500">ملخّص سريع لحركة المتجر.</p>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="card-zg p-4 sm:p-5">
            <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${s.color}`}>
              <s.icon className="h-6 w-6" />
            </div>
            <div className="mt-3 font-display text-3xl font-extrabold text-espresso-900">
              {toArabicDigits(s.value)}
            </div>
            <div className="text-sm text-espresso-500">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card-zg mt-6 overflow-hidden">
        <div className="flex items-center justify-between border-b border-gold-100 px-5 py-4">
          <h2 className="font-display text-lg font-bold text-espresso-900">أحدث الطلبات</h2>
          <Link href="/admin/orders" className="flex items-center gap-1 text-sm font-semibold text-gold-700 hover:text-gold-800">
            كل الطلبات <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>

        {recent.length === 0 ? (
          <p className="px-5 py-12 text-center text-espresso-400">لسه مفيش طلبات.</p>
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
                    {o.price ? (
                      <span className="text-sm font-bold text-gold-700">{formatPriceEGP(o.price)}</span>
                    ) : null}
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
