import { prisma } from "@/lib/prisma";
import { CouponsManager, type AdminCoupon } from "@/components/admin/CouponsManager";

export const dynamic = "force-dynamic";

export default async function CouponsPage() {
  const rows = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  const coupons: AdminCoupon[] = rows.map((c) => ({
    id: c.id,
    code: c.code,
    percent: c.percent,
    active: c.active,
    startsAt: c.startsAt ? c.startsAt.toISOString().slice(0, 10) : null,
    endsAt: c.endsAt ? c.endsAt.toISOString().slice(0, 10) : null,
    usageLimit: c.usageLimit,
    usedCount: c.usedCount,
    note: c.note,
  }));

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold text-espresso-900 sm:text-3xl">أكواد الخصم</h1>
        <p className="mt-1 text-sm text-espresso-500">
          اعملي أكواد خصم بتتحكمي فيها — تفعّليها أو توقفيها، وتحدّدي نسبتها ومدّتها وعدد استخدامها.
        </p>
      </header>
      <CouponsManager coupons={coupons} />
    </div>
  );
}
