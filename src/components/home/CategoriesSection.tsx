import Link from "next/link";
import { getCategoriesWithCounts, toArabicDigits } from "@/data/catalog";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { CategoryIcon } from "@/lib/categoryIcons";

export function CategoriesSection() {
  const categories = getCategoriesWithCounts().filter((c) => c.count > 0);

  return (
    <section className="container-zg py-14 sm:py-16">
      <SectionHeading
        eyebrow="اتسوّقي بسهولة"
        title="أقسام زُغْرُوطَة"
        subtitle="اختاري القسم اللي يناسب يومك، ولقطعة زيّك مختلفة عن أي عروسة تانية."
      />
      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {categories.map((c, i) => (
          <Reveal key={c.slug} delay={(i % 5) * 0.06}>
            <Link
              href={`/products?cat=${c.slug}`}
              className="card-zg group flex h-full flex-col items-center justify-center gap-2 p-6 text-center transition-all duration-500 hover:-translate-y-1 hover:border-gold-300 hover:shadow-glow"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-50 text-gold-600 transition-all duration-500 group-hover:scale-105 group-hover:bg-gold-shine group-hover:text-white">
                <CategoryIcon slug={c.slug} className="h-7 w-7" />
              </span>
              <span className="font-display text-base font-bold text-espresso-900">
                {c.nameAr}
              </span>
              <span className="text-xs text-gold-600">
                {toArabicDigits(c.count)} قطعة
              </span>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
