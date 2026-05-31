import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";
import { getContentMap } from "@/lib/content";
import { Hero } from "@/components/home/Hero";
import { MovingShowcase } from "@/components/MovingShowcase";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};
import { ValueProps } from "@/components/home/ValueProps";
import { CategoriesSection } from "@/components/home/CategoriesSection";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { PackageSpotlight } from "@/components/home/PackageSpotlight";
import { WhyUs } from "@/components/home/WhyUs";
import { GalleryPreview } from "@/components/home/GalleryPreview";
import { ReviewsPreview } from "@/components/home/ReviewsPreview";
import { BookingSteps } from "@/components/home/BookingSteps";
import { SeoContent } from "@/components/home/SeoContent";
import { FinalCta } from "@/components/home/FinalCta";

export default async function HomePage() {
  const settings = await getSettings();
  const content = await getContentMap();

  return (
    <>
      <Hero
        badge={content.hero_badge}
        title1={content.hero_title_1}
        highlight={content.hero_title_highlight}
        title2={content.hero_title_2}
        subtitle={content.hero_subtitle}
        image={content.hero_image}
      />
      <MovingShowcase />
      <ValueProps />
      <CategoriesSection />
      <FeaturedProducts />
      <PackageSpotlight heroImage={content.package_image} />
      <WhyUs />
      <GalleryPreview />
      <ReviewsPreview />
      <BookingSteps />
      <SeoContent />
      <FinalCta whatsappNumber={settings.whatsappNumber} />
    </>
  );
}
