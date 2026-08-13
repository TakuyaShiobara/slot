import type { GameState, TitleDef } from "@/lib/data/types";

export const TITLE_DEFS: TitleDef[] = [
  {
    id: "novice",
    name: "初心者冒険者",
    description: "冒険をはじめたばかりの者",
    priority: 0,
    condition: { type: "always" },
  },
  {
    id: "graduate-3days",
    name: "三日坊主卒業",
    description: "7日間連続で記録した",
    priority: 10,
    condition: { type: "streak", days: 7 },
  },
  {
    id: "reader",
    name: "読書家",
    description: "どくしょカテゴリがLv.5に到達",
    priority: 15,
    condition: { type: "categoryLevel", category: "reading", level: 5 },
  },
  {
    id: "hard-worker",
    name: "努力家",
    description: "累計EXPが5,000を突破",
    priority: 20,
    condition: { type: "totalExp", exp: 5000 },
  },
  {
    id: "iron-man",
    name: "鉄人",
    description: "うんどうカテゴリがLv.5に到達",
    priority: 25,
    condition: { type: "categoryLevel", category: "exercise", level: 5 },
  },
  {
    id: "engineer-title",
    name: "技術者",
    description: "TECHが40に到達",
    priority: 30,
    condition: { type: "statAtLeast", stat: "tech", value: 40 },
  },
  {
    id: "seeker",
    name: "求道者",
    description: "かしこさが30に到達",
    priority: 30,
    condition: { type: "statAtLeast", stat: "int", value: 30 },
  },
  {
    id: "persistence-title",
    name: "継続する者",
    description: "100日間記録を続けた",
    priority: 40,
    condition: { type: "totalDaysRecorded", days: 100 },
  },
  {
    id: "all-rounder",
    name: "万能型",
    description: "すべてのステータスが高水準でバランスが取れている",
    priority: 50,
    condition: { type: "balanced", maxSpread: 12 },
  },
];

export function isTitleConditionMet(state: GameState, title: TitleDef): boolean {
  const c = title.condition;
  switch (c.type) {
    case "always":
      return true;
    case "streak":
      return state.character.streakDays >= c.days;
    case "totalDaysRecorded":
      return state.character.totalDaysRecorded >= c.days;
    case "totalExp":
      return state.character.totalExpEarned >= c.exp;
    case "categoryLevel":
      return (state.categoryLevels[c.category]?.level ?? 0) >= c.level;
    case "statAtLeast":
      return state.character.stats[c.stat] >= c.value;
    case "balanced": {
      const values = Object.values(state.character.stats);
      return Math.max(...values) - Math.min(...values) <= c.maxSpread && state.character.level >= 20;
    }
    default:
      return false;
  }
}

export function checkNewlyUnlockedTitles(state: GameState): TitleDef[] {
  return TITLE_DEFS.filter((t) => !state.unlockedTitleIds.includes(t.id) && isTitleConditionMet(state, t));
}

export function currentDisplayTitle(state: GameState): TitleDef {
  const unlocked = TITLE_DEFS.filter((t) => state.unlockedTitleIds.includes(t.id));
  unlocked.sort((a, b) => b.priority - a.priority);
  return unlocked[0] ?? TITLE_DEFS[0];
}
