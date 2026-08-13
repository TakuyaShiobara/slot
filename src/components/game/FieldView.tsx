"use client";

import { useRef } from "react";
import Link from "next/link";
import { useCombatStats, useGame } from "@/hooks/useGame";
import { useGameStore } from "@/lib/data/store";
import { FIELD_MAPS, TILE_DEFS, getSpecial } from "@/lib/game/maps";
import { RetroPanel } from "@/components/ui/RetroPanel";
import { PixelButton } from "@/components/ui/PixelButton";
import type { TileKind } from "@/lib/data/types";

const TILE_COLOR: Record<TileKind, string> = {
  wall: "#0d3b1e",
  path: "#1a1712",
  village: "#6b4a2b",
  grass: "#2e7d32",
  forest: "#1b4d1f",
  cave: "#332a24",
  door: "#2a2a2a",
  chest: "#332a24",
  boss: "#241033",
  locked: "#111111",
};

const TILE_SIZE = 28;

export function FieldView() {
  const game = useGame();
  const movePlayer = useGameStore((s) => s.movePlayer);
  const clearFieldMessage = useGameStore((s) => s.clearFieldMessage);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const { rpg, character } = game;
  const map = FIELD_MAPS[rpg.position.mapId];
  const combat = useCombatStats();

  function handleTouchStart(e: React.TouchEvent) {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (!touchStart.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.current.x;
    const dy = t.clientY - touchStart.current.y;
    touchStart.current = null;
    const threshold = 24;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < threshold) return;
    if (Math.abs(dx) > Math.abs(dy)) {
      movePlayer(dx > 0 ? 1 : -1, 0);
    } else {
      movePlayer(0, dy > 0 ? 1 : -1);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <RetroPanel>
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-rpg-text-dim">{map.name}</span>
          <span className="text-rpg-accent">💰 {rpg.gold}G</span>
        </div>
        <div className="mt-1 flex items-center gap-3 text-[11px]">
          <span>
            HP <span className="font-pixel text-rpg-hp">{rpg.hp}/{combat.maxHp}</span>
          </span>
          <span>
            MP <span className="font-pixel text-rpg-mp">{rpg.mp}/{combat.maxMp}</span>
          </span>
        </div>
      </RetroPanel>

      <div className="flex gap-2">
        <Link href="/game/equipment" className="flex-1">
          <PixelButton className="w-full">そうび</PixelButton>
        </Link>
        <Link href="/game/items" className="flex-1">
          <PixelButton className="w-full">どうぐ</PixelButton>
        </Link>
      </div>

      <div
        className="rpg-panel relative mx-auto overflow-hidden"
        style={{ width: map.tiles[0].length * TILE_SIZE, height: map.tiles.length * TILE_SIZE }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {map.tiles.map((row, y) =>
          row.map((kind, x) => {
            const def = TILE_DEFS[kind];
            const locked = kind === "locked" || (def.minLevel ? character.level < def.minLevel : false);
            const special = getSpecial(map, x, y);
            const chestOpened =
              kind === "chest" && special?.type === "chest" && rpg.openedChestIds.includes(special.chestId);
            const bossGone = kind === "boss" && rpg.bossDefeated;
            return (
              <div
                key={`${x},${y}`}
                className="absolute flex items-center justify-center text-[13px]"
                style={{
                  left: x * TILE_SIZE,
                  top: y * TILE_SIZE,
                  width: TILE_SIZE,
                  height: TILE_SIZE,
                  background: TILE_COLOR[kind],
                  opacity: locked && kind !== "locked" ? 0.55 : 1,
                }}
              >
                {kind === "chest" && !chestOpened && def.glyph}
                {kind === "boss" && !bossGone && def.glyph}
                {kind !== "chest" && kind !== "boss" && def.glyph}
              </div>
            );
          })
        )}
        <div
          className="absolute flex items-center justify-center text-[15px] transition-all duration-150"
          style={{ left: rpg.position.x * TILE_SIZE, top: rpg.position.y * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE }}
        >
          🧙
        </div>
      </div>

      {rpg.fieldMessage && (
        <RetroPanel>
          <p className="text-center text-[12px] text-rpg-text">{rpg.fieldMessage}</p>
          <div className="mt-2">
            <PixelButton className="w-full" onClick={clearFieldMessage}>
              ▶ つぎへ
            </PixelButton>
          </div>
        </RetroPanel>
      )}

      <div className="mx-auto grid w-[150px] grid-cols-3 gap-1">
        <div />
        <DirButton label="▲" onClick={() => movePlayer(0, -1)} />
        <div />
        <DirButton label="◀" onClick={() => movePlayer(-1, 0)} />
        <div className="rpg-panel-inset flex items-center justify-center text-rpg-text-dim">✦</div>
        <DirButton label="▶" onClick={() => movePlayer(1, 0)} />
        <div />
        <DirButton label="▼" onClick={() => movePlayer(0, 1)} />
        <div />
      </div>
      <p className="text-center text-[10px] text-rpg-text-dim">方向キー か スワイプで いどう</p>
    </div>
  );
}

function DirButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rpg-panel-inset flex h-11 w-11 items-center justify-center text-lg text-rpg-text active:bg-rpg-panel-alt"
    >
      {label}
    </button>
  );
}
