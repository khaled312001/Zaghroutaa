/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // مكتبة واتساب (Baileys) بتتشغّل وقت التشغيل من node_modules، مش بتتحزم مع البندل
  serverExternalPackages: ["@whiskeysockets/baileys", "qrcode"],
  images: {
    // بنوقف تحسين الصور عشان الصور المرفوعة وقت التشغيل (لوجو/معرض/آراء)
    // تظهر صح على السيرفر (الـ optimizer في وضع standalone بيرفض ملفات /uploads بـ 400)
    unoptimized: true,
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
    // الاستضافة المشتركة محدودة الموارد — نبني بعامل واحد عشان الـ build ما يتعداش حد الميموري
    cpus: 1,
    workerThreads: false,
  },
  eslint: {
    // الـ build مش بيوقف على تحذيرات اللينت
    ignoreDuringBuilds: true,
  },
  typescript: {
    // بنعمل typecheck محليًا قبل الـ commit — بنوفّر ميموري ووقت على الاستضافة المشتركة
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
