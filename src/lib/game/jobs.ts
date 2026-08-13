import type { JobDef, JobId, StatBlock } from "@/lib/data/types";
import { ALL_STAT_ORDER } from "@/lib/data/types";

export const JOB_DEFS: Record<JobId, JobDef> = {
  adventurer: { id: "adventurer", name: "冒険者", description: "すべての基本となる、はじまりの職業。" },
  warrior: { id: "warrior", name: "戦士", description: "ちからとたいりょくに優れた前衛。" },
  fighter: { id: "fighter", name: "武闘家", description: "肉体を鍛え抜いた格闘のプロ。" },
  mage: { id: "mage", name: "魔法使い", description: "かしこさに特化した知の探求者。" },
  sage: { id: "sage", name: "賢者", description: "深い知識と経験を持つ賢者。" },
  merchant: { id: "merchant", name: "商人", description: "人との交流で信頼を積み上げる。" },
  engineer: { id: "engineer", name: "技術者", description: "TECHを極めしものづくりの匠。" },
  hero: { id: "hero", name: "勇者", description: "すべての能力が高水準でそろった万能型。" },
};

const DOMINANT_JOB: Partial<Record<keyof StatBlock, JobId>> = {
  tech: "engineer",
  int: "sage",
  str: "warrior",
  vit: "fighter",
  cha: "merchant",
  luk: "adventurer",
};

export function deriveJob(stats: StatBlock, level: number): JobId {
  const values = ALL_STAT_ORDER.map((k) => stats[k]);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;

  if (level >= 25 && max - min <= avg * 0.35) {
    return "hero";
  }

  let topStat = ALL_STAT_ORDER[0];
  for (const key of ALL_STAT_ORDER) {
    if (stats[key] > stats[topStat]) topStat = key;
  }
  return DOMINANT_JOB[topStat] ?? "adventurer";
}
