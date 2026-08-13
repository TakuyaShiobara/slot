import type {
  ActivityCategoryId,
  ActivityLogEntry,
  CategoryLevelState,
  Character,
  ExperienceLogEntry,
  GameState,
  StatSnapshot,
} from "@/lib/data/types";
import { ACTIVITY_CATEGORIES } from "@/lib/game/categories";
import { categoryLevelForExp } from "@/lib/game/engine";
import { deriveJob } from "@/lib/game/jobs";
import { TITLE_DEFS, isTitleConditionMet } from "@/lib/game/titles";
import { SKILL_DEFS, isSkillConditionMet } from "@/lib/game/skills";

const DEMO_CHARACTER_ID = "char_takuya";
const DEMO_USER_ID = "user_demo";

function iso(daysAgo: number, hour = 20, minute = 0): string {
  const d = new Date();
  d.setUTCHours(hour, minute, 0, 0);
  d.setUTCDate(d.getUTCDate() - daysAgo);
  return d.toISOString();
}

export function startOfWeek(d: Date): Date {
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = date.getUTCDay();
  const diff = (day + 6) % 7; // 月曜始まり
  date.setUTCDate(date.getUTCDate() - diff);
  return date;
}

function buildCategoryLevels(): Record<ActivityCategoryId, CategoryLevelState> {
  // 学習系カテゴリの合計が約72時間になるよう調整(スキル「超集中」進捗のデモ用)
  const totalMinutes: Record<ActivityCategoryId, number> = {
    programming: 2400,
    reading: 1700,
    study: 600,
    exercise: 1400,
    diary: 360,
    work: 420,
    social: 540,
    sleep: 2100,
    other: 240,
  };
  const expPerMinuteFactor: Record<ActivityCategoryId, number> = Object.fromEntries(
    Object.values(ACTIVITY_CATEGORIES).map((c) => [c.id, c.expPerTenMin / 10])
  ) as Record<ActivityCategoryId, number>;

  const result = {} as Record<ActivityCategoryId, CategoryLevelState>;
  (Object.keys(totalMinutes) as ActivityCategoryId[]).forEach((id) => {
    const minutes = totalMinutes[id];
    const exp = Math.round(minutes * expPerMinuteFactor[id]);
    result[id] = {
      categoryId: id,
      exp,
      level: categoryLevelForExp(exp),
      totalMinutes: minutes,
    };
  });
  return result;
}

function buildActivityLog(): ActivityLogEntry[] {
  const today: ActivityLogEntry[] = [
    {
      id: "act_seed_1",
      categoryId: "programming",
      minutes: 90,
      exp: 60,
      statGains: { tech: 3, int: 1 },
      timestamp: iso(0, 8, 0),
    },
    {
      id: "act_seed_2",
      categoryId: "reading",
      minutes: 30,
      exp: 20,
      statGains: { int: 2 },
      timestamp: iso(0, 11, 0),
    },
    {
      id: "act_seed_3",
      categoryId: "exercise",
      minutes: 20,
      exp: 25,
      statGains: { vit: 1 },
      timestamp: iso(0, 19, 0),
    },
    {
      id: "act_seed_4",
      categoryId: "diary",
      minutes: 15,
      exp: 10,
      statGains: { cha: 1 },
      timestamp: iso(0, 22, 30),
    },
  ];

  const previousDays: ActivityLogEntry[] = [];
  const pattern: { categoryId: ActivityCategoryId; minutes: number; exp: number }[] = [
    { categoryId: "programming", minutes: 60, exp: 40 },
    { categoryId: "reading", minutes: 20, exp: 14 },
    { categoryId: "exercise", minutes: 25, exp: 30 },
    { categoryId: "diary", minutes: 10, exp: 8 },
    { categoryId: "social", minutes: 30, exp: 30 },
  ];
  for (let day = 1; day <= 4; day += 1) {
    pattern.forEach((p, idx) => {
      previousDays.push({
        id: `act_seed_${day}_${idx}`,
        categoryId: p.categoryId,
        minutes: p.minutes,
        exp: p.exp,
        statGains: {},
        timestamp: iso(day, 8 + idx * 3),
      });
    });
  }

  return [...today, ...previousDays];
}

function buildExperienceLog(activityLog: ActivityLogEntry[]): ExperienceLogEntry[] {
  return activityLog.map((a) => ({
    id: `exp_${a.id}`,
    amount: a.exp,
    reason: ACTIVITY_CATEGORIES[a.categoryId].name,
    timestamp: a.timestamp,
  }));
}

function buildStatHistory(currentStats: Character["stats"]): StatSnapshot[] {
  const threeMonthsAgo: Character["stats"] = {
    str: 12,
    agi: 17,
    vit: 17,
    int: 20,
    tech: 26,
    cha: 18,
    luk: 15,
  };
  return [
    { takenAt: iso(90), stats: threeMonthsAgo },
    { takenAt: iso(0), stats: currentStats },
  ];
}

export function buildInitialGameState(): GameState {
  const stats: Character["stats"] = {
    str: 18,
    agi: 20,
    vit: 21,
    int: 34,
    tech: 42,
    cha: 24,
    luk: 19,
  };

  const character: Character = {
    id: DEMO_CHARACTER_ID,
    userId: DEMO_USER_ID,
    name: "TAKUYA",
    level: 27,
    exp: 725,
    hp: 100,
    hpMax: 100,
    mp: 60,
    mpMax: 60,
    stats,
    jobId: deriveJob(stats, 27),
    currentTitleId: null,
    streakDays: 86,
    totalDaysRecorded: 124,
    totalExpEarned: 28450,
    createdAt: iso(124),
  };

  const categoryLevels = buildCategoryLevels();
  const activityLog = buildActivityLog();
  const experienceLog = buildExperienceLog(activityLog);
  const statHistory = buildStatHistory(stats);

  let state: GameState = {
    character,
    categoryLevels,
    unlockedSkillIds: [],
    unlockedTitleIds: [],
    activityLog,
    experienceLog,
    statHistory,
    dailyQuestProgress: {},
    weeklyQuestProgress: {},
    questDate: new Date().toISOString().slice(0, 10),
    weekStartDate: startOfWeek(new Date()).toISOString().slice(0, 10),
    lastRecordedDate: new Date().toISOString().slice(0, 10),
  };

  const unlockedSkillIds = SKILL_DEFS.filter(
    (s) => character.level >= s.unlockLevel && isSkillConditionMet(state, s)
  ).map((s) => s.id);
  const unlockedTitleIds = TITLE_DEFS.filter((t) => isTitleConditionMet(state, t)).map((t) => t.id);

  state = { ...state, unlockedSkillIds, unlockedTitleIds };
  const sortedTitles = TITLE_DEFS.filter((t) => unlockedTitleIds.includes(t.id)).sort(
    (a, b) => b.priority - a.priority
  );
  state.character = { ...state.character, currentTitleId: sortedTitles[0]?.id ?? "novice" };

  return state;
}
