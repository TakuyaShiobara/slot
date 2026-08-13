"use client";

import { RetroPanel, RetroDivider } from "@/components/ui/RetroPanel";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useCharacter, useJob } from "@/hooks/useGame";
import { JOB_DEFS } from "@/lib/game/jobs";
import { ALL_STAT_ORDER, STAT_LABEL_JA, type StatKey } from "@/lib/data/types";

export default function JobPage() {
  const character = useCharacter();
  const job = useJob();

  let topStat: StatKey = ALL_STAT_ORDER[0];
  for (const key of ALL_STAT_ORDER) {
    if (character.stats[key] > character.stats[topStat]) topStat = key;
  }
  const current = character.stats[topStat];
  const nextThreshold = Math.ceil((current + 1) / 10) * 10;

  return (
    <div className="flex flex-col gap-3">
      <ScreenHeader title="職業" />

      <RetroPanel>
        <div className="flex flex-col items-center">
          <span className="text-3xl">🧙</span>
          <p className="mt-2 text-center text-[11px] text-rpg-text-dim">あなたの かたむき</p>
          <p className="text-center text-[13px] text-rpg-text">
            あなたは <span className="text-rpg-accent">{job.name}</span> タイプです！
          </p>
          <p className="mt-1 text-center text-[11px] text-rpg-text-dim">{job.description}</p>
        </div>

        <RetroDivider />

        <p className="text-center text-[11px] text-rpg-text-dim">しょくぎょうランク</p>
        <div className="mt-2 flex items-center justify-center gap-3">
          <RankBadge active label={job.name} />
          <span className="text-rpg-text-dim">▶▶</span>
          <RankBadge label="？？？" />
        </div>

        <p className="mt-3 text-center text-[11px] text-rpg-text-dim">
          つぎのランクまで {STAT_LABEL_JA[topStat]}のうりょくを {nextThreshold}まで あげる
        </p>
        <div className="mt-2 flex items-center gap-2">
          <ProgressBar value={current} max={nextThreshold} color="var(--rpg-accent)" />
          <span className="shrink-0 font-pixel text-[11px] text-rpg-accent">
            {current}/{nextThreshold}
          </span>
        </div>
      </RetroPanel>

      <RetroPanel title="しょくぎょう いちらん">
        <div className="flex flex-col">
          {Object.values(JOB_DEFS).map((j, i) => (
            <div
              key={j.id}
              className={`flex items-center gap-2 py-2 ${i > 0 ? "border-t border-rpg-border-dim/40" : ""}`}
            >
              <span className={j.id === job.id ? "text-rpg-accent" : "text-rpg-text-dim"}>
                {j.id === job.id ? "◉" : "○"}
              </span>
              <span className="flex-1 min-w-0">
                <span className={`block text-[13px] ${j.id === job.id ? "text-rpg-accent" : "text-rpg-text"}`}>
                  {j.name}
                </span>
                <span className="block text-[11px] text-rpg-text-dim">{j.description}</span>
              </span>
            </div>
          ))}
        </div>
      </RetroPanel>
    </div>
  );
}

function RankBadge({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <div
      className={`rpg-panel-inset px-3 py-2 text-center font-pixel text-[11px] ${
        active ? "border-rpg-accent text-rpg-accent" : "text-rpg-text-dim"
      }`}
    >
      {label}
    </div>
  );
}
