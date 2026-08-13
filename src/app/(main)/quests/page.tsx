"use client";

import { useEffect, useState } from "react";
import { RetroPanel } from "@/components/ui/RetroPanel";
import { useGame } from "@/hooks/useGame";
import { useGameStore } from "@/lib/data/store";
import { questsForPeriod, DAILY_BONUS_EXP, WEEKLY_BONUS_EXP } from "@/lib/game/quests";
import type { QuestPeriod } from "@/lib/data/types";

export default function QuestsPage() {
  const game = useGame();
  const completeQuest = useGameStore((s) => s.completeQuest);
  const refreshQuestPeriods = useGameStore((s) => s.refreshQuestPeriods);
  const [tab, setTab] = useState<QuestPeriod>("daily");

  useEffect(() => {
    refreshQuestPeriods();
  }, [refreshQuestPeriods]);

  const quests = questsForPeriod(tab);
  const progressMap = tab === "daily" ? game.dailyQuestProgress : game.weeklyQuestProgress;
  const allDone = quests.every((q) => progressMap[q.id]?.completed);
  const bonus = tab === "daily" ? DAILY_BONUS_EXP : WEEKLY_BONUS_EXP;
  const bonusGiven = !!progressMap[tab === "daily" ? "__daily_bonus__" : "__weekly_bonus__"]?.completed;

  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-center font-pixel text-[12px] tracking-widest text-rpg-accent">◆ クエスト ◆</h1>

      <div className="flex gap-2">
        <TabButton active={tab === "daily"} onClick={() => setTab("daily")}>
          デイリー
        </TabButton>
        <TabButton active={tab === "weekly"} onClick={() => setTab("weekly")}>
          ウィークリー
        </TabButton>
      </div>

      <RetroPanel title={tab === "daily" ? "今日のクエスト" : "今週のクエスト"}>
        <div className="flex flex-col">
          {quests.map((q) => {
            const done = !!progressMap[q.id]?.completed;
            return (
              <button
                key={q.id}
                onClick={() => completeQuest(tab, q.id)}
                disabled={done}
                className="flex items-center gap-2 border-b border-rpg-border-dim/50 py-2.5 text-left last:border-b-0 disabled:opacity-70"
              >
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center border ${
                    done ? "border-rpg-exp bg-rpg-exp/20 text-rpg-exp" : "border-rpg-border-dim text-transparent"
                  }`}
                >
                  {done ? "✓" : ""}
                </span>
                <span className="text-base">{q.icon}</span>
                <span className="flex-1 min-w-0">
                  <span
                    className={`block text-[13px] ${done ? "text-rpg-text-dim line-through" : "text-rpg-text"}`}
                  >
                    {q.name}
                  </span>
                  <span className="block text-[11px] text-rpg-accent">EXP+{q.exp}</span>
                </span>
              </button>
            );
          })}
        </div>
      </RetroPanel>

      <RetroPanel>
        <div className="flex items-center gap-3">
          <span className="text-2xl">{bonusGiven ? "🎉" : "📦"}</span>
          <div className="flex-1">
            <p className="text-[12px] text-rpg-text">
              {allDone ? (bonusGiven ? "ボーナスを かくとく済み！" : "すべて達成！") : "すべて たっせいすると"}
            </p>
            <p className="font-pixel text-[12px] text-rpg-accent">ボーナスEXP +{bonus}！</p>
          </div>
        </div>
      </RetroPanel>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 border-2 py-2 font-pixel text-[10px] tracking-tight ${
        active ? "border-rpg-accent text-rpg-accent bg-rpg-panel" : "border-rpg-border-dim text-rpg-text-dim"
      }`}
    >
      {children}
    </button>
  );
}
