import type { Metadata } from "next";
import Link from "next/link";
import { getSiteProducts } from "@/lib/products";
import { CATEGORIES, toArabicDigits } from "@/data/catalog";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProductGrid } from "@/components/ProductGrid";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "كل المنتجات",
  description:
    "تشكيلة زُغْرُوطَة الكاملة من قطع العروسة الهاند ميد — مناديل كتب الكتاب، البصمات، المرايات، البوكيهات والإكسسوارات.",
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const { cat } = await searchParams;
  const all = await getSiteProducts();
  const activeCats = CATEGORIES.filter((c) =>
    all.some((p) => p.categorySlug === c.slug),
  );
  const current = activeCats.find((c) => c.slug === cat);
  const products = current
    ? all.filter((p) => p.categorySlug === current.slug)
    : all;

  return (
    <>
      <PageHeader
        eyebrow="تشكيلتنا الكاملة"
        title={current ? current.nameAr : "كل منتجات زُغْرُوطَة"}
        subtitle={
          current
            ? `اختاري من تشكيلة ${current.nameAr} المميزة`
            : "كل اللي العروسة محتاجاه في يومها — قطع هاند ميد معمولة بدقة ونضافة."
        }
      />

      <div className="container-zg py-10">
        {/* فلاتر الأقسام */}
        <div className="no-scrollbar mb-8 flex gap-2 overflow-x-auto pb-2">
          <FilterPill href="/products" active={!current} label="الكل" count={all.length} />
          {activeCats.map((c) => (
            <FilterPill
              key={c.slug}
              href={`/products?cat=${c.slug}`}
              active={current?.slug === c.slug}
              label={`${c.emoji} ${c.nameAr}`}
              count={all.filter((p) => p.categorySlug === c.slug).length}
            />
          ))}
        </div>

        {products.length ? (
          <ProductGrid products={products} priorityCount={4} />
        ) : (
          <p className="py-20 text-center text-espresso-500">لا توجد منتجات حاليًا.</p>
        )}
      </div>
    </>
  );
}

function FilterPill({
  href,
  active,
  label,
  count,
}: {
  href: string;
  active: boolean;
  label: string;
  count: number;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition-all",
        active
          ? "border-transparent bg-gold-shine text-white shadow-glow"
          : "border-gold-200 bg-pearl text-espresso-700 hover:border-gold-300 hover:bg-gold-50",
      )}
    >
      {label}
      <span
        className={cn(
          "rounded-full px-1.5 text-[11px]",
          active ? "bg-white/25" : "bg-cream-200 text-gold-600",
        )}
      >
        {toArabicDigits(count)}
      </span>
    </Link>
  );
}
