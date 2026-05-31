"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/data/catalog";
import { formatPriceEGP } from "@/lib/utils";
import { useMemo, useRef, useEffect, useState } from "react";

/**
 * صف منتجات بيتحرك في حلقة مغلقة لا تتوقف (single-row infinite marquee).
 * بنكرّر القايمة كفاية عشان تملا الشاشة دايمًا — مفيش فراغ أبدًا.
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

  // نكرّر المنتجات كفاية عشان نملا على الأقل ضعف عرض الشاشة
  // كل كارت ≈ 240px + 20px gap = 260px
  // بنعمل نسخة واحدة على الأقل 3 مرات عشان نضمن التغطية
  const repeatCount = Math.max(3, Math.ceil((2 * 1920) / (products.length * 260)));
  const halfList = useMemo(() => {
    const arr: Product[] = [];
    for (let i = 0; i < repeatCount; i++) arr.push(...products);
    return arr;
  }, [products, repeatCount]);

  // ننشئ نصفين متطابقين — الأنيميشن بتحرك -50% فبتخلق لوب مثالي
  const fullList = useMemo(() => [...halfList, ...halfList], [halfList]);

  return (
    <div className="relative mask-fade-x overflow-hidden py-3">
      <div
        className="flex w-max gap-4 sm:gap-5"
        style={{
          animation: `marquee ${durationSec}s linear infinite`,
          animationDirection: reverse ? "reverse" : "normal",
        }}
      >
        {fullList.map((p, i) => (
          <Link
            key={`${p.slug}-${i}`}
            href={`/products/${p.slug}`}
            aria-hidden={i >= halfList.length}
            tabIndex={i >= halfList.length ? -1 : 0}
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

