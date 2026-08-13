// レベル・EXP曲線。ハードコードした表ではなく数式で管理し、
// 後からバランス調整できるようにする。

const BASE_EXP = 90;
const LINEAR_GROWTH = 32;
const CURVE_POWER = 1.35;
const CURVE_SCALE = 1.8;

/** そのレベルから次のレベルに上がるために必要なEXP */
export function expRequiredForLevel(level: number): number {
  const linear = BASE_EXP + (level - 1) * LINEAR_GROWTH;
  const curve = Math.pow(level, CURVE_POWER) * CURVE_SCALE;
  return Math.round((linear + curve) / 5) * 5;
}

export interface LevelUpStep {
  fromLevel: number;
  toLevel: number;
}

export interface ApplyExpResult {
  level: number;
  exp: number;
  expToNext: number;
  levelUps: LevelUpStep[];
}

/** 現在のレベル・EXPに獲得EXPを加算し、必要なだけレベルアップさせる */
export function applyExp(
  currentLevel: number,
  currentExp: number,
  gainedExp: number
): ApplyExpResult {
  let level = currentLevel;
  let exp = currentExp + gainedExp;
  const levelUps: LevelUpStep[] = [];

  let needed = expRequiredForLevel(level);
  while (exp >= needed) {
    exp -= needed;
    const from = level;
    level += 1;
    levelUps.push({ fromLevel: from, toLevel: level });
    needed = expRequiredForLevel(level);
  }

  return { level, exp, expToNext: needed, levelUps };
}
