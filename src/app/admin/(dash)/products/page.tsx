import Link from "next/link";
import { Plus } from "lucide-react";
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
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-espresso-900 sm:text-3xl">المنتجات</h1>
          <p className="mt-1 text-sm text-espresso-500">
            ضيفي منتج جديد، أو عدّلي السعر والقسم والصور والظهور لأي منتج.
          </p>
        </div>
        <Link href="/admin/products/new" className="btn-gold px-5">
          <Plus className="h-5 w-5" /> إضافة منتج جديد
        </Link>
      </header>
      <ProductsManager products={data} />
    </div>
  );
}
