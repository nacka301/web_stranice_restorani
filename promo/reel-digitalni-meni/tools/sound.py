"""Zvučna podloga za reel (20 s): sintetizirani efekti usklađeni s
animacijom u video.html + topla glazbena podloga (120 BPM, promjena
akorda na svakom koraku). Bez vanjskih uzoraka — sve je generirano.

    python3 tools/sound.py out/audio.wav
"""
import sys
import wave

import numpy as np
from scipy import signal

SR = 48000
DUR = 20.0
N = int(SR * DUR)
rng = np.random.default_rng(7)
mix_l = np.zeros(N)
mix_r = np.zeros(N)
bus_rev = np.zeros((2, N))  # pošalji na jeku


def tt(d):
    return np.arange(int(d * SR)) / SR


def midi(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def place(sig, at, gain=1.0, pan=0.0, rev=0.0):
    """Dodaj mono ili stereo signal u miks u trenutku `at` (s)."""
    i = int(round(at * SR))
    if sig.ndim == 1:
        a = (pan + 1) * np.pi / 4
        sig = np.vstack([sig * np.cos(a), sig * np.sin(a)])
    n = min(sig.shape[1], N - i)
    if n <= 0:
        return
    mix_l[i:i + n] += sig[0, :n] * gain
    mix_r[i:i + n] += sig[1, :n] * gain
    if rev:
        bus_rev[:, i:i + n] += sig[:, :n] * gain * rev


def filt(x, kind, f, order=2):
    sos = signal.butter(order, f, btype=kind, fs=SR, output='sos')
    return signal.sosfilt(sos, x)


def noise(d):
    return rng.standard_normal(int(d * SR))


def sweep_lp(x, f0, f1, curve=1.0):
    """Jednopolni niski propust s kliznom graničnom frekvencijom."""
    n = len(x)
    p = (np.arange(n) / max(1, n - 1)) ** curve
    fc = f0 * (f1 / f0) ** p
    a = 1 - np.exp(-2 * np.pi * fc / SR)
    y = np.empty(n)
    acc = 0.0
    for i in range(n):
        acc += a[i] * (x[i] - acc)
        y[i] = acc
    return y


# ------------------------------------------------------------------ efekti
def service_bell():
    t = tt(2.2)
    f0 = 2380.0
    sig = np.zeros_like(t)
    for ratio, amp, dec in [(1.0, 1.0, 1.5), (2.32, 0.42, 0.8), (4.25, 0.2, 0.45), (6.63, 0.09, 0.25)]:
        for det in (-0.9, 0.9):
            sig += amp * np.sin(2 * np.pi * f0 * ratio * t + det * t * 2 * np.pi) * np.exp(-t / dec) * 0.5
    strike = filt(noise(0.012), 'highpass', 3000) * np.linspace(1, 0, int(0.012 * SR)) * 0.6
    sig[:len(strike)] += strike
    return sig * 0.5


def impact(f0=95, f1=36, dec=0.9, crack=0.5):
    t = tt(2.0)
    f = f1 + (f0 - f1) * np.exp(-t / 0.12)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / dec)
    boom = np.tanh(boom * 1.6) * 0.9
    c = filt(noise(0.25), 'lowpass', 2500) * np.exp(-tt(0.25) / 0.05) * crack
    boom[:len(c)] += c
    return boom


def whoosh(d=0.6, f0=300, f1=5000, peak=0.6, pan0=0.0, pan1=0.0, gain=1.0):
    x = noise(d)
    y = sweep_lp(x, f0, f1, 0.8)
    y = filt(y, 'highpass', 120)
    p = np.linspace(0, 1, len(y))
    env = np.where(p < peak, (p / peak) ** 2, ((1 - p) / (1 - peak)) ** 1.6)
    y *= env * gain * 1.6
    pans = np.linspace(pan0, pan1, len(y))
    a = (pans + 1) * np.pi / 4
    return np.vstack([y * np.cos(a), y * np.sin(a)])


def riser(d=0.45):
    x = noise(d)
    y = sweep_lp(x, 400, 9000, 1.5)
    t = tt(d)
    tone = np.sin(2 * np.pi * np.cumsum(300 * (4 ** (t / d))) / SR) * 0.25
    env = (t / d) ** 2.2
    return (y * 0.8 + tone) * env


def chime(notes, d=2.2, spread=0.025, bright=1.0):
    t = tt(d)
    out = np.zeros_like(t)
    for k, m in enumerate(notes):
        f = midi(m)
        off = int(k * spread * SR)
        tone = (np.sin(2 * np.pi * f * t) + 0.25 * bright * np.sin(2 * np.pi * f * 2.01 * t) * np.exp(-t / 0.3)) * np.exp(-t / 0.9)
        tone *= np.minimum(1, t / 0.004)
        out[off:] += tone[:len(t) - off] / len(notes)
    return out


def click(f=2400, d=0.05, nz=0.4):
    t = tt(d)
    s = np.sin(2 * np.pi * f * t) * np.exp(-t / 0.012) + filt(noise(d), 'highpass', 2500) * np.exp(-t / 0.006) * nz
    return s * 0.6


def beep(f, d=0.09):
    t = tt(d)
    return np.sin(2 * np.pi * f * t) * np.minimum(1, t / 0.004) * np.minimum(1, (d - t) / 0.02) * 0.5


def scan_tone(d=0.66):
    t = tt(d)
    f = 520 * (2.2 ** (t / d))
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.18 + filt(noise(d), 'bandpass', [3000, 6000]) * 0.08
    return s * np.sin(np.pi * t / d) ** 0.7


# ------------------------------------------------------------------ glazba
def pad_note(f, d, att=0.5, rel=0.8, bright=1.0):
    t = tt(d + rel)
    out = np.zeros((2, len(t)))
    for ch, det in ((0, -5), (1, 5)):
        fd = f * 2 ** (det / 1200)
        vib = 1 + 0.0018 * np.sin(2 * np.pi * 4.8 * t + ch)
        ph = 2 * np.pi * np.cumsum(fd * vib) / SR
        s = sum(np.sin(h * ph) / h ** (1.9 - 0.4 * bright) for h in range(1, 7))
        out[ch] = s
    env = np.minimum(1, t / att) * np.where(t < d, 1, np.exp(-(t - d) / (rel / 3)))
    return out * env


def chord_pad(notes, at, d, gain=0.05):
    for m in notes:
        s = pad_note(midi(m), d)
        s = np.vstack([filt(s[0], 'lowpass', 2600), filt(s[1], 'lowpass', 2600)])
        place(s, at, gain, rev=0.6)


def kick():
    t = tt(0.45)
    f = 46 + 110 * np.exp(-t / 0.035)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.22)
    s[:240] += filt(noise(0.005), 'highpass', 1500) * 0.3
    return np.tanh(s * 1.3)


def hat(d=0.05):
    return filt(noise(d), 'highpass', 7500) * np.exp(-tt(d) / 0.012)


def snap():
    d = 0.22
    return filt(noise(d), 'bandpass', [900, 4200]) * np.exp(-tt(d) / 0.045) * 0.8


def pluck(m, d=0.5):
    t = tt(d)
    f = midi(m)
    s = (np.sin(2 * np.pi * f * t) + 0.35 * np.sin(4 * np.pi * f * t) * np.exp(-t / 0.08) + 0.12 * np.sin(6 * np.pi * f * t) * np.exp(-t / 0.04))
    return s * np.exp(-t / 0.2) * np.minimum(1, t / 0.003)


def bass(m, d):
    t = tt(d + 0.1)
    f = midi(m)
    s = np.sin(2 * np.pi * f * t) + 0.3 * np.sin(4 * np.pi * f * t) + 0.12 * np.sin(6 * np.pi * f * t)
    env = np.minimum(1, t / 0.01) * np.exp(-t / (d * 0.9)) * np.where(t < d, 1, np.exp(-(t - d) / 0.03))
    return np.tanh(s * env * 1.2)


CH = {
    'Dmaj9': [50, 57, 61, 64, 66],
    'Bm9': [47, 54, 57, 61, 62],
    'Gmaj9': [43, 50, 54, 57, 59],
    'Em9': [52, 55, 59, 62, 66],
    'A13sus': [45, 52, 55, 59, 62, 66],
}
ROOT = {'Dmaj9': 38, 'Bm9': 35, 'Gmaj9': 31, 'Em9': 40, 'A13sus': 33}
SECTIONS = [  # (početak, trajanje, akord)
    (1.38, 3.12, 'Dmaj9'), (4.5, 3.0, 'Bm9'), (7.5, 3.0, 'Gmaj9'), (10.5, 3.0, 'Em9'),
    (13.5, 3.0, 'A13sus'), (16.5, 1.0, 'Gmaj9'), (17.5, 1.0, 'A13sus'), (18.5, 1.5, 'Dmaj9'),
]
BEAT = 0.5  # 120 BPM -> svaki korak (3 s) = 6 udaraca

for at, d, name in SECTIONS:
    chord_pad(CH[name], at, d, gain=0.05 if at > 2 else 0.044)
    # bas: osmine s naglaskom (samo u glavnom dijelu)
    if 4.5 <= at < 18.5:
        for k in range(int(round(d / BEAT))):
            b_at = at + k * BEAT
            place(bass(ROOT[name], 0.34), b_at, 0.11)
            place(bass(ROOT[name] + 12 if k % 2 else ROOT[name], 0.14), b_at + 0.25, 0.06)
    # arpeggio "pluck" — svjetlucavi tech sloj
    if 1.9 <= at < 16.5:
        tones = sorted(CH[name])[1:] + [CH[name][1] + 12]
        seq = tones + tones[-2:0:-1]
        for k in range(int(d / 0.25)):
            p_at = at + k * 0.25
            if p_at < 2.5:
                continue
            place(pluck(seq[k % len(seq)] + 12), p_at, 0.05 if p_at >= 4.5 else 0.032, pan=0.35 if k % 2 else -0.35, rev=0.5)

# ritam: 4.5–16.5 (kick 1 i 3, snap 2 i 4, hat na osminama)
for k in range(int((16.5 - 4.5) / BEAT)):
    b = 4.5 + k * BEAT
    if k % 2 == 0:
        place(kick(), b, 0.34)
    else:
        place(snap(), b, 0.13, rev=0.4)
    place(hat(), b + 0.25, 0.07, pan=0.25)
    place(hat(0.03), b, 0.035, pan=-0.2)
# gradnja prema kraju
for b in (17.0, 17.5, 18.0, 18.25):
    place(kick(), b, 0.45)
for k, b in enumerate(np.arange(17.5, 18.5, 0.125)):
    place(snap(), b, 0.04 + 0.012 * k, rev=0.3)
place(kick(), 18.5, 0.55)

# ---- hook (0–2 s)
drone_t = tt(1.45)
drone = (np.sin(2 * np.pi * 55 * drone_t) * 0.5 + filt(noise(1.45), 'lowpass', 300) * 0.4) * np.minimum(1, drone_t / 0.3) * np.exp(-np.maximum(0, drone_t - 1.1) / 0.1)
place(drone, 0.0, 0.12)
place(service_bell(), 0.02, 0.38, pan=-0.1, rev=0.35)
place(service_bell(), 0.36, 0.32, pan=0.1, rev=0.35)
place(impact(), 0.62, 0.62, rev=0.25)
place(whoosh(0.4, 400, 7000, 0.7, -0.4, 0.95, 0.9), 1.16, 0.32)   # "I odlaze." odlazi udesno
place(riser(0.4), 0.98, 0.13)
place(chime([74, 78, 81, 85, 88], 2.6, 0.03), 1.38, 0.42, rev=0.55)   # logo
place(impact(70, 40, 0.6, 0.2), 1.38, 0.32)
place(whoosh(0.4, 300, 3000, 0.5, 0, 0, 0.6), 1.88, 0.16)
place(riser(0.75), 3.62, 0.14, rev=0.3)                                  # gradnja prema koraku 1

# ---- prijelazi i koraci
for at in (4.36, 16.42, 18.4):
    place(whoosh(0.5, 300, 9000, 0.55, -0.8, 0.8, 1.0), at - 0.08, 0.24, rev=0.2)
place(whoosh(0.55, 200, 4000, 0.6, 0, 0, 0.8), 4.55, 0.2)              # QR karta
place(scan_tone(), 5.12, 0.42, rev=0.2)
place(beep(1318.5), 5.78, 0.32, rev=0.3)
place(beep(1975.5, 0.12), 5.88, 0.3, rev=0.3)
for at in (5.98, 7.38, 10.38, 13.38):                                    # mobitel uleti odozdo
    place(whoosh(0.6, 250, 6000, 0.45, 0.1, -0.1, 1.0), at, 0.24, rev=0.15)
for at in (7.22, 10.24, 13.24, 16.12):                                   # stari mobitel izlazi gore
    place(whoosh(0.4, 600, 8000, 0.7, -0.1, 0.1, 0.7), at, 0.16)
place(whoosh(0.35, 500, 7000, 0.6, 0.3, -0.6, 0.8), 9.06, 0.2)          # kartica jela izlazi
place(click(1800, 0.06, 0.3), 9.12, 0.3, pan=-0.4, rev=0.3)
for at in (11.06, 11.7, 12.52):                                          # dodiri ekrana
    place(click(), at, 0.38, rev=0.2)
place(click(3200, 0.04, 0.1), 12.85, 0.18, rev=0.3)
place(whoosh(0.5, 300, 5000, 0.5, -0.9, 0.9, 0.8), 13.72, 0.18, rev=0.2) # lepeza mobitela
place(impact(120, 50, 0.35, 0.5), 14.3, 0.4, rev=0.2)                    # pečat "0 %"
place(chime([86, 90, 93], 1.4, 0.02), 14.34, 0.2, pan=0.4, rev=0.5)
place(chime([81, 85, 88, 93], 1.6, 0.03), 14.6, 0.12, rev=0.6)

# ---- prednosti
place(impact(), 16.62, 0.7, rev=0.3)
place(chime([78, 81, 85, 90], 1.8, 0.02), 16.66, 0.3, rev=0.55)
place(whoosh(0.45, 300, 6000, 0.6, -0.9, 0.0, 0.9), 16.96, 0.24)
place(click(2600), 17.2, 0.3, pan=-0.3, rev=0.3)
place(whoosh(0.45, 300, 6000, 0.6, 0.9, 0.0, 0.9), 17.2, 0.24)
place(click(3000), 17.44, 0.3, pan=0.3, rev=0.3)

# ---- završni kadar
place(chime([74, 78, 81, 85, 88, 93], 2.0, 0.035), 18.46, 0.48, rev=0.6)
place(impact(80, 38, 0.8, 0.15), 18.5, 0.35)
place(whoosh(0.5, 300, 5000, 0.6, 0, 0, 0.7), 18.7, 0.18)
place(chime([93, 97, 100], 1.2, 0.04), 19.25, 0.12, pan=0.2, rev=0.6)

# ------------------------------------------------------------------ jeka + master
ir_t = tt(1.8)
ir = np.vstack([
    filt(rng.standard_normal(len(ir_t)), 'lowpass', 5500) * np.exp(-ir_t / 0.42),
    filt(rng.standard_normal(len(ir_t)), 'lowpass', 5500) * np.exp(-ir_t / 0.42),
])
ir /= np.sqrt((ir ** 2).sum(axis=1, keepdims=True))
wet = np.vstack([signal.fftconvolve(bus_rev[0], ir[0])[:N], signal.fftconvolve(bus_rev[1], ir[1])[:N]])
out = np.vstack([mix_l, mix_r]) + wet * 0.55
out = filt(out, 'highpass', 28)
fade = np.ones(N)
fn = int(0.25 * SR)
fade[-fn:] = np.linspace(1, 0, fn) ** 1.5
out *= fade
out = np.tanh(out * 1.15) / np.tanh(1.15)
out /= np.max(np.abs(out)) / 0.89
pcm = (out.T * 32767).astype('<i2')
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print('ok', sys.argv[1])
