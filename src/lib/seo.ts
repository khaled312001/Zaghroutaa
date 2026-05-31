export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://zaghroutaa.com";

export const SITE_NAME = "زُغْرُوطَة";
export const SITE_NAME_EN = "Zaghroutaa";

export const SITE_DESCRIPTION =
  "زُغْرُوطَة — أول وأكبر براند مصري وعربي متخصص في إكسسوارات العرايس الهاند ميد لكتب الكتاب والفرح: مناديل كتب الكتاب المطرّزة، تابلوهات البصمة، مرايات العروسة المرصّعة باللؤلؤ، بوكيهات البرايد، نظارات وأقلام وروب العروسة. شغل متقن وتقفيل نضيف، وشحن لكل محافظات مصر.";

export const SITE_KEYWORDS = [
  "زغروطة", "Zaghroutaa", "اكسسوارات العرايس", "اكسسوارات العروسة هاند ميد",
  "منديل كتب الكتاب", "منديل كتب كتاب مطرز", "بصمة العروسة", "تابلوه بصمة كتب الكتاب",
  "مراية العروسة", "مراية العروسة باللؤلؤ", "بوكيه برايد", "بوكيه العروسة هاند ميد",
  "نظارة برايد", "روب العروسة", "توكة العروسة", "اقلام كتب الكتاب",
  "هدايا العروسة", "تجهيزات العروسة", "مستلزمات الفرح", "كتب كتاب",
  "اكسسوارات فرح", "العروسة المصرية", "هاند ميد مصر", "حاجات العروسة",
];

/** بيانات المنظمة (Organization) لمحركات البحث */
export function organizationSchema(opts?: {
  whatsappNumber?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
}) {
  const sameAs = [opts?.instagram, opts?.facebook, opts?.tiktok].filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@type": "Store",
    name: SITE_NAME,
    alternateName: SITE_NAME_EN,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    image: `${SITE_URL}/pages/about.png`,
    description: SITE_DESCRIPTION,
    priceRange: "EGP",
    areaServed: { "@type": "Country", name: "Egypt" },
    address: { "@type": "PostalAddress", addressCountry: "EG" },
    ...(opts?.whatsappNumber
      ? {
          contactPoint: {
            "@type": "ContactPoint",
            telephone: `+${opts.whatsappNumber}`,
            contactType: "sales",
            areaServed: "EG",
            availableLanguage: ["Arabic"],
          },
        }
      : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    alternateName: SITE_NAME_EN,
    url: SITE_URL,
    inLanguage: "ar-EG",
  };
}
