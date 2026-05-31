import type { Metadata } from "next";
import { getActiveReviews } from "@/lib/reviews";
import { PageHeader } from "@/components/ui/PageHeader";
import { MediaGrid } from "@/components/MediaGrid";

export const metadata: Metadata = {
  title: "آراء العملاء",
  description: "ريفيوهات حقيقية من عرايس زُغْرُوطَة بعد استلام أوردراتهم.",
};

export default async function ReviewsPage() {
  const reviews = await getActiveReviews();
  const images = reviews.map((r) => r.imageUrl);

  return (
    <>
      <PageHeader
        eyebrow="كلامهم أحلى شهادة"
        title="آراء عرايسنا"
        subtitle="ريفيوهات حقيقية وصلتنا بعد الاستلام — دي أكتر حاجة بتفرح قلبنا وبتأكدلنا إننا في السكة الصح 💕"
      />
      <div className="container-zg py-10">
        <MediaGrid images={images} variant="masonry" />
      </div>
    </>
  );
}
