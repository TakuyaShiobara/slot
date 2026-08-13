"use client";

import { RetroPanel } from "@/components/ui/RetroPanel";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { useGame } from "@/hooks/useGame";
import { useGameStore } from "@/lib/data/store";
import { TITLE_DEFS } from "@/lib/game/titles";

export default function TitlesPage() {
  const game = useGame();
  const setCurrentTitle = useGameStore((s) => s.setCurrentTitle);
  const sorted = [...TITLE_DEFS].sort((a, b) => a.priority - b.priority);

  return (
    <div className="flex flex-col gap-3">
      <ScreenHeader title="称号" />

      <RetroPanel>
        <p className="text-center text-[11px] text-rpg-text-dim">
          称号をえらぶと、プロフィールに表示されます
        </p>
      </RetroPanel>

      <RetroPanel contentClassName="p-0">
        <div className="px-3">
          {sorted.map((title, i) => {
            const unlocked = game.unlockedTitleIds.includes(title.id);
            const selected = game.character.currentTitleId === title.id;
            return (
              <button
                key={title.id}
                disabled={!unlocked}
                onClick={() => setCurrentTitle(title.id)}
                className={`flex w-full items-start gap-2 py-2.5 text-left disabled:opacity-40 ${
                  i > 0 ? "border-t border-rpg-border-dim/50" : ""
                }`}
              >
                <span className={unlocked ? "text-rpg-exp" : "text-rpg-text-dim"}>
                  {unlocked ? (selected ? "◉" : "✓") : "🔒"}
                </span>
                <span className="flex-1 min-w-0">
                  <span className={`block text-[13px] ${selected ? "text-rpg-accent" : "text-rpg-text"}`}>
                    {title.name}
                  </span>
                  <span className="block text-[11px] text-rpg-text-dim">{title.description}</span>
                </span>
              </button>
            );
          })}
        </div>
      </RetroPanel>
    </div>
  );
}
