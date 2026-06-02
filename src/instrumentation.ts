/**
 * بيتنفّذ مرة واحدة عند تشغيل سيرفر الموقع.
 * بنحمي الموقع من إن أي خطأ غير متوقّع (خصوصًا من محرّك الواتساب Baileys
 * اللي بيشتغل في الخلفية) يوقّع التطبيق كله — بنسجّله بس ومنكمّلش.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  process.on("unhandledRejection", (reason) => {
    console.error("[unhandledRejection]", reason instanceof Error ? reason.message : reason);
  });

  process.on("uncaughtException", (err) => {
    console.error("[uncaughtException]", err instanceof Error ? err.message : err);
  });
}
