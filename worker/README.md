# عامل تنبيهات واتساب — زُغْرُوطَة

برنامج صغير بيشتغل على سيرفر VPS طول الوقت، بيربط رقم واتساب التنبيهات، وبيبعت التذكيرات اللي بيجهّزها الموقع تلقائيًا.

> ⚠️ مش بيشتغل على الاستضافة المشتركة (الموقع نفسه). لازم VPS أو جهاز فاضل شغّال ٢٤ ساعة، لأنه بيفتح متصفح Chrome في الخلفية.

---

## ١) المتطلبات

- سيرفر VPS لينكس (Ubuntu 22.04 يفضّل) — أي خطة صغيرة (1GB RAM) بتكفي.
- Node.js 18 أو أحدث.

## ٢) إعداد سريع (Ubuntu)

```bash
# تثبيت Node 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# مكتبات Chrome المطلوبة لـ puppeteer
sudo apt-get install -y libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 \
  libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 \
  libgbm1 libasound2 libpangocairo-1.0-0 libgtk-3-0 fonts-liberation

# انسخي مجلد worker على السيرفر، وبعدين:
cd worker
cp .env.example .env
nano .env          # حطّي WA_WORKER_TOKEN (نفس اللي على الموقع) و SITE_URL
npm install
```

## ٣) التوكن السري (WA_WORKER_TOKEN)

لازم يكون **نفس القيمة** في مكانين:

1. **على الموقع** (Hostinger): ضيفي السطر ده في ملف `.htaccess` بتاع الموقع:
   ```
   SetEnv WA_WORKER_TOKEN "نفس_التوكن_الطويل_العشوائي"
   ```
2. **في الـ worker**: في ملف `.env` هنا.

اختاري قيمة طويلة عشوائية (مثلاً ناتج `openssl rand -hex 24`).

## ٤) التشغيل لأول مرة (مسح الـ QR)

```bash
npm start
```

هيظهر QR في الشاشة (وكمان في لوحة تحكم الموقع: **التنبيهات الذكية**).
افتحي واتساب على **رقم التنبيهات** ← الأجهزة المرتبطة ← ربط جهاز ← امسحي الكود.
أول ما يتربط هيكتب «واتساب اتربط وجاهز» وحالته في اللوحة تبقى **متصل**.

## ٥) يفضل شغّال ٢٤/٧ (pm2)

```bash
sudo npm install -g pm2
pm2 start index.js --name zaghroutaa-wa
pm2 save
pm2 startup        # نفّذي الأمر اللي هيطلعلك عشان يشتغل بعد إعادة التشغيل
```

أوامر مفيدة:
```bash
pm2 logs zaghroutaa-wa     # تتابعي اللوج
pm2 restart zaghroutaa-wa  # إعادة تشغيل
pm2 stop zaghroutaa-wa     # إيقاف
```

## ٦) إزاي بيشتغل

- كل دقيقة بيسأل `GET /api/wa/outbox` على الموقع، بياخد التذكيرات الجاهزة ويبعتها.
- بعد الإرسال بيرجّع النتيجة على `POST /api/wa/outbox`.
- بيبعت نبضة حالته على `POST /api/wa/status` (عشان تبان متصل/محتاج QR في اللوحة).
- الجلسة بتتحفظ في مجلد `tokens/` فمش هتحتاجي تمسحي QR كل مرة.

## ملاحظة أمان

الإرسال من رقم واتساب شخصي عبر wppconnect بيخالف شروط واتساب وفيه احتمال إيقاف الرقم.
عشان كده بنستخدم **رقم مخصص للتنبيهات** ومسافات بين الرسائل. خلّي الرسائل معقولة في العدد.
