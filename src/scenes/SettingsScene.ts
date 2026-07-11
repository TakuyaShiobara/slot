import Phaser from 'phaser';
import { Button } from '@/components/Button';
import { gameEngine } from '@/systems/engineInstance';
import { SETTINGS_TABLE, combinedDenominator } from '@/systems/ProbabilitySettings';
import { GAME_WIDTH, GAME_HEIGHT } from '@/ui/Layout';
import type { SettingNumber } from '@/models/types';

/** 設定1〜6の変更画面。実機の設定変更キーは省略し、シミュレーター用に直接切り替えられるようにする。 */
export class SettingsScene extends Phaser.Scene {
  private currentLabel!: Phaser.GameObjects.Text;
  private rowTexts: Phaser.GameObjects.Text[] = [];

  constructor() {
    super('Settings');
  }

  create(): void {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x0d0714, 0.94);
    this.add
      .rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH - 60, GAME_HEIGHT - 160, 0x1c1428)
      .setStrokeStyle(4, 0x8a6bb0);

    this.add.text(GAME_WIDTH / 2, 110, '設定変更', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '30px',
      color: '#f5c542',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.currentLabel = this.add.text(GAME_WIDTH / 2, 160, '', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '22px',
      color: '#ffffff',
    }).setOrigin(0.5);

    const headerY = 210;
    this.add.text(80, headerY, '設定', { fontFamily: 'system-ui, sans-serif', fontSize: '18px', color: '#cbb7e0' });
    this.add.text(220, headerY, 'BIG', { fontFamily: 'system-ui, sans-serif', fontSize: '18px', color: '#cbb7e0' });
    this.add.text(360, headerY, 'REG', { fontFamily: 'system-ui, sans-serif', fontSize: '18px', color: '#cbb7e0' });
    this.add.text(500, headerY, '合算', { fontFamily: 'system-ui, sans-serif', fontSize: '18px', color: '#cbb7e0' });

    (Object.keys(SETTINGS_TABLE) as unknown as SettingNumber[]).forEach((_key, i) => {
      const setting = (i + 1) as SettingNumber;
      const t = SETTINGS_TABLE[setting];
      const y = 250 + i * 42;
      const rowText = this.add.text(80, y, `設定${setting}   1/${t.big.toFixed(1)}   1/${t.reg.toFixed(1)}   1/${combinedDenominator(setting).toFixed(1)}`, {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '18px',
        color: '#ffffff',
      });
      this.rowTexts.push(rowText);
    });

    const buttonY = 560;
    for (let i = 0; i < 6; i++) {
      const setting = (i + 1) as SettingNumber;
      const x = 100 + (i % 3) * 180;
      const y = buttonY + Math.floor(i / 3) * 90;
      new Button(this, x, y, {
        width: 150,
        height: 70,
        label: `設定${setting}`,
        color: 0x3a86d8,
        fontSize: 22,
        onPress: () => this.selectSetting(setting),
      });
    }

    new Button(this, GAME_WIDTH / 2, GAME_HEIGHT - 130, {
      width: 220,
      height: 70,
      label: '閉じる',
      color: 0x4a3f5c,
      fontSize: 24,
      onPress: () => this.close(),
    });

    this.refresh();
  }

  private selectSetting(setting: SettingNumber): void {
    gameEngine.changeSetting(setting);
    this.refresh();
  }

  private refresh(): void {
    this.currentLabel.setText(`現在の設定：設定${gameEngine.setting}`);
  }

  private close(): void {
    this.scene.stop();
    this.scene.resume('Game');
  }
}
