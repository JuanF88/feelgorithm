// Constantes del juego. Un solo lugar para tocar colores, emociones y contenido.

export const GAME = {
  width: 1920,   // resolución interna alta = texto y sprites nítidos (se escala a la pantalla)
  height: 1080,
  bg: '#0e0b16',
};

// Tamaños de texto pensados para el canvas de 1920x1080.
export const TEXT = { prompt: 42, label: 28, button: 32, screen: 34, hint: 24 };

// Línea de piso como fracción de la altura (dónde se paran los pies en el fondo).
export const FLOOR_F = 0.90;

// Distancia a la que el personaje "se acerca" a una emoción para poder seleccionarla.
export const EMO_NEAR = 150;

export const COLORS = {
  wall: 0x12101a,
  floor: 0x1c1830,
  floorLine: 0x2b2740,
  screenFrame: 0x2b2740,
  screenOff: 0x0a0910,
  lever: 0x8d99ae,
  leverHandle: 0xe63946,
  avatar: 0xe9edf5,
  accent: 0xf4d35e,
};

export const FONT = 'system-ui, "Segoe UI", sans-serif';

// Personaje principal.
// Hoja recompuesta a partir de character2.png: 18 frames en grilla 6x3
// (fila 0 = quieto, fila 1 = caminar, fila 2 = correr). Cada frame quedó alineado
// por el centro del cuerpo y con los pies sobre una misma línea base.
// `anims.frames` lista los índices EXACTOS que se usan: los frames descartados
// (3 y 4 de quieto, 10 de caminar, 14 y 16 de correr) rompían el ciclo porque el
// personaje cambiaba de tamaño o de pose. Para probar otros, edita estas listas.
export const CHAR = {
  key: 'char',
  sheet: 'assets/characters/character2Sheet.png',
  frameWidth: 208,
  frameHeight: 200,
  originX: 0.5,         // la hoja ya viene centrada: voltear izq/der no da "salto"
  displayScale: 1.25,   // ~250 px de alto en pantalla
  spawnXf: 0.22,        // dónde aparece (fracción del ancho) — a la izquierda de la palanca
  floorOffset: -20,      // px que baja el avatar respecto a FLOOR_F, para acercarlo a cámara.
                        // Solo mueve al personaje: la palanca sigue anclada a FLOOR_F.
  speedWalk: 170,
  speedRun: 300,
  jump: -620,
  anims: {
    idle: { frames: [0, 1, 2, 5],      rate: 6,  yoyo: true },
    walk: { frames: [6, 7, 8, 9, 11],  rate: 10 },
    run:  { frames: [12, 13, 15, 17],  rate: 12 },
    jump: { frames: [12, 15],          rate: 6 },   // no hay fila de salto: se reusa correr
  },
};

// Las 6 emociones básicas de Ekman. `feel` = texto placeholder de la tarjeta de
// retroalimentación (la comunicadora lo refina; ver la matriz en PLAN.md).
// `sheet` = criatura animada que flota dentro de la cápsula (12 frames, grilla 6x2).
// Si una emoción no tiene `sheet`, se dibuja el orbe de color como respaldo.
// Nota: el set de la propuesta (ver DECISION_EMOCIONES.md) es Indignación, Asco,
// Miedo, Desprecio, Burla y Tristeza — todavía falta arte para asco, desprecio y burla.
export const EMO_SPRITE = { frameWidth: 208, frameHeight: 208, frames: 12, rate: 8 };

export const EMOTIONS = [
  { id: 'ira',      label: 'Ira',      color: 0xe63946, sheet: 'assets/emotions/angerSheet.png',     feel: 'La ira te moviliza, pero también te vuelve fácil de arrastrar: lo que te enfurece es lo que más se comparte sin verificar.' },
  { id: 'miedo',    label: 'Miedo',    color: 0x7209b7, sheet: 'assets/emotions/fearSheet.png',      feel: 'El miedo te pone en alerta, pero exagerado te hace creer y difundir amenazas que no son reales.' },
  { id: 'alegria',  label: 'Alegría',  color: 0xffd166, sheet: 'assets/emotions/happinessSheet.png', feel: 'Si un contenido de odio te dio risa, esa risa es su combustible: lo hace ligero, compartible y difícil de cuestionar.' },
  { id: 'tristeza', label: 'Tristeza', color: 0x457b9d, sheet: 'assets/emotions/sadSheet.png',       feel: 'La tristeza te conecta con el otro. Bien dirigida ayuda; explotada, te vuelve blanco de manipulación emocional.' },
  { id: 'sorpresa', label: 'Sorpresa', color: 0xf77f00, sheet: 'assets/emotions/surpriseSheet.png',  feel: 'La sorpresa abre una ventana de segundos donde bajas la guardia: es cuando más fácil entra una mentira.' },
];

// Corpus de contenido. `file` es la pieza que se muestra en la pantalla.
// Los SVG de assets/contenido/ son PLACEHOLDERS SEGUROS (simulados, sin odio real):
// el equipo los reemplaza por sus piezas sintéticas propias (imagen .png/.jpg o video .mp4).
export const CONTENT = [
  { id: 'c1', key: 'cont_c1', file: 'assets/contenido/c1.svg', titulo: 'Clip de miedo (simulado)' },
  { id: 'c2', key: 'cont_c2', file: 'assets/contenido/c2.svg', titulo: 'Meme de burla (simulado)' },
  { id: 'c3', key: 'cont_c3', file: 'assets/contenido/c3.svg', titulo: 'Rage-bait de IA (simulado)' },
];

// Fondo de la sala-laboratorio (se escala para cubrir el canvas).
export const BG = { key: 'bg', file: 'assets/bg/gameBackground.png' };

// Ojos del algoritmo: presencia de fondo en el centro de la pantalla.
// Hoja de 3 frames generada desde assets/bg/eyes/ (abiertos, entrecerrados,
// cerrados), normalizados al mismo ancho —si no, "respiran" al parpadear— y con
// el desenfoque ya aplicado en la imagen, para que funcione aunque el navegador
// caiga al renderizador Canvas (donde los filtros de Phaser no existen).
// El parpadeo recorre 0-1-2-1-0 y se repite a intervalos irregulares.
export const EYES = {
  key: 'eyes',
  file: 'assets/bg/eyesSheet.png',
  frameWidth: 900,
  frameHeight: 340,
  xf: 0.5,
  yf: 0.40,            // más chico = más arriba
  width: 700,          // ancho en pantalla
  alpha: 0.60,         // discretos: son ambiente, no un elemento de juego
  depth: -95,          // justo delante del fondo (-100)
  blink: { rate: 14, minMs: 1100, maxMs: 3400 },
};

// ── Escena 2: el pasillo que une los dos túneles ──
// El personaje sale por el túnel izquierdo, recorre el pasillo y desaparece por
// el derecho; ahí termina el ciclo y salen las tarjetas.
// Las fracciones salen de medir el arte (2752x1536) y convertirlo al canvas:
// el fondo se escala x0.7031 para cubrir 1920x1080.
//   túnel izq: centro en x≈380 px del arte  → 0.135
//   túnel der: centro en x≈2350 px del arte → 0.856
//   piso del pasillo: y≈1210 px del arte    → 0.788
export const BG2 = { key: 'bg2', file: 'assets/bg/gameBackground2.png' };

export const CORRIDOR = {
  floorYf: 0.788,     // línea de piso: el pasillo al fondo que une las dos bocas
  charScale: 1.0,     // el personaje va más lejos que en la sala → se ve más chico
  entryXf: 0.135,     // boca del túnel izquierdo: de ahí sale
  exitXf: 0.856,      // boca del túnel derecho: por ahí se va
  emergeXf: 0.21,     // hasta dónde camina solo antes de darle el control al jugador
};

// Escena que arranca el juego. 'Menu' es lo normal; ponerla en 'Hands' o 'Corridor'
// sirve para probar un nivel suelto sin recorrer todo el ciclo.
export const START_SCENE = 'Menu';

// ── Escena 3: las manos del algoritmo ──
// Los brazos salen del borde inferior y se orientan hacia el cursor. `originX` es
// el punto por donde el brazo sale de cuadro (medido sobre el arte): es el pivote
// del giro, así el brazo rota desde el hombro y no desde su centro.
// `restDeg` es la dirección a la que apunta el brazo tal como está dibujado; sin
// ese dato el brazo apuntaría 90 grados desviado del cursor.
export const BG3 = { key: 'bg3', file: 'assets/bg/gameBackground3.png' };

export const HANDS = {
  left:  { key: 'handLeft',  file: 'assets/characters/handLeft.png',  originX: 0.2285, xf: 0.26, restDeg: -54.2 },
  right: { key: 'handRight', file: 'assets/characters/handRight.png', originX: 0.7676, xf: 0.74, restDeg: -126.0 },
  height: 560,          // alto del brazo en pantalla
  alpha: 0.78,          // algo translúcidos: son la interfaz del algoritmo, no carne
  baseYf: 1.04,         // la base del brazo queda un poco fuera de cuadro
  maxTurnDeg: 30,       // cuánto puede girar hacia el cursor
  reach: 54,            // px que se estira la mano activa
  lerp: 0.09,           // suavidad del seguimiento (0-1); más chico = más suave
  idleAmp: 7,           // balanceo cuando está en reposo (px)
  idleSpeed: 0.0015,
};

// Los 6 elementos que giran en círculo. `items` es placeholder: el equipo los
// reemplaza por los elementos reales (basta con cambiar label/color, o añadir
// `key` si llegan con arte propio).
// El fondo es un panel con marco: la órbita va centrada en su hueco interior
// (medido sobre el arte: x 150..1230, y 60..690 de 1376x768).
export const ORBIT = {
  centerYf: 0.49,
  rx: 560,              // radio horizontal
  ry: 215,              // radio vertical (elipse = sensación de profundidad)
  speed: 0.00020,       // radianes por milisegundo
  itemR: 64,
  minScale: 0.72,       // los de atrás se ven más pequeños y apagados
  items: [
    { id: 'e1', label: '1', color: 0xe63946 },
    { id: 'e2', label: '2', color: 0xf77f00 },
    { id: 'e3', label: '3', color: 0xffd166 },
    { id: 'e4', label: '4', color: 0x6a994e },
    { id: 'e5', label: '5', color: 0x457b9d },
    { id: 'e6', label: '6', color: 0x7209b7 },
  ],
};

// Pantalla que desciende. La imagen es un marco con la ventana central TRANSPARENTE:
// el contenido va detrás y se ve por el hueco (medido sobre el PNG de 1536x1024).
export const SCREEN = {
  key: 'screen',
  file: 'assets/props/screenGame.png',
  imgW: 1854,
  imgH: 1135,
  scale: 0.44,                // tamaño en pantalla (se retrae tras el contenido)
  // Posición de reposo medida desde el BORDE SUPERIOR de la imagen (fracción de la
  // altura del canvas). 0 = pegada al tope. Ojo: el arte trae ~95 px de cables
  // dibujados encima del marco, así que con 0 el marco metálico arranca ~42 px
  // más abajo. Para pegar el MARCO al tope, usa un valor negativo (≈ -0.04):
  // los cables se recortan, que es justo lo que se quiere si cuelga del techo.
  topYf: -0.04,
  hole: { x0: 0.0604, x1: 0.9402, y0: 0.2018, y1: 0.8978 },
};

// Palanca (joystick): objeto en el piso al que el personaje se acerca para activar.
// Spritesheet de 4 frames: 0 = en reposo (arriba) … 3 = accionada (abajo, LED encendido).
// Los frames están alineados por la base, así que la cúpula no se mueve al animar.
export const LEVER = {
  key: 'palanca',
  file: 'assets/props/palancaAnim.png',
  frameWidth: 264,
  frameHeight: 288,
  xf: 0.50,            // posición horizontal (fracción del ancho)
  yOffset: -10,        // px respecto a FLOOR_F: NEGATIVO sube, positivo baja.
                       // Independiente de CHAR.floorOffset: mover uno no mueve al otro.
  height: 180,
  nearDist: 160,
  pull: { start: 0, end: 3, rate: 10 },  // animación al tirar (no se repite)
};

// Texto de instrucción con su placa de fondo. Placa y texto SOLO se muestran cuando
// hay algo que decir; mientras corre el contenido el texto va vacío y la placa se
// oculta, así no compite con la pantalla. Por eso puede ocupar la franja media:
// cuando aparece ("¿Qué sentiste?"), la pantalla ya se retrajo.
export const PROMPT = {
  yf: 0.20,            // posición vertical del centro: ocupa el hueco que deja la pantalla
  color: '#10131c',    // oscuro: va encima de la placa clara
  banner: {
    key: 'banner',
    // Versión recortada: el PNG original trae ~45% de margen transparente, que hacía
    // imposible centrar el texto. `panel` = el rectángulo blanco interior, medido
    // sobre la imagen recortada. El texto se centra y se ajusta SOLO a esa caja.
    file: 'assets/props/bannerTrim.png',
    displayWidth: 820,
    panel: { x0: 0.0786, x1: 0.9223, y0: 0.1809, y1: 0.8294 },
    padding: 0.90,     // fracción del panel que puede ocupar el texto
  },
};

// Botones de interfaz. Los PNG originales venían con mucho margen transparente:
// se usan las versiones recortadas para que el tamaño en pantalla sea el real.
export const UI = {
  play:     { key: 'btnPlay',     file: 'assets/props/playButtonTrim.png',     width: 360 },
  settings:   { key: 'btnSettings',   file: 'assets/props/settingsButtonTrim.png',       size: 96 },
  fullscreen: { key: 'btnFullscreen', file: 'assets/props/completeScreenButtonTrim.png' },
  topRight: { margin: 70, gap: 18 },   // esquina superior derecha: ajustes + pantalla completa
};

// Controles táctiles: solo aparecen en dispositivos con pantalla táctil.
// Una palanca para moverse y UN botón de acción, como pidió el diseño.
export const TOUCH = {
  stick:  { xf: 0.13, yf: 0.76, radius: 120, thumb: 52, deadZone: 0.18, runAt: 0.75 },
  action: { xf: 0.87, yf: 0.78, radius: 92 },
  alpha: 0.55,          // discretos para no tapar la escena
  alphaActive: 0.9,
};

// Cápsula que contiene cada emoción flotante. orbYf = altura del orbe dentro del domo
// (fracción desde arriba). El cristal ya viene translúcido (ver assets/README).
// `rowYf` = dónde se apoya la BASE de la cápsula (fracción de la altura). Está
// alineada con los pies del personaje, para que se lean sobre el mismo suelo.
// `creatureF` = alto de la criatura como fracción del alto de la cápsula: así, al
// cambiar `height`, la criatura escala con el domo en vez de quedarse descolgada.
export const CUPULA = {
  key: 'cupula',
  file: 'assets/props/cupula.png',
  height: 190,        // alto de la cápsula en pantalla
  rowYf: 0.88,        // base de la cápsula (fracción de la altura); más grande = más abajo
  orbYf: 0.42,        // altura de la criatura DENTRO del domo (0 = arriba, 1 = base):
                      // bajarlo la sube, y evita que la base opaca del cristal la tape
  creatureF: 0.38,    // tamaño de la criatura respecto al alto de la cápsula
  orbR: 34,           // radio del orbe de respaldo (emociones sin arte)
};

// Marco de las tarjetas de recomendación (pantalla final). blue = área azul útil para el texto.
export const TARJETA = {
  key: 'tarjeta',
  file: 'assets/props/tarjeta.png',
  blue: { x0: 0.11, x1: 0.89, y0: 0.13, y1: 0.87 },
};
