# Assets

## Estructura de carpetas

```
assets/
  bg/          fondos de sala (se escalan para CUBRIR el canvas)
  props/       objetos de la sala: palanca, pantalla, banner, cúpula, tarjeta
  characters/  spritesheets de personajes
  emotions/    criaturas-emoción que flotan dentro de las cápsulas
  contenido/   el corpus sintético que se muestra en la pantalla (c1..c3)
  icons/       iconos de la PWA
```

## Hojas de sprites (`*Sheet.png`)

Los archivos terminados en **`Sheet.png` son generados**: se recomponen desde el
arte original para que todos los frames tengan el mismo tamaño y estén alineados
(Phaser exige una grilla exacta; las hojas generadas con IA nunca la traen).
**No los edites a mano** — edita el original y vuelve a recomponer.

| Generado | Origen | Grilla | Frame |
|---|---|---|---|
| `characters/character2Sheet.png` | `characters/character2.png` | 6×3 (18) | 208×200 |
| `emotions/*Sheet.png` | `emotions/*.png` | 6×2 (12) | 208×208 |
| `props/palancaAnim.png` | `palanca/Capa 1..4.png` | 4×1 | 264×288 |

Alineación usada: **personaje** = centro del cuerpo + pies sobre una línea base
común (las partículas de velocidad se ignoran para calcular el centro, si no el
personaje "resbala"); **palanca** = por la base, para que la cúpula no se mueva;
**emociones** = grilla fija, para preservar el temblor que dibujó el artista.

Todo lo que está aquí **se sirve al navegador**. El material de trabajo que NO se
publica (frames sueltos, versiones descartadas) vive en `game/_source/`.

> Al mover o renombrar un asset hay que actualizar **tres** sitios:
> `src/config.js` (ruta), `service-worker.js` (lista `ASSETS` + subir `CACHE`
> a la siguiente versión) y `manifest.webmanifest` (solo iconos).

## Resoluciones de exportación

El canvas interno es **1920×1080 (16:9)**. Exporta al doble para que se vea nítido
en pantallas retina y en la grabación del video de 3 minutos.

| Asset | Exportar a | Nota |
|---|---|---|
| `bg/*.png` | **3840×2160** | 16:9 **exacto**. Cualquier otra proporción se recorta. |
| `props/screenGame.png` | 3072×2048 | Mantener la ventana central transparente y la misma proporción 3:2 (si cambia, actualizar `SCREEN.hole` en `config.js`). |
| `props/banner.png` | 2800×740 | |
| `props/palanca.png`, `props/cupula.png` | ~740×920 | Alto es lo que manda (`height` en `config.js`). |
| `props/tarjeta.png` | 2000×1738 | |
| `characters/character.png` | grilla de 15×4 frames | Cada frame `CHAR.frameWidth × frameHeight`; todos del mismo tamaño. |
| `icons/` | `icon-192.png`, `icon-512.png` | Chrome instala mejor con PNG que con SVG. |

**Por qué el fondo se ve recortado:** el fondo se escala con *cover*
(`RoomScene.buildBackground`), o sea que cubre el canvas y recorta lo que sobra.
Si el arte no es 16:9 exacto, el excedente se pierde por los lados. Deja además
un **margen de seguridad de ~5%** en los bordes: nada importante (texto, un objeto,
el borde de una pared) debe tocar el filo.

## Pendientes

El esqueleto dibuja todo con formas. Para reemplazar los placeholders hace falta:

## Arte (riesgo #1 del cronograma — decidir estilo esta semana)

Estilo recomendado: **siluetas planas, una forma distinta por emoción, paleta fuerte**. Barato y coherente le gana a ambicioso y a medio terminar.

- [ ] **Avatar** — spritesheet: quieto + caminar (si se mueve por la sala).
- [ ] **6 personajes-emoción** (Ekman) — cada uno: quieto, "emerger" del piso, seleccionado.
      Colores ya definidos en `src/config.js`.
- [ ] **Sala** — fondo (pared + piso), marco de la pantalla, la palanca.
- [ ] **Iconos PWA** — `icon-192.png` y `icon-512.png` (ahora hay un `icon.svg` provisional;
      Chrome instala mejor con PNG). Actualizar `manifest.webmanifest` y `service-worker.js`.

> Cuidado: si el arte se genera con IA, decláralo en la propuesta. Un proyecto sobre manipulación
> con contenido sintético, ilustrado con contenido sintético, es un flanco que un juez abre en dos segundos.

## Sonido

- [ ] SFX: tirar de la palanca, pantalla bajando, emoción emergiendo, selección, click de botón.
- [ ] Ambiente: zumbido de "laboratorio vivo".
- Fuentes libres: freesound.org, opengameart.org.

## Contenido (el corpus sintético — lo escribe la comunicadora)

3 piezas, todas construidas por el equipo, verosímiles, sin personas reales identificables:

- [ ] **c1.mp4 / .jpg** — miedo (clip tipo noticia, dato de criminalidad fabricado y sin fuente).
- [ ] **c2 (imagen)** — asco/burla (meme — el vector de la risa).
- [ ] **c3.mp4** — ira (rage-bait generado con IA; ancla la pista "AI and MIL").

Se enchufan en `RoomScene.js → playContent()` (hay un bloque comentado con el código exacto).
