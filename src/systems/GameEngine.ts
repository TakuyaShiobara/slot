import type { BonusFlag, GameMode, LotteryResult, ReelIndex, SettingNumber, SymbolType } from '@/models/types';
import { REEL_LENGTH } from '@/models/ReelStrips';
import { drawLottery } from './Lottery';
import { computeStopIndex, getWindow } from './ReelControl';
import { SYMBOL_PAYOUT, BONUS_TARGET_PAYOUT, BONUS_HIT_PAYOUT, BONUS_HIT_RATE } from './PayoutTable';
import { storageService } from '@/services/StorageService';
import { DEFAULT_SAVE, type RoleStats, type SaveData } from '@/models/SaveData';

export const MAX_BET = 3;
export const INITIAL_CREDIT = 50;

export interface ReelResult {
  index: number;
  window: { top: SymbolType; middle: SymbolType; bottom: SymbolType };
}

/** 1ゲームの最終結果（3リール停止後にまとめて返す）。 */
export interface GameOutcome {
  reels: ReelResult[];
  payout: number;
  isReplay: boolean;
  winRole: LotteryResult | null;
  bonusEntered: BonusFlag | null;
  bonusFinished: BonusFlag | null;
}

/**
 * スロットゲーム全体のロジックを司るコアエンジン。Phaser（描画側）からは
 * このクラスのメソッドのみを呼び出し、当落判定や払い出し計算はここに閉じ込める。
 */
export class GameEngine {
  credit = INITIAL_CREDIT;
  bet = 0;
  totalGames = 0;
  bigCount = 0;
  regCount = 0;
  setting: SettingNumber = 3;
  cumulativeDiff = 0;
  maxCredit = INITIAL_CREDIT;
  roleStats: RoleStats = { fruit: 0, replay: 0, star: 0, clover: 0, bell: 0 };

  /** 内部で持ち越し中のボーナスフラグ（未確定分）。 */
  pendingBonus: BonusFlag = 'NONE';
  /** 現在の進行モード（通常 or ボーナス消化中）。 */
  mode: GameMode = 'NORMAL';
  /** ボーナス消化中の残り目標払い出し枚数。 */
  bonusRemaining = 0;

  /** このゲームで抽選された結果（レバーON時に確定）。 */
  private currentDraw: LotteryResult = 'MISS';
  /** 各リールの目標図柄（nullなら制御なし＝完全ランダム停止）。 */
  private targets: (SymbolType | null)[] = [null, null, null];
  private targetMode: ('MIDDLE' | 'WINDOW')[] = ['MIDDLE', 'MIDDLE', 'MIDDLE'];
  private stoppedResults: (ReelResult | null)[] = [null, null, null];

  constructor() {
    this.loadFromStorage();
  }

  loadFromStorage(): void {
    const data = storageService.load();
    this.credit = data.credit;
    this.totalGames = data.totalGames;
    this.bigCount = data.bigCount;
    this.regCount = data.regCount;
    this.setting = data.setting;
    this.cumulativeDiff = data.cumulativeDiff;
    this.maxCredit = data.maxCredit;
    this.roleStats = { ...data.roleStats };
  }

  persist(): void {
    const data: SaveData = {
      version: 1,
      credit: this.credit,
      totalGames: this.totalGames,
      bigCount: this.bigCount,
      regCount: this.regCount,
      setting: this.setting,
      cumulativeDiff: this.cumulativeDiff,
      maxCredit: this.maxCredit,
      roleStats: this.roleStats,
    };
    storageService.save(data);
  }

  changeSetting(setting: SettingNumber): void {
    this.setting = setting;
    this.persist();
  }

  /** セーブデータを初期化する（クレジット不足で続行不能になった場合の救済用）。 */
  resetProgress(): void {
    storageService.reset();
    this.credit = DEFAULT_SAVE.credit;
    this.bet = 0;
    this.totalGames = DEFAULT_SAVE.totalGames;
    this.bigCount = DEFAULT_SAVE.bigCount;
    this.regCount = DEFAULT_SAVE.regCount;
    this.setting = DEFAULT_SAVE.setting;
    this.cumulativeDiff = DEFAULT_SAVE.cumulativeDiff;
    this.maxCredit = DEFAULT_SAVE.maxCredit;
    this.roleStats = { ...DEFAULT_SAVE.roleStats };
    this.pendingBonus = 'NONE';
    this.mode = 'NORMAL';
    this.bonusRemaining = 0;
  }

  /** BETボタン：1枚ずつ投入（最大3枚）。ボーナス消化中はベット不要（自動）。 */
  addBet(): boolean {
    if (this.mode !== 'NORMAL') return false;
    if (this.bet >= MAX_BET) return false;
    if (this.credit <= 0) return false;
    this.credit -= 1;
    this.bet += 1;
    this.cumulativeDiff -= 1;
    return true;
  }

  /** MAX BETボタン：3枚に満たない分を一括投入。 */
  maxBet(): boolean {
    if (this.mode !== 'NORMAL') return false;
    let did = false;
    while (this.bet < MAX_BET && this.credit > 0) {
      this.credit -= 1;
      this.bet += 1;
      this.cumulativeDiff -= 1;
      did = true;
    }
    return did;
  }

  canPullLever(): boolean {
    if (this.mode !== 'NORMAL') return true; // ボーナス中は自動ベットで即レバー可
    return this.bet === MAX_BET;
  }

  /**
   * レバーON。内部抽選を行い、各リールの目標図柄を決定する。
   * ボーナス消化中は自動的に3枚ベットしたものとして扱う。
   */
  pullLever(): LotteryResult {
    if (this.mode !== 'NORMAL') {
      // ボーナス消化中は自動ベット（クレジット消費なし＝出玉の一部として扱う）。
      this.bet = MAX_BET;
      this.currentDraw = Math.random() < BONUS_HIT_RATE ? 'BELL' : 'MISS';
    } else {
      const pending = this.pendingBonus === 'NONE' ? null : this.pendingBonus;
      this.currentDraw = drawLottery(this.setting, pending);
    }

    this.stoppedResults = [null, null, null];
    this.assignTargets();
    return this.currentDraw;
  }

  private assignTargets(): void {
    const draw = this.currentDraw;
    const carriedBonus: BonusFlag = this.pendingBonus !== 'NONE' ? this.pendingBonus : (draw === 'BIG' || draw === 'REG' ? draw : 'NONE');

    if (carriedBonus !== 'NONE') {
      // ボーナス確定演出：LUCKY柄を3リールとも中段に狙う。
      // 同時に小役が内部当選していてもボーナス確定を優先するため、その回の小役は反映されない
      // （実機同様、ボーナスとの同時当選時は小役側が犠牲になり得る仕様）。
      this.targets = ['LUCKY', 'LUCKY', 'LUCKY'];
      this.targetMode = ['MIDDLE', 'MIDDLE', 'MIDDLE'];
      if (draw === 'BIG' || draw === 'REG') {
        this.pendingBonus = draw;
      }
      return;
    }

    if (this.mode !== 'NORMAL') {
      // ボーナス消化中の小役（BELL固定＝出玉役）。
      this.targets = draw === 'MISS' ? [null, null, null] : ['BELL', 'BELL', 'BELL'];
      this.targetMode = ['MIDDLE', 'MIDDLE', 'MIDDLE'];
      return;
    }

    switch (draw) {
      case 'FRUIT':
        this.targets = ['FRUIT', null, null];
        this.targetMode = ['WINDOW', 'MIDDLE', 'MIDDLE'];
        break;
      case 'REPLAY':
        this.targets = ['REPLAY', 'REPLAY', 'REPLAY'];
        this.targetMode = ['MIDDLE', 'MIDDLE', 'MIDDLE'];
        break;
      case 'STAR':
        this.targets = ['STAR', 'STAR', 'STAR'];
        this.targetMode = ['MIDDLE', 'MIDDLE', 'MIDDLE'];
        break;
      case 'CLOVER':
        this.targets = ['CLOVER', 'CLOVER', 'CLOVER'];
        this.targetMode = ['MIDDLE', 'MIDDLE', 'MIDDLE'];
        break;
      case 'BELL':
        this.targets = ['BELL', 'BELL', 'BELL'];
        this.targetMode = ['MIDDLE', 'MIDDLE', 'MIDDLE'];
        break;
      default:
        this.targets = [null, null, null];
        this.targetMode = ['MIDDLE', 'MIDDLE', 'MIDDLE'];
    }
  }

  /** 指定リールの停止ボタンが押された時の最終停止インデックスを計算する。 */
  requestStop(reelIndex: ReelIndex, requestedIndex: number): ReelResult {
    const idx = computeStopIndex(reelIndex, requestedIndex, this.targets[reelIndex], this.targetMode[reelIndex]);
    const result: ReelResult = { index: idx, window: getWindow(reelIndex, idx) };
    this.stoppedResults[reelIndex] = result;
    return result;
  }

  get allReelsStopped(): boolean {
    return this.stoppedResults.every((r) => r !== null);
  }

  /** 3リール停止後に呼び出し、当落判定・払い出し・統計更新を行う。 */
  finalizeGame(): GameOutcome {
    const reels = this.stoppedResults as ReelResult[];
    const middles = reels.map((r) => r.window.middle);

    let payout = 0;
    let isReplay = false;
    let winRole: LotteryResult | null = null;
    let bonusEntered: BonusFlag | null = null;
    let bonusFinished: BonusFlag | null = null;

    // FRUITは単独リール（左）判定だが、内部抽選でFRUITが決定した回のみ有効とする
    // （抽選と無関係にたまたま左リール窓へ絵柄が来ただけでは入賞にしない）。
    const fruitHit =
      this.currentDraw === 'FRUIT' &&
      (reels[0].window.top === 'FRUIT' || reels[0].window.middle === 'FRUIT' || reels[0].window.bottom === 'FRUIT');

    if (this.mode !== 'NORMAL') {
      // ボーナス消化中：BELL揃いで固定枚数払い出し、目標到達でボーナス終了。
      const hit = middles[0] === 'BELL' && middles[1] === 'BELL' && middles[2] === 'BELL';
      if (hit) {
        const pay = Math.min(BONUS_HIT_PAYOUT, this.bonusRemaining);
        payout = pay;
        this.bonusRemaining -= pay;
        winRole = 'BELL';
      }
      this.totalGames += 1;
      this.credit += payout;
      this.cumulativeDiff += payout; // ボーナス中はベット消費なし
      this.maxCredit = Math.max(this.maxCredit, this.credit);

      if (this.bonusRemaining <= 0) {
        bonusFinished = this.mode === 'BONUS_BIG' ? 'BIG' : 'REG';
        this.mode = 'NORMAL';
        this.bonusRemaining = 0;
      }
      this.bet = 0;
      this.persist();
      return { reels, payout, isReplay, winRole, bonusEntered, bonusFinished };
    }

    // 通常時：ボーナス確定演出（LUCKY揃い）を最優先で判定。
    const luckyLine = middles[0] === 'LUCKY' && middles[1] === 'LUCKY' && middles[2] === 'LUCKY';
    if (luckyLine && this.pendingBonus !== 'NONE') {
      const flag = this.pendingBonus;
      winRole = flag;
      bonusEntered = flag;
      this.pendingBonus = 'NONE';
      this.mode = flag === 'BIG' ? 'BONUS_BIG' : 'BONUS_REG';
      this.bonusRemaining = BONUS_TARGET_PAYOUT[flag];
      if (flag === 'BIG') this.bigCount += 1;
      else this.regCount += 1;
    } else if (fruitHit) {
      payout = SYMBOL_PAYOUT.FRUIT ?? 0;
      winRole = 'FRUIT';
      this.roleStats.fruit += 1;
    } else if (middles[0] === 'REPLAY' && middles[1] === 'REPLAY' && middles[2] === 'REPLAY') {
      isReplay = true;
      winRole = 'REPLAY';
      this.roleStats.replay += 1;
    } else if (middles[0] === 'BELL' && middles[1] === 'BELL' && middles[2] === 'BELL') {
      payout = SYMBOL_PAYOUT.BELL ?? 0;
      winRole = 'BELL';
      this.roleStats.bell += 1;
    } else if (middles[0] === 'CLOVER' && middles[1] === 'CLOVER' && middles[2] === 'CLOVER') {
      payout = SYMBOL_PAYOUT.CLOVER ?? 0;
      winRole = 'CLOVER';
      this.roleStats.clover += 1;
    } else if (middles[0] === 'STAR' && middles[1] === 'STAR' && middles[2] === 'STAR') {
      payout = SYMBOL_PAYOUT.STAR ?? 0;
      winRole = 'STAR';
      this.roleStats.star += 1;
    }

    this.totalGames += 1;
    this.credit += payout;
    this.cumulativeDiff += payout;
    this.maxCredit = Math.max(this.maxCredit, this.credit);
    this.bet = isReplay ? this.bet : 0; // リプレイ時は次ゲームへ自動投入するため据え置き扱い

    this.persist();
    return { reels, payout, isReplay, winRole, bonusEntered, bonusFinished };
  }

  smallRoleProbability(role: keyof RoleStats): number {
    if (this.totalGames === 0) return 0;
    return this.roleStats[role] / this.totalGames;
  }

  reelStripLength(): number {
    return REEL_LENGTH;
  }
}
