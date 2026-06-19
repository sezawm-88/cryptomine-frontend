"use client"

// Lightweight Web Audio engine — procedural ambient music + game SFX.
// No external assets; everything is synthesized on the fly.

type Voice = { osc: OscillatorNode; gain: GainNode }

class AudioEngine {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private musicGain: GainNode | null = null
  private musicVoices: Voice[] = []
  private arpTimer: number | null = null
  private step = 0
  private _musicOn = false
  private _muted = false

  private ensure() {
    if (typeof window === "undefined") return null
    if (!this.ctx) {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext
      this.ctx = new Ctx()
      this.master = this.ctx.createGain()
      this.master.gain.value = this._muted ? 0 : 0.9
      this.master.connect(this.ctx.destination)
    }
    if (this.ctx.state === "suspended") void this.ctx.resume()
    return this.ctx
  }

  get musicOn() {
    return this._musicOn
  }
  get muted() {
    return this._muted
  }

  setMuted(m: boolean) {
    this._muted = m
    if (this.master && this.ctx) {
      this.master.gain.linearRampToValueAtTime(m ? 0 : 0.9, this.ctx.currentTime + 0.2)
    }
  }

  // ----- ambient music: warm pad chord + slow emerald arpeggio -----
  startMusic() {
    const ctx = this.ensure()
    if (!ctx || !this.master || this._musicOn) return
    this._musicOn = true

    this.musicGain = ctx.createGain()
    this.musicGain.gain.value = 0
    this.musicGain.connect(this.master)
    this.musicGain.gain.linearRampToValueAtTime(0.16, ctx.currentTime + 2)

    // lush detuned pad (A minor 9 vibe)
    const pad = [110, 164.81, 220, 277.18] // A2 E3 A3 C#4
    pad.forEach((f, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = i % 2 === 0 ? "sawtooth" : "triangle"
      osc.frequency.value = f
      osc.detune.value = (i - 1.5) * 6
      gain.gain.value = 0.18 / pad.length
      const lp = ctx.createBiquadFilter()
      lp.type = "lowpass"
      lp.frequency.value = 900
      osc.connect(gain)
      gain.connect(lp)
      lp.connect(this.musicGain!)
      osc.start()
      this.musicVoices.push({ osc, gain })
    })

    // slow arpeggio sequencer
    const scale = [440, 523.25, 659.25, 880, 659.25, 523.25] // A C E A E C
    const tick = () => {
      if (!this.ctx || !this.musicGain) return
      const t = this.ctx.currentTime
      const f = scale[this.step % scale.length]
      const o = this.ctx.createOscillator()
      const g = this.ctx.createGain()
      o.type = "sine"
      o.frequency.value = f
      g.gain.setValueAtTime(0, t)
      g.gain.linearRampToValueAtTime(0.07, t + 0.04)
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.9)
      o.connect(g)
      g.connect(this.musicGain)
      o.start(t)
      o.stop(t + 1)
      this.step++
      this.arpTimer = window.setTimeout(tick, 520)
    }
    tick()
  }

  stopMusic() {
    if (!this.ctx || !this._musicOn) return
    this._musicOn = false
    const t = this.ctx.currentTime
    if (this.musicGain) this.musicGain.gain.linearRampToValueAtTime(0, t + 0.6)
    if (this.arpTimer) {
      clearTimeout(this.arpTimer)
      this.arpTimer = null
    }
    const voices = this.musicVoices
    this.musicVoices = []
    setTimeout(() => {
      voices.forEach((v) => {
        try {
          v.osc.stop()
        } catch {}
      })
    }, 700)
  }

  toggleMusic() {
    if (this._musicOn) this.stopMusic()
    else this.startMusic()
    return this._musicOn
  }

  // ----- one-shot SFX -----
  private blip(freq: number, dur: number, type: OscillatorType = "sine", vol = 0.25) {
    const ctx = this.ensure()
    if (!ctx || !this.master) return
    const t = ctx.currentTime
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = type
    o.frequency.setValueAtTime(freq, t)
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(vol, t + 0.01)
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    o.connect(g)
    g.connect(this.master)
    o.start(t)
    o.stop(t + dur + 0.05)
  }

  click() {
    this.blip(320, 0.06, "square", 0.12)
  }

  // rising pitch as the streak grows
  reveal(streak: number) {
    const base = 520 + Math.min(streak, 14) * 45
    this.blip(base, 0.18, "triangle", 0.22)
    setTimeout(() => this.blip(base * 1.5, 0.14, "sine", 0.16), 60)
  }

  explode() {
    const ctx = this.ensure()
    if (!ctx || !this.master) return
    const t = ctx.currentTime
    // noise burst
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length)
    const src = ctx.createBufferSource()
    src.buffer = buf
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.5, t)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5)
    const lp = ctx.createBiquadFilter()
    lp.type = "lowpass"
    lp.frequency.setValueAtTime(1200, t)
    lp.frequency.exponentialRampToValueAtTime(120, t + 0.5)
    src.connect(lp)
    lp.connect(g)
    g.connect(this.master)
    src.start(t)
    // descending tone
    const o = ctx.createOscillator()
    const og = ctx.createGain()
    o.type = "sawtooth"
    o.frequency.setValueAtTime(180, t)
    o.frequency.exponentialRampToValueAtTime(50, t + 0.5)
    og.gain.setValueAtTime(0.3, t)
    og.gain.exponentialRampToValueAtTime(0.0001, t + 0.5)
    o.connect(og)
    og.connect(this.master)
    o.start(t)
    o.stop(t + 0.55)
  }

  cashout() {
    const notes = [523.25, 659.25, 783.99, 1046.5]
    notes.forEach((f, i) => setTimeout(() => this.blip(f, 0.25, "triangle", 0.22), i * 80))
  }

  bet() {
    this.blip(160, 0.12, "sine", 0.2)
    setTimeout(() => this.blip(240, 0.12, "sine", 0.18), 70)
  }
}

let _engine: AudioEngine | null = null
export function getAudio(): AudioEngine {
  if (!_engine) _engine = new AudioEngine()
  return _engine
}
