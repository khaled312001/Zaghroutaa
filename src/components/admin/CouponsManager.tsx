"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Ticket, Plus, Trash2, Loader2 } from "lucide-react";
import {
  createCouponAction, toggleCouponAction, deleteCouponAction,
} from "@/app/admin/coupon-actions";
import { cn, toArabicDigits } from "@/lib/utils";

export type AdminCoupon = {
  id: number;
  code: string;
  percent: number;
  active: boolean;
  startsAt: string | null;
  endsAt: string | null;
  usageLimit: number | null;
  usedCount: number;
  note: string | null;
};

const inputClass =
  "w-full rounded-xl border border-gold-200 bg-cream-50 px-3 py-2.5 text-sm text-espresso-800 outline-none focus:border-gold-400";

export function CouponsManager({ coupons }: { coupons: AdminCoupon[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [form, setForm] = useState({ code: "", percent: 10, startsAt: "", endsAt: "", usageLimit: "", note: "" });

  const run = (fn: () => Promise<unknown>, ok?: string) =>
    start(async () => {
      try {
        await fn();
        if (ok) toast.success(ok);
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "حصل خطأ");
      }
    });

  const add = () => {
    if (!form.code.trim()) return toast.error("اكتبي الكود");
    run(async () => {
      await createCouponAction({
        code: form.code,
        percent: Number(form.percent),
        active: true,
        startsAt: form.startsAt || null,
        endsAt: form.endsAt || null,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
        note: form.note || null,
      });
      setForm({ code: "", percent: 10, startsAt: "", endsAt: "", usageLimit: "", note: "" });
    }, "اتعمل الكود");
  };

  return (
    <div className="space-y-6">
      {/* إضافة كود */}
      <div className="card-zg p-5">
        <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-espresso-900">
          <Ticket className="h-5 w-5 text-gold-600" /> كود جديد
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-espresso-600">الكود</span>
            <input
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              placeholder="مثلاً: EID10"
              dir="ltr"
              className={cn(inputClass, "text-center font-bold tracking-widest")}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-espresso-600">نسبة الخصم %</span>
            <input type="number" min={1} max={100} value={form.percent} onChange={(e) => setForm({ ...form, percent: Number(e.target.value) })} dir="ltr" className={inputClass} />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-espresso-600">حد الاستخدام (اختياري)</span>
            <input type="number" min={0} value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} placeholder="بلا حد" dir="ltr" className={inputClass} />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-espresso-600">يبدأ من (اختياري)</span>
            <input type="date" value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} dir="ltr" className={inputClass} />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-espresso-600">ينتهي في (اختياري)</span>
            <input type="date" value={form.endsAt} onChange={(e) => setForm({ ...form, endsAt: e.target.value })} dir="ltr" className={inputClass} />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-espresso-600">ملاحظة (اختياري)</span>
            <input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="مثلاً: حملة العيد" className={inputClass} />
          </label>
        </div>
        <button type="button" onClick={add} disabled={pending} className="btn-gold mt-4 px-5 py-2.5 text-sm">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} ضيفي الكود
        </button>
      </div>

      {/* القائمة */}
      {coupons.length === 0 ? (
        <div className="card-zg p-10 text-center text-espresso-400">لسه مفيش أكواد.</div>
      ) : (
        <div className="space-y-3">
          {coupons.map((c) => {
            const expired = c.endsAt ? new Date(c.endsAt + "T23:59:59") < new Date() : false;
            const full = c.usageLimit != null && c.usedCount >= c.usageLimit;
            return (
              <div key={c.id} className="card-zg flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="flex items-center gap-3">
                  <span className="rounded-xl bg-gold-shine px-3 py-1.5 font-bold tracking-widest text-white" dir="ltr">
                    {c.code}
                  </span>
                  <div className="text-sm">
                    <p className="font-bold text-espresso-900">خصم {toArabicDigits(c.percent)}٪</p>
                    <p className="text-xs text-espresso-500">
                      استُخدم {toArabicDigits(c.usedCount)}
                      {c.usageLimit != null ? ` / ${toArabicDigits(c.usageLimit)}` : ""}
                      {c.startsAt || c.endsAt ? ` • ${c.startsAt || "…"} → ${c.endsAt || "…"}` : ""}
                      {c.note ? ` • ${c.note}` : ""}
                    </p>
                  </div>
                  {(expired || full) && (
                    <span className="chip bg-rose-100 text-rose-700">{expired ? "منتهي" : "خلص"}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => run(() => toggleCouponAction(c.id, !c.active), c.active ? "اتوقف" : "اتفعّل")}
                    className={cn(
                      "rounded-xl px-3 py-1.5 text-xs font-bold",
                      c.active ? "bg-emerald-50 text-emerald-700" : "bg-espresso-100 text-espresso-500",
                    )}
                  >
                    {c.active ? "مفعّل" : "موقوف"}
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => run(() => deleteCouponAction(c.id), "اتمسح")}
                    className="text-espresso-300 hover:text-rose-500"
                    aria-label="مسح"
                  >
                    <Trash2 className="h-4 w-4" />
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
