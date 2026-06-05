import "server-only";
import { cache } from "react";
import { prisma } from "./prisma";
import { CATEGORIES, type Category } from "@/data/catalog";

/**
 * قائمة الأقسام — مصدر الحقيقة هو الداتابيز (عشان إيمان تقدر تضيف أقسام من اللوحة)،
 * ولو الداتابيز مش متاحة أو فاضية بنرجع للكتالوج الثابت.
 * بنكمّل أي قسم ثابت مش موجود في الداتابيز عشان ما يضيعش.
 */
export const getCategories = cache(async (): Promise<Category[]> => {
  try {
    const rows = await prisma.category.findMany({ orderBy: { order: "asc" } });
    if (rows.length) {
      const bySlug = new Map<string, Category>();
      for (const r of rows) {
        bySlug.set(r.slug, {
          slug: r.slug,
          nameAr: r.nameAr,
          emoji: r.emoji ?? undefined,
          order: r.order,
        });
      }
      // أي قسم ثابت مش متسجّل في الداتابيز بنضيفه عشان ما يختفيش من القائمة
      for (const c of CATEGORIES) {
        if (!bySlug.has(c.slug)) bySlug.set(c.slug, c);
      }
      return [...bySlug.values()].sort((a, b) => a.order - b.order);
    }
  } catch {
    // فولباك للكتالوج الثابت
  }
  return [...CATEGORIES].sort((a, b) => a.order - b.order);
});
