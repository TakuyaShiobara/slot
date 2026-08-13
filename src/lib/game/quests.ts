import type { QuestDef } from "@/lib/data/types";

export const QUEST_DEFS: QuestDef[] = [
  {
    id: "d-reading-pages",
    period: "daily",
    categoryId: "reading",
    name: "本を20ページ よむ",
    icon: "📖",
    target: 20,
    unit: "pages",
    exp: 30,
  },
  {
    id: "d-programming-30",
    period: "daily",
    categoryId: "programming",
    name: "プログラミング 30分",
    icon: "💻",
    target: 30,
    unit: "minutes",
    exp: 40,
  },
  {
    id: "d-exercise-30",
    period: "daily",
    categoryId: "exercise",
    name: "30分の うんどうを する",
    icon: "🏋",
    target: 30,
    unit: "minutes",
    exp: 35,
  },
  {
    id: "d-diary",
    period: "daily",
    categoryId: "diary",
    name: "にっきを かく",
    icon: "📜",
    target: 1,
    unit: "count",
    exp: 10,
  },
  {
    id: "w-study-hours",
    period: "weekly",
    categoryId: null,
    name: "こんしゅう 学習時間 5時間",
    icon: "📚",
    target: 300,
    unit: "minutes",
    exp: 120,
  },
  {
    id: "w-exercise-count",
    period: "weekly",
    categoryId: "exercise",
    name: "うんどうを 3日 おこなう",
    icon: "🏋",
    target: 3,
    unit: "count",
    exp: 90,
  },
  {
    id: "w-streak",
    period: "weekly",
    categoryId: null,
    name: "7日間 れんぞく記録",
    icon: "🔥",
    target: 7,
    unit: "count",
    exp: 150,
  },
];

export const DAILY_BONUS_EXP = 50;
export const WEEKLY_BONUS_EXP = 200;

export function questsForPeriod(period: "daily" | "weekly"): QuestDef[] {
  return QUEST_DEFS.filter((q) => q.period === period);
}
