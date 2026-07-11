import Phaser from 'phaser';

/** 起動直後の最小構成シーン。すぐにPreloadSceneへ移る。 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create(): void {
    this.scene.start('Preload');
  }
}
