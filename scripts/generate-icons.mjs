// PWAアイコンを生成するスクリプト。外部画像素材を一切使わず、
// ドット絵の「経験値クリスタル」エンブレムを座標計算だけで生成し、sharpでPNG化する。
// 使い方: node scripts/generate-icons.mjs
import sharp from "sharp";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const GRID = 32; // 32x32のドットグリッド
const CX = (GRID - 1) / 2;
const CY = (GRID - 1) / 2;
const OUTER_R = 12.5;
const INNER_R = 6.5;

const BG = "#000000";
const BORDER = "#ffffff";
const GOLD = "#ffd700";
const GOLD_LIGHT = "#fff3b0";
const GOLD_DARK = "#c99b00";

function cellColor(x, y) {
  const dx = x - CX;
  const dy = y - CY;
  const dist = Math.abs(dx) + Math.abs(dy); // マンハッタン距離でダイヤ形に
  if (dist > OUTER_R) return null;
  if (dist > OUTER_R - 1.2) return BORDER;
  if (dist <= INNER_R) {
    // 内側のファセット(ハイライト)
    if (dx - dy < -1) return GOLD_LIGHT;
    if (dx - dy > 3) return GOLD_DARK;
    return GOLD;
  }
  if (dx - dy > 6) return GOLD_DARK;
  return GOLD;
}

function buildSvg(size) {
  const cell = size / GRID;
  let rects = `<rect width="${size}" height="${size}" fill="${BG}"/>`;
  for (let y = 0; y < GRID; y++) {
    for (let x = 0; x < GRID; x++) {
      const c = cellColor(x, y);
      if (!c) continue;
      rects += `<rect x="${x * cell}" y="${y * cell}" width="${cell}" height="${cell}" fill="${c}"/>`;
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${rects}</svg>`;
}

async function main() {
  const outDir = path.join(process.cwd(), "public", "icons");
  mkdirSync(outDir, { recursive: true });

  const targets = [
    { name: "icon-192.png", size: 192 },
    { name: "icon-512.png", size: 512 },
    { name: "maskable-512.png", size: 512 },
    { name: "apple-touch-icon.png", size: 180 },
  ];

  for (const t of targets) {
    const svg = buildSvg(t.size);
    const buf = Buffer.from(svg);
    await sharp(buf).png().toFile(path.join(outDir, t.name));
    console.log("generated", t.name);
  }

  // favicon用に小さいSVGも書き出す
  writeFileSync(path.join(process.cwd(), "src", "app", "icon.svg"), buildSvg(64));
  console.log("generated src/app/icon.svg");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
