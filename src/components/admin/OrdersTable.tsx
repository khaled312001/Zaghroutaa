"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  MessageCircle, Trash2, MapPin, Calendar, User, Phone, StickyNote, Search,
} from "lucide-react";
import { ORDER_STATUS, ORDER_STATUS_KEYS, type OrderStatusKey } from "@/lib/orderStatus";
import { updateOrderStatusAction, deleteOrderAction } from "@/app/admin/actions";
import { buildWhatsappUrl } from "@/lib/whatsapp";
import { formatArabicDateTime, formatArabicDate, formatPriceEGP, toArabicDigits, cn } from "@/lib/utils";

export type AdminOrder = {
  id: number;
  productName: string;
  variantName: string | null;
  price: number | null;
  customerName: string;
  phone: string;
  governorate: string;
  address: string;
  groomName: string | null;
  brideName: string | null;
  eventType: string | null;
  eventDate: string | null;
  notes: string | null;
  status: OrderStatusKey;
  createdAt: string;
};

function egyptWa(phone: string): string {
  let d = phone.replace(/\D/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  if (d.startsWith("0")) d = "2" + d;
  else if (!d.startsWith("20") && d.length === 10) d = "20" + d;
  return d;
}

export function OrdersTable({ orders: initial }: { orders: AdminOrder[] }) {
  const [orders, setOrders] = useState(initial);
  const [filter, setFilter] = useState<"ALL" | OrderStatusKey>("ALL");
  const [q, setQ] = useState("");

  const counts = useMemo(() => {
    const c: Record<string, number> = { ALL: orders.length };
    for (const k of ORDER_STATUS_KEYS) c[k] = orders.filter((o) => o.status === k).length;
    return c;
  }, [orders]);

  const filtered = orders.filter((o) => {
    if (filter !== "ALL" && o.status !== filter) return false;
    if (q) {
      const hay = `${o.productName} ${o.customerName} ${o.phone} ${o.governorate} ${o.brideName ?? ""} ${o.groomName ?? ""}`.toLowerCase();
      if (!hay.includes(q.toLowerCase())) return false;
    }
    return true;
  });

  async function changeStatus(id: number, status: OrderStatusKey) {
    const prev = orders;
    setOrders((os) => os.map((o) => (o.id === id ? { ...o, status } : o)));
    try {
      await updateOrderStatusAction(id, status);
      toast.success("اتحدّثت حالة الطلب");
    } catch {
      setOrders(prev);
      toast.error("حصل خطأ، حاولي تاني");
    }
  }

  async function remove(id: number) {
    if (!window.confirm("متأكدة إنك عايزة تمسحي الطلب ده نهائيًا؟")) return;
    const prev = orders;
    setOrders((os) => os.filter((o) => o.id !== id));
    try {
      await deleteOrderAction(id);
      toast.success("اتمسح الطلب");
    } catch {
      setOrders(prev);
      toast.error("حصل خطأ، حاولي تاني");
    }
  }

  return (
    <div>
      {/* أدوات */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          <FilterChip active={filter === "ALL"} onClick={() => setFilter("ALL")} label="الكل" count={counts.ALL} />
          {ORDER_STATUS_KEYS.map((k) => (
            <FilterChip
              key={k}
              active={filter === k}
              onClick={() => setFilter(k)}
              label={ORDER_STATUS[k].label}
              count={counts[k]}
            />
          ))}
        </div>
        <div className="relative">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-espresso-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ابحثي بالاسم أو الموبايل..."
            className="w-full rounded-2xl border border-gold-200 bg-pearl py-2.5 pr-10 pl-4 text-sm outline-none focus:border-gold-400 sm:w-64"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card-zg p-12 text-center text-espresso-400">مفيش طلبات في الفئة دي.</div>
      ) : (
        <div className="space-y-4">
          {filtered.map((o) => {
            const st = ORDER_STATUS[o.status];
            const wa = buildWhatsappUrl(
              egyptWa(o.phone),
              `أهلاً ${o.customerName}، معاكي زُغْرُوطَة بخصوص أوردر: ${o.productName}`,
            );
            return (
              <div key={o.id} className="card-zg overflow-hidden">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gold-100 bg-cream-50 px-5 py-3.5">
                  <div className="min-w-0">
                    <p className="font-bold text-espresso-900">
                      {o.productName}
                      {o.variantName ? <span className="text-espresso-500"> — {o.variantName}</span> : null}
                    </p>
                    <p className="text-xs text-espresso-500">
                      طلب #{toArabicDigits(o.id)} • {formatArabicDateTime(o.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {o.price ? <span className="font-bold text-gold-700">{formatPriceEGP(o.price)}</span> : null}
                    <span className={`chip ${st.badge}`}>{st.label}</span>
                  </div>
                </div>

                <div className="grid gap-x-6 gap-y-2.5 px-5 py-4 text-sm sm:grid-cols-2">
                  <Info icon={<User className="h-4 w-4" />} label="العميلة" value={o.customerName} />
                  <Info icon={<Phone className="h-4 w-4" />} label="الموبايل" value={<span dir="ltr">{toArabicDigits(o.phone)}</span>} />
                  <Info icon={<MapPin className="h-4 w-4" />} label="المحافظة" value={o.governorate} />
                  <Info icon={<MapPin className="h-4 w-4" />} label="العنوان" value={o.address} />
                  {(o.brideName || o.groomName) && (
                    <Info icon={<User className="h-4 w-4" />} label="العروسين" value={`${o.brideName || "—"} و ${o.groomName || "—"}`} />
                  )}
                  {(o.eventType || o.eventDate) && (
                    <Info
                      icon={<Calendar className="h-4 w-4" />}
                      label="المناسبة"
                      value={`${o.eventType || ""}${o.eventDate ? " — " + formatArabicDate(o.eventDate) : ""}`}
                    />
                  )}
                  {o.notes && <Info icon={<StickyNote className="h-4 w-4" />} label="ملاحظات" value={o.notes} full />}
                </div>

                <div className="flex flex-wrap items-center gap-2 border-t border-gold-100 px-5 py-3">
                  <select
                    value={o.status}
                    onChange={(e) => changeStatus(o.id, e.target.value as OrderStatusKey)}
                    className="rounded-xl border border-gold-200 bg-pearl px-3 py-2 text-sm font-semibold outline-none focus:border-gold-400"
                  >
                    {ORDER_STATUS_KEYS.map((k) => (
                      <option key={k} value={k}>{ORDER_STATUS[k].label}</option>
                    ))}
                  </select>
                  <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-whatsapp px-4 py-2 text-sm">
                    <MessageCircle className="h-4 w-4" /> كلّمي العميلة
                  </a>
                  <button
                    type="button"
                    onClick={() => remove(o.id)}
                    className="ms-auto flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 className="h-4 w-4" /> مسح
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  active, onClick, label, count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-semibold transition",
        active ? "border-transparent bg-gold-shine text-white" : "border-gold-200 bg-pearl text-espresso-700 hover:border-gold-300",
      )}
    >
      {label}
      <span className={cn("rounded-full px-1.5 text-[11px]", active ? "bg-white/25" : "bg-cream-200 text-gold-600")}>
        {toArabicDigits(count)}
      </span>
    </button>
  );
}

function Info({
  icon, label, value, full,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className={cn("flex items-start gap-2", full && "sm:col-span-2")}>
      <span className="mt-0.5 text-gold-500">{icon}</span>
      <span className="text-espresso-500">{label}:</span>
      <span className="font-medium text-espresso-800">{value}</span>
    </div>
  );
}
