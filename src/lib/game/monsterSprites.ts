// モンスターのドット絵。ヒーローと同じbox-shadow積み上げ方式で、
// 既存作品の素材を使わないオリジナルデザインにしている。

export const SLIME_GRID: string[] = [
  "............",
  "...GGGGGG...",
  "..GHHHHHHG..",
  ".GHHWHHWHHG.",
  ".GHHHKHKHHG.",
  ".GHHHHHHHHG.",
  "..GggggggG..",
  "...gg..gg...",
];
export const SLIME_PALETTE: Record<string, string> = {
  G: "#1c6b2e",
  H: "#4fd15a",
  W: "#ffffff",
  K: "#141414",
  g: "#2e8f3d",
};

export const GOBLIN_GRID: string[] = [
  "............",
  "..GGGGGGGG..",
  ".GGGKGGGKGG.",
  ".GGGGGGGGGG.",
  "..GGGGGGGG..",
  "...GGGGGG...",
  "..EEEEEEEE..",
  ".EEEEEEEEEE.",
  ".mEEEEEEEEm.",
  ".mmEEEEEEmm.",
  "...EE..EE...",
  "...EE..EE...",
  "..DD....DD..",
  "............",
];
export const GOBLIN_PALETTE: Record<string, string> = {
  G: "#4a8a2c",
  K: "#141414",
  E: "#4a8a2c",
  m: "#5c3a20",
  D: "#231b12",
};

export const WOLF_GRID: string[] = [
  ".........WW.......",
  ".......WWWWWW.....",
  "......WEWWWEWW....",
  "......WWKWWKWW....",
  ".....WWWWWWWWWW...",
  "....WWWWWWWWWWWW..",
  "...wwWWWWWWWWWWww.",
  "...ww.WWWWWWWW.ww.",
  "...ww.WW....WW.ww.",
  "......WW....WW....",
  "......dd....dd....",
];
export const WOLF_PALETTE: Record<string, string> = {
  W: "#9aa0a8",
  w: "#5b6168",
  E: "#ffcc33",
  K: "#141414",
  d: "#2a2a2a",
};

export const BOSS_GRID: string[] = [
  "......RR........",
  ".....RRRR.......",
  "....PPPPPP......",
  "...PPPPPPPP.....",
  "..PPPeEPePeP....",
  "..PPPeEPePeP....",
  "..PPPPPPPPPP....",
  ".PPPPPPPPPPPP...",
  ".PPPPPPPPPPPP...",
  ".PPpPPPPPPpP....",
  ".PPpPPPPPPpP....",
  ".PPpPPPPPPpP....",
  ".PPpPPPPPPpP....",
  ".PPpPPPPPPpP....",
  "..PpP....PpP....",
  "..PpP....PpP....",
  "..PpP....PpP....",
  ".DDD......DDD...",
  ".DDD......DDD...",
  "................",
];
export const BOSS_PALETTE: Record<string, string> = {
  R: "#b0202a",
  P: "#241033",
  p: "#150a1f",
  e: "#ff3355",
  E: "#ff3355",
  D: "#0d0710",
};
