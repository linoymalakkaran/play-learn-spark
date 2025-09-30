// Simplified sounds utility - Audio context initialized only on user interaction
export class SoundEffects {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;
  private isInitialized: boolean = false;

  constructor() {
    // Don't create AudioContext immediately to avoid console warnings
  }

  private async initializeAudioContext(): Promise<void> {
    if (this.isInitialized || typeof window === 'undefined') {
      return;
    }

    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Resume AudioContext if it's suspended (requires user gesture)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      
      this.isInitialized = true;
    } catch (error) {
      console.warn('Failed to initialize AudioContext:', error);
      this.enabled = false;
    }
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  private async createTone(frequency: number, duration: number): Promise<void> {
    if (!this.enabled) return;

    try {
      // Initialize AudioContext on first use
      await this.initializeAudioContext();
      if (!this.audioContext) return;

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
    } catch (error) {
      // Silently fail to avoid console spam
    }
  }

  async playSuccess(): Promise<void> {
    await this.createTone(523.25, 0.2);
  }

  async playClick(): Promise<void> {
    await this.createTone(800, 0.1);
  }

  async playError(): Promise<void> {
    await this.createTone(400, 0.2);
  }

  async playComplete(): Promise<void> {
    await this.createTone(523.25, 0.15);
    setTimeout(() => this.createTone(659.25, 0.15), 150);
    setTimeout(() => this.createTone(783.99, 0.3), 300);
  }

  disable(): void {
    this.enabled = false;
  }

  enable(): void {
    this.enabled = true;
  }
}

export const soundEffects = new SoundEffects();
