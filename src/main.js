import { GAME } from './config.js';
import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import RoomScene from './scenes/RoomScene.js';
import CorridorScene from './scenes/CorridorScene.js';
import HandsScene from './scenes/HandsScene.js';

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
  scene: [BootScene, MenuScene, RoomScene, CorridorScene, HandsScene],
};

// eslint-disable-next-line no-new
const game = new Phaser.Game(config);

// Al girar el teléfono, el navegador reporta el tamaño nuevo con retraso: si Phaser
// mide en ese instante se queda con el viewport viejo y la imagen aparece cortada.
// Se fuerza un recálculo poco después del giro y al volver a la pestaña.
const refresh = () => game.scale.refresh();
window.addEventListener('orientationchange', () => setTimeout(refresh, 250));
window.addEventListener('resize', refresh);
window.addEventListener('pageshow', refresh);
if (window.visualViewport) window.visualViewport.addEventListener('resize', refresh);
