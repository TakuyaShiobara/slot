"use client";

import { useMemo } from "react";
import { gridToBoxShadow } from "@/components/character/pixelGrid";

export function PixelSprite({
  grid,
  palette,
  size = 96,
  className = "",
}: {
  grid: string[];
  palette: Record<string, string>;
  size?: number;
  className?: string;
}) {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 1;
  const px = Math.max(1, Math.floor(size / Math.max(rows, cols)));
  const boxShadow = useMemo(() => gridToBoxShadow(grid, palette, px), [grid, palette, px]);

  return (
    <div
      className={className}
      style={{ position: "relative", width: cols * px, height: rows * px }}
      role="img"
    >
      <div style={{ position: "absolute", top: 0, left: 0, width: px, height: px, boxShadow }} />
    </div>
  );
}
