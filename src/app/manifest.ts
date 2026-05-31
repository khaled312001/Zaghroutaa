import type { MetadataRoute } from "next";
import { SITE_DESCRIPTION } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "زُغْرُوطَة — إكسسوارات العرايس الهاند ميد",
    short_name: "زُغْرُوطَة",
    description: SITE_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#FBF7F0",
    theme_color: "#C08D45",
    lang: "ar",
    dir: "rtl",
    categories: ["shopping", "lifestyle"],
    icons: [
      { src: "/logo.png", sizes: "192x192", type: "image/png" },
      { src: "/logo.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
