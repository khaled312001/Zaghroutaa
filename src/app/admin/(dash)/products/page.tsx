import { prisma } from "@/lib/prisma";
import { ProductsManager, type AdminProduct } from "@/components/admin/ProductsManager";

export const dynamic = "force-dynamic";

export default async function ProductsAdminPage() {
  const products = await prisma.product.findMany({
    orderBy: { order: "asc" },
    include: { category: true },
  });
  const data: AdminProduct[] = products.map((p) => ({
    id: p.id,
    slug: p.slug,
    nameAr: p.nameAr,
    coverImage: p.coverImage,
    basePrice: p.basePrice,
    oldPrice: p.oldPrice,
    badge: p.badge,
    isActive: p.isActive,
    isFeatured: p.isFeatured,
    categoryName: p.category?.nameAr ?? null,
  }));

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold text-espresso-900 sm:text-3xl">المنتجات</h1>
        <p className="mt-1 text-sm text-espresso-500">
          عدّلي الأسعار والشارات، وتحكّمي في ظهور المنتجات وتمييزها على الصفحة الرئيسية.
        </p>
      </header>
      <ProductsManager products={data} />
    </div>
  );
}
