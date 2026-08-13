"use client";

import { useMemo } from "react";
import { HERO_GRID, HERO_PALETTE, HERO_COLS, HERO_ROWS, gridToBoxShadow } from "./pixelGrid";

export function CharacterSprite({ size = 128, className = "" }: { size?: number; className?: string }) {
  const px = Math.max(1, Math.floor(size / HERO_ROWS));
  const boxShadow = useMemo(() => gridToBoxShadow(HERO_GRID, HERO_PALETTE, px), [px]);

  return (
    <div
      className={`relative ${className}`}
      style={{ width: HERO_COLS * px, height: HERO_ROWS * px }}
      aria-label="キャラクター"
      role="img"
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: px,
          height: px,
          boxShadow,
        }}
      />
    </div>
  );
}
