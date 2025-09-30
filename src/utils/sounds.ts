// Simple sound effects using Web Audio API
export class SoundEffects {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  private createTone(frequency: number, duration: number, type: OscillatorType = 'sine'): Promise<void> {
    return new Promise((resolve) => {
      if (!this.audioContext || !this.enabled) {
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
    if (!this.audioContext || !this.enabled) return;
    await this.createTone(523.25, 0.2); // C5
    await this.createTone(659.25, 0.2); // E5
    await this.createTone(783.99, 0.3); // G5
  }

  async playError(): Promise<void> {
    if (!this.audioContext || !this.enabled) return;
    await this.createTone(400, 0.2); // Lower tone
    await this.createTone(350, 0.3); // Even lower
  }

  async playClick(): Promise<void> {
    if (!this.audioContext || !this.enabled) return;
    await this.createTone(800, 0.1, 'square');
  }

  async playCheer(): Promise<void> {
    if (!this.audioContext || !this.enabled) return;
    await this.createTone(523.25, 0.15); // C5
    await this.createTone(659.25, 0.15); // E5
    await this.createTone(783.99, 0.15); // G5
    await this.createTone(1046.5, 0.25); // C6
  }

  async playPop(): Promise<void> {
    if (!this.audioContext || !this.enabled) return;
    await this.createTone(1200, 0.08, 'square');
  }

  async playMagic(): Promise<void> {
    if (!this.audioContext || !this.enabled) return;
    const frequencies = [1000, 1200, 1400, 1600];
    for (const freq of frequencies) {
      this.createTone(freq, 0.1, 'triangle');
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }

  // Level up celebration
  async playLevelUp(): Promise<void> {
    if (!this.audioContext || !this.enabled) return;
    // Ascending victory fanfare
    await this.createTone(349.23, 0.1); // F4
    await this.createTone(523.25, 0.1); // C5
    await this.createTone(698.46, 0.1); // F5
    await this.createTone(1046.5, 0.1); // C6
    await this.createTone(1396.9, 0.2); // F6
  }

  // Perfect completion sound
  async playPerfect(): Promise<void> {
    if (!this.audioContext || !this.enabled) return;
    // Sparkling perfect sound
    await this.createTone(880, 0.08); // A5
    await this.createTone(1108.73, 0.08); // C#6
    await this.createTone(1318.51, 0.12); // E6
  }

  // Activity complete fanfare
  async playActivityComplete(): Promise<void> {
    if (!this.audioContext || !this.enabled) return;
    // Full victory melody
    await this.createTone(523.25, 0.15); // C5
    await this.createTone(659.25, 0.15); // E5
    await this.createTone(783.99, 0.15); // G5
    await this.createTone(1046.5, 0.1); // C6
    await this.createTone(783.99, 0.1); // G5
    await this.createTone(1046.5, 0.3); // C6 (hold)
  }

  // Animal sound effects using oscillator patterns
  async playAnimalSound(animal: string): Promise<void> {
    if (!this.audioContext || !this.enabled) return;
    
    switch (animal.toLowerCase()) {
      case 'lion':
        // Deep rumbling roar
        await this.createComplexTone([150, 200, 100], 0.8, 'sawtooth');
        break;
      case 'cat':
        // High-pitched meow
        await this.createTone(800, 0.1, 'triangle');
        await this.createTone(600, 0.2, 'triangle');
        await this.createTone(700, 0.1, 'triangle');
        break;
      case 'dog':
        // Sharp barking sounds
        await this.createTone(400, 0.15, 'square');
        await new Promise(resolve => setTimeout(resolve, 100));
        await this.createTone(350, 0.15, 'square');
        break;
      case 'elephant':
        // Trumpet-like sound
        await this.createTone(200, 0.3, 'triangle');
        await this.createTone(300, 0.4, 'triangle');
        break;
      case 'cow':
        // Low moo sound
        await this.createTone(180, 0.6, 'sawtooth');
        break;
      case 'horse':
        // Neigh sound pattern
        await this.createTone(400, 0.2, 'triangle');
        await this.createTone(300, 0.1, 'triangle');
        await this.createTone(500, 0.2, 'triangle');
        break;
      case 'duck':
        // Quack sound
        await this.createTone(600, 0.1, 'square');
        await this.createTone(500, 0.1, 'square');
        break;
      case 'pig':
        // Oink oink
        await this.createTone(300, 0.1, 'sawtooth');
        await new Promise(resolve => setTimeout(resolve, 50));
        await this.createTone(250, 0.1, 'sawtooth');
        break;
      case 'sheep':
        // Baa sound
        await this.createTone(400, 0.3, 'triangle');
        await this.createTone(350, 0.2, 'triangle');
        break;
      case 'frog':
        // Ribbit sound
        await this.createTone(200, 0.1, 'square');
        await this.createTone(300, 0.1, 'square');
        break;
      case 'bird':
        // Tweet tweet
        await this.createTone(1000, 0.1, 'sine');
        await this.createTone(1200, 0.1, 'sine');
        await this.createTone(1000, 0.1, 'sine');
        break;
      case 'monkey':
        // Ooh ooh ah ah
        await this.createTone(800, 0.1, 'triangle');
        await this.createTone(600, 0.1, 'triangle');
        await this.createTone(900, 0.1, 'triangle');
        break;
      default:
        // Generic animal sound
        await this.createTone(500, 0.2, 'triangle');
    }
  }

  // Helper method for complex tone patterns
  private async createComplexTone(frequencies: number[], duration: number, type: OscillatorType = 'sine'): Promise<void> {
    if (!this.audioContext || !this.enabled) return;
    
    const promises = frequencies.map(freq => 
      this.createTone(freq, duration, type)
    );
    
    await Promise.all(promises);
  }

  // Enhanced letter pronunciation with tone mapping
  async playLetterPronunciation(letter: string, language: 'arabic' | 'malayalam' = 'arabic'): Promise<void> {
    if (!this.audioContext || !this.enabled) {
      // Fallback to speech synthesis
      this.playTextToSpeech(letter, language);
      return;
    }

    // Create different tones for different letters to help with audio learning
    const arabicToneMap: { [key: string]: number } = {
      'أ': 220,  // A
      'ب': 246.94, // B
      'ت': 261.63, // T
      'ث': 277.18, // Th
      'ج': 293.66, // J
      'ح': 311.13, // H
      'خ': 329.63, // Kh
      'د': 349.23, // D
      'ذ': 369.99, // Dh
      'ر': 392.00, // R
      'ز': 415.30, // Z
      'س': 440.00, // S
    };

    const malayalamToneMap: { [key: string]: number } = {
      'അ': 220,    // A
      'ആ': 233.08, // Aa
      'ഇ': 246.94, // I
      'ഈ': 261.63, // Ee
      'ഉ': 277.18, // U
      'ഊ': 293.66, // Oo
      'ഋ': 311.13, // Ri
      'എ': 329.63, // E
      'ഏ': 349.23, // Ae
      'ഐ': 369.99, // Ai
      'ഒ': 392.00, // O
      'ഓ': 415.30, // Au
    };

    const toneMap = language === 'arabic' ? arabicToneMap : malayalamToneMap;
    const frequency = toneMap[letter] || 440; // Default to A4 if letter not found

    // Create a pleasant tone sequence for the letter
    await this.createTone(frequency, 0.3, 'sine');
    await new Promise(resolve => setTimeout(resolve, 100));
    await this.createTone(frequency * 0.8, 0.2, 'sine');
  }

  private playTextToSpeech(text: string, language: 'arabic' | 'malayalam' = 'arabic'): void {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'arabic' ? 'ar-SA' : 'ml-IN';
      utterance.rate = 0.6;
      utterance.pitch = 1.2;
      speechSynthesis.speak(utterance);
    }
  }
}

export const soundEffects = new SoundEffects();
