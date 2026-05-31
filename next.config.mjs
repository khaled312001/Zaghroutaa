/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    // كل الصور محلية داخل /public — مش محتاجين دومينات خارجية
    remotePatterns: [],
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
