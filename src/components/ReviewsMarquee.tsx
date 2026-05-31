"use client";

import Image from "next/image";

/**
 * شريط آراء العملاء — نفس فكرة ProductMarquee بالظبط:
 * نسختين متطابقتين + translateX(-50%) = حلقة مغلقة بلا نهاية.
 */
export function ReviewsMarquee({ images }: { images: string[] }) {
  if (!images.length) return null;

  // كل كارت ≈ 256px + 16px gap = 272px
  const minCards = Math.ceil(2000 / 272);
  const repeat = Math.max(1, Math.ceil(minCards / images.length));

  const set: string[] = [];
  for (let r = 0; r < repeat; r++) set.push(...images);

  const duration = set.length * 4;

  return (
    <div className="relative mask-fade-x overflow-hidden py-2">
      <div
        className="marquee-track flex w-max gap-4 hover:[animation-play-state:paused]"
        style={{ animationDuration: `${duration}s` }}
      >
        {/* النسخة A */}
        {set.map((src, i) => (
          <figure key={`a-${i}`} className="card-zg w-52 shrink-0 overflow-hidden sm:w-60">
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
        {/* النسخة B */}
        {set.map((src, i) => (
          <figure key={`b-${i}`} className="card-zg w-52 shrink-0 overflow-hidden sm:w-60" aria-hidden>
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
