import { GAME, FONT, COLORS, BG, LEVER } from '../config.js';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  create() {
    const { width, height } = GAME;

    const bg = this.add.image(width / 2, height / 2, BG.key);
    bg.setScale(Math.max(width / bg.width, height / bg.height));
    this.add.rectangle(width / 2, height / 2, width, height, 0x0a0812, 0.6); // oscurecer para contraste

    // joystick decorativo
    if (this.textures.exists(LEVER.key)) {
      this.add.image(width / 2, height * 0.24, LEVER.key).setOrigin(0.5, 0.5).setScale(0.55).setAlpha(0.95);
    }

    this.txt(width / 2, height * 0.40, 'MEDIA & INFORMATION LITERACY', 26, '#f4d35e', { letterSpacing: 6 }).setOrigin(0.5);
    this.txt(width / 2, height * 0.485, 'FEELGORITHM', 120, '#ffffff', { fontStyle: 'bold' }).setOrigin(0.5);
    this.add.rectangle(width / 2, height * 0.55, 260, 5, COLORS.accent);
    this.txt(width / 2, height * 0.61, 'Reconoce cómo te manipulan: siéntelo, nómbralo, actúa.', 34, '#c9c6da', { align: 'center' }).setOrigin(0.5);

    this.makeButton(width / 2, height * 0.74, '▶   Jugar', () => this.scene.start('Room'));

    this.txt(width / 2, height - 40, 'Prototipo — UNESCO Youth Hackathon 2026', 22, '#6a6486').setOrigin(0.5);

    // Enter también inicia
    this.input.keyboard.once('keydown-ENTER', () => this.scene.start('Room'));
  }

  txt(x, y, str, size, color, extra = {}) {
    return this.add.text(x, y, str, { fontFamily: FONT, fontSize: `${size}px`, color, resolution: 2, ...extra });
  }

  makeButton(x, y, text, onClick) {
    const c = this.add.container(x, y);
    const bg = this.add.rectangle(0, 0, 440, 88, COLORS.accent).setStrokeStyle(4, 0x000000, 0.2);
    const label = this.txt(0, 0, text, 42, '#12101a', { fontStyle: 'bold' }).setOrigin(0.5);
    c.add([bg, label]);
    c.setSize(440, 88);
    c.setInteractive({ useHandCursor: true });
    c.on('pointerover', () => { bg.setFillStyle(0xffe08a); c.setScale(1.04); });
    c.on('pointerout', () => { bg.setFillStyle(COLORS.accent); c.setScale(1); });
    c.on('pointerdown', onClick);
    return c;
  }
}
