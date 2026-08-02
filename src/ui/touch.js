// Controles táctiles para celular: palanca de movimiento + botones opcionales.
// Cada escena pide los que necesita: la sala usa ACCIÓN (equivale a Enter), el
// pasillo usa SALTO. Solo se crean si el dispositivo tiene pantalla táctil.
import { GAME, COLORS, TOUCH } from '../config.js';

export function hasTouch() {
  return (navigator.maxTouchPoints ?? 0) > 0 || 'ontouchstart' in window;
}

export default class TouchControls {
  // opts: { onAction, action=true, jump=false }
  constructor(scene, { onAction, action = true, jump = false } = {}) {
    this.scene = scene;
    this.onAction = onAction;
    this.axisX = 0;          // -1 .. 1
    this.running = false;    // la palanca al máximo equivale a correr
    this.actionFlag = false; // se consume con actionJustPressed()
    this.jumpFlag = false;   // se consume con jumpJustPressed()
    this.stickPointer = null;

    const { width, height } = GAME;
    const s = TOUCH.stick;
    this.stickCenter = { x: width * s.xf, y: height * s.yf };

    this.stickBase = scene.add.circle(this.stickCenter.x, this.stickCenter.y, s.radius, 0x0a0f1a, 0.35)
      .setStrokeStyle(4, COLORS.accent, 0.55).setDepth(500).setAlpha(TOUCH.alpha).setScrollFactor(0);
    this.stickThumb = scene.add.circle(this.stickCenter.x, this.stickCenter.y, s.thumb, COLORS.accent, 0.85)
      .setStrokeStyle(3, 0x0a0f1a, 0.5).setDepth(501).setAlpha(TOUCH.alpha).setScrollFactor(0);

    if (action) this.buildButton('action', TOUCH.action, '●', () => {
      this.actionFlag = true;
      if (this.onAction) this.onAction();
    });
    if (jump) this.buildButton('jump', TOUCH.jump, '▲', () => { this.jumpFlag = true; });

    // La palanca escucha punteros globales: se agarra desde cualquier punto cercano.
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

  // Crea un botón redondo con icono. `name` = 'action' | 'jump'.
  buildButton(name, cfg, icon, onDown) {
    const btn = this.scene.add.circle(GAME.width * cfg.xf, GAME.height * cfg.yf, cfg.radius, 0x0a0f1a, 0.45)
      .setStrokeStyle(5, COLORS.accent, 0.75).setDepth(500).setAlpha(TOUCH.alpha).setScrollFactor(0);
    const ic = this.scene.add.text(GAME.width * cfg.xf, GAME.height * cfg.yf, icon, {
      fontFamily: 'system-ui, sans-serif', fontSize: '64px', color: '#f4d35e', resolution: 2,
    }).setOrigin(0.5).setDepth(501).setAlpha(TOUCH.alpha).setScrollFactor(0);
    btn.setInteractive({ useHandCursor: true });
    btn.on('pointerdown', () => { onDown(); this.setAlpha(btn, ic, TOUCH.alphaActive); });
    btn.on('pointerup', () => this.setAlpha(btn, ic, TOUCH.alpha));
    btn.on('pointerout', () => this.setAlpha(btn, ic, TOUCH.alpha));
    this[`${name}Btn`] = btn;
    this[`${name}Icon`] = ic;
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

  jumpJustPressed() {
    if (!this.jumpFlag) return false;
    this.jumpFlag = false;
    return true;
  }

  objects() {
    return [this.stickBase, this.stickThumb, this.actionBtn, this.actionIcon, this.jumpBtn, this.jumpIcon];
  }

  setVisible(v) {
    this.objects().forEach((o) => o?.setVisible(v));
  }

  destroy() {
    const i = this.scene.input;
    i.off('pointerdown', this.onDown);
    i.off('pointermove', this.onMove);
    i.off('pointerup', this.onUp);
    i.off('pointerupoutside', this.onUp);
    this.objects().forEach((o) => o?.destroy());
  }
}
