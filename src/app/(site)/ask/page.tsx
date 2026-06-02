import type { Metadata } from "next";
import { HelpCircle, Sparkles } from "lucide-react";
import { getSiteProducts } from "@/lib/products";
import { FAQ_ITEMS } from "@/data/faq";
import { FaqAccordion } from "@/components/FaqAccordion";
import { AskQuiz, type QuizPackage } from "@/components/AskQuiz";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { JsonLd } from "@/components/seo/JsonLd";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "اسألي زُغْرُوطَة — كل أسئلة العرايس وإجاباتها",
  description:
    "إجابات كل أسئلة العروسة عن زُغْرُوطَة: وقت التنفيذ، الشحن، التطريز عربي وإنجليزي، والحجز المستعجل. وكمان كويز يرشّحلك الباكدج الأنسب ليكي.",
  keywords: ["اسئلة العرايس", "زغروطة", "وقت التنفيذ", "الشحن", "تطريز اسماء", "باكدج العروسة"],
  alternates: { canonical: "/ask" },
};

export default async function AskPage() {
  const products = await getSiteProducts();
  const packages = products.filter((p) => p.isPackage);
  const pool = (packages.length ? packages : products).slice(0, 12);
  const quizPackages: QuizPackage[] = pool.map((p) => ({
    slug: p.slug,
    nameAr: p.nameAr,
    basePrice: p.basePrice,
    cover: p.cover,
  }));

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <JsonLd data={faqLd} />

      {/* هيدر */}
      <section className="border-b border-gold-100 bg-gradient-to-b from-cream-50 to-cream-100 py-12 text-center sm:py-16">
        <div className="container-zg">
          <span className="chip mx-auto w-fit border border-gold-200 bg-gold-50 text-gold-700">
            <HelpCircle className="h-3.5 w-3.5" /> اسألي زُغْرُوطَة
          </span>
          <h1 className="mt-3 font-display text-3xl font-extrabold text-espresso-900 sm:text-4xl">
            كل اللي في بالك… وإحنا هنا نجاوب
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-espresso-600">
            جمعنا لك أكتر أسئلة العرايس، وعملنالك كمان كويز صغير يساعدك تختاري الأنسب ليكي 💛
          </p>
        </div>
      </section>

      {/* الكويز */}
      <section className="container-zg py-12 sm:py-16">
        <SectionHeading
          eyebrow="كويز العروسة"
          title="٣ أسئلة بس… ونقولك الأنسب ليكي"
          subtitle="جاوبي بسرعة وهنرشّحلك الباكدج اللي يناسب ذوقك وميزانيتك."
        />
        <div className="mt-8">
          <AskQuiz packages={quizPackages} />
        </div>
      </section>

      {/* الأسئلة */}
      <section className="bg-cream-50 py-12 sm:py-16">
        <div className="container-zg">
          <SectionHeading eyebrow="أسئلة متكررة" title="أسئلة العرايس وإجاباتها" />
          <div className="mt-8">
            <FaqAccordion items={FAQ_ITEMS} />
          </div>
          <p className="mx-auto mt-8 flex max-w-md items-center justify-center gap-1.5 text-center text-sm text-espresso-500">
            <Sparkles className="h-4 w-4 text-gold-500" />
            لسه عندك سؤال؟ كلّمينا على واتساب وإحنا تحت أمرك.
          </p>
        </div>
      </section>
    </>
  );
}
