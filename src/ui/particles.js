// Capa de partículas de ambiente compartida por todas las escenas: motas azules
// "cibernéticas" que suben despacio detrás del juego. Da personalidad sin molestar.
// La textura se genera en runtime (no hay assets que cargar ni cachear).
import { GAME, AMBIENT } from '../config.js';

const DOT_KEY = '__ambient_dot';

// Mota con halo suave (blanca; se tiñe por partícula). Varios círculos concéntricos
// de alfa decreciente = brillo difuso que con blend ADD se lee como dato luminoso.
function ensureDotTexture(scene) {
  if (scene.textures.exists(DOT_KEY)) return;
  const s = 16, r = s / 2;
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  for (let i = 6; i >= 1; i--) {
    g.fillStyle(0xffffff, 0.16 * (i / 6));
    g.fillCircle(r, r, r * (i / 6));
  }
  g.fillStyle(0xffffff, 1);
  g.fillCircle(r, r, 1.6); // núcleo nítido
  g.generateTexture(DOT_KEY, s, s);
  g.destroy();
}

// Añade el emisor de ambiente a la escena. Devuelve el emisor (o null si está
// desactivado). Se destruye solo con la escena.
export function addAmbientParticles(scene, opts = {}) {
  if (!AMBIENT.enabled) return null;
  ensureDotTexture(scene);

  const peak = opts.alpha ?? AMBIENT.alpha;
  const emitter = scene.add.particles(0, 0, DOT_KEY, {
    x: { min: 0, max: GAME.width },
    y: { min: 0, max: GAME.height },
    lifespan: AMBIENT.lifespan,
    frequency: AMBIENT.frequency,
    quantity: 1,
    speedX: { min: -AMBIENT.driftX, max: AMBIENT.driftX },
    speedY: { min: -AMBIENT.riseMax, max: -AMBIENT.riseMin }, // ascenso lento
    scale: { min: AMBIENT.scaleMin, max: AMBIENT.scaleMax },
    tint: AMBIENT.tints,           // array = color al azar por partícula
    blendMode: 'ADD',
    // Alfa en triángulo (0 → pico → 0) a lo largo de su vida: entra y sale suave,
    // sin "popping". onUpdate es estable en todas las versiones de Phaser 3.
    alpha: {
      onEmit: () => 0,
      onUpdate: (p, key, t) => Math.sin(t * Math.PI) * peak,
    },
  });
  emitter.setDepth(opts.depth ?? AMBIENT.depth);
  emitter.setScrollFactor(0);
  // Pre-carga la pantalla para que no arranque vacía (si la versión lo soporta).
  if (typeof emitter.fastForward === 'function') emitter.fastForward(AMBIENT.lifespan, 16);
  return emitter;
}
