"use client";

import { useMemo, useState } from "react";
import { RetroPanel, RetroDivider } from "@/components/ui/RetroPanel";
import { PixelButton } from "@/components/ui/PixelButton";
import { useGameStore } from "@/lib/data/store";
import { useGame } from "@/hooks/useGame";
import { ACTIVITY_CATEGORY_LIST } from "@/lib/game/categories";
import type { ActivityCategoryId } from "@/lib/data/types";
import { formatDateJa, formatTime } from "@/lib/format";

const DURATION_PRESETS = [10, 15, 20, 30, 45, 60, 90];

export default function AdventurePage() {
  const game = useGame();
  const recordActivity = useGameStore((s) => s.recordActivity);
  const [step, setStep] = useState<"closed" | "category" | "minutes">("closed");
  const [category, setCategory] = useState<ActivityCategoryId | null>(null);
  const [minutes, setMinutes] = useState<number>(30);

  const today = new Date();
  const todayEntries = useMemo(() => {
    const todayStr = today.toISOString().slice(0, 10);
    return game.activityLog.filter((a) => a.timestamp.slice(0, 10) === todayStr);
  }, [game.activityLog]); // eslint-disable-line react-hooks/exhaustive-deps

  function openForm() {
    setStep("category");
    setCategory(null);
  }

  function pickCategory(id: ActivityCategoryId) {
    setCategory(id);
    setStep("minutes");
  }

  function submit() {
    if (!category) return;
    recordActivity(category, minutes);
    setStep("closed");
    setCategory(null);
    setMinutes(30);
  }

  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-center font-pixel text-[12px] tracking-widest text-rpg-accent">◆ 冒険 ◆</h1>
      <RetroPanel>
        <p className="text-center text-[12px] text-rpg-text-dim">{formatDateJa(today)}</p>
      </RetroPanel>

      <RetroPanel title="今日のきろく">
        {todayEntries.length === 0 ? (
          <p className="py-4 text-center text-[12px] text-rpg-text-dim">まだ記録がありません</p>
        ) : (
          <div className="flex flex-col">
            {todayEntries.map((entry, i) => {
              const def = ACTIVITY_CATEGORY_LIST.find((c) => c.id === entry.categoryId)!;
              return (
                <div key={entry.id}>
                  {i > 0 && <div className="border-t border-rpg-border-dim/50" />}
                  <div className="flex items-center gap-2 py-2">
                    <span className="text-rpg-accent">▶</span>
                    <span className="text-base">{def.icon}</span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-[13px] text-rpg-text">{def.name}</span>
                      <span className="block text-[11px] text-rpg-text-dim">
                        {formatTime(new Date(entry.timestamp))}　{entry.minutes}分
                      </span>
                    </span>
                    <span className="font-pixel text-[11px] text-rpg-exp">EXP+{entry.exp}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </RetroPanel>

      {step === "closed" && (
        <PixelButton variant="accent" className="w-full" onClick={openForm}>
          ＋ 冒険を記録する
        </PixelButton>
      )}

      {step === "category" && (
        <RetroPanel title="なにをした？">
          <div className="grid grid-cols-2 gap-2">
            {ACTIVITY_CATEGORY_LIST.map((c) => (
              <button
                key={c.id}
                onClick={() => pickCategory(c.id)}
                className="rpg-panel-inset flex items-center gap-2 px-2 py-2.5 text-left hover:bg-rpg-panel-alt"
              >
                <span className="text-base">{c.icon}</span>
                <span className="text-[12px] text-rpg-text">{c.name}</span>
              </button>
            ))}
          </div>
          <div className="mt-3">
            <PixelButton variant="ghost" className="w-full" onClick={() => setStep("closed")}>
              キャンセル
            </PixelButton>
          </div>
        </RetroPanel>
      )}

      {step === "minutes" && category && (
        <RetroPanel title="なんぷん？">
          <p className="mb-2 text-center text-[12px] text-rpg-text-dim">
            {ACTIVITY_CATEGORY_LIST.find((c) => c.id === category)?.icon}{" "}
            {ACTIVITY_CATEGORY_LIST.find((c) => c.id === category)?.name}
          </p>
          <div className="grid grid-cols-4 gap-2">
            {DURATION_PRESETS.map((m) => (
              <button
                key={m}
                onClick={() => setMinutes(m)}
                className={`rpg-panel-inset py-2 font-pixel text-[11px] ${
                  minutes === m ? "border-rpg-accent text-rpg-accent" : "text-rpg-text"
                }`}
              >
                {m}分
              </button>
            ))}
          </div>
          <RetroDivider />
          <div className="flex gap-2">
            <PixelButton variant="ghost" className="flex-1" onClick={() => setStep("category")}>
              もどる
            </PixelButton>
            <PixelButton variant="accent" className="flex-1" onClick={submit}>
              記録する
            </PixelButton>
          </div>
        </RetroPanel>
      )}
    </div>
  );
}
