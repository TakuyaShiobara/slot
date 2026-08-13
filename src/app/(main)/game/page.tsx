"use client";

import { useGame } from "@/hooks/useGame";
import { FieldView } from "@/components/game/FieldView";
import { BattleView } from "@/components/game/BattleView";

export default function GamePage() {
  const game = useGame();

  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-center font-pixel text-[12px] tracking-widest text-rpg-accent">◆ ゲーム ◆</h1>
      {game.rpg.battle ? <BattleView battle={game.rpg.battle} /> : <FieldView />}
    </div>
  );
}
