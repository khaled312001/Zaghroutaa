"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { toArabicDigits } from "@/lib/utils";

/**
 * ساعة عدّ تنازلي لفرح العروسة — بتعدّ بالثانية وتحتها جملة لطيفة.
 */
export function CountdownTimer({
  date,
  name,
  className = "",
}: {
  date: string; // ISO تاريخ الفرح
  name?: string | null;
  className?: string;
}) {
  const target = new Date(date).getTime();
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  if (Number.isNaN(target)) return null;

  const diff = now === null ? 0 : Math.max(0, target - now);
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const mins = Math.floor((diff % 3_600_000) / 60_000);
  const secs = Math.floor((diff % 60_000) / 1000);
  const passed = now !== null && diff <= 0;

  const units = [
    { v: days, l: "يوم" },
    { v: hours, l: "ساعة" },
    { v: mins, l: "دقيقة" },
    { v: secs, l: "ثانية" },
  ];

  return (
    <div className={`rounded-3xl border border-gold-200/70 bg-gradient-to-br from-blush-50 via-cream-50 to-gold-50 p-5 text-center shadow-card sm:p-7 ${className}`}>
      <p className="flex items-center justify-center gap-1.5 text-sm font-bold text-gold-700">
        <Heart className="h-4 w-4 fill-current" /> {passed ? "مبروك يا عروسة 🤍" : "فاضل على يوم عمرك"}
      </p>

      {!passed && (
        <div className="mt-4 flex justify-center gap-2 sm:gap-3" dir="ltr">
          {units.map((u) => (
            <div key={u.l} className="min-w-[64px] rounded-2xl bg-white/80 px-2 py-3 shadow-sm backdrop-blur sm:min-w-[76px]">
              <div className="font-display text-2xl font-extrabold text-gold-gradient sm:text-3xl tabular-nums">
                {toArabicDigits(String(u.v).padStart(2, "0"))}
              </div>
              <div className="mt-0.5 text-[11px] font-medium text-espresso-500">{u.l}</div>
            </div>
          ))}
        </div>
      )}

      <p className="mt-4 text-sm text-espresso-600">
        {passed
          ? "ألف مبروك! نتمنّى لكِ حياة كلها سعادة 🌷"
          : <>وزُغْرُوطَة بتجهّزلك أحلى تفاصيل ليلتك{name ? ` يا ${name}` : ""} 💛</>}
      </p>
    </div>
  );
}
