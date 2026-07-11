import Phaser from 'phaser';
import { BootScene } from '@/scenes/BootScene';
import { PreloadScene } from '@/scenes/PreloadScene';
import { GameScene } from '@/scenes/GameScene';
import { SettingsScene } from '@/scenes/SettingsScene';
import { StatsScene } from '@/scenes/StatsScene';
import { GAME_WIDTH, GAME_HEIGHT } from '@/ui/Layout';
import { registerServiceWorker } from '@/services/registerServiceWorker';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'app',
  backgroundColor: '#0d0714',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
  },
  scene: [BootScene, PreloadScene, GameScene, SettingsScene, StatsScene],
};

new Phaser.Game(config);

const splash = document.getElementById('splash');
if (splash) {
  window.setTimeout(() => {
    splash.style.opacity = '0';
    window.setTimeout(() => splash.remove(), 400);
  }, 400);
}

registerServiceWorker();
