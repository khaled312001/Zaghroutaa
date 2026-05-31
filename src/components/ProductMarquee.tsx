"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/data/catalog";
import { formatPriceEGP } from "@/lib/utils";

/**
 * شريط منتجات بيتحرك في حلقة مغلقة لا تنتهي.
 */
export function ProductMarquee({
  products,
  reverse = false,
}: {
  products: Product[];
  reverse?: boolean;
}) {
  if (!products.length) return null;

  // كل كارت ≈ 240px (w-56)
  const minCards = Math.ceil(2000 / 240);
  const repeat = Math.max(1, Math.ceil(minCards / products.length));

  const set: Product[] = [];
  for (let r = 0; r < repeat; r++) set.push(...products);

  const duration = set.length * 4;

  return (
    <div className="relative mask-fade-x overflow-hidden py-3 flex">
      <div
        className="marquee-content flex shrink-0 pr-4 sm:pr-5 gap-4 sm:gap-5"
        style={{
          animationDuration: `${duration}s`,
          animationDirection: reverse ? "reverse" : "normal",
        }}
      >
        {set.map((p, i) => (
          <ProductCard key={`a-${i}`} product={p} />
        ))}
      </div>
      
      <div
        className="marquee-content flex shrink-0 pr-4 sm:pr-5 gap-4 sm:gap-5"
        aria-hidden="true"
        style={{
          animationDuration: `${duration}s`,
          animationDirection: reverse ? "reverse" : "normal",
        }}
      >
        {set.map((p, i) => (
          <ProductCard key={`b-${i}`} product={p} isClone />
        ))}
      </div>
    </div>
  );
}

function ProductCard({
  product: p,
  isClone = false,
}: {
  product: Product;
  isClone?: boolean;
}) {
  return (
    <Link
      href={`/products/${p.slug}`}
      aria-hidden={isClone || undefined}
      tabIndex={isClone ? -1 : 0}
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
  );
}
