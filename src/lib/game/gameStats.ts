import type { Character, Equipment, StatBlock } from "@/lib/data/types";
import { ITEMS } from "@/lib/game/items";

/** 現実のレベル・ステータスから最大HP/MPを算出する。ホーム画面とバトルで共有する。 */
export function computeVitals(level: number, stats: StatBlock): { hpMax: number; mpMax: number } {
  return {
    hpMax: 60 + level * 2 + stats.vit * 3,
    mpMax: 30 + level * 1 + stats.int * 2,
  };
}

export interface EquipmentBonuses {
  atk: number;
  def: number;
  mag: number;
}

export function computeEquipmentBonuses(equipment: Equipment): EquipmentBonuses {
  const bonuses: EquipmentBonuses = { atk: 0, def: 0, mag: 0 };
  for (const itemId of Object.values(equipment)) {
    if (!itemId) continue;
    const item = ITEMS[itemId];
    if (!item) continue;
    bonuses.atk += item.atk ?? 0;
    bonuses.def += item.def ?? 0;
    bonuses.mag += item.mag ?? 0;
  }
  return bonuses;
}

export interface CombatStats {
  maxHp: number;
  maxMp: number;
  atk: number;
  def: number;
  mag: number;
  critRate: number; // 0..1
  fleeRate: number; // 0..1
}

// 現実のステータス→戦闘力への変換ルール
// STR → 物理ATK / VIT → 最大HP・防御力 / INT → 魔法ATK
// TECH → とくぎ威力(戦闘スキル) / CHA → 逃走成功率・ゴールドボーナス
export function computeCombatStats(
  character: Pick<Character, "level" | "stats">,
  equipmentBonus: EquipmentBonuses,
  unlockedSkillIds: string[]
): CombatStats {
  const vitals = computeVitals(character.level, character.stats);
  const atk = 5 + Math.floor(character.stats.str * 0.8) + equipmentBonus.atk;
  const def = 3 + Math.floor(character.stats.vit * 0.5) + equipmentBonus.def;
  const mag = 3 + Math.floor(character.stats.int * 0.7) + equipmentBonus.mag;

  let critRate = 0.05 + character.stats.luk * 0.002;
  if (unlockedSkillIds.includes("focus")) critRate += 0.1; // Lv10「集中」

  const fleeRate = 0.5 + character.stats.cha * 0.01;

  return { maxHp: vitals.hpMax, maxMp: vitals.mpMax, atk, def, mag, critRate, fleeRate: Math.min(0.95, fleeRate) };
}

/** TECHステータスから「とくぎ」の威力を算出する */
export function techSkillPower(techStat: number, magStat: number): number {
  return magStat + Math.floor(techStat * 0.6);
}

/** CHAステータスからゴールド獲得ボーナス倍率を算出する */
export function goldBonusMultiplier(chaStat: number): number {
  return 1 + chaStat * 0.01;
}
