import type { SymbolType } from './types';

/**
 * 3本のリールの図柄配列（各21コマ）。
 * REPLAYは全リールで最大ギャップ5以内、FRUITはreel0(左)で最大ギャップ5以内になるよう配置し、
 * 目押し猶予4コマ以内での「引き込み」を保証している。BELL/CLOVER/STARは意図的に
 * 引き込み保証外の間隔を含み、実機同様に取りこぼしが発生し得るようにしている。
 */
export const REEL_STRIPS: readonly SymbolType[][] = [
  [
    'REPLAY', 'FRUIT', 'CLOVER', 'LUCKY', 'REPLAY', 'FRUIT', 'CLOVER', 'BELL',
    'REPLAY', 'FRUIT', 'BLANK', 'STAR', 'LUCKY', 'REPLAY', 'FRUIT', 'BELL',
    'CLOVER', 'REPLAY', 'FRUIT', 'STAR', 'BELL',
  ],
  [
    'REPLAY', 'BELL', 'STAR', 'FRUIT', 'REPLAY', 'BELL', 'CLOVER', 'STAR',
    'REPLAY', 'FRUIT', 'LUCKY', 'BELL', 'CLOVER', 'REPLAY', 'STAR', 'CLOVER',
    'BELL', 'REPLAY', 'BLANK', 'LUCKY', 'CLOVER',
  ],
  [
    'REPLAY', 'BELL', 'CLOVER', 'FRUIT', 'REPLAY', 'BELL', 'STAR', 'CLOVER',
    'REPLAY', 'FRUIT', 'LUCKY', 'BELL', 'STAR', 'REPLAY', 'CLOVER', 'STAR',
    'BELL', 'REPLAY', 'BLANK', 'LUCKY', 'STAR',
  ],
];

export const REEL_LENGTH = 21;

/** 目押し猶予（滑りコマ数）。0〜4の5コマ範囲で制御する。 */
export const MAX_SLIP = 4;
