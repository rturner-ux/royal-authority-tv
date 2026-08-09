// Short two-note chime for incoming DM notifications, synthesized directly
// via the Web Audio API rather than shipping an audio file -- no asset to
// host, no licensing question, and it's a handful of lines either way.
export function playMessageNotificationSound() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const notes: { freq: number; start: number; duration: number }[] = [
      { freq: 880, start: 0, duration: 0.12 },
      { freq: 1318.5, start: 0.1, duration: 0.18 },
    ];

    for (const { freq, start, duration } of notes) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, now + start);
      gain.gain.linearRampToValueAtTime(0.18, now + start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + start + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + start);
      osc.stop(now + start + duration + 0.02);
    }

    setTimeout(() => ctx.close(), 500);
  } catch {
    // Autoplay restrictions or no Web Audio support -- the visual toast
    // still shows, so this is a non-critical enhancement.
  }
}
