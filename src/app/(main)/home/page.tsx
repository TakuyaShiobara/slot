"use client";

import Link from "next/link";
import { RetroPanel, RetroDivider } from "@/components/ui/RetroPanel";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { CharacterSprite } from "@/components/character/CharacterSprite";
import { PixelButton } from "@/components/ui/PixelButton";
import { PRIMARY_STAT_ORDER, STAT_LABEL_JA } from "@/lib/data/types";
import { STAT_COLOR } from "@/components/ui/StatRow";
import {
  useCharacter,
  useCurrentTitle,
  useExpToNext,
  useJob,
  useNextSkillPreview,
  useTodayExp,
} from "@/hooks/useGame";
import { formatNumber } from "@/lib/format";

export default function HomePage() {
  const character = useCharacter();
  const job = useJob();
  const title = useCurrentTitle();
  const expToNext = useExpToNext();
  const nextSkill = useNextSkillPreview();
  const todayExp = useTodayExp();

  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-center font-pixel text-[12px] tracking-widest text-rpg-accent">◆ ホーム ◆</h1>

      <RetroPanel>
        <div className="flex flex-col items-center">
          <div className="rpg-panel-inset flex h-32 w-32 items-center justify-center bg-black">
            <CharacterSprite size={104} />
          </div>
          <p className="mt-3 font-pixel text-sm tracking-widest text-rpg-text">{character.name}</p>
          <p className="mt-1 text-[11px] text-rpg-accent">Lv.{character.level}　{title.name}</p>
          <p className="text-[11px] text-rpg-text-dim">{job.name}</p>

          <div className="mt-3 w-full">
            <div className="mb-1 flex justify-between text-[11px] text-rpg-text-dim">
              <span>EXP</span>
              <span className="font-pixel text-rpg-exp">
                {formatNumber(character.exp)} / {formatNumber(expToNext)}
              </span>
            </div>
            <ProgressBar value={character.exp} max={expToNext} color="var(--rpg-exp)" />
          </div>
        </div>
      </RetroPanel>

      <RetroPanel>
        <div className="flex flex-col gap-1.5">
          <BarRow label="HP" value={character.hp} max={character.hpMax} color="var(--rpg-hp)" />
          <BarRow label="MP" value={character.mp} max={character.mpMax} color="var(--rpg-mp)" />
        </div>
        <RetroDivider />
        <div className="flex flex-col">
          {PRIMARY_STAT_ORDER.map((stat) => (
            <div key={stat} className="flex items-center gap-2 py-1">
              <span className="w-[74px] shrink-0 text-[12px] text-rpg-text-dim">{STAT_LABEL_JA[stat]}</span>
              <span className="w-7 shrink-0 text-right font-pixel text-[11px]">{character.stats[stat]}</span>
              <ProgressBar value={character.stats[stat]} max={60} color={STAT_COLOR[stat]} height={8} />
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-center gap-4 text-[11px] text-rpg-text-dim">
          <span>
            TECH <span className="font-pixel text-rpg-tech">{character.stats.tech}</span>
          </span>
          <span>
            CHA <span className="font-pixel text-rpg-cha">{character.stats.cha}</span>
          </span>
        </div>
      </RetroPanel>

      <Link href="/adventure">
        <PixelButton variant="accent" className="w-full">
          ▶ ぼうけん
        </PixelButton>
      </Link>

      <RetroPanel>
        <p className="text-center text-[12px] text-rpg-text">
          次のレベルまであと <span className="font-pixel text-rpg-exp">{formatNumber(expToNext - character.exp)}</span> EXP
        </p>
        {nextSkill && (
          <p className="mt-1 text-center text-[11px] text-rpg-text-dim">
            次の報酬：Lv.{nextSkill.unlockLevel}「{nextSkill.hidden ? "？？？？？" : nextSkill.name}」
          </p>
        )}
        <RetroDivider />
        <div className="flex justify-between text-[12px]">
          <span className="text-rpg-text-dim">
            今日のEXP　<span className="font-pixel text-rpg-exp">+{formatNumber(todayExp)}</span>
          </span>
          <span className="text-rpg-text-dim">
            れんぞく　<span className="font-pixel text-rpg-accent">{character.streakDays}日</span>
          </span>
        </div>
      </RetroPanel>
    </div>
  );
}

function BarRow({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-6 shrink-0 font-pixel text-[10px] text-rpg-text-dim">{label}</span>
      <span className="w-16 shrink-0 text-right font-pixel text-[11px]">
        {value}/{max}
      </span>
      <ProgressBar value={value} max={max} color={color} height={9} />
    </div>
  );
}
