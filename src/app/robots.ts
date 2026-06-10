import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // /book مش محظورة في robots عشان جوجل يقدر يشوف وسم noindex اللي في الصفحة
        // (الحظر في robots كان بيمنعه يشوف الـ noindex → تحذير "indexed though blocked")
        disallow: ["/admin", "/api"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
