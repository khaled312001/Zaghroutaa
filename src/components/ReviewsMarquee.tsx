"use client";

import Image from "next/image";
import { useMemo } from "react";

export function ReviewsMarquee({ images }: { images: string[] }) {
  if (!images.length) return null;

  // كل كارت ≈ 256px + 16px gap = 272px
  // بنكرّر كفاية عشان نملا على الأقل ضعف عرض الشاشة
  const repeatCount = Math.max(3, Math.ceil((2 * 1920) / (images.length * 272)));
  const halfList = useMemo(() => {
    const arr: string[] = [];
    for (let i = 0; i < repeatCount; i++) arr.push(...images);
    return arr;
  }, [images, repeatCount]);

  // نصفين متطابقين — الأنيميشن بتحرك -50% فبتخلق لوب مثالي
  const fullList = useMemo(() => [...halfList, ...halfList], [halfList]);

  return (
    <div className="relative mask-fade-x overflow-hidden py-2">
      <div className="flex w-max gap-4 animate-marquee hover:[animation-play-state:paused]">
        {fullList.map((src, i) => (
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

