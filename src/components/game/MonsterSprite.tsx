"use client";

import { PixelSprite } from "@/components/pixel/PixelSprite";
import type { MonsterDef } from "@/lib/data/types";

export function MonsterSprite({ monster, size = 96 }: { monster: MonsterDef; size?: number }) {
  return <PixelSprite grid={monster.sprite} palette={monster.palette} size={size} className="mx-auto" />;
}
