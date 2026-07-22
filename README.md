# Feelgorithm — prototipo (Phaser 3 + PWA)

Juego web para el UNESCO Youth Hackathon 2026: enseña a reconocer la manipulación
mediática usando tu propia emoción como detector.

> Los documentos de diseño e investigación (plan, estado del arte, decisiones)
> se mantienen fuera de este repositorio, en la carpeta del proyecto.

**Todo el contenido que muestra el juego es sintético**, fabricado por el equipo:
verosímil pero no real, sin personas ni nacionalidades identificables. Nunca se usa
odio real descargado de internet — mostrarlo enseñaría aquello que el juego combate.

## Cómo correrlo

Necesita un servidor estático (los módulos ES no cargan desde `file://`). Desde la carpeta `game/`:

```bash
npm start
```

Eso levanta `http://localhost:4321`. Si ese puerto está ocupado, `serve` elige otro y lo
imprime en consola (`Accepting connections at http://localhost:XXXX`) — usa esa URL.
Alternativas: extensión **Live Server** de VS Code, o `npx serve`.

## Qué hace hoy (movimiento 1 completo)

Entrar → tirar de la palanca → baja la pantalla → "reproduce" contenido (placeholder con barra
de progreso) → suben las 6 emociones de Ekman desde el piso → eliges una → el avatar se transforma
en ella. Cada elección se registra en consola y en `localStorage` (clave `feelgorithm_sesiones`).
Corre 3 contenidos y termina en un stub de "reveal".

## Qué falta (marcado en el código)

- **Movimiento 4 (Ver):** tocar los elementos manipuladores del contenido congelado → `onPick()` en `RoomScene.js`.
- **Movimiento 5 (Decidir):** compartir / pausar / reportar / desmentir.
- **Movimiento 6 (Retroalimentación):** las dos tarjetas (emoción + contenido).
- **Video real:** ver el bloque comentado en `playContent()`.
- **Arte y sonido:** ver `assets/README.md`.

## Estructura

```
game/
  index.html              shell + registro del service worker
  manifest.webmanifest     PWA (instalable)
  service-worker.js        cache offline del shell
  vendor/phaser.min.js     Phaser 3.88.2 (local, offline)
  src/
    main.js                config de Phaser + escenas
    config.js              colores, emociones, corpus (toca esto primero)
    scenes/
      BootScene.js         precarga de assets (vacío por ahora)
      RoomScene.js         el loop completo
  assets/                  arte, sonido, video, iconos
```

## Recuperar datos del piloto

En la consola del navegador:

```js
JSON.parse(localStorage.getItem('feelgorithm_sesiones'))
```
