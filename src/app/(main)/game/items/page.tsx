"use client";

import { RetroPanel } from "@/components/ui/RetroPanel";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { useGame } from "@/hooks/useGame";
import { useGameStore } from "@/lib/data/store";
import { ITEMS } from "@/lib/game/items";

export default function ItemsPage() {
  const game = useGame();
  const consumeFieldItem = useGameStore((s) => s.consumeFieldItem);
  const owned = game.rpg.inventory.filter((i) => i.quantity > 0);

  return (
    <div className="flex flex-col gap-3">
      <ScreenHeader title="どうぐ" backHref="/game" />

      <RetroPanel>
        <p className="text-center text-[11px] text-rpg-text-dim">💰 ゴールド {game.rpg.gold}G</p>
      </RetroPanel>

      <RetroPanel title="もちもの">
        {owned.length === 0 ? (
          <p className="py-4 text-center text-[12px] text-rpg-text-dim">なにも もっていない</p>
        ) : (
          <div className="flex flex-col">
            {owned.map((entry, i) => {
              const item = ITEMS[entry.itemId];
              const usable = item.kind === "consumable";
              return (
                <div
                  key={entry.itemId}
                  className={`flex items-center gap-2 py-2.5 ${i > 0 ? "border-t border-rpg-border-dim/40" : ""}`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-[13px] text-rpg-text">
                      {item.name} <span className="text-rpg-text-dim">×{entry.quantity}</span>
                    </span>
                    <span className="block text-[11px] text-rpg-text-dim">{item.description}</span>
                  </span>
                  {usable && (
                    <button
                      onClick={() => consumeFieldItem(entry.itemId)}
                      className="shrink-0 border border-rpg-border-dim px-2 py-1 font-pixel text-[10px] text-rpg-accent active:bg-rpg-panel-alt"
                    >
                      つかう
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </RetroPanel>

      {game.rpg.fieldMessage && (
        <RetroPanel>
          <p className="text-center text-[12px] text-rpg-text">{game.rpg.fieldMessage}</p>
        </RetroPanel>
      )}
    </div>
  );
}
