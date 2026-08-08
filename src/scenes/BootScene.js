import { CHAR, BG, BG2, BG3, SCREEN, SCREEN_V, LEVER, PROMPT, CUPULA, TARJETA, TARJETA_FINAL, ACTIONS, CONTENT, EMOTIONS, EMO_SPRITE, UI, EYES, HANDS, VILLAIN, VILLAIN_SKINS, PROJECTILE, START_SCENE } from '../config.js';

import { EYES_ANIM } from '../ui/eyes.js';
import { preloadAudio } from '../audio.js';

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
    this.load.image(BG3.key, BG3.file);
    this.load.spritesheet(EYES.key, EYES.file, {
      frameWidth: EYES.frameWidth,
      frameHeight: EYES.frameHeight,
    });
    this.load.image(SCREEN.key, SCREEN.file);
    this.load.image(SCREEN_V.key, SCREEN_V.file);
    this.load.spritesheet(LEVER.key, LEVER.file, {
      frameWidth: LEVER.frameWidth,
      frameHeight: LEVER.frameHeight,
    });
    this.load.image(PROMPT.banner.key, PROMPT.banner.file);
    this.load.image(UI.title.key, UI.title.file);
    this.load.image(UI.play.key, UI.play.file);
    this.load.image(UI.settings.key, UI.settings.file);
    this.load.image(UI.fullscreen.key, UI.fullscreen.file);
    this.load.image(UI.sound.key, UI.sound.file);
    this.load.image(UI.portada.key, UI.portada.file);
    this.load.image(UI.reset.key, UI.reset.file);
    this.load.image(HANDS.left.key, HANDS.left.file);
    this.load.image(HANDS.right.key, HANDS.right.file);
    this.load.image(CUPULA.key, CUPULA.file);
    this.load.image(TARJETA.key, TARJETA.file);
    this.load.image(TARJETA_FINAL.key, TARJETA_FINAL.file);
    ACTIONS.forEach((a) => this.load.image(a.key, a.file));
    this.load.spritesheet(CHAR.key, CHAR.sheet, {
      frameWidth: CHAR.frameWidth,
      frameHeight: CHAR.frameHeight,
    });
    this.load.spritesheet(VILLAIN.key, VILLAIN.sheet, {
      frameWidth: VILLAIN.frameWidth,
      frameHeight: VILLAIN.frameHeight,
    });
    this.load.spritesheet(PROJECTILE.key, PROJECTILE.sheet, {
      frameWidth: PROJECTILE.frameWidth,
      frameHeight: PROJECTILE.frameHeight,
    });
    // Variantes del villano por emoción (mismo grid que la hoja por defecto).
    Object.values(VILLAIN_SKINS).forEach((skin) => {
      this.load.spritesheet(skin.key, skin.sheet, {
        frameWidth: VILLAIN.frameWidth,
        frameHeight: VILLAIN.frameHeight,
      });
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
    // Se cargan ES e EN (si existe): así cambiar de idioma no re-descarga nada.
    const loadContent = (key, file) => {
      if (!key || !file) return;
      if (file.endsWith('.svg')) this.load.svg(key, file, { width: 1000, height: 560 });
      else if (/\.(mp4|webm)$/i.test(file)) this.load.video(key, file);
      else this.load.image(key, file);
    };
    CONTENT.forEach((c) => {
      loadContent(c.key, c.file);
      loadContent(c.key_en, c.file_en);
    });

    // Música y efectos (definidos en config.js → AUDIO).
    preloadAudio(this);
    // Pendiente: personajes-emoción, videos (.mp4 vía load.video).
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

    // Villano del pasillo: quieto (bucle) y lanzar (una vez). Mismas animaciones
    // para la hoja por defecto y para cada variante de emoción (mismo grid).
    const villainTextures = [VILLAIN.key, ...Object.values(VILLAIN_SKINS).map((s) => s.key)];
    for (const tex of villainTextures) {
      for (const [key, a] of Object.entries(VILLAIN.anims)) {
        this.anims.create({
          key: `${tex}-${key}`,
          frames: this.anims.generateFrameNumbers(tex, { frames: a.frames }),
          frameRate: a.rate,
          repeat: key === 'idle' ? -1 : 0,
          yoyo: !!a.yoyo,
        });
      }
    }
    // Proyectil del villano: la llama parpadea/crece (bucle con yoyo).
    this.anims.create({
      key: 'villain-atk',
      frames: this.anims.generateFrameNumbers(PROJECTILE.key, { start: 0, end: PROJECTILE.frames - 1 }),
      frameRate: PROJECTILE.rate,
      repeat: -1,
      yoyo: true,
    });

    // Parpadeo: abre - entrecierra - cierra - entrecierra - abre.
    this.anims.create({
      key: EYES_ANIM,
      frames: this.anims.generateFrameNumbers(EYES.key, { frames: [0, 1, 2, 1, 0] }),
      frameRate: EYES.blink.rate,
      repeat: 0,
    });
    this.scene.start(START_SCENE);
  }
}
