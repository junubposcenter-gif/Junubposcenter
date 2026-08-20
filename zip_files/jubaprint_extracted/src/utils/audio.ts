// Audio Engine utilizing the Web Audio API for interactive sound synthesis.

class SynthEngine {
  private ctx: AudioContext | null = null;
  private masterVolume: GainNode | null = null;
  private delayNode: DelayNode | null = null;
  private delayFeedbackGain: GainNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private isEnabled: boolean = false;
  private volumeLevel: number = 0.4; // Initial safe volume level

  constructor() {
    // Lazy initialize on first interaction
  }

  public init() {
    if (this.ctx) return;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
      
      // Master Gain
      this.masterVolume = this.ctx.createGain();
      this.masterVolume.gain.setValueAtTime(this.volumeLevel, this.ctx.currentTime);

      // Delay Node (Space effect)
      this.delayNode = this.ctx.createDelay(2.0);
      this.delayNode.delayTime.setValueAtTime(0.35, this.ctx.currentTime);

      this.delayFeedbackGain = this.ctx.createGain();
      this.delayFeedbackGain.gain.setValueAtTime(0.5, this.ctx.currentTime);

      // Main Rezonant Lowpass Filter
      this.filterNode = this.ctx.createBiquadFilter();
      this.filterNode.type = 'lowpass';
      this.filterNode.frequency.setValueAtTime(1200, this.ctx.currentTime);
      this.filterNode.Q.setValueAtTime(2.0, this.ctx.currentTime);

      // Connect graph:
      // Sources -> Filter -> Master -> Output
      // Filter -> Delay -> Delay Feedback -> Delay (Feedback Loop) -> Master
      this.filterNode.connect(this.masterVolume);
      
      // Send some signals to the delay unit
      this.filterNode.connect(this.delayNode);
      this.delayNode.connect(this.delayFeedbackGain);
      this.delayFeedbackGain.connect(this.delayNode); // loop
      this.delayFeedbackGain.connect(this.masterVolume);

      this.masterVolume.connect(this.ctx.destination);
      this.isEnabled = true;
      console.log("Audio Engine successfully initialized");
    } catch (err) {
      console.error("Web Audio API not supported or initialization failed", err);
    }
  }

  public setVolume(volume: number) {
    this.volumeLevel = Math.max(0, Math.min(1, volume));
    if (this.masterVolume && this.ctx) {
      this.masterVolume.gain.linearRampToValueAtTime(this.volumeLevel, this.ctx.currentTime + 0.05);
    }
  }

  public getVolume(): number {
    return this.volumeLevel;
  }

  public toggleMute() {
    if (this.volumeLevel > 0) {
      this.setVolume(0);
    } else {
      this.setVolume(0.4);
    }
    return this.volumeLevel;
  }

  public resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Plays a note tailored to the specific character mashed
  public playKey(char: string) {
    this.init();
    this.resume();
    
    if (!this.ctx || !this.filterNode || this.volumeLevel === 0) return;

    const now = this.ctx.currentTime;
    const lowerChar = char.toLowerCase();

    // Customize sound based on character
    if (lowerChar === 'a') {
      // 'A' - Deep sub-bass pulse / kick drum
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(110, now); // A2 frequency
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.25); // Pitch sweep down
      
      gain.gain.setValueAtTime(1.0, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

      osc.connect(gain);
      gain.connect(this.filterNode);
      osc.start(now);
      osc.stop(now + 0.4);

    } else if (lowerChar === 'r') {
      // 'R' - Highly resonant laser/arpeggio chime
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now); // A4
      osc.frequency.setValueAtTime(554.37, now + 0.05); // C#5
      osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
      osc.frequency.setValueAtTime(880, now + 0.15); // A5

      gain.gain.setValueAtTime(0.6, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

      osc.connect(gain);
      gain.connect(this.filterNode);
      osc.start(now);
      osc.stop(now + 0.3);

    } else if (lowerChar === 'k') {
      // 'K' - Metallic percussion / snare noise snap
      const bufferSize = this.ctx.sampleRate * 0.12; // Short noise block
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      
      // Populate random white noise buffer
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noiseNode = this.ctx.createBufferSource();
      noiseNode.buffer = buffer;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(1500, now);
      noiseFilter.Q.setValueAtTime(3.0, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.7, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

      noiseNode.connect(noiseFilter);
      noiseFilter.connect(gain);
      gain.connect(this.filterNode);

      noiseNode.start(now);
      noiseNode.stop(now + 0.15);

    } else if (lowerChar === 's') {
      // 'S' - Suspended wash delay chords
      const freqSet = [220, 277.18, 329.63, 440]; // A major chord frequencies
      const randomPitch = freqSet[Math.floor(Math.random() * freqSet.length)] * 1.5;
      
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(randomPitch, now);
      
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.005, now + 0.65);

      osc.connect(gain);
      gain.connect(this.filterNode);
      osc.start(now);
      osc.stop(now + 0.7);

    } else {
      // Other keys - Pentatonic melodic synthesis based on letter code
      const code = lowerChar.charCodeAt(0) || 60;
      const noteOffset = (code - 97) % 15; // Map lower characters 0-25 to pentatonic tones
      const pentatonicScale = [130.81, 146.83, 164.81, 196.00, 220.00, 261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00];
      const targetFreq = pentatonicScale[Math.max(0, Math.min(pentatonicScale.length - 1, noteOffset))];

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(targetFreq, now);

      // Pitch glide for some extra flavor
      if (code % 3 === 0) {
        osc.frequency.exponentialRampToValueAtTime(targetFreq * 2, now + 0.2);
      }

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

      osc.connect(gain);
      gain.connect(this.filterNode);
      osc.start(now);
      osc.stop(now + 0.45);
    }
  }

  // Trigger high frequency blast on explosions
  public playExplosion() {
    this.init();
    this.resume();
    if (!this.ctx || !this.filterNode || this.volumeLevel === 0) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(250, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.5);

    gain.gain.setValueAtTime(0.8, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

    osc.connect(gain);
    gain.connect(this.filterNode);
    osc.start(now);
    osc.stop(now + 0.5);
  }
}

export const audio = new SynthEngine();
