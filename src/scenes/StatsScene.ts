import Phaser from 'phaser';
import { Button } from '@/components/Button';
import { gameEngine } from '@/systems/engineInstance';
import { GAME_WIDTH, GAME_HEIGHT } from '@/ui/Layout';
import { combinedDenominator } from '@/systems/ProbabilitySettings';

function formatProb(hits: number, total: number): string {
  if (total === 0 || hits === 0) return '---';
  return `1/${(total / hits).toFixed(1)}`;
}

/** 統計画面。総ゲーム数・BIG/REG回数・小役確率・差枚・最大獲得枚数を表示する。 */
export class StatsScene extends Phaser.Scene {
  constructor() {
    super('Stats');
  }

  create(): void {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x0d0714, 0.94);
    this.add
      .rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH - 60, GAME_HEIGHT - 160, 0x1c1428)
      .setStrokeStyle(4, 0x8a6bb0);

    this.add.text(GAME_WIDTH / 2, 110, '統計データ', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '30px',
      color: '#f5c542',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const g = gameEngine;
    const bigOrReg = g.bigCount + g.regCount;
    const lines = [
      `総ゲーム数　　${g.totalGames}`,
      `BIG回数　　　${g.bigCount}　　(${formatProb(g.bigCount, g.totalGames)})`,
      `REG回数　　　${g.regCount}　　(${formatProb(g.regCount, g.totalGames)})`,
      `合算　　　　　${bigOrReg}　　(${formatProb(bigOrReg, g.totalGames)})`,
      '',
      `FRUIT確率　　${formatProb(g.roleStats.fruit, g.totalGames)}`,
      `REPLAY確率　${formatProb(g.roleStats.replay, g.totalGames)}`,
      `STAR確率　　${formatProb(g.roleStats.star, g.totalGames)}`,
      `CLOVER確率　${formatProb(g.roleStats.clover, g.totalGames)}`,
      `BELL確率　　${formatProb(g.roleStats.bell, g.totalGames)}`,
      '',
      `差枚　　　　　${g.cumulativeDiff >= 0 ? '+' : ''}${g.cumulativeDiff}枚`,
      `最大獲得枚数　${g.maxCredit}枚`,
      '',
      `現在の設定　　設定${g.setting}（設定合算 1/${combinedDenominator(g.setting).toFixed(1)}）`,
    ];

    this.add.text(70, 180, lines.join('\n'), {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '22px',
      color: '#ffffff',
      lineSpacing: 14,
    });

    new Button(this, GAME_WIDTH / 2, GAME_HEIGHT - 130, {
      width: 220,
      height: 70,
      label: '閉じる',
      color: 0x4a3f5c,
      fontSize: 24,
      onPress: () => this.close(),
    });

    this.createResetButton();
  }

  private createResetButton(): void {
    let confirming = false;
    const btn = new Button(this, GAME_WIDTH / 2, GAME_HEIGHT - 210, {
      width: 260,
      height: 60,
      label: 'データリセット',
      color: 0x8a2be2,
      fontSize: 20,
      onPress: () => {
        if (!confirming) {
          confirming = true;
          btn.setLabel('本当にリセットしますか？');
          this.time.delayedCall(3000, () => {
            if (confirming) {
              confirming = false;
              btn.setLabel('データリセット');
            }
          });
          return;
        }
        gameEngine.resetProgress();
        this.scene.restart();
      },
    });
  }

  private close(): void {
    this.scene.stop();
    this.scene.resume('Game');
  }
}
