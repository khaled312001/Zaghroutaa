import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Check, Sparkles, MessageCircle, Truck, Clock, ShieldCheck, ChevronLeft,
} from "lucide-react";
import { getSiteProductBySlug, getSiteByCategory } from "@/lib/products";
import { getSettings } from "@/lib/settings";
import { formatPrice, toArabicDigits } from "@/data/catalog";
import { buildWhatsappUrl } from "@/lib/whatsapp";
import { CategoryIcon } from "@/lib/categoryIcons";
import { JsonLd } from "@/components/seo/JsonLd";
import { SITE_URL } from "@/lib/seo";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductGrid } from "@/components/ProductGrid";
import { SectionHeading } from "@/components/ui/SectionHeading";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getSiteProductBySlug(slug);
  if (!product) return { title: "المنتج غير موجود" };
  return {
    title: product.nameAr,
    description: product.shortAr ?? product.descriptionAr ?? undefined,
    keywords: [
      product.nameAr,
      product.category?.nameAr ?? "",
      "هاند ميد",
      "اكسسوارات العروسة",
      "كتب الكتاب",
      "زغروطة",
    ].filter(Boolean),
    alternates: { canonical: `/products/${slug}` },
    openGraph: {
      title: `${product.nameAr} | زُغْرُوطَة`,
      description: product.shortAr ?? undefined,
      images: [{ url: product.cover, alt: product.nameAr }],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getSiteProductBySlug(slug);
  if (!product) notFound();

  const settings = await getSettings();
  const hasVariants = !!product.variants?.length;
  const related = (await getSiteByCategory(product.categorySlug))
    .filter((p) => p.slug !== product.slug)
    .slice(0, 4);

  const wa = buildWhatsappUrl(
    settings.whatsappNumber,
    `السلام عليكم 🌷 حابة أستفسر عن: ${product.nameAr}`,
  );

  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.nameAr,
    description: product.descriptionAr ?? product.shortAr ?? product.nameAr,
    image: product.images.map((i) => `${SITE_URL}${i.url}`),
    brand: { "@type": "Brand", name: "زُغْرُوطَة" },
    category: product.category?.nameAr,
    offers: {
      "@type": "Offer",
      priceCurrency: "EGP",
      price: product.basePrice,
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}/products/${product.slug}`,
      seller: { "@type": "Organization", name: "زُغْرُوطَة" },
    },
  };
  const crumbs = [
    { name: "الرئيسية", item: SITE_URL },
    { name: "المنتجات", item: `${SITE_URL}/products` },
    ...(product.category
      ? [{ name: product.category.nameAr, item: `${SITE_URL}/products?cat=${product.categorySlug}` }]
      : []),
    { name: product.nameAr, item: `${SITE_URL}/products/${product.slug}` },
  ];
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: c.item,
    })),
  };

  return (
    <>
      <JsonLd data={[productLd, breadcrumbLd]} />
      {/* breadcrumb */}
      <div className="border-b border-gold-100 bg-cream-50">
        <div className="container-zg flex flex-wrap items-center gap-1.5 py-3 text-sm text-espresso-500">
          <Link href="/" className="hover:text-gold-700">الرئيسية</Link>
          <ChevronLeft className="h-4 w-4" />
          <Link href="/products" className="hover:text-gold-700">المنتجات</Link>
          {product.category && (
            <>
              <ChevronLeft className="h-4 w-4" />
              <Link href={`/products?cat=${product.categorySlug}`} className="hover:text-gold-700">
                {product.category.nameAr}
              </Link>
            </>
          )}
          <ChevronLeft className="h-4 w-4" />
          <span className="font-semibold text-espresso-700">{product.nameAr}</span>
        </div>
      </div>

      <div className="container-zg py-10">
        <div className="grid gap-10 lg:grid-cols-2">
          <ProductGallery images={product.images} name={product.nameAr} />

          <div>
            {product.category && (
              <Link
                href={`/products?cat=${product.categorySlug}`}
                className="chip border border-gold-200 bg-gold-50 text-gold-700"
              >
                <CategoryIcon slug={product.categorySlug} className="h-3.5 w-3.5" />
                {product.category.nameAr}
              </Link>
            )}
            <h1 className="mt-3 text-3xl font-bold sm:text-4xl">{product.nameAr}</h1>
            {(product.caption || product.shortAr) && (
              <p className="mt-2 text-lg text-espresso-600">
                {product.caption || product.shortAr}
              </p>
            )}

            {/* السعر */}
            <div className="mt-5 flex items-baseline gap-3">
              {hasVariants && (
                <span className="text-sm text-espresso-500">يبدأ من</span>
              )}
              <span className="font-display text-4xl font-extrabold text-gold-gradient">
                {formatPrice(product.basePrice)}
              </span>
              {product.oldPrice && (
                <span className="text-lg text-espresso-400 line-through">
                  {toArabicDigits(product.oldPrice.toLocaleString("en-US"))} جنيه
                </span>
              )}
            </div>

            {/* الخيارات */}
            {hasVariants && (
              <div className="mt-5 rounded-2xl border border-gold-200/70 bg-cream-50 p-4">
                <h3 className="mb-2 text-sm font-bold text-espresso-700">الخيارات المتاحة:</h3>
                <ul className="divide-y divide-gold-100">
                  {product.variants!.map((v) => (
                    <li key={v.nameAr} className="flex items-center justify-between py-2 text-sm">
                      <span className="text-espresso-700">{v.nameAr}</span>
                      <span className="flex items-baseline gap-2">
                        {v.oldPrice && (
                          <span className="text-xs text-espresso-400 line-through">
                            {toArabicDigits(v.oldPrice)}
                          </span>
                        )}
                        <span className="font-bold text-gold-700">{formatPrice(v.price)}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* المميزات */}
            {product.features?.length ? (
              <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                {product.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-espresso-700">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold-shine text-white">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            ) : null}

            {/* الوصف */}
            {product.descriptionAr && (
              <p className="mt-5 leading-relaxed text-espresso-600">{product.descriptionAr}</p>
            )}

            {/* أزرار */}
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href={`/book/${product.slug}`} className="btn-gold flex-1">
                <Sparkles className="h-5 w-5" /> احجزي دلوقتي
              </Link>
              <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-whatsapp flex-1">
                <MessageCircle className="h-5 w-5" /> استفسري على واتساب
              </a>
            </div>

            {/* ثقة */}
            <div className="mt-6 grid grid-cols-3 gap-3 border-t border-gold-100 pt-5 text-center">
              <Trust icon={<Clock className="h-5 w-5" />} text="إنقاذ في الوقت الضيّق" />
              <Trust icon={<Truck className="h-5 w-5" />} text="شحن لكل المحافظات" />
              <Trust icon={<ShieldCheck className="h-5 w-5" />} text="هاند ميد بضمان جودة" />
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-20">
            <SectionHeading eyebrow="يمكن يعجبك كمان" title="قطع من نفس القسم" />
            <div className="mt-8">
              <ProductGrid products={related} />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function Trust({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 text-gold-600">
      {icon}
      <span className="text-[11px] font-medium leading-tight text-espresso-600">{text}</span>
    </div>
  );
}
