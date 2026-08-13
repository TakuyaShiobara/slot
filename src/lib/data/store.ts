"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type {
  ActivityCategoryId,
  GameState,
  QuestPeriod,
} from "@/lib/data/types";
import { buildInitialGameState, startOfWeek } from "@/lib/data/seed";
import { recordActivity as recordActivityEngine, type RecordActivityResult } from "@/lib/game/engine";
import { applyExp } from "@/lib/game/levels";
import { checkNewlyUnlockedSkills } from "@/lib/game/skills";
import { checkNewlyUnlockedTitles } from "@/lib/game/titles";
import { QUEST_DEFS, DAILY_BONUS_EXP, WEEKLY_BONUS_EXP, questsForPeriod } from "@/lib/game/quests";
import type { SkillDef, TitleDef } from "@/lib/data/types";
import type { LevelUpStep } from "@/lib/game/levels";

const noopStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export interface PendingResult {
  expGained: number;
  statGains: Record<string, number | undefined>;
  levelUps: LevelUpStep[];
  newSkills: SkillDef[];
  newTitles: TitleDef[];
  source: "activity" | "quest";
  label: string;
}

interface GameStore {
  game: GameState;
  hasHydrated: boolean;
  pendingResult: PendingResult | null;
  setHasHydrated: (v: boolean) => void;
  recordActivity: (categoryId: ActivityCategoryId, minutes: number, note?: string) => RecordActivityResult;
  completeQuest: (period: QuestPeriod, questId: string) => void;
  clearPendingResult: () => void;
  resetDemo: () => void;
  refreshQuestPeriods: () => void;
  setCurrentTitle: (titleId: string) => void;
}

function refreshPeriodsInPlace(state: GameState): GameState {
  const today = todayStr();
  const weekStart = startOfWeek(new Date()).toISOString().slice(0, 10);
  let next = state;
  if (state.questDate !== today) {
    next = { ...next, questDate: today, dailyQuestProgress: {} };
  }
  if (state.weekStartDate !== weekStart) {
    next = { ...next, weekStartDate: weekStart, weeklyQuestProgress: {} };
  }
  return next;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      game: buildInitialGameState(),
      hasHydrated: false,
      pendingResult: null,
      setHasHydrated: (v) => set({ hasHydrated: v }),
      refreshQuestPeriods: () => set((s) => ({ game: refreshPeriodsInPlace(s.game) })),

      recordActivity: (categoryId, minutes, note) => {
        const current = refreshPeriodsInPlace(get().game);
        const result = recordActivityEngine(current, { categoryId, minutes, note });
        set({
          game: result.state,
          pendingResult: {
            expGained: result.expGained,
            statGains: result.statGains,
            levelUps: result.levelUps,
            newSkills: result.newSkills,
            newTitles: result.newTitles,
            source: "activity",
            label: "冒険のけっか",
          },
        });
        return result;
      },

      completeQuest: (period, questId) => {
        const state = refreshPeriodsInPlace(get().game);
        const progressMap = period === "daily" ? state.dailyQuestProgress : state.weeklyQuestProgress;
        if (progressMap[questId]?.completed) return;

        const quest = QUEST_DEFS.find((q) => q.id === questId);
        if (!quest) return;

        const now = new Date().toISOString();
        const nextProgressMap = {
          ...progressMap,
          [questId]: { questId, progress: quest.target, completed: true, completedAt: now },
        };

        const allQuests = questsForPeriod(period);
        const allCompleted = allQuests.every((q) => nextProgressMap[q.id]?.completed);
        const bonusKey = period === "daily" ? "__daily_bonus__" : "__weekly_bonus__";
        const bonusAlreadyGiven = !!nextProgressMap[bonusKey]?.completed;
        let bonusExp = 0;
        if (allCompleted && !bonusAlreadyGiven) {
          bonusExp = period === "daily" ? DAILY_BONUS_EXP : WEEKLY_BONUS_EXP;
          nextProgressMap[bonusKey] = { questId: bonusKey, progress: 1, completed: true, completedAt: now };
        }

        const totalExp = quest.exp + bonusExp;
        const expResult = applyExp(state.character.level, state.character.exp, totalExp);

        let nextState: GameState = {
          ...state,
          character: {
            ...state.character,
            level: expResult.level,
            exp: expResult.exp,
            hpMax: 100 + (expResult.level - 1) * 4,
            mpMax: 60 + (expResult.level - 1) * 3,
            hp: 100 + (expResult.level - 1) * 4,
            mp: 60 + (expResult.level - 1) * 3,
            totalExpEarned: state.character.totalExpEarned + totalExp,
          },
          experienceLog: [
            { id: `exp_q_${Date.now()}`, amount: totalExp, reason: `クエスト: ${quest.name}`, timestamp: now },
            ...state.experienceLog,
          ],
          ...(period === "daily"
            ? { dailyQuestProgress: nextProgressMap }
            : { weeklyQuestProgress: nextProgressMap }),
        };

        const newSkills = checkNewlyUnlockedSkills(nextState);
        const newTitles = checkNewlyUnlockedTitles(nextState);
        nextState = {
          ...nextState,
          unlockedSkillIds: [...nextState.unlockedSkillIds, ...newSkills.map((s) => s.id)],
          unlockedTitleIds: [...nextState.unlockedTitleIds, ...newTitles.map((t) => t.id)],
        };

        set({
          game: nextState,
          pendingResult: {
            expGained: totalExp,
            statGains: {},
            levelUps: expResult.levelUps,
            newSkills,
            newTitles,
            source: "quest",
            label: bonusExp > 0 ? `クエスト達成！ ボーナス+${bonusExp}EXP` : "クエスト達成！",
          },
        });
      },

      clearPendingResult: () => set({ pendingResult: null }),
      resetDemo: () => set({ game: buildInitialGameState(), pendingResult: null }),
      setCurrentTitle: (titleId) =>
        set((s) => ({
          game: { ...s.game, character: { ...s.game.character, currentTitleId: titleId } },
        })),
    }),
    {
      name: "life-quest-save",
      version: 1,
      storage: createJSONStorage(() => (typeof window !== "undefined" ? window.localStorage : noopStorage)),
      skipHydration: true,
      partialize: (state) => ({ game: state.game }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
