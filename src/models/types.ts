/** オリジナル図柄の種類。すべて本アプリ独自のデザイン・名称。 */
export type SymbolType = 'FRUIT' | 'STAR' | 'BELL' | 'CLOVER' | 'REPLAY' | 'LUCKY' | 'BLANK';

/** 1ゲームの内部抽選結果。MISSも含めた排他的な当選役。 */
export type LotteryResult =
  | 'MISS'
  | 'FRUIT'
  | 'REPLAY'
  | 'STAR'
  | 'CLOVER'
  | 'BELL'
  | 'REG'
  | 'BIG';

/** ボーナス種別。内部的に持ち越すフラグ。 */
export type BonusFlag = 'NONE' | 'BIG' | 'REG';

/** 設定値 1〜6。 */
export type SettingNumber = 1 | 2 | 3 | 4 | 5 | 6;

/** リールの位置インデックス (0=左, 1=中, 2=右)。 */
export type ReelIndex = 0 | 1 | 2;

/** 告知ランプの発光パターン。 */
export type LampPattern = 'OFF' | 'NORMAL' | 'BLINK' | 'RAINBOW';

/** ゲーム全体の進行モード。 */
export type GameMode = 'NORMAL' | 'BONUS_BIG' | 'BONUS_REG';
