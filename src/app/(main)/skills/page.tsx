"use client";

import { useState } from "react";
import { RetroPanel, RetroDivider } from "@/components/ui/RetroPanel";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useGame } from "@/hooks/useGame";
import { SKILL_DEFS, skillProgressLabel, findNextLockedSkill } from "@/lib/game/skills";
import { ACTIVITY_CATEGORY_LIST } from "@/lib/game/categories";
import { CATEGORY_LEVEL_EXP_BASE, CATEGORY_LEVEL_EXP_GROWTH } from "@/lib/game/engine";

export default function SkillsPage() {
  const game = useGame();
  const [tab, setTab] = useState<"list" | "tree">("list");
  const sorted = [...SKILL_DEFS].sort((a, b) => a.unlockLevel - b.unlockLevel);
  const nextSkill = findNextLockedSkill(game);

  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-center font-pixel text-[12px] tracking-widest text-rpg-accent">◆ スキル ◆</h1>

      <div className="flex gap-2">
        <TabButton active={tab === "list"} onClick={() => setTab("list")}>
          スキルいちらん
        </TabButton>
        <TabButton active={tab === "tree"} onClick={() => setTab("tree")}>
          スキルツリー
        </TabButton>
      </div>

      {tab === "list" ? (
        <RetroPanel>
          <div className="flex flex-col">
            {sorted.map((skill) => {
              const unlocked = game.unlockedSkillIds.includes(skill.id);
              const isNext = !unlocked && nextSkill?.id === skill.id;
              return (
                <div key={skill.id} className={isNext ? "" : ""}>
                  {isNext && (
                    <p className="mb-1 mt-2 font-pixel text-[10px] tracking-widest text-rpg-accent">NEXT</p>
                  )}
                  <div className="flex items-start gap-2 border-b border-rpg-border-dim/50 py-2 last:border-b-0">
                    <span className={unlocked ? "text-rpg-exp" : "text-rpg-text-dim"}>
                      {unlocked ? "✓" : "🔒"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] text-rpg-text-dim">Lv.{skill.unlockLevel}</p>
                      <p className={`text-[13px] ${unlocked ? "text-rpg-text" : "text-rpg-text-dim"}`}>
                        {unlocked || !skill.hidden ? skill.name : "？？？？？"}
                      </p>
                      {!unlocked && (
                        <>
                          <p className="text-[11px] text-rpg-text-dim">
                            {skill.hidden && game.character.level < skill.unlockLevel
                              ? "じょうけんを みたすと かいほう"
                              : skill.description}
                          </p>
                          {game.character.level >= skill.unlockLevel - 3 && (
                            <div className="mt-1 flex items-center gap-2">
                              <ProgressBar
                                value={progressRatio(game, skill)}
                                max={1}
                                color="var(--rpg-accent)"
                                height={6}
                              />
                              <span className="shrink-0 text-[10px] text-rpg-text-dim">
                                {skillProgressLabel(game, skill)}
                              </span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </RetroPanel>
      ) : (
        <RetroPanel title="カテゴリべつ しゅくれん度">
          <div className="flex flex-col gap-2.5">
            {ACTIVITY_CATEGORY_LIST.map((c) => {
              const state = game.categoryLevels[c.id];
              const needed = CATEGORY_LEVEL_EXP_BASE + (state.level - 1) * CATEGORY_LEVEL_EXP_GROWTH;
              return (
                <div key={c.id}>
                  <div className="mb-1 flex items-center justify-between text-[12px]">
                    <span className="text-rpg-text">
                      {c.icon} {c.name}
                    </span>
                    <span className="font-pixel text-rpg-accent">Lv.{state.level}</span>
                  </div>
                  <ProgressBar value={state.exp % needed} max={needed} color="var(--rpg-exp)" height={7} />
                </div>
              );
            })}
          </div>
          <RetroDivider />
          <p className="text-center text-[11px] text-rpg-text-dim">
            行動を記録するほど、そのカテゴリの熟練度が上がっていく。
          </p>
        </RetroPanel>
      )}
    </div>
  );
}

function progressRatio(game: ReturnType<typeof useGame>, skill: (typeof SKILL_DEFS)[number]): number {
  const c = skill.condition;
  switch (c.type) {
    case "streak":
      return Math.min(1, game.character.streakDays / c.days);
    case "totalDaysRecorded":
      return Math.min(1, game.character.totalDaysRecorded / c.days);
    case "level":
      return Math.min(1, game.character.level / c.level);
    default:
      return Math.min(1, game.character.level / skill.unlockLevel);
  }
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
