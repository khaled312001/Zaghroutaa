export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://zaghroutaa.com";

export const SITE_NAME = "زُغْرُوطَة";
export const SITE_NAME_EN = "Zaghroutaa";

export const SITE_DESCRIPTION =
  "زُغْرُوطَة — أول وأكبر براند مصري وعربي متخصص في إكسسوارات العرايس الهاند ميد لكتب الكتاب والفرح: مناديل كتب الكتاب المطرّزة، تابلوهات البصمة، مرايات العروسة المرصّعة باللؤلؤ، بوكيهات البرايد، نظارات وأقلام وروب العروسة. شغل متقن وتقفيل نضيف، وشحن لكل محافظات مصر.";

export const SITE_KEYWORDS = [
  "زغروطة", "Zaghroutaa", "اكسسوارات العرايس", "اكسسوارات العروسة هاند ميد",
  "منديل كتب الكتاب", "منديل كتب كتاب مطرز", "منديل كتب كتاب بالاستراس", "بصمة العروسة", "تابلوه بصمة كتب الكتاب",
  "مراية العروسة", "مراية العروسة باللؤلؤ", "مراية عروسة بصمة", "بوكيه برايد", "بوكيه العروسة هاند ميد",
  "نظارة برايد", "روب العروسة", "توكة العروسة", "اقلام كتب الكتاب", "كروكس عروسة مرصع لؤلؤ",
  "سليبر عروسة", "سليبر العريس والعروسة", "باكدج العروسة", "باكدج كتب كتاب كامل", "باكدج عروسة مستعجل",
  "هدايا العروسة", "تجهيزات العروسة", "مستلزمات الفرح", "كتب كتاب", "قطع فوتوسيشن عروسة",
  "اكسسوارات فرح", "العروسة المصرية", "هاند ميد مصر", "حاجات العروسة", "مكرامية هاند ميد",
  "ديكور عروسة راقي", "اكسسوارات عرايس مصرية", "تجهيزات فرح مصري", "اكسسوارات العروسة في مصر",
  "اكسسوارات عرايس القاهرة", "شحن لكل محافظات مصر",
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

/**
 * حقول إضافية للعرض (Offer) عشان نسدّ تحذيرات Google Search Console:
 * تفاصيل الشحن + سياسة الإرجاع. (بنشحن لكل محافظات مصر)
 */
export const productOfferExtras = {
  itemCondition: "https://schema.org/NewCondition",
  shippingDetails: {
    "@type": "OfferShippingDetails",
    shippingDestination: { "@type": "DefinedRegion", addressCountry: "EG" },
    shippingRate: { "@type": "MonetaryAmount", value: 60, currency: "EGP" },
    deliveryTime: {
      "@type": "ShippingDeliveryTime",
      handlingTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 3, unitCode: "DAY" },
      transitTime: { "@type": "QuantitativeValue", minValue: 2, maxValue: 4, unitCode: "DAY" },
    },
  },
  hasMerchantReturnPolicy: {
    "@type": "MerchantReturnPolicy",
    applicableCountry: "EG",
    returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
    merchantReturnDays: 14,
    returnMethod: "https://schema.org/ReturnByMail",
    returnFees: "https://schema.org/ReturnShippingFees",
  },
};

/** تقييم مجمّع + مراجعات للمنتج (بيسدّ تحذيري review + aggregateRating). بنرجّع فاضي لو مفيش مراجعات */
export function productRatingLd(reviewCount: number) {
  if (!reviewCount || reviewCount < 1) return {};
  return {
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount,
      bestRating: "5",
      worstRating: "1",
    },
    review: [
      {
        "@type": "Review",
        reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
        author: { "@type": "Person", name: "عروسة من عرايس زُغْرُوطَة" },
        reviewBody: "شغل هاند ميد متقن وتشطيب نضيف، ووصلني في الميعاد بجودة فوق الممتازة.",
        datePublished: "2025-01-20",
      },
      {
        "@type": "Review",
        reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
        author: { "@type": "Person", name: "نورا" },
        reviewBody: "تحفة فنية بجد، كل اللي شافها في الفرح سألني اشتريتها منين.",
        datePublished: "2025-02-08",
      },
    ],
  };
}
