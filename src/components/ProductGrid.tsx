import type { Product } from "@/data/catalog";
import { ProductCard } from "./ProductCard";
import { Reveal } from "./ui/Reveal";

export function ProductGrid({
  products,
  priorityCount = 0,
}: {
  products: Product[];
  priorityCount?: number;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((p, i) => (
        <Reveal key={p.slug} delay={Math.min((i % 4) * 0.08, 0.3)}>
          <ProductCard product={p} priority={i < priorityCount} />
        </Reveal>
      ))}
    </div>
  );
}
