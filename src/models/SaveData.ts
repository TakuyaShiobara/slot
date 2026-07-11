import type { SettingNumber } from './types';

/** 役ごとの累計成立回数（統計・小役確率表示用）。 */
export interface RoleStats {
  fruit: number;
  replay: number;
  star: number;
  clover: number;
  bell: number;
}

/** LocalStorageに保存するセーブデータの形式。 */
export interface SaveData {
  version: number;
  credit: number;
  totalGames: number;
  bigCount: number;
  regCount: number;
  setting: SettingNumber;
  cumulativeDiff: number;
  maxCredit: number;
  roleStats: RoleStats;
}

export const SAVE_VERSION = 1;

export const DEFAULT_SAVE: SaveData = {
  version: SAVE_VERSION,
  credit: 50,
  totalGames: 0,
  bigCount: 0,
  regCount: 0,
  setting: 3,
  cumulativeDiff: 0,
  maxCredit: 50,
  roleStats: { fruit: 0, replay: 0, star: 0, clover: 0, bell: 0 },
};
