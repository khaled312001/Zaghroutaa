import manifestJson from "./manifest.json";
import curationJson from "./curation.json";

/**
 * ===========================================================================
 *  كتالوج زُغْرُوطَة — مصدر الحقيقة الوحيد للمنتجات
 *  - الميتاداتا (الأسماء/الأسعار/الوصف/الخيارات) مكتوبة هنا يدويًا
 *  - أسماء ملفات الصور بتيجي من manifest.json (اللي اتولّد من الصور)
 *  - الترتيب/الكوفر بيتظبطوا من curation (لو متوفّر) عبر الحقول cover/imageOrder/hide
 *  - نفس الملف ده بيستخدمه seed عشان يملا قاعدة البيانات
 * ===========================================================================
 */

export type Variant = {
  nameAr: string;
  price: number;
  oldPrice?: number;
};

export type Category = {
  slug: string;
  nameAr: string;
  emoji?: string;
  order: number;
};

export type ProductMeta = {
  slug: string;
  nameAr: string;
  categorySlug: string;
  basePrice: number;
  oldPrice?: number;
  shortAr: string;
  descriptionAr: string;
  features?: string[];
  variants?: Variant[];
  badge?: string;
  isPackage?: boolean;
  isFeatured?: boolean;
  order?: number;
  // تحكّم الصور (بيتملا من نتيجة الـ curation)
  cover?: string;
  imageOrder?: string[];
  hide?: string[];
  // لمنتجات بتجمّع صور من مجلدات تانية (زي الباكدج)
  imagePaths?: string[];
};

export type ProductImage = { url: string; alt: string };

export type Product = Omit<ProductMeta, "cover" | "imageOrder" | "hide" | "imagePaths"> & {
  cover: string;
  images: ProductImage[];
  category?: Category;
  caption?: string;
};

const manifest = manifestJson as {
  products: Record<string, string[]>;
  reviews: string[];
  gallery: string[];
};

type Curation = { slug: string; cover: string; ordered: string[]; drop: string[]; captionAr?: string };
const curationBySlug = new Map<string, Curation>(
  (curationJson as Curation[]).map((c) => [c.slug, c]),
);

/* ----------------------------- التصنيفات ----------------------------- */
export const CATEGORIES: Category[] = [
  { slug: "packages", nameAr: "باكدجات العروسة", emoji: "👑", order: 0 },
  { slug: "handkerchiefs", nameAr: "مناديل كتب الكتاب", emoji: "🤍", order: 1 },
  { slug: "fingerprints", nameAr: "بصمات وتابلوهات", emoji: "🖼️", order: 2 },
  { slug: "mirrors", nameAr: "مرايات العروسة", emoji: "✨", order: 3 },
  { slug: "bouquets", nameAr: "بوكيهات الورد", emoji: "💐", order: 4 },
  { slug: "accessories", nameAr: "إكسسوارات العروسة", emoji: "💍", order: 5 },
  { slug: "photoshoot", nameAr: "قطع الفوتوسيشن", emoji: "📸", order: 6 },
  { slug: "footwear", nameAr: "كروكس وسليبر", emoji: "🥿", order: 7 },
  { slug: "sleepwear", nameAr: "روب وبجامة", emoji: "🪶", order: 8 },
];

/* ----------------------------- المنتجات ----------------------------- */
export const PRODUCTS: ProductMeta[] = [
  {
    slug: "bridal-package",
    nameAr: "باكدج العروسة الكامل",
    categorySlug: "packages",
    basePrice: 1500,
    shortAr: "كل حاجة العروسة محتاجاها يوم كتب الكتاب في باكدج واحدة فخمة.",
    descriptionAr:
      "الباكدج الأكثر طلبًا في زُغْرُوطَة — مجهّزة بالكامل عشان العروسة تكون مختلفة في يومها. الباكدج بتتعمل بالملي وبأعلى جودة تقفيل وتشطيب.",
    features: [
      "منديل كتب كتاب ملكي مطرّز بالاسم والتاريخ",
      "تابلوه بصمة أكريليك شيك جدًا (أو زجاج مرايه بصمة أو خشب)",
      "مراية العروسة المرصّعة باللؤلؤ والورد والكريستال",
      "هدية: نظارة برايد",
      "قلم كتب كتاب للعريس والعروسة مطرّز",
      "متاح إضافة أي بوكيه ورد برايد جاهز أو هاند ميد",
    ],
    badge: "الأكثر طلبًا",
    isPackage: true,
    isFeatured: true,
    order: 0,
    imagePaths: [
      "/products/katb-ketab-handkerchief/katb-ketab-handkerchief-02.jpg",
      "/products/bridal-mirror/bridal-mirror-06.jpg",
      "/products/katb-ketab-fingerprint/katb-ketab-fingerprint-04.jpg",
      "/products/bridal-glasses/bridal-glasses-05.jpg",
      "/products/wedding-pens/wedding-pens-03.jpg",
      "/products/strass-bouquets/strass-bouquets-04.jpg",
    ],
  },
  {
    slug: "katb-ketab-handkerchief",
    nameAr: "منديل كتب كتاب ملكي هاند ميد",
    categorySlug: "handkerchiefs",
    basePrice: 650,
    shortAr: "منديل كتب كتاب ملكي مطرّز بالاسم والتاريخ بالخرز واللؤلؤ.",
    descriptionAr:
      "قطعة العمر — منديل كتب الكتاب هاند ميد بالكامل، مطرّز بإيدينا بالخرز واللؤلؤ والورد باسم العروسين وتاريخ كتب الكتاب. تشطيب نضيف ومتقن مفيش زيه، يفضل ذكرى تتحفظ مدى العمر.",
    features: ["تطريز هاند ميد بالاسم والتاريخ", "خرز ولؤلؤ وورد", "حواف دانتيل ناعمة"],
    badge: "الأكثر طلبًا",
    isFeatured: true,
    order: 1,
  },
  {
    slug: "strass-handkerchief",
    nameAr: "منديل كتب كتاب بالاستراس",
    categorySlug: "handkerchiefs",
    basePrice: 650,
    shortAr: "منديل هاند ميد مطرّز بالاستراس اللؤلؤي اللامع.",
    descriptionAr:
      "منديل كتب كتاب هاند ميد مطرّز بالاستراس واللؤلؤ باسم العروسين والتاريخ. لمعة راقية وتشطيب مظبوط بالملي يليق بيوم العمر.",
    features: ["استراس ولؤلؤ لامع", "تطريز بالاسم والتاريخ", "شغل هاند ميد"],
    badge: "هاند ميد",
    isFeatured: true,
    order: 2,
  },
  {
    slug: "printed-handkerchief",
    nameAr: "منديل كتب كتاب طباعة",
    categorySlug: "handkerchiefs",
    basePrice: 450,
    shortAr: "منديل كتب كتاب بالطباعة باسم العروسين والتاريخ بشكل شيك.",
    descriptionAr:
      "منديل كتب كتاب بالطباعة الراقية باسم العروسين وتاريخ كتب الكتاب — شكل شيك وأنيق بسعر اقتصادي مناسب لكل العرايس.",
    order: 11,
  },
  {
    slug: "katb-ketab-fingerprint",
    nameAr: "تابلوه بصمة كتب الكتاب",
    categorySlug: "fingerprints",
    basePrice: 550,
    shortAr: "تابلوه بصمة أكريليك/زجاج شيك جدًا باسم العروسين والتاريخ.",
    descriptionAr:
      "تابلوه بصمة كتب الكتاب — أكريليك أو زجاج مرايه، مكتوب عليه اسم العروسين وتاريخ كتب الكتاب مع تشكيلة ورد وخرز حوالين البصمة. تحفة تتعلّق وتفضل ذكرى.",
    features: ["خامة أكريليك أو زجاج مرايه", "اسم العروسين والتاريخ", "تشكيل ورد وخرز"],
    isFeatured: true,
    order: 4,
  },
  {
    slug: "fingerprint-handmade-deluxe",
    nameAr: "تابلوه بصمة هاند ميد بالبرواز",
    categorySlug: "fingerprints",
    basePrice: 600,
    shortAr: "تابلوه بصمة فاخر هاند ميد بالكامل مع البرواز.",
    descriptionAr:
      "تابلوه بصمة هاند ميد بالكامل مع البرواز — تشكيل ورد وخرز يدوي حوالين البصمة، باسم العروسين والتاريخ. شغل متقن وفخم يليق بمدخل الفرح أو ركن الكتب.",
    badge: "هاند ميد",
    isFeatured: true,
    order: 5,
  },
  {
    slug: "framed-fingerprint",
    nameAr: "تابلوه بصمة بالبرواز",
    categorySlug: "fingerprints",
    basePrice: 400,
    shortAr: "تابلوه بصمة شيك بالبرواز باسم العروسين والتاريخ.",
    descriptionAr:
      "تابلوه بصمة أنيق بالبرواز باسم العروسين وتاريخ كتب الكتاب — شكل راقي وبسعر مميز، اختيار حلو للعروسة اللي عايزة قطعة شيك ومرتبة.",
    order: 12,
  },
  {
    slug: "fingerprint-book",
    nameAr: "كتاب بصمات وتوقيعات الضيوف",
    categorySlug: "fingerprints",
    basePrice: 750,
    shortAr: "كتاب بصمات وتوقيعات لضيوف الفرح كذكرى تفضل.",
    descriptionAr:
      "كتاب يجمع بصمات وتوقيعات وكلمات ضيوف الفرح كذكرى جميلة تفضل مع العروسين. متاح طباعة أو هاند ميد بتشطيب فخم.",
    order: 13,
  },
  {
    slug: "bridal-mirror",
    nameAr: "مراية العروسة المرصّعة",
    categorySlug: "mirrors",
    basePrice: 300,
    shortAr: "مراية العروسة المرصّعة باللؤلؤ والكريستال والورد.",
    descriptionAr:
      "مراية العروسة المرصّعة باللؤلؤ والكريستال والورد — تحفة هاند ميد تليق بإطلالتك وتبان شيك جدًا في الصور وعلى التسريحة.",
    features: ["ترصيع لؤلؤ وكريستال", "شغل هاند ميد", "تنفع للتسريحة وللصور"],
    isFeatured: true,
    order: 6,
  },
  {
    slug: "mirror-stand",
    nameAr: "مراية استاند للعروسة",
    categorySlug: "mirrors",
    basePrice: 450,
    shortAr: "مراية استاند مزخرفة للزينة والتسريحة والصور.",
    descriptionAr:
      "مراية استاند مزخرفة باللؤلؤ والورد — تنفع للتسريحة وركن الزينة وللفوتوسيشن. شكل فخم يضيف لمسة راقية لأوضة العروسة.",
    order: 14,
  },
  {
    slug: "strass-bouquets",
    nameAr: "بوكيه استراس هاند ميد",
    categorySlug: "bouquets",
    basePrice: 1100,
    shortAr: "بوكيه فخم بالكامل هاند ميد مرصّع بالاستراس اللامع.",
    descriptionAr:
      "بوكيه العروسة الفخم — هاند ميد بالكامل ومرصّع بالاستراس اللامع. تحفة في إيد العروسة وبتخطف العين في كل الصور، ومش بيذبل زي الورد الطبيعي.",
    badge: "فخم",
    isFeatured: true,
    order: 7,
  },
  {
    slug: "bridal-bouquets",
    nameAr: "بوكيه برايد مميز",
    categorySlug: "bouquets",
    basePrice: 850,
    shortAr: "بوكيهات برايد بتشكيلات ورد وخرز مميزة.",
    descriptionAr:
      "بوكيهات برايد بتشكيلات ورد وخرز راقية ومسكة مزيّنة — اختيارات متنوعة تناسب ذوق كل عروسة وتكمّل إطلالتها.",
    order: 9,
  },
  {
    slug: "rose-bouquet",
    nameAr: "بوكيه ورد ساتان كلاسيك",
    categorySlug: "bouquets",
    basePrice: 550,
    shortAr: "بوكيه ورد ساتان أبيض بالكريستال والدانتيل.",
    descriptionAr:
      "بوكيه ورد ساتان أبيض كلاسيك بالكريستال والدانتيل ومسكة ساتان — ناعم وراقي ومناسب للعروسة اللي بتحب اللوك الكلاسيكي النضيف.",
    order: 10,
  },
  {
    slug: "feather-fans",
    nameAr: "مروحة الفوتوسيشن بالريش",
    categorySlug: "photoshoot",
    basePrice: 250,
    shortAr: "مروحة راقية بالريش والدانتيل بتخطف العين في الصور.",
    descriptionAr:
      "مراوح الفوتوسيشن الراقية بالريش والدانتيل — بتدّي صور العروسة لمسة فخامة وأناقة وبتبان تحفة في كل لقطة.",
    isFeatured: true,
    order: 8,
  },
  {
    slug: "pearl-tulip-crown",
    nameAr: "طوق اللؤلؤ بالتوليب الأبيض",
    categorySlug: "photoshoot",
    basePrice: 550,
    shortAr: "طوق ورد توليب أبيض مع اللؤلؤ، تاج ناعم للصور.",
    descriptionAr:
      "طوق من ورد التوليب الأبيض مع اللؤلؤ — تاج ناعم وراقي يليق بصور العروسة والفوتوسيشن ويدّي إطلالة ملكية.",
    order: 15,
  },
  {
    slug: "pearl-crocs",
    nameAr: "كروكس مرصّع باللؤلؤ",
    categorySlug: "footwear",
    basePrice: 500,
    shortAr: "كروكس مريح ومرصّع باللؤلؤ والتشارمز الهاند ميد.",
    descriptionAr:
      "كروكس العروسة المرصّع باللؤلؤ والتشارمز الهاند ميد — شياكة وراحة في نفس الوقت، مثالي ليوم الفرح الطويل وللصور.",
    badge: "هاند ميد",
    isFeatured: true,
    order: 3,
  },
  {
    slug: "bridal-slippers",
    nameAr: "سليبر العريس والعروسة",
    categorySlug: "footwear",
    basePrice: 170,
    shortAr: "سليبر مطرّز مريح للعريس والعروسة يكمّل الطقم.",
    descriptionAr:
      "سليبر مطرّز مريح للعريس والعروسة — تكملة شيك للطقم ولحظات الاستعداد. متاح فردي أو طقم للاتنين.",
    variants: [
      { nameAr: "للعريس أو العروسة", price: 170 },
      { nameAr: "الاتنين مع بعض", price: 300 },
    ],
    order: 17,
  },
  {
    slug: "wedding-pens",
    nameAr: "أقلام كتب الكتاب المطرّزة",
    categorySlug: "accessories",
    basePrice: 150,
    oldPrice: 200,
    shortAr: "طقم قلمين مطرّزين لتوقيع كتب الكتاب.",
    descriptionAr:
      "طقم قلمين كتب كتاب مطرّزين للعريس والعروسة — يكمّلوا شياكة الطقم وبيبانوا تحفة في صور التوقيع.",
    variants: [{ nameAr: "الاتنين مع بعض", price: 150, oldPrice: 200 }],
    badge: "عرض",
    order: 18,
  },
  {
    slug: "bridal-glasses",
    nameAr: "نظارة البرايد",
    categorySlug: "accessories",
    basePrice: 180,
    shortAr: "نظارة برايد شيك للصور والاستقبال.",
    descriptionAr:
      "نظارة البرايد الشيك — تكملة لإطلالة العروسة في الصور والاستقبال، وبتدّي لوك عصري ومميز.",
    variants: [
      { nameAr: "نظارة واحدة", price: 180 },
      { nameAr: "الاتنين مع بعض", price: 300 },
    ],
    order: 16,
  },
  {
    slug: "veil-clip",
    nameAr: "توكة البرايد بالطرحة",
    categorySlug: "accessories",
    basePrice: 250,
    oldPrice: 350,
    shortAr: "توكة شعر للعروسة بالطرحة، لمسة نهائية لإطلالتك.",
    descriptionAr:
      "توكة البرايد بالطرحة — لمسة نهائية ناعمة لإطلالة العروسة، شغل راقي ومظبوط بسعر عرض مميز.",
    badge: "عرض",
    order: 19,
  },
  {
    slug: "bride-mug",
    nameAr: "مج البرايد بالشاليموه",
    categorySlug: "accessories",
    basePrice: 250,
    shortAr: "مج برايد باسم العروسة مع الشاليموه، هدية لطيفة وعملية.",
    descriptionAr:
      "مج البرايد باسم العروسة مع الشاليموه بتاعته — هدية لطيفة وعملية وذكرى حلوة من يوم العمر.",
    order: 20,
  },
  {
    slug: "bridal-robe",
    nameAr: "روب العروسة والعريس",
    categorySlug: "sleepwear",
    basePrice: 500,
    shortAr: "روب ساتان ناعم يتطرّز بالاسم، متاح بالريش للعروسة.",
    descriptionAr:
      "روب ساتان ناعم قابل للتطريز بالاسم — مثالي لصور الاستعداد ولمسة فخامة قبل الفرح. متاح بالريش للعروسة وكطقم للاتنين بسعر مميز.",
    variants: [
      { nameAr: "روب للعريس أو العروسة", price: 500 },
      { nameAr: "روب العروسة بالريش", price: 650 },
      { nameAr: "الاتنين مع بعض", price: 900, oldPrice: 1000 },
    ],
    order: 21,
  },
  {
    slug: "satin-pajamas",
    nameAr: "بجامة العريس والعروسة ستان",
    categorySlug: "sleepwear",
    basePrice: 650,
    shortAr: "بجامة ستان فخمة قابلة للتطريز، متاحة بالريش وأطقم.",
    descriptionAr:
      "بجامة ستان فخمة قابلة للتطريز بالاسم — متاحة للعريس وللعروسة بأطقم قطعتين أو ٣ قطع مع توب، وكمان نسخة بالريش للعروسة. ناعمة وشيك لصور الاستعداد.",
    variants: [
      { nameAr: "بجامة العريس ستان", price: 650 },
      { nameAr: "بجامة العروسة قطعتين", price: 650 },
      { nameAr: "العروسة ٣ قطع مع توب", price: 750 },
      { nameAr: "العروسة قطعتين أو ٣ قطع بالريش", price: 850, oldPrice: 1000 },
    ],
    order: 22,
  },
];

/* ----------------------------- المساعدات ----------------------------- */

// تحويل الأرقام للأرقام العربية الهندية
export function toArabicDigits(input: number | string): string {
  const map = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return String(input).replace(/[0-9]/g, (d) => map[Number(d)]);
}

export function formatPrice(value: number): string {
  return `${toArabicDigits(value.toLocaleString("en-US"))} جنيه`;
}

const categoryBySlug = new Map(CATEGORIES.map((c) => [c.slug, c]));

function resolveImages(p: ProductMeta): ProductImage[] {
  const cur = curationBySlug.get(p.slug);
  const alt = cur?.captionAr || p.nameAr;
  if (p.imagePaths && p.imagePaths.length) {
    return p.imagePaths.map((url) => ({ url, alt: p.nameAr }));
  }
  let files = [...(manifest.products[p.slug] ?? [])];
  const drop = p.hide ?? cur?.drop;
  if (drop?.length) files = files.filter((f) => !drop.includes(f));
  const order = p.imageOrder ?? cur?.ordered;
  if (order?.length) {
    const head = order.filter((f) => files.includes(f));
    const rest = files.filter((f) => !head.includes(f));
    files = [...head, ...rest];
  }
  return files.map((f) => ({ url: `/products/${p.slug}/${f}`, alt }));
}

function resolveCover(p: ProductMeta, images: ProductImage[]): string {
  if (p.imagePaths && p.imagePaths.length) return p.imagePaths[0];
  if (p.cover) return `/products/${p.slug}/${p.cover}`;
  const cur = curationBySlug.get(p.slug);
  if (cur?.cover) return `/products/${p.slug}/${cur.cover}`;
  return images[0]?.url ?? "/logo.png";
}

export function buildProduct(p: ProductMeta): Product {
  const images = resolveImages(p);
  const cover = resolveCover(p, images);
  const { cover: _c, imageOrder: _o, hide: _h, imagePaths: _p, ...rest } = p;
  return {
    ...rest,
    cover,
    images: images.length ? images : [{ url: cover, alt: p.nameAr }],
    category: categoryBySlug.get(p.categorySlug),
    caption: curationBySlug.get(p.slug)?.captionAr,
  };
}

export function getAllProducts(): Product[] {
  return PRODUCTS.map(buildProduct).sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
}

export function getProductBySlug(slug: string): Product | undefined {
  const meta = PRODUCTS.find((p) => p.slug === slug);
  return meta ? buildProduct(meta) : undefined;
}

export function getFeaturedProducts(): Product[] {
  return getAllProducts().filter((p) => p.isFeatured);
}

export function getProductsByCategory(categorySlug: string): Product[] {
  return getAllProducts().filter((p) => p.categorySlug === categorySlug);
}

export function getCategoriesWithCounts(): (Category & { count: number })[] {
  const all = getAllProducts();
  return [...CATEGORIES]
    .sort((a, b) => a.order - b.order)
    .map((c) => ({ ...c, count: all.filter((p) => p.categorySlug === c.slug).length }));
}

export const REVIEW_IMAGES = manifest.reviews.map((f) => `/reviews/${f}`);
export const GALLERY_IMAGES = manifest.gallery.map((f) => `/gallery/${f}`);
