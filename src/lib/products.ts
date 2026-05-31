import "server-only";
import { cache } from "react";
import type { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import {
  getAllProducts,
  getProductBySlug,
  type Product,
  type ProductImage,
} from "@/data/catalog";

// نخزّن الكتالوج الثابت عشان نكمّل به الحقول اللي مش في الداتابيز (زي features/caption)
const staticBySlug = new Map(getAllProducts().map((p) => [p.slug, p]));

const productInclude = {
  category: true,
  images: { orderBy: { order: "asc" as const } },
  variants: { orderBy: { order: "asc" as const } },
} satisfies Prisma.ProductInclude;

type DbProduct = Prisma.ProductGetPayload<{ include: typeof productInclude }>;

function mapRow(r: DbProduct): Product {
  const images: ProductImage[] = r.images.length
    ? r.images.map((i) => ({ url: i.url, alt: i.alt ?? r.nameAr }))
    : [{ url: r.coverImage, alt: r.nameAr }];
  const s = staticBySlug.get(r.slug);
  return {
    slug: r.slug,
    nameAr: r.nameAr,
    categorySlug: r.category?.slug ?? "",
    basePrice: r.basePrice,
    oldPrice: r.oldPrice ?? undefined,
    shortAr: r.shortAr ?? "",
    descriptionAr: r.descriptionAr ?? "",
    features: s?.features,
    variants: r.variants.length
      ? r.variants.map((v) => ({
          nameAr: v.nameAr,
          price: v.price,
          oldPrice: v.oldPrice ?? undefined,
        }))
      : s?.variants,
    badge: r.badge ?? undefined,
    isPackage: r.isPackage,
    isFeatured: r.isFeatured,
    order: r.order,
    cover: r.coverImage,
    images,
    category: r.category
      ? {
          slug: r.category.slug,
          nameAr: r.category.nameAr,
          emoji: r.category.emoji ?? undefined,
          order: r.category.order,
        }
      : undefined,
    caption: s?.caption,
  };
}

/** كل منتجات الموقع — من الداتابيز (مصدر الحقيقة)، ولو الداتابيز مش متاحة بنرجع الكتالوج الثابت */
export const getSiteProducts = cache(async (): Promise<Product[]> => {
  try {
    const rows = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      include: productInclude,
    });
    if (rows.length) return rows.map(mapRow);
  } catch {
    // فولباك
  }
  return getAllProducts();
});

export async function getSiteProductBySlug(
  slug: string,
): Promise<Product | undefined> {
  try {
    const r = await prisma.product.findUnique({
      where: { slug },
      include: productInclude,
    });
    if (r) {
      if (!r.isActive) return undefined; // اتخفي من الأدمن
      return mapRow(r);
    }
  } catch {
    // فولباك
  }
  return getProductBySlug(slug);
}

export async function getSiteFeatured(): Promise<Product[]> {
  return (await getSiteProducts()).filter((p) => p.isFeatured);
}

export async function getSiteByCategory(categorySlug: string): Promise<Product[]> {
  return (await getSiteProducts()).filter((p) => p.categorySlug === categorySlug);
}
