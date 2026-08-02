# Audio

Toda la música y los efectos del juego. Los `.wav` de aquí son **placeholders
generados** (sonido provisional): sirven para que el juego suene ya, y los cambias
por los definitivos cuando quieras.

## Cómo cambiar un sonido

1. Consigue tu archivo (`.wav`, `.ogg` o `.mp3`). Fuentes libres:
   [freesound.org](https://freesound.org), [opengameart.org](https://opengameart.org).
2. Déjalo en esta carpeta **con el mismo nombre** (p. ej. `jump.wav`).
   — o, si prefieres otro nombre/formato, cambia la ruta en `src/config.js → AUDIO`.
3. Si añades o renombras archivos, actualiza `service-worker.js` (lista `ASSETS` y
   sube el número de `CACHE`) para que sigan disponibles sin conexión.

Volúmenes, el toggle y el ritmo de los pasos se ajustan en `src/config.js → AUDIO`.
La lógica (carga, reproducción, música entre escenas, memoria del on/off) está en
`src/audio.js`. Para usar un efecto desde el código: `playSfx(scene, 'clave')`.

## Los archivos

| Archivo | Cuándo suena |
|---|---|
| `music.wav` | Música de fondo (en bucle). Botón ♫ en la esquina para encender/apagar. |
| `footsteps.wav` | Pasos, mientras el personaje camina o corre (más rápido al correr). |
| `jump.wav` | Salto del personaje. |
| `land.wav` | Aterrizaje (y golpe al morir en el pasillo). |
| `lever.wav` | Tirar de la palanca (y "clonk" al lanzar una roca el villano). |
| `screen.wav` | La pantalla baja / sube. |
| `emerge.wav` | Las emociones emergen del piso. |
| `select.wav` | Elegir una emoción o un elemento. |
| `ui.wav` | Clic de botones (jugar, menús, música…). |

## Regenerar los placeholders

Los `.wav` se crean por síntesis (sin dependencias) con:

```bash
python3 _generar_placeholders.py
```

Edita ese script si quieres afinar los sonidos provisionales (frecuencias,
duración, etc.). No forma parte del juego: solo genera los archivos.
