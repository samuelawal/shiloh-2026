// Background audio for the experience. If a licensed track is placed at
// SOUNDTRACK_FILE it is played; otherwise a gentle worship pad is synthesised
// with the Web Audio API so the experience never ships with unlicensed music.

export const SOUNDTRACK_FILE = { src: "/experience/soundtrack.mp3", title: "Shiloh 2026 Theme" };
export const SYNTH_TITLE = "Shiloh Ambience";

// D – Bm – G – A, voiced around middle C.
const CHORDS = [
  [146.83, 220.0, 293.66, 369.99],
  [123.47, 246.94, 293.66, 369.99],
  [98.0, 246.94, 293.66, 392.0],
  [110.0, 220.0, 277.18, 329.63],
];
const CHORD_SECONDS = 4.5;

export class Soundtrack {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private element: HTMLAudioElement | null = null;
  private timer: number | null = null;
  title = SYNTH_TITLE;

  /** Must be called from a user gesture so browsers allow playback. */
  async start() {
    const hasFile = await fetch(SOUNDTRACK_FILE.src, { method: "HEAD" })
      .then((r) => r.ok && (r.headers.get("content-type") ?? "").startsWith("audio"))
      .catch(() => false);

    if (hasFile) {
      this.element = new Audio(SOUNDTRACK_FILE.src);
      this.element.loop = true;
      this.element.volume = 0.7;
      this.title = SOUNDTRACK_FILE.title;
      await this.element.play().catch(() => {});
      return;
    }

    const ctx = new AudioContext();
    this.ctx = ctx;
    this.master = ctx.createGain();
    this.master.gain.value = 0;
    this.master.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 3);

    // Simple feedback delay as a cheap reverb tail.
    const delay = ctx.createDelay(1);
    delay.delayTime.value = 0.38;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.42;
    const wet = ctx.createGain();
    wet.gain.value = 0.35;
    delay.connect(feedback).connect(delay);
    delay.connect(wet).connect(ctx.destination);
    this.master.connect(ctx.destination);
    this.master.connect(delay);

    let index = 0;
    const play = () => {
      this.playChord(CHORDS[index % CHORDS.length]);
      index++;
    };
    play();
    this.timer = window.setInterval(play, CHORD_SECONDS * 1000);
  }

  private playChord(freqs: number[]) {
    const { ctx, master } = this;
    if (!ctx || !master) return;
    const now = ctx.currentTime;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(500, now);
    filter.frequency.linearRampToValueAtTime(1300, now + CHORD_SECONDS * 0.6);
    filter.frequency.linearRampToValueAtTime(700, now + CHORD_SECONDS + 1.5);
    filter.connect(master);

    freqs.forEach((freq, i) => {
      for (const detune of [-6, 6]) {
        const osc = ctx.createOscillator();
        osc.type = i === 0 ? "sine" : "sawtooth";
        osc.frequency.value = freq;
        osc.detune.value = detune;
        const gain = ctx.createGain();
        const level = i === 0 ? 0.16 : 0.035;
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(level, now + 1.4);
        gain.gain.setValueAtTime(level, now + CHORD_SECONDS - 0.2);
        gain.gain.linearRampToValueAtTime(0, now + CHORD_SECONDS + 1.6);
        osc.connect(gain).connect(filter);
        osc.start(now);
        osc.stop(now + CHORD_SECONDS + 1.7);
      }
    });
  }

  /** A rising swell of filtered noise, used as the light travels in. */
  swell(seconds: number) {
    const { ctx, master } = this;
    if (!ctx || !master) return;
    const now = ctx.currentTime;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.Q.value = 0.8;
    filter.frequency.setValueAtTime(200, now);
    filter.frequency.exponentialRampToValueAtTime(2400, now + seconds);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.12, now + seconds * 0.9);
    gain.gain.linearRampToValueAtTime(0, now + seconds);
    noise.connect(filter).connect(gain).connect(master);
    noise.start(now);
  }

  /** A low, warm hit for big moments. */
  boom() {
    const { ctx, master } = this;
    if (!ctx || !master) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.exponentialRampToValueAtTime(38, now + 1.6);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.55, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 2.4);
    osc.connect(gain).connect(master);
    osc.start(now);
    osc.stop(now + 2.5);
  }

  setMuted(muted: boolean) {
    if (this.element) this.element.muted = muted;
    if (this.ctx && this.master) this.master.gain.setTargetAtTime(muted ? 0 : 0.5, this.ctx.currentTime, 0.2);
  }

  stop() {
    if (this.timer) window.clearInterval(this.timer);
    this.element?.pause();
    void this.ctx?.close();
    this.ctx = null;
    this.master = null;
    this.element = null;
  }
}
