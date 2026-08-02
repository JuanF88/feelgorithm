import { GAME } from '../config.js';
import { openModal, menuButton } from '../ui/hud.js';

// Menú de configuración/pausa compartido: se lanza encima de cualquier nivel (que
// queda pausado) y ofrece continuar o volver al menú. Así el botón de ajustes
// funciona igual en la sala, el pasillo y las manos. Usa el estilo de modal común
// (openModal/menuButton) para verse igual que la pregunta de género.
export default class PauseScene extends Phaser.Scene {
  constructor() {
    super('Pause');
  }

  init(data = {}) {
    this.fromKey = data.fromKey || 'Menu';
  }

  create() {
    const modal = openModal(this, {
      w: 820, h: 470,
      title: 'Configuración',
      subtitle: 'El juego está en pausa.',
      depth: 10,
    });

    const bw = 620, bh = 88, gap = 24;
    let y = modal.contentTop + bh / 2 + 8;
    menuButton(this, modal.cx, y, bw, bh, 'Continuar', () => this.resumeGame(), { depth: modal.depth + 1 });
    y += bh + gap;
    menuButton(this, modal.cx, y, bw, bh, 'Volver al menú principal', () => this.toMenu(), { depth: modal.depth + 1 });

    this.input.keyboard.on('keydown-ESC', () => this.resumeGame());
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
