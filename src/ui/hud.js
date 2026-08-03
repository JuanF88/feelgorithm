// UI compartida entre escenas: texto, botón y tarjetas de retroalimentación.
// Vive aparte porque el ciclo termina en CorridorScene pero las tarjetas también
// se usan desde RoomScene; duplicarlas garantizaba que se desincronizaran.
import { GAME, FONT, COLORS, TEXT, TARJETA, UI, EMOTIONS } from '../config.js';
import { buildMusicButton, playSfx } from '../audio.js';
import { t, getLang, toggleLang } from '../i18n.js';

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
  if (scene.scale.isFullscreen) {
    scene.scale.stopFullscreen();
  } else {
    // La petición debe hacerse dentro del gesto (por eso se llama desde 'pointerup').
    scene.scale.startFullscreen();
    // En móvil, intentar bloquear horizontal (puede fallar/ignorarse: no pasa nada).
    try {
      const o = window.screen && window.screen.orientation;
      if (o && o.lock) o.lock('landscape').catch(() => {});
    } catch (e) { /* orientación no bloqueable: seguimos igual */ }
  }
  return true;
}

// Botones de la esquina superior derecha. `onSettings` es opcional: si no se pasa,
// solo se dibuja el de pantalla completa (el pasillo no tiene menú de ajustes).
export function buildTopBar(scene, { onSettings, music = 'main' } = {}) {
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
    s.on('pointerdown', () => { playSfx(scene, 'ui'); onSettings(); });
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
    playSfx(scene, 'ui');
    if (!toggleFullscreen(scene)) showInstallHint(scene);
  });
  made.push(fs);
  x -= size + gap;

  // Botón para encender/apagar la música. Va en todas las escenas (aquí se llama),
  // arranca la música según la preferencia y fija la PISTA de esta escena
  // ('main' por defecto; el pasillo pasa 'scary').
  made.push(buildMusicButton(scene, x, y, size, music));
  x -= size + gap + 24;   // el toggle de idioma es más ancho (píldora)

  // Botón de idioma ES/EN. Al cambiar, reinicia la escena para re-renderizar todo.
  made.push(buildLangToggle(scene, x, y, size));

  return made;
}

// Píldora ES/EN. Muestra el idioma actual; al tocarla, cambia y reinicia la escena.
function buildLangToggle(scene, x, y, size) {
  const w = size * 1.35;
  const h = size * 0.72;
  const c = scene.add.container(x, y).setDepth(120);
  const g = scene.add.graphics();
  g.fillStyle(0x17132a, 0.9).fillRoundedRect(-w / 2, -h / 2, w, h, 12);
  g.lineStyle(2, UI_ACCENT, 0.6).strokeRoundedRect(-w / 2, -h / 2, w, h, 12);
  const label = mkText(scene, 0, 0, getLang().toUpperCase(), 30, {
    fontStyle: 'bold', color: '#eaf6ff',
  }).setOrigin(0.5);
  c.add([g, label]);
  c.setSize(w, h).setInteractive({ useHandCursor: true });
  c.on('pointerover', () => label.setColor('#ffffff'));
  c.on('pointerout', () => label.setColor('#eaf6ff'));
  c.on('pointerup', () => { playSfx(scene, 'ui'); toggleLang(); scene.scene.restart(); });
  return c;
}

// Abre el menú de configuración/pausa (compartido por todas las escenas): lanza la
// escena 'Pause' encima y pausa la actual. Funciona igual en sala, pasillo y manos.
export function openSettings(scene) {
  if (scene.scene.isActive('Pause')) return;
  scene.scene.launch('Pause', { fromKey: scene.scene.key });
  scene.scene.pause();
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
  const title = mkText(scene, 0, -96, t('Pantalla completa'), 46, { fontStyle: 'bold' }).setOrigin(0.5);
  const body = mkText(scene, 0, 10,
    t('Este navegador no la permite desde el juego.\nToca  Compartir  y elige «Añadir a pantalla de inicio»:\nasí se abre sin barras.'),
    32, { align: 'center', color: '#c9c6da', lineSpacing: 12 }).setOrigin(0.5);
  const close = mkText(scene, 0, 122, t('Toca para cerrar'), 24, { color: '#8a84a8' }).setOrigin(0.5);
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

// ── Estilo de modales, compartido por género, configuración y controles ────────
// Para que los diálogos se sientan la misma pieza y lleven la firma del juego:
// panel violeta oscuro con esquinas redondeadas + borde acento AZUL CIBERNÉTICO, y
// bajo el título una regla con los colores de las emociones (el motivo del logo,
// donde las letras son las criaturas). El azul es el mismo cian (#5ad1ff) que ya
// usan los encabezados de las tarjetas finales: refuerza el tema del algoritmo.
export const UI_ACCENT = 0x5ad1ff;       // azul cibernético de los modales
export const UI_ACCENT_HEX = '#5ad1ff';
const MODAL = {
  panel: 0x17132a,      // violeta oscuro, hermano del fondo del juego (#0e0b16)
  btn: 0x231d38,        // botón en reposo
  btnHover: 0x27324a,   // botón resaltado (con tinte azulado)
  radiusPanel: 28,
  radiusBtn: 16,
};

// Dibuja (o redibuja) un rectángulo redondeado centrado en (cx, cy) sobre un Graphics.
function drawRound(g, cx, cy, w, h, r, fill, fillA, line, lineW, lineA) {
  g.clear();
  if (fill != null) { g.fillStyle(fill, fillA); g.fillRoundedRect(cx - w / 2, cy - h / 2, w, h, r); }
  if (line != null && lineW > 0) { g.lineStyle(lineW, line, lineA); g.strokeRoundedRect(cx - w / 2, cy - h / 2, w, h, r); }
}

// Velo + panel del modal, con título y regla de emociones. Devuelve las piezas
// (para poder destruirlas) y las coordenadas útiles para colocar el contenido.
export function openModal(scene, { w, h, title, subtitle, depth = 300 }) {
  const { width, height } = GAME;
  const cx = width / 2, cy = height / 2;
  const parts = [];

  const veil = scene.add.rectangle(cx, cy, width, height, 0x08060f, 0.82)
    .setDepth(depth).setInteractive();   // interactivo = traga clics del fondo
  const shadow = scene.add.graphics().setDepth(depth + 1);
  drawRound(shadow, cx, cy + 8, w + 26, h + 26, MODAL.radiusPanel + 6, 0x000000, 0.4, null, 0, 0);
  const panel = scene.add.graphics().setDepth(depth + 2);
  drawRound(panel, cx, cy, w, h, MODAL.radiusPanel, MODAL.panel, 0.98, UI_ACCENT, 4, 0.75);
  parts.push(veil, shadow, panel);

  const top = cy - h / 2;
  const t = mkText(scene, cx, top + 62, title, 46, {
    fontStyle: 'bold', color: '#ffffff', align: 'center', wordWrap: { width: w * 0.86 },
  }).setOrigin(0.5).setDepth(depth + 3);
  parts.push(t);

  // Regla firma: los colores de las emociones en pequeños segmentos redondeados.
  const rule = scene.add.graphics().setDepth(depth + 3);
  const cols = EMOTIONS.map((e) => e.color);
  const segW = 30, segGap = 9, ruleY = t.y + t.height / 2 + 14;
  const totalW = cols.length * segW + (cols.length - 1) * segGap;
  let sx = cx - totalW / 2;
  cols.forEach((col) => { rule.fillStyle(col, 0.95); rule.fillRoundedRect(sx, ruleY, segW, 7, 3); sx += segW + segGap; });
  parts.push(rule);

  let contentTop = ruleY + 28;
  if (subtitle) {
    const s = mkText(scene, cx, contentTop, subtitle, 24, {
      color: '#a7a2c0', align: 'center', lineSpacing: 6, wordWrap: { width: w * 0.82 },
    }).setOrigin(0.5, 0).setDepth(depth + 3);
    parts.push(s);
    contentTop = s.y + s.height + 26;
  }
  return { parts, cx, cy, top, bottom: cy + h / 2, contentTop, depth: depth + 3 };
}

// Botón estándar de los modales: redondeado, borde acento y hover. Devuelve el contenedor.
export function menuButton(scene, x, y, w, h, text, onClick, { depth = 303 } = {}) {
  const c = scene.add.container(x, y).setDepth(depth);
  const g = scene.add.graphics();
  const paint = (fill) => drawRound(g, 0, 0, w, h, MODAL.radiusBtn, fill, 1, UI_ACCENT, 2, 0.55);
  paint(MODAL.btn);
  const label = mkText(scene, 0, 0, text, TEXT.button, {
    color: '#f4f2ff', fontStyle: 'bold', align: 'center', wordWrap: { width: w * 0.9 },
  }).setOrigin(0.5);
  c.add([g, label]);
  c.setSize(w, h).setInteractive({ useHandCursor: true });
  c.on('pointerover', () => paint(MODAL.btnHover));
  c.on('pointerout', () => paint(MODAL.btn));
  // pointerup: gesto completado, más fiable en táctil.
  c.on('pointerup', () => { playSfx(scene, 'ui'); onClick(); });
  return c;
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
  btn.on('pointerdown', () => { playSfx(scene, 'ui'); onClick(); });
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
