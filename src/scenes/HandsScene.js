import { GAME, BG3, HANDS, ORBIT, TEXT, FONT, CONTENT, EMOTIONS } from '../config.js';
import { mkText, buildTopBar, showFinalCards, showRevealStub, clearButton } from '../ui/hud.js';

// Escena 3 — las manos del algoritmo.
// Seis elementos giran en círculo. Los brazos salen del borde inferior y se
// orientan hacia el cursor: alcanza el brazo del lado donde está el puntero,
// el otro se relaja. La idea es que el algoritmo intente agarrar lo que miras.
export default class HandsScene extends Phaser.Scene {
  constructor() {
    super('Hands');
  }

  // Llega desde el pasillo con la emoción elegida y el registro de la sesión.
  // El respaldo permite arrancar esta escena suelta para probarla (START_SCENE).
  init(data = {}) {
    this.session = data.session ?? [];
    this.contentIndex = data.contentIndex ?? 0;
    this.emotion = data.emotion ?? EMOTIONS[0];
  }

  create() {
    const { width, height } = GAME;
    this.t = 0;
    this.picked = null;
    this.endObjects = [];

    // El fondo ya trae su propio panel oscuro: no hace falta velo encima.
    const bg = this.add.image(width / 2, height / 2, BG3.key).setDepth(-100);
    bg.setScale(Math.max(width / bg.width, height / bg.height));

    this.buildOrbit();
    this.buildHands();

    this.prompt = mkText(this, width / 2, height * 0.09, 'Elige un elemento', TEXT.prompt, {
      align: 'center', color: '#f4f2ff', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(50);
    this.prompt.setShadow(0, 3, '#000000', 8, false, true);

    buildTopBar(this);
  }

  // ─────────────────────────────── elementos en órbita ───────────────────────────────

  buildOrbit() {
    const { width, height } = GAME;
    this.orbitCenter = { x: width / 2, y: height * ORBIT.centerYf };
    this.orbitAngle = 0;

    this.items = ORBIT.items.map((def, i) => {
      const node = this.add.container(0, 0).setDepth(10);
      const disc = this.add.circle(0, 0, ORBIT.itemR, def.color, 0.92)
        .setStrokeStyle(5, 0xffffff, 0.5);
      const label = this.add.text(0, 0, def.label, {
        fontFamily: FONT, fontSize: '46px', color: '#0d1018', fontStyle: 'bold', resolution: 2,
      }).setOrigin(0.5);
      node.add([disc, label]);

      node.def = def;
      node.disc = disc;
      // El ángulo de cada elemento es fijo; lo que avanza es `orbitAngle`, común
      // a todos: así la rueda gira entera y no se desordenan entre sí.
      node.baseAngle = (i / ORBIT.items.length) * Math.PI * 2;

      node.setSize(ORBIT.itemR * 2, ORBIT.itemR * 2).setInteractive({ useHandCursor: true });
      node.on('pointerover', () => { this.hovered = node; });
      node.on('pointerout', () => { if (this.hovered === node) this.hovered = null; });
      node.on('pointerup', () => this.select(node));
      return node;
    });
  }

  updateOrbit(delta) {
    this.orbitAngle += ORBIT.speed * delta;
    for (const node of this.items) {
      const ang = node.baseAngle + this.orbitAngle;
      const x = this.orbitCenter.x + Math.cos(ang) * ORBIT.rx;
      const y = this.orbitCenter.y + Math.sin(ang) * ORBIT.ry;
      node.setPosition(x, y);

      // sin(ang) va de -1 (atrás) a 1 (adelante): da escala, opacidad y orden.
      const depthF = (Math.sin(ang) + 1) / 2;
      const scale = ORBIT.minScale + (1 - ORBIT.minScale) * depthF;
      node.setScale(node === this.hovered ? scale * 1.14 : scale);
      node.setAlpha(0.55 + 0.45 * depthF);
      node.setDepth(10 + Math.round(depthF * 10));
    }
  }

  // ─────────────────────────────── manos ───────────────────────────────

  buildHands() {
    this.hands = ['left', 'right'].map((side) => {
      const cfg = HANDS[side];
      const s = this.add.image(GAME.width * cfg.xf, GAME.height * HANDS.baseYf, cfg.key)
        .setDepth(40)
        .setAlpha(HANDS.alpha);
      s.setScale(HANDS.height / s.height);
      s.setOrigin(cfg.originX, 1);   // pivota por donde el brazo sale de cuadro
      s.cfg = cfg;
      s.side = side;
      s.homeX = s.x;
      s.homeY = s.y;
      s.restRad = Phaser.Math.DegToRad(cfg.restDeg);
      s.baseScale = s.scaleX;
      return s;
    });
  }

  updateHands(delta) {
    const p = this.input.activePointer;
    const activeSide = p.worldX >= GAME.width / 2 ? 'right' : 'left';
    const maxTurn = Phaser.Math.DegToRad(HANDS.maxTurnDeg);

    for (const hand of this.hands) {
      const active = hand.side === activeSide;
      let targetRot = 0;
      let dx = 0;
      let dy = 0;

      if (active) {
        // Ángulo del pivote al cursor, menos la dirección a la que ya apunta el
        // brazo dibujado: el resto es lo que hay que girar.
        const aim = Math.atan2(p.worldY - hand.homeY, p.worldX - hand.homeX);
        targetRot = Phaser.Math.Clamp(
          Phaser.Math.Angle.Wrap(aim - hand.restRad), -maxTurn, maxTurn,
        );
        const d = Phaser.Math.Distance.Between(hand.homeX, hand.homeY, p.worldX, p.worldY);
        const reach = HANDS.reach * Math.min(1, d / (GAME.height * 0.7));
        dx = Math.cos(aim) * reach;
        dy = Math.sin(aim) * reach;
      } else {
        // En reposo el brazo respira, para que no se vea congelado.
        dy = Math.sin(this.t * HANDS.idleSpeed) * HANDS.idleAmp;
        targetRot = Math.sin(this.t * HANDS.idleSpeed * 0.7) * 0.03;
      }

      hand.rotation = Phaser.Math.Linear(hand.rotation, targetRot, HANDS.lerp);
      hand.x = Phaser.Math.Linear(hand.x, hand.homeX + dx, HANDS.lerp);
      hand.y = Phaser.Math.Linear(hand.y, hand.homeY + dy, HANDS.lerp);

      const targetScale = hand.baseScale * (active ? 1.05 : 1);
      hand.setScale(Phaser.Math.Linear(hand.scaleX, targetScale, HANDS.lerp));
      hand.setOrigin(hand.cfg.originX, 1);
    }
  }

  // ─────────────────────────────── selección ───────────────────────────────

  select(node) {
    if (this.picked) return;
    this.picked = node.def;
    this.prompt.setText(`Elegiste: ${node.def.label}`);

    // La mano del lado del elemento hace el gesto de agarrar.
    const hand = this.hands.find((h) => (node.x >= GAME.width / 2 ? h.side === 'right' : h.side === 'left'));
    this.tweens.add({ targets: hand, scale: hand.baseScale * 1.16, duration: 160, yoyo: true });

    this.items.forEach((n) => n.disableInteractive());
    this.tweens.add({ targets: node, scale: node.scale * 1.3, alpha: 1, duration: 260, yoyo: true });
    this.items.filter((n) => n !== node)
      .forEach((n) => this.tweens.add({ targets: n, alpha: 0, scale: 0.7, duration: 320 }));

    console.log('[Hands] elemento elegido:', node.def.id);

    // Elegido el elemento, se cierra el ciclo con las tarjetas.
    this.time.delayedCall(900, () => this.finish());
  }

  finish() {
    this.tweens.add({ targets: [this.prompt, ...this.hands], alpha: 0, duration: 350 });
    const last = this.contentIndex >= CONTENT.length - 1;

    this.endObjects = showFinalCards(this, {
      emotion: this.emotion,
      last,
      onNext: () => {
        if (last) {
          this.endObjects.forEach((o) => o.destroy());
          this.endObjects = [];
          showRevealStub(this, this.session);
        } else {
          clearButton(this);
          this.scene.start('Room', { contentIndex: this.contentIndex + 1, session: this.session });
        }
      },
    });
  }

  update(time, delta) {
    this.t += delta;
    this.updateOrbit(delta);
    this.updateHands(delta);
  }
}
