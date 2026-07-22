// Controles táctiles para celular: una palanca de movimiento y un botón de acción.
// Solo se crean si el dispositivo tiene pantalla táctil; en escritorio no estorban.
import { GAME, COLORS, TOUCH } from '../config.js';

export function hasTouch() {
  return (navigator.maxTouchPoints ?? 0) > 0 || 'ontouchstart' in window;
}

export default class TouchControls {
  // onAction: se llama en cada toque del botón de acción (equivale a pulsar Enter).
  constructor(scene, { onAction } = {}) {
    this.scene = scene;
    this.onAction = onAction;
    this.axisX = 0;          // -1 .. 1
    this.running = false;    // la palanca al máximo equivale a correr
    this.actionFlag = false; // se consume con actionJustPressed()
    this.stickPointer = null;

    const { width, height } = GAME;
    const s = TOUCH.stick;
    this.stickCenter = { x: width * s.xf, y: height * s.yf };

    this.stickBase = scene.add.circle(this.stickCenter.x, this.stickCenter.y, s.radius, 0x0a0f1a, 0.35)
      .setStrokeStyle(4, COLORS.accent, 0.55).setDepth(500).setAlpha(TOUCH.alpha).setScrollFactor(0);
    this.stickThumb = scene.add.circle(this.stickCenter.x, this.stickCenter.y, s.thumb, COLORS.accent, 0.85)
      .setStrokeStyle(3, 0x0a0f1a, 0.5).setDepth(501).setAlpha(TOUCH.alpha).setScrollFactor(0);

    const a = TOUCH.action;
    this.actionBtn = scene.add.circle(width * a.xf, height * a.yf, a.radius, 0x0a0f1a, 0.45)
      .setStrokeStyle(5, COLORS.accent, 0.75).setDepth(500).setAlpha(TOUCH.alpha).setScrollFactor(0);
    this.actionIcon = scene.add.text(width * a.xf, height * a.yf, '●', {
      fontFamily: 'system-ui, sans-serif', fontSize: '64px', color: '#f4d35e', resolution: 2,
    }).setOrigin(0.5).setDepth(501).setAlpha(TOUCH.alpha).setScrollFactor(0);

    this.actionBtn.setInteractive({ useHandCursor: true });
    this.actionBtn.on('pointerdown', () => {
      this.actionFlag = true;
      this.setAlpha(this.actionBtn, this.actionIcon, TOUCH.alphaActive);
      if (this.onAction) this.onAction();
    });
    this.actionBtn.on('pointerup', () => this.setAlpha(this.actionBtn, this.actionIcon, TOUCH.alpha));
    this.actionBtn.on('pointerout', () => this.setAlpha(this.actionBtn, this.actionIcon, TOUCH.alpha));

    // La palanca escucha punteros globales: se agarra desde cualquier punto cercano,
    // no hace falta acertarle al círculo exacto (imposible en un celular).
    this.onDown = (p) => {
      if (this.stickPointer !== null) return;
      if (Phaser.Math.Distance.Between(p.x, p.y, this.stickCenter.x, this.stickCenter.y) > s.radius * 1.7) return;
      this.stickPointer = p.id;
      this.setAlpha(this.stickBase, this.stickThumb, TOUCH.alphaActive);
      this.moveThumb(p);
    };
    this.onMove = (p) => { if (p.id === this.stickPointer) this.moveThumb(p); };
    this.onUp = (p) => {
      if (p.id !== this.stickPointer) return;
      this.stickPointer = null;
      this.axisX = 0;
      this.running = false;
      this.stickThumb.setPosition(this.stickCenter.x, this.stickCenter.y);
      this.setAlpha(this.stickBase, this.stickThumb, TOUCH.alpha);
    };
    scene.input.on('pointerdown', this.onDown);
    scene.input.on('pointermove', this.onMove);
    scene.input.on('pointerup', this.onUp);
    scene.input.on('pointerupoutside', this.onUp);
    scene.events.once('shutdown', () => this.destroy());
  }

  setAlpha(a, b, v) { a.setAlpha(v); b.setAlpha(v); }

  moveThumb(p) {
    const s = TOUCH.stick;
    const dx = Phaser.Math.Clamp(p.x - this.stickCenter.x, -s.radius, s.radius);
    const dy = Phaser.Math.Clamp(p.y - this.stickCenter.y, -s.radius, s.radius);
    this.stickThumb.setPosition(this.stickCenter.x + dx, this.stickCenter.y + dy);
    const norm = dx / s.radius;
    this.axisX = Math.abs(norm) < s.deadZone ? 0 : norm;
    this.running = Math.abs(norm) >= s.runAt;
  }

  actionJustPressed() {
    if (!this.actionFlag) return false;
    this.actionFlag = false;
    return true;
  }

  setVisible(v) {
    [this.stickBase, this.stickThumb, this.actionBtn, this.actionIcon].forEach((o) => o?.setVisible(v));
  }

  destroy() {
    const i = this.scene.input;
    i.off('pointerdown', this.onDown);
    i.off('pointermove', this.onMove);
    i.off('pointerup', this.onUp);
    i.off('pointerupoutside', this.onUp);
    [this.stickBase, this.stickThumb, this.actionBtn, this.actionIcon].forEach((o) => o?.destroy());
  }
}
