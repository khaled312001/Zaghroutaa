import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  showText = true,
  light = false,
}: {
  className?: string;
  showText?: boolean;
  light?: boolean;
}) {
  return (
    <Link
      href="/"
      className={cn("group flex items-center gap-3", className)}
      aria-label="زُغْرُوطَة — الصفحة الرئيسية"
    >
      <span className="relative block h-12 w-12 shrink-0 overflow-hidden rounded-full ring-1 ring-gold-300/60 transition-transform duration-500 group-hover:rotate-[8deg] sm:h-14 sm:w-14">
        <Image
          src="/logo.png"
          alt="زُغْرُوطَة"
          fill
          sizes="56px"
          className="object-contain"
          priority
        />
      </span>
      {showText && (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              "font-latin text-2xl font-semibold tracking-wide sm:text-[1.7rem]",
              light ? "text-white" : "text-gold-gradient",
            )}
          >
            Zaghroutaa
          </span>
          <span
            className={cn(
              "mt-1 font-display text-sm sm:text-base",
              light ? "text-white/80" : "text-espresso-600",
            )}
          >
            زُغْـرُوطَـة
          </span>
        </span>
      )}
    </Link>
  );
}
