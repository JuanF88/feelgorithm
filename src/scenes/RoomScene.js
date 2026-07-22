import { COLORS, EMOTIONS, CONTENT, CHAR, BG, SCREEN, LEVER, PROMPT, CUPULA, TEXT, FLOOR_F, EMO_NEAR, GAME, FONT } from '../config.js';
import { emoKey } from './BootScene.js';
import { buildTopBar, fitTextInBox } from '../ui/hud.js';
import TouchControls, { hasTouch } from '../ui/touch.js';
import { buildEyes } from '../ui/eyes.js';

const STATE = { IDLE: 'idle', PLAYING: 'playing', ASKING: 'asking', PICKED: 'picked' };
const CONTENT_MS = 5000; // duración placeholder; el video real durará ~15s

export default class RoomScene extends Phaser.Scene {
  constructor() {
    super('Room');
  }

  // Al volver del pasillo, la sala se reinicia con el siguiente contenido y el
  // registro acumulado (las escenas de Phaser no conservan estado entre arranques).
  init(data = {}) {
    this.contentIndex = data.contentIndex ?? 0;
    this.session = data.session ?? [];
  }

  create() {
    this.emotionNodes = [];
    this.leverNear = false;
    this.nearEmotion = null;
    this.bubbleKey = null;
    this.bubbleVisible = false;
    this.autoWalking = false;
    this.paused = false;
    this.settingsOpen = false;
    this.settingsObjects = [];
    this.floorY = GAME.height * FLOOR_F;
    this.capsuleY = GAME.height * CUPULA.rowYf; // base de las cápsulas, al nivel del personaje

    this.buildBackground();
    this.buildGround();
    this.buildPrompt();
    this.buildScreen();
    this.buildLever();
    this.buildAvatar();
    this.buildBubble();
    this.buildControls();
    this.buildSettingsButton();
    this.buildTouchControls();

    this.setState(STATE.IDLE);
  }

  mkText(x, y, str, size, extra = {}) {
    return this.add.text(x, y, str, {
      fontFamily: FONT, fontSize: `${size}px`, color: '#e9edf5', resolution: 2, ...extra,
    });
  }

  // ─────────────────────────────── construcción ───────────────────────────────

  buildBackground() {
    const { width, height } = GAME;
    const bg = this.add.image(width / 2, height / 2, BG.key).setDepth(-100);
    bg.setScale(Math.max(width / bg.width, height / bg.height));
    buildEyes(this);   // los ojos del algoritmo, al fondo del centro
  }

  // Suelo invisible sobre el que se para el avatar. Va CHAR.floorOffset px por
  // debajo de FLOOR_F: la palanca se ancla a FLOOR_F y no se mueve con este ajuste.
  buildGround() {
    const y = this.floorY + CHAR.floorOffset;
    this.ground = this.add.rectangle(GAME.width / 2, y + 60, GAME.width, 120, 0x000000, 0);
    this.physics.add.existing(this.ground, true);
  }

  // Texto de instrucción sobre su placa. Ambos arrancan ocultos: showPrompt() los
  // muestra solo cuando hay texto, así la placa no compite con la pantalla.
  buildPrompt() {
    const { width, height } = GAME;
    const b = PROMPT.banner;
    this.banner = this.add.image(width / 2, height * PROMPT.yf, b.key).setDepth(11);
    this.bannerScale = b.displayWidth / this.banner.width;
    this.banner.setScale(this.bannerScale);
    this.banner.setVisible(false);

    // El texto se centra en el PANEL blanco del marco, no en la imagen entera.
    const bw = this.banner.displayWidth;
    const bh = this.banner.displayHeight;
    this.panelBox = {
      w: (b.panel.x1 - b.panel.x0) * bw * b.padding,
      h: (b.panel.y1 - b.panel.y0) * bh * b.padding,
      cx: width / 2 + ((b.panel.x0 + b.panel.x1) / 2 - 0.5) * bw,
      cy: this.banner.y + ((b.panel.y0 + b.panel.y1) / 2 - 0.5) * bh,
    };

    this.prompt = this.mkText(this.panelBox.cx, this.panelBox.cy, '', TEXT.prompt, {
      align: 'center', color: PROMPT.color, fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(12);
  }

  buildScreen() {
    const { width } = GAME;
    const sw = SCREEN.imgW * SCREEN.scale;
    const sh = SCREEN.imgH * SCREEN.scale;
    this.screenDisplayH = sh;
    // El contenedor se posiciona por su centro; SCREEN.topYf define el borde superior.
    this.screenRestY = GAME.height * SCREEN.topYf + sh / 2;
    const hiddenY = -sh / 2 - 40;

    const holeCX = ((SCREEN.hole.x0 + SCREEN.hole.x1) / 2 - 0.5) * sw;
    const holeCY = ((SCREEN.hole.y0 + SCREEN.hole.y1) / 2 - 0.5) * sh;
    const holeW = (SCREEN.hole.x1 - SCREEN.hole.x0) * sw;
    const holeH = (SCREEN.hole.y1 - SCREEN.hole.y0) * sh;
    this.holeW = holeW;

    this.screenCable = this.add.rectangle(width / 2, 0, 6, 0, 0x3a3557).setOrigin(0.5, 0).setDepth(9);
    this.screen = this.add.container(width / 2, hiddenY).setDepth(10);

    this.contentBg = this.add.rectangle(holeCX, holeCY, holeW, holeH, 0x0a0910);
    this.screenLabel = this.mkText(holeCX, holeCY, '', TEXT.screen, {
      align: 'center', wordWrap: { width: holeW - 40 },
    }).setOrigin(0.5);
    this.progress = this.add.rectangle(holeCX - holeW / 2, holeCY + holeH / 2 - 12, 0, 10, COLORS.accent).setOrigin(0, 0.5);

    const frame = this.add.image(0, 0, SCREEN.key).setScale(SCREEN.scale);
    this.screen.add([this.contentBg, this.screenLabel, this.progress, frame]);
  }

  buildLever() {
    this.leverX = GAME.width * LEVER.xf;
    // La base de la palanca se apoya en FLOOR_F desplazada por LEVER.yOffset.
    this.leverY = this.floorY + LEVER.yOffset;
    this.lever = this.add.sprite(this.leverX, this.leverY, LEVER.key, 0).setOrigin(0.5, 1).setDepth(6);
    this.lever.setScale(LEVER.height / this.lever.height);
    this.leverFx = this.lever.preFX ? this.lever.preFX.addGlow(0xff5a5f, 0, 0, false, 0.1, 16) : null;
    this.lever.setInteractive({ useHandCursor: true })
      .on('pointerdown', () => { if (this.leverNear && this.state === STATE.IDLE) this.onLever(); });
  }

  buildAvatar() {
    this.avatar = this.physics.add.sprite(GAME.width * CHAR.spawnXf, this.floorY - 160, CHAR.key).setDepth(9);
    this.avatar.setOrigin(CHAR.originX, 0.5).setScale(CHAR.displayScale);
    this.avatar.setCollideWorldBounds(true);
    this.avatar.play('idle');
    this.physics.add.collider(this.avatar, this.ground);
  }

  buildBubble() {
    this.bubble = this.add.container(0, 0).setDepth(90).setAlpha(0);
    this.bubbleG = this.add.graphics();
    this.bubbleMain = this.mkText(0, -12, '', TEXT.label, { color: '#141019', fontStyle: 'bold' }).setOrigin(0.5);
    this.bubbleHint = this.mkText(0, 18, '⏎ Enter', TEXT.hint, { color: '#c0392b', fontStyle: 'bold' }).setOrigin(0.5);
    this.bubble.add([this.bubbleG, this.bubbleMain, this.bubbleHint]);
    this.bubbleH = 84;
  }

  buildControls() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('W,A,D,SPACE');
    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.input.keyboard.on('keydown-ESC', () => (this.settingsOpen ? this.closeSettings() : this.openSettings()));
  }

  // ─────────────────────────────── configuración / menú ───────────────────────────────

  // Ajustes (con su arte) + pantalla completa, arriba a la derecha.
  buildSettingsButton() {
    buildTopBar(this, { onSettings: () => this.openSettings() });
  }

  // Palanca y botón de acción, solo en pantallas táctiles.
  buildTouchControls() {
    if (!hasTouch()) return;
    this.touch = new TouchControls(this);
  }

  // Enter en teclado o el botón de acción en táctil: mismo camino.
  actionPressed() {
    return Phaser.Input.Keyboard.JustDown(this.enterKey)
      || (this.touch ? this.touch.actionJustPressed() : false);
  }

  openSettings() {
    if (this.settingsOpen) return;
    this.settingsOpen = true;
    this.paused = true;
    this.avatar.setVelocity(0, 0);

    const { width, height } = GAME;
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x05040a, 0.78)
      .setDepth(300).setInteractive();
    const panel = this.add.rectangle(width / 2, height / 2, 760, 420, 0x141222, 0.98)
      .setStrokeStyle(4, COLORS.accent, 0.6).setDepth(301);
    const title = this.mkText(width / 2, height / 2 - 130, 'Configuración', 52, { fontStyle: 'bold', color: '#ffffff' })
      .setOrigin(0.5).setDepth(302);
    const b1 = this.panelButton(width / 2, height / 2, 'Continuar', () => this.closeSettings());
    const b2 = this.panelButton(width / 2, height / 2 + 110, 'Volver al menú principal', () => this.scene.start('Menu'));

    this.settingsObjects = [overlay, panel, title, b1, b2];
  }

  closeSettings() {
    this.settingsObjects.forEach((o) => o.destroy());
    this.settingsObjects = [];
    this.settingsOpen = false;
    this.paused = false;
  }

  panelButton(x, y, text, onClick) {
    const c = this.add.container(x, y).setDepth(302);
    const bg = this.add.rectangle(0, 0, 560, 82, 0x2b2740).setStrokeStyle(3, COLORS.accent, 0.5);
    const label = this.mkText(0, 0, text, TEXT.button, { color: '#f4f2ff', fontStyle: 'bold' }).setOrigin(0.5);
    c.add([bg, label]);
    c.setSize(560, 82).setInteractive({ useHandCursor: true });
    c.on('pointerover', () => bg.setFillStyle(0x3a3557));
    c.on('pointerout', () => bg.setFillStyle(0x2b2740));
    c.on('pointerdown', onClick);
    return c;
  }

  // ─────────────────────────────── update ───────────────────────────────

  update() {
    if (!this.avatar || !this.avatar.body || this.paused) return;
    this.handleMovement();

    if (this.state === STATE.IDLE) this.updateLeverProximity();
    else if (this.state === STATE.ASKING) this.updateEmotionProximity();
    else this.dismissBubble();
  }

  handleMovement() {
    // al final del nivel el personaje sale corriendo a la derecha (sin control del jugador)
    if (this.autoWalking) {
      this.avatar.setFlipX(false);
      if (this.avatar.x < this.autoTarget) {
        this.avatar.setVelocityX(CHAR.speedRun);
        this.playAnim('run');
      } else {
        this.avatar.setVelocityX(0);
        this.autoWalking = false;
        this.playAnim('idle');
        this.endLevel();
      }
      return;
    }

    // La palanca táctil se suma al teclado: llevarla al tope equivale a correr.
    const axis = this.touch ? this.touch.axisX : 0;
    const left = this.cursors.left.isDown || this.keys.A.isDown || axis < 0;
    const right = this.cursors.right.isDown || this.keys.D.isDown || axis > 0;
    const jump = this.cursors.up.isDown || this.keys.W.isDown || this.keys.SPACE.isDown;
    const running = this.cursors.shift.isDown || (this.touch ? this.touch.running : false);
    const onFloor = this.avatar.body.blocked.down || this.avatar.body.touching.down;
    const speed = running ? CHAR.speedRun : CHAR.speedWalk;

    if (left && !right) { this.avatar.setVelocityX(-speed); this.avatar.setFlipX(true); }
    else if (right && !left) { this.avatar.setVelocityX(speed); this.avatar.setFlipX(false); }
    else this.avatar.setVelocityX(0);

    if (jump && onFloor) this.avatar.setVelocityY(CHAR.jump);

    if (!onFloor) this.playAnim('jump');
    else if (this.avatar.body.velocity.x !== 0) this.playAnim(running ? 'run' : 'walk');
    else this.playAnim('idle');
  }

  playAnim(key) {
    if (this.avatar.anims.currentAnim?.key !== key) this.avatar.play(key, true);
  }

  updateLeverProximity() {
    const near = this.lever.alpha > 0.5 && Math.abs(this.avatar.x - this.leverX) < LEVER.nearDist;
    if (near !== this.leverNear) { this.leverNear = near; this.glowLever(near); }
    if (near) {
      this.requestBubble('Activa la palanca');
      if (this.actionPressed()) this.onLever();
    } else {
      this.dismissBubble();
    }
  }

  updateEmotionProximity() {
    let nearest = null;
    let best = EMO_NEAR;
    for (const nd of this.emotionNodes) {
      const dd = Math.abs(this.avatar.x - nd.x);
      if (dd < best) { best = dd; nearest = nd; }
    }
    if (nearest !== this.nearEmotion) {
      if (this.nearEmotion) this.tweens.add({ targets: this.nearEmotion, scale: 1, duration: 120 });
      this.nearEmotion = nearest;
      if (nearest) this.tweens.add({ targets: nearest, scale: 1.12, duration: 120 });
    }
    if (nearest) {
      this.requestBubble(`Selecciona ${nearest.emo.label}`, nearest.emo.color);
      if (this.actionPressed()) this.onPick(nearest);
    } else {
      this.dismissBubble();
    }
  }

  glowLever(v) {
    if (!this.leverFx) return;
    this.tweens.killTweensOf(this.leverFx);
    this.tweens.add({ targets: this.leverFx, outerStrength: v ? 12 : 0, duration: 250 });
  }

  // ─────────────────────────────── globo del personaje ───────────────────────────────

  // color opcional: pinta el globo con el color de la emoción (blanco por defecto).
  requestBubble(text, color) {
    const key = `${text}|${color ?? ''}`;
    if (this.bubbleKey !== key) { this.setBubbleText(text, color); this.bubbleKey = key; }
    if (!this.bubbleVisible) {
      this.bubbleVisible = true;
      this.tweens.add({ targets: this.bubble, alpha: 1, duration: 200 });
    }
    this.positionBubble();
  }

  dismissBubble() {
    if (!this.bubbleVisible) return;
    this.bubbleVisible = false;
    this.bubbleKey = null;
    this.tweens.add({ targets: this.bubble, alpha: 0, duration: 200 });
  }

  setBubbleText(main, color) {
    const bg = color ?? 0xffffff;
    const textCol = this.luminance(bg) > 0.58 ? '#141019' : '#ffffff'; // contraste automático
    this.bubbleMain.setText(main).setColor(textCol);
    this.bubbleHint.setColor(textCol);
    const w = Math.max(this.bubbleMain.width, this.bubbleHint.width) + 56;
    const h = this.bubbleH;
    this.bubbleG.clear();
    this.bubbleG.fillStyle(bg, 1);
    this.bubbleG.fillRoundedRect(-w / 2, -h / 2, w, h, 20);
    this.bubbleG.fillTriangle(-16, h / 2 - 2, 16, h / 2 - 2, 0, h / 2 + 24);
  }

  luminance(hex) {
    const r = ((hex >> 16) & 255) / 255;
    const g = ((hex >> 8) & 255) / 255;
    const b = (hex & 255) / 255;
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  positionBubble() {
    const headTop = this.avatar.y - this.avatar.displayHeight / 2;
    this.bubble.x = this.avatar.x;
    this.bubble.y = headTop - 30 - this.bubbleH / 2;
  }

  // ─────────────────────────────── loop ───────────────────────────────

  setState(s) {
    this.state = s;
    // Sin placa al empezar: el globo sobre el personaje ("Activa la palanca") ya
    // guía cuando hace falta, y la sala se ve limpia mientras el jugador explora.
    if (s === STATE.IDLE) this.showPrompt('');
  }

  onLever() {
    if (this.state !== STATE.IDLE) return;
    this.setState(STATE.PLAYING);
    this.leverNear = false;
    this.glowLever(false);
    this.dismissBubble();
    this.showPrompt('');   // sin instrucción: que el contenido hable solo
    // Se acciona la palanca; la pantalla solo baja cuando la animación termina.
    this.lever.play('lever-pull');
    this.lever.once('animationcomplete-lever-pull', () => {
      this.tweens.add({ targets: this.lever, alpha: 0, duration: 300 }); // la palanca desaparece
      this.descendScreen();
    });
  }

  descendScreen() {
    // baja vacía (el contenido se pone al terminar el descenso)
    if (this.contentImg) { this.contentImg.destroy(); this.contentImg = null; }
    this.contentBg.setFillStyle(0x0a0910);
    this.screenLabel.setText('');
    this.tweens.add({
      targets: this.screen,
      y: this.screenRestY,
      duration: 800,
      ease: 'Back.easeOut',
      onUpdate: () => this.updateCable(),
      onComplete: () => this.playContent(),
    });
  }

  playContent() {
    const item = CONTENT[this.contentIndex];

    // muestra la pieza de contenido dentro del hueco de la pantalla
    // (para VIDEO real: this.add.video(...) en vez de image, y disparar askEmotion en 'complete')
    if (item.key && this.textures.exists(item.key)) {
      this.contentBg.setFillStyle(0x05060a);
      const img = this.add.image(this.contentBg.x, this.contentBg.y, item.key);
      const s = Math.min(this.contentBg.width / img.width, this.contentBg.height / img.height);
      img.setScale(s);
      this.screen.addAt(img, 1); // detrás de la barra de progreso y del marco
      this.contentImg = img;
    } else {
      this.contentBg.setFillStyle(0x1a0f1f);
      this.screenLabel.setText(item.titulo || '');
    }

    this.progress.width = 0;
    this.tweens.add({
      targets: this.progress,
      width: this.holeW,
      duration: CONTENT_MS,
      ease: 'Linear',
      onComplete: () => this.raiseScreen(() => this.askEmotion()), // la pantalla se retrae
    });
  }

  raiseScreen(cb) {
    this.tweens.add({
      targets: this.screen,
      y: -this.screenDisplayH / 2 - 40,
      duration: 500,
      ease: 'Back.easeIn',
      onUpdate: () => this.updateCable(),
      onComplete: cb,
    });
  }

  askEmotion() {
    this.setState(STATE.ASKING);
    this.showPrompt('¿Qué sentiste? Selecciona la emoción correspondiente');

    const spacing = GAME.width / (EMOTIONS.length + 1);
    this.emotionNodes = EMOTIONS.map((emo, i) => {
      const node = this.buildEmotion(emo, spacing * (i + 1));
      node.setAlpha(0);
      node.y = this.capsuleY + 60;
      this.tweens.add({ targets: node, y: this.capsuleY, alpha: 1, duration: 500, delay: i * 90, ease: 'Back.easeOut' });
      return node;
    });
  }

  // Cápsula con la criatura de la emoción flotando detrás del cristal.
  // Si la emoción todavía no tiene arte, cae al orbe de color como respaldo.
  buildEmotion(emo, x) {
    const capH = CUPULA.height;
    const node = this.add.container(x, this.capsuleY).setDepth(8);
    const orbY = -capH * (1 - CUPULA.orbYf);

    let orb;
    const key = emoKey(emo);
    if (emo.sheet && this.textures.exists(key)) {
      orb = this.add.sprite(0, orbY, key).setOrigin(0.5, 0.5);
      orb.setScale((capH * CUPULA.creatureF) / orb.height);   // escala con el domo
      orb.play(key);
    } else {
      orb = this.add.circle(0, orbY, CUPULA.orbR, emo.color).setStrokeStyle(3, 0xffffff, 0.5);
    }
    const cap = this.add.image(0, 0, CUPULA.key).setOrigin(0.5, 1);
    cap.setScale(capH / cap.height);

    node.add([orb, cap]); // orbe detrás, cápsula encima (el cristal lo deja ver)
    node.emo = emo;
    this.tweens.add({ targets: orb, y: orbY - 16, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    const capW = cap.displayWidth;
    node.setInteractive(new Phaser.Geom.Rectangle(-capW / 2, -capH, capW, capH), Phaser.Geom.Rectangle.Contains);
    node.on('pointerdown', () => this.onPick(node));
    return node;
  }

  onPick(node) {
    if (this.state !== STATE.ASKING) return;
    this.setState(STATE.PICKED);
    const emo = node.emo;
    this.pickedEmotion = emo;
    this.selectedNode = node;
    this.nearEmotion = null;
    this.dismissBubble();

    this.logChoice(CONTENT[this.contentIndex].id, emo.id);

    // desaparece el resto de las cápsulas
    this.emotionNodes.forEach((nd) => {
      nd.disableInteractive();
      if (nd === node) return;
      this.tweens.add({ targets: nd, alpha: 0, scale: 0.85, duration: 350 });
    });
    this.tweens.add({ targets: node, scale: 1.2, duration: 250, yoyo: true });

    this.avatar.setTint(emo.color);
    this.showPrompt(`Sentiste: ${emo.label}`);

    this.time.delayedCall(1100, () => this.startAutoWalk());
  }

  // El personaje camina solo a la derecha; al llegar, termina el nivel.
  startAutoWalk() {
    if (this.selectedNode) this.tweens.add({ targets: this.selectedNode, alpha: 0, duration: 400 });
    this.autoTarget = GAME.width * 0.9;
    this.autoWalking = true;
  }

  // El nivel ya no termina aquí: el personaje se va al pasillo (escena 2) y allí
  // se cierra el ciclo con las tarjetas.
  endLevel() {
    this.scene.start('Corridor', {
      emotion: this.pickedEmotion,
      contentIndex: this.contentIndex,
      session: this.session,
    });
  }

  // ─────────────────────────────── helpers ───────────────────────────────

  updateCable() {
    const topOfScreen = this.screen.y - this.screenDisplayH / 2;
    this.screenCable.height = Math.max(0, topOfScreen);
  }

  showPrompt(txt) {
    if (this.prompt.text === txt) return;
    this.prompt.setText(txt);
    // La placa acompaña al texto: sin texto, no hay placa.
    this.banner.setVisible(!!txt);
    if (!txt) return;
    // Ajusta el tamaño de letra para que quepa dentro del panel blanco.
    fitTextInBox(this.prompt, this.panelBox.w, this.panelBox.h, TEXT.prompt);
    this.prompt.setPosition(this.panelBox.cx, this.panelBox.cy);
    this.prompt.setScale(0.9);
    this.banner.setScale(this.bannerScale * 0.9);
    this.tweens.add({ targets: this.prompt, scale: 1, duration: 180, ease: 'Back.easeOut' });
    this.tweens.add({ targets: this.banner, scale: this.bannerScale, duration: 180, ease: 'Back.easeOut' });
  }

  logChoice(contentId, emotionId) {
    const entry = { contentId, emotionId, t: Date.now() };
    this.session.push(entry);
    try {
      const all = JSON.parse(localStorage.getItem('feelgorithm_sesiones') || '[]');
      all.push(entry);
      localStorage.setItem('feelgorithm_sesiones', JSON.stringify(all));
    } catch (e) { /* localStorage no disponible: seguimos igual */ }
    console.log('[Elección]', entry);
  }
}
