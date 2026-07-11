import Phaser from 'phaser';

export interface ButtonOptions {
  width: number;
  height: number;
  label: string;
  color?: number;
  textColor?: string;
  fontSize?: number;
  onPress?: () => void;
  radius?: number;
}

/**
 * タップしやすい丸角ボタン。スマホでの押しやすさを優先し、
 * 押下時にへこむようなスケールアニメーションを行う。
 */
export class Button extends Phaser.GameObjects.Container {
  private bg: Phaser.GameObjects.Graphics;
  private label: Phaser.GameObjects.Text;
  private color: number;
  private disabled = false;

  constructor(scene: Phaser.Scene, x: number, y: number, opts: ButtonOptions) {
    super(scene, x, y);
    this.color = opts.color ?? 0x8a2be2;
    const radius = opts.radius ?? 18;

    this.bg = scene.make.graphics({ x: 0, y: 0 }, false);
    this.drawBackground(this.bg, opts.width, opts.height, radius, this.color);
    this.add(this.bg);

    this.label = scene.add.text(0, 0, opts.label, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: `${opts.fontSize ?? 24}px`,
      color: opts.textColor ?? '#ffffff',
      fontStyle: 'bold',
      align: 'center',
    });
    this.label.setOrigin(0.5);
    this.add(this.label);

    const hitArea = new Phaser.Geom.Rectangle(-opts.width / 2, -opts.height / 2, opts.width, opts.height);
    this.setInteractive({ hitArea, hitAreaCallback: Phaser.Geom.Rectangle.Contains, useHandCursor: true });

    this.on('pointerdown', () => {
      if (this.disabled) return;
      this.setScale(0.94);
    });
    this.on('pointerup', () => {
      this.setScale(1);
      if (!this.disabled) opts.onPress?.();
    });
    this.on('pointerout', () => this.setScale(1));

    scene.add.existing(this);
  }

  private drawBackground(g: Phaser.GameObjects.Graphics, w: number, h: number, radius: number, color: number): void {
    g.clear();
    const alpha = this.disabled ? 0.4 : 1;
    g.fillStyle(0x0d0714, alpha);
    g.fillRoundedRect(-w / 2 + 3, -h / 2 + 5, w, h, radius);
    g.fillStyle(color, alpha);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, radius);
    g.lineStyle(3, 0xffffff, 0.25 * alpha);
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, radius);
  }

  setDisabled(disabled: boolean, width: number, height: number, radius = 18): void {
    this.disabled = disabled;
    this.drawBackground(this.bg, width, height, radius, this.color);
    this.label.setAlpha(disabled ? 0.5 : 1);
  }

  setLabel(text: string): void {
    this.label.setText(text);
  }
}
