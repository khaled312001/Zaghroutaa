"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Loader2, Check, Scissors, Gift, Truck, Home, PackageX, Clock } from "lucide-react";
import { ORDER_STATUS, TRACK_STAGES, trackStageIndex, type OrderStatusKey } from "@/lib/orderStatus";
import { CountdownTimer } from "@/components/CountdownTimer";
import { cn } from "@/lib/utils";

type TrackOrder = {
  id: number;
  productName: string;
  variantName: string | null;
  status: OrderStatusKey;
  eventDate: string | null;
  createdAt: string;
  brideName: string | null;
};

const STAGE_ICONS = [Check, Scissors, Gift, Truck, Home];

export function TrackWidget() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<TrackOrder[] | null>(null);
  const [error, setError] = useState("");

  const search = async () => {
    if (!phone.trim()) return;
    setLoading(true);
    setError("");
    setOrders(null);
    try {
      const res = await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!data.ok) setError(data.error || "مفيش نتيجة");
      else setOrders(data.orders);
    } catch {
      setError("حصل خطأ، حاولي تاني");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="card-zg p-5 sm:p-6">
        <label className="mb-1.5 block text-sm font-semibold text-espresso-700">رقم موبايلك</label>
        <div className="flex gap-2">
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
            dir="ltr"
            placeholder="01xxxxxxxxx"
            className="w-full rounded-2xl border border-gold-200 bg-cream-50 px-4 py-3 text-center text-espresso-800 outline-none focus:border-gold-400"
          />
          <button type="button" onClick={search} disabled={loading} className="btn-gold shrink-0 px-5">
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
            تتبّعي
          </button>
        </div>
        {error && <p className="mt-3 text-center text-sm font-semibold text-blush-600">{error}</p>}
      </div>

      {orders && orders.length === 0 && (
        <p className="mt-6 text-center text-espresso-500">
          مفيش أوردرات على الرقم ده. لو لسه محجزتيش، ابدئي من صفحة المنتجات 💛
        </p>
      )}

      <div className="mt-6 space-y-6">
        {orders?.map((o, i) => (
          <motion.div
            key={o.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="card-zg p-5 sm:p-6"
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-espresso-900">
                  {o.productName}
                  {o.variantName ? <span className="text-espresso-500"> — {o.variantName}</span> : null}
                </h3>
                <p className="text-xs text-espresso-400">طلب #{o.id}</p>
              </div>
              <span className={cn("chip", ORDER_STATUS[o.status].badge)}>{ORDER_STATUS[o.status].label}</span>
            </div>

            <OrderStepper status={o.status} />

            {o.eventDate && o.status !== "CANCELLED" && (
              <div className="mt-5">
                <CountdownTimer date={o.eventDate} name={o.brideName} />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function OrderStepper({ status }: { status: OrderStatusKey }) {
  const idx = trackStageIndex(status);

  if (idx === -2) {
    return (
      <div className="flex items-center gap-2 rounded-2xl bg-rose-50 p-4 text-rose-700">
        <PackageX className="h-5 w-5" /> الأوردر ده اتلغى. لو فيه استفسار كلّمينا على واتساب.
      </div>
    );
  }
  if (idx === -1) {
    return (
      <div className="flex items-center gap-2 rounded-2xl bg-amber-50 p-4 text-amber-700">
        <Clock className="h-5 w-5" /> بنراجع طلبك ونتواصل معاكي قريّب لتأكيد الحجز 💛
      </div>
    );
  }

  return (
    <div className="flex items-start justify-between gap-1">
      {TRACK_STAGES.map((stage, i) => {
        const Icon = STAGE_ICONS[i];
        const done = i < idx;
        const current = i === idx;
        return (
          <div key={stage.label} className="flex flex-1 flex-col items-center text-center">
            <div className="flex w-full items-center">
              <span className={cn("h-0.5 flex-1", i === 0 ? "bg-transparent" : i <= idx ? "bg-gold-shine" : "bg-gold-100")} />
              <span
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition",
                  done && "border-transparent bg-gold-shine text-white",
                  current && "border-gold-500 bg-gold-50 text-gold-700 ring-4 ring-gold-100",
                  !done && !current && "border-gold-200 bg-white text-espresso-300",
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className={cn("h-0.5 flex-1", i === TRACK_STAGES.length - 1 ? "bg-transparent" : i < idx ? "bg-gold-shine" : "bg-gold-100")} />
            </div>
            <span className={cn("mt-1.5 text-[11px] font-semibold leading-tight", i <= idx ? "text-espresso-800" : "text-espresso-400")}>
              {stage.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
