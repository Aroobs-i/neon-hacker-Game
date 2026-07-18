// A tiny procedural synth engine built directly on the Web Audio API.
// Every sound effect in the game is generated at runtime — no audio files.

type Wave = OscillatorType;

class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxEnabled = true;
  private musicEnabled = true;
  private musicNodes: { stop: () => void } | null = null;

  private ensureCtx(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      if (!Ctx) return null;
      this.ctx = new Ctx();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.55;
      this.master.connect(this.ctx.destination);
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 0.12;
      this.musicGain.connect(this.master);
    }
    if (this.ctx.state === "suspended") this.ctx.resume();
    return this.ctx;
  }

  /** Must be called from a user gesture to unlock audio on mobile Safari etc. */
  unlock() {
    this.ensureCtx();
  }

  setSfxEnabled(v: boolean) {
    this.sfxEnabled = v;
  }
  setMusicEnabled(v: boolean) {
    this.musicEnabled = v;
    if (this.musicGain) this.musicGain.gain.value = v ? 0.12 : 0;
  }

  private tone(
    freq: number,
    duration: number,
    opts: {
      type?: Wave;
      gain?: number;
      slideTo?: number;
      delay?: number;
      attack?: number;
    } = {}
  ) {
    if (!this.sfxEnabled) return;
    const ctx = this.ensureCtx();
    if (!ctx || !this.master) return;
    const t0 = ctx.currentTime + (opts.delay ?? 0);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = opts.type ?? "sine";
    osc.frequency.setValueAtTime(freq, t0);
    if (opts.slideTo) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(1, opts.slideTo), t0 + duration);
    }
    const peak = opts.gain ?? 0.25;
    const attack = opts.attack ?? 0.005;
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(peak, t0 + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start(t0);
    osc.stop(t0 + duration + 0.05);
  }

  private noiseBurst(duration: number, gain = 0.18, delay = 0) {
    if (!this.sfxEnabled) return;
    const ctx = this.ensureCtx();
    if (!ctx || !this.master) return;
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const g = ctx.createGain();
    g.gain.value = gain;
    const filter = ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = 900;
    src.connect(filter);
    filter.connect(g);
    g.connect(this.master);
    src.start(ctx.currentTime + delay);
  }

  nodeConnect(comboLevel: number) {
    const base = 420 + Math.min(comboLevel, 20) * 26;
    this.tone(base, 0.14, { type: "triangle", gain: 0.22, slideTo: base * 1.6, attack: 0.002 });
  }

  wrongMove() {
    this.tone(180, 0.22, { type: "sawtooth", gain: 0.22, slideTo: 70 });
    this.noiseBurst(0.12, 0.12);
  }

  firewallHit() {
    this.tone(140, 0.3, { type: "square", gain: 0.25, slideTo: 40 });
    this.noiseBurst(0.2, 0.2);
  }

  bonusPickup() {
    [660, 880, 1100].forEach((f, i) =>
      this.tone(f, 0.16, { type: "triangle", gain: 0.2, delay: i * 0.05, attack: 0.003 })
    );
  }

  levelComplete() {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
      this.tone(f, 0.22, { type: "sine", gain: 0.25, delay: i * 0.075 })
    );
  }

  gameOver() {
    [400, 320, 240, 160].forEach((f, i) =>
      this.tone(f, 0.35, { type: "sawtooth", gain: 0.2, delay: i * 0.12, slideTo: f * 0.6 })
    );
  }

  achievementUnlock() {
    [784, 988, 1175, 1568].forEach((f, i) =>
      this.tone(f, 0.28, { type: "triangle", gain: 0.22, delay: i * 0.06 })
    );
  }

  uiClick() {
    this.tone(700, 0.06, { type: "square", gain: 0.08, attack: 0.001 });
  }

  uiHover() {
    this.tone(1200, 0.03, { type: "sine", gain: 0.04, attack: 0.001 });
  }

  countdownTick(urgent: boolean) {
    this.tone(urgent ? 900 : 600, 0.08, { type: "square", gain: urgent ? 0.15 : 0.08 });
  }

  screenShakeThud() {
    this.noiseBurst(0.08, 0.15);
  }

  /** Ambient generative background pad — subtle detuned drones, safe to loop indefinitely. */
  startMusic() {
    if (this.musicNodes || !this.musicEnabled) return;
    const ctx = this.ensureCtx();
    if (!ctx || !this.musicGain) return;
    const notes = [98, 110, 146.83, 164.81]; // low cyberpunk drone cluster
    const oscs: OscillatorNode[] = [];
    const gains: GainNode[] = [];
    notes.forEach((f, i) => {
      const osc = ctx.createOscillator();
      osc.type = i % 2 === 0 ? "sine" : "triangle";
      osc.frequency.value = f;
      const g = ctx.createGain();
      g.gain.value = 0.0;
      g.gain.setTargetAtTime(1 / notes.length, ctx.currentTime + i * 0.6, 2);
      osc.connect(g);
      g.connect(this.musicGain!);
      osc.start();
      oscs.push(osc);
      gains.push(g);
    });
    this.musicNodes = {
      stop: () => {
        oscs.forEach((o) => {
          try {
            o.stop();
          } catch {}
        });
      },
    };
  }

  stopMusic() {
    this.musicNodes?.stop();
    this.musicNodes = null;
  }
}

export const audioEngine = new AudioEngine();
