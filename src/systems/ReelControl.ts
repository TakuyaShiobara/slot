import type { SymbolType, ReelIndex } from '@/models/types';
import { REEL_STRIPS, REEL_LENGTH, MAX_SLIP } from '@/models/ReelStrips';

/** 指定インデックスの3コマ窓（上段・中段・下段）を取得する。 */
export function getWindow(reelIndex: ReelIndex, middleIndex: number): {
  top: SymbolType;
  middle: SymbolType;
  bottom: SymbolType;
} {
  const strip = REEL_STRIPS[reelIndex];
  const len = REEL_LENGTH;
  const m = ((middleIndex % len) + len) % len;
  return {
    top: strip[(m - 1 + len) % len],
    middle: strip[m],
    bottom: strip[(m + 1) % len],
  };
}

/**
 * 目押し制御（滑りコマ数0〜4）で、目標図柄を中段に「引き込める」最小の停止位置を求める。
 * mode='WINDOW' の場合は中段に限らず上中下いずれかに目標図柄が来ればよい（FRUITの単独リール判定用）。
 * 引き込みに失敗した場合はリクエストされた位置（滑り0）で強制停止する。
 */
export function computeStopIndex(
  reelIndex: ReelIndex,
  requestedIndex: number,
  targetSymbol: SymbolType | null,
  mode: 'MIDDLE' | 'WINDOW' = 'MIDDLE',
): number {
  const len = REEL_LENGTH;
  const requested = ((requestedIndex % len) + len) % len;
  if (!targetSymbol) {
    return requested;
  }
  for (let offset = 0; offset <= MAX_SLIP; offset++) {
    const idx = (requested + offset) % len;
    const win = getWindow(reelIndex, idx);
    const hit = mode === 'WINDOW'
      ? win.top === targetSymbol || win.middle === targetSymbol || win.bottom === targetSymbol
      : win.middle === targetSymbol;
    if (hit) {
      return idx;
    }
  }
  return requested;
}
