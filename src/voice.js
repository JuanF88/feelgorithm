// Voz para los pensamientos (distorsiones) del pasillo. Usa la Web Speech API
// nativa del navegador (speechSynthesis): gratis, sin dependencias y con
// entonación ajustable (rate/pitch/volume/voz) desde src/config.js → VOICE.
import { VOICE } from './config.js';
import { getLang } from './i18n.js';

// La voz sigue el idioma de la interfaz: inglés (en-US) si el juego está en inglés,
// si no el idioma configurado en VOICE.lang (por defecto es-ES).
const voiceLang = () => (getLang() === 'en' ? 'en-US' : (VOICE.lang || 'es-ES'));

const synth = (typeof window !== 'undefined' && window.speechSynthesis) || null;
let voices = [];

function loadVoices() {
  if (synth) voices = synth.getVoices() || [];
}
if (synth) {
  loadVoices();
  // Las voces cargan de forma asíncrona; nos avisan cuando están listas.
  synth.addEventListener('voiceschanged', loadVoices);
}

// Elige la voz MÁS NATURAL disponible en español. Las voces "Google"/online/neural
// suenan mucho mejor que la local por defecto (robótica). Se puede forzar una
// concreta con VOICE.voiceName.
function pickVoice() {
  if (!voices.length) loadVoices();
  if (VOICE.voiceName) {
    const named = voices.find((v) => v.name === VOICE.voiceName);
    if (named) return named;
  }
  const pref = voiceLang().slice(0, 2).toLowerCase();
  const es = voices.filter((v) => v.lang && v.lang.toLowerCase().startsWith(pref));
  if (!es.length) return null;
  const score = (v) => {
    const n = (v.name || '').toLowerCase();
    let s = 0;
    if (n.includes('google')) s += 6;               // Chrome: voces online muy naturales
    if (n.includes('natural') || n.includes('neural')) s += 6; // Edge/Windows neurales
    if (n.includes('microsoft')) s += 3;
    if (v.localService === false) s += 2;            // online > local (más natural)
    if ((v.lang || '').toLowerCase() === voiceLang().toLowerCase()) s += 1;
    return s;
  };
  return es.slice().sort((a, b) => score(b) - score(a))[0];
}

// Dice una frase (cancela la anterior). No hace nada si está desactivado o no hay soporte.
export function speak(text) {
  if (!VOICE.enabled || !synth || !text) return;
  try {
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = voiceLang();
    u.rate = VOICE.rate;
    u.pitch = VOICE.pitch;
    u.volume = VOICE.volume;
    const v = pickVoice();
    if (v) u.voice = v;
    synth.speak(u);
  } catch (e) { /* si algo falla, seguimos sin voz */ }
}

export function stopSpeak() {
  if (synth) { try { synth.cancel(); } catch (e) { /* da igual */ } }
}
