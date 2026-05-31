import "server-only";
import { cache } from "react";
import { prisma } from "./prisma";
import { REVIEW_IMAGES } from "@/data/catalog";

export type SiteReview = {
  id: number | string;
  imageUrl: string;
  name?: string;
  text?: string;
};

export const getActiveReviews = cache(async (): Promise<SiteReview[]> => {
  try {
    const rows = await prisma.review.findMany({
      where: { isActive: true },
      orderBy: [{ order: "asc" }, { id: "asc" }],
    });
    if (rows.length) {
      return rows.map((r) => ({
        id: r.id,
        imageUrl: r.imageUrl,
        name: r.name ?? undefined,
        text: r.text ?? undefined,
      }));
    }
  } catch {
    // فولباك للصور الثابتة
  }
  return REVIEW_IMAGES.map((url, i) => ({ id: `static-${i}`, imageUrl: url }));
});
