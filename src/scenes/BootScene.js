import { CHAR, BG, BG2, SCREEN, LEVER, PROMPT, CUPULA, TARJETA, CONTENT, EMOTIONS, EMO_SPRITE } from '../config.js';

// Clave de textura de la criatura de una emoción (solo si tiene arte).
export const emoKey = (emo) => `emo_${emo.id}`;

// Escena de arranque: carga assets y define las animaciones del personaje.
export default class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    this.load.image(BG.key, BG.file);
    this.load.image(BG2.key, BG2.file);
    this.load.image(SCREEN.key, SCREEN.file);
    this.load.spritesheet(LEVER.key, LEVER.file, {
      frameWidth: LEVER.frameWidth,
      frameHeight: LEVER.frameHeight,
    });
    this.load.image(PROMPT.banner.key, PROMPT.banner.file);
    this.load.image(CUPULA.key, CUPULA.file);
    this.load.image(TARJETA.key, TARJETA.file);
    this.load.spritesheet(CHAR.key, CHAR.sheet, {
      frameWidth: CHAR.frameWidth,
      frameHeight: CHAR.frameHeight,
    });

    // Criaturas-emoción: una hoja por emoción que tenga arte.
    EMOTIONS.forEach((emo) => {
      if (!emo.sheet) return;
      this.load.spritesheet(emoKey(emo), emo.sheet, {
        frameWidth: EMO_SPRITE.frameWidth,
        frameHeight: EMO_SPRITE.frameHeight,
      });
    });

    // Contenido del corpus. SVG vía load.svg; para imágenes/videos reales, load.image/load.video.
    CONTENT.forEach((c) => {
      if (!c.file) return;
      if (c.file.endsWith('.svg')) this.load.svg(c.key, c.file, { width: 1000, height: 560 });
      else this.load.image(c.key, c.file);
    });
    // Pendiente: audio, personajes-emoción, videos (.mp4 vía load.video).
  }

  create() {
    for (const [key, a] of Object.entries(CHAR.anims)) {
      this.anims.create({
        key,
        frames: this.anims.generateFrameNumbers(CHAR.key, { frames: a.frames }),
        frameRate: a.rate,
        repeat: -1,
        yoyo: !!a.yoyo,
      });
    }

    EMOTIONS.forEach((emo) => {
      if (!emo.sheet) return;
      this.anims.create({
        key: emoKey(emo),
        frames: this.anims.generateFrameNumbers(emoKey(emo), { start: 0, end: EMO_SPRITE.frames - 1 }),
        frameRate: EMO_SPRITE.rate,
        repeat: -1,
      });
    });
    this.anims.create({
      key: 'lever-pull',
      frames: this.anims.generateFrameNumbers(LEVER.key, { start: LEVER.pull.start, end: LEVER.pull.end }),
      frameRate: LEVER.pull.rate,
      repeat: 0,
    });
    this.scene.start('Menu');
  }
}
