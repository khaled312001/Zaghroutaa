/** إعدادات الحجز المستعجل: أي أوردر مناسبته خلال 3 أيام أو أقل = «مستعجل» + رسوم 200ج */
export const RUSH_DAYS = 3;
export const RUSH_FEE = 200;

/** كام يوم فاضل على المناسبة (null لو مفيش/تاريخ غلط) — يقبل "YYYY-MM-DD" أو ISO */
export function rushDaysLeft(dateStr?: string | null): number | null {
  if (!dateStr) return null;
  const d = dateStr.length <= 10 ? dateStr + "T00:00:00" : dateStr;
  const target = new Date(d);
  if (Number.isNaN(target.getTime())) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - now.getTime()) / 86_400_000);
}

/** أوردر مستعجل؟ (المناسبة خلال RUSH_DAYS أيام أو أقل، ولسه مجتش) */
export function isRushDate(dateStr?: string | null): boolean {
  const days = rushDaysLeft(dateStr);
  return days !== null && days >= 0 && days <= RUSH_DAYS;
}
