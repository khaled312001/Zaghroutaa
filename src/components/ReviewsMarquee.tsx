"use client";

import Image from "next/image";

export function ReviewsMarquee({ images }: { images: string[] }) {
  if (!images.length) return null;
  const list = images.length < 6 ? [...images, ...images, ...images] : [...images, ...images];

  return (
    <div className="relative mask-fade-x overflow-hidden py-2">
      <div className="flex w-max gap-4 animate-marquee hover:[animation-play-state:paused]">
        {list.map((src, i) => (
          <figure
            key={`${src}-${i}`}
            className="card-zg w-52 shrink-0 overflow-hidden sm:w-60"
          >
            <div className="relative aspect-[3/4] bg-cream-200">
              <Image
                src={src}
                alt="رأي عميلة عن زُغْرُوطَة"
                fill
                sizes="240px"
                className="object-cover"
              />
            </div>
          </figure>
        ))}
      </div>
    </div>
  );
}
