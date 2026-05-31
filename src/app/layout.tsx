import type { Metadata, Viewport } from "next";
import { El_Messiri, Tajawal, Cormorant_Garamond } from "next/font/google";
import { Toaster } from "sonner";
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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://zaghroutaa.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "زُغْرُوطَة | كل حاجة تخص العروسة وكتب الكتاب والفرح",
    template: "%s | زُغْرُوطَة",
  },
  description:
    "زُغْرُوطَة — متخصصون في قطع العروسة الهاند ميد: مناديل كتب الكتاب المطرّزة، تابلوهات البصمة، مرايات وبوكيهات وإكسسوارات العروسة. شغل متقن ونضيف، وبننقذ العرايس في الوقت الضيّق وبنشحن لكل المحافظات.",
  keywords: [
    "زغروطة", "Zaghroutaa", "كتب كتاب", "منديل كتب كتاب", "بصمة العروسة",
    "مراية العروسة", "بوكيه برايد", "هاند ميد", "العروسة", "الفرح",
  ],
  authors: [{ name: "زُغْرُوطَة" }],
  openGraph: {
    type: "website",
    locale: "ar_EG",
    url: siteUrl,
    siteName: "زُغْرُوطَة",
    title: "زُغْرُوطَة | كل حاجة تخص العروسة وكتب الكتاب والفرح",
    description:
      "قطع العروسة الهاند ميد المميزة — مناديل كتب الكتاب، البصمات، المرايات والبوكيهات. عشان العروسة تكون مختلفة في يومها.",
    images: [{ url: "/logo.png", width: 1200, height: 1200, alt: "زُغْرُوطَة" }],
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
