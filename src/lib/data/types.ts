// ドメイン型定義。将来 Supabase の各テーブル (users / characters / stats /
// activities / activity_categories / experience_logs / levels / skills /
// user_skills / quests / user_quests / titles / user_titles /
// adventure_logs) にそのまま対応させられる形にしている。
// MVP では supabase/schema.sql と同じ構造をローカル(zustand+localStorage)で
// 再現し、将来的に repository 実装だけ差し替えられるようにする。

export type StatKey = "str" | "agi" | "vit" | "int" | "tech" | "cha" | "luk";

export const STAT_LABEL_JA: Record<StatKey, string> = {
  str: "ちから",
  agi: "すばやさ",
  vit: "たいりょく",
  int: "かしこさ",
  tech: "TECH",
  cha: "CHA",
  luk: "うんのよさ",
};

export const PRIMARY_STAT_ORDER: StatKey[] = ["str", "agi", "vit", "int", "luk"];
export const ALL_STAT_ORDER: StatKey[] = ["str", "agi", "vit", "int", "tech", "cha", "luk"];

export type StatBlock = Record<StatKey, number>;

export type JobId =
  | "adventurer"
  | "warrior"
  | "mage"
  | "sage"
  | "merchant"
  | "engineer"
  | "fighter"
  | "hero";

export interface JobDef {
  id: JobId;
  name: string;
  description: string;
}

export interface Character {
  id: string;
  userId: string;
  name: string;
  level: number;
  exp: number; // 現在レベル内の獲得EXP
  hp: number;
  hpMax: number;
  mp: number;
  mpMax: number;
  stats: StatBlock;
  jobId: JobId;
  currentTitleId: string | null;
  streakDays: number;
  totalDaysRecorded: number;
  totalExpEarned: number;
  createdAt: string;
}

export type ActivityCategoryId =
  | "programming"
  | "reading"
  | "study"
  | "exercise"
  | "diary"
  | "work"
  | "social"
  | "sleep"
  | "other";

export interface ActivityCategoryDef {
  id: ActivityCategoryId;
  name: string;
  icon: string;
  expPerTenMin: number;
  statWeights: Partial<StatBlock>;
  isStudy?: boolean;
}

export interface ActivityLogEntry {
  id: string;
  categoryId: ActivityCategoryId;
  minutes: number;
  exp: number;
  statGains: Partial<StatBlock>;
  note?: string;
  timestamp: string; // ISO
}

export interface ExperienceLogEntry {
  id: string;
  amount: number;
  reason: string;
  timestamp: string;
}

export interface SkillDef {
  id: string;
  unlockLevel: number;
  name: string;
  description: string;
  hidden?: boolean; // レベル到達前は名称非公開(????)
  condition: SkillCondition;
}

export type SkillCondition =
  | { type: "streak"; days: number }
  | { type: "studyHours"; hours: number }
  | { type: "totalDaysRecorded"; days: number }
  | { type: "categoryLevelCount"; level: number; count: number }
  | { type: "streakAndStudyHours"; days: number; hours: number }
  | { type: "level"; level: number };

export interface TitleDef {
  id: string;
  name: string;
  description: string;
  priority: number; // 表示優先度(高いほど優先)
  condition: TitleCondition;
}

export type TitleCondition =
  | { type: "always" }
  | { type: "streak"; days: number }
  | { type: "totalDaysRecorded"; days: number }
  | { type: "totalExp"; exp: number }
  | { type: "categoryLevel"; category: ActivityCategoryId; level: number }
  | { type: "statAtLeast"; stat: StatKey; value: number }
  | { type: "balanced"; maxSpread: number };

export type QuestPeriod = "daily" | "weekly";

export interface QuestDef {
  id: string;
  period: QuestPeriod;
  categoryId: ActivityCategoryId | null;
  name: string;
  icon: string;
  target: number; // 分 or ページ数など単位はunit依存
  unit: "minutes" | "pages" | "count";
  exp: number;
}

export interface QuestProgress {
  questId: string;
  progress: number;
  completed: boolean;
  completedAt?: string;
}

export interface CategoryLevelState {
  categoryId: ActivityCategoryId;
  exp: number;
  level: number;
  totalMinutes: number;
}

export interface StatSnapshot {
  takenAt: string;
  stats: StatBlock;
}

export interface GameState {
  character: Character;
  categoryLevels: Record<ActivityCategoryId, CategoryLevelState>;
  unlockedSkillIds: string[];
  unlockedTitleIds: string[];
  activityLog: ActivityLogEntry[];
  experienceLog: ExperienceLogEntry[];
  statHistory: StatSnapshot[];
  dailyQuestProgress: Record<string, QuestProgress>;
  weeklyQuestProgress: Record<string, QuestProgress>;
  questDate: string; // デイリークエストのリセット基準日 (YYYY-MM-DD)
  weekStartDate: string; // ウィークリークエストのリセット基準週(月曜日, YYYY-MM-DD)
  lastRecordedDate: string | null; // 連続記録判定用
}
