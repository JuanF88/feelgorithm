// Service worker básico: cachea el shell para que el juego funcione offline.
// Sube el número de versión cuando cambies archivos para forzar la actualización.
const CACHE = "feelgorithm-v56";
const ASSETS = [
  ".",
  "index.html",
  "manifest.webmanifest",
  "vendor/phaser.min.js",
  "src/main.js",
  "src/config.js",
  "src/db.js",
  "src/scenes/BootScene.js",
  "src/scenes/MenuScene.js",
  "src/scenes/RoomScene.js",
  "src/scenes/CorridorScene.js",
  "src/scenes/HandsScene.js",
  "src/scenes/PauseScene.js",
  "src/ui/hud.js",
  "src/ui/touch.js",
  "src/ui/eyes.js",
  "src/audio.js",
  "src/voice.js",
  "src/data/matriz.js",
  "assets/icons/icon.svg",
  "assets/characters/character2Sheet.png",
  "assets/characters/villainSheet.png",
  "assets/characters/handLeft.png",
  "assets/characters/handRight.png",
  "assets/bg/gameBackground.png",
  "assets/bg/gameBackground2.png",
  "assets/bg/gameBackground3.png",
  "assets/bg/eyesSheet.png",
  "assets/props/screenGame.png",
  "assets/props/screenGameHorizontal.png",
  "assets/props/soundButtonTrim.png",
  "assets/props/palancaAnim.png",
  "assets/props/title.png",
  "assets/props/bannerTrim.png",
  "assets/props/playButtonTrim.png",
  "assets/props/settingsButtonTrim.png",
  "assets/props/completeScreenButtonTrim.png",
  "assets/props/cupula.png",
  "assets/props/tarjeta.png",
  "assets/props/tarjetaFinal.png",
  "assets/props/portada.png",
  "assets/props/resteButtonTrim.png",
  "assets/actions/like.png",
  "assets/actions/comentar.png",
  "assets/actions/compartir.png",
  "assets/actions/denunciar.png",
  "assets/actions/ignorar.png",
  "assets/emotions/angerSheet.png",
  "assets/emotions/fearSheet.png",
  "assets/emotions/happinessSheet.png",
  "assets/emotions/sadSheet.png",
  "assets/emotions/surpriseSheet.png",
  "assets/contenido/Contenido 1_Español_Cádena de WhatsAPP.png",
  "assets/contenido/Contenido 2_Español_Vídeo.mp4",
  "assets/contenido/Contenido 3_Español_Titular.png",
  "assets/audio/music.wav",
  "assets/audio/music_scary.wav",
  "assets/audio/footsteps.wav",
  "assets/audio/jump.wav",
  "assets/audio/land.wav",
  "assets/audio/lever.wav",
  "assets/audio/screen.wav",
  "assets/audio/emerge.wav",
  "assets/audio/select.wav",
  "assets/audio/ui.wav",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll(ASSETS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// Network-first: en desarrollo siempre trae lo más reciente estando en línea;
// offline cae al caché. Para el deploy final se puede invertir a cache-first.
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
        return res;
      })
      .catch(() =>
        caches
          .match(e.request)
          .then((hit) => hit || caches.match("index.html")),
      ),
  );
});
