import type { LotteryResult, SettingNumber } from '@/models/types';
import { SETTINGS_TABLE } from './ProbabilitySettings';

/**
 * 1ゲーム分の内部抽選を行う。
 * ボーナスフラグ持ち越し中(pendingBonus !== null)はBIG/REGの再抽選を行わず、
 * 小役のみ抽選する（実機のフラグ間持ち越し仕様に準拠）。
 */
export function drawLottery(
  setting: SettingNumber,
  pendingBonus: 'BIG' | 'REG' | null,
): LotteryResult {
  const t = SETTINGS_TABLE[setting];
  const roll = Math.random();

  // 排他的な抽選テーブルを確率の高い（分母が小さい）順に積み上げる。
  let acc = 0;
  const entries: Array<{ result: LotteryResult; prob: number }> = [];

  entries.push({ result: 'REPLAY', prob: 1 / t.replay });
  entries.push({ result: 'FRUIT', prob: 1 / t.fruit });
  entries.push({ result: 'BELL', prob: 1 / t.bell });
  entries.push({ result: 'CLOVER', prob: 1 / t.clover });
  entries.push({ result: 'STAR', prob: 1 / t.star });

  if (!pendingBonus) {
    entries.push({ result: 'BIG', prob: 1 / t.big });
    entries.push({ result: 'REG', prob: 1 / t.reg });
  }

  for (const entry of entries) {
    acc += entry.prob;
    if (roll < acc) {
      return entry.result;
    }
  }
  return 'MISS';
}
