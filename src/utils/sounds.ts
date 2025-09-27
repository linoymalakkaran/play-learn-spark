// Simple sound effects using Web Audio API
export class SoundEffects {
  private audioContext: AudioContext | null = null;

  constructor() {
    // Initialize AudioContext only when needed
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  private createTone(frequency: number, duration: number, type: OscillatorType = 'sine'): Promise<void> {
    return new Promise((resolve) => {
      if (!this.audioContext) {
        resolve();
        return;
      }

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
      oscillator.type = type;

      gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);

      setTimeout(resolve, duration * 1000);
    });
  }

  async playSuccess(): Promise<void> {
    if (!this.audioContext) return;
    
    // Play a cheerful ascending melody
    await this.createTone(523.25, 0.2); // C5
    await this.createTone(659.25, 0.2); // E5
    await this.createTone(783.99, 0.3); // G5
  }

  async playError(): Promise<void> {
    if (!this.audioContext) return;
    
    // Play a gentle descending tone
    await this.createTone(329.63, 0.3); // E4
    await this.createTone(293.66, 0.3); // D4
  }

  async playClick(): Promise<void> {
    if (!this.audioContext) return;
    
    // Play a short click sound
    await this.createTone(800, 0.1, 'square');
  }

  async playCheer(): Promise<void> {
    if (!this.audioContext) return;
    
    // Play celebration sounds
    await this.createTone(523.25, 0.15); // C5
    await this.createTone(659.25, 0.15); // E5
    await this.createTone(783.99, 0.15); // G5
    await this.createTone(1046.50, 0.3); // C6
  }

  async playMagic(): Promise<void> {
    if (!this.audioContext) return;
    
    // Play magical sparkle sound
    for (let i = 0; i < 3; i++) {
      await this.createTone(880 + i * 220, 0.1, 'triangle');
    }
  }
}

export const soundEffects = new SoundEffects();