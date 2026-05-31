import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSiteFeatured } from "@/lib/products";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProductGrid } from "@/components/ProductGrid";

export async function FeaturedProducts() {
  const products = (await getSiteFeatured()).slice(0, 8);
  if (!products.length) return null;

  return (
    <section className="container-zg py-14 sm:py-16">
      <SectionHeading
        eyebrow="الأكثر طلبًا"
        title="قطع بتخطف العين"
        subtitle="مختارات من أكتر قطعنا اللي العرايس بتعشقها — هاند ميد ومعمولة بدقة."
      />
      <div className="mt-10">
        <ProductGrid products={products} priorityCount={4} />
      </div>
      <div className="mt-10 text-center">
        <Link href="/products" className="btn-gold px-7">
          اتفرجي على كل المنتجات <ArrowLeft className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
