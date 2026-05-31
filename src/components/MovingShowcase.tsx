import { getSiteProducts } from "@/lib/products";
import { ProductMarquee } from "./ProductMarquee";

export async function MovingShowcase({
  title = "تشكيلتنا اللي بتخطف العين",
}: {
  title?: string;
}) {
  const products = await getSiteProducts();
  if (!products.length) return null;

  return (
    <section className="border-y border-gold-100 bg-gradient-to-b from-cream-50 to-cream-100 py-8">
      <div className="container-zg mb-2 flex items-center justify-center">
        <span className="divider-ornament">
          <span className="text-sm font-bold text-gold-600">{title}</span>
        </span>
      </div>
      <ProductMarquee products={products} speed={50} />
    </section>
  );
}
