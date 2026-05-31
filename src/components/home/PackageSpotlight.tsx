import Image from "next/image";
import Link from "next/link";
import { Check, Sparkles, Crown } from "lucide-react";
import { getProductBySlug, formatPrice } from "@/data/catalog";
import { Reveal } from "@/components/ui/Reveal";

export function PackageSpotlight() {
  const pkg = getProductBySlug("bridal-package");
  if (!pkg) return null;

  return (
    <section className="relative overflow-hidden py-16 sm:py-20">
      <div className="absolute inset-0 bg-espresso-900" />
      <div className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full bg-gold-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-blush-500/10 blur-3xl" />

      <div className="container-zg relative grid items-center gap-10 lg:grid-cols-2">
        {/* صور */}
        <Reveal className="order-2 lg:order-1">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {pkg.images.slice(0, 4).map((img, i) => (
              <div
                key={img.url}
                className={`relative overflow-hidden rounded-3xl border-4 border-pearl/90 shadow-glow ${
                  i === 0 ? "col-span-2 aspect-[16/10]" : "aspect-square"
                }`}
              >
                <Image
                  src={img.url}
                  alt={img.alt}
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </Reveal>

        {/* تفاصيل */}
        <Reveal className="order-1 text-cream-100 lg:order-2" delay={0.1}>
          <span className="chip border border-gold-400/40 bg-gold-500/15 text-gold-200">
            <Crown className="h-3.5 w-3.5" /> {pkg.badge ?? "باكدج مميز"}
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold text-white sm:text-4xl md:text-[2.7rem]">
            {pkg.nameAr}
          </h2>
          <p className="mt-3 max-w-xl leading-relaxed text-cream-200/85">
            {pkg.descriptionAr}
          </p>

          <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
            {pkg.features?.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-cream-100">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold-shine text-white">
                  <Check className="h-3.5 w-3.5" />
                </span>
                {f}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap items-center gap-5">
            <div className="flex items-baseline gap-2">
              <span className="font-display text-4xl font-extrabold text-gold-shimmer">
                {formatPrice(pkg.basePrice)}
              </span>
            </div>
            <Link href={`/book/${pkg.slug}`} className="btn-gold px-7">
              <Sparkles className="h-5 w-5" /> احجزي الباكدج
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
