"use client";

import { useState } from "react";
import { RetroPanel, RetroDivider } from "@/components/ui/RetroPanel";
import { PixelButton } from "@/components/ui/PixelButton";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { MonsterSprite } from "@/components/game/MonsterSprite";
import { useCombatStats, useGame } from "@/hooks/useGame";
import { useGameStore } from "@/lib/data/store";
import { MONSTERS } from "@/lib/game/monsters";
import { ITEMS, itemName } from "@/lib/game/items";
import type { BattleState } from "@/lib/data/types";

export function BattleView({ battle }: { battle: BattleState }) {
  const game = useGame();
  const combat = useCombatStats();
  const battleAttack = useGameStore((s) => s.battleAttack);
  const battleSkill = useGameStore((s) => s.battleSkill);
  const battleItem = useGameStore((s) => s.battleItem);
  const battleFlee = useGameStore((s) => s.battleFlee);
  const finishBattle = useGameStore((s) => s.finishBattle);
  const [showItems, setShowItems] = useState(false);

  const monster = MONSTERS[battle.enemy.monsterId];
  const consumables = game.rpg.inventory.filter((i) => ITEMS[i.itemId]?.kind === "consumable" && i.quantity > 0);

  if (battle.result !== "ongoing") {
    return (
      <RetroPanel className="border-rpg-accent">
        <div className="text-center">
          {battle.result === "win" && (
            <>
              <p className="font-pixel text-[13px] text-rpg-accent rpg-blink">
                {battle.isBoss ? "しょうり！" : "たたかいに かった！"}
              </p>
              <p className="mt-3 text-[13px] text-rpg-text">{monster.name}を たおした！</p>
              <p className="mt-2 font-pixel text-[12px] text-rpg-exp">
                EXP+{monster.exp} GOLD+{battle.rewardGold ?? 0}
              </p>
              {battle.rewardItemId && (
                <p className="mt-1 text-[12px] text-rpg-accent">「{itemName(battle.rewardItemId)}」を てにいれた！</p>
              )}
              {battle.isBoss && (
                <p className="mt-3 text-[12px] text-rpg-text">
                  はじまりの洞窟を せいはした！
                  <br />
                  くろのマントが てにはいった！
                </p>
              )}
            </>
          )}
          {battle.result === "lose" && (
            <>
              <p className="font-pixel text-[13px] text-rpg-danger rpg-blink">TAKUYAは たおれた…</p>
              <p className="mt-3 text-[12px] text-rpg-text-dim">村で てあてを うけて めをさました。</p>
            </>
          )}
          {battle.result === "flee" && <p className="font-pixel text-[13px] text-rpg-text">うまく にげきれた！</p>}
        </div>
        <div className="mt-4">
          <PixelButton variant="accent" className="w-full" onClick={finishBattle}>
            ▶ つぎへ
          </PixelButton>
        </div>
      </RetroPanel>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <RetroPanel className={battle.isBoss ? "border-rpg-danger" : ""}>
        {battle.isBoss && (
          <p className="mb-1 text-center font-pixel text-[11px] tracking-widest text-rpg-danger">BOSS</p>
        )}
        <MonsterSprite monster={monster} size={88} />
        <p className="mt-2 text-center text-[13px] text-rpg-text">{monster.name}</p>
        <div className="mt-1 flex items-center gap-2">
          <ProgressBar value={battle.enemy.hp} max={battle.enemy.maxHp} color="var(--rpg-hp)" height={8} />
          <span className="shrink-0 font-pixel text-[10px] text-rpg-text-dim">
            {battle.enemy.hp}/{battle.enemy.maxHp}
          </span>
        </div>
      </RetroPanel>

      <RetroPanel contentClassName="p-2">
        <div className="max-h-24 overflow-y-auto px-1">
          {battle.log.slice(-5).map((l) => (
            <p key={l.id} className="text-[12px] text-rpg-text-dim">
              {l.text}
            </p>
          ))}
        </div>
      </RetroPanel>

      <RetroPanel>
        <p className="text-[13px] text-rpg-text">{game.character.name}</p>
        <div className="mt-1 flex items-center gap-2">
          <span className="w-6 shrink-0 font-pixel text-[10px] text-rpg-text-dim">HP</span>
          <ProgressBar value={battle.playerHp} max={combat.maxHp} color="var(--rpg-hp)" height={8} />
          <span className="shrink-0 font-pixel text-[10px]">
            {battle.playerHp}/{combat.maxHp}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <span className="w-6 shrink-0 font-pixel text-[10px] text-rpg-text-dim">MP</span>
          <ProgressBar value={battle.playerMp} max={combat.maxMp} color="var(--rpg-mp)" height={8} />
          <span className="shrink-0 font-pixel text-[10px]">
            {battle.playerMp}/{combat.maxMp}
          </span>
        </div>
      </RetroPanel>

      {!showItems ? (
        <RetroPanel contentClassName="p-0">
          <div className="flex flex-col px-3">
            <CommandButton label="たたかう" onClick={battleAttack} />
            <CommandButton label={`スキル (とくぎ MP10)`} onClick={battleSkill} />
            <CommandButton label="どうぐ" onClick={() => setShowItems(true)} />
            <CommandButton label="にげる" onClick={battleFlee} last />
          </div>
        </RetroPanel>
      ) : (
        <RetroPanel title="どうぐ">
          {consumables.length === 0 ? (
            <p className="py-2 text-center text-[12px] text-rpg-text-dim">つかえる どうぐが ない</p>
          ) : (
            <div className="flex flex-col">
              {consumables.map((entry, i) => {
                const item = ITEMS[entry.itemId];
                return (
                  <button
                    key={entry.itemId}
                    onClick={() => {
                      battleItem(entry.itemId);
                      setShowItems(false);
                    }}
                    className={`flex items-center gap-2 py-2 text-left ${i > 0 ? "border-t border-rpg-border-dim/40" : ""}`}
                  >
                    <span>{item.icon}</span>
                    <span className="flex-1 text-[12px] text-rpg-text">{item.name}</span>
                    <span className="text-[11px] text-rpg-text-dim">×{entry.quantity}</span>
                  </button>
                );
              })}
            </div>
          )}
          <RetroDivider />
          <PixelButton variant="ghost" className="w-full" onClick={() => setShowItems(false)}>
            もどる
          </PixelButton>
        </RetroPanel>
      )}
    </div>
  );
}

function CommandButton({ label, onClick, last }: { label: string; onClick: () => void; last?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 py-2.5 text-left ${last ? "" : "border-b border-rpg-border-dim/50"}`}
    >
      <span className="text-rpg-accent">▶</span>
      <span className="text-[13px] text-rpg-text">{label}</span>
    </button>
  );
}
