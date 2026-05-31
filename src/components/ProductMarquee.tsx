"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/data/catalog";
import { formatPriceEGP } from "@/lib/utils";

/**
 * صف منتجات بيتحرك في حلقة مغلقة لا تتوقف (single-row infinite marquee).
 * بنكرّر القايمة مرتين عشان الحركة تبقى سلسة من غير قطع.
 */
export function ProductMarquee({
  products,
  durationSec = 50,
  reverse = false,
}: {
  products: Product[];
  durationSec?: number;
  reverse?: boolean;
}) {
  if (!products.length) return null;
  const list = [...products, ...products];

  return (
    <div className="relative mask-fade-x overflow-hidden py-3">
      <div
        className="flex w-max gap-4 sm:gap-5"
        style={{
          animation: `marquee ${durationSec}s linear infinite`,
          animationDirection: reverse ? "reverse" : "normal",
        }}
      >
        {list.map((p, i) => (
          <Link
            key={`${p.slug}-${i}`}
            href={`/products/${p.slug}`}
            aria-hidden={i >= products.length}
            tabIndex={i >= products.length ? -1 : 0}
            className="group w-48 shrink-0 overflow-hidden rounded-3xl border border-gold-200/70 bg-pearl shadow-card transition-all duration-500 hover:-translate-y-1 hover:shadow-glow sm:w-56"
          >
            <div className="relative aspect-[4/5] overflow-hidden bg-cream-200 shine-on-hover">
              <Image
                src={p.cover}
                alt={p.nameAr}
                fill
                sizes="224px"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {p.badge && (
                <span className="absolute right-2 top-2 chip bg-gold-shine text-white shadow-sm">
                  {p.badge}
                </span>
              )}
            </div>
            <div className="p-3">
              <h3 className="line-clamp-1 text-sm font-bold text-espresso-900">{p.nameAr}</h3>
              <p className="mt-1 text-sm font-extrabold text-gold-700">
                {formatPriceEGP(p.basePrice)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
