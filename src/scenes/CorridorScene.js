import { GAME, CHAR, BG2, CORRIDOR, VILLAIN, ROCKS, THOUGHTS, CONTENT, EMO_MATRIX, PROMPT, TEXT } from '../config.js';
import { mkText, buildTopBar, fitTextInBox, openSettings } from '../ui/hud.js';
import TouchControls, { hasTouch } from '../ui/touch.js';
import { footsteps, playSfx } from '../audio.js';
import { speak, stopSpeak } from '../voice.js';
import { t, getMatriz } from '../i18n.js';

// Escena 2 — el pasillo, nivel de RESISTIR. El personaje sale del túnel izquierdo;
// al fondo un villano lanza rocas en parábola. Hay que esquivarlas durante un tiempo
// (no se puede avanzar ni acercarse) mientras la cabeza se llena de "pensamientos"
// (distorsiones cognitivas según la emoción elegida). Al agotarse el tiempo el
// villano se va y se abre el paso a la salida. Si una roca te toca, mueres y reinicia.
const PHASE = {
  EMERGING: 'emerging',   // sale solo del túnel
  WAIT: 'wait',           // confinado, esquivando, con temporizador
  RUN: 'run',             // villano fuera: libre para llegar a la salida
  LEAVING: 'leaving',     // entra al túnel derecho
  DEAD: 'dead',
  CARDS: 'cards',
};

export default class CorridorScene extends Phaser.Scene {
  constructor() {
    super('Corridor');
  }

  // Con default {} para poder arrancar la escena suelta (START_SCENE = 'Corridor').
  init(data = {}) {
    this.emotion = data.emotion ?? { id: 'ira', label: 'Ira', color: 0xe63946, feel: '' };
    this.contentIndex = data.contentIndex ?? 0;
    this.playedCount = data.playedCount ?? 0;
    this.session = data.session ?? [];
  }

  create() {
    const { width, height } = GAME;
    this.phase = PHASE.EMERGING;
    this.rocks = [];
    this.dead = false;
    this.throwing = false;
    this.throwTimer = null;
    this.wasAirborne = false;
    this.currentThought = null;

    const bg = this.add.image(width / 2, height / 2, BG2.key).setDepth(-100);
    bg.setScale(Math.max(width / bg.width, height / bg.height));

    this.floorY = height * CORRIDOR.floorYf;
    this.ground = this.add.rectangle(width / 2, this.floorY + 60, width, 120, 0x000000, 0);
    this.physics.add.existing(this.ground, true);

    this.buildVillain();

    this.avatar = this.physics.add.sprite(width * CORRIDOR.entryXf, this.floorY - 140, CHAR.key)
      .setDepth(9);
    this.avatar.setOrigin(CHAR.originX, 0.5).setScale(CORRIDOR.charScale);
    this.avatar.setAlpha(0);
    this.avatar.setCollideWorldBounds(true);
    this.avatar.play('walk');
    this.physics.add.collider(this.avatar, this.ground);
    this.tweens.add({ targets: this.avatar, alpha: 1, duration: 700, ease: 'Sine.easeIn' });

    // Distorsiones para (caso del contenido × emoción elegida).
    const caso = CONTENT[this.contentIndex]?.caso;
    const emoName = EMO_MATRIX[this.emotion?.id] || 'Miedo';
    const M = getMatriz();
    const node = M[caso] && M[caso][emoName];
    // Solo la frase (el pensamiento), sin el nombre de la distorsión ni las «».
    const soloFrase = (t) => {
      const m = t.match(/«([^»]*)»/);
      return m ? m[1].trim() : t;
    };
    this.thoughts = ((node && node.distorsiones) || []).map(soloFrase);
    this.thoughtIdx = 0;

    this.buildPrompt();
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('A,D,W,SPACE');
    buildTopBar(this, { music: 'scary', onSettings: () => openSettings(this) });
    if (hasTouch()) this.touch = new TouchControls(this, { action: false, jump: true });
    this.steps = footsteps(this);

    this.events.once('shutdown', () => { this.stopThrowing(); this.stopThoughts(); });
    this.events.on('pause', () => { if (this.steps) this.steps.set(null); stopSpeak(); });
  }

  // ─────────────────────────────── villano ───────────────────────────────

  buildVillain() {
    this.villain = this.add.sprite(GAME.width * VILLAIN.xf, this.floorY + (VILLAIN.yOffset || 0), VILLAIN.key, 0)
      .setOrigin(0.5, 1).setDepth(8);
    this.villain.setScale(VILLAIN.height / this.villain.height);
    if (VILLAIN.faceLeft) this.villain.setFlipX(true);
    this.villain.play('villain-idle');
  }

  startThrowing() {
    if (this.throwing) return;
    this.throwing = true;
    this.scheduleThrow();
  }

  stopThrowing() {
    this.throwing = false;
    if (this.throwTimer) { this.throwTimer.remove(false); this.throwTimer = null; }
  }

  scheduleThrow() {
    const j = Phaser.Math.Between(-VILLAIN.throwJitterMs, VILLAIN.throwJitterMs);
    this.throwTimer = this.time.delayedCall(Math.max(500, VILLAIN.throwEveryMs + j), () => this.throwRock());
  }

  throwRock() {
    if (this.dead || this.phase !== PHASE.WAIT) return;
    this.villain.play('villain-throw');
    this.villain.once('animationcomplete', () => { if (!this.dead) this.villain.play('villain-idle'); });
    this.time.delayedCall(VILLAIN.releaseFrameMs, () => this.spawnRock());
    this.scheduleThrow();
  }

  // Roca (círculo) con velocidad calculada para caer en parábola cerca del jugador.
  spawnRock() {
    if (this.dead || this.phase !== PHASE.WAIT) return;
    const dir = VILLAIN.faceLeft ? -1 : 1;
    const startX = this.villain.x + dir * this.villain.displayWidth * 0.25;
    const startY = this.villain.y - VILLAIN.height * 0.55;

    const targetX = this.avatar.x + Phaser.Math.Between(-ROCKS.aimJitter, ROCKS.aimJitter);
    const targetY = this.floorY - 10;
    const T = ROCKS.flightMs / 1000;
    const g = ROCKS.gravity;
    const vx = (targetX - startX) / T;
    const vy = (targetY - startY - 0.5 * g * T * T) / T;

    const r = ROCKS.radius;
    const c = this.add.container(startX, startY).setDepth(12);
    const body = this.add.circle(0, 0, r, ROCKS.color).setStrokeStyle(4, ROCKS.stroke);
    const dot = this.add.circle(r * 0.35, -r * 0.2, r * 0.24, ROCKS.stroke, 0.6);
    c.add([body, dot]);
    this.rocks.push({ go: c, vx, vy, r });
    playSfx(this, 'lever');
  }

  updateRocks(delta) {
    const dt = delta / 1000;
    const spin = Phaser.Math.DegToRad(ROCKS.spinDeg) * dt;
    for (let i = this.rocks.length - 1; i >= 0; i--) {
      const rk = this.rocks[i];
      rk.vy += ROCKS.gravity * dt;
      rk.go.x += rk.vx * dt;
      rk.go.y += rk.vy * dt;
      rk.go.rotation += spin * Math.sign(rk.vx || 1);

      if (!this.dead && this.hitsPlayer(rk)) { this.die(); return; }

      if (rk.go.y - rk.r > this.floorY || rk.go.x < -100 || rk.go.x > GAME.width + 100) {
        rk.go.destroy();
        this.rocks.splice(i, 1);
      }
    }
  }

  hitsPlayer(rk) {
    const dx = Math.abs(rk.go.x - this.avatar.x);
    if (dx > ROCKS.hitHalfW + rk.r) return false;
    const top = this.avatar.y - this.avatar.displayHeight * 0.42;
    const bot = this.avatar.y + this.avatar.displayHeight * 0.46;
    return rk.go.y > top - rk.r && rk.go.y < bot + rk.r;
  }

  clearRocks() {
    this.rocks.forEach((rk) => rk.go.destroy());
    this.rocks = [];
  }

  // El tiempo se agotó: el villano se marcha y se abre el paso a la salida.
  villainLeaves() {
    if (this.dead) return;
    this.phase = PHASE.RUN;             // se libera el límite: ya puede avanzar
    this.stopThrowing();
    this.clearRocks();
    this.stopThoughts();
    this.hideTimer();
    this.setPrompt(t('El villano se fue. ¡Corre a la puerta! →'));
    this.time.delayedCall(2600, () => this.hidePrompt());
    this.villain.play('villain-idle');
    this.tweens.add({
      targets: this.villain,
      x: this.villain.x + 320,
      alpha: 0,
      duration: VILLAIN.leaveMs,
      ease: 'Sine.easeIn',
      onComplete: () => this.villain.setVisible(false),
    });
  }

  // ─────────────────────────────── pensamientos ───────────────────────────────

  startThoughts() {
    if (!this.thoughts.length) return;
    this.showNextThought();
    this.thoughtTimer = this.time.addEvent({
      delay: THOUGHTS.everyMs, loop: true, callback: () => this.showNextThought(),
    });
  }

  stopThoughts() {
    stopSpeak();
    if (this.thoughtTimer) { this.thoughtTimer.remove(); this.thoughtTimer = null; }
    if (this.currentThought) {
      const t = this.currentThought; this.currentThought = null;
      this.tweens.add({ targets: t, alpha: 0, duration: 250, onComplete: () => t.destroy() });
    }
  }

  showNextThought() {
    if (this.dead || !this.thoughts.length) return;
    const prev = this.currentThought;
    if (prev) this.tweens.add({ targets: prev, alpha: 0, duration: 300, onComplete: () => prev.destroy() });

    const txt = this.thoughts[this.thoughtIdx % this.thoughts.length];
    this.thoughtIdx++;
    speak(txt);   // voz del pensamiento (TTS)
    const b = this.buildThought(txt);
    this.currentThought = b;
    this.positionThought();
    b.setAlpha(0);
    this.tweens.add({ targets: b, alpha: 1, duration: 300 });
    // se va solo un poco antes del siguiente (por si el jugador se queda quieto)
    this.time.delayedCall(THOUGHTS.holdMs, () => {
      if (this.currentThought === b) {
        this.currentThought = null;
        this.tweens.add({ targets: b, alpha: 0, duration: 300, onComplete: () => b.destroy() });
      }
    });
  }

  buildThought(txt) {
    const c = this.add.container(0, 0).setDepth(95);
    const t = mkText(this, 0, 0, txt, THOUGHTS.size, {
      color: THOUGHTS.color, align: 'center', fontStyle: 'italic', wordWrap: { width: THOUGHTS.width },
    }).setOrigin(0.5);
    const pad = 22;
    const w = Math.min(THOUGHTS.width, t.width) + pad * 2;
    const h = t.height + pad * 1.3;
    const g = this.add.graphics();
    g.fillStyle(0x0a0812, 0.85);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 16);
    g.lineStyle(2, 0x6a5acd, 0.7);
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, 16);
    g.fillStyle(0x0a0812, 0.85);
    g.fillTriangle(-14, h / 2 - 1, 14, h / 2 - 1, 0, h / 2 + 18);
    c.add([g, t]);
    c.thoughtH = h;
    return c;
  }

  positionThought() {
    if (!this.currentThought) return;
    const headTop = this.avatar.y - this.avatar.displayHeight * 0.5;
    const halfW = THOUGHTS.width * 0.5 + 40;
    this.currentThought.x = Phaser.Math.Clamp(this.avatar.x, halfW, GAME.width - halfW);
    this.currentThought.y = headTop - 24 - this.currentThought.thoughtH / 2;
  }

  // ─────────────────────────────── temporizador ───────────────────────────────

  startTimer() {
    if (this.dead) return;
    this.buildTimer();
    let left = Math.ceil(CORRIDOR.waitMs / 1000);
    this.timerTick = this.time.addEvent({
      delay: 1000, repeat: left - 1,
      callback: () => { left -= 1; if (this.timerNum) this.timerNum.setText(`${Math.max(0, left)}`); },
    });
    this.tweens.add({ targets: this.timerBar, width: 0, duration: CORRIDOR.waitMs, ease: 'Linear' });
    this.waitTimer = this.time.delayedCall(CORRIDOR.waitMs, () => this.villainLeaves());
  }

  buildTimer() {
    const { width, height } = GAME;
    const y = height * 0.12;
    this.timerBox = this.add.container(width / 2, y).setDepth(130);
    const label = mkText(this, 0, -36, t('Resiste hasta que el villano se vaya'), 24, {
      color: '#ffd0d0', fontStyle: 'bold', align: 'center',
    }).setOrigin(0.5);
    this.timerNum = mkText(this, 0, 6, `${Math.ceil(CORRIDOR.waitMs / 1000)}`, 60, {
      color: '#ff6b6b', fontStyle: 'bold',
    }).setOrigin(0.5);
    const barW = 360;
    const barBg = this.add.rectangle(0, 48, barW, 10, 0x2a2440).setOrigin(0.5);
    this.timerBar = this.add.rectangle(-barW / 2, 48, barW, 10, 0xff6b6b).setOrigin(0, 0.5);
    this.timerBox.add([label, this.timerNum, barBg, this.timerBar]);
    this.timerBox.setAlpha(0);
    this.tweens.add({ targets: this.timerBox, alpha: 1, duration: 300 });
  }

  hideTimer() {
    if (this.timerTick) { this.timerTick.remove(); this.timerTick = null; }
    if (this.timerBox) {
      const box = this.timerBox; this.timerBox = null;
      this.tweens.add({ targets: box, alpha: 0, duration: 300, onComplete: () => box.destroy() });
    }
  }

  // ─────────────────────────────── muerte ───────────────────────────────

  die() {
    if (this.dead) return;
    this.dead = true;
    this.phase = PHASE.DEAD;
    this.stopThrowing();
    this.stopThoughts();
    this.hideTimer();
    if (this.introTimer) this.introTimer.remove();
    this.steps.set(null);
    this.avatar.setVelocity(0, 0);
    this.avatar.setTint(0xff4444);
    playSfx(this, 'land');
    this.tweens.add({ targets: this.avatar, angle: 90, alpha: 0.35, duration: 500, ease: 'Quad.easeIn' });

    const { width, height } = GAME;
    this.add.rectangle(width / 2, height / 2, width, height, 0x2a0505, 0.35).setDepth(190);
    mkText(this, width / 2, height * 0.4, t('¡Te alcanzó una roca!'), TEXT.prompt, {
      color: '#ff6b6b', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(200);
    mkText(this, width / 2, height * 0.4 + 62, t('Reintentando…'), TEXT.hint, {
      color: '#e9edf5',
    }).setOrigin(0.5).setDepth(200);

    this.time.delayedCall(1600, () => this.scene.restart({
      emotion: this.emotion,
      contentIndex: this.contentIndex,
      playedCount: this.playedCount,
      session: this.session,
    }));
  }

  // ─────────────────────────────── prompt ───────────────────────────────

  buildPrompt() {
    const { width, height } = GAME;
    const b = PROMPT.banner;
    this.banner = this.add.image(width / 2, height * PROMPT.yf, b.key).setDepth(11);
    this.banner.setScale(b.displayWidth / this.banner.width);

    const bw = this.banner.displayWidth;
    const bh = this.banner.displayHeight;
    this.promptBox = {
      w: (b.panel.x1 - b.panel.x0) * bw * b.padding,
      h: (b.panel.y1 - b.panel.y0) * bh * b.padding,
      cx: width / 2 + ((b.panel.x0 + b.panel.x1) / 2 - 0.5) * bw,
      cy: this.banner.y + ((b.panel.y0 + b.panel.y1) / 2 - 0.5) * bh,
    };
    this.prompt = mkText(this, this.promptBox.cx, this.promptBox.cy, '', TEXT.prompt, {
      align: 'center', color: PROMPT.color, fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(12);
    this.setPrompt(t('Sigue el pasillo… pero algo te espera al fondo'));
  }

  setPrompt(txt) {
    this.banner.setVisible(true);
    this.prompt.setVisible(true).setText(txt);
    fitTextInBox(this.prompt, this.promptBox.w, this.promptBox.h, TEXT.prompt);
    this.prompt.setPosition(this.promptBox.cx, this.promptBox.cy);
  }

  hidePrompt() {
    if (!this.banner.visible) return;
    this.tweens.add({
      targets: [this.banner, this.prompt],
      alpha: 0,
      duration: 300,
      onComplete: () => { this.banner.setVisible(false); this.prompt.setVisible(false); },
    });
  }

  // ─────────────────────────────── loop ───────────────────────────────

  update(time, delta) {
    if (this.phase === PHASE.DEAD || this.phase === PHASE.CARDS) return;
    const { width } = GAME;

    if (this.phase === PHASE.EMERGING) {
      this.avatar.setVelocityX(CHAR.speedWalk);
      this.steps.set('walk');
      if (this.avatar.x >= width * CORRIDOR.emergeXf) {
        this.phase = PHASE.WAIT;
        this.startArena();
      }
      return;
    }

    if (this.phase === PHASE.WAIT) {
      this.handleMove(true);          // confinado al área de esquivar
      this.updateRocks(delta);
      this.positionThought();
      return;
    }

    if (this.phase === PHASE.RUN) {
      this.handleMove(false);         // libre: a la salida
      if (this.avatar.x >= width * CORRIDOR.exitXf) this.leave();
      return;
    }

    if (this.phase === PHASE.LEAVING) {
      this.avatar.setVelocityX(CHAR.speedWalk);
      this.playAnim('walk');
      this.steps.set('walk');
    }
  }

  // Arranca la fase de espera: texto 5 s → temporizador; rocas y pensamientos ya.
  startArena() {
    this.setPrompt(t('¡Esquiva las rocas! Aguanta hasta que el villano se vaya'));
    this.startThrowing();
    this.startThoughts();
    this.introTimer = this.time.delayedCall(CORRIDOR.introMs, () => {
      this.hidePrompt();
      this.startTimer();
    });
  }

  handleMove(bounded) {
    const axis = this.touch ? this.touch.axisX : 0;
    const left = this.cursors.left.isDown || this.keys.A.isDown || axis < 0;
    const right = this.cursors.right.isDown || this.keys.D.isDown || axis > 0;
    const jump = this.cursors.up.isDown || this.keys.W.isDown || this.keys.SPACE.isDown
      || (this.touch ? this.touch.jumpJustPressed() : false);
    const running = this.cursors.shift.isDown || (this.touch ? this.touch.running : false);
    const speed = running ? CHAR.speedRun : CHAR.speedWalk;
    const onFloor = this.avatar.body.blocked.down || this.avatar.body.touching.down;

    if (left) { this.avatar.setVelocityX(-speed); this.avatar.setFlipX(true); }
    else if (right) { this.avatar.setVelocityX(speed); this.avatar.setFlipX(false); }
    else this.avatar.setVelocityX(0);

    if (jump && onFloor) { this.avatar.setVelocityY(CHAR.jump); playSfx(this, 'jump'); }

    if (bounded) {
      const minX = GAME.width * CORRIDOR.arenaLeftXf;
      const maxX = GAME.width * CORRIDOR.arenaRightXf;
      if (this.avatar.x < minX) { this.avatar.x = minX; if (this.avatar.body.velocity.x < 0) this.avatar.setVelocityX(0); }
      if (this.avatar.x > maxX) { this.avatar.x = maxX; if (this.avatar.body.velocity.x > 0) this.avatar.setVelocityX(0); }
    }

    if (onFloor && this.wasAirborne) playSfx(this, 'land');
    this.wasAirborne = !onFloor;

    if (!onFloor) { this.playAnim('jump'); this.steps.set(null); }
    else if (this.avatar.body.velocity.x !== 0) {
      const mode = running ? 'run' : 'walk';
      this.playAnim(mode);
      this.steps.set(mode);
    } else {
      this.playAnim('idle');
      this.steps.set(null);
    }
  }

  playAnim(key) {
    if (this.avatar.anims.currentAnim?.key !== key) this.avatar.play(key, true);
  }

  leave() {
    this.phase = PHASE.LEAVING;
    this.stopThrowing();
    this.clearRocks();
    this.stopThoughts();
    this.avatar.setFlipX(false);
    this.hidePrompt();
    this.tweens.add({
      targets: this.avatar,
      alpha: 0,
      duration: 900,
      ease: 'Sine.easeOut',
      onComplete: () => this.toHands(),
    });
  }

  toHands() {
    this.phase = PHASE.CARDS;
    this.avatar.setVelocityX(0).setVisible(false);
    this.scene.start('Hands', {
      emotion: this.emotion,
      contentIndex: this.contentIndex,
      playedCount: this.playedCount,
      session: this.session,
    });
  }
}
