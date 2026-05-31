"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/data/catalog";
import { formatPriceEGP } from "@/lib/utils";
import { useRef, useEffect, useState, useCallback } from "react";

/**
 * صف منتجات بيتحرك في حلقة مغلقة لا تتوقف (single-row infinite marquee).
 * بنعرض نسختين متطابقين جنب بعض وبنحرك بالظبط عرض نسخة واحدة —
 * كدا اللوب بيكون seamless ومفيش فراغ أبدًا.
 */
export function ProductMarquee({
  products,
  reverse = false,
  speed = 60, // بكسل في الثانية
}: {
  products: Product[];
  reverse?: boolean;
  speed?: number;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [halfWidth, setHalfWidth] = useState(0);

  const measure = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    // النص الأول = نص العرض الكلي (عندنا نسختين)
    setHalfWidth(el.scrollWidth / 2);
  }, []);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure, products]);

  if (!products.length) return null;

  // بنكرّر المنتجات كفاية عشان نسخة واحدة تملا الشاشة على الأقل
  const minCards = Math.max(1, Math.ceil(1920 / (260))); // 260px per card approx
  const repeatCount = Math.max(2, Math.ceil(minCards / products.length));
  const singleSet: Product[] = [];
  for (let i = 0; i < repeatCount; i++) singleSet.push(...products);

  const durationSec = halfWidth > 0 ? halfWidth / speed : 40;

  return (
    <div className="relative mask-fade-x overflow-hidden py-3">
      <div
        ref={trackRef}
        className="flex w-max gap-4 sm:gap-5"
        style={{
          animation: halfWidth > 0
            ? `marquee-scroll ${durationSec}s linear infinite`
            : "none",
          animationDirection: reverse ? "reverse" : "normal",
          ["--marquee-distance" as string]: `-${halfWidth}px`,
        }}
      >
        {/* النسخة الأولى */}
        {singleSet.map((p, i) => (
          <ProductCard key={`a-${p.slug}-${i}`} product={p} />
        ))}
        {/* النسخة الثانية (مطابقة) */}
        {singleSet.map((p, i) => (
          <ProductCard key={`b-${p.slug}-${i}`} product={p} aria-hidden />
        ))}
      </div>
    </div>
  );
}

function ProductCard({ product: p, ...rest }: { product: Product; "aria-hidden"?: boolean }) {
  return (
    <Link
      href={`/products/${p.slug}`}
      tabIndex={rest["aria-hidden"] ? -1 : 0}
      className="group w-48 shrink-0 overflow-hidden rounded-3xl border border-gold-200/70 bg-pearl shadow-card transition-all duration-500 hover:-translate-y-1 hover:shadow-glow sm:w-56"
      {...rest}
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
  );
}

