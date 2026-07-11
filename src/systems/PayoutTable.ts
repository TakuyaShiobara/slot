import type { SymbolType } from '@/models/types';

/** 各図柄が有効ライン上に揃った際の払い出し枚数。 */
export const SYMBOL_PAYOUT: Partial<Record<SymbolType, number>> = {
  FRUIT: 2,
  STAR: 4,
  CLOVER: 6,
  BELL: 8,
};

/** ボーナス総獲得枚数の目標値。 */
export const BONUS_TARGET_PAYOUT = {
  BIG: 280,
  REG: 100,
} as const;

/** ボーナス中1ゲームあたりの払い出し枚数（目押しに成功した場合）。 */
export const BONUS_HIT_PAYOUT = 14;

/** ボーナス中の1ゲームあたり成立率（ほぼ確実に揃う高確率演出）。 */
export const BONUS_HIT_RATE = 0.92;
