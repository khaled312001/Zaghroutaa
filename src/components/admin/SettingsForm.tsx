"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Save, Loader2, MessageCircle } from "lucide-react";
import { updateSettingsAction, type SettingsState } from "@/app/admin/actions";

const FIELDS: {
  key: string;
  label: string;
  hint?: string;
  type?: string;
  dir?: "ltr" | "rtl";
}[] = [
  { key: "whatsappNumber", label: "رقم واتساب الحجز ⭐", hint: "بمفتاح الدولة من غير + أو مسافات (مثال لمصر: 201001234567)", type: "tel", dir: "ltr" },
  { key: "phone", label: "رقم الهاتف للاتصال", type: "tel", dir: "ltr" },
  { key: "email", label: "البريد الإلكتروني", type: "email", dir: "ltr" },
  { key: "instagram", label: "رابط انستجرام", type: "url", dir: "ltr" },
  { key: "facebook", label: "رابط فيسبوك", type: "url", dir: "ltr" },
  { key: "tiktok", label: "رابط تيك توك", type: "url", dir: "ltr" },
];

const TEXTAREAS = [
  { key: "announcement", label: "شريط الإعلان (أعلى الموقع)" },
  { key: "depositNote", label: "ملاحظة الديبوزت (تظهر في صفحة الحجز)" },
];

const inputClass =
  "w-full rounded-2xl border border-gold-200 bg-cream-50 px-4 py-3 text-espresso-800 outline-none transition focus:border-gold-400 focus:ring-2 focus:ring-gold-200";

export function SettingsForm({ values }: { values: Record<string, string> }) {
  const [state, formAction, pending] = useActionState<SettingsState, FormData>(
    updateSettingsAction,
    {},
  );

  useEffect(() => {
    if (state.ok) toast.success("اتحفظت الإعدادات بنجاح 🌷");
  }, [state]);

  return (
    <form action={formAction} className="card-zg p-6 sm:p-8">
      <div className="mb-5 flex items-start gap-3 rounded-2xl border border-gold-200 bg-gold-50 p-4">
        <MessageCircle className="mt-0.5 h-5 w-5 shrink-0 text-gold-600" />
        <p className="text-sm leading-relaxed text-espresso-700">
          رقم الواتساب ده هو اللي كل أزرار الحجز في الموقع بتحوّل عليه. اكتبيه صح
          عشان الأوردرات توصلك.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {FIELDS.map((f) => (
          <label key={f.key} className="block">
            <span className="mb-1.5 block text-sm font-semibold text-espresso-700">{f.label}</span>
            <input
              name={f.key}
              type={f.type ?? "text"}
              dir={f.dir}
              defaultValue={values[f.key] ?? ""}
              className={inputClass}
            />
            {f.hint && <span className="mt-1 block text-xs text-espresso-400">{f.hint}</span>}
          </label>
        ))}
      </div>

      <div className="mt-4 grid gap-4">
        {TEXTAREAS.map((t) => (
          <label key={t.key} className="block">
            <span className="mb-1.5 block text-sm font-semibold text-espresso-700">{t.label}</span>
            <textarea name={t.key} rows={2} defaultValue={values[t.key] ?? ""} className={inputClass} />
          </label>
        ))}
      </div>

      <button type="submit" disabled={pending} className="btn-gold mt-7 w-full sm:w-auto">
        {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
        حفظ الإعدادات
      </button>
    </form>
  );
}
