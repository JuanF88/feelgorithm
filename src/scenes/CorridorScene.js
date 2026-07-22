import { GAME, CHAR, BG2, CORRIDOR, CONTENT, PROMPT, TEXT } from '../config.js';
import { mkText, showFinalCards, showRevealStub, clearButton } from '../ui/hud.js';

// Escena 2 — el pasillo. El personaje sale del túnel izquierdo, el jugador lo
// lleva por el camino que une las dos bocas y al entrar en la derecha desaparece:
// ahí se cierra el ciclo y aparecen las tarjetas de retroalimentación.
const PHASE = { EMERGING: 'emerging', WALKING: 'walking', LEAVING: 'leaving', CARDS: 'cards' };

export default class CorridorScene extends Phaser.Scene {
  constructor() {
    super('Corridor');
  }

  // Datos que trae RoomScene: qué emoción eligió, en qué contenido va y el registro.
  init(data) {
    this.emotion = data.emotion;
    this.contentIndex = data.contentIndex ?? 0;
    this.session = data.session ?? [];
  }

  create() {
    const { width, height } = GAME;
    this.phase = PHASE.EMERGING;
    this.endObjects = [];

    const bg = this.add.image(width / 2, height / 2, BG2.key).setDepth(-100);
    bg.setScale(Math.max(width / bg.width, height / bg.height));

    this.floorY = height * CORRIDOR.floorYf;
    this.ground = this.add.rectangle(width / 2, this.floorY + 60, width, 120, 0x000000, 0);
    this.physics.add.existing(this.ground, true);

    this.avatar = this.physics.add.sprite(width * CORRIDOR.entryXf, this.floorY - 120, CHAR.key)
      .setDepth(9);
    this.avatar.setOrigin(CHAR.originX, 0.5).setScale(CORRIDOR.charScale);
    this.avatar.setAlpha(0);
    this.avatar.setCollideWorldBounds(true);
    this.avatar.play('walk');
    this.physics.add.collider(this.avatar, this.ground);

    // Sale de la oscuridad del túnel: aparece mientras ya viene caminando.
    this.tweens.add({ targets: this.avatar, alpha: 1, duration: 700, ease: 'Sine.easeIn' });

    this.buildPrompt();
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('A,D');
  }

  buildPrompt() {
    const { width, height } = GAME;
    const b = PROMPT.banner;
    this.banner = this.add.image(width / 2, height * PROMPT.yf, b.key).setDepth(11);
    this.banner.setScale(b.displayWidth / this.banner.width);
    this.prompt = mkText(this, width / 2, this.banner.y + this.banner.displayHeight * b.textYf,
      'Sigue el pasillo hasta la otra puerta', TEXT.prompt, {
        align: 'center', color: PROMPT.color, fontStyle: 'bold',
        wordWrap: { width: this.banner.displayWidth * 0.84 },
      }).setOrigin(0.5).setDepth(12);
  }

  hidePrompt() {
    if (!this.banner.visible) return;
    this.tweens.add({
      targets: [this.banner, this.prompt],
      alpha: 0,
      duration: 300,
      onComplete: () => this.banner.setVisible(false),
    });
  }

  update() {
    const { width } = GAME;

    if (this.phase === PHASE.EMERGING) {
      this.avatar.setVelocityX(CHAR.speedWalk);
      if (this.avatar.x >= width * CORRIDOR.emergeXf) this.phase = PHASE.WALKING;
      return;
    }

    if (this.phase === PHASE.WALKING) {
      const left = this.cursors.left.isDown || this.keys.A.isDown;
      const right = this.cursors.right.isDown || this.keys.D.isDown;
      const running = this.cursors.shift.isDown;
      const speed = running ? CHAR.speedRun : CHAR.speedWalk;

      if (left) { this.avatar.setVelocityX(-speed); this.avatar.setFlipX(true); }
      else if (right) { this.avatar.setVelocityX(speed); this.avatar.setFlipX(false); }
      else this.avatar.setVelocityX(0);

      if (this.avatar.body.velocity.x !== 0) this.playAnim(running ? 'run' : 'walk');
      else this.playAnim('idle');

      if (this.avatar.x >= width * CORRIDOR.exitXf) this.leave();
      return;
    }

    if (this.phase === PHASE.LEAVING) {
      this.avatar.setVelocityX(CHAR.speedWalk);
      this.playAnim('walk');
    }
  }

  playAnim(key) {
    if (this.avatar.anims.currentAnim?.key !== key) this.avatar.play(key, true);
  }

  // Entra al túnel derecho: sigue caminando mientras se desvanece en la oscuridad.
  leave() {
    this.phase = PHASE.LEAVING;
    this.avatar.setFlipX(false);
    this.hidePrompt();
    this.tweens.add({
      targets: this.avatar,
      alpha: 0,
      duration: 900,
      ease: 'Sine.easeOut',
      onComplete: () => this.showCards(),
    });
  }

  showCards() {
    this.phase = PHASE.CARDS;
    this.avatar.setVelocityX(0).setVisible(false);
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
          // Vuelve a la sala con el siguiente contenido, conservando el registro.
          this.scene.start('Room', { contentIndex: this.contentIndex + 1, session: this.session });
        }
      },
    });
  }
}
