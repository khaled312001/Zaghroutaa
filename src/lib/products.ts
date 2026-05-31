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
        // قيم الداتابيز هي المرجع (null يعني الأدمن مسحها عن قصد)
        return {
          ...p,
          basePrice: o.basePrice,
          oldPrice: o.oldPrice ?? undefined,
          isFeatured: o.isFeatured,
          badge: o.badge ?? undefined,
          order: o.order,
        };
      })
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  } catch {
    return base;
  }
});

export async function getSiteProductBySlug(
  slug: string,
): Promise<Product | undefined> {
  const staticP = getProductBySlug(slug);
  try {
    const o = await prisma.product.findUnique({
      where: { slug },
      select: {
        basePrice: true,
        oldPrice: true,
        isFeatured: true,
        isActive: true,
        badge: true,
        order: true,
      },
    });
    if (o) {
      // المنتج اتخفي من الأدمن → مش متاح حتى بالرابط المباشر
      if (!o.isActive || !staticP) return undefined;
      return {
        ...staticP,
        basePrice: o.basePrice,
        oldPrice: o.oldPrice ?? undefined,
        isFeatured: o.isFeatured,
        badge: o.badge ?? undefined,
        order: o.order,
      };
    }
    return staticP;
  } catch {
    return staticP;
  }
}

export async function getSiteFeatured(): Promise<Product[]> {
  return (await getSiteProducts()).filter((p) => p.isFeatured);
}

export async function getSiteByCategory(categorySlug: string): Promise<Product[]> {
  return (await getSiteProducts()).filter((p) => p.categorySlug === categorySlug);
}
