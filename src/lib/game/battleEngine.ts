import type { BattleLogLine, BattleState, MonsterDef } from "@/lib/data/types";
import type { CombatStats } from "@/lib/game/gameStats";

export interface BattleContext {
  combat: CombatStats;
  techPower: number;
  healBoost: number; // 「自己管理」スキルによる回復効果倍率
  hasPersistenceBuff: boolean; // 「継続する者」スキルを持っているか
}

let lineCounter = 0;
function line(text: string): BattleLogLine {
  lineCounter += 1;
  return { id: `bl_${Date.now()}_${lineCounter}`, text };
}

function variance(): number {
  return 0.85 + Math.random() * 0.3;
}

function rollCrit(rate: number): boolean {
  return Math.random() < rate;
}

export function createBattle(monster: MonsterDef, isBoss: boolean, ctx: BattleContext, playerHp: number, playerMp: number): BattleState {
  const log: BattleLogLine[] = [line(isBoss ? `${monster.name} が たちふさがった！` : `${monster.name} が あらわれた！`)];
  let atkBuffActive = false;
  if (ctx.hasPersistenceBuff && Math.random() < 0.3) {
    atkBuffActive = true;
    log.push(line("継続する者の力が みなぎる！ ATKが上昇した！"));
  }

  return {
    enemy: { monsterId: monster.id, name: monster.name, hp: monster.hp, maxHp: monster.hp, atk: monster.atk, def: monster.def },
    playerHp: Math.min(playerHp, ctx.combat.maxHp),
    playerMp: Math.min(playerMp, ctx.combat.maxMp),
    turn: "player",
    result: "ongoing",
    log,
    isBoss,
    atkBuffActive,
  };
}

function enemyTurn(battle: BattleState, ctx: BattleContext): BattleState {
  if (battle.result !== "ongoing") return battle;
  const dmg = Math.max(1, Math.round((battle.enemy.atk - ctx.combat.def) * variance()));
  const playerHp = Math.max(0, battle.playerHp - dmg);
  const log = [...battle.log, line(`${battle.enemy.name} の こうげき！ ${dmg} ダメージ！`)];
  const result = playerHp <= 0 ? "lose" : "ongoing";
  if (result === "lose") log.push(line("TAKUYA は たおれた…"));
  return { ...battle, playerHp, log, turn: "player", result };
}

export function playerAttack(battle: BattleState, ctx: BattleContext): BattleState {
  if (battle.result !== "ongoing") return battle;
  const crit = rollCrit(ctx.combat.critRate);
  const buffMult = battle.atkBuffActive ? 1.2 : 1;
  let dmg = Math.max(1, Math.round((ctx.combat.atk - battle.enemy.def) * variance() * buffMult));
  if (crit) dmg *= 2;
  const enemyHp = Math.max(0, battle.enemy.hp - dmg);
  const log = [
    ...battle.log,
    line(crit ? `会心の一撃！ ${battle.enemy.name} に ${dmg} ダメージ！` : `${battle.enemy.name} に ${dmg} ダメージ！`),
  ];

  if (enemyHp <= 0) {
    log.push(line(`${battle.enemy.name} を たおした！`));
    return { ...battle, enemy: { ...battle.enemy, hp: 0 }, log, result: "win" };
  }

  return enemyTurn({ ...battle, enemy: { ...battle.enemy, hp: enemyHp }, log, critLast: crit }, ctx);
}

const SKILL_MP_COST = 10;

export function playerSkill(battle: BattleState, ctx: BattleContext): BattleState {
  if (battle.result !== "ongoing") return battle;
  if (battle.playerMp < SKILL_MP_COST) {
    return { ...battle, log: [...battle.log, line("MPが たりない！")] };
  }
  const crit = rollCrit(ctx.combat.critRate);
  let dmg = Math.max(1, Math.round((ctx.techPower - battle.enemy.def * 0.5) * variance()));
  if (crit) dmg *= 2;
  const enemyHp = Math.max(0, battle.enemy.hp - dmg);
  const playerMp = battle.playerMp - SKILL_MP_COST;
  const log = [
    ...battle.log,
    line(crit ? `とくぎ発動！ 会心の一撃！ ${dmg} ダメージ！` : `とくぎ発動！ ${dmg} ダメージ！`),
  ];

  if (enemyHp <= 0) {
    log.push(line(`${battle.enemy.name} を たおした！`));
    return { ...battle, enemy: { ...battle.enemy, hp: 0 }, playerMp, log, result: "win" };
  }

  return enemyTurn({ ...battle, enemy: { ...battle.enemy, hp: enemyHp }, playerMp, log }, ctx);
}

export function playerUseItem(
  battle: BattleState,
  item: { name: string; healHp?: number; healMp?: number },
  ctx: BattleContext
): BattleState {
  if (battle.result !== "ongoing") return battle;
  const healHp = Math.round((item.healHp ?? 0) * ctx.healBoost);
  const healMp = item.healMp ?? 0;
  const playerHp = Math.min(ctx.combat.maxHp, battle.playerHp + healHp);
  const playerMp = Math.min(ctx.combat.maxMp, battle.playerMp + healMp);
  const parts: string[] = [];
  if (healHp > 0) parts.push(`HPが ${healHp} かいふく！`);
  if (healMp > 0) parts.push(`MPが ${healMp} かいふく！`);
  const log = [...battle.log, line(`${item.name} を つかった！ ${parts.join(" ")}`)];
  return enemyTurn({ ...battle, playerHp, playerMp, log }, ctx);
}

export function playerFlee(battle: BattleState, ctx: BattleContext): BattleState {
  if (battle.result !== "ongoing") return battle;
  if (battle.isBoss) {
    return enemyTurn({ ...battle, log: [...battle.log, line("ボスからは にげられない！")] }, ctx);
  }
  const success = Math.random() < ctx.combat.fleeRate;
  if (success) {
    return { ...battle, log: [...battle.log, line("うまく にげきれた！")], result: "flee" };
  }
  return enemyTurn({ ...battle, log: [...battle.log, line("にげられなかった！")] }, ctx);
}
