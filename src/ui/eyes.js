// Los ojos del algoritmo mirando desde el fondo. Parpadean a intervalos
// irregulares: un ritmo fijo se lee como un reloj y delata que es un bucle.
import { GAME, EYES } from '../config.js';

export const EYES_ANIM = 'eyes-blink';

export function buildEyes(scene, { depth = EYES.depth, alpha = EYES.alpha } = {}) {
  const eyes = scene.add.sprite(GAME.width * EYES.xf, GAME.height * EYES.yf, EYES.key, 0)
    .setDepth(depth)
    .setAlpha(alpha);
  eyes.setDisplaySize(EYES.width, EYES.width * (EYES.frameHeight / EYES.frameWidth));

  const scheduleBlink = () => {
    const wait = Phaser.Math.Between(EYES.blink.minMs, EYES.blink.maxMs);
    scene.time.delayedCall(wait, () => {
      if (!eyes.active) return;
      eyes.play(EYES_ANIM);
    });
  };
  eyes.on(`animationcomplete-${EYES_ANIM}`, scheduleBlink);
  scheduleBlink();

  return eyes;
}
