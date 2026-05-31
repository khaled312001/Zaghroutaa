import { prisma } from "@/lib/prisma";
import { ReviewsManager, type AdminReview } from "@/components/admin/ReviewsManager";

export const dynamic = "force-dynamic";

export default async function ReviewsAdminPage() {
  const reviews = await prisma.review.findMany({
    orderBy: [{ order: "asc" }, { id: "asc" }],
  });
  const data: AdminReview[] = reviews.map((r) => ({
    id: r.id,
    imageUrl: r.imageUrl,
    name: r.name,
    text: r.text,
    isActive: r.isActive,
  }));

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold text-espresso-900 sm:text-3xl">آراء العملاء</h1>
        <p className="mt-1 text-sm text-espresso-500">تحكّمي في الآراء اللي بتظهر على الموقع — اعرضي أو اخفي أو امسحي.</p>
      </header>
      <ReviewsManager reviews={data} />
    </div>
  );
}
