import Phaser from 'phaser';
import type { SymbolType } from '@/models/types';

const PALETTE: Record<SymbolType, { main: number; accent: number }> = {
  FRUIT: { main: 0xe8442b, accent: 0x3f9142 },
  STAR: { main: 0xf5c542, accent: 0xffe9a6 },
  BELL: { main: 0xf2b632, accent: 0xfff2cf },
  CLOVER: { main: 0x2f9e56, accent: 0x8be3a8 },
  REPLAY: { main: 0x3a86d8, accent: 0xbfe0ff },
  LUCKY: { main: 0xb23a6b, accent: 0xffd76b },
  BLANK: { main: 0x4a3f5c, accent: 0x6c5c85 },
};

/**
 * 各図柄をベクター図形として描画し、Phaserテクスチャとして焼き込む。
 * 実在スロット機の図柄・ロゴを一切参照せず、シンプルな幾何形状で構成したオリジナルデザイン。
 */
export function generateSymbolTextures(scene: Phaser.Scene, size: number): void {
  (Object.keys(PALETTE) as SymbolType[]).forEach((key) => {
    const g = scene.make.graphics({ x: 0, y: 0 }, false);
    const c = PALETTE[key];
    const cx = size / 2;
    const cy = size / 2;

    // 背景の丸い台座（すべての図柄共通の土台で統一感を出す）。
    g.fillStyle(0x1c1428, 1);
    g.fillRoundedRect(2, 2, size - 4, size - 4, 14);
    g.lineStyle(3, c.main, 1);
    g.strokeRoundedRect(2, 2, size - 4, size - 4, 14);

    switch (key) {
      case 'FRUIT': {
        g.fillStyle(c.main, 1);
        g.fillCircle(cx - size * 0.14, cy + size * 0.06, size * 0.2);
        g.fillCircle(cx + size * 0.14, cy + size * 0.06, size * 0.2);
        g.fillStyle(c.accent, 1);
        g.fillTriangle(
          cx - size * 0.05, cy - size * 0.18,
          cx + size * 0.12, cy - size * 0.3,
          cx + size * 0.18, cy - size * 0.12,
        );
        break;
      }
      case 'STAR': {
        g.fillStyle(c.main, 1);
        drawStar(g, cx, cy, 5, size * 0.32, size * 0.14);
        break;
      }
      case 'BELL': {
        g.fillStyle(c.main, 1);
        g.fillEllipse(cx, cy - size * 0.02, size * 0.42, size * 0.4);
        g.fillRect(cx - size * 0.22, cy + size * 0.1, size * 0.44, size * 0.08);
        g.fillStyle(c.accent, 1);
        g.fillCircle(cx, cy + size * 0.26, size * 0.06);
        break;
      }
      case 'CLOVER': {
        g.fillStyle(c.main, 1);
        const r = size * 0.16;
        g.fillCircle(cx - r, cy - r, r);
        g.fillCircle(cx + r, cy - r, r);
        g.fillCircle(cx - r, cy + r, r);
        g.fillCircle(cx + r, cy + r, r);
        g.fillStyle(0x1c1428, 1);
        g.fillRect(cx - size * 0.03, cy + r, size * 0.06, size * 0.2);
        break;
      }
      case 'REPLAY': {
        g.lineStyle(size * 0.1, c.main, 1);
        g.beginPath();
        g.arc(cx, cy, size * 0.26, Phaser.Math.DegToRad(-40), Phaser.Math.DegToRad(220), false);
        g.strokePath();
        g.fillStyle(c.main, 1);
        g.fillTriangle(
          cx + size * 0.24, cy - size * 0.2,
          cx + size * 0.4, cy - size * 0.12,
          cx + size * 0.22, cy - size * 0.02,
        );
        break;
      }
      case 'LUCKY': {
        g.fillStyle(c.main, 1);
        g.fillRect(cx - size * 0.22, cy - size * 0.26, size * 0.44, size * 0.09);
        g.fillTriangle(
          cx + size * 0.22, cy - size * 0.26,
          cx - size * 0.06, cy + size * 0.28,
          cx + size * 0.1, cy + size * 0.28,
        );
        g.fillStyle(c.accent, 1);
        drawStar(g, cx - size * 0.26, cy + size * 0.24, 4, size * 0.08, size * 0.03);
        break;
      }
      case 'BLANK': {
        g.fillStyle(c.main, 0.5);
        g.fillRect(cx - size * 0.24, cy - size * 0.04, size * 0.48, size * 0.08);
        break;
      }
    }

    g.generateTexture(key, size, size);
    g.destroy();
  });
}

function drawStar(
  g: Phaser.GameObjects.Graphics,
  cx: number,
  cy: number,
  points: number,
  outerR: number,
  innerR: number,
): void {
  const step = Math.PI / points;
  const path: number[] = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = -Math.PI / 2 + i * step;
    path.push(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
  }
  g.beginPath();
  g.moveTo(path[0], path[1]);
  for (let i = 2; i < path.length; i += 2) {
    g.lineTo(path[i], path[i + 1]);
  }
  g.closePath();
  g.fillPath();
}
