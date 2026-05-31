import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { CATEGORIES } from "@/data/catalog";
import { ProductForm, type ProductFormValues } from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const p = await prisma.product.findUnique({
    where: { id: Number(id) },
    include: {
      category: true,
      images: { orderBy: { order: "asc" } },
      variants: { orderBy: { order: "asc" } },
    },
  });
  if (!p) notFound();

  const extraImages = p.images.map((i) => i.url).filter((u) => u !== p.coverImage);
  const initial: ProductFormValues = {
    id: p.id,
    nameAr: p.nameAr,
    categorySlug: p.category?.slug ?? "",
    basePrice: String(p.basePrice),
    oldPrice: p.oldPrice ? String(p.oldPrice) : "",
    badge: p.badge ?? "",
    shortAr: p.shortAr ?? "",
    descriptionAr: p.descriptionAr ?? "",
    coverImage: p.coverImage,
    images: extraImages,
    variants: p.variants.map((v) => ({
      nameAr: v.nameAr,
      price: String(v.price),
      oldPrice: v.oldPrice ? String(v.oldPrice) : "",
    })),
    isActive: p.isActive,
    isFeatured: p.isFeatured,
  };

  return (
    <div>
      <Link href="/admin/products" className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-gold-700 hover:text-gold-800">
        <ArrowRight className="h-4 w-4" /> رجوع للمنتجات
      </Link>
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold text-espresso-900 sm:text-3xl">تعديل المنتج</h1>
        <p className="mt-1 text-sm text-espresso-500">{p.nameAr}</p>
      </header>
      <ProductForm mode="edit" categories={CATEGORIES.map((c) => ({ slug: c.slug, nameAr: c.nameAr }))} initial={initial} />
    </div>
  );
}
