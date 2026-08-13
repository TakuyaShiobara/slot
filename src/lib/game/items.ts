import type { ItemDef } from "@/lib/data/types";

export const ITEMS: Record<string, ItemDef> = {
  potion: {
    id: "potion",
    name: "やくそう",
    kind: "consumable",
    icon: "🌿",
    description: "HPを30回復する",
    sellPrice: 5,
    healHp: 30,
  },
  magic_potion: {
    id: "magic_potion",
    name: "まほうのくすり",
    kind: "consumable",
    icon: "💧",
    description: "MPを20回復する",
    sellPrice: 8,
    healMp: 20,
  },
  sword_traveler: {
    id: "sword_traveler",
    name: "たびびとのつるぎ",
    kind: "weapon",
    icon: "🗡",
    description: "ATK +5",
    sellPrice: 20,
    atk: 5,
  },
  leather_armor: {
    id: "leather_armor",
    name: "かわのよろい",
    kind: "armor",
    icon: "🛡",
    description: "DEF +3",
    sellPrice: 15,
    def: 3,
  },
  wood_shield: {
    id: "wood_shield",
    name: "きのたて",
    kind: "shield",
    icon: "🛡",
    description: "DEF +2",
    sellPrice: 10,
    def: 2,
  },
  goblin_club: {
    id: "goblin_club",
    name: "ゴブリンのこん棒",
    kind: "weapon",
    icon: "🏏",
    description: "ATK +7",
    sellPrice: 18,
    atk: 7,
  },
  wolf_fang: {
    id: "wolf_fang",
    name: "おおかみのきば",
    kind: "material",
    icon: "🦷",
    description: "ウルフの素材。売却できる。",
    sellPrice: 12,
  },
  dark_cloak: {
    id: "dark_cloak",
    name: "くろのマント",
    kind: "accessory",
    icon: "🧥",
    description: "DEF +4 / MAG +3。闇の番人を倒した証。",
    sellPrice: 80,
    def: 4,
    mag: 3,
  },
};

export function itemName(id: string): string {
  return ITEMS[id]?.name ?? id;
}
