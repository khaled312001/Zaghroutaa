import type { Metadata } from "next";
import { GALLERY_IMAGES } from "@/data/catalog";
import { PageHeader } from "@/components/ui/PageHeader";
import { MediaGrid } from "@/components/MediaGrid";

export const metadata: Metadata = {
  title: "معرض أعمال إكسسوارات العرايس الهاند ميد",
  description:
    "صور حقيقية من أوردرات عرايس زُغْرُوطَة — شوفي شغلنا الهاند ميد من مناديل كتب الكتاب والبصمات والمرايات والبوكيهات بنفسك.",
  keywords: ["معرض اعمال زغروطة", "اكسسوارات العرايس", "شغل هاند ميد", "كتب الكتاب", "العروسة"],
  alternates: { canonical: "/gallery" },
};

export default function GalleryPage() {
  return (
    <>
      <PageHeader
        eyebrow="من أوردراتنا"
        title="معرض أعمالنا"
        subtitle="صور حقيقية من أوردرات عرايسنا اللي طلعت حديثًا — كل قطعة بتحكي حكاية فرح."
      />
      <div className="container-zg py-10">
        <MediaGrid images={GALLERY_IMAGES} variant="grid" />
      </div>
    </>
  );
}
