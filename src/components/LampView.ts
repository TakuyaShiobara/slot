import Phaser from 'phaser';
import type { LampPattern } from '@/models/types';
import { LAMP_X, LAMP_Y, LAMP_RADIUS } from '@/ui/Layout';

/**
 * オリジナルデザインの告知ランプ。通常点灯・点滅・虹色点灯（プレミア）の
 * 3パターンを演出する。実機ランプの意匠は模倣せず、単純な円形発光体として表現。
 */
export class LampView {
  private housing: Phaser.GameObjects.Arc;
  private glow: Phaser.GameObjects.Arc;
  private core: Phaser.GameObjects.Arc;
  private pattern: LampPattern = 'OFF';
  private elapsed = 0;

  constructor(scene: Phaser.Scene) {
    this.housing = scene.add.circle(LAMP_X, LAMP_Y, LAMP_RADIUS + 10, 0x1c1428);
    this.housing.setStrokeStyle(4, 0x8a6bb0, 1);
    this.glow = scene.add.circle(LAMP_X, LAMP_Y, LAMP_RADIUS + 4, 0x3a2a52, 0.6);
    this.core = scene.add.circle(LAMP_X, LAMP_Y, LAMP_RADIUS * 0.62, 0x4a3f5c, 1);

    scene.add.text(LAMP_X, LAMP_Y + LAMP_RADIUS + 26, 'CHANCE\nLAMP', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '16px',
      color: '#cbb7e0',
      align: 'center',
    }).setOrigin(0.5, 0);
  }

  setPattern(pattern: LampPattern): void {
    this.pattern = pattern;
    this.elapsed = 0;
  }

  update(deltaMs: number): void {
    this.elapsed += deltaMs;
    switch (this.pattern) {
      case 'OFF':
        this.core.setFillStyle(0x4a3f5c, 1);
        this.glow.setAlpha(0.3);
        break;
      case 'NORMAL':
        this.core.setFillStyle(0xf5c542, 1);
        this.glow.setFillStyle(0xf5c542, 1);
        this.glow.setAlpha(0.35 + Math.sin(this.elapsed / 300) * 0.1);
        break;
      case 'BLINK': {
        const on = Math.floor(this.elapsed / 140) % 2 === 0;
        this.core.setFillStyle(on ? 0xff5252 : 0x4a3f5c, 1);
        this.glow.setFillStyle(0xff5252, 1);
        this.glow.setAlpha(on ? 0.55 : 0.2);
        break;
      }
      case 'RAINBOW': {
        const hue = (this.elapsed / 20) % 360;
        const color = Phaser.Display.Color.HSVToRGB(hue / 360, 0.9, 1) as Phaser.Display.Color;
        const c = color.color;
        this.core.setFillStyle(c, 1);
        this.glow.setFillStyle(c, 1);
        this.glow.setAlpha(0.6);
        break;
      }
    }
  }
}
