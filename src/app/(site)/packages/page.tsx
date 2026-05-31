import type { Metadata } from "next";
import { getSiteProducts } from "@/lib/products";
import { getContentMap } from "@/lib/content";
import { PageHeader } from "@/components/ui/PageHeader";
import { PackageSpotlight } from "@/components/home/PackageSpotlight";
import { ProductGrid } from "@/components/ProductGrid";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "باكدجات العروسة الكاملة لكتب الكتاب والفرح",
  description:
    "باكدج العروسة الكامل من زُغْرُوطَة — منديل كتب كتاب مطرّز، تابلوه بصمة، مراية مرصّعة باللؤلؤ، نظارة برايد وأقلام، كله في باكدج واحدة هاند ميد بسعر مميز. أول براند مصري وعربي لإكسسوارات العرايس.",
  keywords: [
    "باكدج العروسة", "باكدج كتب الكتاب", "تجهيزات العروسة", "إكسسوارات العروسة",
    "منديل كتب الكتاب", "بصمة العروسة", "مراية العروسة", "هاند ميد", "زغروطة",
  ],
  alternates: { canonical: "/packages" },
  openGraph: {
    title: "باكدجات العروسة الكاملة | زُغْرُوطَة",
    images: [{ url: "/pages/packages.png", alt: "باكدج العروسة الكامل من زُغْرُوطَة" }],
  },
};

export default async function PackagesPage() {
  const all = await getSiteProducts();
  const addons = all.filter((p) => !p.isPackage);
  const content = await getContentMap();

  return (
    <>
      <PageHeader
        eyebrow="جاهزة بالكامل"
        title="باكدجات العروسة"
        subtitle="باكدج متكامل فيه كل حاجة محتاجاها في يوم كتب الكتاب — بسعر مميز وشغل هاند ميد."
      />
      <PackageSpotlight heroImage={content.package_image} />
      <section className="container-zg py-14 sm:py-16">
        <SectionHeading
          eyebrow="زوّدي على باكدجك"
          title="قطع تقدري تضيفيها"
          subtitle="اختاري أي قطعة تحبي تضيفيها لباكدجك وخلّي يومك أكمل."
        />
        <div className="mt-10">
          <ProductGrid products={addons} />
        </div>
      </section>
    </>
  );
}
