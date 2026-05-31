/**
 * سر توقيع جلسة الأدمن — مشترك بين auth.ts والـ middleware.
 * لو السر مفقود أو قصير، بنوقف فورًا بدل ما نشتغل بسر معروف (أمان).
 * (مفيش "server-only" هنا عشان الـ middleware يقدر يستوردها على الـ edge)
 */
const raw = process.env.AUTH_SECRET;

if (!raw || raw.length < 16) {
  throw new Error(
    "AUTH_SECRET مفقود أو قصير جدًا — لازم تحطي قيمة عشوائية طويلة (32 حرف أو أكتر) في ملف .env",
  );
}

export const authSecret = new TextEncoder().encode(raw);
