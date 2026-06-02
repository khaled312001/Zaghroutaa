/**
 * عامل إرسال تنبيهات واتساب لزُغْرُوطَة.
 *
 * بيشتغل على VPS 24/7:
 *  1) بيربط رقم واتساب التنبيهات (مسح QR مرة واحدة).
 *  2) كل دقيقة بيسأل الموقع عن التذكيرات المستحقة (/api/wa/outbox).
 *  3) بيبعتها بالواتساب لرقم الشغل، وبيرجّع النتيجة للموقع.
 *  4) بيبلّغ الموقع بحالته (متصل / محتاج QR) عشان تبان في لوحة التحكم.
 *
 * مش بيشتغل على الاستضافة المشتركة — لازم VPS (أو جهاز فاضل شغّال طول الوقت).
 */
require("dotenv").config();
const wppconnect = require("@wppconnect-team/wppconnect");
const axios = require("axios");

const SITE_URL = (process.env.SITE_URL || "https://zaghroutaa.com").replace(/\/$/, "");
const TOKEN = process.env.WA_WORKER_TOKEN || "";
const SESSION = process.env.SESSION_NAME || "zaghroutaa";
const POLL_SECONDS = Number(process.env.POLL_SECONDS || 60);
const SEND_GAP_MS = Number(process.env.SEND_GAP_MS || 4000); // مسافة بين كل رسالة والتانية

if (!TOKEN) {
  console.error("✗ لازم تحطّي WA_WORKER_TOKEN في ملف .env (نفس القيمة اللي على الموقع)");
  process.exit(1);
}

const api = axios.create({
  baseURL: SITE_URL,
  timeout: 25000,
  headers: { Authorization: `Bearer ${TOKEN}` },
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const jitter = () => Math.floor(Math.random() * 2500); // عشوائية بسيطة تفادي السبام

async function postStatus(state, qr) {
  try {
    await api.post("/api/wa/status", { state, qr: qr || "" });
  } catch (e) {
    console.warn("status post failed:", e.message);
  }
}

let busy = false;

async function tick(client) {
  if (busy) return;
  busy = true;
  try {
    await postStatus("connected");

    const { data } = await api.get("/api/wa/outbox");
    const reminders = (data && data.reminders) || [];
    if (!reminders.length) return;

    console.log(`→ ${reminders.length} تذكير للإرسال`);
    const results = [];
    for (const r of reminders) {
      try {
        const chatId = `${String(r.to).replace(/\D/g, "")}@c.us`;
        await client.sendText(chatId, r.body);
        results.push({ id: r.id, ok: true });
        console.log(`  ✓ #${r.id} → ${r.to}`);
      } catch (err) {
        results.push({ id: r.id, ok: false, error: String(err && err.message ? err.message : err).slice(0, 200) });
        console.warn(`  ✗ #${r.id}:`, err && err.message ? err.message : err);
      }
      await sleep(SEND_GAP_MS + jitter());
    }
    await api.post("/api/wa/outbox", { results });
  } catch (e) {
    console.warn("tick error:", e.message);
  } finally {
    busy = false;
  }
}

function start(client) {
  console.log("✓ واتساب اتربط وجاهز للإرسال");
  postStatus("connected");

  client.onStateChange((state) => {
    console.log("state:", state);
    if (["CONFLICT", "UNPAIRED", "UNLAUNCHED"].includes(state)) {
      client.useHere().catch(() => {});
    }
    if (["DISCONNECTED", "UNPAIRED"].includes(state)) postStatus("disconnected");
  });

  tick(client);
  setInterval(() => tick(client), POLL_SECONDS * 1000);
}

console.log("⏳ بنشغّل واتساب... امسحي الـ QR (هيظهر هنا وكمان في لوحة التحكم).");

wppconnect
  .create({
    session: SESSION,
    headless: true,
    devtools: false,
    useChrome: false,
    puppeteerOptions: {
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    },
    catchQR: (base64Qr, asciiQR) => {
      if (asciiQR) console.log(asciiQR);
      postStatus("qr", base64Qr);
    },
    statusFind: (statusSession) => {
      console.log("session:", statusSession);
      if (statusSession === "desconnectedMobile" || statusSession === "notLogged") {
        postStatus("disconnected");
      }
    },
  })
  .then((client) => start(client))
  .catch((err) => {
    console.error("✗ فشل تشغيل واتساب:", err);
    postStatus("disconnected");
    process.exit(1);
  });
