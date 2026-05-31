"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, Star, ArrowLeft, Clock, Truck, Heart, BadgeCheck } from "lucide-react";

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
      <Floaty className="left-[7%] top-[16%]" delay={0}>
        <Sparkles className="h-6 w-6 text-gold-400/70" />
      </Floaty>
      <Floaty className="right-[10%] top-[24%]" delay={1.2}>
        <Star className="h-4 w-4 fill-gold-300/60 text-gold-300/60" />
      </Floaty>
      <Floaty className="left-[16%] bottom-[14%]" delay={0.6}>
        <Star className="h-5 w-5 fill-blush-300/70 text-blush-300/70" />
      </Floaty>
      <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-gold-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-blush-200/40 blur-3xl" />

      <div className="container-zg relative grid items-center gap-10 py-12 lg:grid-cols-[1.05fr_1fr] lg:py-16">
        {/* النص */}
        <div className="text-center lg:text-right">
          <motion.span
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0}
            className="chip mx-auto border border-gold-200 bg-pearl text-gold-700 shadow-sm lg:mx-0"
          >
            <BadgeCheck className="h-4 w-4" /> الأول في مصر والوطن العربي لإكسسوارات العرايس الهاند ميد
          </motion.span>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={1}
            className="mt-5 text-4xl font-bold leading-[1.18] sm:text-5xl md:text-6xl"
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
            <Trust icon={<Heart className="h-4 w-4 text-blush-500" />} text="+٥٠٠ عروسة سعيدة" />
          </motion.div>
        </div>

        {/* الصورة الرئيسية (براندد) */}
        <div className="relative mx-auto w-full max-w-xl">
          <div className="pointer-events-none absolute -inset-4 rounded-[2.5rem] border border-gold-200/50" />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden rounded-[2rem] border-4 border-pearl shadow-glow"
          >
            <div className="relative aspect-[4/3]">
              <Image
                src="/pages/about.png"
                alt="تشكيلة زُغْرُوطَة الهاند ميد للعروسة — بصمة ومراية ومنديل وبوكيه"
                fill
                sizes="(max-width: 1024px) 100vw, 600px"
                className="object-cover"
                priority
              />
            </div>
          </motion.div>

          {/* بادج هاند ميد */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="absolute -bottom-4 right-4 flex items-center gap-2 rounded-2xl border border-gold-200 bg-pearl/95 px-4 py-2.5 shadow-card backdrop-blur"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-shine text-white">
              <Sparkles className="h-5 w-5" />
            </span>
            <div className="text-right">
              <p className="text-sm font-extrabold leading-none text-espresso-900">هاند ميد ١٠٠٪</p>
              <p className="mt-0.5 text-[11px] text-espresso-500">تقفيل وتشطيب مفيش زيه</p>
            </div>
          </motion.div>

          {/* بادج تقييم */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="absolute -top-3 left-3 flex items-center gap-1.5 rounded-2xl border border-gold-200 bg-pearl/95 px-3 py-2 shadow-card backdrop-blur"
          >
            {[0, 1, 2, 3, 4].map((i) => (
              <Star key={i} className="h-4 w-4 fill-gold-400 text-gold-400" />
            ))}
            <span className="ms-1 text-xs font-bold text-espresso-700">٥٫٠</span>
          </motion.div>
        </div>
      </div>

      <div className="h-10 w-full bg-gradient-to-b from-transparent to-cream-100" />
    </section>
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
