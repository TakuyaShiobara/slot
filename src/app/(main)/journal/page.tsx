"use client";

import { RetroPanel, RetroDivider } from "@/components/ui/RetroPanel";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { useGame } from "@/hooks/useGame";
import { ACTIVITY_CATEGORY_LIST } from "@/lib/game/categories";
import { STAT_LABEL_JA, type StatKey } from "@/lib/data/types";
import { formatDateJa, formatTime } from "@/lib/format";
import type { ActivityLogEntry } from "@/lib/data/types";

export default function JournalPage() {
  const game = useGame();

  const groups = new Map<string, ActivityLogEntry[]>();
  for (const entry of game.activityLog) {
    const day = entry.timestamp.slice(0, 10);
    if (!groups.has(day)) groups.set(day, []);
    groups.get(day)!.push(entry);
  }
  const days = [...groups.keys()].sort((a, b) => (a < b ? 1 : -1));

  return (
    <div className="flex flex-col gap-3">
      <ScreenHeader title="冒険日誌" />

      {days.length === 0 && (
        <RetroPanel>
          <p className="py-6 text-center text-[12px] text-rpg-text-dim">まだ記録がありません</p>
        </RetroPanel>
      )}

      {days.map((day) => {
        const entries = [...groups.get(day)!].sort((a, b) => (a.timestamp < b.timestamp ? -1 : 1));
        const totalExp = entries.reduce((s, e) => s + e.exp, 0);
        const statTotals: Partial<Record<StatKey, number>> = {};
        entries.forEach((e) => {
          (Object.entries(e.statGains) as [StatKey, number][]).forEach(([k, v]) => {
            statTotals[k] = (statTotals[k] ?? 0) + v;
          });
        });

        return (
          <RetroPanel key={day} title={formatDateJa(new Date(day + "T00:00:00"))}>
            <div className="flex flex-col">
              {entries.map((entry, i) => {
                const def = ACTIVITY_CATEGORY_LIST.find((c) => c.id === entry.categoryId)!;
                return (
                  <div key={entry.id}>
                    {i > 0 && <div className="border-t border-rpg-border-dim/40" />}
                    <div className="py-2">
                      <div className="flex items-center gap-2">
                        <span className="w-11 shrink-0 font-pixel text-[10px] text-rpg-text-dim">
                          {formatTime(new Date(entry.timestamp))}
                        </span>
                        <span>{def.icon}</span>
                        <span className="flex-1 text-[13px] text-rpg-text">
                          {def.name} {entry.minutes}分
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap gap-x-3 pl-[52px] text-[11px]">
                        <span className="text-rpg-exp">EXP+{entry.exp}</span>
                        {(Object.entries(entry.statGains) as [StatKey, number][]).map(([k, v]) => (
                          <span key={k} className="text-rpg-text-dim">
                            {STAT_LABEL_JA[k]}+{v}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <RetroDivider />
            <p className="text-[12px] text-rpg-accent">今日のごうけい</p>
            <div className="mt-1 flex flex-wrap gap-x-3 text-[12px]">
              <span className="text-rpg-exp">EXP+{totalExp}</span>
              {(Object.entries(statTotals) as [StatKey, number][]).map(([k, v]) => (
                <span key={k} className="text-rpg-text-dim">
                  {STAT_LABEL_JA[k]}+{v}
                </span>
              ))}
            </div>
          </RetroPanel>
        );
      })}
    </div>
  );
}
