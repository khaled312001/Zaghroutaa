"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/data/catalog";
import { formatPriceEGP } from "@/lib/utils";

/**
 * شريط منتجات بيتحرك في حلقة مغلقة لا تنتهي أبدًا.
 *
 * الفكرة بسيطة:
 * - بنعمل div فيه نسختين متطابقتين من المنتجات (A + B)
 * - الأنيميشن بتحرك الـ div بالظبط -50% (= عرض نسخة A)
 * - لما النسخة A تخرج من الشاشة، النسخة B بتكون في نفس المكان بالظبط
 * - فبيبان كأنه حلقة مغلقة بلا نهاية
 *
 * المهم: لازم نسخة واحدة (A) تكون عرضها أكبر من الشاشة —
 * عشان كدا بنكرّر المنتجات لو عددهم قليل.
 */
export function ProductMarquee({
  products,
  reverse = false,
}: {
  products: Product[];
  reverse?: boolean;
}) {
  if (!products.length) return null;

  // نحسب كام مرة نكرّر عشان نسخة واحدة تملا الشاشة
  // كل كارت ≈ 240px (w-56) + 20px gap = 260px
  // نحتاج نغطي على الأقل 2000px (أعرض شاشة متوقعة)
  const minCards = Math.ceil(2000 / 260); // ≈ 8
  const repeat = Math.max(1, Math.ceil(minCards / products.length));

  const set: Product[] = [];
  for (let r = 0; r < repeat; r++) set.push(...products);

  // المدة حسب عدد الكروت — كل كارت ≈ 4 ثواني عشان السرعة تكون هادية
  const duration = set.length * 4;

  return (
    <div className="relative mask-fade-x overflow-hidden py-3">
      <div
        className="marquee-track flex w-max gap-4 sm:gap-5"
        style={{
          animationDuration: `${duration}s`,
          animationDirection: reverse ? "reverse" : "normal",
        }}
      >
        {/* النسخة A */}
        {set.map((p, i) => (
          <ProductCard key={`a-${i}`} product={p} />
        ))}
        {/* النسخة B (مطابقة لـ A) */}
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
