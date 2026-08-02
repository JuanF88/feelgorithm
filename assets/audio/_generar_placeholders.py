#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generador de SONIDOS PLACEHOLDER para Feelgorithm.

Estos archivos .wav son PROVISIONALES: sirven para que el juego suene mientras
consigues los definitivos (freesound.org, opengameart.org, o los tuyos).
Para reemplazar un sonido, deja un archivo con el MISMO nombre en esta carpeta
(o cambia la ruta en src/config.js → AUDIO). Ver README.md de esta carpeta.

Uso:
    python3 _generar_placeholders.py

No necesita librerías externas (solo la stdlib de Python). Genera:
    music.wav  footsteps.wav  jump.wav  land.wav
    lever.wav  screen.wav  emerge.wav  select.wav  ui.wav
"""

import math
import os
import struct
import wave

SR = 22050          # frecuencia de muestreo (Hz)
HERE = os.path.dirname(os.path.abspath(__file__))


# ─────────────────────────── utilidades de síntesis ───────────────────────────

def buf(seconds):
    """Un buffer de silencio (lista de floats -1..1) de la duración dada."""
    return [0.0] * int(SR * seconds)


def add(dst, src, at=0.0, gain=1.0):
    """Mezcla `src` dentro de `dst` a partir del segundo `at`."""
    start = int(at * SR)
    for i, s in enumerate(src):
        j = start + i
        if 0 <= j < len(dst):
            dst[j] += s * gain


def env_ad(n, attack, release):
    """Envolvente ataque/caída lineal para `n` muestras."""
    a = max(1, int(attack * SR))
    r = max(1, int(release * SR))
    out = [1.0] * n
    for i in range(min(a, n)):
        out[i] = i / a
    for i in range(min(r, n)):
        out[n - 1 - i] *= i / r
    return out


def tone(freq, dur, wave_type='sine', attack=0.005, release=0.05,
         f_end=None, vib_hz=0.0, vib_depth=0.0):
    """Un oscilador con envolvente. Si `f_end` se da, barre de freq a f_end."""
    n = int(dur * SR)
    env = env_ad(n, attack, release)
    out = [0.0] * n
    phase = 0.0
    for i in range(n):
        t = i / SR
        f = freq if f_end is None else freq + (f_end - freq) * (i / max(1, n - 1))
        if vib_depth:
            f *= 1.0 + vib_depth * math.sin(2 * math.pi * vib_hz * t)
        phase += 2 * math.pi * f / SR
        if wave_type == 'sine':
            s = math.sin(phase)
        elif wave_type == 'triangle':
            s = 2 / math.pi * math.asin(math.sin(phase))
        elif wave_type == 'square':
            s = 1.0 if math.sin(phase) >= 0 else -1.0
        elif wave_type == 'saw':
            s = 2 * ((phase / (2 * math.pi)) % 1.0) - 1.0
        else:
            s = math.sin(phase)
        out[i] = s * env[i]
    return out


def noise(dur, attack=0.001, release=0.05, lowpass=0.0):
    """Ruido con envolvente. `lowpass` (0..1) suaviza el brillo (filtro simple)."""
    n = int(dur * SR)
    env = env_ad(n, attack, release)
    out = [0.0] * n
    # PRNG determinista (sin random) para que el resultado sea reproducible.
    seed = 1234567
    prev = 0.0
    for i in range(n):
        seed = (1103515245 * seed + 12345) & 0x7fffffff
        r = (seed / 0x3fffffff) - 1.0
        if lowpass > 0:
            prev = prev + (r - prev) * (1.0 - lowpass)  # pasa-bajos de un polo
            r = prev
        out[i] = r * env[i]
    return out


def normalize(data, peak=0.9):
    """Escala el buffer para que su pico quede en `peak` (evita saturación)."""
    m = max((abs(x) for x in data), default=0.0)
    if m < 1e-9:
        return data
    k = peak / m
    return [x * k for x in data]


def write_wav(name, data, peak=0.9):
    data = normalize(data, peak)
    path = os.path.join(HERE, name)
    with wave.open(path, 'w') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        frames = bytearray()
        for x in data:
            v = int(max(-1.0, min(1.0, x)) * 32767)
            frames += struct.pack('<h', v)
        w.writeframes(bytes(frames))
    kb = os.path.getsize(path) / 1024
    print(f'  {name:16s} {len(data)/SR:5.2f}s  {kb:6.1f} KB')


# ─────────────────────────── los sonidos del juego ───────────────────────────

def make_music():
    """Pad ambiental en La menor + arpegio de campanas. Bucle sin costura de 24 s.

    Para que el bucle no dé un 'clic' al repetirse, todo es periódico en 24 s:
    las frecuencias del pad se cuantizan a múltiplos de 1/24 Hz y los arpegios
    caben enteros dentro del bucle (empiezan y acaban en silencio)."""
    L = 24.0
    out = buf(L)

    def q(f):                     # cuantiza a un nº entero de ciclos en el bucle
        return round(f * L) / L

    # Pad sostenido: sub + triada de Am con ligero desafinado (coro) y trémolo lento.
    pad_notes = [110.0, 220.0, 261.63, 329.63, 440.0]   # A2 A3 C4 E4 A4
    pad_gain = [0.10, 0.06, 0.05, 0.05, 0.035]
    trem_hz = q(0.125)            # trémolo de 3 ciclos en 24 s
    n = len(out)
    for note, g in zip(pad_notes, pad_gain):
        f1, f2 = q(note), q(note * 1.004)   # dos osciladores levemente separados
        for i in range(n):
            t = i / SR
            trem = 0.82 + 0.18 * math.sin(2 * math.pi * trem_hz * t)
            s = math.sin(2 * math.pi * f1 * t) + 0.7 * math.sin(2 * math.pi * f2 * t)
            out[i] += s * g * 0.5 * trem

    # Arpegio de campanas (melodía en La menor). Cada nota decae y cabe en el bucle.
    scale = {'A4': 440.0, 'C5': 523.25, 'E5': 659.25, 'G4': 392.0,
             'D5': 587.33, 'F4': 349.23, 'B4': 493.88, 'E4': 329.63}
    pattern = ['A4', 'C5', 'E5', 'C5', 'D5', 'C5', 'A4', 'G4',
               'F4', 'A4', 'C5', 'A4', 'E4', 'G4', 'B4', 'E5']
    step = L / len(pattern)
    for k, name in enumerate(pattern):
        f = scale[name]
        bell = tone(f, 1.3, 'sine', attack=0.01, release=1.2)
        harm = tone(f * 2.0, 1.0, 'sine', attack=0.01, release=0.95)
        for i in range(len(bell)):
            bell[i] += 0.3 * harm[i] if i < len(harm) else 0.0
        add(out, bell, at=k * step, gain=0.16)

    return out


def make_footsteps():
    """Dos pasos suaves en 0.6 s. Al reproducirse en bucle da una caminata."""
    out = buf(0.6)
    for at in (0.0, 0.3):
        thud = noise(0.09, attack=0.001, release=0.085, lowpass=0.86)
        low = tone(90, 0.09, 'sine', attack=0.001, release=0.08)
        add(out, thud, at=at, gain=0.7)
        add(out, low, at=at, gain=0.5)
    return out


def make_jump():
    """Chirrido corto que sube: el impulso del salto."""
    out = buf(0.28)
    add(out, tone(320, 0.22, 'triangle', attack=0.005, release=0.18, f_end=760), gain=0.8)
    add(out, tone(640, 0.14, 'sine', attack=0.005, release=0.12, f_end=1200), gain=0.25)
    return out


def make_land():
    """Golpe grave y corto: caer al piso."""
    out = buf(0.2)
    add(out, tone(150, 0.16, 'sine', attack=0.001, release=0.15, f_end=70), gain=0.9)
    add(out, noise(0.06, attack=0.001, release=0.055, lowpass=0.8), gain=0.4)
    return out


def make_lever():
    """Ratchet mecánico: varios clics + un 'clunk' grave al final."""
    out = buf(0.4)
    for k in range(4):
        click = noise(0.03, attack=0.001, release=0.028, lowpass=0.55)
        add(out, click, at=0.02 + k * 0.055, gain=0.55)
    add(out, tone(120, 0.14, 'square', attack=0.002, release=0.13, f_end=80), at=0.26, gain=0.4)
    return out


def make_screen():
    """Zumbido descendente: la pantalla que baja (servo)."""
    out = buf(0.7)
    add(out, tone(520, 0.62, 'saw', attack=0.02, release=0.5, f_end=180,
                  vib_hz=22, vib_depth=0.015), gain=0.35)
    add(out, tone(260, 0.62, 'sine', attack=0.02, release=0.5, f_end=90), gain=0.3)
    return out


def make_emerge():
    """Brillo ascendente: las emociones que emergen del piso."""
    out = buf(0.6)
    add(out, tone(300, 0.55, 'sine', attack=0.05, release=0.45, f_end=880), gain=0.5)
    add(out, tone(450, 0.5, 'triangle', attack=0.08, release=0.4, f_end=1320), gain=0.2)
    return out


def make_select():
    """Confirmación de dos notas (Do → Sol): elegir emoción o elemento."""
    out = buf(0.4)
    add(out, tone(523.25, 0.14, 'sine', attack=0.005, release=0.12), at=0.0, gain=0.7)
    add(out, tone(783.99, 0.2, 'sine', attack=0.005, release=0.18), at=0.1, gain=0.7)
    add(out, tone(1046.5, 0.18, 'triangle', attack=0.005, release=0.16), at=0.1, gain=0.25)
    return out


def make_ui():
    """Clic corto y suave para botones."""
    out = buf(0.09)
    add(out, tone(880, 0.07, 'sine', attack=0.002, release=0.06), gain=0.6)
    add(out, noise(0.02, attack=0.001, release=0.018, lowpass=0.5), gain=0.15)
    return out


def make_scary():
    """Ambiente aterrador para el nivel 2 (el pasillo del villano): dron grave
    disonante + latido lento + brillo agudo inquietante. Bucle de 20 s sin costura
    (todo periódico en 20 s: frecuencias cuantizadas y latidos contenidos)."""
    L = 20.0
    out = buf(L)
    n = len(out)

    def q(f):
        return round(f * L) / L

    # Dron con presencia MEDIA (audible en parlantes de laptop): graves que "baten"
    # + una quinta media disonante, con vaivén lento.
    drones = [(q(110.0), 0.10), (q(116.5), 0.09), (q(165.0), 0.07), (q(220.0), 0.05)]
    lfo = q(0.1)
    for f, g in drones:
        for i in range(n):
            t = i / SR
            amp = 0.8 + 0.2 * math.sin(2 * math.pi * lfo * t)
            out[i] += math.sin(2 * math.pi * f * t) * g * amp

    # Latido lento (lub-dub) cada 2 s, con algo de medio para que se oiga.
    beat = 0.0
    while beat < L - 0.5:
        for off, gg in ((0.0, 1.0), (0.28, 0.7)):
            thump = tone(90, 0.18, 'sine', attack=0.004, release=0.16, f_end=55)
            add(out, thump, at=beat + off, gain=0.5 * gg)
        beat += 2.0

    # Brillo agudo disonante que entra y sale (periódico para el bucle).
    sh = q(0.25)
    for i in range(n):
        t = i / SR
        env = max(0.0, math.sin(2 * math.pi * sh * t)) ** 3
        out[i] += math.sin(2 * math.pi * q(880.0) * t) * 0.05 * env
        out[i] += math.sin(2 * math.pi * q(932.3) * t) * 0.04 * env  # disonancia

    return out


SOUNDS = {
    'music.wav': (make_music, 0.62),
    'music_scary.wav': (make_scary, 0.6),
    'footsteps.wav': (make_footsteps, 0.85),
    'jump.wav': (make_jump, 0.9),
    'land.wav': (make_land, 0.9),
    'lever.wav': (make_lever, 0.9),
    'screen.wav': (make_screen, 0.8),
    'emerge.wav': (make_emerge, 0.85),
    'select.wav': (make_select, 0.9),
    'ui.wav': (make_ui, 0.85),
}


def main():
    print('Generando sonidos placeholder en', HERE)
    for name, (fn, peak) in SOUNDS.items():
        write_wav(name, fn(), peak=peak)
    print('Listo. Reemplaza cualquiera de estos .wav por el tuyo (mismo nombre).')


if __name__ == '__main__':
    main()
