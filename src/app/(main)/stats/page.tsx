"use client";

import { Fragment } from "react";
import { RetroPanel, RetroDivider } from "@/components/ui/RetroPanel";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { STAT_COLOR } from "@/components/ui/StatRow";
import { ALL_STAT_ORDER, STAT_LABEL_JA } from "@/lib/data/types";
import { useCharacter, useGame } from "@/hooks/useGame";

export default function StatsPage() {
  const character = useCharacter();
  const game = useGame();
  const past = game.statHistory[0]?.stats ?? character.stats;

  const deltas = ALL_STAT_ORDER.map((stat) => ({
    stat,
    before: past[stat],
    now: character.stats[stat],
    delta: character.stats[stat] - past[stat],
  })).sort((a, b) => b.delta - a.delta);

  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-center font-pixel text-[12px] tracking-widest text-rpg-accent">◆ のうりょく ◆</h1>

      <RetroPanel title="ステータス">
        <div className="flex flex-col">
          {ALL_STAT_ORDER.map((stat) => (
            <div key={stat} className="flex items-center gap-2 py-1.5">
              <span className="w-[76px] shrink-0 text-[12px] text-rpg-text-dim">{STAT_LABEL_JA[stat]}</span>
              <span className="w-8 shrink-0 text-right font-pixel text-[11px]">{character.stats[stat]}</span>
              <ProgressBar value={character.stats[stat]} max={60} color={STAT_COLOR[stat]} height={8} />
            </div>
          ))}
        </div>
      </RetroPanel>

      <RetroPanel title="3ヶ月まえとの ひかく">
        <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-x-2 gap-y-2 text-[12px]">
          <span className="text-rpg-text-dim" />
          <span className="text-right text-[10px] text-rpg-text-dim">3ヶ月まえ</span>
          <span className="text-right text-[10px] text-rpg-text-dim">いま</span>
          <span className="text-right text-[10px] text-rpg-text-dim">へんか</span>
          {deltas.map((d) => (
            <Fragment key={d.stat}>
              <span className="text-rpg-text">{STAT_LABEL_JA[d.stat]}</span>
              <span className="text-right font-pixel text-rpg-text-dim">{d.before}</span>
              <span className="text-right font-pixel text-rpg-text">→ {d.now}</span>
              <span className="text-right font-pixel text-rpg-exp">
                {d.delta >= 0 ? "+" : ""}
                {d.delta}
              </span>
            </Fragment>
          ))}
        </div>
        <RetroDivider />
        <div className="rpg-panel-inset flex items-center gap-2 p-3">
          <span className="text-xl">🧙</span>
          <p className="text-[12px] text-rpg-text">
            すばらしい せいちょうです！
            <br />
            このちょうしで がんばりましょう！
          </p>
        </div>
      </RetroPanel>
    </div>
  );
}
