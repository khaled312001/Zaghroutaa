"use client";

import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Loader2, MessageCircle, ShieldCheck, Zap, Ticket, Check, Gift } from "lucide-react";
import { formatPriceEGP, toArabicDigits, cn } from "@/lib/utils";
import { buildWhatsappMessage, buildWhatsappUrl } from "@/lib/whatsapp";
import { GOVERNORATES, EVENT_TYPES } from "@/lib/governorates";
import { ImageUpload } from "@/components/ImageUpload";

export type BookingProduct = {
  slug: string;
  nameAr: string;
  cover: string;
  basePrice: number;
  oldPrice?: number;
  isPackage?: boolean;
  variants?: { nameAr: string; price: number; oldPrice?: number }[];
};

export type AddonItem = {
  slug: string;
  nameAr: string;
  cover: string;
  basePrice: number;
  offerPrice: number;
};

export type UpsellConfig = { items: AddonItem[]; threshold: number; percent: number };

type FormValues = {
  customerName: string;
  phone: string;
  governorate: string;
  address: string;
  brideName: string;
  groomName: string;
  eventType: string;
  eventDate: string;
  notes: string;
};

const inputClass =
  "w-full rounded-2xl border border-gold-200 bg-cream-50 px-4 py-3 text-espresso-800 outline-none transition focus:border-gold-400 focus:ring-2 focus:ring-gold-200 placeholder:text-espresso-400";

export function BookingForm({
  product,
  whatsappNumber,
  depositNote,
  upsell,
}: {
  product: BookingProduct;
  whatsappNumber: string;
  depositNote: string;
  upsell?: UpsellConfig;
}) {
  const [variantIdx, setVariantIdx] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [refImage, setRefImage] = useState("");
  const [addonSlugs, setAddonSlugs] = useState<string[]>([]);
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<{ code: string; percent: number } | null>(null);
  const [couponMsg, setCouponMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const variant = product.variants?.[variantIdx];
  const price = variant?.price ?? product.basePrice;
  const oldPrice = variant?.oldPrice ?? product.oldPrice;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      customerName: "",
      phone: "",
      governorate: "",
      address: "",
      brideName: "",
      groomName: "",
      eventType: EVENT_TYPES[0],
      eventDate: "",
      notes: "",
    },
  });

  const eventDate = watch("eventDate");
  const rushDays = rushDaysLeft(eventDate);
  const isRush = rushDays !== null && rushDays >= 0 && rushDays <= 10;

  const discountPercent = coupon?.percent ?? 0;
  const finalPrice = discountPercent ? Math.round(price * (1 - discountPercent / 100)) : price;

  const showUpsell = !!upsell && upsell.items.length > 0 && price >= upsell.threshold;
  const selectedAddons = upsell ? upsell.items.filter((i) => addonSlugs.includes(i.slug)) : [];
  const addonsTotal = selectedAddons.reduce((s, i) => s + i.offerPrice, 0);
  const grandTotal = finalPrice + addonsTotal;
  const toggleAddon = (slug: string) =>
    setAddonSlugs((cur) => (cur.includes(slug) ? cur.filter((s) => s !== slug) : [...cur, slug]));

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

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    const rushNote = isRush ? `طلب مستعجل، الفرح فاضلّه ${rushDays} يوم` : "";
    const couponNote = coupon ? `كود خصم ${coupon.code} (${coupon.percent}%)` : "";
    const addonNote = selectedAddons.length
      ? `إضافات: ${selectedAddons.map((a) => `${a.nameAr} (${toArabicDigits(a.offerPrice)} ج)`).join("، ")} — الإجمالي بعد الإضافات: ${toArabicDigits(grandTotal)} ج`
      : "";
    const notesOut = [values.notes, rushNote, couponNote, addonNote].filter(Boolean).join(" — ");
    const payload = {
      productSlug: product.slug,
      productName: product.nameAr,
      variantName: variant?.nameAr,
      price,
      ...values,
      notes: notesOut,
      couponCode: coupon?.code || undefined,
      referenceImage: refImage || undefined,
    };

    // نحفظ الطلب في الداتابيز (لو فشل مش بنوقف العميلة — بنكمّل واتساب)
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

    const message = buildWhatsappMessage({
      productName: product.nameAr,
      variantName: variant?.nameAr,
      price: finalPrice,
      customerName: values.customerName,
      phone: values.phone,
      governorate: values.governorate,
      address: values.address,
      groomName: values.groomName,
      brideName: values.brideName,
      eventType: values.eventType,
      eventDate: values.eventDate,
      notes: notesOut,
    });
    const fullMessage = refImage
      ? `${message}\nصورة مرجعية: ${window.location.origin}${refImage}`
      : message;
    const url = buildWhatsappUrl(whatsappNumber, fullMessage);
    toast.success("جاري تحويلك على واتساب لتأكيد الحجز");
    window.location.href = url;
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[0.9fr_1.3fr]">
      {/* ملخص المنتج */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="card-zg overflow-hidden">
          <div className="relative aspect-[4/3]">
            <Image src={product.cover} alt={product.nameAr} fill sizes="400px" className="object-cover" />
          </div>
          <div className="p-5">
            <h2 className="text-lg font-bold text-espresso-900">{product.nameAr}</h2>

            {product.variants?.length ? (
              <div className="mt-3">
                <span className="text-xs font-semibold text-espresso-600">اختاري الخيار:</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {product.variants.map((v, i) => (
                    <button
                      key={v.nameAr}
                      type="button"
                      onClick={() => setVariantIdx(i)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                        i === variantIdx
                          ? "border-transparent bg-gold-shine text-white"
                          : "border-gold-200 bg-cream-50 text-espresso-700 hover:border-gold-300",
                      )}
                    >
                      {v.nameAr}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="mt-4 flex flex-wrap items-baseline gap-2 border-t border-gold-100 pt-4">
              <span className="text-sm text-espresso-500">الإجمالي:</span>
              <span className="font-display text-2xl font-extrabold text-gold-gradient">
                {formatPriceEGP(finalPrice)}
              </span>
              {discountPercent ? (
                <span className="text-sm text-espresso-400 line-through">{toArabicDigits(price)} جنيه</span>
              ) : oldPrice ? (
                <span className="text-sm text-espresso-400 line-through">{toArabicDigits(oldPrice)} جنيه</span>
              ) : null}
            </div>
            {discountPercent ? (
              <p className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                <Check className="h-3.5 w-3.5" /> وفّرتي {toArabicDigits(price - finalPrice)} جنيه بكود {coupon!.code}
              </p>
            ) : null}
            <p className="mt-3 flex items-start gap-1.5 text-xs leading-relaxed text-espresso-500">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" />
              {depositNote}
            </p>
          </div>
        </div>
      </aside>

      {/* الفورم */}
      <form onSubmit={handleSubmit(onSubmit)} className="card-zg p-6 sm:p-8">
        {/* كود الخصم — في الأول خالص */}
        <div className="mb-6 rounded-2xl border border-dashed border-gold-300 bg-gold-50/60 p-4">
          <label className="flex items-center gap-1.5 text-sm font-bold text-gold-700">
            <Ticket className="h-4 w-4" /> معاكي كود خصم؟
          </label>
          <div className="mt-2 flex gap-2">
            <input
              value={couponInput}
              onChange={(e) => {
                setCouponInput(e.target.value.toUpperCase());
                setCouponMsg(null);
              }}
              placeholder="اكتبي الكود هنا"
              dir="ltr"
              disabled={!!coupon}
              className={cn(inputClass, "py-2.5 text-center font-bold tracking-widest disabled:opacity-70")}
            />
            {coupon ? (
              <button
                type="button"
                onClick={() => {
                  setCoupon(null);
                  setCouponInput("");
                  setCouponMsg(null);
                }}
                className="btn-outline shrink-0 px-4 py-2 text-sm"
              >
                إلغاء
              </button>
            ) : (
              <button
                type="button"
                onClick={applyCoupon}
                disabled={couponLoading || !couponInput.trim()}
                className="btn-gold shrink-0 px-5 py-2 text-sm"
              >
                {couponLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "تطبيق"}
              </button>
            )}
          </div>
          {couponMsg && (
            <p className={cn("mt-2 text-xs font-semibold", couponMsg.ok ? "text-emerald-600" : "text-blush-600")}>
              {couponMsg.text}
            </p>
          )}
        </div>

        <h3 className="text-xl font-bold text-espresso-900">بيانات الحجز</h3>
        <p className="mt-1 text-sm text-espresso-500">
          املي البيانات وهنحوّلك على الواتساب فورًا لتأكيد الأوردر ودفع الديبوزت.
        </p>

        {isRush && (
          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-500 text-white">
              <Zap className="h-4 w-4" />
            </span>
            <div className="text-sm">
              <p className="font-bold text-rose-700">
                فرحك قريّب — فاضل {toArabicDigits(rushDays!)} يوم! ⚡
              </p>
              <p className="mt-0.5 leading-relaxed text-rose-600">
                متاح <b>حجز مستعجل</b> بأولوية قصوى في التنفيذ. أكّدي دلوقتي وهنبدأ أوردرك فورًا ونلحقك في ميعادك.
              </p>
            </div>
          </div>
        )}

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="اسمك" error={errors.customerName?.message}>
            <input
              className={inputClass}
              placeholder="الاسم بالكامل"
              {...register("customerName", { required: "اكتبي اسمك من فضلك", minLength: { value: 2, message: "الاسم قصير" } })}
            />
          </Field>

          <Field label="رقم الموبايل (واتساب)" error={errors.phone?.message}>
            <input
              className={inputClass}
              inputMode="tel"
              dir="ltr"
              placeholder="01xxxxxxxxx"
              {...register("phone", {
                required: "اكتبي رقم موبايلك",
                pattern: { value: /^[0-9+\-\s]{8,20}$/, message: "رقم غير صحيح" },
              })}
            />
          </Field>

          <Field label="المحافظة" error={errors.governorate?.message}>
            <select className={inputClass} defaultValue="" {...register("governorate", { required: "اختاري المحافظة" })}>
              <option value="" disabled>اختاري محافظتك</option>
              {GOVERNORATES.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </Field>

          <Field label="المناسبة" error={errors.eventType?.message}>
            <select className={inputClass} {...register("eventType")}>
              {EVENT_TYPES.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </Field>

          <Field label="العنوان بالتفصيل" error={errors.address?.message} full>
            <input
              className={inputClass}
              placeholder="المدينة، الشارع، رقم العمارة..."
              {...register("address", { required: "اكتبي العنوان", minLength: { value: 3, message: "العنوان قصير" } })}
            />
          </Field>

          <Field label="اسم العروسة (للكتابة على الشغل)">
            <input className={inputClass} placeholder="مثلاً: نورا" {...register("brideName")} />
          </Field>

          <Field label="اسم العريس (للكتابة على الشغل)">
            <input className={inputClass} placeholder="مثلاً: أحمد" {...register("groomName")} />
          </Field>

          <Field label="تاريخ كتب الكتاب / الفرح">
            <input type="date" className={inputClass} {...register("eventDate")} />
          </Field>

          <Field label="عايزة تضيفي حاجة؟ (اختياري)">
            <input className={inputClass} placeholder="مثلاً: إضافة بوكيه ورد" {...register("notes")} />
          </Field>

          <Field label="صورة مرجعية أو فكرة عايزاها (اختياري)" full>
            <ImageUpload value={refImage} onChange={setRefImage} aspect="aspect-[16/9]" className="max-w-md" />
          </Field>
        </div>

        {/* عروض الإضافات (هدية برفع المبيعات) */}
        {showUpsell && (
          <div className="mt-6 rounded-2xl border border-gold-300 bg-gradient-to-br from-gold-50 to-blush-50 p-4">
            <p className="flex items-center gap-1.5 font-bold text-gold-700">
              <Gift className="h-5 w-5" /> مبروك! أوردرك عدّى {toArabicDigits(upsell!.threshold)} جنيه 🎉
            </p>
            <p className="mt-0.5 text-sm text-espresso-600">
              ضيفي دول بخصم {toArabicDigits(upsell!.percent)}٪ خصيصًا ليكي:
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {upsell!.items.map((a) => {
                const on = addonSlugs.includes(a.slug);
                return (
                  <button
                    key={a.slug}
                    type="button"
                    onClick={() => toggleAddon(a.slug)}
                    className={cn(
                      "flex items-center gap-2 rounded-xl border-2 bg-white p-2 text-right transition",
                      on ? "border-gold-500 ring-2 ring-gold-200" : "border-gold-100 hover:border-gold-300",
                    )}
                  >
                    <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                      <Image src={a.cover} alt={a.nameAr} fill sizes="48px" className="object-cover" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-bold text-espresso-800">{a.nameAr}</span>
                      <span className="text-xs font-extrabold text-gold-700">{toArabicDigits(a.offerPrice)} ج</span>
                      <span className="ms-1 text-[10px] text-espresso-400 line-through">{toArabicDigits(a.basePrice)}</span>
                    </span>
                    <span className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2", on ? "border-gold-500 bg-gold-500 text-white" : "border-gold-300 text-transparent")}>
                      <Check className="h-3 w-3" />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {(addonsTotal > 0 || discountPercent > 0) && (
          <div className="mt-4 flex items-center justify-between rounded-2xl bg-espresso-900 px-4 py-3 text-white">
            <span className="text-sm">الإجمالي النهائي</span>
            <span className="font-display text-xl font-extrabold">{formatPriceEGP(grandTotal)}</span>
          </div>
        )}

        <button type="submit" disabled={submitting} className="btn-whatsapp mt-7 w-full text-base">
          {submitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" /> جاري التحويل...
            </>
          ) : (
            <>
              <MessageCircle className="h-5 w-5" /> أكّدي الحجز على واتساب
            </>
          )}
        </button>
        <p className="mt-3 text-center text-xs text-espresso-400">
          بياناتك بتتحفظ عندنا بأمان عشان نقدر نتواصل معاكي ونكمّل أوردرك.
        </p>
      </form>
    </div>
  );
}

/** كام يوم فاضل على المناسبة (null لو مفيش تاريخ) */
function rushDaysLeft(dateStr: string): number | null {
  if (!dateStr) return null;
  const target = new Date(dateStr + "T00:00:00");
  if (Number.isNaN(target.getTime())) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - now.getTime()) / 86_400_000);
}

function Field({
  label,
  error,
  full,
  children,
}: {
  label: string;
  error?: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={cn("block", full && "sm:col-span-2")}>
      <span className="mb-1.5 block text-sm font-semibold text-espresso-700">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs font-medium text-blush-600">{error}</span>}
    </label>
  );
}
