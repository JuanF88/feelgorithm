import { GAME, FONT, BG, UI, CONTENT } from '../config.js';
import { buildTopBar, fullscreenAvailable, openModal, menuButton } from '../ui/hud.js';
import { playSfx } from '../audio.js';
import { hasGender, setGender } from '../db.js';
import { t } from '../i18n.js';

// Opciones de la pregunta única de género. `id` es lo que se guarda; `label`, lo visible.
const GENEROS = [
  { id: 'masculino', label: 'Masculino' },
  { id: 'femenino', label: 'Femenino' },
  { id: 'otro', label: 'Otro' },
  { id: 'prefiero_no_decir', label: 'Prefiero no decir' },
];

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

    // Imagen de portada, grande, en la esquina inferior izquierda.
    const port = this.add.image(0, height, UI.portada.key).setOrigin(0, 1).setDepth(-50);
    port.setDisplaySize(UI.portada.width, (UI.portada.width * port.height) / port.width);

    // Alturas como fracción del alto: subirlas todas por igual mueve el bloque
    // entero sin descuadrar el espaciado entre líneas.
    this.makeTitle(width / 2, height * UI.title.yf);

    this.makePlayButton(width / 2, height * 0.68, () => this.startGame());
    buildTopBar(this);   // pantalla completa (útil sobre todo en celular)

    // Donde no hay API de pantalla completa (iPhone), la única vía real es instalar
    // la PWA: el manifiesto ya declara `standalone`, así se abre sin barras.
    if (!fullscreenAvailable(this)) {
      this.txt(width / 2, height - 84,
        t('Para pantalla completa: Compartir  →  «Añadir a pantalla de inicio»'),
        22, '#8a84a8', { align: 'center' }).setOrigin(0.5);
    }

    // Enter también inicia
    this.input.keyboard.once('keydown-ENTER', () => this.startGame());
  }

  // La primera vez pregunta el género (una sola vez en la vida del dispositivo);
  // después arranca directo. La respuesta queda en localStorage, así no se repite.
  startGame() {
    if (hasGender()) { this.launch(); return; }
    this.askGender((id) => { setGender(id); this.launch(); });
  }

  // Empieza con una noticia AL AZAR (distinta cada partida).
  launch() {
    const contentIndex = Phaser.Math.Between(0, CONTENT.length - 1);
    this.scene.start('Room', { contentIndex, playedCount: 0, session: [] });
  }

  // Overlay de la pregunta única de género, con el estilo de modal del juego.
  // Bloquea el fondo hasta que se elige.
  askGender(onPick) {
    const bh = 90, gap = 20;
    const modal = openModal(this, {
      w: 940,
      h: 300 + GENEROS.length * (bh + gap),
      title: t('¿Con qué género te identificas?'),
      subtitle: t('Solo lo preguntamos una vez, de forma anónima, para entender a quién llega el juego.'),
      depth: 400,
    });

    const created = [...modal.parts];
    let y = modal.contentTop + bh / 2;
    GENEROS.forEach((g) => {
      const btn = menuButton(this, modal.cx, y, 640, bh, t(g.label), () => {
        created.forEach((o) => o.destroy());
        onPick(g.id);
      }, { depth: modal.depth + 1 });
      created.push(btn);
      y += bh + gap;
    });
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
    btn.on('pointerdown', () => { playSfx(this, 'ui'); onClick(); });
    return btn;
  }
}
