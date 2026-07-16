// Web Audio API Synthesizer for retro/festive arcade sound effects
class SoundSynth {
  private ctx: AudioContext | null = null;
  private volumeNode: GainNode | null = null;
  private isSoundEnabled = true;
  private currentVolume = 0.5;

  private init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.volumeNode = this.ctx.createGain();
      this.volumeNode.gain.value = this.currentVolume;
      this.volumeNode.connect(this.ctx.destination);
    } catch (e) {
      console.warn("Web Audio API is not supported in this browser", e);
    }
  }

  public setEnabled(enabled: boolean) {
    this.isSoundEnabled = enabled;
  }

  public setVolume(volume: number) {
    this.currentVolume = Math.max(0, Math.min(1, volume));
    if (this.volumeNode) {
      this.volumeNode.gain.value = this.currentVolume;
    }
  }

  private resume() {
    this.init();
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  /**
   * Plays a crisp mechanical ticking sound
   */
  public playTick() {
    if (!this.isSoundEnabled) return;
    this.resume();
    if (!this.ctx || !this.volumeNode) return;

    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = "sine";
    // Quick drop in frequency mimics a wooden click
    osc.frequency.setValueAtTime(350, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.05);

    gainNode.gain.setValueAtTime(0.6, this.ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.04);

    osc.connect(gainNode);
    gainNode.connect(this.volumeNode);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  /**
   * Plays a short drumroll-like acceleration click sequence or buzz
   */
  public playDrumroll(durationMs: number) {
    if (!this.isSoundEnabled) return;
    this.resume();
    if (!this.ctx || !this.volumeNode) return null;

    // Create a low rumble using a square or triangle wave with low frequency
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(80, this.ctx.currentTime);
    // Vibrato effect for rolling feel
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.value = 16; // 16Hz
    lfoGain.gain.value = 15; // frequency swing

    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, this.ctx.currentTime + 0.2);
    gainNode.gain.linearRampToValueAtTime(0.3, this.ctx.currentTime + (durationMs / 1000) - 0.5);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + (durationMs / 1000));

    osc.connect(gainNode);
    gainNode.connect(this.volumeNode);

    lfo.start();
    osc.start();

    const stopTime = this.ctx.currentTime + (durationMs / 1000);
    lfo.stop(stopTime);
    osc.stop(stopTime);

    return {
      stop: () => {
        try {
          osc.stop();
          lfo.stop();
        } catch (_) {}
      }
    };
  }

  /**
   * Plays a triumphant brass-like major chord fanfare
   */
  public playFanfare() {
    if (!this.isSoundEnabled) return;
    this.resume();
    if (!this.ctx || !this.volumeNode) return;

    const now = this.ctx.currentTime;
    const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5 (C Major Chord)
    
    notes.forEach((freq, index) => {
      if (!this.ctx || !this.volumeNode) return;
      
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();
      const delay = index * 0.12;

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now + delay);

      // Add a bit of brass vibrato/detune
      const subOsc = this.ctx.createOscillator();
      subOsc.type = "sawtooth";
      subOsc.frequency.setValueAtTime(freq + 2, now + delay);
      const subGain = this.ctx.createGain();
      subGain.gain.setValueAtTime(0.05, now + delay);

      // Main note gain envelope
      gainNode.gain.setValueAtTime(0, now + delay);
      gainNode.gain.linearRampToValueAtTime(0.18, now + delay + 0.05);
      gainNode.gain.setValueAtTime(0.18, now + delay + 0.4);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + delay + 1.2);

      osc.connect(gainNode);
      subOsc.connect(subGain);
      subGain.connect(gainNode);
      gainNode.connect(this.volumeNode);

      osc.start(now + delay);
      subOsc.start(now + delay);

      osc.stop(now + delay + 1.2);
      subOsc.stop(now + delay + 1.2);
    });

    // Glitter sparkle effect at the end
    setTimeout(() => {
      this.playSparkle();
    }, 450);
  }

  private playSparkle() {
    if (!this.isSoundEnabled || !this.ctx || !this.volumeNode) return;
    const now = this.ctx.currentTime;
    for (let i = 0; i < 8; i++) {
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();
      const delay = i * 0.08;
      const freq = 1200 + Math.random() * 800;

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + delay);

      gainNode.gain.setValueAtTime(0, now + delay);
      gainNode.gain.linearRampToValueAtTime(0.08, now + delay + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.3);

      osc.connect(gainNode);
      gainNode.connect(this.volumeNode);

      osc.start(now + delay);
      osc.stop(now + delay + 0.3);
    }
  }
}

export const audioSynth = new SoundSynth();
export default audioSynth;
