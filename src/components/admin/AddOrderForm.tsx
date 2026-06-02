"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, X, Loader2 } from "lucide-react";
import { createManualOrderAction } from "@/app/admin/actions";
import { ORDER_STATUS, ORDER_STATUS_KEYS, type OrderStatusKey } from "@/lib/orderStatus";
import { GOVERNORATES, EVENT_TYPES } from "@/lib/governorates";

const inputClass =
  "w-full rounded-xl border border-gold-200 bg-cream-50 px-3 py-2.5 text-sm text-espresso-800 outline-none focus:border-gold-400";

const empty = {
  productName: "", variantName: "", price: "", customerName: "", phone: "",
  governorate: "", address: "", brideName: "", groomName: "",
  eventType: "", eventDate: "", notes: "", status: "CONFIRMED" as OrderStatusKey,
};

export function AddOrderForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState(empty);
  const [pending, start] = useTransition();
  const up = (patch: Partial<typeof empty>) => setF((s) => ({ ...s, ...patch }));

  const submit = () => {
    if (!f.productName.trim() || !f.customerName.trim() || !f.phone.trim()) {
      toast.error("اسم المنتج والعميلة والموبايل مطلوبين");
      return;
    }
    start(async () => {
      try {
        await createManualOrderAction({
          productName: f.productName,
          variantName: f.variantName || undefined,
          price: f.price ? Number(f.price) : null,
          customerName: f.customerName,
          phone: f.phone,
          governorate: f.governorate || undefined,
          address: f.address || undefined,
          brideName: f.brideName || undefined,
          groomName: f.groomName || undefined,
          eventType: f.eventType || undefined,
          eventDate: f.eventDate || null,
          notes: f.notes || undefined,
          status: f.status,
        });
        toast.success("اتضاف الطلب");
        setF(empty);
        setOpen(false);
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "حصل خطأ");
      }
    });
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn-gold px-4 py-2.5 text-sm">
        <Plus className="h-4 w-4" /> إضافة طلب يدوي
      </button>

      {open && (
        <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-espresso-900/50 p-4 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div className="my-8 w-full max-w-2xl rounded-3xl bg-pearl p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-espresso-900">طلب يدوي جديد</h2>
              <button type="button" onClick={() => setOpen(false)} className="text-espresso-400 hover:text-espresso-700" aria-label="إغلاق">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="اسم المنتج / الباكدج *">
                <input className={inputClass} value={f.productName} onChange={(e) => up({ productName: e.target.value })} placeholder="مثلاً: باكدج العروسة الكامل" />
              </Field>
              <Field label="الخيار (اختياري)">
                <input className={inputClass} value={f.variantName} onChange={(e) => up({ variantName: e.target.value })} />
              </Field>
              <Field label="اسم العميلة *">
                <input className={inputClass} value={f.customerName} onChange={(e) => up({ customerName: e.target.value })} />
              </Field>
              <Field label="الموبايل *">
                <input className={inputClass} dir="ltr" value={f.phone} onChange={(e) => up({ phone: e.target.value })} placeholder="01xxxxxxxxx" />
              </Field>
              <Field label="السعر (جنيه)">
                <input type="number" dir="ltr" className={inputClass} value={f.price} onChange={(e) => up({ price: e.target.value })} />
              </Field>
              <Field label="الحالة">
                <select className={inputClass} value={f.status} onChange={(e) => up({ status: e.target.value as OrderStatusKey })}>
                  {ORDER_STATUS_KEYS.map((k) => (
                    <option key={k} value={k}>{ORDER_STATUS[k].label}</option>
                  ))}
                </select>
              </Field>
              <Field label="المحافظة">
                <select className={inputClass} value={f.governorate} onChange={(e) => up({ governorate: e.target.value })}>
                  <option value="">—</option>
                  {GOVERNORATES.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </Field>
              <Field label="المناسبة">
                <select className={inputClass} value={f.eventType} onChange={(e) => up({ eventType: e.target.value })}>
                  <option value="">—</option>
                  {EVENT_TYPES.map((ev) => <option key={ev} value={ev}>{ev}</option>)}
                </select>
              </Field>
              <Field label="اسم العروسة">
                <input className={inputClass} value={f.brideName} onChange={(e) => up({ brideName: e.target.value })} />
              </Field>
              <Field label="اسم العريس">
                <input className={inputClass} value={f.groomName} onChange={(e) => up({ groomName: e.target.value })} />
              </Field>
              <Field label="تاريخ المناسبة">
                <input type="date" dir="ltr" className={inputClass} value={f.eventDate} onChange={(e) => up({ eventDate: e.target.value })} />
              </Field>
              <Field label="العنوان">
                <input className={inputClass} value={f.address} onChange={(e) => up({ address: e.target.value })} />
              </Field>
              <Field label="ملاحظات" full>
                <input className={inputClass} value={f.notes} onChange={(e) => up({ notes: e.target.value })} />
              </Field>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setOpen(false)} className="btn-ghost px-5 py-2.5 text-sm">إلغاء</button>
              <button type="button" onClick={submit} disabled={pending} className="btn-gold px-6 py-2.5 text-sm">
                {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} حفظ الطلب
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Field({ label, full, children }: { label: string; full?: boolean; children: React.ReactNode }) {
  return (
    <label className={full ? "block sm:col-span-2" : "block"}>
      <span className="mb-1 block text-xs font-semibold text-espresso-600">{label}</span>
      {children}
    </label>
  );
}
