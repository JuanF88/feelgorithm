// Motor de audio del juego. Un único lugar para: cargar los sonidos, reproducir
// efectos, y llevar la música de fondo (que persiste entre escenas y recuerda si
// el jugador la dejó encendida o apagada).
//
// Qué suena y a qué volumen se define en src/config.js → AUDIO; aquí solo está la
// lógica. Para añadir un efecto nuevo: mételo en AUDIO.sfx y llámalo con
// playSfx(scene, 'clave'). No hace falta tocar este archivo.
import { AUDIO, UI } from './config.js';

const STORAGE_KEY = 'feelgorithm_musica';   // preferencia on/off del jugador

// La música admite varias PISTAS (la normal y la aterradora del pasillo). El gestor
// de sonido de Phaser es común a todas las escenas, así que cada pista se crea una
// vez y persiste. `currentKey` es la pista que debería sonar ahora; al cambiar de
// pista se hace un fundido cruzado. (Los módulos ES son singletons: estado global.)
const TRACKS = { main: AUDIO.music, scary: AUDIO.musicScary };
const sounds = {};             // nombre de pista → Phaser.Sound
let currentKey = 'main';
let musicOn = readPref();
const listeners = new Set();   // botones que reflejan el estado on/off

function readPref() {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === '0') return false;
    if (v === '1') return true;
  } catch (e) { /* sin localStorage: usamos el valor por defecto */ }
  return AUDIO.music.defaultOn;
}

function writePref() {
  try { localStorage.setItem(STORAGE_KEY, musicOn ? '1' : '0'); } catch (e) { /* da igual */ }
}

// ─────────────────────────────── carga ───────────────────────────────

// Se llama desde BootScene.preload(). Carga la música y todos los efectos.
export function preloadAudio(scene) {
  for (const t of Object.values(TRACKS)) {
    if (t && t.file) scene.load.audio(t.key, t.file);
  }
  for (const [key, def] of Object.entries(AUDIO.sfx)) {
    if (def.file) scene.load.audio(key, def.file);
  }
}

// ─────────────────────────────── efectos ───────────────────────────────

// Reproduce un efecto puntual por su clave (p.ej. 'jump', 'lever', 'select').
// Si el archivo no se cargó (falta o dio error), no hace nada: nunca rompe el juego.
export function playSfx(scene, key) {
  const def = AUDIO.sfx[key];
  if (!def) return;
  if (!scene.cache.audio.exists(key)) return;
  scene.sound.play(key, { volume: (def.volume ?? 1) * AUDIO.sfxVolume });
}

// ─────────────────────────────── música ───────────────────────────────

// Crea (una vez) el Phaser.Sound de una pista, en silencio. null si no cargó.
function getSound(scene, key) {
  const t = TRACKS[key];
  if (!t || !t.file || !scene.cache.audio.exists(t.key)) return null;
  if (!sounds[key]) sounds[key] = scene.sound.add(t.key, { loop: true, volume: 0 });
  return sounds[key];
}

// Selecciona la pista que debe sonar en esta escena (por defecto 'main'; el pasillo
// usa 'scary'). Hace fundido cruzado si cambia. Segura de llamar en cada escena
// (la invoca el botón de la barra), así la música persiste y se ajusta sola.
export function setMusic(scene, trackKey = 'main') {
  if (!TRACKS[trackKey]) trackKey = 'main';
  if (trackKey !== currentKey) {
    const prev = sounds[currentKey];
    if (prev) fadeSound(scene, prev, 0, () => { if (prev.isPlaying) prev.pause(); });
    currentKey = trackKey;
  }
  if (musicOn) startCurrent(scene);
  else getSound(scene, currentKey);   // crearla en silencio para poder encenderla
}

// Alias retrocompatible.
export const ensureMusic = setMusic;

// Arranca/reanuda la pista actual y sube el volumen con un fundido. Los navegadores
// bloquean el audio hasta el primer gesto; si está bloqueado, esperamos el desbloqueo.
function startCurrent(scene) {
  const snd = getSound(scene, currentKey);
  if (!snd) return;
  const vol = TRACKS[currentKey].volume ?? 0.5;
  const play = () => { if (snd.isPaused) snd.resume(); else if (!snd.isPlaying) snd.play(); };
  if (scene.sound.locked) {
    scene.sound.once(Phaser.Sound.Events.UNLOCKED, () => { play(); snd.setVolume(vol); });
  } else {
    play();
    fadeSound(scene, snd, vol);
  }
}

function fadeSound(scene, snd, vol, onDone) {
  if (!snd) return;
  if (scene && scene.tweens) {
    scene.tweens.killTweensOf(snd);
    scene.tweens.add({ targets: snd, volume: vol, duration: AUDIO.fadeMs, onComplete: () => onDone && onDone() });
  } else {
    snd.setVolume(vol);
    if (onDone) onDone();
  }
}

// Baja (on=true) o restaura (on=false) el volumen de la música actual. Se usa para
// que un video se oiga por encima de la música de fondo.
export function duckMusic(scene, on) {
  const snd = sounds[currentKey];
  if (!snd || !musicOn) return;
  const base = (TRACKS[currentKey] && TRACKS[currentKey].volume) || 0.5;
  fadeSound(scene, snd, on ? base * (AUDIO.duckFactor ?? 0.2) : base);
}

export function isMusicOn() { return musicOn; }

// Enciende/apaga la música (la pista actual) y recuerda la elección.
export function toggleMusic(scene) {
  musicOn = !musicOn;
  writePref();
  const snd = sounds[currentKey];
  if (musicOn) startCurrent(scene);
  else if (snd) fadeSound(scene, snd, 0, () => { if (!musicOn && snd.isPlaying) snd.pause(); });
  listeners.forEach((fn) => fn(musicOn));
  return musicOn;
}

// Permite que un botón se entere si la música cambia desde otro sitio.
export function onMusicChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// ─────────────────────────────── botón de música ───────────────────────────────

// Botón (arte soundButton) para encender/apagar la música. Aparece en la barra
// superior de todas las escenas (lo coloca ui/hud.js → buildTopBar) y de paso
// selecciona la pista de la escena. Apagado = atenuado y grisáceo.
export function buildMusicButton(scene, x, y, size = 96, trackKey = 'main') {
  setMusic(scene, trackKey);

  const btn = scene.add.image(x, y, UI.sound.key).setDepth(120);
  btn.setDisplaySize(size, size).setInteractive({ useHandCursor: true });

  const render = (on) => {
    btn.setAlpha(on ? 1 : 0.5);
    if (on) btn.clearTint(); else btn.setTint(0x8a84a8);
  };
  render(musicOn);

  btn.on('pointerover', () => btn.setDisplaySize(size * 1.08, size * 1.08));
  btn.on('pointerout', () => btn.setDisplaySize(size, size));
  // pointerup, no pointerdown: en móvil el primer toque además desbloquea el audio.
  btn.on('pointerup', () => {
    playSfx(scene, 'ui');
    render(toggleMusic(scene));
  });

  const off = onMusicChange(render);
  btn.once('destroy', off);
  return btn;
}

// ─────────────────────────────── pasos del personaje ───────────────────────────────

// Bucle de pasos que se enciende al caminar/correr y se apaga al parar. Se guarda
// por escena (this._footsteps) para que el sonido no se arrastre de una sala a otra.
export function footsteps(scene) {
  if (!scene._footsteps) {
    scene._footsteps = new Footsteps(scene);
    scene.events.once('shutdown', () => { scene._footsteps?.destroy(); scene._footsteps = null; });
  }
  return scene._footsteps;
}

class Footsteps {
  constructor(scene) {
    this.scene = scene;
    this.mode = null;   // null | 'walk' | 'run'
    this.sound = null;
    const def = AUDIO.sfx.footsteps;
    if (def && scene.cache.audio.exists('footsteps')) {
      this.sound = scene.sound.add('footsteps', {
        loop: true, volume: (def.volume ?? 1) * AUDIO.sfxVolume,
      });
    }
  }

  // mode: 'walk' | 'run' para sonar, o null para callar.
  set(mode) {
    if (mode === this.mode) return;
    this.mode = mode;
    if (!this.sound) return;
    if (!mode) {
      if (this.sound.isPlaying) this.sound.pause();
      return;
    }
    this.sound.setRate(mode === 'run' ? AUDIO.footstepsRunRate : 1);
    if (this.sound.isPaused) this.sound.resume();
    else if (!this.sound.isPlaying) this.sound.play();
  }

  destroy() {
    if (this.sound) { this.sound.stop(); this.sound.destroy(); this.sound = null; }
  }
}
