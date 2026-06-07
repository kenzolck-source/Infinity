import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = resolve(root, "src/assets/audio");
const sampleRate = 44100;
let noiseSeed = 0x51a7d;

mkdirSync(outDir, { recursive: true });

function rand() {
  noiseSeed = (noiseSeed * 1664525 + 1013904223) >>> 0;
  return noiseSeed / 0xffffffff;
}

function clamp(value, min = -1, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function envelope(t, duration, attack = 0.01, release = 0.06) {
  const rise = attack > 0 ? Math.min(1, t / attack) : 1;
  const fall = release > 0 ? Math.min(1, (duration - t) / release) : 1;
  return clamp(Math.min(rise, fall), 0, 1);
}

function makeBuffer(duration, generator) {
  const total = Math.max(1, Math.floor(duration * sampleRate));
  const samples = new Float32Array(total);
  for (let index = 0; index < total; index += 1) {
    const t = index / sampleRate;
    samples[index] = clamp(generator(t, index, total));
  }
  return samples;
}

function sine(freq, t) {
  return Math.sin(2 * Math.PI * freq * t);
}

function sweep(start, end, duration, t) {
  const ratio = clamp(t / duration, 0, 1);
  const freq = start + (end - start) * ratio;
  return sine(freq, t);
}

function noise() {
  return rand() * 2 - 1;
}

function mix(...values) {
  return values.reduce((sum, value) => sum + value, 0);
}

function hitNoise(t, duration, power = 1) {
  return noise() * Math.exp(-t * 28 / power) * envelope(t, duration, 0.002, 0.03);
}

function tonalHit(t, duration, freq, amount = 1) {
  return sine(freq, t) * Math.exp(-t * 14) * envelope(t, duration, 0.003, 0.08) * amount;
}

function arpeggio(t, notes, step, decay = 0.9) {
  const noteIndex = Math.min(notes.length - 1, Math.floor(t / step));
  const local = t - noteIndex * step;
  const env = Math.exp(-local * 6) * decay;
  return sine(notes[noteIndex], local) * env;
}

function kick(t, beatTime, gain = 1) {
  const local = t - beatTime;
  if (local < 0 || local > 0.18) return 0;
  const freq = 86 - local * 210;
  return sine(Math.max(42, freq), local) * Math.exp(-local * 22) * gain;
}

function hat(t, beatTime, gain = 1) {
  const local = t - beatTime;
  if (local < 0 || local > 0.05) return 0;
  return noise() * Math.exp(-local * 70) * gain;
}

function bassPulse(t, freq, tempoStep, gain = 1) {
  const local = t % tempoStep;
  return sine(freq, t) * Math.exp(-local * 4.2) * gain;
}

function writeWav(fileName, samples) {
  const bytesPerSample = 2;
  const blockAlign = bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataBytes = samples.length * bytesPerSample;
  const buffer = Buffer.alloc(44 + dataBytes);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataBytes, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataBytes, 40);
  for (let index = 0; index < samples.length; index += 1) {
    buffer.writeInt16LE(Math.round(clamp(samples[index]) * 32767), 44 + index * 2);
  }
  writeFileSync(resolve(outDir, fileName), buffer);
}

const assets = {
  "card-draw.wav": makeBuffer(0.28, (t) => {
    const env = envelope(t, 0.28, 0.004, 0.08);
    const snap = t < 0.04 ? hitNoise(t, 0.05, 0.35) * 0.8 : 0;
    return mix(sweep(760, 2150, 0.28, t) * env * 0.42, snap);
  }),
  "card-reward.wav": makeBuffer(0.62, (t) => {
    const notes = [784, 988, 1175, 1568];
    return mix(arpeggio(t, notes, 0.12, 0.55), sine(3136, t) * envelope(t, 0.62, 0.01, 0.18) * 0.08);
  }),
  "card-play-attack.wav": makeBuffer(0.34, (t) => {
    const body = sweep(1150, 220, 0.22, t) * envelope(t, 0.34, 0.002, 0.09) * 0.46;
    const edge = t > 0.08 ? hitNoise(t - 0.08, 0.18, 0.6) * 0.7 : 0;
    return mix(body, edge, tonalHit(t, 0.34, 116, 0.28));
  }),
  "card-play-guard.wav": makeBuffer(0.42, (t) => {
    const pulse = tonalHit(t, 0.42, 164, 0.5) + tonalHit(Math.max(0, t - 0.07), 0.35, 328, 0.28);
    const sheen = sine(1320 + Math.sin(t * 18) * 40, t) * envelope(t, 0.42, 0.01, 0.18) * 0.14;
    return mix(pulse, sheen);
  }),
  "card-play-support.wav": makeBuffer(0.5, (t) => {
    const notes = [523.25, 659.25, 783.99];
    return mix(arpeggio(t, notes, 0.14, 0.46), sine(1046.5, t) * envelope(t, 0.5, 0.02, 0.22) * 0.1);
  }),
  "card-play-tactic.wav": makeBuffer(0.36, (t) => {
    const step = Math.floor(t / 0.055);
    const local = t - step * 0.055;
    const tones = [520, 1040, 780, 1300, 650, 1560];
    return sine(tones[step % tones.length], local) * Math.exp(-local * 30) * 0.38 + noise() * Math.exp(-local * 55) * 0.08;
  }),
  "combat-hit-light.wav": makeBuffer(0.24, (t) => mix(hitNoise(t, 0.24, 0.75) * 0.92, tonalHit(t, 0.24, 150, 0.38))),
  "combat-hit-heavy.wav": makeBuffer(0.48, (t) => {
    const thud = tonalHit(t, 0.48, 72, 0.72) + tonalHit(t, 0.48, 118, 0.48);
    const crack = hitNoise(t, 0.32, 1.4) * 1.1;
    const after = t > 0.14 ? hitNoise(t - 0.14, 0.25, 0.9) * 0.55 : 0;
    return mix(thud, crack, after);
  }),
  "combat-hit-aoe.wav": makeBuffer(0.58, (t) => {
    const wave = sweep(98, 54, 0.58, t) * envelope(t, 0.58, 0.004, 0.16) * 0.72;
    const sparks = (t > 0.08 && t < 0.42 ? noise() * Math.exp(-(t - 0.08) * 7) : 0) * 0.42;
    return mix(wave, sparks, tonalHit(t, 0.58, 180, 0.24));
  }),
  "combat-enemy-break.wav": makeBuffer(0.62, (t) => {
    const shards = noise() * Math.exp(-t * 7) * envelope(t, 0.62, 0.001, 0.12) * 0.55;
    const fall = sweep(900, 120, 0.62, t) * envelope(t, 0.62, 0.006, 0.16) * 0.28;
    return mix(shards, fall);
  }),
  "combat-victory.wav": makeBuffer(1.1, (t) => {
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
    const tone = arpeggio(t, notes, 0.16, 0.52);
    const bass = t > 0.1 ? sine(130.81, t) * envelope(t - 0.1, 1, 0.02, 0.35) * 0.16 : 0;
    return mix(tone, bass);
  }),
  "combat-defeat.wav": makeBuffer(1.2, (t) => {
    const fall = sweep(280, 72, 1.2, t) * envelope(t, 1.2, 0.02, 0.35) * 0.56;
    const air = noise() * envelope(t, 1.2, 0.05, 0.38) * 0.09;
    return mix(fall, air);
  }),
  "music-hub.wav": makeBuffer(10, (t) => {
    const beat = 0.8;
    const bass = bassPulse(t, 55, beat, 0.2);
    const pad = (sine(110, t) + sine(164.81, t) + sine(220, t)) * 0.055;
    const click = hat(t, Math.floor(t / beat) * beat + 0.4, 0.09);
    const shimmer = sine(880 + Math.sin(t * 0.8) * 12, t) * 0.025;
    return mix(bass, pad, click, shimmer) * envelope(t, 10, 0.03, 0.05);
  }),
  "music-map.wav": makeBuffer(10, (t) => {
    const beat = 0.625;
    const bass = bassPulse(t, 61.74, beat, 0.23);
    const pulse = sine(246.94, t) * Math.pow(Math.max(0, Math.sin(Math.PI * (t % beat) / beat)), 2) * 0.07;
    const ticks = hat(t, Math.floor(t / (beat / 2)) * (beat / 2), 0.055);
    const pad = (sine(123.47, t) + sine(185, t)) * 0.045;
    return mix(bass, pulse, ticks, pad) * envelope(t, 10, 0.03, 0.05);
  }),
  "music-combat.wav": makeBuffer(8, (t) => {
    const beat = 0.5;
    const bassNotes = [73.42, 73.42, 82.41, 65.41];
    const bar = Math.floor(t / beat) % bassNotes.length;
    const bass = bassPulse(t, bassNotes[bar], beat, 0.28);
    const drums = kick(t, Math.floor(t / 1) * 1, 0.34) + hat(t, Math.floor(t / 0.25) * 0.25, 0.045);
    const alarm = sine(440 + Math.sin(t * 5) * 18, t) * (t % 2 < 0.35 ? 0.04 : 0);
    return mix(bass, drums, alarm) * envelope(t, 8, 0.02, 0.04);
  })
};

for (const [fileName, samples] of Object.entries(assets)) writeWav(fileName, samples);

console.log(`Generated ${Object.keys(assets).length} audio assets in ${outDir}`);
