import { GAME, FONT, BG, UI } from '../config.js';
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
    this.makeTitle(width / 2, height * UI.title.yf);

    this.makePlayButton(width / 2, height * 0.68, () => this.scene.start('Room'));
    buildTopBar(this);   // pantalla completa (útil sobre todo en celular)

    // Donde no hay API de pantalla completa (iPhone), la única vía real es instalar
    // la PWA: el manifiesto ya declara `standalone`, así se abre sin barras.
    if (!fullscreenAvailable(this)) {
      this.txt(width / 2, height - 84,
        'Para pantalla completa: Compartir  →  «Añadir a pantalla de inicio»',
        22, '#8a84a8', { align: 'center' }).setOrigin(0.5);
    }

    // Enter también inicia
    this.input.keyboard.once('keydown-ENTER', () => this.scene.start('Room'));
  }

  txt(x, y, str, size, color, extra = {}) {
    return this.add.text(x, y, str, { fontFamily: FONT, fontSize: `${size}px`, color, resolution: 2, ...extra });
  }

  // Logotipo. Va a tamaño nativo (escala 1) y en coordenadas enteras: cualquier
  // reescalado o posición a medio píxel lo emborrona, y sus letras tienen filos
  // finos que lo delatan enseguida.
  makeTitle(x, y) {
    const logo = this.add.image(Math.round(x), Math.round(y), UI.title.key).setDepth(0);
    if (UI.title.width) logo.setDisplaySize(UI.title.width, UI.title.width * logo.height / logo.width);

    // Halo blanco opcional: las letras son negras y el fondo del menú es oscuro.
    // Difumina los filos, así que por defecto está apagado (UI.title.glow = 0).
    if (UI.title.glow > 0) {
      for (const [radius, alpha] of [[16, UI.title.glow * 0.4], [7, UI.title.glow]]) {
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2;
          this.add.image(Math.round(x + Math.cos(a) * radius), Math.round(y + Math.sin(a) * radius), UI.title.key)
            .setDisplaySize(logo.displayWidth, logo.displayHeight)
            .setTint(0xffffff).setAlpha(alpha).setDepth(-1);
        }
      }
    }
    return logo;
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
