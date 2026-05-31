import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSiteProductBySlug } from "@/lib/products";
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

  return (
    <>
      <PageHeader
        eyebrow="خطوة وتكوني خلّصتي"
        title="احجزي أوردرك"
        subtitle="املي بياناتك واسم العروسين وتاريخ المناسبة، وهنكمّل على واتساب فورًا 🌷"
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
        />
      </div>
    </>
  );
}
