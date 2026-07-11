/**
 * すべての効果音はWeb Audio APIのオシレーターでその場合成するオリジナル音源。
 * 外部音源ファイルを一切使用しないため、著作権的にクリーンかつPWAの容量も小さく保てる。
 */
export class SoundService {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  muted = false;

  private ensureContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.35;
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  /** ユーザー操作（タップ）内で一度呼び出し、AudioContextをアンロックする。 */
  unlock(): void {
    this.ensureContext();
  }

  private tone(
    freq: number,
    duration: number,
    opts: { type?: OscillatorType; gain?: number; slideTo?: number; delay?: number } = {},
  ): void {
    if (this.muted) return;
    const ctx = this.ensureContext();
    const start = ctx.currentTime + (opts.delay ?? 0);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = opts.type ?? 'square';
    osc.frequency.setValueAtTime(freq, start);
    if (opts.slideTo) {
      osc.frequency.exponentialRampToValueAtTime(opts.slideTo, start + duration);
    }
    gain.gain.setValueAtTime(opts.gain ?? 0.6, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
    osc.connect(gain);
    gain.connect(this.masterGain!);
    osc.start(start);
    osc.stop(start + duration + 0.02);
  }

  /** レバーON音：短く鋭いクリック。 */
  playLever(): void {
    this.tone(180, 0.08, { type: 'square', gain: 0.5 });
    this.tone(90, 0.12, { type: 'square', gain: 0.4, delay: 0.03 });
  }

  /** リール回転音：低いホワイトノイズ風の連続音（短いバーストをループ的に鳴らす）。 */
  playReelSpinTick(): void {
    this.tone(60, 0.05, { type: 'sawtooth', gain: 0.12 });
  }

  /** 停止音：ゴトッという打撃音。 */
  playStop(): void {
    this.tone(220, 0.07, { type: 'triangle', gain: 0.5, slideTo: 80 });
  }

  /** 払い出し音（チャリンチャリン）。coinsに応じて回数を変える。 */
  playPayout(coins: number): void {
    const count = Math.min(8, Math.max(2, Math.round(coins / 3)));
    for (let i = 0; i < count; i++) {
      this.tone(880 + (i % 3) * 60, 0.09, { type: 'sine', gain: 0.35, delay: i * 0.07 });
    }
  }

  /** 告知音：期待感のある上昇音。 */
  playAnnounce(): void {
    this.tone(440, 0.25, { type: 'sine', gain: 0.4, slideTo: 880 });
  }

  /** ボーナス開始のファンファーレ。 */
  playBonusStart(): void {
    const notes = [523, 659, 784, 1046];
    notes.forEach((f, i) => this.tone(f, 0.22, { type: 'square', gain: 0.45, delay: i * 0.12 }));
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
  }
}

export const soundService = new SoundService();
