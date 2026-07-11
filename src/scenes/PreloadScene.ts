import Phaser from 'phaser';
import { generateSymbolTextures } from '@/utils/SymbolArt';
import { SYMBOL_SIZE } from '@/ui/Layout';

/** すべてのテクスチャをプロシージャルに生成してからGameSceneへ進む。 */
export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('Preload');
  }

  create(): void {
    generateSymbolTextures(this, SYMBOL_SIZE);
    this.scene.start('Game');
  }
}
