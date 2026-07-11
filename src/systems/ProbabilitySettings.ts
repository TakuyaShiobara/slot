import type { SettingNumber } from '@/models/types';

/** 1設定分の確率テーブル（すべて「1/分母」の分母値で管理する）。 */
export interface SettingProbability {
  readonly big: number;
  readonly reg: number;
  readonly fruit: number;
  readonly replay: number;
  readonly star: number;
  readonly clover: number;
  readonly bell: number;
}

/**
 * 設定1〜6の確率テーブル。数値は「本格スロットシミュレーター」としての
 * ゲームバランス用データであり、実在の権利物とは無関係のオリジナル値。
 */
export const SETTINGS_TABLE: Record<SettingNumber, SettingProbability> = {
  1: { big: 399.6, reg: 399.6, fruit: 29.0, replay: 7.3, star: 99.0, clover: 150.0, bell: 200.0 },
  2: { big: 379.3, reg: 361.7, fruit: 28.0, replay: 7.3, star: 96.0, clover: 145.0, bell: 192.0 },
  3: { big: 331.0, reg: 331.0, fruit: 27.5, replay: 7.3, star: 94.0, clover: 142.0, bell: 186.0 },
  4: { big: 315.8, reg: 303.0, fruit: 27.0, replay: 7.3, star: 92.0, clover: 138.0, bell: 180.0 },
  5: { big: 278.2, reg: 278.2, fruit: 26.0, replay: 7.3, star: 91.0, clover: 134.0, bell: 175.0 },
  6: { big: 259.0, reg: 241.0, fruit: 25.0, replay: 7.3, star: 90.0, clover: 130.0, bell: 170.0 },
};

/** 合算確率の分母を返す (BIG+REGの合成確率)。 */
export function combinedDenominator(setting: SettingNumber): number {
  const t = SETTINGS_TABLE[setting];
  return 1 / (1 / t.big + 1 / t.reg);
}
