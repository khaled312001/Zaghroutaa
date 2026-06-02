"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Plus, Minus, Check, ShoppingBag, Loader2, MessageCircle, ShieldCheck, Ticket, Zap, Truck } from "lucide-react";
import { formatPriceEGP, toArabicDigits, cn } from "@/lib/utils";
import { buildWhatsappUrl } from "@/lib/whatsapp";
import { GOVERNORATES, EVENT_TYPES } from "@/lib/governorates";
import { RUSH_DAYS, RUSH_FEE, rushDaysLeft } from "@/lib/rush";
import { isCairoArea, shippingCost, DELIVERY_OPTIONS } from "@/lib/shipping";
import { downloadInvoice } from "@/lib/invoice";

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
  const [deliveryType, setDeliveryType] = useState("metro");
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<{ code: string; percent: number } | null>(null);
  const [couponMsg, setCouponMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
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
  const subtotal = chosen.reduce((s, i) => s + i.basePrice * qty[i.slug], 0);
  const count = chosen.reduce((s, i) => s + qty[i.slug], 0);

  const rushDays = rushDaysLeft(f.eventDate);
  const isRush = rushDays !== null && rushDays >= 0 && rushDays <= RUSH_DAYS;
  const rushFee = isRush ? RUSH_FEE : 0;
  const discountPercent = coupon?.percent ?? 0;
  const discounted = discountPercent ? Math.round(subtotal * (1 - discountPercent / 100)) : subtotal;
  const shipping = shippingCost(f.governorate, deliveryType);
  const grandTotal = discounted + rushFee + shipping;

  const applyCoupon = async () => {
    const code = couponInput.trim();
    if (!code) return;
    setCouponLoading(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (data.ok) {
        setCoupon({ code: data.code, percent: data.percent });
        setCouponMsg({ ok: true, text: `تم! خصم ${toArabicDigits(data.percent)}٪ اتطبّق 🎉` });
      } else {
        setCoupon(null);
        setCouponMsg({ ok: false, text: data.error || "الكود غير صالح" });
      }
    } catch {
      setCouponMsg({ ok: false, text: "حصل خطأ، حاولي تاني" });
    } finally {
      setCouponLoading(false);
    }
  };

  const submit = async () => {
    if (chosen.length === 0) return toast.error("اختاري قطعة واحدة على الأقل");
    if (!f.customerName.trim() || !f.phone.trim() || !f.governorate || !f.address.trim())
      return toast.error("اكملي اسمك وموبايلك والمحافظة والعنوان");

    setSubmitting(true);
    const itemsLine = chosen.map((i) => `${i.nameAr} ×${qty[i.slug]}`).join("، ");
    const deliveryLabel = isCairoArea(f.governorate)
      ? DELIVERY_OPTIONS.find((o) => o.key === deliveryType)?.label || ""
      : "";
    const notesOut = [
      f.notes,
      `باكدج مخصص: ${itemsLine}`,
      coupon ? `كود خصم ${coupon.code} (${coupon.percent}%)` : "",
      isRush ? `طلب مستعجل (فاضل ${rushDays} يوم) — رسوم استعجال ${RUSH_FEE} ج` : "",
      shipping > 0 ? `الشحن (${f.governorate}${deliveryLabel ? " - " + deliveryLabel : ""}): ${shipping} ج` : "",
      `الإجمالي شامل الشحن: ${grandTotal} ج`,
    ].filter(Boolean).join(" — ");

    const payload = {
      productName: "باكدج مخصص — صممته العروسة",
      price: subtotal,
      customerName: f.customerName,
      phone: f.phone,
      governorate: f.governorate,
      address: f.address,
      brideName: f.brideName,
      groomName: f.groomName,
      eventType: f.eventType,
      eventDate: f.eventDate,
      notes: notesOut,
      couponCode: coupon?.code || undefined,
      deliveryType,
    };

    let orderId: number | undefined;
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("save failed");
      const j = await res.json().catch(() => ({}));
      orderId = j.id;
    } catch {
      toast.warning("هنكمّل على واتساب على طول");
    }

    try {
      await downloadInvoice({
        orderId,
        customerName: f.customerName,
        phone: f.phone,
        governorate: f.governorate,
        address: f.address,
        brideName: f.brideName,
        groomName: f.groomName,
        eventType: f.eventType,
        eventDate: f.eventDate,
        items: [
          ...chosen.map((i) => ({ name: i.nameAr, qty: qty[i.slug], unit: i.basePrice })),
          ...(shipping > 0 ? [{ name: `الشحن — ${f.governorate}${deliveryLabel ? " (" + deliveryLabel + ")" : ""}`, qty: 1, unit: shipping }] : []),
        ],
        discountAmount: discountPercent ? subtotal - discounted : 0,
        discountLabel: coupon ? `خصم كود ${coupon.code}` : undefined,
        rushFee,
        total: grandTotal,
      });
    } catch {
      /* تجاهل لو الفاتورة فشلت */
    }

    const msg = [
      "باكدج مخصص من موقع زُغْرُوطَة",
      "ـــــــــــــــــــــــــــــــ",
      ...chosen.map((i) => `• ${i.nameAr} ×${toArabicDigits(qty[i.slug])} = ${formatPriceEGP(i.basePrice * qty[i.slug])}`),
      coupon ? `كود خصم: ${coupon.code} (${coupon.percent}%)` : "",
      isRush ? `رسوم استعجال: ${formatPriceEGP(RUSH_FEE)}` : "",
      shipping > 0 ? `الشحن: ${formatPriceEGP(shipping)}${deliveryLabel ? " (" + deliveryLabel + ")" : ""}` : "",
      "ـــــــــــــــــــــــــــــــ",
      `الإجمالي شامل الشحن: ${formatPriceEGP(grandTotal)}`,
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

    toast.success("اتحمّلت الفاتورة وبنحوّلك على واتساب");
    setTimeout(() => {
      window.location.href = buildWhatsappUrl(whatsappNumber, msg);
    }, 900);
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

          {/* كود خصم */}
          <div className="mt-4 rounded-2xl border border-dashed border-gold-300 bg-gold-50/60 p-3">
            <label className="flex items-center gap-1.5 text-xs font-bold text-gold-700">
              <Ticket className="h-3.5 w-3.5" /> معاكي كود خصم؟
            </label>
            <div className="mt-2 flex gap-2">
              <input
                value={couponInput}
                onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponMsg(null); }}
                placeholder="اكتبي الكود"
                dir="ltr"
                disabled={!!coupon}
                className={cn(inputClass, "py-2 text-center text-sm font-bold tracking-widest disabled:opacity-70")}
              />
              {coupon ? (
                <button type="button" onClick={() => { setCoupon(null); setCouponInput(""); setCouponMsg(null); }} className="btn-outline shrink-0 px-3 py-1.5 text-xs">إلغاء</button>
              ) : (
                <button type="button" onClick={applyCoupon} disabled={couponLoading || !couponInput.trim()} className="btn-gold shrink-0 px-4 py-1.5 text-xs">
                  {couponLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "تطبيق"}
                </button>
              )}
            </div>
            {couponMsg && <p className={cn("mt-1.5 text-xs font-semibold", couponMsg.ok ? "text-emerald-600" : "text-blush-600")}>{couponMsg.text}</p>}
          </div>

          <div className="mt-4 space-y-3">
            <h3 className="font-display text-base font-bold text-espresso-900">٢) بياناتك</h3>
            <input className={inputClass} placeholder="اسمك *" value={f.customerName} onChange={(e) => up({ customerName: e.target.value })} />
            <input className={inputClass} dir="ltr" placeholder="رقم الموبايل (واتساب) *" value={f.phone} onChange={(e) => up({ phone: e.target.value })} />
            <select className={inputClass} value={f.governorate} onChange={(e) => up({ governorate: e.target.value })}>
              <option value="" disabled>اختاري المحافظة *</option>
              {GOVERNORATES.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
            {f.governorate && isCairoArea(f.governorate) && (
              <select className={inputClass} value={deliveryType} onChange={(e) => setDeliveryType(e.target.value)}>
                {DELIVERY_OPTIONS.map((o) => <option key={o.key} value={o.key}>{o.label} — {o.price} ج</option>)}
              </select>
            )}
            {f.governorate && (
              <div className="flex items-center gap-2 rounded-xl bg-cream-100 px-3 py-2 text-xs text-espresso-600">
                <Truck className="h-3.5 w-3.5 shrink-0 text-gold-500" /> الشحن لـ {f.governorate}: <b className="text-gold-700">{formatPriceEGP(shipping)}</b>
              </div>
            )}
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

          <div className="mt-4 space-y-1.5 border-t border-gold-100 pt-3 text-sm">
            <PkgRow label={`الإجمالي الفرعي (${toArabicDigits(count)} قطعة)`} value={formatPriceEGP(subtotal)} />
            {discountPercent ? <PkgRow label={`خصم ${coupon!.code}`} value={`- ${formatPriceEGP(subtotal - discounted)}`} tone="green" /> : null}
            {isRush ? <PkgRow label="رسوم استعجال ⚡" value={`+ ${formatPriceEGP(RUSH_FEE)}`} tone="rose" /> : null}
            <PkgRow label="الشحن" value={f.governorate ? `+ ${formatPriceEGP(shipping)}` : "حسب المحافظة"} muted={!f.governorate} />
            <div className="flex items-center justify-between border-t border-gold-100 pt-2">
              <span className="font-bold text-espresso-700">الإجمالي شامل الشحن</span>
              <span className="font-display text-2xl font-extrabold text-gold-gradient">{formatPriceEGP(grandTotal)}</span>
            </div>
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

function PkgRow({ label, value, tone, muted }: { label: string; value: string; tone?: "green" | "rose"; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={cn("text-espresso-500", muted && "text-espresso-400")}>{label}</span>
      <span className={cn("font-semibold", tone === "green" ? "text-emerald-600" : tone === "rose" ? "text-rose-600" : "text-espresso-800")}>
        {value}
      </span>
    </div>
  );
}
