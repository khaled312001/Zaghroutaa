import {
  Crown,
  ScrollText,
  Fingerprint,
  Sparkles,
  Flower2,
  Gem,
  Camera,
  Footprints,
  Shirt,
  type LucideIcon,
} from "lucide-react";

/** أيقونة احترافية لكل قسم بدل الإيموجي */
const ICONS: Record<string, LucideIcon> = {
  packages: Crown,
  handkerchiefs: ScrollText,
  fingerprints: Fingerprint,
  mirrors: Sparkles,
  bouquets: Flower2,
  accessories: Gem,
  photoshoot: Camera,
  footwear: Footprints,
  sleepwear: Shirt,
};

export function getCategoryIcon(slug: string): LucideIcon {
  return ICONS[slug] ?? Sparkles;
}

export function CategoryIcon({
  slug,
  className,
}: {
  slug: string;
  className?: string;
}) {
  const Icon = getCategoryIcon(slug);
  return <Icon className={className} />;
}
