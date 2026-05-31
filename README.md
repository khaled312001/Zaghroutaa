<div align="center">

# زُغْـرُوطَـة · Zaghroutaa

**كل حاجة تخص العروسة في كتب الكتاب والفرح — قطع هاند ميد مميزة.**

موقع متكامل (فرونت + باك + داشبورد أدمن) مبني بأحدث التقنيات.

</div>

---

## 🧱 التقنيات المستخدمة

| الطبقة | التقنية |
|---|---|
| الإطار | **Next.js 15** (App Router) + **React 19** |
| اللغة | **TypeScript** |
| التصميم | **Tailwind CSS** + تصميم عربي RTL |
| الأنيميشن | **Framer Motion** |
| قاعدة البيانات | **MySQL** عبر **Prisma ORM** |
| تسجيل الدخول | JWT (jose) + bcrypt + Middleware |
| الاستضافة | هوستنجر (Node.js) — دومين `zaghroutaa.com` |

---

## ✨ المميزات

- **واجهة عربية مصرية كاملة (RTL)** بتصميم فخم وأنيميشن حديث.
- **كتالوج منتجات** بأقسام، صفحات تفاصيل، صور مكبّرة، وخيارات (variants).
- **نظام حجز** بيجمع بيانات العروسة ويحوّلها على **الواتساب** برسالة جاهزة بضغطة واحدة، مع حفظ الطلب في قاعدة البيانات.
- **معرض أعمال** و**آراء عملاء** حقيقية.
- **داشبورد أدمن** كامل لإيمان:
  - نظرة عامة بالإحصائيات.
  - إدارة الطلبات (تغيير الحالة، تواصل واتساب، حذف).
  - إدارة المنتجات (سعر/خصم/شارة/ظهور/تمييز).
  - إدارة آراء العملاء (إظهار/إخفاء/إضافة/حذف).
  - الإعدادات (رقم الواتساب، السوشيال، نص الديبوزت...).

---

## 🚀 التشغيل محليًا

```bash
# 1) تنصيب الباكدجات
npm install

# 2) جهّزي ملف البيئة
cp .env.example .env.local   # وعدّلي القيم (DATABASE_URL, AUTH_SECRET, ...)

# 3) جهّزي قاعدة البيانات
npm run db:push     # ينشئ الجداول
npm run db:seed     # يملأها بالمنتجات + الأدمن + الإعدادات

# 4) شغّلي
npm run dev         # http://localhost:3000
```

> **لوحة الأدمن:** `/admin/login`
> الإيميل: `eman@zaghroutaa.com` — الباسورد هو اللي بتحطيه في `ADMIN_PASSWORD` بملف `.env`.
> (يُفضّل تغييره بعد أول دخول، وأعيدي `npm run db:seed` بعد أي تغيير).

---

## 🔑 متغيرات البيئة (`.env` / `.env.local`)

| المتغير | الوصف |
|---|---|
| `DATABASE_URL` | رابط اتصال MySQL (`mysql://user:pass@host:3306/db`) |
| `AUTH_SECRET` | سر توقيع جلسة الأدمن (عشوائي وطويل) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | بيانات حساب إيمان (تُزرع في الداتابيز) |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | رقم واتساب الحجز (بمفتاح الدولة، مثال: `201001234567`) |
| `NEXT_PUBLIC_SITE_URL` | رابط الموقع (`https://zaghroutaa.com`) |

> ⚠️ رقم الواتساب ممكن كمان تغيّريه من **لوحة الأدمن → الإعدادات** من غير ما تلمسي الكود.

---

## ☁️ النشر على هوستنجر (Node.js)

> الكود مرفوع على GitHub: `khaled312001/Zaghroutaa`. أسهل طريقة نشر هي عبر Git.

### 1) إنشاء تطبيق Node.js من hPanel
- ادخلي **hPanel → Advanced → Node.js** (أو "Setup Node.js App").
- اختاري: **Node version 18+** ، **Application root**: `domains/zaghroutaa.com/zaghroutaa` (مثلاً) ، **Application URL**: `zaghroutaa.com` ، **Startup file**: `server.js`.

### 2) رفع الكود على السيرفر (عبر SSH)
```bash
ssh -p 65002 u405809647@145.79.20.56

cd ~/domains/zaghroutaa.com
git clone https://github.com/khaled312001/Zaghroutaa.git zaghroutaa
cd zaghroutaa
```

### 3) ملف البيئة على السيرفر
```bash
cat > .env <<'EOF'
DATABASE_URL="mysql://u405809647_zaghroutaa:DB_PASSWORD_HERE@srv2123.hstgr.io:3306/u405809647_zaghroutaa"
AUTH_SECRET="ضعي-سر-عشوائي-طويل-هنا"
ADMIN_EMAIL="eman@zaghroutaa.com"
ADMIN_PASSWORD="ضع-باسورد-قوي-هنا"
NEXT_PUBLIC_WHATSAPP_NUMBER="201001234567"
NEXT_PUBLIC_SITE_URL="https://zaghroutaa.com"
EOF
```

### 4) التنصيب والبناء
```bash
npm install
npm run build
# قاعدة البيانات اتعملت بالفعل، لو محتاجة تعيدي البذر:
# npm run db:seed
```

### 5) التشغيل
- من **hPanel → Node.js** اضغطي **Restart**، أو من SSH داخل بيئة التطبيق:
```bash
npm run start    # أو: node server.js
```

- اربطي الدومين `zaghroutaa.com` بالتطبيق من نفس الشاشة.
- فعّلي **SSL** (Let's Encrypt) من hPanel.

> **VPS بديل (pm2):**
> ```bash
> npm install && npm run build
> npm i -g pm2
> pm2 start server.js --name zaghroutaa
> pm2 save && pm2 startup
> ```
> ثم وجّهي Nginx/Apache reverse-proxy من `zaghroutaa.com` إلى `localhost:3000`.

---

## 🗂️ هيكل المشروع

```
src/
├── app/
│   ├── (site)/          # الموقع العام (RTL)
│   ├── admin/           # لوحة التحكم (login + dashboard محمي)
│   └── api/orders/      # API حفظ الطلبات
├── components/          # مكوّنات الواجهة (هيرو، كروت، فورم الحجز...)
├── data/               # كتالوج المنتجات + manifest الصور + التنسيق
└── lib/                # prisma, auth, settings, whatsapp, utils
prisma/                 # schema + seed
public/products|reviews|gallery   # الصور
```

---

<div align="center">صُمّم بكل 💛 لعرايس مصر — زُغْرُوطَة</div>
