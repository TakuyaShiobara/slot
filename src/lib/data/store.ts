"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type {
  ActivityCategoryId,
  EquipSlot,
  GameState,
  InventoryEntry,
  QuestPeriod,
  RpgProgress,
} from "@/lib/data/types";
import { buildInitialGameState, startOfWeek } from "@/lib/data/seed";
import { recordActivity as recordActivityEngine, type RecordActivityResult, type GameStatDelta } from "@/lib/game/engine";
import { applyExp } from "@/lib/game/levels";
import { checkNewlyUnlockedSkills } from "@/lib/game/skills";
import { checkNewlyUnlockedTitles } from "@/lib/game/titles";
import { QUEST_DEFS, DAILY_BONUS_EXP, WEEKLY_BONUS_EXP, questsForPeriod } from "@/lib/game/quests";
import type { SkillDef, TitleDef } from "@/lib/data/types";
import type { LevelUpStep } from "@/lib/game/levels";
import { computeCombatStats, computeEquipmentBonuses, computeVitals, goldBonusMultiplier, techSkillPower } from "@/lib/game/gameStats";
import { FIELD_MAPS, TILE_DEFS, encounterTableFor, getSpecial, getTileKind } from "@/lib/game/maps";
import { MONSTERS, randomMonsterFrom } from "@/lib/game/monsters";
import { ITEMS } from "@/lib/game/items";
import {
  createBattle,
  playerAttack,
  playerFlee,
  playerSkill,
  playerUseItem,
  type BattleContext,
} from "@/lib/game/battleEngine";
import type { BattleState } from "@/lib/data/types";

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
  gameStatDelta?: GameStatDelta;
}

function addToInventory(inventory: InventoryEntry[], itemId: string, qty: number): InventoryEntry[] {
  const existing = inventory.find((i) => i.itemId === itemId);
  if (existing) {
    return inventory.map((i) => (i.itemId === itemId ? { ...i, quantity: i.quantity + qty } : i));
  }
  return [...inventory, { itemId, quantity: qty }];
}

function removeFromInventory(inventory: InventoryEntry[], itemId: string, qty: number): InventoryEntry[] {
  return inventory
    .map((i) => (i.itemId === itemId ? { ...i, quantity: i.quantity - qty } : i))
    .filter((i) => i.quantity > 0);
}

function buildBattleContext(state: GameState, combat: ReturnType<typeof computeCombatStats>): BattleContext {
  return {
    combat,
    techPower: techSkillPower(state.character.stats.tech, combat.mag),
    healBoost: state.unlockedSkillIds.includes("self-management") ? 1.5 : 1,
    hasPersistenceBuff: state.unlockedSkillIds.includes("persistence"),
  };
}

function currentCombatStats(state: GameState) {
  const equipmentBonus = computeEquipmentBonuses(state.rpg.equipment);
  return computeCombatStats(state.character, equipmentBonus, state.unlockedSkillIds);
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

  // ── ゲームパート ──
  movePlayer: (dx: number, dy: number) => void;
  clearFieldMessage: () => void;
  startEncounter: (monsterId: string, isBoss: boolean) => void;
  battleAttack: () => void;
  battleSkill: () => void;
  battleItem: (itemId: string) => void;
  battleFlee: () => void;
  finishBattle: () => void;
  equipItem: (slot: EquipSlot, itemId: string | null) => void;
  consumeFieldItem: (itemId: string) => void;
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

function applyBattleTransition(
  state: GameState,
  prevBattle: BattleState,
  nextBattle: BattleState
): RpgProgress {
  let rpg: RpgProgress = { ...state.rpg, battle: nextBattle, hp: nextBattle.playerHp, mp: nextBattle.playerMp };

  if (prevBattle.result === "ongoing" && nextBattle.result === "win") {
    const monster = MONSTERS[nextBattle.enemy.monsterId];
    const chaBonus = goldBonusMultiplier(state.character.stats.cha);
    const [goldMin, goldMax] = monster.gold;
    const gold = Math.round((goldMin + Math.random() * (goldMax - goldMin)) * chaBonus);
    let itemId: string | undefined;
    if (monster.dropItemId && Math.random() < (monster.dropRate ?? 0)) {
      itemId = monster.dropItemId;
    }
    rpg = {
      ...rpg,
      gold: rpg.gold + gold,
      inventory: itemId ? addToInventory(rpg.inventory, itemId, 1) : rpg.inventory,
      bossDefeated: nextBattle.isBoss ? true : rpg.bossDefeated,
      battle: { ...nextBattle, rewardGold: gold, rewardItemId: itemId },
    };
  }

  return rpg;
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
            gameStatDelta: result.gameStatDelta,
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
        const vitals = computeVitals(expResult.level, state.character.stats);

        let nextState: GameState = {
          ...state,
          character: {
            ...state.character,
            level: expResult.level,
            exp: expResult.exp,
            hpMax: vitals.hpMax,
            mpMax: vitals.mpMax,
            hp: vitals.hpMax,
            mp: vitals.mpMax,
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

      // ── ゲームパート ──

      movePlayer: (dx, dy) => {
        const state = get().game;
        if (state.rpg.battle) return;

        const map = FIELD_MAPS[state.rpg.position.mapId];
        const nx = state.rpg.position.x + dx;
        const ny = state.rpg.position.y + dy;
        const kind = getTileKind(map, nx, ny);
        if (!kind) return;
        const tileDef = TILE_DEFS[kind];

        if (!tileDef.walkable) {
          if (kind === "locked") {
            set((s) => ({
              game: {
                ...s.game,
                rpg: {
                  ...s.game.rpg,
                  fieldMessage: `${tileDef.lockedLabel}は Lv.${tileDef.minLevel}で かいほうされる…`,
                },
              },
            }));
          }
          return;
        }
        if (tileDef.minLevel && state.character.level < tileDef.minLevel) {
          set((s) => ({
            game: {
              ...s.game,
              rpg: { ...s.game.rpg, fieldMessage: `このさきは まだ すすめない…（Lv.${tileDef.minLevel}で かいほう）` },
            },
          }));
          return;
        }

        let nextRpg: RpgProgress = {
          ...state.rpg,
          position: { mapId: map.id, x: nx, y: ny },
          fieldMessage: null,
        };

        const special = getSpecial(map, nx, ny);
        if (special?.type === "warp") {
          nextRpg = { ...nextRpg, position: { mapId: special.to.mapId, x: special.to.x, y: special.to.y } };
          set({ game: { ...state, rpg: nextRpg } });
          return;
        }
        if (special?.type === "chest") {
          if (!nextRpg.openedChestIds.includes(special.chestId)) {
            const item = ITEMS[special.itemId];
            nextRpg = {
              ...nextRpg,
              openedChestIds: [...nextRpg.openedChestIds, special.chestId],
              gold: nextRpg.gold + special.gold,
              inventory: addToInventory(nextRpg.inventory, special.itemId, 1),
              fieldMessage: `たからばこを あけた！「${item.name}」と ゴールド${special.gold}を てにいれた！`,
            };
          }
          set({ game: { ...state, rpg: nextRpg } });
          return;
        }
        if (special?.type === "boss") {
          set({ game: { ...state, rpg: nextRpg } });
          if (!nextRpg.bossDefeated) {
            get().startEncounter(special.monsterId, true);
          }
          return;
        }

        set({ game: { ...state, rpg: nextRpg } });

        if (tileDef.encounterRate > 0 && Math.random() < tileDef.encounterRate) {
          const table = encounterTableFor(map.id, kind);
          if (table.length > 0) {
            get().startEncounter(randomMonsterFrom(table), false);
          }
        }
      },

      clearFieldMessage: () => set((s) => ({ game: { ...s.game, rpg: { ...s.game.rpg, fieldMessage: null } } })),

      startEncounter: (monsterId, isBoss) => {
        const state = get().game;
        const monster = MONSTERS[monsterId];
        if (!monster) return;
        const combat = currentCombatStats(state);
        const ctx = buildBattleContext(state, combat);
        const battle = createBattle(monster, isBoss, ctx, state.rpg.hp, state.rpg.mp);
        set({ game: { ...state, rpg: { ...state.rpg, battle } } });
      },

      battleAttack: () => {
        const state = get().game;
        const prevBattle = state.rpg.battle;
        if (!prevBattle) return;
        const ctx = buildBattleContext(state, currentCombatStats(state));
        const nextBattle = playerAttack(prevBattle, ctx);
        set({ game: { ...state, rpg: applyBattleTransition(state, prevBattle, nextBattle) } });
      },

      battleSkill: () => {
        const state = get().game;
        const prevBattle = state.rpg.battle;
        if (!prevBattle) return;
        const ctx = buildBattleContext(state, currentCombatStats(state));
        const nextBattle = playerSkill(prevBattle, ctx);
        set({ game: { ...state, rpg: applyBattleTransition(state, prevBattle, nextBattle) } });
      },

      battleItem: (itemId) => {
        const state = get().game;
        const prevBattle = state.rpg.battle;
        if (!prevBattle) return;
        const item = ITEMS[itemId];
        const entry = state.rpg.inventory.find((i) => i.itemId === itemId);
        if (!item || !entry || entry.quantity <= 0) return;
        const ctx = buildBattleContext(state, currentCombatStats(state));
        const nextBattle = playerUseItem(prevBattle, item, ctx);
        const inventory = removeFromInventory(state.rpg.inventory, itemId, 1);
        const stateWithInventory = { ...state, rpg: { ...state.rpg, inventory } };
        set({ game: { ...stateWithInventory, rpg: applyBattleTransition(stateWithInventory, prevBattle, nextBattle) } });
      },

      battleFlee: () => {
        const state = get().game;
        const prevBattle = state.rpg.battle;
        if (!prevBattle) return;
        const ctx = buildBattleContext(state, currentCombatStats(state));
        const nextBattle = playerFlee(prevBattle, ctx);
        set({ game: { ...state, rpg: applyBattleTransition(state, prevBattle, nextBattle) } });
      },

      finishBattle: () => {
        const state = get().game;
        const battle = state.rpg.battle;
        if (!battle) return;
        let rpg: RpgProgress = { ...state.rpg, battle: null };
        if (battle.result === "lose") {
          const combat = currentCombatStats(state);
          rpg = {
            ...rpg,
            position: {
              mapId: "overworld",
              x: FIELD_MAPS.overworld.entryPoint.x,
              y: FIELD_MAPS.overworld.entryPoint.y,
            },
            hp: Math.ceil(combat.maxHp / 2),
            mp: Math.ceil(combat.maxMp / 2),
            fieldMessage: "村で てあてを うけた…",
          };
        }
        set({ game: { ...state, rpg } });
      },

      equipItem: (slot, itemId) => {
        set((s) => ({
          game: { ...s.game, rpg: { ...s.game.rpg, equipment: { ...s.game.rpg.equipment, [slot]: itemId } } },
        }));
      },

      consumeFieldItem: (itemId) => {
        const state = get().game;
        const item = ITEMS[itemId];
        const entry = state.rpg.inventory.find((i) => i.itemId === itemId);
        if (!item || item.kind !== "consumable" || !entry || entry.quantity <= 0) return;
        const combat = currentCombatStats(state);
        const healBoost = state.unlockedSkillIds.includes("self-management") ? 1.5 : 1;
        const healHp = Math.round((item.healHp ?? 0) * healBoost);
        const healMp = item.healMp ?? 0;
        const hp = Math.min(combat.maxHp, state.rpg.hp + healHp);
        const mp = Math.min(combat.maxMp, state.rpg.mp + healMp);
        const inventory = removeFromInventory(state.rpg.inventory, itemId, 1);
        set({
          game: { ...state, rpg: { ...state.rpg, hp, mp, inventory, fieldMessage: `${item.name}を つかった！` } },
        });
      },
    }),
    {
      name: "life-quest-save",
      version: 2,
      storage: createJSONStorage(() => (typeof window !== "undefined" ? window.localStorage : noopStorage)),
      skipHydration: true,
      partialize: (state) => ({ game: state.game }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      migrate: (persisted) => {
        // v1(ゲームパート追加前)のセーブにはrpgが無いため、丸ごとデモ初期状態に置き換える。
        const p = persisted as { game?: GameState } | undefined;
        if (!p?.game || !("rpg" in p.game)) {
          return { game: buildInitialGameState(), hasHydrated: false, pendingResult: null };
        }
        return p as GameStore;
      },
    }
  )
);
