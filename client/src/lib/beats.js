// Free music for the Video Maker: original beats synthesized live with the Web Audio API.
// Nothing is sampled or downloaded, so every track is 100% original and copyright-free.

export const BEAT_STYLES = {
  lofi: { label: 'Lo-fi chill', emoji: '☕', bpm: 78, swing: 0.12, key: 57, progression: [[0, 3, 7, 10], [-4, 0, 3, 7], [-7, -3, 0, 3], [-2, 2, 5, 9]], kick: 'x...x.....x.....', snare: '....x.......x...', hat: 'x.x.x.x.x.x.x.x.', bassWave: 'triangle', padWave: 'triangle', vinyl: true, cutoff: 1400 },
  pop: { label: 'Upbeat pop', emoji: '🌈', bpm: 116, swing: 0, key: 60, progression: [[0, 4, 7], [7, 11, 14], [9, 12, 16], [5, 9, 12]], kick: 'x...x...x...x...', snare: '....x.......x...', hat: '..x...x...x...x.', bassWave: 'sawtooth', padWave: 'sawtooth', arp: true, cutoff: 2600 },
  hiphop: { label: 'Hip-hop', emoji: '🎤', bpm: 90, swing: 0.08, key: 50, progression: [[0, 3, 7], [0, 3, 7], [-4, 0, 3], [-2, 2, 5]], kick: 'x.....x...x.....', snare: '....x.......x...', hat: 'x.xxx.x.x.xxx.x.', bassWave: 'sine', padWave: 'triangle', cutoff: 1800 },
  house: { label: 'Dance', emoji: '🪩', bpm: 124, swing: 0, key: 57, progression: [[0, 3, 7, 10], [-2, 2, 5, 9], [-4, 0, 3, 7], [-5, -2, 2, 5]], kick: 'x...x...x...x...', snare: '....x.......x...', hat: '..x...x...x...x.', bassWave: 'sawtooth', padWave: 'square', arp: true, cutoff: 3200 },
  cinematic: { label: 'Cinematic', emoji: '🎬', bpm: 70, swing: 0, key: 50, progression: [[0, 7, 12, 15], [-4, 3, 8, 12], [-7, 0, 5, 9], [-5, 2, 7, 10]], kick: 'x.......x.......', snare: '........x.......', hat: '................', bassWave: 'sine', padWave: 'sawtooth', cutoff: 1200 },
  corporate: { label: 'Bright & clean', emoji: '💼', bpm: 104, swing: 0, key: 62, progression: [[0, 4, 7, 11], [5, 9, 12, 16], [9, 12, 16, 19], [7, 11, 14, 17]], kick: 'x.......x.......', snare: '....x.......x...', hat: 'x.x.x.x.x.x.x.x.', bassWave: 'triangle', padWave: 'triangle', arp: true, cutoff: 2400 },
};

const freq = (midi) => 440 * 2 ** ((midi - 69) / 12);

function noiseBuffer(ctx) {
  if (ctx.__noise) return ctx.__noise;
  const buf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  ctx.__noise = buf;
  return buf;
}

function env(gain, t, a, peak, decay, sustain = 0.0001) {
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(peak, t + a);
  gain.gain.exponentialRampToValueAtTime(Math.max(sustain, 0.0001), t + a + decay);
}

function kick(ctx, out, t) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.frequency.setValueAtTime(140, t);
  o.frequency.exponentialRampToValueAtTime(45, t + 0.12);
  env(g, t, 0.002, 1, 0.3);
  o.connect(g).connect(out);
  o.start(t);
  o.stop(t + 0.35);
}

function snare(ctx, out, t) {
  const n = ctx.createBufferSource();
  n.buffer = noiseBuffer(ctx);
  const f = ctx.createBiquadFilter();
  f.type = 'bandpass';
  f.frequency.value = 1800;
  const g = ctx.createGain();
  env(g, t, 0.002, 0.45, 0.18);
  n.connect(f).connect(g).connect(out);
  n.start(t);
  n.stop(t + 0.25);
}

function hat(ctx, out, t, open) {
  const n = ctx.createBufferSource();
  n.buffer = noiseBuffer(ctx);
  const f = ctx.createBiquadFilter();
  f.type = 'highpass';
  f.frequency.value = 7000;
  const g = ctx.createGain();
  env(g, t, 0.001, 0.16, open ? 0.12 : 0.04);
  n.connect(f).connect(g).connect(out);
  n.start(t);
  n.stop(t + 0.2);
}

function tone(ctx, out, t, midi, dur, wave, peak, cutoff, detune = 0) {
  const o = ctx.createOscillator();
  o.type = wave;
  o.frequency.value = freq(midi);
  o.detune.value = detune;
  const f = ctx.createBiquadFilter();
  f.type = 'lowpass';
  f.frequency.value = cutoff;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + Math.min(0.08, dur / 4));
  g.gain.setValueAtTime(peak, t + dur * 0.7);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(f).connect(g).connect(out);
  o.start(t);
  o.stop(t + dur + 0.05);
}

/**
 * Schedule a beat on `ctx` into `destination`, starting at `start` for `duration`
 * seconds. Returns the master gain node (disconnect it to stop early).
 */
export function scheduleBeat(ctx, destination, styleKey, start, duration, volume = 0.8) {
  const s = BEAT_STYLES[styleKey] ?? BEAT_STYLES.pop;
  const master = ctx.createGain();
  master.gain.setValueAtTime(0.0001, start);
  master.gain.exponentialRampToValueAtTime(volume * 0.5, start + 0.6);
  master.gain.setValueAtTime(volume * 0.5, Math.max(start + 0.7, start + duration - 1.2));
  master.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  master.connect(destination);

  const step = 60 / s.bpm / 4; // 16th notes
  const steps = Math.ceil(duration / step);
  for (let i = 0; i < steps; i++) {
    const swing = i % 2 ? s.swing * step : 0;
    const t = start + i * step + swing;
    if (t > start + duration) break;
    const p = i % 16;
    const bar = Math.floor(i / 16);
    const chord = s.progression[bar % s.progression.length];
    if (s.kick[p] === 'x') kick(ctx, master, t);
    if (s.snare[p] === 'x') snare(ctx, master, t);
    if (s.hat[p] === 'x') hat(ctx, master, t, p === 14);
    if (p === 0) {
      chord.forEach((n, k) => tone(ctx, master, t, s.key + n, step * 16, s.padWave, 0.06, s.cutoff, k % 2 ? 7 : -7));
    }
    if (p % 4 === 0) tone(ctx, master, t, s.key - 12 + chord[0], step * 3.5, s.bassWave, 0.22, 600);
    if (s.arp && p % 2 === 0) tone(ctx, master, t, s.key + 12 + chord[(p / 2) % chord.length], step * 1.6, 'triangle', 0.05, 4000);
  }
  if (s.vinyl) {
    const n = ctx.createBufferSource();
    n.buffer = noiseBuffer(ctx);
    n.loop = true;
    const f = ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = 3000;
    const g = ctx.createGain();
    g.gain.value = 0.015;
    n.connect(f).connect(g).connect(master);
    n.start(start);
    n.stop(start + duration);
  }
  return master;
}

/** Play a short preview of a style through the speakers. Returns stop(). */
export function previewBeat(styleKey, seconds = 12, volume = 0.8) {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  const ctx = new Ctx();
  const node = scheduleBeat(ctx, ctx.destination, styleKey, ctx.currentTime + 0.05, seconds, volume);
  const timer = setTimeout(() => ctx.close().catch(() => {}), (seconds + 0.5) * 1000);
  return () => {
    clearTimeout(timer);
    node.disconnect();
    ctx.close().catch(() => {});
  };
}
