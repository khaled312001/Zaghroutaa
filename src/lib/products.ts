import "server-only";
import { cache } from "react";
import { prisma } from "./prisma";
import {
  getAllProducts,
  getProductBySlug,
  type Product,
} from "@/data/catalog";

/**
 * منتجات الموقع = الكتالوج الثابت (صور + بنية ثابتة عمرها ما هتبوظ)
 * + طبقة تعديلات من قاعدة البيانات (السعر/الظهور/المميز/الشارة) لو الأدمن غيّرها.
 * لو الداتابيز مش متاحة لأي سبب، بنرجع الكتالوج الثابت زي ما هو.
 */
export const getSiteProducts = cache(async (): Promise<Product[]> => {
  const base = getAllProducts();
  try {
    const rows = await prisma.product.findMany({
      select: {
        slug: true,
        basePrice: true,
        oldPrice: true,
        isFeatured: true,
        isActive: true,
        badge: true,
        order: true,
      },
    });
    if (!rows.length) return base;
    const bySlug = new Map(rows.map((r) => [r.slug, r]));
    return base
      .filter((p) => bySlug.get(p.slug)?.isActive !== false)
      .map((p) => {
        const o = bySlug.get(p.slug);
        if (!o) return p;
        return {
          ...p,
          basePrice: o.basePrice,
          oldPrice: o.oldPrice ?? p.oldPrice,
          isFeatured: o.isFeatured,
          badge: o.badge ?? p.badge,
          order: o.order ?? p.order,
        };
      })
      .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
  } catch {
    return base;
  }
});

export async function getSiteProductBySlug(
  slug: string,
): Promise<Product | undefined> {
  const all = await getSiteProducts();
  return all.find((p) => p.slug === slug) ?? getProductBySlug(slug);
}

export async function getSiteFeatured(): Promise<Product[]> {
  return (await getSiteProducts()).filter((p) => p.isFeatured);
}

export async function getSiteByCategory(categorySlug: string): Promise<Product[]> {
  return (await getSiteProducts()).filter((p) => p.categorySlug === categorySlug);
}
