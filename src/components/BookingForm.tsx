"use client";

import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Loader2, MessageCircle, ShieldCheck } from "lucide-react";
import { formatPriceEGP, toArabicDigits, cn } from "@/lib/utils";
import { buildWhatsappMessage, buildWhatsappUrl } from "@/lib/whatsapp";
import { GOVERNORATES, EVENT_TYPES } from "@/lib/governorates";

export type BookingProduct = {
  slug: string;
  nameAr: string;
  cover: string;
  basePrice: number;
  oldPrice?: number;
  isPackage?: boolean;
  variants?: { nameAr: string; price: number; oldPrice?: number }[];
};

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
}: {
  product: BookingProduct;
  whatsappNumber: string;
  depositNote: string;
}) {
  const [variantIdx, setVariantIdx] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const variant = product.variants?.[variantIdx];
  const price = variant?.price ?? product.basePrice;
  const oldPrice = variant?.oldPrice ?? product.oldPrice;

  const {
    register,
    handleSubmit,
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

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    const payload = {
      productSlug: product.slug,
      productName: product.nameAr,
      variantName: variant?.nameAr,
      price,
      ...values,
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
      toast.warning("هنكمّل على واتساب على طول 💛");
    }

    const message = buildWhatsappMessage({
      productName: product.nameAr,
      variantName: variant?.nameAr,
      price,
      customerName: values.customerName,
      phone: values.phone,
      governorate: values.governorate,
      address: values.address,
      groomName: values.groomName,
      brideName: values.brideName,
      eventType: values.eventType,
      eventDate: values.eventDate,
      notes: values.notes,
    });
    const url = buildWhatsappUrl(whatsappNumber, message);
    toast.success("جاري تحويلك على واتساب لتأكيد الحجز 🌷");
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

            <div className="mt-4 flex items-baseline gap-2 border-t border-gold-100 pt-4">
              <span className="text-sm text-espresso-500">الإجمالي:</span>
              <span className="font-display text-2xl font-extrabold text-gold-gradient">
                {formatPriceEGP(price)}
              </span>
              {oldPrice && (
                <span className="text-sm text-espresso-400 line-through">
                  {toArabicDigits(oldPrice)} جنيه
                </span>
              )}
            </div>
            <p className="mt-3 flex items-start gap-1.5 text-xs leading-relaxed text-espresso-500">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" />
              {depositNote}
            </p>
          </div>
        </div>
      </aside>

      {/* الفورم */}
      <form onSubmit={handleSubmit(onSubmit)} className="card-zg p-6 sm:p-8">
        <h3 className="text-xl font-bold text-espresso-900">بيانات الحجز</h3>
        <p className="mt-1 text-sm text-espresso-500">
          املي البيانات وهنحوّلك على الواتساب فورًا لتأكيد الأوردر ودفع الديبوزت.
        </p>

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
        </div>

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
