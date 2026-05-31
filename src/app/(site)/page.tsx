import { getSettings } from "@/lib/settings";
import { Hero } from "@/components/home/Hero";
import { ValueProps } from "@/components/home/ValueProps";
import { CategoriesSection } from "@/components/home/CategoriesSection";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { PackageSpotlight } from "@/components/home/PackageSpotlight";
import { WhyUs } from "@/components/home/WhyUs";
import { GalleryPreview } from "@/components/home/GalleryPreview";
import { ReviewsPreview } from "@/components/home/ReviewsPreview";
import { BookingSteps } from "@/components/home/BookingSteps";
import { FinalCta } from "@/components/home/FinalCta";

export default async function HomePage() {
  const settings = await getSettings();

  return (
    <>
      <Hero />
      <ValueProps />
      <CategoriesSection />
      <FeaturedProducts />
      <PackageSpotlight />
      <WhyUs />
      <GalleryPreview />
      <ReviewsPreview />
      <BookingSteps />
      <FinalCta whatsappNumber={settings.whatsappNumber} />
    </>
  );
}
