"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Save, Plus, Trash2, X, Star, Eye } from "lucide-react";
import { ImageUpload } from "@/components/ImageUpload";
import {
  createProductAction,
  updateProductFullAction,
  type ProductInput,
} from "@/app/admin/cms-actions";
import { cn } from "@/lib/utils";

type Cat = { slug: string; nameAr: string };
type VariantRow = { nameAr: string; price: string; oldPrice: string };

export type ProductFormValues = {
  id?: number;
  nameAr: string;
  categorySlug: string;
  basePrice: string;
  oldPrice: string;
  badge: string;
  shortAr: string;
  descriptionAr: string;
  coverImage: string;
  images: string[];
  variants: VariantRow[];
  isActive: boolean;
  isFeatured: boolean;
};

const inputClass =
  "w-full rounded-2xl border border-gold-200 bg-cream-50 px-4 py-3 text-espresso-800 outline-none transition focus:border-gold-400 focus:ring-2 focus:ring-gold-200";

export function ProductForm({
  categories,
  initial,
  mode,
}: {
  categories: Cat[];
  initial: ProductFormValues;
  mode: "create" | "edit";
}) {
  const router = useRouter();
  const [v, setV] = useState<ProductFormValues>(initial);
  const [saving, setSaving] = useState(false);
  const up = (patch: Partial<ProductFormValues>) => setV((s) => ({ ...s, ...patch }));

  async function submit() {
    if (!v.nameAr.trim()) return toast.error("اكتبي اسم المنتج");
    if (!v.categorySlug) return toast.error("اختاري القسم");
    if (!v.coverImage) return toast.error("ارفعي صورة الغلاف");
    setSaving(true);
    const payload: ProductInput = {
      nameAr: v.nameAr,
      categorySlug: v.categorySlug,
      basePrice: Number(v.basePrice) || 0,
      oldPrice: v.oldPrice ? Number(v.oldPrice) : null,
      badge: v.badge || null,
      shortAr: v.shortAr,
      descriptionAr: v.descriptionAr,
      coverImage: v.coverImage,
      images: [v.coverImage, ...v.images],
      variants: v.variants.map((x) => ({
        nameAr: x.nameAr,
        price: Number(x.price) || 0,
        oldPrice: x.oldPrice ? Number(x.oldPrice) : null,
      })),
      isActive: v.isActive,
      isFeatured: v.isFeatured,
    };
    try {
      if (mode === "create") await createProductAction(payload);
      else await updateProductFullAction(v.id!, payload);
      toast.success(mode === "create" ? "اتضاف المنتج بنجاح" : "اتحفظ المنتج");
      router.push("/admin/products");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "حصل خطأ، حاولي تاني");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="card-zg p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-sm font-semibold text-espresso-700">اسم المنتج *</span>
            <input className={inputClass} value={v.nameAr} onChange={(e) => up({ nameAr: e.target.value })} placeholder="مثلاً: منديل كتب كتاب هاند ميد" />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-espresso-700">القسم *</span>
            <select className={inputClass} value={v.categorySlug} onChange={(e) => up({ categorySlug: e.target.value })}>
              <option value="" disabled>اختاري القسم</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>{c.nameAr}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-espresso-700">الشارة (اختياري)</span>
            <input className={inputClass} value={v.badge} onChange={(e) => up({ badge: e.target.value })} placeholder="مثلاً: هاند ميد / عرض" />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-espresso-700">السعر *</span>
            <input type="number" inputMode="numeric" className={inputClass} value={v.basePrice} onChange={(e) => up({ basePrice: e.target.value })} />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-espresso-700">السعر قبل الخصم (اختياري)</span>
            <input type="number" inputMode="numeric" className={inputClass} value={v.oldPrice} onChange={(e) => up({ oldPrice: e.target.value })} />
          </label>

          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-sm font-semibold text-espresso-700">وصف مختصر</span>
            <input className={inputClass} value={v.shortAr} onChange={(e) => up({ shortAr: e.target.value })} placeholder="سطر واحد بيظهر تحت اسم المنتج" />
          </label>

          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-sm font-semibold text-espresso-700">الوصف الكامل</span>
            <textarea rows={3} className={inputClass} value={v.descriptionAr} onChange={(e) => up({ descriptionAr: e.target.value })} />
          </label>
        </div>
      </div>

      {/* الصور */}
      <div className="card-zg p-6">
        <h3 className="mb-3 font-display text-lg font-bold text-espresso-900">صور المنتج</h3>
        <div className="grid gap-5 sm:grid-cols-[200px_1fr]">
          <div>
            <span className="mb-1.5 block text-sm font-semibold text-espresso-700">صورة الغلاف *</span>
            <ImageUpload value={v.coverImage} onChange={(url) => up({ coverImage: url })} aspect="aspect-[4/5]" />
          </div>
          <div>
            <span className="mb-1.5 block text-sm font-semibold text-espresso-700">صور إضافية</span>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {v.images.map((url, i) => (
                <div key={i} className="group relative aspect-square overflow-hidden rounded-xl border border-gold-200">
                  <Image src={url} alt="" fill sizes="120px" className="object-cover" />
                  <button type="button" onClick={() => up({ images: v.images.filter((_, j) => j !== i) })} className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-white opacity-0 transition group-hover:opacity-100" aria-label="مسح">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              <ImageUpload value="" onChange={(url) => url && up({ images: [...v.images, url] })} aspect="aspect-square" />
            </div>
          </div>
        </div>
      </div>

      {/* الخيارات */}
      <div className="card-zg p-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-espresso-900">الخيارات (اختياري)</h3>
          <button type="button" onClick={() => up({ variants: [...v.variants, { nameAr: "", price: "", oldPrice: "" }] })} className="btn-ghost px-3 py-1.5 text-sm">
            <Plus className="h-4 w-4" /> خيار
          </button>
        </div>
        {v.variants.length === 0 ? (
          <p className="text-sm text-espresso-400">مفيش خيارات — المنتج بسعر واحد.</p>
        ) : (
          <div className="space-y-2">
            {v.variants.map((vr, i) => (
              <div key={i} className="flex flex-wrap items-center gap-2">
                <input className={cn(inputClass, "flex-1 py-2")} placeholder="اسم الخيار (مثلاً: الاتنين مع بعض)" value={vr.nameAr} onChange={(e) => up({ variants: v.variants.map((x, j) => j === i ? { ...x, nameAr: e.target.value } : x) })} />
                <input type="number" className={cn(inputClass, "w-24 py-2")} placeholder="السعر" value={vr.price} onChange={(e) => up({ variants: v.variants.map((x, j) => j === i ? { ...x, price: e.target.value } : x) })} />
                <input type="number" className={cn(inputClass, "w-24 py-2")} placeholder="قبل الخصم" value={vr.oldPrice} onChange={(e) => up({ variants: v.variants.map((x, j) => j === i ? { ...x, oldPrice: e.target.value } : x) })} />
                <button type="button" onClick={() => up({ variants: v.variants.filter((_, j) => j !== i) })} className="rounded-lg p-2 text-rose-600 hover:bg-rose-50" aria-label="مسح">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* الظهور */}
      <div className="card-zg flex flex-wrap items-center gap-3 p-5">
        <button type="button" onClick={() => up({ isActive: !v.isActive })} className={cn("flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-semibold", v.isActive ? "border-green-200 bg-green-50 text-green-700" : "border-gold-200 text-espresso-500")}>
          <Eye className="h-4 w-4" /> {v.isActive ? "ظاهر على الموقع" : "مخفي"}
        </button>
        <button type="button" onClick={() => up({ isFeatured: !v.isFeatured })} className={cn("flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-semibold", v.isFeatured ? "border-transparent bg-gold-shine text-white" : "border-gold-200 text-espresso-500")}>
          <Star className={cn("h-4 w-4", v.isFeatured && "fill-current")} /> مميّز في الرئيسية
        </button>
        <button type="button" onClick={submit} disabled={saving} className="btn-gold ms-auto px-6">
          {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
          {mode === "create" ? "إضافة المنتج" : "حفظ التعديلات"}
        </button>
      </div>
    </div>
  );
}
