// 16x18のドット絵ヒーローを定義する。box-shadowを積み上げて描画するテクニックにより
// 追加の画像アセットなしで純粋なCSSだけでピクセルアートを表示する。
export const HERO_PALETTE: Record<string, string> = {
  R: "#cc3333", // 兜の羽根
  B: "#2b5fd9", // 兜
  S: "#eab383", // 肌
  K: "#141414", // 輪郭・目
  G: "#ffd700", // 金の縁取り
  A: "#3d6fe0", // 鎧(明)
  a: "#254a9e", // 鎧(暗)
  L: "#8a5a2b", // 革ベルト・ブーツ
};

// 行=Y、各文字が1ピクセル。'.' は透明。16列 x 20行。
export const HERO_GRID: string[] = [
  "...R.......R....",
  "..RRR.....RRR...",
  "..BBBBBBBBBBBB..",
  ".BBBBBBBBBBBBBB.",
  ".BBBBBBBBBBBBBB.",
  "..SSSSSSSSSSSS..",
  "..SSSKSSSSKSSS..",
  "..SSSSSSSSSSSS..",
  "..GAAAAAAAAAAG..",
  "..AAaAGGGGAaAA..",
  "..AAAAAAAAAAAA..",
  "..SAAAAAAAAAAS..",
  "...AALLLLLLAA...",
  "...AALLLLLLAA...",
  "...aA.LLLL.Aa...",
  "...aA.LLLL.Aa...",
  "...LLLL..LLLL...",
  "...LLLL..LLLL...",
  "...KKKK..KKKK...",
  "................",
];

export function gridToBoxShadow(grid: string[], palette: Record<string, string>, px: number): string {
  const shadows: string[] = [];
  grid.forEach((row, y) => {
    row.split("").forEach((ch, x) => {
      const color = palette[ch];
      if (!color) return;
      shadows.push(`${x * px}px ${y * px}px 0 ${color}`);
    });
  });
  return shadows.join(",");
}

export const HERO_COLS = HERO_GRID[0]?.length ?? 16;
export const HERO_ROWS = HERO_GRID.length;
