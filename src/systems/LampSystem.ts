import type { LampPattern } from '@/models/types';

/** レバーON時点の告知ランプ演出抽選。ボーナス内部持ち越し中は期待度の高い演出が出やすい。 */
export function pickLeverOnLamp(bonusPending: boolean): LampPattern {
  const r = Math.random();
  if (bonusPending) {
    if (r < 0.15) return 'RAINBOW';
    if (r < 0.5) return 'BLINK';
    return 'NORMAL';
  }
  if (r < 0.03) return 'RAINBOW'; // レア：ガセ演出（否定はしない）
  if (r < 0.1) return 'BLINK';
  if (r < 0.25) return 'NORMAL';
  return 'OFF';
}

/** 第3停止後の告知ランプ演出抽選。ボーナス確定時は必ず虹色点灯で祝福する。 */
export function pickThirdStopLamp(bonusConfirmedThisGame: boolean, bonusPending: boolean): LampPattern {
  if (bonusConfirmedThisGame) return 'RAINBOW';
  if (bonusPending) {
    return Math.random() < 0.5 ? 'BLINK' : 'NORMAL';
  }
  return Math.random() < 0.05 ? 'NORMAL' : 'OFF';
}
