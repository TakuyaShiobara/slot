"use client";

import { useState } from "react";
import { useGameStore } from "@/lib/data/store";
import { ModalOverlay } from "@/components/modals/ModalOverlay";
import { PixelButton } from "@/components/ui/PixelButton";
import { STAT_LABEL_JA, type StatKey } from "@/lib/data/types";

export function PendingResultModal() {
  const pendingResult = useGameStore((s) => s.pendingResult);
  const clearPendingResult = useGameStore((s) => s.clearPendingResult);
  const [step, setStep] = useState<0 | 1>(0);

  if (!pendingResult) return null;

  const hasLevelUp = pendingResult.levelUps.length > 0;
  const fromLevel = pendingResult.levelUps[0]?.fromLevel;
  const toLevel = pendingResult.levelUps[pendingResult.levelUps.length - 1]?.toLevel;

  function handleNext() {
    if (step === 0 && hasLevelUp) {
      setStep(1);
      return;
    }
    setStep(0);
    clearPendingResult();
  }

  if (step === 1 && hasLevelUp) {
    return (
      <ModalOverlay>
        <div className="rpg-panel border-rpg-accent p-4 text-center">
          <div className="font-pixel text-[13px] tracking-[0.3em] text-rpg-accent rpg-blink">LEVEL UP!</div>
          <div className="mt-4 flex items-center justify-center gap-3 font-pixel text-sm">
            <span className="text-rpg-text-dim">Lv.{fromLevel}</span>
          </div>
          <div className="my-1 font-pixel text-rpg-text-dim">↓</div>
          <div className="font-pixel text-xl text-rpg-accent">Lv.{toLevel}</div>

          {pendingResult.newSkills.length > 0 && (
            <div className="mt-4 border-t border-rpg-border-dim pt-3 text-left">
              <p className="text-center text-[12px] text-rpg-text">新しいスキルを覚えた！</p>
              {pendingResult.newSkills.map((s) => (
                <p key={s.id} className="mt-1 text-center font-pixel text-[12px] text-rpg-exp">
                  「{s.name}」
                </p>
              ))}
            </div>
          )}

          {pendingResult.newTitles.length > 0 && (
            <div className="mt-3 border-t border-rpg-border-dim pt-3 text-left">
              <p className="text-center text-[12px] text-rpg-text">新しい称号を獲得！</p>
              {pendingResult.newTitles.map((t) => (
                <p key={t.id} className="mt-1 text-center font-pixel text-[12px] text-rpg-accent">
                  「{t.name}」
                </p>
              ))}
            </div>
          )}

          <div className="mt-5">
            <PixelButton variant="accent" className="w-full" onClick={handleNext}>
              ▶ つぎへ
            </PixelButton>
          </div>
        </div>
      </ModalOverlay>
    );
  }

  const statEntries = Object.entries(pendingResult.statGains).filter(([, v]) => (v ?? 0) > 0) as [
    StatKey,
    number
  ][];

  return (
    <ModalOverlay>
      <div className="rpg-panel p-4 text-center">
        <div className="font-pixel text-[11px] tracking-widest text-rpg-accent">
          ▼ {pendingResult.label} ▼
        </div>
        <p className="mt-4 text-[13px]">
          EXPを<span className="font-pixel text-rpg-exp"> {pendingResult.expGained} </span>ポイントかくとく！
        </p>
        {statEntries.length > 0 && (
          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-left">
            {statEntries.map(([stat, v]) => (
              <p key={stat} className="text-[12px] text-rpg-text">
                {STAT_LABEL_JA[stat]} <span className="text-rpg-exp">+{v}</span>
              </p>
            ))}
          </div>
        )}
        <div className="mt-5">
          <PixelButton variant="accent" className="w-full" onClick={handleNext}>
            ▶ つぎへ
          </PixelButton>
        </div>
      </div>
    </ModalOverlay>
  );
}
