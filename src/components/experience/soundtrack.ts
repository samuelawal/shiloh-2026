// Background audio for the experience: Bishop David O. Oyedepo's Shiloh 2026
// announcement mixed over a worship pad synthesised with the Web Audio API.
// The pad is voiced in C♯ minor to sit under the voice, and it ducks while he
// speaks and swells back in his pauses. The intro timeline (timeline.ts) is cut
// to the phrase breaks in this recording.

export const VOICE = { src: "/experience/shiloh-voice.m4a", title: "Bishop David O. Oyedepo · Shiloh 2026" };
export const SYNTH_TITLE = "Shiloh Ambience";

// C♯m – A – E – B
const CHORDS = [
  [69.3, 207.65, 277.18, 329.63],
  [55.0, 220.0, 277.18, 329.63],
  [82.41, 246.94, 329.63, 415.3],
  [61.74, 246.94, 311.13, 369.99],
];
const CHORD_SECONDS = 4.5;
const PAD_LEVEL = 0.5;
const PAD_UNDER_VOICE = 0.16;

export class Soundtrack {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private pad: GainNode | null = null;
  private voiceGain: GainNode | null = null;
  private voiceBuffer: AudioBuffer | null = null;
  private voiceSource: AudioBufferSourceNode | null = null;
  private analyser: AnalyserNode | null = null;
  private chordTimer: number | null = null;
  private duckTimer: number | null = null;
  title = SYNTH_TITLE;

  /**
   * Must be called from a user gesture so browsers allow playback. Starts the
   * pad straight away and resolves once the voice is decoded and ready.
   */
  async start() {
    const ctx = new AudioContext();
    this.ctx = ctx;
    this.master = ctx.createGain();
    this.master.connect(ctx.destination);

    this.pad = ctx.createGain();
    this.pad.gain.value = 0;
    this.pad.gain.linearRampToValueAtTime(PAD_LEVEL, ctx.currentTime + 3);

    // Simple feedback delay as a cheap reverb tail on the pad.
    const delay = ctx.createDelay(1);
    delay.delayTime.value = 0.38;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.42;
    const wet = ctx.createGain();
    wet.gain.value = 0.35;
    delay.connect(feedback).connect(delay);
    delay.connect(wet).connect(this.master);
    this.pad.connect(this.master);
    this.pad.connect(delay);

    let index = 0;
    const play = () => {
      this.playChord(CHORDS[index % CHORDS.length]);
      index++;
    };
    play();
    this.chordTimer = window.setInterval(play, CHORD_SECONDS * 1000);

    try {
      const response = await fetch(VOICE.src);
      if (!response.ok) throw new Error(String(response.status));
      this.voiceBuffer = await ctx.decodeAudioData(await response.arrayBuffer());
      this.title = VOICE.title;
    } catch {
      // Without the voice the pad still plays on its own.
    }
  }

  /** Starts the voice now. Call this at the same moment the intro starts. */
  playVoice() {
    const { ctx, master, voiceBuffer } = this;
    if (!ctx || !master || !voiceBuffer || this.voiceSource) return;

    const source = ctx.createBufferSource();
    source.buffer = voiceBuffer;
    this.voiceGain = ctx.createGain();
    this.voiceGain.gain.value = 1;
    this.analyser = ctx.createAnalyser();
    this.analyser.fftSize = 1024;
    source.connect(this.voiceGain).connect(master);
    source.connect(this.analyser);
    source.onended = () => {
      if (this.duckTimer) window.clearInterval(this.duckTimer);
      this.duckTimer = null;
      this.pad?.gain.setTargetAtTime(PAD_LEVEL, ctx.currentTime, 1.2);
    };
    source.start();
    this.voiceSource = source;

    // Side-chain the pad to the voice: down while he speaks, up in the pauses.
    const samples = new Float32Array(this.analyser.fftSize);
    this.duckTimer = window.setInterval(() => {
      if (!this.analyser || !this.pad) return;
      this.analyser.getFloatTimeDomainData(samples);
      let sum = 0;
      for (const s of samples) sum += s * s;
      const speaking = Math.min(1, Math.sqrt(sum / samples.length) * 12);
      const target = PAD_LEVEL - (PAD_LEVEL - PAD_UNDER_VOICE) * speaking;
      this.pad.gain.setTargetAtTime(target, ctx.currentTime, speaking > 0.3 ? 0.08 : 0.45);
    }, 50);
  }

  private playChord(freqs: number[]) {
    const { ctx, pad } = this;
    if (!ctx || !pad) return;
    const now = ctx.currentTime;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(450, now);
    filter.frequency.linearRampToValueAtTime(1100, now + CHORD_SECONDS * 0.6);
    filter.frequency.linearRampToValueAtTime(600, now + CHORD_SECONDS + 1.5);
    filter.connect(pad);

    freqs.forEach((freq, i) => {
      for (const detune of [-6, 6]) {
        const osc = ctx.createOscillator();
        osc.type = i === 0 ? "sine" : "sawtooth";
        osc.frequency.value = freq;
        osc.detune.value = detune;
        const gain = ctx.createGain();
        const level = i === 0 ? 0.16 : 0.03;
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
    const { ctx, pad } = this;
    if (!ctx || !pad) return;
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
    gain.gain.linearRampToValueAtTime(0.1, now + seconds * 0.9);
    gain.gain.linearRampToValueAtTime(0, now + seconds);
    noise.connect(filter).connect(gain).connect(this.master!);
    noise.start(now);
  }

  /** A low, warm hit for big moments, pitched to C♯. */
  boom() {
    const { ctx, master } = this;
    if (!ctx || !master) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(138.59, now);
    osc.frequency.exponentialRampToValueAtTime(34.65, now + 1.6);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 2.4);
    osc.connect(gain).connect(master);
    osc.start(now);
    osc.stop(now + 2.5);
  }

  setMuted(muted: boolean) {
    if (this.ctx && this.master) this.master.gain.setTargetAtTime(muted ? 0 : 1, this.ctx.currentTime, 0.15);
  }

  stop() {
    if (this.chordTimer) window.clearInterval(this.chordTimer);
    if (this.duckTimer) window.clearInterval(this.duckTimer);
    this.voiceSource?.stop();
    void this.ctx?.close();
    this.ctx = null;
    this.master = null;
    this.pad = null;
    this.voiceSource = null;
  }
}
