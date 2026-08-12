const WEEKDAY_JA = ["日", "月", "火", "水", "木", "金", "土"];

export function formatDateJa(date: Date): string {
  return `${date.getFullYear()}年 ${date.getMonth() + 1}月${date.getDate()}日（${WEEKDAY_JA[date.getDay()]}）`;
}

export function formatShortDate(date: Date): string {
  return `${date.getMonth() + 1}/${date.getDate()}（${WEEKDAY_JA[date.getDay()]}）`;
}

export function formatTime(date: Date): string {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export function formatNumber(n: number): string {
  return n.toLocaleString("ja-JP");
}
