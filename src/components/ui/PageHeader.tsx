import { Reveal } from "./Reveal";

export function PageHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <section className="relative overflow-hidden bg-cream-radial">
      <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-gold-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 -bottom-24 h-64 w-64 rounded-full bg-blush-200/30 blur-3xl" />
      <div className="container-zg relative py-12 text-center sm:py-16">
        <Reveal>
          {eyebrow && (
            <div className="divider-ornament mb-3">
              <span className="text-sm font-bold text-gold-600">{eyebrow}</span>
            </div>
          )}
          <h1 className="text-4xl font-bold sm:text-5xl">{title}</h1>
          {subtitle && (
            <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-espresso-600">
              {subtitle}
            </p>
          )}
        </Reveal>
      </div>
    </section>
  );
}
