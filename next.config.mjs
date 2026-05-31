/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
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
