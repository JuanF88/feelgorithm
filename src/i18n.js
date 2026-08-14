// Sistema de idiomas ES/EN. Enfoque de diccionario: el código conserva sus textos
// en español y se envuelven con t(...). En inglés, t() busca la traducción; si no
// existe, devuelve el español (nunca rompe). El idioma se guarda en localStorage.
import { MATRIZ } from './data/matriz.js';
import { MATRIZ_EN } from './data/matriz.en.js';

const LANG_KEY = 'feelgorithm_lang';

let lang = readLang();
// Por defecto el juego arranca en INGLÉS; solo usa español si el usuario lo eligió
// explícitamente antes (queda guardado en localStorage).
function readLang() {
  try { return localStorage.getItem(LANG_KEY) === 'es' ? 'es' : 'en'; }
  catch { return 'en'; }
}

export function getLang() { return lang; }
export function setLang(l) {
  lang = l === 'en' ? 'en' : 'es';
  try { localStorage.setItem(LANG_KEY, lang); } catch { /* modo privado */ }
  return lang;
}
export function toggleLang() { return setLang(lang === 'en' ? 'es' : 'en'); }

// Traducción de una cadena. En español devuelve la misma; en inglés, la del mapa
// (o la española como respaldo si falta).
export function t(s) {
  if (lang !== 'en') return s;
  const v = EN[s];
  return v == null ? s : v;
}

// Emociones y contenido: helpers que eligen según idioma.
export function emoLabel(emo) { return t(emo.label); }
export function emoFeel(emo) { return t(emo.feel); }
export function contentKey(item) { return lang === 'en' && item.key_en ? item.key_en : item.key; }
export function contentFile(item) { return lang === 'en' && item.file_en ? item.file_en : item.file; }
export function contentTitle(item) { return t(item.titulo); }
export function getMatriz() { return lang === 'en' ? MATRIZ_EN : MATRIZ; }

// ── Diccionario ES → EN de todos los textos de interfaz ────────────────────────
const EN = {
  // Menú / género
  '¿Con qué género te identificas?': 'How do you identify?',
  'Solo lo preguntamos una vez, de forma anónima, para entender a quién llega el juego.':
    'We only ask once, anonymously, to understand who the game reaches.',
  'Masculino': 'Male',
  'Femenino': 'Female',
  'Otro': 'Other',
  'Prefiero no decir': 'Prefer not to say',
  'Para pantalla completa: Compartir  →  «Añadir a pantalla de inicio»':
    'For fullscreen: Share  →  «Add to Home Screen»',

  // Pantalla completa (iPhone)
  'Pantalla completa': 'Fullscreen',
  'Este navegador no la permite desde el juego.\nToca  Compartir  y elige «Añadir a pantalla de inicio»:\nasí se abre sin barras.':
    'This browser doesn\'t allow it from the game.\nTap  Share  and choose «Add to Home Screen»:\nit opens without bars.',
  'Toca para cerrar': 'Tap to close',

  // Configuración (pausa)
  'Configuración': 'Settings',
  'El juego está en pausa.': 'The game is paused.',
  'Continuar': 'Continue',
  'Volver al menú principal': 'Back to main menu',

  // Controles (ayuda)
  'Controles': 'Controls',
  'Palanca (izquierda)': 'Joystick (left)',
  'Moverse': 'Move',
  'Saltar': 'Jump',
  'Actuar': 'Act',
  'Actuar (palanca y emociones)': 'Act (lever & emotions)',
  'Botón  ▲': 'Button  ▲',
  'Botón  ●': 'Button  ●',
  '↑   /   W   /   Espacio': '↑   /   W   /   Space',
  'Toca para empezar': 'Tap to start',
  'Haz clic o pulsa una tecla para empezar': 'Click or press any key to start',

  // Sala (nivel 1)
  'Activa la palanca': 'Pull the lever',
  'Selecciona': 'Select',
  '¿Qué sentiste? Selecciona la emoción correspondiente': 'What did you feel? Select the matching emotion',

  // Pasillo (nivel 2)
  'Sigue el pasillo… pero algo te espera al fondo': 'Follow the hallway… but something waits at the end',
  '¡Esquiva las rocas! Aguanta hasta que el villano se vaya': 'Dodge the rocks! Hold on until the villain leaves',
  'Resiste hasta que el villano se vaya': 'Hold on until the villain leaves',
  'El villano se fue. ¡Corre a la puerta! →': 'The villain is gone. Run to the door! →',
  '¡Te alcanzó una roca!': 'A rock hit you!',
  'Reintentando…': 'Retrying…',

  // Manos (nivel 3) y tarjeta final
  '¿Qué haces con este contenido?': 'What do you do with this content?',
  'Consecuencia de tu decisión': 'Consequence of your decision',
  'Ejercicio de regulación': 'Regulation exercise',
  'Consejo de alfabetización mediática': 'Media literacy tip',
  'SENTISTE': 'YOU FELT',
  'HICISTE': 'YOU DID',
  'Terminar': 'Finish',
  'Siguiente': 'Next',
  'Fin — tus decisiones': 'The end — your decisions',
  'Así reaccionaste ante cada contenido:': 'This is how you reacted to each item:',
  'Sentiste:': 'You felt:',
  'Hiciste:': 'You did:',
  'Volver al menú': 'Back to menu',

  // Acciones (etiquetas visibles)
  'Me gusta': 'Like',
  'Comentar': 'Comment',
  'Compartir': 'Share',
  'Denunciar': 'Report',
  'Ignorar': 'Ignore',

  // Emociones (etiquetas)
  'Ira': 'Anger',
  'Miedo': 'Fear',
  'Alegría': 'Joy',
  'Tristeza': 'Sadness',
  'Sorpresa': 'Surprise',

  // Emociones (texto "feel")
  'La ira te moviliza, pero también te vuelve fácil de arrastrar: lo que te enfurece es lo que más se comparte sin verificar.':
    'Anger mobilizes you, but it also makes you easy to sway: what enrages you is what gets shared most without checking.',
  'El miedo te pone en alerta, pero exagerado te hace creer y difundir amenazas que no son reales.':
    'Fear puts you on alert, but overblown it makes you believe and spread threats that aren\'t real.',
  'Si un contenido de odio te dio risa, esa risa es su combustible: lo hace ligero, compartible y difícil de cuestionar.':
    'If hateful content made you laugh, that laughter is its fuel: it makes it light, shareable and hard to question.',
  'La tristeza te conecta con el otro. Bien dirigida ayuda; explotada, te vuelve blanco de manipulación emocional.':
    'Sadness connects you with others. Well directed it helps; exploited, it makes you a target for emotional manipulation.',
  'La sorpresa abre una ventana de segundos donde bajas la guardia: es cuando más fácil entra una mentira.':
    'Surprise opens a few-second window where you drop your guard: that\'s when a lie slips in most easily.',

  // Títulos de contenido
  'Contenido 1_Español_Cádena de WhatsAPP': 'Item 1 — WhatsApp chain (simulated)',
  'Contenido 2 — Reel de roles de género': 'Item 2 — Gender-roles reel',
  'Contenido 3 — Seguridad ciudadana (titular)': 'Item 3 — Public safety (headline)',
  'Contenido 4 — Salud y acceso a citas médicas (nota de voz)': 'Item 4 — Health & timely medical appointments (voice note)',

  // Botón de idioma
  'Idioma': 'Language',
};
