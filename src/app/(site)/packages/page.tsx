import type { Metadata } from "next";
import { getSiteProducts } from "@/lib/products";
import { PageHeader } from "@/components/ui/PageHeader";
import { PackageSpotlight } from "@/components/home/PackageSpotlight";
import { ProductGrid } from "@/components/ProductGrid";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "الباكدجات",
  description:
    "باكدج العروسة الكامل من زُغْرُوطَة — منديل كتب كتاب، تابلوه بصمة، مراية، نظارة وأقلام، كله في باكدج واحدة بسعر مميز.",
};

export default async function PackagesPage() {
  const all = await getSiteProducts();
  const addons = all.filter((p) => !p.isPackage);

  return (
    <>
      <PageHeader
        eyebrow="جاهزة بالكامل"
        title="باكدجات العروسة"
        subtitle="باكدج متكامل فيه كل حاجة محتاجاها في يوم كتب الكتاب — بسعر مميز وشغل هاند ميد."
      />
      <PackageSpotlight />
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
