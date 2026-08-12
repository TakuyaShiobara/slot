import type {
  ActivityCategoryId,
  ActivityLogEntry,
  GameState,
  StatBlock,
  StatKey,
} from "@/lib/data/types";
import { ACTIVITY_CATEGORIES, computeActivityResult } from "@/lib/game/categories";
import { applyExp, expRequiredForLevel, type LevelUpStep } from "@/lib/game/levels";
import { deriveJob } from "@/lib/game/jobs";
import { checkNewlyUnlockedSkills } from "@/lib/game/skills";
import { checkNewlyUnlockedTitles } from "@/lib/game/titles";
import type { SkillDef } from "@/lib/data/types";
import type { TitleDef } from "@/lib/data/types";

export const CATEGORY_LEVEL_EXP_BASE = 40;
export const CATEGORY_LEVEL_EXP_GROWTH = 18;

export function categoryLevelForExp(exp: number): number {
  let level = 1;
  let remaining = exp;
  let needed = CATEGORY_LEVEL_EXP_BASE;
  while (remaining >= needed) {
    remaining -= needed;
    level += 1;
    needed = CATEGORY_LEVEL_EXP_BASE + (level - 1) * CATEGORY_LEVEL_EXP_GROWTH;
  }
  return level;
}

function addStats(base: StatBlock, gains: Partial<StatBlock>): StatBlock {
  const next = { ...base };
  (Object.keys(gains) as StatKey[]).forEach((k) => {
    next[k] = (next[k] ?? 0) + (gains[k] ?? 0);
  });
  return next;
}

function todayStr(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

function isConsecutiveDay(prev: string | null, current: string): boolean {
  if (!prev) return false;
  const prevDate = new Date(prev + "T00:00:00Z");
  const curDate = new Date(current + "T00:00:00Z");
  const diffDays = Math.round((curDate.getTime() - prevDate.getTime()) / 86400000);
  return diffDays === 1;
}

export interface RecordActivityInput {
  categoryId: ActivityCategoryId;
  minutes: number;
  note?: string;
}

export interface RecordActivityResult {
  state: GameState;
  entry: ActivityLogEntry;
  expGained: number;
  statGains: Partial<StatBlock>;
  levelUps: LevelUpStep[];
  newSkills: SkillDef[];
  newTitles: TitleDef[];
}

/** 行動記録 -> EXP付与 -> レベルアップ/称号/スキル判定までを一括で行う純粋関数 */
export function recordActivity(state: GameState, input: RecordActivityInput): RecordActivityResult {
  const { categoryId, minutes, note } = input;
  const { exp: expGained, statGains } = computeActivityResult(categoryId, minutes);
  const now = new Date();
  const nowIso = now.toISOString();
  const today = todayStr(now);

  const entry: ActivityLogEntry = {
    id: `act_${now.getTime()}`,
    categoryId,
    minutes,
    exp: expGained,
    statGains,
    note,
    timestamp: nowIso,
  };

  const newStats = addStats(state.character.stats, statGains);
  const expResult = applyExp(state.character.level, state.character.exp, expGained);

  let streakDays = state.character.streakDays;
  let totalDaysRecorded = state.character.totalDaysRecorded;
  if (state.lastRecordedDate !== today) {
    streakDays = isConsecutiveDay(state.lastRecordedDate, today) ? streakDays + 1 : 1;
    totalDaysRecorded += 1;
  }

  const prevCat = state.categoryLevels[categoryId];
  const newCatExp = prevCat.exp + expGained;
  const newCatLevel = categoryLevelForExp(newCatExp);
  const newCategoryLevels = {
    ...state.categoryLevels,
    [categoryId]: {
      ...prevCat,
      exp: newCatExp,
      level: newCatLevel,
      totalMinutes: prevCat.totalMinutes + minutes,
    },
  };

  const character = {
    ...state.character,
    level: expResult.level,
    exp: expResult.exp,
    hpMax: 100 + (expResult.level - 1) * 4,
    mpMax: 60 + (expResult.level - 1) * 3,
    hp: 100 + (expResult.level - 1) * 4,
    mp: 60 + (expResult.level - 1) * 3,
    stats: newStats,
    streakDays,
    totalDaysRecorded,
    totalExpEarned: state.character.totalExpEarned + expGained,
  };
  character.jobId = deriveJob(character.stats, character.level);

  let nextState: GameState = {
    ...state,
    character,
    categoryLevels: newCategoryLevels,
    activityLog: [entry, ...state.activityLog],
    experienceLog: [
      { id: `exp_${now.getTime()}`, amount: expGained, reason: ACTIVITY_CATEGORIES[categoryId].name, timestamp: nowIso },
      ...state.experienceLog,
    ],
    lastRecordedDate: today,
  };

  const newSkills = checkNewlyUnlockedSkills(nextState);
  const newTitles = checkNewlyUnlockedTitles(nextState);
  nextState = {
    ...nextState,
    unlockedSkillIds: [...nextState.unlockedSkillIds, ...newSkills.map((s) => s.id)],
    unlockedTitleIds: [...nextState.unlockedTitleIds, ...newTitles.map((t) => t.id)],
  };
  if (newTitles.length > 0 && !nextState.character.currentTitleId) {
    nextState.character = { ...nextState.character, currentTitleId: newTitles[newTitles.length - 1].id };
  }

  return {
    state: nextState,
    entry,
    expGained,
    statGains,
    levelUps: expResult.levelUps,
    newSkills,
    newTitles,
  };
}

export function expToNextLevel(level: number): number {
  return expRequiredForLevel(level);
}
