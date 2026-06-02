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
  },
  eslint: {
    // الـ build مش بيوقف على تحذيرات اللينت
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
