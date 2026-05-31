"use client";

import Image from "next/image";

/**
 * شريط آراء العملاء.
 */
export function ReviewsMarquee({ images }: { images: string[] }) {
  if (!images.length) return null;

  // كل كارت ≈ 256px
  const minCards = Math.ceil(2000 / 256);
  const repeat = Math.max(1, Math.ceil(minCards / images.length));

  const set: string[] = [];
  for (let r = 0; r < repeat; r++) set.push(...images);

  const duration = set.length * 4;

  return (
    <div className="relative mask-fade-x overflow-hidden py-2 flex">
      <div
        className="marquee-content flex shrink-0 pr-4 gap-4 hover:[animation-play-state:paused]"
        style={{ animationDuration: `${duration}s` }}
      >
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
      </div>
      <div
        className="marquee-content flex shrink-0 pr-4 gap-4 hover:[animation-play-state:paused]"
        aria-hidden="true"
        style={{ animationDuration: `${duration}s` }}
      >
        {set.map((src, i) => (
          <figure key={`b-${i}`} className="card-zg w-52 shrink-0 overflow-hidden sm:w-60">
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
