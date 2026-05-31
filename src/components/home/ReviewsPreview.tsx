import Link from "next/link";
import { getActiveReviews } from "@/lib/reviews";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ReviewsMarquee } from "@/components/ReviewsMarquee";

export async function ReviewsPreview() {
  const reviews = await getActiveReviews();
  const images = reviews.map((r) => r.imageUrl);
  if (!images.length) return null;

  return (
    <section className="py-14 sm:py-16">
      <div className="container-zg">
        <SectionHeading
          eyebrow="كلامهم أحلى شهادة"
          title="آراء عرايسنا"
          subtitle="ريفيوهات حقيقية وصلتنا بعد الاستلام — دي أكتر حاجة بتفرح قلبنا 💕"
        />
      </div>
      <div className="mt-10">
        <ReviewsMarquee images={images} />
      </div>
      <div className="mt-10 text-center">
        <Link href="/reviews" className="btn-outline px-7">
          شوفي كل آراء العملاء
        </Link>
      </div>
    </section>
  );
}
