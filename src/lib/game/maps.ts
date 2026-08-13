import type { FieldMapDef, MapId, SpecialTile, TileDef, TileKind } from "@/lib/data/types";

export const TILE_DEFS: Record<TileKind, TileDef> = {
  wall: { kind: "wall", glyph: "🌲", walkable: false, encounterRate: 0 },
  path: { kind: "path", glyph: "", walkable: true, encounterRate: 0, minLevel: 1 },
  village: { kind: "village", glyph: "🏠", walkable: true, encounterRate: 0, minLevel: 1 },
  grass: { kind: "grass", glyph: "", walkable: true, encounterRate: 0.12, minLevel: 5 },
  forest: { kind: "forest", glyph: "🌳", walkable: true, encounterRate: 0.16, minLevel: 10 },
  cave: { kind: "cave", glyph: "", walkable: true, encounterRate: 0.18, minLevel: 15 },
  door: { kind: "door", glyph: "🚪", walkable: true, encounterRate: 0, minLevel: 15 },
  chest: { kind: "chest", glyph: "📦", walkable: true, encounterRate: 0, minLevel: 1 },
  boss: { kind: "boss", glyph: "💀", walkable: true, encounterRate: 0, minLevel: 1 },
  locked: { kind: "locked", glyph: "🔒", walkable: false, encounterRate: 0, minLevel: 30, lockedLabel: "魔王城" },
};

const W: TileKind = "wall";
const P: TileKind = "path";
const V: TileKind = "village";
const G: TileKind = "grass";
const F: TileKind = "forest";
const D: TileKind = "door";
const LK: TileKind = "locked";
const C: TileKind = "chest";
const B: TileKind = "boss";
const CV: TileKind = "cave";

const OVERWORLD_TILES: TileKind[][] = [
  [W, W, W, W, W, W, W, W, W, W, W],
  [W, V, V, P, P, P, P, F, F, F, W],
  [W, V, V, P, G, G, P, F, F, F, W],
  [W, P, P, P, G, G, P, F, F, LK, W],
  [W, P, G, G, G, G, G, F, F, F, W],
  [W, P, G, G, G, G, G, F, F, F, W],
  [W, P, P, P, G, G, P, F, F, F, W],
  [W, W, W, W, D, W, W, W, W, W, W],
  [W, W, W, W, W, W, W, W, W, W, W],
];

const CAVE_TILES: TileKind[][] = [
  [W, W, W, W, W, W, W],
  [W, D, CV, CV, CV, W, W],
  [W, W, CV, W, CV, W, W],
  [W, CV, CV, CV, CV, CV, W],
  [W, CV, W, W, W, CV, W],
  [W, CV, CV, CV, CV, CV, W],
  [W, W, CV, W, CV, W, W],
  [W, C, CV, CV, CV, B, W],
  [W, W, W, W, W, W, W],
];

export const FIELD_MAPS: Record<MapId, FieldMapDef> = {
  overworld: {
    id: "overworld",
    name: "はじまりの村とその周辺",
    tiles: OVERWORLD_TILES,
    entryPoint: { x: 2, y: 2 },
    specials: {
      "4,7": { type: "warp", to: { mapId: "cave_of_beginnings", x: 1, y: 1 } },
    },
  },
  cave_of_beginnings: {
    id: "cave_of_beginnings",
    name: "はじまりの洞窟",
    tiles: CAVE_TILES,
    entryPoint: { x: 1, y: 1 },
    specials: {
      "1,1": { type: "warp", to: { mapId: "overworld", x: 4, y: 6 } },
      "1,7": { type: "chest", chestId: "cave_chest_1", itemId: "magic_potion", gold: 15 },
      "5,7": { type: "boss", monsterId: "dark_guardian" },
    },
  },
};

const OVERWORLD_ENCOUNTERS: Partial<Record<TileKind, { monsterId: string; weight: number }[]>> = {
  grass: [
    { monsterId: "slime", weight: 70 },
    { monsterId: "goblin", weight: 30 },
  ],
  forest: [
    { monsterId: "goblin", weight: 55 },
    { monsterId: "wolf", weight: 45 },
  ],
};

const CAVE_ENCOUNTERS: Partial<Record<TileKind, { monsterId: string; weight: number }[]>> = {
  cave: [
    { monsterId: "goblin", weight: 40 },
    { monsterId: "wolf", weight: 40 },
    { monsterId: "slime", weight: 20 },
  ],
};

export function encounterTableFor(mapId: MapId, tile: TileKind) {
  const table = mapId === "overworld" ? OVERWORLD_ENCOUNTERS[tile] : CAVE_ENCOUNTERS[tile];
  return table ?? [];
}

export function getTileKind(map: FieldMapDef, x: number, y: number): TileKind | null {
  if (y < 0 || y >= map.tiles.length) return null;
  const row = map.tiles[y];
  if (x < 0 || x >= row.length) return null;
  return row[x];
}

export function getSpecial(map: FieldMapDef, x: number, y: number): SpecialTile | undefined {
  return map.specials[`${x},${y}`];
}
