// UI compartida entre escenas: texto, botón y tarjetas de retroalimentación.
// Vive aparte porque el ciclo termina en CorridorScene pero las tarjetas también
// se usan desde RoomScene; duplicarlas garantizaba que se desincronizaran.
import { GAME, FONT, COLORS, TEXT, TARJETA } from '../config.js';

export function mkText(scene, x, y, str, size, extra = {}) {
  return scene.add.text(x, y, str, {
    fontFamily: FONT, fontSize: `${size}px`, color: '#e9edf5', resolution: 2, ...extra,
  });
}

export function showButton(scene, text, onClick) {
  clearButton(scene);
  const { width, height } = GAME;
  const btn = scene.add.container(width / 2, height - 70).setDepth(160);
  const bg = scene.add.rectangle(0, 0, 460, 70, COLORS.accent).setStrokeStyle(3, 0x000000, 0.2);
  const label = mkText(scene, 0, 0, text, TEXT.button, { color: '#12101a', fontStyle: 'bold' }).setOrigin(0.5);
  btn.add([bg, label]);
  btn.setSize(460, 70).setInteractive({ useHandCursor: true });
  btn.on('pointerover', () => bg.setFillStyle(0xffe08a));
  btn.on('pointerout', () => bg.setFillStyle(COLORS.accent));
  btn.on('pointerdown', onClick);
  scene.button = btn;
  return btn;
}

export function clearButton(scene) {
  if (scene.button) { scene.button.destroy(); scene.button = null; }
}

export function buildCard(scene, x, y, title, body, color) {
  const c = scene.add.container(x, y).setDepth(151);
  const img = scene.add.image(0, 0, TARJETA.key);
  const cardW = GAME.width * 0.40;
  img.setScale(cardW / img.width);
  const cardH = img.displayHeight;

  // texto dentro del área azul del marco
  const blueTop = (TARJETA.blue.y0 - 0.5) * cardH;
  const blueW = (TARJETA.blue.x1 - TARJETA.blue.x0) * cardW;
  const t = mkText(scene, 0, blueTop + 44, title, 38, {
    fontStyle: 'bold', color: '#0a1018', align: 'center', wordWrap: { width: blueW * 0.9 },
  }).setOrigin(0.5, 0);
  const accent = scene.add.rectangle(0, blueTop + 112, blueW * 0.42, 6, color).setOrigin(0.5);
  const b = mkText(scene, 0, blueTop + 146, body, TEXT.label, {
    color: '#122236', align: 'left', wordWrap: { width: blueW * 0.86 }, lineSpacing: 10,
  }).setOrigin(0.5, 0);

  c.add([img, t, accent, b]);
  return c;
}

// Movimiento 6 del loop: las dos tarjetas de retroalimentación.
// Devuelve los objetos creados para que la escena los pueda destruir.
export function showFinalCards(scene, { emotion, last, onNext }) {
  const { width, height } = GAME;
  const overlay = scene.add.rectangle(width / 2, height / 2, width, height, 0x05040a, 0.8).setDepth(150);
  const title = mkText(scene, width / 2, height * 0.11, 'Fin del nivel', 46, {
    color: '#f4d35e', fontStyle: 'bold',
  }).setOrigin(0.5).setDepth(151);

  const cardEmo = buildCard(scene, width * 0.28, height * 0.54,
    `Tu emoción: ${emotion.label}`, emotion.feel, emotion.color);
  const cardCont = buildCard(scene, width * 0.72, height * 0.54, 'El contenido',
    '(Aquí irá la retroalimentación sobre el contenido: qué técnica de manipulación usó y cómo actuar frente a ella.)',
    0x457b9d);

  showButton(scene, last ? 'Terminar →' : 'Siguiente contenido →', onNext);
  return [overlay, title, cardEmo, cardCont];
}

export function showRevealStub(scene, session) {
  const { width, height } = GAME;
  clearButton(scene);
  scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.9).setDepth(200);
  mkText(scene, width / 2, height / 2 - 40, 'REVEAL (placeholder)', 52, { color: '#f4d35e' })
    .setOrigin(0.5).setDepth(201);
  mkText(scene, width / 2, height / 2 + 50,
    '«Este experimento no fue aquí. Fue tu martes.»\nAquí la pantalla mostrará el feed del propio jugador.',
    TEXT.screen, { align: 'center' }).setOrigin(0.5).setDepth(201);
  console.log('[Sesión completa] Registro:', session);
}
