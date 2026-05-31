import { prisma } from "@/lib/prisma";
import { GALLERY_IMAGES } from "@/data/catalog";
import { PortfolioManager, type AdminGalleryItem } from "@/components/admin/PortfolioManager";

export const dynamic = "force-dynamic";

export default async function PortfolioAdminPage() {
  let items: AdminGalleryItem[] = [];
  try {
    const rows = await prisma.galleryItem.findMany({
      orderBy: [{ order: "asc" }, { id: "asc" }],
    });
    items = rows.map((r) => ({
      id: r.id,
      imageUrl: r.imageUrl,
      title: r.title,
      isActive: r.isActive,
    }));
  } catch {
    items = [];
  }

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold text-espresso-900 sm:text-3xl">معرض الأعمال (سابقة الأعمال)</h1>
        <p className="mt-1 text-sm text-espresso-500">
          ارفعي صور أعمالكم وأوردراتكم — اللي هنا بيظهر في صفحة «معرض الأعمال» على الموقع.
        </p>
        {items.length === 0 && GALLERY_IMAGES.length > 0 && (
          <p className="mt-2 rounded-xl border border-gold-200 bg-gold-50 px-3 py-2 text-xs text-espresso-600">
            دلوقتي المعرض بيعرض {GALLERY_IMAGES.length} صورة ثابتة. أول ما تضيفي صور هنا، هتبقى هي اللي تظهر.
          </p>
        )}
      </header>
      <PortfolioManager items={items} />
    </div>
  );
}
