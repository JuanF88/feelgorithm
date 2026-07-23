// UI compartida entre escenas: texto, botón y tarjetas de retroalimentación.
// Vive aparte porque el ciclo termina en CorridorScene pero las tarjetas también
// se usan desde RoomScene; duplicarlas garantizaba que se desincronizaran.
import { GAME, FONT, COLORS, TEXT, TARJETA, UI } from '../config.js';

// Encoge el texto hasta que quepa dentro de la caja (ancho y alto).
// El banner nuevo tiene un panel interior fijo; sin esto, un texto largo se salía.
export function fitTextInBox(txt, boxW, boxH, maxSize) {
  let size = maxSize;
  txt.setWordWrapWidth(boxW, true);
  txt.setFontSize(size);
  while (size > 14 && (txt.height > boxH || txt.width > boxW)) {
    size -= 2;
    txt.setFontSize(size);
  }
  return size;
}

// iOS en iPhone no implementa la API de pantalla completa (solo la permite en
// videos). No se puede forzar, pero sí se puede explicar: ver `showInstallHint`.
export function fullscreenAvailable(scene) {
  return !!scene.scale.fullscreen?.available;
}

export function toggleFullscreen(scene) {
  if (!fullscreenAvailable(scene)) return false;
  if (scene.scale.isFullscreen) scene.scale.stopFullscreen();
  else scene.scale.startFullscreen();
  return true;
}

// Botones de la esquina superior derecha. `onSettings` es opcional: si no se pasa,
// solo se dibuja el de pantalla completa (el pasillo no tiene menú de ajustes).
export function buildTopBar(scene, { onSettings } = {}) {
  const size = UI.settings.size;
  const { margin, gap } = UI.topRight;
  let x = GAME.width - margin;
  const y = margin;
  const made = [];
  scene.installHint = null;   // la escena se reinicia, la referencia vieja no vale

  if (onSettings) {
    const s = scene.add.image(x, y, UI.settings.key).setDepth(120);
    s.setDisplaySize(size, size).setInteractive({ useHandCursor: true });
    s.on('pointerover', () => s.setScale(s.scaleX * 1.08, s.scaleY * 1.08));
    s.on('pointerout', () => s.setDisplaySize(size, size));
    s.on('pointerdown', onSettings);
    made.push(s);
    x -= size + gap;
  }

  // El botón se dibuja siempre. Antes se ocultaba donde no hay API de pantalla
  // completa, pero en el móvil eso lo hacía desaparecer justo donde más falta
  // hace: ahora, si no puede activarla, al menos explica cómo conseguirla.
  const fs = scene.add.image(x, y, UI.fullscreen.key).setDepth(120);
  fs.setDisplaySize(size, size).setInteractive({ useHandCursor: true });
  fs.on('pointerover', () => fs.setDisplaySize(size * 1.08, size * 1.08));
  fs.on('pointerout', () => fs.setDisplaySize(size, size));
  // pointerUP, no pointerdown: los navegadores móviles solo aceptan la petición
  // de pantalla completa desde un gesto completado, y descartan la de pointerdown.
  fs.on('pointerup', () => {
    if (!toggleFullscreen(scene)) showInstallHint(scene);
  });
  made.push(fs);

  return made;
}

// Aviso para iPhone: la única forma de jugar sin las barras del navegador es
// instalar la PWA. Se cierra tocando en cualquier parte o solo.
export function showInstallHint(scene) {
  if (scene.installHint) return scene.installHint;
  const { width, height } = GAME;
  const box = scene.add.container(width / 2, height * 0.5).setDepth(300);

  const veil = scene.add.rectangle(0, 0, width, height, 0x08070f, 0.72);
  const panel = scene.add.rectangle(0, 0, 1120, 340, 0x171423, 0.98)
    .setStrokeStyle(4, COLORS.accent, 0.85);
  const title = mkText(scene, 0, -96, 'Pantalla completa', 46, { fontStyle: 'bold' }).setOrigin(0.5);
  const body = mkText(scene, 0, 10,
    'Este navegador no la permite desde el juego.\nToca  Compartir  y elige «Añadir a pantalla de inicio»:\nasí se abre sin barras.',
    32, { align: 'center', color: '#c9c6da', lineSpacing: 12 }).setOrigin(0.5);
  const close = mkText(scene, 0, 122, 'Toca para cerrar', 24, { color: '#8a84a8' }).setOrigin(0.5);
  box.add([veil, panel, title, body, close]);

  const dismiss = () => {
    if (!scene.installHint) return;
    scene.installHint = null;
    box.destroy();
  };
  veil.setInteractive({ useHandCursor: true }).on('pointerup', dismiss);
  panel.setInteractive({ useHandCursor: true }).on('pointerup', dismiss);
  scene.time.delayedCall(7000, dismiss);

  scene.installHint = box;
  return box;
}

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
