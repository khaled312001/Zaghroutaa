import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  showText = true,
  light = false,
  src = "/logo.png",
}: {
  className?: string;
  showText?: boolean;
  light?: boolean;
  src?: string;
}) {
  return (
    <Link
      href="/"
      className={cn("group flex items-center gap-2.5", className)}
      aria-label="زُغْرُوطَة — الصفحة الرئيسية"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src || "/logo.png"}
        alt="زُغْرُوطَة Zaghroutaa — إكسسوارات العرايس الهاند ميد"
        className="h-14 w-auto shrink-0 object-contain transition-transform duration-500 group-hover:scale-105 sm:h-16"
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
