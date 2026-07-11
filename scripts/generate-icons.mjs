// PWAアイコンをコード上で生成するスクリプト（外部画像素材を使わず、オリジナルの図形のみで構成）。
import { PNG } from 'pngjs';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'public', 'icons');
mkdirSync(outDir, { recursive: true });

const BG = [13, 7, 20]; // #0d0714
const PANEL = [28, 20, 40]; // #1c1428
const GOLD = [245, 197, 66]; // #f5c542
const ACCENT = [178, 58, 107]; // #b23a6b

function inRoundedRect(x, y, w, h, size, radius) {
  const rx = Math.min(Math.max(x - w / 2, -w / 2), w / 2);
  const ry = Math.min(Math.max(y - h / 2, -h / 2), h / 2);
  const hw = w / 2 - radius;
  const hh = h / 2 - radius;
  const dx = Math.max(Math.abs(rx) - hw, 0);
  const dy = Math.max(Math.abs(ry) - hh, 0);
  return dx * dx + dy * dy <= radius * radius;
}

function drawIcon(size, maskable) {
  const png = new PNG({ width: size, height: size });
  const margin = maskable ? size * 0.18 : size * 0.06; // maskableはセーフゾーンを広めに確保
  const contentSize = size - margin * 2;
  const cx = size / 2;
  const cy = size / 2;
  const radius = contentSize * 0.18;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (size * y + x) << 2;
      let color = BG;

      const rx = x - cx;
      const ry = y - cy;
      if (inRoundedRect(rx, ry, contentSize, contentSize, size, radius)) {
        color = PANEL;

        // 「7」を模したオリジナルのラッキーシンボル（ゲーム内図柄と統一デザイン）。
        const s = contentSize;
        const barTop = -s * 0.22;
        const barBottom = -s * 0.1;
        const barLeft = -s * 0.19;
        const barRight = s * 0.19;
        if (ry >= barTop && ry <= barBottom && rx >= barLeft && rx <= barRight) {
          color = GOLD;
        } else {
          // 斜め棒（バーの右端から左下に向かう三角形帯）
          const t = (ry - barBottom) / (s * 0.5);
          const diagCenter = barRight - t * (s * 0.42);
          if (ry > barBottom && ry < s * 0.28 && Math.abs(rx - diagCenter) < s * 0.09) {
            color = GOLD;
          }
        }

        // 左下のアクセントスター用ドット
        const starDx = rx - -s * 0.22;
        const starDy = ry - s * 0.22;
        if (starDx * starDx + starDy * starDy < (s * 0.045) * (s * 0.045)) {
          color = ACCENT;
        }
      }

      png.data[idx] = color[0];
      png.data[idx + 1] = color[1];
      png.data[idx + 2] = color[2];
      png.data[idx + 3] = 255;
    }
  }
  return png;
}

function save(png, name) {
  const buf = PNG.sync.write(png);
  writeFileSync(join(outDir, name), buf);
  console.log('generated', name);
}

save(drawIcon(192, false), 'icon-192.png');
save(drawIcon(512, false), 'icon-512.png');
save(drawIcon(512, true), 'icon-512-maskable.png');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="12" fill="#0d0714"/>
  <rect x="6" y="6" width="52" height="52" rx="10" fill="#1c1428"/>
  <rect x="20" y="18" width="24" height="8" fill="#f5c542"/>
  <polygon points="44,26 26,50 34,50" fill="#f5c542"/>
  <circle cx="18" cy="46" r="3" fill="#b23a6b"/>
</svg>`;
writeFileSync(join(outDir, 'favicon.svg'), svg);
console.log('generated favicon.svg');
