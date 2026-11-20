// Original deterministic instrumental bed. No sampled or third-party music.
import { writeFileSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
const sr = 44100,
  seconds = 180,
  pcm = Buffer.alloc(sr * seconds * 4);
const voices = JSON.parse(
  readFileSync(new URL("../narration.json", import.meta.url)),
);
const hz = (n) => 440 * 2 ** ((n - 69) / 12),
  chords = [
    [50, 57, 60, 65],
    [46, 53, 58, 62],
    [48, 55, 60, 64],
    [45, 52, 57, 60],
  ];
let seed = 2048,
  lowNoise = 0;
for (let i = 0; i < sr * seconds; i++) {
  const t = i / sr,
    beat = (t * 56) / 60,
    bar = Math.floor(beat / 8),
    phase = beat % 1;
  const chord = chords[bar % chords.length],
    local = (beat % 8) / 8;
  const padEnv = Math.sin(Math.PI * local) ** 0.55;
  let left = 0,
    right = 0;
  chord.forEach((n, k) => {
    const amp = (0.027 * padEnv) / (1 + k * 0.25),
      f = hz(n);
    left +=
      amp *
      (Math.sin(2 * Math.PI * f * t) +
        0.23 * Math.sin(2 * Math.PI * f * 2 * t));
    right +=
      amp *
      (Math.sin(2 * Math.PI * f * 1.001 * t) +
        0.23 * Math.sin(2 * Math.PI * f * 2.001 * t));
  });
  const tick =
    Math.exp(-phase * 26) *
    Math.sin(2 * Math.PI * (52 + 24 * Math.exp(-phase * 12)) * t) *
    0.12;
  const arpNote = chord[Math.floor(beat * 2) % 4] + 24;
  const arp =
    Math.exp(-((beat * 2) % 1) * 9) *
    Math.sin(2 * Math.PI * hz(arpNote) * t) *
    0.018;
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  lowNoise = lowNoise * 0.98 + ((seed / 4294967296) * 2 - 1) * 0.02;
  const intro = t < 10 ? 1.2 : 1,
    fade = Math.min(1, t / 2, (seconds - t) / 3);
  const spoken = voices.some(
    (v) => t >= v.start - 0.2 && t < v.start + v.duration + 0.25,
  );
  const duck = spoken ? 0.68 : 1.64;
  const swell = [9, 30, 44, 60, 120, 150, 174].reduce(
    (a, b) => a + Math.exp(-(((t - b) / 0.8) ** 2)),
    0,
  );
  const whoosh = lowNoise * 0.4 * swell;
  left = (left + tick + arp + whoosh) * fade * duck * intro;
  right = (right + tick + arp + whoosh) * fade * duck * intro;
  pcm.writeInt16LE(Math.round(Math.max(-1, Math.min(1, left)) * 32767), i * 4);
  pcm.writeInt16LE(
    Math.round(Math.max(-1, Math.min(1, right)) * 32767),
    i * 4 + 2,
  );
}
const head = Buffer.alloc(44);
head.write("RIFF");
head.writeUInt32LE(36 + pcm.length, 4);
head.write("WAVEfmt ", 8);
head.writeUInt32LE(16, 16);
head.writeUInt16LE(1, 20);
head.writeUInt16LE(2, 22);
head.writeUInt32LE(sr, 24);
head.writeUInt32LE(sr * 4, 28);
head.writeUInt16LE(4, 32);
head.writeUInt16LE(16, 34);
head.write("data", 36);
head.writeUInt32LE(pcm.length, 40);
const wav = "/tmp/ghurni-original-score.wav";
writeFileSync(wav, Buffer.concat([head, pcm]));
const out = new URL(
  "../assets/audio/before-landfall-score.mp3",
  import.meta.url,
).pathname;
const result = spawnSync(
  "ffmpeg",
  [
    "-y",
    "-hide_banner",
    "-loglevel",
    "error",
    "-i",
    wav,
    "-codec:a",
    "libmp3lame",
    "-b:a",
    "192k",
    out,
  ],
  { stdio: "inherit" },
);
if (result.status !== 0) process.exit(result.status ?? 1);
console.log("Original 180-second score, with narration ducking:", out);
