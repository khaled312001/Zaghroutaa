"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Plus, Minus, Check, ShoppingBag, Loader2, MessageCircle, ShieldCheck } from "lucide-react";
import { formatPriceEGP, toArabicDigits, cn } from "@/lib/utils";
import { buildWhatsappUrl } from "@/lib/whatsapp";
import { GOVERNORATES, EVENT_TYPES } from "@/lib/governorates";

export type BuilderItem = {
  slug: string;
  nameAr: string;
  cover: string;
  basePrice: number;
  category: string;
};

const inputClass =
  "w-full rounded-2xl border border-gold-200 bg-cream-50 px-4 py-3 text-espresso-800 outline-none transition focus:border-gold-400 focus:ring-2 focus:ring-gold-200";

export function PackageBuilder({
  items,
  whatsappNumber,
  depositNote,
}: {
  items: BuilderItem[];
  whatsappNumber: string;
  depositNote: string;
}) {
  const [qty, setQty] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [f, setF] = useState({
    customerName: "", phone: "", governorate: "", address: "",
    brideName: "", groomName: "", eventType: EVENT_TYPES[0] as string, eventDate: "", notes: "",
  });
  const up = (patch: Partial<typeof f>) => setF((s) => ({ ...s, ...patch }));

  const setQ = (slug: string, n: number) =>
    setQty((cur) => {
      const next = { ...cur };
      if (n <= 0) delete next[slug];
      else next[slug] = n;
      return next;
    });

  const chosen = items.filter((i) => qty[i.slug] > 0);
  const total = chosen.reduce((s, i) => s + i.basePrice * qty[i.slug], 0);
  const count = chosen.reduce((s, i) => s + qty[i.slug], 0);

  const submit = async () => {
    if (chosen.length === 0) return toast.error("اختاري قطعة واحدة على الأقل");
    if (!f.customerName.trim() || !f.phone.trim() || !f.governorate || !f.address.trim())
      return toast.error("اكملي اسمك وموبايلك والمحافظة والعنوان");

    setSubmitting(true);
    const itemsLine = chosen.map((i) => `${i.nameAr} ×${qty[i.slug]}`).join("، ");
    const notesOut = [f.notes, `باكدج مخصص: ${itemsLine}`, `الإجمالي: ${total} ج`].filter(Boolean).join(" — ");
    const payload = {
      productName: "باكدج مخصص — صممته العروسة",
      price: total,
      customerName: f.customerName,
      phone: f.phone,
      governorate: f.governorate,
      address: f.address,
      brideName: f.brideName,
      groomName: f.groomName,
      eventType: f.eventType,
      eventDate: f.eventDate,
      notes: notesOut,
    };
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("save failed");
    } catch {
      toast.warning("هنكمّل على واتساب على طول");
    }

    const msg = [
      "باكدج مخصص من موقع زُغْرُوطَة",
      "ـــــــــــــــــــــــــــــــ",
      ...chosen.map((i) => `• ${i.nameAr} ×${toArabicDigits(qty[i.slug])} = ${formatPriceEGP(i.basePrice * qty[i.slug])}`),
      "ـــــــــــــــــــــــــــــــ",
      `الإجمالي: ${formatPriceEGP(total)}`,
      "",
      `الاسم: ${f.customerName}`,
      `الموبايل: ${f.phone}`,
      `المحافظة: ${f.governorate}`,
      `العنوان: ${f.address}`,
      f.brideName || f.groomName ? `العروسين: ${f.brideName || "-"} و ${f.groomName || "-"}` : "",
      f.eventType ? `المناسبة: ${f.eventType}` : "",
      f.eventDate ? `التاريخ: ${f.eventDate}` : "",
      f.notes ? `ملاحظات: ${f.notes}` : "",
      "ـــــــــــــــــــــــــــــــ",
      "حابة أأكّد الباكدج ده",
    ].filter(Boolean).join("\n");

    toast.success("جاري تحويلك على واتساب لتأكيد الباكدج");
    window.location.href = buildWhatsappUrl(whatsappNumber, msg);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1.4fr_0.9fr]">
      {/* القطع */}
      <div>
        <h2 className="mb-4 font-display text-xl font-bold text-espresso-900">١) اختاري قطعك</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((it) => {
            const q = qty[it.slug] || 0;
            const on = q > 0;
            return (
              <div key={it.slug} className={cn("card-zg overflow-hidden transition", on && "ring-2 ring-gold-400")}>
                <button type="button" onClick={() => setQ(it.slug, on ? 0 : 1)} className="relative block aspect-square w-full">
                  <Image src={it.cover} alt={it.nameAr} fill sizes="160px" className="object-cover" />
                  {on && (
                    <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-gold-shine text-white">
                      <Check className="h-4 w-4" />
                    </span>
                  )}
                </button>
                <div className="p-2.5">
                  <p className="line-clamp-1 text-xs font-bold text-espresso-900">{it.nameAr}</p>
                  <p className="text-xs font-extrabold text-gold-700">{formatPriceEGP(it.basePrice)}</p>
                  {on ? (
                    <div className="mt-2 flex items-center justify-between rounded-lg bg-cream-100 p-1">
                      <button type="button" onClick={() => setQ(it.slug, q - 1)} className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-espresso-700 shadow-sm" aria-label="أقل">
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="text-sm font-bold">{toArabicDigits(q)}</span>
                      <button type="button" onClick={() => setQ(it.slug, q + 1)} className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-espresso-700 shadow-sm" aria-label="أكتر">
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => setQ(it.slug, 1)} className="mt-2 w-full rounded-lg border border-gold-200 py-1.5 text-xs font-semibold text-gold-700 hover:bg-gold-50">
                      ضيفي
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* الملخص + البيانات */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="card-zg p-5">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-espresso-900">
            <ShoppingBag className="h-5 w-5 text-gold-600" /> باكدجك
          </h2>

          {chosen.length === 0 ? (
            <p className="mt-3 text-sm text-espresso-400">لسه ماخترتيش حاجة — دوسي على القطع اللي نفسك فيها.</p>
          ) : (
            <ul className="mt-3 space-y-1.5 border-b border-gold-100 pb-3">
              {chosen.map((i) => (
                <li key={i.slug} className="flex justify-between text-sm">
                  <span className="text-espresso-700">{i.nameAr} ×{toArabicDigits(qty[i.slug])}</span>
                  <span className="font-semibold text-espresso-800">{formatPriceEGP(i.basePrice * qty[i.slug])}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-sm text-espresso-500">الإجمالي ({toArabicDigits(count)} قطعة):</span>
            <span className="font-display text-2xl font-extrabold text-gold-gradient">{formatPriceEGP(total)}</span>
          </div>

          <div className="mt-5 space-y-3">
            <h3 className="font-display text-base font-bold text-espresso-900">٢) بياناتك</h3>
            <input className={inputClass} placeholder="اسمك *" value={f.customerName} onChange={(e) => up({ customerName: e.target.value })} />
            <input className={inputClass} dir="ltr" placeholder="رقم الموبايل (واتساب) *" value={f.phone} onChange={(e) => up({ phone: e.target.value })} />
            <select className={inputClass} value={f.governorate} onChange={(e) => up({ governorate: e.target.value })}>
              <option value="" disabled>اختاري المحافظة *</option>
              {GOVERNORATES.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
            <input className={inputClass} placeholder="العنوان بالتفصيل *" value={f.address} onChange={(e) => up({ address: e.target.value })} />
            <div className="grid grid-cols-2 gap-2">
              <input className={inputClass} placeholder="اسم العروسة" value={f.brideName} onChange={(e) => up({ brideName: e.target.value })} />
              <input className={inputClass} placeholder="اسم العريس" value={f.groomName} onChange={(e) => up({ groomName: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <select className={inputClass} value={f.eventType} onChange={(e) => up({ eventType: e.target.value })}>
                {EVENT_TYPES.map((ev) => <option key={ev} value={ev}>{ev}</option>)}
              </select>
              <input type="date" className={inputClass} dir="ltr" value={f.eventDate} onChange={(e) => up({ eventDate: e.target.value })} />
            </div>
            <input className={inputClass} placeholder="عايزة تضيفي حاجة؟" value={f.notes} onChange={(e) => up({ notes: e.target.value })} />
          </div>

          <button type="button" onClick={submit} disabled={submitting} className="btn-whatsapp mt-4 w-full">
            {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <MessageCircle className="h-5 w-5" />}
            أكّدي الباكدج على واتساب
          </button>
          <p className="mt-3 flex items-start gap-1.5 text-xs leading-relaxed text-espresso-500">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" /> {depositNote}
          </p>
        </div>
      </aside>
    </div>
  );
}
