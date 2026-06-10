import type { Metadata } from "next";
import Link from "next/link";
import { LayoutGrid } from "lucide-react";
import { getSiteProducts } from "@/lib/products";
import { getCategories } from "@/lib/categories";
import { CATEGORIES, toArabicDigits } from "@/data/catalog";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProductGrid } from "@/components/ProductGrid";
import { MovingShowcase } from "@/components/MovingShowcase";
import { CategoryIcon } from "@/lib/categoryIcons";
import { JsonLd } from "@/components/seo/JsonLd";
import { SITE_URL } from "@/lib/seo";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}): Promise<Metadata> {
  const { cat } = await searchParams;
  // الميتاداتا بتستخدم الكتالوج الثابت (من غير استعلام داتابيز وقت الـ build)
  const current = cat ? CATEGORIES.find((c) => c.slug === cat) : undefined;

  // صفحة قسم: عنوان ووصف وكانونيكال خاص بيها عشان تتفهرس كصفحة هبوط مستقلة
  if (current) {
    return {
      title: `${current.nameAr} هاند ميد — زُغْرُوطَة`,
      description: `تشكيلة ${current.nameAr} الهاند ميد من زُغْرُوطَة، أول براند مصري لإكسسوارات العرايس وتجهيزات كتب الكتاب والفرح — شغل متقن وأسعار تناسب الجميع وشحن لكل محافظات مصر.`,
      keywords: [current.nameAr, "زغروطة", "اكسسوارات العروسة", "هاند ميد", "كتب الكتاب", "تجهيزات العروسة"],
      alternates: { canonical: `/products?cat=${current.slug}` },
    };
  }

  return {
    title: "كل منتجات وإكسسوارات العروسة الهاند ميد",
    description:
      "تشكيلة زُغْرُوطَة الكاملة من إكسسوارات العروسة الهاند ميد — مناديل كتب الكتاب المطرّزة، تابلوهات البصمة، مرايات العروسة، بوكيهات البرايد، النظارات والأقلام وروب العروسة. أسعار تناسب الجميع وشحن لكل المحافظات.",
    keywords: [
      "اكسسوارات العروسة", "منديل كتب الكتاب", "بصمة العروسة", "مراية العروسة",
      "بوكيه برايد", "نظارة برايد", "روب العروسة", "هاند ميد", "تجهيزات العروسة", "زغروطة",
    ],
    alternates: { canonical: "/products" },
  };
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const { cat } = await searchParams;
  const all = await getSiteProducts();
  const cats = await getCategories();
  const activeCats = cats.filter((c) =>
    all.some((p) => p.categorySlug === c.slug),
  );
  const current = activeCats.find((c) => c.slug === cat);
  const products = current
    ? all.filter((p) => p.categorySlug === current.slug)
    : all;

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: current ? current.nameAr : "كل منتجات زُغْرُوطَة",
    url: `${SITE_URL}/products${cat ? `?cat=${cat}` : ""}`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: products.length,
      itemListElement: products.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE_URL}/products/${p.slug}`,
        name: p.nameAr,
        image: p.cover?.startsWith("http") ? p.cover : `${SITE_URL}${p.cover}`,
      })),
    },
  };

  return (
    <>
      <JsonLd data={itemListLd} />
      <PageHeader
        eyebrow="تشكيلتنا الكاملة"
        title={current ? current.nameAr : "كل منتجات زُغْرُوطَة"}
        subtitle={
          current
            ? `اختاري من تشكيلة ${current.nameAr} المميزة`
            : "كل اللي العروسة محتاجاه في يومها — قطع هاند ميد معمولة بدقة ونضافة."
        }
      />

      <MovingShowcase title="كل القطع في صف واحد" />

      <div className="container-zg py-10">
        {/* فلاتر الأقسام */}
        <div className="no-scrollbar sticky top-[72px] z-20 -mx-5 mb-8 flex gap-2 overflow-x-auto border-b border-gold-100 bg-cream-100/85 px-5 py-3 backdrop-blur sm:-mx-8 sm:px-8">
          <FilterPill href="/products" active={!current} label="الكل" count={all.length} icon={<LayoutGrid className="h-4 w-4" />} />
          {activeCats.map((c) => (
            <FilterPill
              key={c.slug}
              href={`/products?cat=${c.slug}`}
              active={current?.slug === c.slug}
              label={c.nameAr}
              icon={<CategoryIcon slug={c.slug} className="h-4 w-4" />}
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
  icon,
}: {
  href: string;
  active: boolean;
  label: string;
  count: number;
  icon?: React.ReactNode;
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
      {icon}
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
