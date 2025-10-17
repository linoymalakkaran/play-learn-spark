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

  async playCheer(): Promise<void> {
    // Play a celebratory cheer sound sequence
    await this.createTone(523.25, 0.2);
    setTimeout(() => this.createTone(659.25, 0.2), 150);
    setTimeout(() => this.createTone(783.99, 0.2), 300);
    setTimeout(() => this.createTone(1046.50, 0.3), 450);
  }

  async playAnimalSound(animalName: string): Promise<void> {
    // Use speech synthesis to say the animal name
    if (!this.enabled) return;

    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(animalName);
        utterance.rate = 0.8;
        utterance.pitch = 1.2;
        window.speechSynthesis.speak(utterance);
        return;
      }

      // Fallback: play a tone based on animal name
      const code = animalName.charCodeAt(0);
      const freq = 200 + (code % 300);
      await this.createTone(freq, 0.3);
    } catch (error) {
      // Silently fail
    }
  }

  async playMagic(): Promise<void> {
    // Play a magical ascending tone sequence
    await this.createTone(440, 0.1);
    setTimeout(() => this.createTone(554.37, 0.1), 100);
    setTimeout(() => this.createTone(659.25, 0.1), 200);
    setTimeout(() => this.createTone(783.99, 0.2), 300);
  }

  /**
   * Play a short pronunciation cue for a letter or word.
   * Tries to use SpeechSynthesis when available for real pronunciation,
   * otherwise falls back to a short tone mapped from the character code.
   */
  async playLetterPronunciation(text: string, lang: string = 'ml-IN'): Promise<void> {
    if (!this.enabled) return;

    try {
      // Prefer SpeechSynthesis for natural pronunciation when available
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        try {
          utterance.lang = lang;
        } catch (e) {
          // ignore if setting lang fails
        }
        utterance.rate = 0.8;
        window.speechSynthesis.speak(utterance);
        return;
      }

      // Fallback: produce a short tone based on text char codes
      const code = text ? text.charCodeAt(0) : 440;
      const freq = 220 + (code % 440);
      await this.createTone(freq, 0.12);
    } catch (error) {
      // ignore errors - keep silent fallback
    }
  }

  disable(): void {
    this.enabled = false;
  }

  enable(): void {
    this.enabled = true;
  }
}

export const soundEffects = new SoundEffects();
