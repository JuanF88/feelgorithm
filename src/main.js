import { GAME } from './config.js';
import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import RoomScene from './scenes/RoomScene.js';
import CorridorScene from './scenes/CorridorScene.js';

// Phaser se carga como global desde vendor/phaser.min.js (ver index.html).
const config = {
  type: Phaser.AUTO,
  width: GAME.width,
  height: GAME.height,
  backgroundColor: GAME.bg,
  parent: 'game',
  scale: {
    mode: Phaser.Scale.FIT,          // se adapta a cualquier pantalla
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 1400 }, debug: false },
  },
  scene: [BootScene, MenuScene, RoomScene, CorridorScene],
};

// eslint-disable-next-line no-new
new Phaser.Game(config);
