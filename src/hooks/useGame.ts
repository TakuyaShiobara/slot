"use client";

import { useGameStore } from "@/lib/data/store";
import { expToNextLevel } from "@/lib/game/engine";
import { JOB_DEFS } from "@/lib/game/jobs";
import { currentDisplayTitle } from "@/lib/game/titles";
import { findNextLockedSkill } from "@/lib/game/skills";
import { computeCombatStats, computeEquipmentBonuses } from "@/lib/game/gameStats";

export function useGame() {
  return useGameStore((s) => s.game);
}

export function useCharacter() {
  return useGameStore((s) => s.game.character);
}

export function useJob() {
  const jobId = useGameStore((s) => s.game.character.jobId);
  return JOB_DEFS[jobId];
}

export function useCurrentTitle() {
  const game = useGame();
  return currentDisplayTitle(game);
}

export function useExpToNext() {
  const level = useGameStore((s) => s.game.character.level);
  return expToNextLevel(level);
}

export function useTodayExp() {
  const experienceLog = useGameStore((s) => s.game.experienceLog);
  const today = new Date().toISOString().slice(0, 10);
  return experienceLog.filter((e) => e.timestamp.slice(0, 10) === today).reduce((sum, e) => sum + e.amount, 0);
}

export function useNextSkillPreview() {
  const game = useGame();
  return findNextLockedSkill(game);
}

export function useCombatStats() {
  const character = useCharacter();
  const equipment = useGameStore((s) => s.game.rpg.equipment);
  const unlockedSkillIds = useGameStore((s) => s.game.unlockedSkillIds);
  const equipmentBonus = computeEquipmentBonuses(equipment);
  return computeCombatStats(character, equipmentBonus, unlockedSkillIds);
}
