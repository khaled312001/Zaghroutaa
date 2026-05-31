import type { Metadata } from "next";
import { getGalleryImages } from "@/lib/gallery";
import { PageHeader } from "@/components/ui/PageHeader";
import { MediaGrid } from "@/components/MediaGrid";

export const metadata: Metadata = {
  title: "معرض أعمال إكسسوارات العرايس الهاند ميد",
  description:
    "صور حقيقية من أوردرات عرايس زُغْرُوطَة — شوفي شغلنا الهاند ميد من مناديل كتب الكتاب والبصمات والمرايات والبوكيهات بنفسك.",
  keywords: ["معرض اعمال زغروطة", "اكسسوارات العرايس", "شغل هاند ميد", "كتب الكتاب", "العروسة"],
  alternates: { canonical: "/gallery" },
};

export default async function GalleryPage() {
  const images = (await getGalleryImages()).map((g) => g.url);
  return (
    <>
      <PageHeader
        eyebrow="من أوردراتنا"
        title="معرض أعمالنا"
        subtitle="صور حقيقية من أوردرات عرايسنا اللي طلعت حديثًا — كل قطعة بتحكي حكاية فرح."
      />
      <div className="container-zg py-10">
        <MediaGrid images={images} variant="grid" />
      </div>
    </>
  );
}
