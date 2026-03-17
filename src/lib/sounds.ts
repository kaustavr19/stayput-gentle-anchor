// Web Audio API sound utilities — no audio files required.

function createCtx(): AudioContext | null {
  try {
    return new AudioContext();
  } catch {
    return null;
  }
}

/** Short gentle bell chime — used for 30-min open-mode milestones. */
export function playDing(): void {
  const ctx = createCtx();
  if (!ctx) return;

  // Two sine waves slightly apart for a warm bell character
  const pairs = [
    { freq: 880, gain: 0.20 },   // A5
    { freq: 1108.73, gain: 0.12 }, // C#6
  ];

  pairs.forEach(({ freq, gain }, i) => {
    const osc = ctx.createOscillator();
    const vol = ctx.createGain();
    osc.connect(vol);
    vol.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.value = freq;
    const t = ctx.currentTime + i * 0.06;
    vol.gain.setValueAtTime(gain, t);
    vol.gain.exponentialRampToValueAtTime(0.001, t + 1.8);
    osc.start(t);
    osc.stop(t + 1.9);
  });

  setTimeout(() => ctx.close(), 3000);
}

/**
 * Ascending completion melody (~5 s) — played at the end of a
 * Pomodoro (25 min) or Deep Work (90 min) timer.
 */
export function playCompletionTune(): void {
  const ctx = createCtx();
  if (!ctx) return;

  // C major pentatonic ascent then a warm closing chord
  const melody: { freq: number; start: number; dur: number; gain: number }[] = [
    { freq: 523.25, start: 0.00, dur: 0.45, gain: 0.18 }, // C5
    { freq: 659.25, start: 0.50, dur: 0.45, gain: 0.18 }, // E5
    { freq: 783.99, start: 1.00, dur: 0.45, gain: 0.18 }, // G5
    { freq: 880.00, start: 1.50, dur: 0.45, gain: 0.18 }, // A5
    { freq: 1046.50, start: 2.00, dur: 0.90, gain: 0.20 }, // C6 (held)
    // Closing chord — E5 + G5 + C6 together
    { freq: 659.25, start: 3.20, dur: 1.50, gain: 0.14 }, // E5
    { freq: 783.99, start: 3.20, dur: 1.50, gain: 0.14 }, // G5
    { freq: 1046.50, start: 3.20, dur: 1.80, gain: 0.16 }, // C6 (fade out)
  ];

  melody.forEach(({ freq, start, dur, gain }) => {
    const osc = ctx.createOscillator();
    const vol = ctx.createGain();
    osc.connect(vol);
    vol.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.value = freq;
    const t = ctx.currentTime + start;
    vol.gain.setValueAtTime(0, t);
    vol.gain.linearRampToValueAtTime(gain, t + 0.04);
    vol.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.start(t);
    osc.stop(t + dur + 0.1);
  });

  setTimeout(() => ctx.close(), 7000);
}
