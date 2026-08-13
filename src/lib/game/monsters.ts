import type { MonsterDef } from "@/lib/data/types";
import {
  SLIME_GRID,
  SLIME_PALETTE,
  GOBLIN_GRID,
  GOBLIN_PALETTE,
  WOLF_GRID,
  WOLF_PALETTE,
  BOSS_GRID,
  BOSS_PALETTE,
} from "@/lib/game/monsterSprites";

export const MONSTERS: Record<string, MonsterDef> = {
  slime: {
    id: "slime",
    name: "スライム",
    hp: 18,
    atk: 4,
    def: 1,
    exp: 4,
    gold: [3, 8],
    palette: SLIME_PALETTE,
    sprite: SLIME_GRID,
  },
  goblin: {
    id: "goblin",
    name: "ゴブリン",
    hp: 34,
    atk: 8,
    def: 3,
    exp: 9,
    gold: [6, 14],
    dropItemId: "goblin_club",
    dropRate: 0.2,
    palette: GOBLIN_PALETTE,
    sprite: GOBLIN_GRID,
  },
  wolf: {
    id: "wolf",
    name: "ウルフ",
    hp: 44,
    atk: 11,
    def: 4,
    exp: 12,
    gold: [8, 18],
    dropItemId: "wolf_fang",
    dropRate: 0.25,
    palette: WOLF_PALETTE,
    sprite: WOLF_GRID,
  },
  dark_guardian: {
    id: "dark_guardian",
    name: "闇の番人",
    hp: 150,
    atk: 16,
    def: 6,
    exp: 60,
    gold: [40, 80],
    dropItemId: "dark_cloak",
    dropRate: 1,
    isBoss: true,
    palette: BOSS_PALETTE,
    sprite: BOSS_GRID,
  },
};

export function randomMonsterFrom(table: { monsterId: string; weight: number }[]): string {
  const total = table.reduce((sum, t) => sum + t.weight, 0);
  let roll = Math.random() * total;
  for (const entry of table) {
    roll -= entry.weight;
    if (roll <= 0) return entry.monsterId;
  }
  return table[table.length - 1].monsterId;
}
