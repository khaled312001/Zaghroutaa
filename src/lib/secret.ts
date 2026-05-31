/**
 * سر توقيع جلسة الأدمن — مشترك بين auth.ts والـ middleware.
 * لو السر مفقود أو قصير، بنوقف فورًا بدل ما نشتغل بسر معروف (أمان).
 * (مفيش "server-only" هنا عشان الـ middleware يقدر يستوردها على الـ edge)
 *
 * ملاحظة: التحقق بيحصل بشكل lazy عشان ما يكسرش الـ build
 * لما AUTH_SECRET مش موجود وقت البناء (زي في CI/deployment).
 */
let _cached: Uint8Array | null = null;

export function getAuthSecret(): Uint8Array {
  if (_cached) return _cached;

  const raw = process.env.AUTH_SECRET;
  if (!raw || raw.length < 16) {
    throw new Error(
      "AUTH_SECRET مفقود أو قصير جدًا — لازم تحطي قيمة عشوائية طويلة (32 حرف أو أكتر) في ملف .env",
    );
  }

  _cached = new TextEncoder().encode(raw);
  return _cached;
}
