"use client";

import { motion } from "framer-motion";
import { toArabicDigits } from "@/lib/utils";

type Day = { label: string; value: number };
type StatusSlice = { label: string; value: number; color: string };

export function OrdersChart({
  days,
  statuses,
}: {
  days: Day[];
  statuses: StatusSlice[];
}) {
  const max = Math.max(1, ...days.map((d) => d.value));
  const total = statuses.reduce((s, x) => s + x.value, 0);

  // دونات: نحسب الأقواس
  const R = 15.9155;
  const C = 2 * Math.PI * R;
  let acc = 0;

  return (
    <div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_1fr] lg:gap-6">
      {/* رسم الطلبات آخر ٧ أيام */}
      <div className="card-zg p-5">
        <h2 className="mb-1 font-display text-lg font-bold text-espresso-900">
          الطلبات آخر ٧ أيام
        </h2>
        <p className="mb-5 text-xs text-espresso-500">حركة الحجوزات خلال الأسبوع.</p>
        <div className="flex h-44 items-end justify-between gap-2 sm:gap-3">
          {days.map((d, i) => (
            <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
              <span className="text-xs font-bold text-gold-700">
                {d.value > 0 ? toArabicDigits(d.value) : ""}
              </span>
              <div className="flex w-full flex-1 items-end justify-center">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(d.value / max) * 100}%` }}
                  transition={{ duration: 0.7, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full max-w-[2.2rem] rounded-t-xl bg-gold-shine"
                  style={{ minHeight: d.value > 0 ? 10 : 4, opacity: d.value > 0 ? 1 : 0.25 }}
                />
              </div>
              <span className="text-[11px] font-medium text-espresso-500">{d.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* دونات الحالات */}
      <div className="card-zg p-5">
        <h2 className="mb-1 font-display text-lg font-bold text-espresso-900">الطلبات حسب الحالة</h2>
        <p className="mb-4 text-xs text-espresso-500">توزيع كل الطلبات.</p>

        <div className="flex items-center gap-5">
          <div className="relative h-32 w-32 shrink-0">
            <svg viewBox="0 0 40 40" className="h-full w-full -rotate-90">
              <circle cx="20" cy="20" r={R} fill="none" stroke="#F1E7D5" strokeWidth="4.5" />
              {total > 0 &&
                statuses.map((s, i) => {
                  if (s.value === 0) return null;
                  const frac = s.value / total;
                  const len = frac * C;
                  const seg = (
                    <motion.circle
                      key={i}
                      cx="20"
                      cy="20"
                      r={R}
                      fill="none"
                      stroke={s.color}
                      strokeWidth="4.5"
                      strokeLinecap="round"
                      strokeDasharray={`${len} ${C - len}`}
                      initial={{ strokeDashoffset: -acc }}
                      animate={{ strokeDashoffset: -acc }}
                    />
                  );
                  acc += len;
                  return seg;
                })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-2xl font-extrabold text-espresso-900">
                {toArabicDigits(total)}
              </span>
              <span className="text-[11px] text-espresso-500">طلب</span>
            </div>
          </div>

          <div className="flex-1 space-y-1.5">
            {statuses.map((s) => (
              <div key={s.label} className="flex items-center justify-between gap-2 text-sm">
                <span className="flex items-center gap-2 text-espresso-700">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
                  {s.label}
                </span>
                <span className="font-bold text-espresso-900">{toArabicDigits(s.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
