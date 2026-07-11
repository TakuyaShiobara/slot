import Phaser from 'phaser';
import type { ReelIndex, SymbolType } from '@/models/types';
import { REEL_STRIPS, REEL_LENGTH } from '@/models/ReelStrips';
import { REEL_ROW_HEIGHT, REEL_WIDTH, SYMBOL_SIZE } from '@/ui/Layout';
import { soundService } from '@/services/SoundService';

type ReelState = 'IDLE' | 'SPINNING' | 'STOPPING' | 'STOPPED';

const SPIN_SPEED = 0.62; // px/ms

/**
 * 1本のリールの見た目と回転・停止アニメーションを担当するコンポーネント。
 * ロジック（停止位置の決定）はGameEngine/ReelControlに委譲し、ここでは演出のみを行う。
 */
export class ReelView {
  readonly reelIndex: ReelIndex;
  private images: Phaser.GameObjects.Image[] = [];
  private baseIndex = 0;
  private offset = 0;
  private state: ReelState = 'IDLE';
  private remainingRows = 0;
  private onStoppedCallback: (() => void) | null = null;
  private readonly topY: number;
  private readonly visibleRows = 5; // 上下1コマずつ余裕を持たせてスクロール時のはみ出しを防ぐ

  constructor(scene: Phaser.Scene, reelIndex: ReelIndex, x: number, topY: number) {
    this.reelIndex = reelIndex;
    this.topY = topY;
    this.baseIndex = Phaser.Math.Between(0, REEL_LENGTH - 1);

    // マスク用のGraphicsはシーンの表示リストに加えず（add: false）ジオメトリマスク専用に使う。
    const maskGraphics = scene.make.graphics({ x: 0, y: 0 }, false);
    maskGraphics.fillStyle(0xffffff, 1);
    maskGraphics.fillRect(x, topY, REEL_WIDTH, REEL_ROW_HEIGHT * 3);
    const mask = maskGraphics.createGeometryMask();

    for (let i = 0; i < this.visibleRows; i++) {
      const img = scene.add.image(x + REEL_WIDTH / 2, 0, 'BLANK');
      img.setDisplaySize(SYMBOL_SIZE, SYMBOL_SIZE);
      img.setMask(mask);
      this.images.push(img);
    }
    this.refreshVisuals();
  }

  private symbolAt(offsetFromMiddle: number): SymbolType {
    const len = REEL_LENGTH;
    const idx = (((this.baseIndex + offsetFromMiddle) % len) + len) % len;
    return REEL_STRIPS[this.reelIndex][idx];
  }

  private refreshVisuals(): void {
    // 中段を基準に、上下2コマずつ（計5コマ）を配置してスクロール時の見た目を滑らかにする。
    const middleRowY = this.topY + REEL_ROW_HEIGHT * 1.5;
    for (let i = 0; i < this.visibleRows; i++) {
      const offsetFromMiddle = i - 2;
      const img = this.images[i];
      img.setTexture(this.symbolAt(offsetFromMiddle));
      img.y = middleRowY + offsetFromMiddle * REEL_ROW_HEIGHT - this.offset;
    }
  }

  startSpin(): void {
    this.state = 'SPINNING';
  }

  get isSpinning(): boolean {
    return this.state === 'SPINNING' || this.state === 'STOPPING';
  }

  get currentMiddleIndex(): number {
    return this.baseIndex;
  }

  /** 目標の最終インデックスまでスクロールを続け、なめらかに減速停止させる。 */
  stopAt(targetIndex: number, onStopped: () => void): void {
    if (this.state !== 'SPINNING') return;
    const len = REEL_LENGTH;
    const steps = ((targetIndex - this.baseIndex) % len + len) % len;
    this.remainingRows = steps === 0 ? 0 : steps;
    this.onStoppedCallback = onStopped;
    if (this.remainingRows === 0) {
      this.finishStop();
      return;
    }
    this.state = 'STOPPING';
  }

  private finishStop(): void {
    this.offset = 0;
    this.state = 'STOPPED';
    this.refreshVisuals();
    soundService.playStop();
    const cb = this.onStoppedCallback;
    this.onStoppedCallback = null;
    cb?.();
  }

  reset(): void {
    this.state = 'IDLE';
    this.offset = 0;
  }

  update(deltaMs: number): void {
    if (this.state === 'SPINNING') {
      this.offset += SPIN_SPEED * deltaMs;
      while (this.offset >= REEL_ROW_HEIGHT) {
        this.offset -= REEL_ROW_HEIGHT;
        this.baseIndex = (this.baseIndex + 1) % REEL_LENGTH;
      }
      this.refreshVisuals();
    } else if (this.state === 'STOPPING') {
      const speed = this.remainingRows <= 1 ? SPIN_SPEED * 0.3 : this.remainingRows === 2 ? SPIN_SPEED * 0.6 : SPIN_SPEED;
      this.offset += speed * deltaMs;
      while (this.offset >= REEL_ROW_HEIGHT) {
        this.offset -= REEL_ROW_HEIGHT;
        this.baseIndex = (this.baseIndex + 1) % REEL_LENGTH;
        this.remainingRows -= 1;
        if (this.remainingRows <= 0) {
          this.finishStop();
          return;
        }
      }
      this.refreshVisuals();
    }
  }
}
