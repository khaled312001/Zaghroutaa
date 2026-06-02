"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, RefreshCw, ArrowLeft, Heart } from "lucide-react";
import { formatPriceEGP } from "@/lib/utils";

export type QuizPackage = {
  slug: string;
  nameAr: string;
  basePrice: number;
  cover: string;
};

type Choice = { label: string; value: string };
type Question = { id: string; title: string; emoji: string; choices: Choice[] };

const QUESTIONS: Question[] = [
  {
    id: "days",
    title: "فرحك فاضلّه قد إيه؟",
    emoji: "🗓️",
    choices: [
      { label: "أقل من ١٠ أيام (مستعجلة!)", value: "rush" },
      { label: "من ١٠ لـ ٣٠ يوم", value: "soon" },
      { label: "أكتر من شهر", value: "later" },
    ],
  },
  {
    id: "style",
    title: "بتحبي الستايل إزاي؟",
    emoji: "✨",
    choices: [
      { label: "مودرن وبسيط", value: "modern" },
      { label: "كلاسيك وفخم", value: "classic" },
      { label: "مزيج بين الاتنين", value: "mix" },
    ],
  },
  {
    id: "budget",
    title: "ميزانيتك في حدود كام؟",
    emoji: "💰",
    choices: [
      { label: "لحد ٧٠٠ جنيه", value: "700" },
      { label: "من ٧٠٠ لـ ١٥٠٠", value: "1500" },
      { label: "فوق ١٥٠٠ (الأفخم)", value: "3000" },
    ],
  },
];

export function AskQuiz({ packages }: { packages: QuizPackage[] }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const pick = (qid: string, value: string) => {
    const next = { ...answers, [qid]: value };
    setAnswers(next);
    if (step < QUESTIONS.length - 1) setStep(step + 1);
    else setStep(QUESTIONS.length); // النتيجة
  };

  const reset = () => {
    setAnswers({});
    setStep(0);
  };

  const done = step >= QUESTIONS.length;
  const result = done ? recommend(packages, answers) : null;
  const rush = answers.days === "rush";

  return (
    <div className="mx-auto max-w-xl">
      <div className="card-zg overflow-hidden p-6 sm:p-8">
        {!done ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.25 }}
            >
              <div className="mb-1 flex items-center justify-center gap-1.5">
                {QUESTIONS.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 rounded-full transition-all ${i === step ? "w-6 bg-gold-shine" : "w-2 bg-gold-200"}`}
                  />
                ))}
              </div>
              <p className="mb-1 text-center text-5xl">{QUESTIONS[step].emoji}</p>
              <h3 className="mb-5 text-center font-display text-xl font-bold text-espresso-900">
                {QUESTIONS[step].title}
              </h3>
              <div className="space-y-2.5">
                {QUESTIONS[step].choices.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => pick(QUESTIONS[step].id, c.value)}
                    className="flex w-full items-center justify-between rounded-2xl border border-gold-200 bg-cream-50 px-5 py-3.5 text-right font-semibold text-espresso-700 transition hover:border-gold-400 hover:bg-gold-50"
                  >
                    {c.label}
                    <ArrowLeft className="h-4 w-4 text-gold-400" />
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <p className="mb-1 flex items-center justify-center gap-1.5 text-sm font-bold text-gold-600">
              <Sparkles className="h-4 w-4" /> الأنسب ليكي
            </p>
            {result ? (
              <>
                <h3 className="mb-4 font-display text-2xl font-extrabold text-gold-gradient">{result.nameAr}</h3>
                <Link href={`/products/${result.slug}`} className="group mx-auto block max-w-[260px]">
                  <div className="relative aspect-square overflow-hidden rounded-2xl border border-gold-200">
                    <Image src={result.cover} alt={result.nameAr} fill sizes="260px" className="object-cover transition group-hover:scale-105" />
                  </div>
                </Link>
                <p className="mt-3 font-display text-xl font-extrabold text-espresso-900">{formatPriceEGP(result.basePrice)}</p>
                {rush && (
                  <p className="mx-auto mt-3 max-w-sm rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-600">
                    فرحك قريب؟ احجزي دلوقتي واختاري «الحجز المستعجل» وهنلحقك بأولوية 💨
                  </p>
                )}
                <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
                  <Link href={`/products/${result.slug}`} className="btn-gold">
                    <Heart className="h-5 w-5" /> شوفي التفاصيل واحجزي
                  </Link>
                  <button type="button" onClick={reset} className="btn-outline">
                    <RefreshCw className="h-5 w-5" /> جرّبي تاني
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="mb-4 text-espresso-600">شوفي كل الباكدجات واختاري اللي يلمس قلبك 💛</p>
                <Link href="/packages" className="btn-gold">شوفي الباكدجات</Link>
              </>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

function recommend(packages: QuizPackage[], a: Record<string, string>): QuizPackage | null {
  if (!packages.length) return null;
  const budget = Number(a.budget) || 999999;
  const within = packages.filter((p) => p.basePrice <= budget);
  const pool = within.length ? within : packages;
  // أعلى باكدج في حدود الميزانية (أحسن قيمة)
  return pool.reduce((best, p) => (p.basePrice > best.basePrice ? p : best), pool[0]);
}
