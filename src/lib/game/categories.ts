import type { ActivityCategoryDef, ActivityCategoryId } from "@/lib/data/types";

export const ACTIVITY_CATEGORIES: Record<ActivityCategoryId, ActivityCategoryDef> = {
  programming: {
    id: "programming",
    name: "プログラミング",
    icon: "💻",
    expPerTenMin: 6.5,
    statWeights: { tech: 0.7, int: 0.3 },
    isStudy: true,
  },
  reading: {
    id: "reading",
    name: "どくしょ",
    icon: "📖",
    expPerTenMin: 6,
    statWeights: { int: 0.85, luk: 0.15 },
    isStudy: true,
  },
  study: {
    id: "study",
    name: "べんきょう",
    icon: "📚",
    expPerTenMin: 6,
    statWeights: { int: 0.6, tech: 0.4 },
    isStudy: true,
  },
  exercise: {
    id: "exercise",
    name: "うんどう・きんトレ",
    icon: "🏋",
    expPerTenMin: 7.5,
    statWeights: { vit: 0.6, str: 0.4 },
  },
  diary: {
    id: "diary",
    name: "にっき・ふりかえり",
    icon: "📜",
    expPerTenMin: 4,
    statWeights: { cha: 0.6, int: 0.4 },
  },
  work: {
    id: "work",
    name: "しごと",
    icon: "💼",
    expPerTenMin: 5,
    statWeights: { tech: 0.5, int: 0.5 },
    isStudy: true,
  },
  social: {
    id: "social",
    name: "ひとと こうりゅう",
    icon: "🧑‍🤝‍🧑",
    expPerTenMin: 6,
    statWeights: { cha: 0.85, luk: 0.15 },
  },
  sleep: {
    id: "sleep",
    name: "すいみん",
    icon: "🛌",
    expPerTenMin: 2.5,
    statWeights: { vit: 1 },
  },
  other: {
    id: "other",
    name: "そのた",
    icon: "✦",
    expPerTenMin: 4,
    statWeights: { luk: 0.5, str: 0.15, agi: 0.15, vit: 0.1, int: 0.1 },
  },
};

export const ACTIVITY_CATEGORY_LIST = Object.values(ACTIVITY_CATEGORIES);

export function computeActivityResult(categoryId: ActivityCategoryId, minutes: number) {
  const def = ACTIVITY_CATEGORIES[categoryId];
  const exp = Math.max(1, Math.round((minutes / 10) * def.expPerTenMin));

  // ステータス上昇量: EXPをウェイトで按分し、1以上は保証しつつ丸める
  const statPool = Math.max(1, Math.round(exp / 12));
  const statGains: Partial<Record<string, number>> = {};
  const entries = Object.entries(def.statWeights) as [string, number][];
  entries.forEach(([stat, weight], idx) => {
    const isLast = idx === entries.length - 1;
    const already = Object.values(statGains).reduce((a: number, b) => a + (b ?? 0), 0);
    const amount = isLast ? Math.max(1, statPool - already) : Math.max(1, Math.round(statPool * weight));
    statGains[stat] = amount;
  });

  return { exp, statGains };
}
