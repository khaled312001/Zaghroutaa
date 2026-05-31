import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Images } from "lucide-react";
import { GALLERY_IMAGES } from "@/data/catalog";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

export function GalleryPreview() {
  const images = GALLERY_IMAGES.slice(0, 8);
  if (!images.length) return null;

  return (
    <section className="container-zg py-14 sm:py-16">
      <SectionHeading
        eyebrow="من أوردراتنا"
        title="معرض أعمالنا"
        subtitle="صور حقيقية من أوردرات عرايسنا اللي طلعت حديثًا — كل قطعة بتحكي حكاية."
      />
      <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {images.map((src, i) => (
          <Reveal key={src} delay={(i % 4) * 0.06}>
            <div
              className={`relative overflow-hidden rounded-2xl border-2 border-pearl shadow-card shine-on-hover ${
                i === 0 ? "col-span-2 row-span-2 aspect-square" : "aspect-square"
              }`}
            >
              <Image
                src={src}
                alt="من أعمال زُغْرُوطَة"
                fill
                sizes="(max-width: 640px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>
          </Reveal>
        ))}
      </div>
      <div className="mt-10 text-center">
        <Link href="/gallery" className="btn-outline px-7">
          <Images className="h-4 w-4" /> شوفي كل الأعمال <ArrowLeft className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
