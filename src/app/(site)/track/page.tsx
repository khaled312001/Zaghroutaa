import type { Metadata } from "next";
import { PackageSearch } from "lucide-react";
import { TrackWidget } from "@/components/TrackWidget";

export const metadata: Metadata = {
  title: "اتبعي أوردرك",
  description: "اكتبي رقم موبايلك وشوفي أوردرك وصل لفين خطوة بخطوة — من تأكيد الحجز لحد ما يوصلك.",
  alternates: { canonical: "/track" },
};

export default function TrackPage() {
  return (
    <>
      <section className="border-b border-gold-100 bg-gradient-to-b from-cream-50 to-cream-100 py-12 text-center sm:py-16">
        <div className="container-zg">
          <span className="chip mx-auto w-fit border border-gold-200 bg-gold-50 text-gold-700">
            <PackageSearch className="h-3.5 w-3.5" /> تتبع الأوردر
          </span>
          <h1 className="mt-3 font-display text-3xl font-extrabold text-espresso-900 sm:text-4xl">
            أوردرك وصل لفين؟
          </h1>
          <p className="mx-auto mt-2 max-w-lg text-espresso-600">
            اكتبي رقم موبايلك وهنوريكي كل خطوة في رحلة تجهيز أوردرك — من غير قلق ولا زنّ 💛
          </p>
        </div>
      </section>

      <section className="container-zg py-10 sm:py-14">
        <TrackWidget />
      </section>
    </>
  );
}
