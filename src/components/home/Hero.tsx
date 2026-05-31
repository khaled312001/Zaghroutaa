"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, Star, ArrowLeft, Clock, Truck, Heart } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-cream-radial">
      {/* زخارف متحركة */}
      <Floaty className="left-[8%] top-[18%]" delay={0}>
        <Sparkles className="h-6 w-6 text-gold-400/70" />
      </Floaty>
      <Floaty className="right-[12%] top-[28%]" delay={1.2}>
        <Star className="h-4 w-4 fill-gold-300/60 text-gold-300/60" />
      </Floaty>
      <Floaty className="left-[18%] bottom-[16%]" delay={0.6}>
        <Star className="h-5 w-5 fill-blush-300/70 text-blush-300/70" />
      </Floaty>
      <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-gold-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-blush-200/40 blur-3xl" />

      <div className="container-zg relative grid items-center gap-10 py-14 lg:grid-cols-2 lg:py-20">
        {/* النص */}
        <div className="text-center lg:text-right">
          <motion.span
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0}
            className="chip mx-auto border border-gold-200 bg-pearl text-gold-700 shadow-sm lg:mx-0"
          >
            <Sparkles className="h-3.5 w-3.5" /> هاند ميد بإيد مصرية • لعرايس مصر
          </motion.span>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={1}
            className="mt-5 text-4xl font-bold leading-[1.2] sm:text-5xl md:text-6xl"
          >
            عشان العروسة تكون{" "}
            <span className="text-gold-shimmer">مختلفة</span>
            <br />
            في يوم العمر
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={2}
            className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-espresso-600 sm:text-lg lg:mx-0"
          >
            كل حاجة تخص العروسة في كتب الكتاب والفرح — مناديل مطرّزة، بصمات،
            مرايات وبوكيهات هاند ميد معمولة بدقة ونضافة تقفيل مفيش زيها في مصر.
          </motion.p>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={3}
            className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start"
          >
            <Link href="/packages" className="btn-gold w-full px-7 sm:w-auto">
              <Sparkles className="h-5 w-5" /> احجزي باكدجك
            </Link>
            <Link href="/products" className="btn-outline w-full px-7 sm:w-auto">
              اتفرجي على كل المنتجات <ArrowLeft className="h-4 w-4" />
            </Link>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={4}
            className="mt-9 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm font-medium text-espresso-600 lg:justify-start"
          >
            <Trust icon={<Clock className="h-4 w-4 text-gold-500" />} text="بننقذك في الوقت الضيّق" />
            <Trust icon={<Truck className="h-4 w-4 text-gold-500" />} text="شحن لكل المحافظات" />
            <Trust icon={<Heart className="h-4 w-4 text-blush-500" />} text="ريفيوهات بتفرح القلب" />
          </motion.div>
        </div>

        {/* الكولاج */}
        <div className="relative mx-auto h-[380px] w-full max-w-md sm:h-[460px] lg:h-[540px]">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: -4 }}
            animate={{ opacity: 1, scale: 1, rotate: -4 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-4 z-20 w-[62%]"
          >
            <Frame src="/products/katb-ketab-handkerchief/katb-ketab-handkerchief-02.jpg" alt="منديل كتب كتاب هاند ميد" priority float />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: 6 }}
            animate={{ opacity: 1, scale: 1, rotate: 6 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="absolute bottom-2 left-0 z-30 w-[50%]"
          >
            <Frame src="/products/strass-bouquets/strass-bouquets-04.jpg" alt="بوكيه استراس" float delay={1} />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: -8 }}
            animate={{ opacity: 1, scale: 1, rotate: -8 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-6 top-0 z-10 w-[42%]"
          >
            <Frame src="/products/bridal-mirror/bridal-mirror-06.jpg" alt="مراية العروسة" float delay={2} />
          </motion.div>
        </div>
      </div>

      {/* موجة سفلية */}
      <div className="h-10 w-full bg-gradient-to-b from-transparent to-cream-100" />
    </section>
  );
}

function Frame({
  src,
  alt,
  priority,
  float,
  delay = 0,
}: {
  src: string;
  alt: string;
  priority?: boolean;
  float?: boolean;
  delay?: number;
}) {
  return (
    <div
      className={`overflow-hidden rounded-[1.75rem] border-4 border-pearl bg-cream-200 shadow-glow ${
        float ? "animate-float" : ""
      }`}
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="relative aspect-[3/4]">
        <Image src={src} alt={alt} fill sizes="320px" className="object-cover" priority={priority} />
      </div>
    </div>
  );
}

function Floaty({
  children,
  className,
  delay,
}: {
  children: React.ReactNode;
  className?: string;
  delay: number;
}) {
  return (
    <motion.div
      className={`pointer-events-none absolute z-10 ${className}`}
      animate={{ y: [0, -14, 0], opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 5, repeat: Infinity, delay, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}

function Trust({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {icon} {text}
    </span>
  );
}
