import { GAME, BG3, HANDS, ORBIT, ACTIONS, TARJETA_FINAL, CONTENT, EMO_MATRIX, TEXT, FONT, UI, COLORS } from '../config.js';
import { mkText, buildTopBar, openSettings, fitTextInBox } from '../ui/hud.js';
import { playSfx } from '../audio.js';
import { recordDecision } from '../db.js';
import { t, emoLabel, getMatriz } from '../i18n.js';

// Escena 3 — la decisión digital. Las manos del algoritmo intentan agarrar lo que
// miras; los elementos que giran en círculo son las ACCIONES (me gusta, comentar,
// compartir, denunciar, ignorar). Al elegir una, según la emoción y el caso sale
// UNA tarjeta con: consecuencia + ejercicio + consejo.
export default class HandsScene extends Phaser.Scene {
  constructor() {
    super('Hands');
  }

  init(data = {}) {
    this.session = data.session ?? [];
    this.contentIndex = data.contentIndex ?? 0;
    this.playedCount = data.playedCount ?? 0;
    this.emotion = data.emotion ?? { id: 'ira', label: 'Ira', color: 0xe63946 };
  }

  create() {
    const { width, height } = GAME;
    this.t = 0;
    this.picked = false;
    this.hovered = null;
    this.endObjects = [];

    const bg = this.add.image(width / 2, height / 2, BG3.key).setDepth(-100);
    bg.setScale(Math.max(width / bg.width, height / bg.height));

    this.buildOrbit();
    this.buildHands();

    this.prompt = mkText(this, width / 2, height * 0.1, t('¿Qué haces con este contenido?'), TEXT.prompt, {
      align: 'center', color: '#f4f2ff', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(50);
    this.prompt.setShadow(0, 3, '#000000', 8, false, true);

    buildTopBar(this, { onSettings: () => openSettings(this) });
  }

  // ─────────────────────────────── acciones en órbita ───────────────────────────────

  buildOrbit() {
    const { width, height } = GAME;
    this.orbitCenter = { x: width / 2, y: height * ORBIT.centerYf };
    this.orbitAngle = 0;

    this.items = ACTIONS.map((act, i) => {
      const node = this.add.container(0, 0).setDepth(10);
      const img = this.add.image(0, 0, act.key);
      img.setScale((ORBIT.itemR * 2.1) / img.height);
      const label = this.add.text(0, ORBIT.itemR * 1.25, t(act.label), {
        fontFamily: FONT, fontSize: '30px', color: '#eaf6ff', fontStyle: 'bold', resolution: 2,
      }).setOrigin(0.5);
      label.setShadow(0, 2, '#000000', 6, false, true);
      node.add([img, label]);

      node.act = act;
      node.baseAngle = (i / ACTIONS.length) * Math.PI * 2;
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
      node.setPosition(
        this.orbitCenter.x + Math.cos(ang) * ORBIT.rx,
        this.orbitCenter.y + Math.sin(ang) * ORBIT.ry,
      );
      const depthF = (Math.sin(ang) + 1) / 2;               // -1 atrás … 1 adelante
      const scale = ORBIT.minScale + (1 - ORBIT.minScale) * depthF;
      node.setScale(node === this.hovered ? scale * 1.14 : scale);
      node.setAlpha(0.6 + 0.4 * depthF);
      node.setDepth(10 + Math.round(depthF * 10));
    }
  }

  // ─────────────────────────────── manos ───────────────────────────────

  buildHands() {
    this.hands = ['left', 'right'].map((side) => {
      const cfg = HANDS[side];
      const s = this.add.image(GAME.width * cfg.xf, GAME.height * HANDS.baseYf, cfg.key)
        .setDepth(40).setAlpha(HANDS.alpha);
      s.setScale(HANDS.height / s.height);
      s.setOrigin(cfg.originX, 1);
      s.cfg = cfg;
      s.side = side;
      s.homeX = s.x;
      s.homeY = s.y;
      s.restRad = Phaser.Math.DegToRad(cfg.restDeg);
      s.baseScale = s.scaleX;
      return s;
    });
  }

  updateHands() {
    const p = this.input.activePointer;
    const activeSide = p.worldX >= GAME.width / 2 ? 'right' : 'left';
    const maxTurn = Phaser.Math.DegToRad(HANDS.maxTurnDeg);

    for (const hand of this.hands) {
      const active = hand.side === activeSide && !this.picked;
      let targetRot = 0;
      let dx = 0;
      let dy = 0;

      if (active) {
        const aim = Math.atan2(p.worldY - hand.homeY, p.worldX - hand.homeX);
        targetRot = Phaser.Math.Clamp(Phaser.Math.Angle.Wrap(aim - hand.restRad), -maxTurn, maxTurn);
        const d = Phaser.Math.Distance.Between(hand.homeX, hand.homeY, p.worldX, p.worldY);
        const reach = HANDS.reach * Math.min(1, d / (GAME.height * 0.7));
        dx = Math.cos(aim) * reach;
        dy = Math.sin(aim) * reach;
      } else {
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
    this.picked = true;
    this.decision = node.act.decision;
    this.decisionLabel = node.act.label;
    playSfx(this, 'select');

    // registra la decisión del jugador en la entrada de este contenido (para el resumen final)
    const cid = CONTENT[this.contentIndex]?.id;
    const entry = [...this.session].reverse().find((e) => e.contentId === cid);
    if (entry) entry.decision = node.act.label;
    recordDecision(cid, node.act.label);   // completa la acción en el historial de por vida + sincroniza

    // la mano del lado del elemento hace el gesto de agarrar
    const hand = this.hands.find((h) => (node.x >= GAME.width / 2 ? h.side === 'right' : h.side === 'left'));
    if (hand) this.tweens.add({ targets: hand, scale: hand.baseScale * 1.16, duration: 160, yoyo: true });

    this.items.forEach((n) => n.disableInteractive());
    this.tweens.add({ targets: node, scale: node.scale * 1.3, alpha: 1, duration: 260, yoyo: true });
    this.items.filter((n) => n !== node)
      .forEach((n) => this.tweens.add({ targets: n, alpha: 0, scale: 0.7, duration: 320 }));
    this.tweens.add({ targets: this.prompt, alpha: 0, duration: 300 });

    this.time.delayedCall(900, () => this.showCard());
  }

  update(time, delta) {
    this.t += delta;
    if (!this.picked) this.updateOrbit(delta);   // al elegir, la órbita se congela
    this.updateHands();
  }

  // ─────────────────────────────── tarjeta final ───────────────────────────────

  showCard() {
    const { width, height } = GAME;
    const node = this.matrixNode();
    const consecuencia = (node.decisiones && node.decisiones[this.decision]) || '';
    const ejercicio = node.ejercicio || '';
    const consejo = node.consejo || '';

    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x05040a, 0.82).setDepth(140);
    const card = this.add.image(width / 2, height / 2, TARJETA_FINAL.key).setDepth(141);
    const cardH = height * 0.92;
    card.setScale(cardH / card.height);
    const cardW = card.displayWidth;

    const h = TARJETA_FINAL.hole;
    const holeW = (h.x1 - h.x0) * cardW;
    const holeH = (h.y1 - h.y0) * cardH;
    const holeCX = width / 2 + ((h.x0 + h.x1) / 2 - 0.5) * cardW;
    const holeTop = height / 2 + (h.y0 - 0.5) * cardH;

    this.endObjects = [overlay, card];

    const sections = [
      [t('Consecuencia de tu decisión'), consecuencia],
      [t('Ejercicio de regulación'), ejercicio],
      [t('Consejo de alfabetización mediática'), consejo],
    ];
    const wrap = holeW * 0.94;
    const secH = holeH / sections.length;
    sections.forEach((s, i) => {
      const top = holeTop + i * secH + 6;
      const header = mkText(this, holeCX, top, s[0], 24, {
        color: '#5ad1ff', fontStyle: 'bold', align: 'center', wordWrap: { width: wrap },
      }).setOrigin(0.5, 0).setDepth(142);
      const body = mkText(this, holeCX, top + header.height + 8, s[1], 22, {
        color: '#eef2ff', align: 'center', wordWrap: { width: wrap }, lineSpacing: 4,
      }).setOrigin(0.5, 0).setDepth(142);
      fitTextInBox(body, wrap, secH - header.height - 26, 22);
      body.setWordWrapWidth(wrap, true);
      this.endObjects.push(header, body);
    });

    const last = this.playedCount + 1 >= CONTENT.length;
    const onNext = () => {
      if (last) {
        this.endObjects.forEach((o) => o.destroy());
        this.endObjects = [];
        this.showSummary();
      } else {
        this.scene.start('Room', {
          contentIndex: (this.contentIndex + 1) % CONTENT.length,
          playedCount: this.playedCount + 1,
          session: this.session,
        });
      }
    };

    // ── Contexto a la IZQUIERDA: qué sintió y qué hizo el jugador ──
    const emoHex = '#' + (this.emotion.color ?? 0xffffff).toString(16).padStart(6, '0');
    const lx = width * 0.15;
    this.endObjects.push(
      mkText(this, lx, height * 0.33, t('SENTISTE'), 26, { color: '#c9c6da', fontStyle: 'bold' }).setOrigin(0.5).setDepth(142),
      mkText(this, lx, height * 0.40, this.emotion.label ? emoLabel(this.emotion) : '—', 48, {
        color: emoHex, fontStyle: 'bold', align: 'center', wordWrap: { width: width * 0.26 },
      }).setOrigin(0.5).setDepth(142),
      mkText(this, lx, height * 0.55, t('HICISTE'), 26, { color: '#c9c6da', fontStyle: 'bold' }).setOrigin(0.5).setDepth(142),
      mkText(this, lx, height * 0.62, this.decisionLabel ? t(this.decisionLabel) : '—', 42, {
        color: '#7fd4ff', fontStyle: 'bold', align: 'center', wordWrap: { width: width * 0.26 },
      }).setOrigin(0.5).setDepth(142),
    );

    // ── Botón a la DERECHA ──
    const size = UI.reset.size;
    const rx = width * 0.85;
    // La flecha del arte apunta a la izquierda; se voltea para que apunte a la
    // DERECHA (sentido de avanzar al siguiente contenido).
    const btn = this.add.image(rx, height * 0.5, UI.reset.key).setDepth(142).setFlipX(true);
    btn.setDisplaySize(size, size).setInteractive({ useHandCursor: true });
    btn.on('pointerover', () => btn.setDisplaySize(size * 1.08, size * 1.08));
    btn.on('pointerout', () => btn.setDisplaySize(size, size));
    btn.on('pointerdown', () => { playSfx(this, 'ui'); onNext(); });
    const hint = mkText(this, rx, height * 0.5 + size * 0.5 + 8,
      last ? t('Terminar') : t('Siguiente'), 24, { color: '#eaf6ff', fontStyle: 'bold' })
      .setOrigin(0.5, 0).setDepth(142);
    this.endObjects.push(btn, hint);
  }

  matrixNode() {
    const caso = CONTENT[this.contentIndex]?.caso;
    const emoName = EMO_MATRIX[this.emotion?.id] || 'Miedo';
    const M = getMatriz();
    return (M[caso] && M[caso][emoName]) || { decisiones: {}, ejercicio: '', consejo: '' };
  }

  // ─────────────────────────────── resumen final ───────────────────────────────

  // Pantalla de cierre: repasa qué SINTIÓ y qué HIZO el jugador en cada contenido.
  showSummary() {
    const { width, height } = GAME;
    this.add.rectangle(width / 2, height / 2, width, height, 0x05040a, 0.94).setDepth(200);
    mkText(this, width / 2, height * 0.11, t('Fin — tus decisiones'), 56, {
      color: '#f4d35e', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(201);
    mkText(this, width / 2, height * 0.18, t('Así reaccionaste ante cada contenido:'), 28, {
      color: '#c9c6da',
    }).setOrigin(0.5).setDepth(201);

    const entries = this.session.length
      ? this.session
      : [{ titulo: '(sin registro)', emotionLabel: '—', decision: '—' }];
    const top = height * 0.26;
    const rowH = Math.min(150, (height * 0.5) / entries.length);
    const panelW = width * 0.62;
    const leftX = width / 2 - panelW / 2 + 36;

    entries.forEach((e, i) => {
      const y = top + i * rowH + rowH / 2;
      this.add.rectangle(width / 2, y, panelW, rowH * 0.84, 0x141222, 0.92)
        .setStrokeStyle(2, COLORS.accent, 0.4).setDepth(201);
      mkText(this, leftX, y - rowH * 0.22, `${i + 1}.  ${e.titulo ? t(e.titulo) : e.contentId}`, 26, {
        fontStyle: 'bold', color: '#ffffff', wordWrap: { width: panelW - 72 },
      }).setOrigin(0, 0.5).setDepth(202);
      mkText(this, leftX, y + rowH * 0.16,
        `${t('Sentiste:')} ${e.emotionLabel ? t(e.emotionLabel) : '—'}      ·      ${t('Hiciste:')} ${e.decision ? t(e.decision) : '—'}`, 24, {
          color: '#7fd4ff',
        }).setOrigin(0, 0.5).setDepth(202);
    });

    // Botón (flecha) para volver al menú.
    const size = UI.reset.size;
    const btn = this.add.image(width / 2, height - 82, UI.reset.key).setDepth(202);
    btn.setDisplaySize(size, size).setInteractive({ useHandCursor: true });
    btn.on('pointerover', () => btn.setDisplaySize(size * 1.08, size * 1.08));
    btn.on('pointerout', () => btn.setDisplaySize(size, size));
    btn.on('pointerdown', () => { playSfx(this, 'ui'); this.scene.start('Menu'); });
    mkText(this, width / 2, height - 82 + size * 0.5 + 4, t('Volver al menú'), 22, {
      color: '#eaf6ff', fontStyle: 'bold',
    }).setOrigin(0.5, 0).setDepth(202);
  }
}
