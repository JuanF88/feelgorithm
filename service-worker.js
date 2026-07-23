// Service worker básico: cachea el shell para que el juego funcione offline.
// Sube el número de versión cuando cambies archivos para forzar la actualización.
const CACHE = 'feelgorithm-v37';
const ASSETS = [
  '.',
  'index.html',
  'manifest.webmanifest',
  'vendor/phaser.min.js',
  'src/main.js',
  'src/config.js',
  'src/scenes/BootScene.js',
  'src/scenes/MenuScene.js',
  'src/scenes/RoomScene.js',
  'src/scenes/CorridorScene.js',
  'src/scenes/HandsScene.js',
  'src/ui/hud.js',
  'src/ui/touch.js',
  'src/ui/eyes.js',
  'assets/icons/icon.svg',
  'assets/characters/character2Sheet.png',
  'assets/characters/handLeft.png',
  'assets/characters/handRight.png',
  'assets/bg/gameBackground.png',
  'assets/bg/gameBackground2.png',
  'assets/bg/gameBackground3.png',
  'assets/bg/eyesSheet.png',
  'assets/props/screenGame.png',
  'assets/props/palancaAnim.png',
  'assets/props/title.png',
  'assets/props/bannerTrim.png',
  'assets/props/playButtonTrim.png',
  'assets/props/settingsButtonTrim.png',
  'assets/props/completeScreenButtonTrim.png',
  'assets/props/cupula.png',
  'assets/props/tarjeta.png',
  'assets/emotions/angerSheet.png',
  'assets/emotions/fearSheet.png',
  'assets/emotions/happinessSheet.png',
  'assets/emotions/sadSheet.png',
  'assets/emotions/surpriseSheet.png',
  'assets/contenido/c1.svg',
  'assets/contenido/c2.svg',
  'assets/contenido/c3.svg',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Network-first: en desarrollo siempre trae lo más reciente estando en línea;
// offline cae al caché. Para el deploy final se puede invertir a cache-first.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(e.request, copy));
      return res;
    }).catch(() => caches.match(e.request).then((hit) => hit || caches.match('index.html')))
  );
});
