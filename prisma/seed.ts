import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  CATEGORIES,
  PRODUCTS,
  buildProduct,
  REVIEW_IMAGES,
} from "../src/data/catalog";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 جاري تجهيز قاعدة بيانات زُغْرُوطَة...");

  // ---------- التصنيفات ----------
  const catId: Record<string, number> = {};
  for (const c of CATEGORIES) {
    const row = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { nameAr: c.nameAr, emoji: c.emoji ?? null, order: c.order },
      create: { slug: c.slug, nameAr: c.nameAr, emoji: c.emoji ?? null, order: c.order },
    });
    catId[c.slug] = row.id;
  }
  console.log(`✓ التصنيفات: ${CATEGORIES.length}`);

  // ---------- المنتجات ----------
  for (const meta of PRODUCTS) {
    const p = buildProduct(meta);
    const data = {
      nameAr: p.nameAr,
      shortAr: p.shortAr ?? null,
      descriptionAr: p.descriptionAr ?? null,
      basePrice: p.basePrice,
      oldPrice: p.oldPrice ?? null,
      categoryId: catId[p.categorySlug] ?? null,
      coverImage: p.cover,
      isPackage: !!p.isPackage,
      isFeatured: !!p.isFeatured,
      isActive: true,
      badge: p.badge ?? null,
      order: p.order ?? 0,
    };
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: data,
      create: { slug: p.slug, ...data },
    });

    // الصور — نعيد بناءها من الكتالوج
    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    if (p.images.length) {
      await prisma.productImage.createMany({
        data: p.images.map((img, i) => ({
          productId: product.id,
          url: img.url,
          alt: img.alt,
          order: i,
        })),
      });
    }

    // الخيارات
    await prisma.productVariant.deleteMany({ where: { productId: product.id } });
    if (p.variants?.length) {
      await prisma.productVariant.createMany({
        data: p.variants.map((v, i) => ({
          productId: product.id,
          nameAr: v.nameAr,
          price: v.price,
          oldPrice: v.oldPrice ?? null,
          order: i,
        })),
      });
    }
  }
  console.log(`✓ المنتجات: ${PRODUCTS.length}`);

  // ---------- الأدمن (إيمان) ----------
  const email = process.env.ADMIN_EMAIL || "eman@zaghroutaa.com";
  const password = process.env.ADMIN_PASSWORD || "Zaghroutaa@2026";
  const name = process.env.ADMIN_NAME || "إيمان";
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.adminUser.upsert({
    where: { email },
    update: { name, passwordHash },
    create: { email, name, passwordHash },
  });
  console.log(`✓ حساب الأدمن: ${email}`);

  // ---------- الإعدادات ----------
  // update فاضي عشان ما نمسحش تعديلات الأدمن لو أعدنا التشغيل
  const settings: Record<string, string> = {
    whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "201000000000",
    instagram: "",
    tiktok: "",
    facebook: "",
    phone: "",
    email,
    depositNote: "بنأكّد الحجز بعد دفع ديبوزت بسيط، والباقي عند الاستلام.",
    announcement: "بننقذ العرايس في الوقت الضيّق — وبنشحن لكل المحافظات بأمان وسرعة 💕",
  };
  for (const [key, value] of Object.entries(settings)) {
    await prisma.setting.upsert({
      where: { key },
      update: {},
      create: { key, value },
    });
  }
  console.log("✓ الإعدادات");

  // ---------- آراء العملاء ----------
  const reviewsCount = await prisma.review.count();
  if (reviewsCount === 0 && REVIEW_IMAGES.length) {
    await prisma.review.createMany({
      data: REVIEW_IMAGES.map((url, i) => ({
        imageUrl: url,
        isActive: true,
        order: i,
      })),
    });
    console.log(`✓ آراء العملاء: ${REVIEW_IMAGES.length}`);
  } else {
    console.log(`• آراء العملاء موجودة بالفعل (${reviewsCount})`);
  }

  console.log("✅ تم تجهيز قاعدة البيانات بنجاح");
}

main()
  .catch((e) => {
    console.error("❌ خطأ في الـ seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
