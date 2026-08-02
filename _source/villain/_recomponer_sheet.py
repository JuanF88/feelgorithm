#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Recompone la hoja del villano (villain-raw.png) en un spritesheet con GRILLA
EXACTA que Phaser pueda leer: assets/characters/villainSheet.png.

Qué hace:
  1. Quita el fondo blanco (relleno por inundación desde los bordes; los blancos
     interiores —dientes, ojos— quedan intactos porque el contorno oscuro los aísla).
  2. Detecta las 8 poses por COMPONENTES CONEXAS (cada monstruo es una mancha
     independiente, aunque su brazo extendido invada el hueco de al lado).
  3. Recorta cada pose y la centra en una celda del mismo tamaño, alineada por los
     PIES (para que el villano no "resbale" al animar; la misma idea que en
     assets/README.md para el personaje).

Uso:  python3 _recomponer_sheet.py
Requiere Pillow:  python3 -m pip install --user Pillow

Al terminar imprime el tamaño de frame (frameWidth × frameHeight) que hay que
poner en src/config.js → VILLAIN.
"""

import os
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'villain-raw.png')
OUT = os.path.abspath(os.path.join(HERE, '..', '..', 'assets', 'characters', 'villainSheet.png'))

COLS, ROWS = 4, 2          # disposición esperada de la hoja original
PAD = 18                   # margen alrededor de cada frame en la celda
SENT = (255, 0, 255)       # color centinela para marcar el fondo


def main():
    im = Image.open(SRC).convert('RGBA')
    W, H = im.size
    print(f'Original: {W}x{H}')

    # 1) Fondo → transparente. Inundamos desde varios puntos del borde.
    rgb = im.convert('RGB')
    rgb_px = rgb.load()
    seeds = [(0, 0), (W - 1, 0), (0, H - 1), (W - 1, H - 1),
             (W // 2, 0), (W // 2, H - 1), (0, H // 2), (W - 1, H // 2)]
    for s in seeds:
        r, g, b = rgb_px[s[0], s[1]]
        if r > 200 and g > 200 and b > 200:
            ImageDraw.floodfill(rgb, s, SENT, thresh=60)

    src_px = im.load()
    mask = Image.new('L', (W, H), 0)
    mask_px = mask.load()
    for y in range(H):
        for x in range(W):
            if rgb_px[x, y] == SENT:
                src_px[x, y] = (0, 0, 0, 0)   # borra el fondo en la imagen final
            else:
                mask_px[x, y] = 255

    # 2) Componentes conexas (8-vecinos): cada monstruo es una mancha, aunque su
    #    brazo extendido invada el hueco de la columna de al lado.
    from collections import deque
    data = list(mask.getdata())
    visited = bytearray(W * H)
    blobs = []
    for start in range(W * H):
        if not data[start] or visited[start]:
            continue
        q = deque([(start % W, start // W)])
        visited[start] = 1
        minx = maxx = start % W
        miny = maxy = start // W
        area = 0
        while q:
            x, y = q.popleft()
            area += 1
            if x < minx: minx = x
            elif x > maxx: maxx = x
            if y < miny: miny = y
            elif y > maxy: maxy = y
            for dy in (-1, 0, 1):
                ny = y + dy
                if ny < 0 or ny >= H:
                    continue
                base = ny * W
                for dx in (-1, 0, 1):
                    nx = x + dx
                    if nx < 0 or nx >= W:
                        continue
                    idx = base + nx
                    if data[idx] and not visited[idx]:
                        visited[idx] = 1
                        q.append((nx, ny))
        blobs.append([minx, miny, maxx, maxy, area])

    # Nos quedamos con las manchas grandes (descarta motas y estelas sueltas).
    blobs.sort(key=lambda b: b[4], reverse=True)
    want = COLS * ROWS
    big = blobs[:want]
    print(f'Manchas detectadas: {len(blobs)}  (uso las {len(big)} mayores)')
    for b in blobs[:want + 3]:
        print(f'   area={b[4]:8d}  bbox=({b[0]},{b[1]})-({b[2]},{b[3]})')
    if len(big) < want:
        print('AVISO: se esperaban', want, 'poses')

    # 3) Orden de lectura: agrupar en filas por Y, ordenar por X dentro de cada fila.
    big.sort(key=lambda b: (b[1] + b[3]) / 2)   # por centro vertical
    frames = []
    for r in range(ROWS):
        rowblobs = big[r * COLS:(r + 1) * COLS]
        rowblobs.sort(key=lambda b: (b[0] + b[2]) / 2)   # por centro horizontal
        for b in rowblobs:
            frames.append((b[0], b[1], b[2] + 1, b[3] + 1))

    def feet_x(bb):
        """Centroide horizontal de los pies (12% inferior), relativo a x0."""
        x0, y0, x1, y1 = bb
        h = y1 - y0
        top = y1 - max(1, int(h * 0.12))
        strip = mask.crop((x0, top, x1, y1))
        px = strip.load()
        w, hh = x1 - x0, y1 - top
        sx = n = 0
        for yy in range(hh):
            for xx in range(w):
                if px[xx, yy] > 0:
                    sx += xx
                    n += 1
        return (sx / n) if n else (w / 2)

    # La celda debe ser tan ancha que NINGÚN frame, centrado por los pies, se salga
    # de ella (si no, un brazo extendido invade la celda vecina → "pedazo colado").
    feets = [feet_x(bb) for bb in frames]
    max_half = max(max(fx, (bb[2] - bb[0]) - fx) for fx, bb in zip(feets, frames))
    maxh = max(y1 - y0 for (_, y0, _, y1) in frames)
    cw = int(2 * max_half) + PAD * 2
    ch = maxh + PAD * 2
    cols, rows = COLS, ROWS

    sheet = Image.new('RGBA', (cw * cols, ch * rows), (0, 0, 0, 0))
    for i, bb in enumerate(frames):
        x0, y0, x1, y1 = bb
        crop = im.crop((x0, y0, x1, y1))
        fx = feets[i]
        c, r = i % cols, i // cols
        dest_x = int(c * cw + cw // 2 - fx)   # pies centrados; garantizado dentro de la celda
        dest_y = int(r * ch + ch - PAD - (y1 - y0))
        sheet.paste(crop, (dest_x, dest_y), crop)
        print(f'  frame {i}: {x1 - x0}x{y1 - y0}  destX={dest_x - c * cw}')

    sheet.save(OUT)
    print(f'\nGuardado: {OUT}')
    print(f'Hoja: {sheet.size[0]}x{sheet.size[1]}  ({cols}x{rows} frames)')
    print(f'>>> En src/config.js → VILLAIN:  frameWidth: {cw},  frameHeight: {ch}')


if __name__ == '__main__':
    main()
