import { prisma } from "@/lib/prisma";
import { CategoriesManager, type AdminCategory } from "@/components/admin/CategoriesManager";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const rows = await prisma.category.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { products: true } } },
  });
  const categories: AdminCategory[] = rows.map((c) => ({
    id: c.id,
    slug: c.slug,
    nameAr: c.nameAr,
    emoji: c.emoji,
    order: c.order,
    productCount: c._count.products,
  }));

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold text-espresso-900 sm:text-3xl">الأقسام</h1>
        <p className="mt-1 text-sm text-espresso-500">
          ضيفي أقسام جديدة للمنتجات (زي «التوزيعات») وعدّلي أسماءها وإيموجيها — وتظهر فورًا في صفحة المنتجات وفي إضافة منتج.
        </p>
      </header>
      <CategoriesManager categories={categories} />
    </div>
  );
}
