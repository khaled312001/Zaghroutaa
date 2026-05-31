"use client";

import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { MessageCircle } from "lucide-react";
import { buildWhatsappUrl } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

type Values = { name: string; phone: string; message: string };

const inputClass =
  "w-full rounded-2xl border border-gold-200 bg-cream-50 px-4 py-3 text-espresso-800 outline-none transition focus:border-gold-400 focus:ring-2 focus:ring-gold-200 placeholder:text-espresso-400";

export function ContactForm({ whatsappNumber }: { whatsappNumber: string }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({ defaultValues: { name: "", phone: "", message: "" } });

  const onSubmit = (v: Values) => {
    const text = [
      "السلام عليكم، رسالة من موقع زُغْرُوطَة",
      `الاسم: ${v.name}`,
      v.phone ? `الموبايل: ${v.phone}` : "",
      "",
      v.message,
    ]
      .filter(Boolean)
      .join("\n");
    toast.success("جاري تحويلك على واتساب");
    window.location.href = buildWhatsappUrl(whatsappNumber, text);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card-zg p-6 sm:p-8">
      <h3 className="text-xl font-bold text-espresso-900">ابعتيلنا رسالة</h3>
      <p className="mt-1 text-sm text-espresso-500">
        اكتبي استفسارك وهنكمّل معاكي على واتساب فورًا.
      </p>
      <div className="mt-5 space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-espresso-700">اسمك</span>
          <input className={inputClass} placeholder="الاسم" {...register("name", { required: "اكتبي اسمك" })} />
          {errors.name && <span className="mt-1 block text-xs text-blush-600">{errors.name.message}</span>}
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-espresso-700">رقم الموبايل (اختياري)</span>
          <input className={cn(inputClass)} dir="ltr" inputMode="tel" placeholder="01xxxxxxxxx" {...register("phone")} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-espresso-700">رسالتك</span>
          <textarea
            rows={4}
            className={inputClass}
            placeholder="حابة أستفسر عن..."
            {...register("message", { required: "اكتبي رسالتك" })}
          />
          {errors.message && <span className="mt-1 block text-xs text-blush-600">{errors.message.message}</span>}
        </label>
      </div>
      <button type="submit" className="btn-whatsapp mt-6 w-full">
        <MessageCircle className="h-5 w-5" /> ابعتي على واتساب
      </button>
    </form>
  );
}
