import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getCategories } from "@/lib/categories";
import { ProductForm, type ProductFormValues } from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await getCategories();
  const initial: ProductFormValues = {
    nameAr: "",
    categorySlug: "",
    basePrice: "",
    oldPrice: "",
    badge: "",
    shortAr: "",
    descriptionAr: "",
    coverImage: "",
    images: [],
    variants: [],
    isActive: true,
    isFeatured: false,
  };

  return (
    <div>
      <Link href="/admin/products" className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-gold-700 hover:text-gold-800">
        <ArrowRight className="h-4 w-4" /> رجوع للمنتجات
      </Link>
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold text-espresso-900 sm:text-3xl">إضافة منتج جديد</h1>
        <p className="mt-1 text-sm text-espresso-500">املي بيانات المنتج، اختاري قسمه، وارفعي صوره.</p>
      </header>
      <ProductForm mode="create" categories={categories.map((c) => ({ slug: c.slug, nameAr: c.nameAr }))} initial={initial} />
    </div>
  );
}
