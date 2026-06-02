import { prisma } from "@/lib/prisma";
import { OrdersTable, type AdminOrder } from "@/components/admin/OrdersTable";
import { AddOrderForm } from "@/components/admin/AddOrderForm";
import type { OrderStatusKey } from "@/lib/orderStatus";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const orders = await prisma.order.findMany({ orderBy: { createdAt: "desc" } });
  const data: AdminOrder[] = orders.map((o) => ({
    id: o.id,
    productName: o.productName,
    variantName: o.variantName,
    price: o.price,
    customerName: o.customerName,
    phone: o.phone,
    governorate: o.governorate,
    address: o.address,
    groomName: o.groomName,
    brideName: o.brideName,
    eventType: o.eventType,
    eventDate: o.eventDate ? o.eventDate.toISOString() : null,
    notes: o.notes,
    status: o.status as OrderStatusKey,
    createdAt: o.createdAt.toISOString(),
  }));

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-espresso-900 sm:text-3xl">الطلبات</h1>
          <p className="mt-1 text-sm text-espresso-500">كل طلبات الحجز — من الموقع أو اللي بتضيفيها بإيدك.</p>
        </div>
        <AddOrderForm />
      </header>
      <OrdersTable orders={data} />
    </div>
  );
}
