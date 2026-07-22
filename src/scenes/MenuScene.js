import { GAME, FONT, COLORS, BG, UI } from '../config.js';
import { buildTopBar, fullscreenAvailable } from '../ui/hud.js';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  create() {
    const { width, height } = GAME;

    // Portada limpia: solo fondo y título. Los ojos y la palanca aparecen dentro
    // del juego, donde significan algo; aquí solo competían con el título.
    const bg = this.add.image(width / 2, height / 2, BG.key).setDepth(-100);
    bg.setScale(Math.max(width / bg.width, height / bg.height));
    this.add.rectangle(width / 2, height / 2, width, height, 0x0a0812, 0.6).setDepth(-60);

    // Alturas como fracción del alto: subirlas todas por igual mueve el bloque
    // entero sin descuadrar el espaciado entre líneas.
    this.txt(width / 2, height * 0.31, 'MEDIA & INFORMATION LITERACY', 26, '#f4d35e', { letterSpacing: 6 }).setOrigin(0.5);
    this.txt(width / 2, height * 0.395, 'FEELGORITHM', 120, '#ffffff', { fontStyle: 'bold' }).setOrigin(0.5);
    this.add.rectangle(width / 2, height * 0.46, 260, 5, COLORS.accent);
    this.txt(width / 2, height * 0.52, 'Reconoce cómo te manipulan: siéntelo, nómbralo, actúa.', 34, '#c9c6da', { align: 'center' }).setOrigin(0.5);

    this.makePlayButton(width / 2, height * 0.68, () => this.scene.start('Room'));
    buildTopBar(this);   // pantalla completa (útil sobre todo en celular)

    // Donde no hay API de pantalla completa (iPhone), la única vía real es instalar
    // la PWA: el manifiesto ya declara `standalone`, así se abre sin barras.
    if (!fullscreenAvailable(this)) {
      this.txt(width / 2, height - 84,
        'Para pantalla completa: Compartir  →  «Añadir a pantalla de inicio»',
        22, '#8a84a8', { align: 'center' }).setOrigin(0.5);
    }

    this.txt(width / 2, height - 40, 'Prototipo — UNESCO Youth Hackathon 2026', 22, '#6a6486').setOrigin(0.5);

    // Enter también inicia
    this.input.keyboard.once('keydown-ENTER', () => this.scene.start('Room'));
  }

  txt(x, y, str, size, color, extra = {}) {
    return this.add.text(x, y, str, { fontFamily: FONT, fontSize: `${size}px`, color, resolution: 2, ...extra });
  }

  // Botón de jugar con su arte. La imagen ya lleva el triángulo, así que no
  // necesita etiqueta: se apoya en un icono que se entiende en cualquier idioma.
  makePlayButton(x, y, onClick) {
    const btn = this.add.image(x, y, UI.play.key);
    const scale = UI.play.width / btn.width;
    btn.setScale(scale);
    btn.setInteractive({ useHandCursor: true });
    btn.on('pointerover', () => this.tweens.add({ targets: btn, scale: scale * 1.06, duration: 120 }));
    btn.on('pointerout', () => this.tweens.add({ targets: btn, scale, duration: 120 }));
    btn.on('pointerdown', onClick);
    return btn;
  }
}
