"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Save, Loader2, Star, Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import { updateProductAction } from "@/app/admin/actions";
import { deleteProductFullAction } from "@/app/admin/cms-actions";
import { cn } from "@/lib/utils";

export type AdminProduct = {
  id: number;
  slug: string;
  nameAr: string;
  coverImage: string;
  basePrice: number;
  oldPrice: number | null;
  badge: string | null;
  isActive: boolean;
  isFeatured: boolean;
  categoryName: string | null;
};

export function ProductsManager({ products }: { products: AdminProduct[] }) {
  return (
    <div className="space-y-3">
      {products.map((p) => (
        <ProductRow key={p.id} product={p} />
      ))}
    </div>
  );
}

function ProductRow({ product }: { product: AdminProduct }) {
  const [basePrice, setBasePrice] = useState(String(product.basePrice));
  const [oldPrice, setOldPrice] = useState(product.oldPrice ? String(product.oldPrice) : "");
  const [badge, setBadge] = useState(product.badge ?? "");
  const [isActive, setIsActive] = useState(product.isActive);
  const [isFeatured, setIsFeatured] = useState(product.isFeatured);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function remove() {
    if (!window.confirm(`متأكدة إنك عايزة تمسحي «${product.nameAr}» نهائيًا؟`)) return;
    try {
      await deleteProductFullAction(product.id);
      toast.success("اتمسح المنتج");
      router.refresh();
    } catch {
      toast.error("حصل خطأ، حاولي تاني");
    }
  }

  async function save() {
    setSaving(true);
    try {
      await updateProductAction(product.id, {
        basePrice: Number(basePrice) || 0,
        oldPrice: oldPrice ? Number(oldPrice) : null,
        badge: badge.trim() || null,
        isActive,
        isFeatured,
      });
      toast.success(`اتحفظ: ${product.nameAr}`);
    } catch {
      toast.error("حصل خطأ، حاولي تاني");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={cn("card-zg flex flex-col gap-3 p-3 sm:flex-row sm:items-center", !isActive && "opacity-60")}>
      <div className="flex items-center gap-3">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-cream-200">
          <Image src={product.coverImage} alt={product.nameAr} fill sizes="64px" className="object-cover" />
        </div>
        <div className="min-w-0 sm:w-44">
          <p className="truncate font-bold text-espresso-900">{product.nameAr}</p>
          <p className="text-xs text-espresso-500">{product.categoryName}</p>
        </div>
      </div>

      <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-3">
        <NumField label="السعر" value={basePrice} onChange={setBasePrice} />
        <NumField label="قبل الخصم" value={oldPrice} onChange={setOldPrice} placeholder="—" />
        <label className="block">
          <span className="mb-1 block text-[11px] font-semibold text-espresso-500">شارة</span>
          <input
            value={badge}
            onChange={(e) => setBadge(e.target.value)}
            placeholder="مثلاً: عرض"
            className="w-full rounded-xl border border-gold-200 bg-cream-50 px-3 py-2 text-sm outline-none focus:border-gold-400"
          />
        </label>
      </div>

      <div className="flex items-center gap-2">
        <Toggle on={isActive} onClick={() => setIsActive((v) => !v)} onIcon={<Eye className="h-4 w-4" />} offIcon={<EyeOff className="h-4 w-4" />} title={isActive ? "ظاهر" : "مخفي"} />
        <Toggle on={isFeatured} onClick={() => setIsFeatured((v) => !v)} onIcon={<Star className="h-4 w-4 fill-current" />} offIcon={<Star className="h-4 w-4" />} title="مميّز" gold />
        <button type="button" onClick={save} disabled={saving} className="btn-gold px-4 py-2 text-sm">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          حفظ
        </button>
        <Link
          href={`/admin/products/${product.id}/edit`}
          title="تعديل كامل"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-gold-200 text-espresso-600 hover:bg-cream-200"
        >
          <Pencil className="h-4 w-4" />
        </Link>
        <button
          type="button"
          onClick={remove}
          title="مسح المنتج"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function NumField({
  label, value, onChange, placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-semibold text-espresso-500">{label}</span>
      <input
        type="number"
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gold-200 bg-cream-50 px-3 py-2 text-sm outline-none focus:border-gold-400"
      />
    </label>
  );
}

function Toggle({
  on, onClick, onIcon, offIcon, title, gold,
}: {
  on: boolean;
  onClick: () => void;
  onIcon: React.ReactNode;
  offIcon: React.ReactNode;
  title: string;
  gold?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-xl border transition",
        on
          ? gold
            ? "border-transparent bg-gold-shine text-white"
            : "border-green-200 bg-green-50 text-green-700"
          : "border-gold-200 bg-cream-50 text-espresso-400",
      )}
    >
      {on ? onIcon : offIcon}
    </button>
  );
}
