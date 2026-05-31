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
      className={cn("group flex items-center gap-2.5", className)}
      aria-label="زُغْرُوطَة — الصفحة الرئيسية"
    >
      <Image
        src="/logo.png"
        alt="زُغْرُوطَة Zaghroutaa — إكسسوارات العرايس الهاند ميد"
        width={799}
        height={954}
        sizes="72px"
        priority
        className="h-14 w-auto shrink-0 transition-transform duration-500 group-hover:scale-105 sm:h-16"
      />
      {showText && (
        <span
          className={cn(
            "font-display text-lg font-bold leading-tight sm:text-xl",
            light ? "text-white" : "text-espresso-800",
          )}
        >
          زُغْـرُوطَـة
        </span>
      )}
    </Link>
  );
}
