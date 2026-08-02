import { GAME, COLORS, TEXT } from '../config.js';
import { mkText } from '../ui/hud.js';
import { playSfx } from '../audio.js';

// Menú de configuración/pausa compartido: se lanza encima de cualquier nivel (que
// queda pausado) y ofrece continuar o volver al menú. Así el botón de ajustes
// funciona igual en la sala, el pasillo y las manos.
export default class PauseScene extends Phaser.Scene {
  constructor() {
    super('Pause');
  }

  init(data = {}) {
    this.fromKey = data.fromKey || 'Menu';
  }

  create() {
    const { width, height } = GAME;
    this.add.rectangle(width / 2, height / 2, width, height, 0x05040a, 0.78)
      .setInteractive();
    this.add.rectangle(width / 2, height / 2, 760, 420, 0x141222, 0.98)
      .setStrokeStyle(4, COLORS.accent, 0.6);
    mkText(this, width / 2, height / 2 - 130, 'Configuración', 52, { fontStyle: 'bold', color: '#ffffff' })
      .setOrigin(0.5);
    this.button(width / 2, height / 2, 'Continuar', () => this.resumeGame());
    this.button(width / 2, height / 2 + 110, 'Volver al menú principal', () => this.toMenu());

    this.input.keyboard.on('keydown-ESC', () => this.resumeGame());
  }

  button(x, y, text, onClick) {
    const c = this.add.container(x, y);
    const bg = this.add.rectangle(0, 0, 560, 82, 0x2b2740).setStrokeStyle(3, COLORS.accent, 0.5);
    const label = mkText(this, 0, 0, text, TEXT.button, { color: '#f4f2ff', fontStyle: 'bold' }).setOrigin(0.5);
    c.add([bg, label]);
    c.setSize(560, 82).setInteractive({ useHandCursor: true });
    c.on('pointerover', () => bg.setFillStyle(0x3a3557));
    c.on('pointerout', () => bg.setFillStyle(0x2b2740));
    c.on('pointerdown', () => { playSfx(this, 'ui'); onClick(); });
    return c;
  }

  resumeGame() {
    this.scene.resume(this.fromKey);
    this.scene.stop();
  }

  toMenu() {
    this.scene.stop(this.fromKey);
    this.scene.start('Menu');
  }
}
