import type { Metadata, Viewport } from "next";
import { El_Messiri, Tajawal, Cormorant_Garamond } from "next/font/google";
import { Toaster } from "sonner";
import { SITE_URL, SITE_DESCRIPTION, SITE_KEYWORDS } from "@/lib/seo";
import "./globals.css";

const display = El_Messiri({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const body = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-body",
  display: "swap",
});

const latin = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-latin",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "زُغْرُوطَة | أول براند مصري وعربي لإكسسوارات العرايس الهاند ميد",
    template: "%s | زُغْرُوطَة",
  },
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  authors: [{ name: "زُغْرُوطَة" }],
  creator: "زُغْرُوطَة",
  publisher: "زُغْرُوطَة",
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    locale: "ar_EG",
    url: SITE_URL,
    siteName: "زُغْرُوطَة",
    title: "زُغْرُوطَة | أول براند مصري وعربي لإكسسوارات العرايس الهاند ميد",
    description: SITE_DESCRIPTION,
    images: [
      { url: "/pages/about.png", width: 1200, height: 800, alt: "زُغْرُوطَة — إكسسوارات العرايس الهاند ميد" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "زُغْرُوطَة | إكسسوارات العرايس الهاند ميد",
    description: SITE_DESCRIPTION,
    images: ["/pages/about.png"],
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#C08D45",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={`${display.variable} ${body.variable} ${latin.variable}`}>
      <body className="font-body">
        {children}
        <Toaster
          position="top-center"
          richColors
          toastOptions={{
            style: { fontFamily: "var(--font-body)", direction: "rtl" },
          }}
        />
      </body>
    </html>
  );
}
