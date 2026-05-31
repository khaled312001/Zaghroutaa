import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Product } from "@/data/catalog";
import { formatPriceEGP, toArabicDigits, cn } from "@/lib/utils";

export function ProductCard({
  product,
  priority = false,
}: {
  product: Product;
  priority?: boolean;
}) {
  const hasVariants = !!product.variants?.length;
  const discount =
    product.oldPrice && product.oldPrice > product.basePrice
      ? Math.round((1 - product.basePrice / product.oldPrice) * 100)
      : 0;

  return (
    <div className="group card-zg flex h-full flex-col overflow-hidden transition-all duration-500 hover:-translate-y-1.5 hover:shadow-glow">
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-[4/5] overflow-hidden bg-cream-200 shine-on-hover"
      >
        <Image
          src={product.cover}
          alt={product.images[0]?.alt ?? product.nameAr}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          priority={priority}
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-wrap gap-2 p-3">
          {product.badge && (
            <span className="chip bg-gold-shine text-white shadow-sm">
              {product.badge}
            </span>
          )}
          {discount > 0 && (
            <span className="chip bg-blush-500 text-white shadow-sm">
              خصم {toArabicDigits(discount)}٪
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        {product.category && (
          <span className="mb-1 text-xs font-semibold text-gold-600">
            {product.category.emoji} {product.category.nameAr}
          </span>
        )}
        <Link href={`/products/${product.slug}`}>
          <h3 className="line-clamp-1 text-lg font-bold text-espresso-900 transition-colors group-hover:text-gold-700">
            {product.nameAr}
          </h3>
        </Link>
        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-espresso-600">
          {product.caption || product.shortAr}
        </p>

        <div className="mt-3 flex items-end justify-between">
          <div className="flex flex-col">
            {hasVariants && (
              <span className="text-[11px] text-espresso-500">يبدأ من</span>
            )}
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-extrabold text-gold-700">
                {formatPriceEGP(product.basePrice)}
              </span>
              {product.oldPrice && (
                <span className="text-sm text-espresso-400 line-through">
                  {toArabicDigits(product.oldPrice.toLocaleString("en-US"))}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <Link
            href={`/book/${product.slug}`}
            className={cn("btn-gold flex-1 px-4 py-2.5 text-sm")}
          >
            احجزي دلوقتي
          </Link>
          <Link
            href={`/products/${product.slug}`}
            className="btn-ghost px-3 py-2.5 text-sm"
            aria-label="تفاصيل المنتج"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
