import type { GameState, SkillDef } from "@/lib/data/types";
import { ACTIVITY_CATEGORIES } from "@/lib/game/categories";

export const SKILL_DEFS: SkillDef[] = [
  {
    id: "habit",
    unlockLevel: 5,
    name: "習慣化",
    description: "7日間連続で記録する",
    condition: { type: "streak", days: 7 },
  },
  {
    id: "focus",
    unlockLevel: 10,
    name: "集中",
    description: "30時間の学習を達成",
    condition: { type: "studyHours", hours: 30 },
  },
  {
    id: "persistence",
    unlockLevel: 15,
    name: "継続する者",
    description: "100日間記録を続ける",
    condition: { type: "totalDaysRecorded", days: 100 },
  },
  {
    id: "self-management",
    unlockLevel: 20,
    name: "自己管理",
    description: "3カテゴリをLv.10以上",
    condition: { type: "categoryLevelCount", level: 10, count: 3 },
  },
  {
    id: "hyper-focus",
    unlockLevel: 30,
    name: "超集中",
    description: "学習時間100時間・30日間連続記録",
    condition: { type: "streakAndStudyHours", days: 30, hours: 100 },
  },
  {
    id: "mystery-40",
    unlockLevel: 40,
    name: "？？？？？",
    description: "じょうけんを みたすと かいほう",
    hidden: true,
    condition: { type: "level", level: 40 },
  },
  {
    id: "mystery-50",
    unlockLevel: 50,
    name: "？？？？？",
    description: "じょうけんを みたすと かいほう",
    hidden: true,
    condition: { type: "level", level: 50 },
  },
];

function studyHours(state: GameState): number {
  const minutes = Object.values(state.categoryLevels)
    .filter((c) => ACTIVITY_CATEGORIES[c.categoryId].isStudy)
    .reduce((sum, c) => sum + c.totalMinutes, 0);
  return minutes / 60;
}

export function isSkillConditionMet(state: GameState, skill: SkillDef): boolean {
  const c = skill.condition;
  switch (c.type) {
    case "streak":
      return state.character.streakDays >= c.days;
    case "studyHours":
      return studyHours(state) >= c.hours;
    case "totalDaysRecorded":
      return state.character.totalDaysRecorded >= c.days;
    case "categoryLevelCount":
      return Object.values(state.categoryLevels).filter((cl) => cl.level >= c.level).length >= c.count;
    case "streakAndStudyHours":
      return state.character.streakDays >= c.days && studyHours(state) >= c.hours;
    case "level":
      return state.character.level >= c.level;
    default:
      return false;
  }
}

export function skillProgressLabel(state: GameState, skill: SkillDef): string {
  const c = skill.condition;
  switch (c.type) {
    case "streak":
      return `${Math.min(state.character.streakDays, c.days)} / ${c.days}日`;
    case "studyHours":
      return `${Math.min(Math.floor(studyHours(state)), c.hours)} / ${c.hours}時間`;
    case "totalDaysRecorded":
      return `${Math.min(state.character.totalDaysRecorded, c.days)} / ${c.days}日`;
    case "categoryLevelCount": {
      const n = Object.values(state.categoryLevels).filter((cl) => cl.level >= c.level).length;
      return `${Math.min(n, c.count)} / ${c.count}カテゴリ`;
    }
    case "streakAndStudyHours":
      return `学習 ${Math.min(Math.floor(studyHours(state)), c.hours)}/${c.hours}時間・連続 ${Math.min(
        state.character.streakDays,
        c.days
      )}/${c.days}日`;
    case "level":
      return `Lv.${state.character.level} / ${c.level}`;
    default:
      return "";
  }
}

export function findNextLockedSkill(state: GameState): SkillDef | undefined {
  return SKILL_DEFS.filter((s) => !state.unlockedSkillIds.includes(s.id)).sort(
    (a, b) => a.unlockLevel - b.unlockLevel
  )[0];
}

export function checkNewlyUnlockedSkills(state: GameState): SkillDef[] {
  return SKILL_DEFS.filter(
    (s) => !state.unlockedSkillIds.includes(s.id) && state.character.level >= s.unlockLevel && isSkillConditionMet(state, s)
  );
}
