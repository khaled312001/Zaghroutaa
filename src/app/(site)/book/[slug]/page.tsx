import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSiteProductBySlug, getSiteProducts } from "@/lib/products";
import { getSettings } from "@/lib/settings";
import { PageHeader } from "@/components/ui/PageHeader";
import { BookingForm } from "@/components/BookingForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getSiteProductBySlug(slug);
  return {
    title: product ? `حجز ${product.nameAr}` : "احجزي أوردرك",
    robots: { index: false },
  };
}

export default async function BookPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getSiteProductBySlug(slug);
  if (!product) notFound();
  const settings = await getSettings();

  // عروض الإضافات (هدايا برفع المبيعات) — قطع صغيرة بخصم
  const upsellPercent = Number(settings.upsellPercent) || 30;
  const upsellThreshold = Number(settings.upsellThreshold) || 1000;
  const all = await getSiteProducts();
  const addonItems = all
    .filter((p) => p.slug !== product.slug && !p.isPackage && p.basePrice <= 400)
    .sort((a, b) => a.basePrice - b.basePrice)
    .slice(0, 3)
    .map((p) => ({
      slug: p.slug,
      nameAr: p.nameAr,
      cover: p.cover,
      basePrice: p.basePrice,
      offerPrice: Math.round((p.basePrice * (100 - upsellPercent)) / 100),
    }));

  return (
    <>
      <PageHeader
        eyebrow="خطوة وتكوني خلّصتي"
        title="احجزي أوردرك"
        subtitle="املي بياناتك واسم العروسين وتاريخ المناسبة، وهنكمّل على واتساب فورًا"
      />
      <div className="container-zg py-10">
        <BookingForm
          product={{
            slug: product.slug,
            nameAr: product.nameAr,
            cover: product.cover,
            basePrice: product.basePrice,
            oldPrice: product.oldPrice,
            isPackage: product.isPackage,
            variants: product.variants,
          }}
          whatsappNumber={settings.whatsappNumber}
          depositNote={settings.depositNote}
          upsell={{ items: addonItems, threshold: upsellThreshold, percent: upsellPercent }}
        />
      </div>
    </>
  );
}
