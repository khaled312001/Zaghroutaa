import type { Metadata } from "next";
import { getSiteProducts } from "@/lib/products";
import { getSettings } from "@/lib/settings";
import { PageHeader } from "@/components/ui/PageHeader";
import { PackageBuilder, type BuilderItem } from "@/components/PackageBuilder";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "صممي باكدجك",
  description:
    "اختاري القطع اللي نفسك فيها — منديل، مرايات، بوكيه، كروكس — وكوّني باكدج العروسة بتاعتك بنفسك، والموقع يحسبلك الإجمالي على طول.",
  keywords: ["صممي باكدجك", "باكدج العروسة", "زغروطة", "اكسسوارات العروسة هاند ميد"],
  alternates: { canonical: "/build" },
};

export default async function BuildPage() {
  const products = (await getSiteProducts()).filter((p) => !p.isPackage);
  const settings = await getSettings();
  const items: BuilderItem[] = products.map((p) => ({
    slug: p.slug,
    nameAr: p.nameAr,
    cover: p.cover,
    basePrice: p.basePrice,
    category: p.category?.nameAr ?? "",
  }));

  return (
    <>
      <PageHeader
        eyebrow="على ذوقك إنتي"
        title="صممي باكدجك بنفسك"
        subtitle="اختاري القطع اللي نفسك فيها، والموقع يحسبلك الإجمالي على طول — وبعدين نكمّل على واتساب"
      />
      <div className="container-zg py-10">
        <PackageBuilder items={items} whatsappNumber={settings.whatsappNumber} depositNote={settings.depositNote} />
      </div>
    </>
  );
}
