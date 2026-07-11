import Phaser from 'phaser';
import { ReelView } from '@/components/ReelView';
import { LampView } from '@/components/LampView';
import { Button } from '@/components/Button';
import { gameEngine } from '@/systems/engineInstance';
import { soundService } from '@/services/SoundService';
import { pickLeverOnLamp, pickThirdStopLamp } from '@/systems/LampSystem';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  REEL_WINDOW_TOP,
  REEL_ROW_HEIGHT,
  REEL_X_POSITIONS,
  HUD_TOP,
  WIN_BANNER_Y,
  BUTTON_ROW_1_Y,
  BUTTON_ROW_2_Y,
  LEVER_Y,
} from '@/ui/Layout';
import type { ReelIndex } from '@/models/types';

const ROLE_LABEL: Record<string, string> = {
  FRUIT: 'FRUIT',
  REPLAY: 'REPLAY',
  STAR: 'STAR',
  CLOVER: 'CLOVER',
  BELL: 'BELL',
  BIG: 'BIG BONUS',
  REG: 'REG BONUS',
};

/** メインのゲームプレイ画面。リール・HUD・操作パネルをすべて1画面に構成する。 */
export class GameScene extends Phaser.Scene {
  private reels: ReelView[] = [];
  private lamp!: LampView;

  private creditText!: Phaser.GameObjects.Text;
  private gamesText!: Phaser.GameObjects.Text;
  private bigText!: Phaser.GameObjects.Text;
  private regText!: Phaser.GameObjects.Text;
  private winBanner!: Phaser.GameObjects.Text;
  private betLights: Phaser.GameObjects.Arc[] = [];
  private modeText!: Phaser.GameObjects.Text;

  private betButton!: Button;
  private maxBetButton!: Button;
  private leverButton!: Button;
  private stopButtons: Button[] = [];

  private stoppedCount = 0;
  private pendingBonusAtLeverOn = false;
  private busy = false;

  constructor() {
    super('Game');
  }

  create(): void {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x0d0714);
    this.add
      .rectangle(GAME_WIDTH / 2, REEL_WINDOW_TOP + (REEL_ROW_HEIGHT * 3) / 2, GAME_WIDTH - 20, REEL_ROW_HEIGHT * 3 + 24, 0x1c1428)
      .setStrokeStyle(4, 0x8a6bb0);

    this.createHud();
    this.createReels();
    this.lamp = new LampView(this);
    this.createWinBanner();
    this.createControlPanel();

    this.refreshHud();
    this.updateButtonStates();

    this.events.on('resume', () => {
      this.refreshHud();
      this.updateButtonStates();
    });
  }

  private createHud(): void {
    this.add.text(20, HUD_TOP, 'LUCKY JUGGLER', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '26px',
      color: '#f5c542',
      fontStyle: 'bold',
    });

    this.creditText = this.add.text(20, HUD_TOP + 40, '', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '34px',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    this.gamesText = this.add.text(GAME_WIDTH - 20, HUD_TOP + 10, '', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '18px',
      color: '#cbb7e0',
      align: 'right',
    }).setOrigin(1, 0);
    this.bigText = this.add.text(GAME_WIDTH - 20, HUD_TOP + 34, '', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '18px',
      color: '#ff8a5c',
      align: 'right',
    }).setOrigin(1, 0);
    this.regText = this.add.text(GAME_WIDTH - 20, HUD_TOP + 58, '', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '18px',
      color: '#6ec6ff',
      align: 'right',
    }).setOrigin(1, 0);

    this.modeText = this.add.text(GAME_WIDTH / 2, HUD_TOP + 40, '', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '20px',
      color: '#ffd76b',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    new Button(this, 100, GAME_HEIGHT - 40, {
      width: 150,
      height: 46,
      label: '設定変更',
      color: 0x4a3f5c,
      fontSize: 18,
      onPress: () => this.openSettings(),
    });
    new Button(this, GAME_WIDTH - 100, GAME_HEIGHT - 40, {
      width: 150,
      height: 46,
      label: '統計',
      color: 0x4a3f5c,
      fontSize: 18,
      onPress: () => this.openStats(),
    });
  }

  private createReels(): void {
    this.reels = REEL_X_POSITIONS.map((x, i) => new ReelView(this, i as ReelIndex, x, REEL_WINDOW_TOP));
  }

  private createWinBanner(): void {
    this.winBanner = this.add.text(GAME_WIDTH / 2, WIN_BANNER_Y, '', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '30px',
      color: '#ffe9a6',
      fontStyle: 'bold',
      align: 'center',
    }).setOrigin(0.5, 0);
  }

  private createControlPanel(): void {
    // BET数インジケーター（1〜3枚）
    for (let i = 0; i < 3; i++) {
      const light = this.add.circle(GAME_WIDTH / 2 - 60 + i * 60, BUTTON_ROW_1_Y - 70, 14, 0x4a3f5c);
      light.setStrokeStyle(2, 0xf5c542);
      this.betLights.push(light);
    }

    this.betButton = new Button(this, 140, BUTTON_ROW_1_Y, {
      width: 220,
      height: 90,
      label: 'BET',
      color: 0x3a86d8,
      fontSize: 32,
      onPress: () => this.onBetPressed(),
    });
    this.maxBetButton = new Button(this, GAME_WIDTH - 140, BUTTON_ROW_1_Y, {
      width: 220,
      height: 90,
      label: 'MAX BET',
      color: 0x3a86d8,
      fontSize: 28,
      onPress: () => this.onMaxBetPressed(),
    });

    const stopLabels = ['STOP\n左', 'STOP\n中', 'STOP\n右'];
    const stopWidth = 200;
    const gap = 20;
    const totalW = stopWidth * 3 + gap * 2;
    const startX = GAME_WIDTH / 2 - totalW / 2 + stopWidth / 2;
    for (let i = 0; i < 3; i++) {
      const btn = new Button(this, startX + i * (stopWidth + gap), BUTTON_ROW_2_Y, {
        width: stopWidth,
        height: 110,
        label: stopLabels[i],
        color: 0xe8442b,
        fontSize: 24,
        onPress: () => this.onStopPressed(i as ReelIndex),
      });
      this.stopButtons.push(btn);
    }

    this.leverButton = new Button(this, GAME_WIDTH / 2, LEVER_Y, {
      width: 300,
      height: 120,
      label: 'LEVER ON',
      color: 0xb23a6b,
      fontSize: 34,
      radius: 60,
      onPress: () => this.onLeverPressed(),
    });
  }

  private onBetPressed(): void {
    soundService.unlock();
    if (gameEngine.addBet()) {
      soundService.playLever();
      this.refreshHud();
      this.updateButtonStates();
    }
  }

  private onMaxBetPressed(): void {
    soundService.unlock();
    if (gameEngine.maxBet()) {
      soundService.playLever();
      this.refreshHud();
      this.updateButtonStates();
    }
  }

  private onLeverPressed(): void {
    if (this.busy || !gameEngine.canPullLever()) return;
    soundService.unlock();
    this.busy = true;
    this.winBanner.setText('');
    this.modeText.setText(gameEngine.mode !== 'NORMAL' ? 'BONUS 消化中' : '');
    this.pendingBonusAtLeverOn = gameEngine.pendingBonus !== 'NONE';

    gameEngine.pullLever();
    soundService.playLever();
    this.lamp.setPattern(pickLeverOnLamp(this.pendingBonusAtLeverOn));

    this.stoppedCount = 0;
    this.reels.forEach((r) => r.startSpin());
    this.updateButtonStates();

    this.time.delayedCall(250, () => this.updateButtonStates());
  }

  private onStopPressed(reelIndex: ReelIndex): void {
    const reel = this.reels[reelIndex];
    if (!reel.isSpinning) return;
    const requestedIndex = reel.currentMiddleIndex;
    const landing = gameEngine.requestStop(reelIndex, requestedIndex);
    reel.stopAt(landing.index, () => this.onReelStopped());
    this.updateButtonStates();
  }

  private onReelStopped(): void {
    this.stoppedCount += 1;
    if (this.stoppedCount >= 3) {
      this.onAllReelsStopped();
    }
  }

  private onAllReelsStopped(): void {
    const outcome = gameEngine.finalizeGame();
    const lampPattern = pickThirdStopLamp(outcome.bonusEntered !== null, this.pendingBonusAtLeverOn);
    this.lamp.setPattern(lampPattern);

    if (outcome.bonusEntered) {
      soundService.playBonusStart();
      this.winBanner.setText(`${ROLE_LABEL[outcome.bonusEntered]} 確定！`);
    } else if (outcome.isReplay) {
      this.winBanner.setText('REPLAY');
    } else if (outcome.payout > 0 && outcome.winRole) {
      soundService.playPayout(outcome.payout);
      this.winBanner.setText(`${ROLE_LABEL[outcome.winRole] ?? outcome.winRole}  +${outcome.payout}枚`);
    } else {
      this.winBanner.setText('');
    }

    if (outcome.bonusFinished) {
      this.time.delayedCall(600, () => {
        this.winBanner.setText(`${ROLE_LABEL[outcome.bonusFinished as string]} 終了`);
      });
    }

    this.modeText.setText(
      gameEngine.mode === 'BONUS_BIG' ? `BIG消化中 残り${gameEngine.bonusRemaining}枚`
      : gameEngine.mode === 'BONUS_REG' ? `REG消化中 残り${gameEngine.bonusRemaining}枚`
      : '',
    );

    this.refreshHud();
    this.busy = false;
    this.updateButtonStates();
  }

  private refreshHud(): void {
    this.creditText.setText(`CREDIT ${gameEngine.credit}`);
    this.gamesText.setText(`総GAME数 ${gameEngine.totalGames}`);
    this.bigText.setText(`BIG ${gameEngine.bigCount}`);
    this.regText.setText(`REG ${gameEngine.regCount}`);

    this.betLights.forEach((light, i) => {
      light.setFillStyle(i < gameEngine.bet ? 0xf5c542 : 0x4a3f5c);
    });
  }

  private updateButtonStates(): void {
    const spinning = this.reels.some((r) => r.isSpinning);
    const inBonus = gameEngine.mode !== 'NORMAL';

    this.betButton.setDisabled(spinning || inBonus || gameEngine.bet >= 3, 220, 90);
    this.maxBetButton.setDisabled(spinning || inBonus || gameEngine.bet >= 3, 220, 90);
    this.leverButton.setDisabled(spinning || this.busy || !gameEngine.canPullLever(), 300, 120, 60);

    this.stopButtons.forEach((btn, i) => {
      const reel = this.reels[i];
      btn.setDisabled(!reel.isSpinning, 200, 110);
    });
  }

  private openSettings(): void {
    if (this.reels.some((r) => r.isSpinning) || this.busy) return;
    this.scene.launch('Settings');
    this.scene.pause();
  }

  private openStats(): void {
    if (this.reels.some((r) => r.isSpinning) || this.busy) return;
    this.scene.launch('Stats');
    this.scene.pause();
  }

  update(_time: number, delta: number): void {
    this.reels.forEach((r) => r.update(delta));
    this.lamp.update(delta);
  }
}
