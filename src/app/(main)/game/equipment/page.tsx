"use client";

import { useState } from "react";
import { RetroPanel, RetroDivider } from "@/components/ui/RetroPanel";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { PixelButton } from "@/components/ui/PixelButton";
import { useCombatStats, useGame } from "@/hooks/useGame";
import { useGameStore } from "@/lib/data/store";
import { ITEMS } from "@/lib/game/items";
import type { EquipSlot, ItemKind } from "@/lib/data/types";

const SLOTS: { slot: EquipSlot; label: string; kind: ItemKind }[] = [
  { slot: "weapon", label: "ぶき", kind: "weapon" },
  { slot: "armor", label: "よろい", kind: "armor" },
  { slot: "shield", label: "たて", kind: "shield" },
  { slot: "accessory", label: "アクセサリー", kind: "accessory" },
];

function statLabel(item: (typeof ITEMS)[string]): string {
  const parts: string[] = [];
  if (item.atk) parts.push(`ATK +${item.atk}`);
  if (item.def) parts.push(`DEF +${item.def}`);
  if (item.mag) parts.push(`MAG +${item.mag}`);
  return parts.join(" / ");
}

export default function EquipmentPage() {
  const game = useGame();
  const combat = useCombatStats();
  const equipItem = useGameStore((s) => s.equipItem);
  const [pickerSlot, setPickerSlot] = useState<EquipSlot | null>(null);

  const ownedIdsByKind = (kind: ItemKind) =>
    game.rpg.inventory.filter((i) => ITEMS[i.itemId]?.kind === kind).map((i) => i.itemId);

  return (
    <div className="flex flex-col gap-3">
      <ScreenHeader title="そうび" backHref="/game" />

      <RetroPanel>
        <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
          <div>
            <p className="text-rpg-text-dim">ATK</p>
            <p className="font-pixel text-rpg-str">{combat.atk}</p>
          </div>
          <div>
            <p className="text-rpg-text-dim">DEF</p>
            <p className="font-pixel text-rpg-vit">{combat.def}</p>
          </div>
          <div>
            <p className="text-rpg-text-dim">MAG</p>
            <p className="font-pixel text-rpg-int">{combat.mag}</p>
          </div>
        </div>
      </RetroPanel>

      <RetroPanel title="✦ そうび ✦">
        <div className="flex flex-col">
          {SLOTS.map(({ slot, label }, i) => {
            const itemId = game.rpg.equipment[slot];
            const item = itemId ? ITEMS[itemId] : null;
            return (
              <button
                key={slot}
                onClick={() => setPickerSlot(slot)}
                className={`w-full py-2.5 text-left ${i > 0 ? "border-t border-rpg-border-dim/50" : ""}`}
              >
                <p className="text-[11px] text-rpg-text-dim">{label}</p>
                <div className="flex items-center gap-2">
                  <span className="text-rpg-accent">▶</span>
                  <span className="text-[13px] text-rpg-text">{item ? item.name : "なし"}</span>
                </div>
                {item && <p className="pl-5 text-[11px] text-rpg-exp">{statLabel(item)}</p>}
              </button>
            );
          })}
        </div>
      </RetroPanel>

      {pickerSlot && (
        <RetroPanel title={`${SLOTS.find((s) => s.slot === pickerSlot)?.label} をえらぶ`}>
          <div className="flex flex-col">
            <button
              onClick={() => {
                equipItem(pickerSlot, null);
                setPickerSlot(null);
              }}
              className="border-b border-rpg-border-dim/40 py-2 text-left text-[13px] text-rpg-text-dim"
            >
              なし
            </button>
            {ownedIdsByKind(SLOTS.find((s) => s.slot === pickerSlot)!.kind).map((itemId) => {
              const item = ITEMS[itemId];
              return (
                <button
                  key={itemId}
                  onClick={() => {
                    equipItem(pickerSlot, itemId);
                    setPickerSlot(null);
                  }}
                  className="border-b border-rpg-border-dim/40 py-2 text-left last:border-b-0"
                >
                  <span className="text-[13px] text-rpg-text">{item.name}</span>
                  <span className="ml-2 text-[11px] text-rpg-exp">{statLabel(item)}</span>
                </button>
              );
            })}
          </div>
          <RetroDivider />
          <PixelButton variant="ghost" className="w-full" onClick={() => setPickerSlot(null)}>
            キャンセル
          </PixelButton>
        </RetroPanel>
      )}
    </div>
  );
}
