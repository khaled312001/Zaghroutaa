import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  center = true,
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  center?: boolean;
  className?: string;
}) {
  return (
    <Reveal className={cn(center && "text-center", className)}>
      {eyebrow && (
        <div className={cn("divider-ornament mb-4", !center && "justify-start")}>
          <span className="text-sm font-bold tracking-wide text-gold-600">
            {eyebrow}
          </span>
        </div>
      )}
      <h2 className="text-3xl font-bold leading-tight sm:text-4xl md:text-[2.7rem]">
        {title}
      </h2>
      {subtitle && (
        <p
          className={cn(
            "mt-4 text-base leading-relaxed text-espresso-600 sm:text-lg",
            center && "mx-auto max-w-2xl",
          )}
        >
          {subtitle}
        </p>
      )}
    </Reveal>
  );
}
