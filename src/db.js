// Persistencia de datos del jugador.
//
// localStorage es la FUENTE DE VERDAD: funciona offline, sin cuentas ni permisos,
// y guarda el género (para no volver a preguntarlo) y el historial de elecciones
// de por vida. Firestore es solo un ESPEJO opcional para poder analizar los datos
// después; si la nube falla (sin internet, bloqueada, sin configurar), el juego
// sigue exactamente igual.
//
// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURACIÓN DE FIRESTORE (una sola vez):
//   1. Crea un proyecto en https://console.firebase.google.com
//   2. Menú Build → Firestore Database → «Crear base de datos» (modo producción).
//   3. Configuración del proyecto (rueda) → «Tus apps» → registra una app Web y
//      copia `projectId` y `apiKey` a FIRE de abajo. El apiKey es PÚBLICO por
//      diseño: no es un secreto, lo que protege la BD son las reglas de seguridad.
//   4. Firestore → pestaña «Reglas» → pega las reglas del final de este archivo.
//   Mientras `projectId`/`apiKey` sigan en su valor de ejemplo, la nube queda
//   desactivada sola y solo se usa localStorage (útil en desarrollo).
// ─────────────────────────────────────────────────────────────────────────────

const FIRE = {
  projectId: 'feelgorithm-48db6',
  apiKey: 'AIzaSyA5btl03yNyuSLkcXkr1B-rW1Ee-_y2fTM',
  collection: 'jugadores',
};
const ENABLED = FIRE.projectId !== 'TU_PROJECT_ID' && FIRE.apiKey !== 'TU_WEB_API_KEY';

const LS = {
  playerId: 'feelgorithm_player_id',
  gender: 'feelgorithm_genero',
  choices: 'feelgorithm_sesiones',   // historial de por vida (ya existía)
  createdAt: 'feelgorithm_created_at',
  country: 'feelgorithm_pais',        // nombre legible, ej. "Colombia"
  countryCode: 'feelgorithm_pais_code', // ISO-2, ej. "CO"
};

// localStorage puede fallar (modo incógnito, cuota llena): nunca debe tumbar el juego.
function lsGet(key, fallback = null) {
  try { const v = localStorage.getItem(key); return v == null ? fallback : v; }
  catch { return fallback; }
}
function lsSet(key, val) {
  try { localStorage.setItem(key, val); } catch { /* seguimos sin persistir */ }
}

// Identificador anónimo y estable del jugador. No es una cuenta: solo distingue
// una instalación de otra para agrupar sus elecciones. uuid v4 = imposible de adivinar.
export function getPlayerId() {
  let id = lsGet(LS.playerId);
  if (!id) {
    id = (globalThis.crypto?.randomUUID?.())
      || ('p_' + Date.now().toString(36) + Math.random().toString(36).slice(2));
    lsSet(LS.playerId, id);
    lsSet(LS.createdAt, String(Date.now()));
  }
  return id;
}

export function getGender() { return lsGet(LS.gender); }
export function hasGender() { return !!lsGet(LS.gender); }

export function setGender(g) {
  lsSet(LS.gender, g);
  getPlayerId();                 // asegura id + createdAt
  syncPlayer();
}

export function getCountry() { return lsGet(LS.country); }
export function getCountryCode() { return lsGet(LS.countryCode); }

// Resuelve el país por geolocalización de IP (sin pedir permisos). Se hace UNA vez
// y se cachea; al lograrlo, vuelve a sincronizar para subirlo. Dos proveedores
// gratuitos sin API key: si el primero falla, prueba el segundo.
let countryTried = false;
async function ensureCountry() {
  if (getCountryCode() || countryTried) return;
  countryTried = true;
  const providers = [
    async () => { const j = await (await fetch('https://ipwho.is/')).json();
      return (j && j.success !== false && j.country_code) ? { name: j.country, code: j.country_code } : null; },
    async () => { const j = await (await fetch('https://api.country.is/')).json();
      return (j && j.country) ? { name: j.country, code: j.country } : null; },
  ];
  for (const p of providers) {
    try {
      const res = await p();
      if (res && res.code) {
        lsSet(LS.countryCode, res.code);
        if (res.name) lsSet(LS.country, res.name);
        syncPlayer();
        return;
      }
    } catch { /* siguiente proveedor */ }
  }
}

export function loadChoices() {
  try { return JSON.parse(lsGet(LS.choices, '[]')); } catch { return []; }
}
function saveChoices(arr) { lsSet(LS.choices, JSON.stringify(arr)); }

// Registra la EMOCIÓN elegida para un contenido. La acción (decision) se completa
// después, cuando el jugador la escoge en la escena de las manos.
export function recordEmotion(entry) {
  const all = loadChoices();
  all.push(entry);
  saveChoices(all);
  syncPlayer();
}

// Completa la ACCIÓN (Like/Comentar/Compartir/Denunciar/Ignorar) sobre la última
// elección de ese contenido que aún no la tenga. Sin esto, el historial de por
// vida se quedaba con decision: null (lo llenaba solo en memoria).
export function recordDecision(contentId, decisionLabel) {
  const all = loadChoices();
  for (let i = all.length - 1; i >= 0; i--) {
    if (all[i].contentId === contentId && !all[i].decision) {
      all[i].decision = decisionLabel;
      break;
    }
  }
  saveChoices(all);
  syncPlayer();
}

// ── Sincronización con Firestore (REST puro, sin SDK ni CDN) ──────────────────
// PATCH sobre un documento con id = playerId → crea o actualiza (upsert). Se envía
// el snapshot COMPLETO cada vez: localStorage ya tiene todo, así que reemplazar el
// documento entero es seguro y evita perder datos por sincronizaciones a medias.
let syncing = false;
let pending = false;

export function syncPlayer() {
  if (!ENABLED) return;
  ensureCountry();                            // resuelve el país 1 vez y re-sincroniza
  if (syncing) { pending = true; return; }    // colapsa ráfagas de escrituras seguidas
  syncing = true;

  const id = getPlayerId();
  const snapshot = {
    playerId: id,
    gender: getGender() || '',
    country: getCountry() || '',
    countryCode: getCountryCode() || '',
    createdAt: Number(lsGet(LS.createdAt, String(Date.now()))),
    updatedAt: Date.now(),
    choices: loadChoices(),
  };
  const url = `https://firestore.googleapis.com/v1/projects/${FIRE.projectId}`
    + `/databases/(default)/documents/${FIRE.collection}/${id}?key=${FIRE.apiKey}`;

  fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: toFields(snapshot) }),
  })
    .catch(() => { /* offline o bloqueado: localStorage sigue siendo la verdad */ })
    .finally(() => {
      syncing = false;
      if (pending) { pending = false; syncPlayer(); }   // manda el último estado pendiente
    });
}

// JS → formato tipado que exige la API REST de Firestore.
function toValue(v) {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === 'boolean') return { booleanValue: v };
  if (typeof v === 'number') {
    return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  }
  if (typeof v === 'string') return { stringValue: v };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(toValue) } };
  if (typeof v === 'object') return { mapValue: { fields: toFields(v) } };
  return { stringValue: String(v) };
}
function toFields(obj) {
  const out = {};
  for (const k of Object.keys(obj)) out[k] = toValue(obj[k]);
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// REGLAS DE SEGURIDAD para pegar en Firestore → pestaña «Reglas». Permiten escribir
// telemetría anónima pero con forma controlada, y NO dejan leer datos de otros
// jugadores desde el cliente (los lees tú desde la consola de Firebase).
//
//   rules_version = '2';
//   service cloud.firestore {
//     match /databases/{database}/documents {
//       match /jugadores/{playerId} {
//         allow read, delete: if false;
//         allow create, update: if
//           request.resource.data.playerId is string
//           && request.resource.data.keys().hasOnly(
//                ['playerId','gender','country','countryCode','createdAt','updatedAt','choices']);
//       }
//     }
//   }
// ─────────────────────────────────────────────────────────────────────────────
