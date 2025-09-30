import { useEffect, useRef, useCallback, useState } from 'react';

export interface VoiceCommand {
  command: string;
  action: () => void;
  description: string;
  aliases?: string[];
}

export interface UseVoiceCommandsOptions {
  commands: VoiceCommand[];
  continuous?: boolean;
  language?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: any) => void;
  onResult?: (result: string) => void;
  enabled?: boolean;
}

export const useVoiceCommands = (options: UseVoiceCommandsOptions) => {
  const {
    commands,
    continuous = true,
    language = 'en-US',
    onStart,
    onEnd,
    onError,
    onResult,
    enabled = true,
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Check for browser support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);
    
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      
      const recognition = recognitionRef.current;
      recognition.continuous = continuous;
      recognition.interimResults = true;
      recognition.lang = language;
      
      recognition.onstart = () => {
        setIsListening(true);
        onStart?.();
      };
      
      recognition.onend = () => {
        setIsListening(false);
        onEnd?.();
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        onError?.(event.error);
      };
      
      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const text = result[0].transcript;
          
          if (result.isFinal) {
            finalTranscript += text;
          } else {
            interimTranscript += text;
          }
        }
        
        const fullTranscript = finalTranscript || interimTranscript;
        setTranscript(fullTranscript);
        onResult?.(fullTranscript);
        
        // Process commands on final results
        if (finalTranscript) {
          processCommand(finalTranscript.toLowerCase().trim());
        }
      };
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [continuous, language, onStart, onEnd, onError, onResult]);

  // Process voice commands
  const processCommand = useCallback((spokenText: string) => {
    const normalizedText = spokenText.toLowerCase().trim();
    
    for (const command of commands) {
      const commandVariants = [
        command.command.toLowerCase(),
        ...(command.aliases || []).map(alias => alias.toLowerCase())
      ];
      
      for (const variant of commandVariants) {
        if (normalizedText.includes(variant)) {
          console.log(`Voice command recognized: "${variant}"`);
          command.action();
          return;
        }
      }
    }
    
    // Check for partial matches (useful for children's speech)
    for (const command of commands) {
      const words = command.command.toLowerCase().split(' ');
      const spokenWords = normalizedText.split(' ');
      
      // If at least half the words match, consider it a match
      const matchCount = words.filter(word => 
        spokenWords.some(spokenWord => 
          spokenWord.includes(word) || word.includes(spokenWord)
        )
      ).length;
      
      if (matchCount >= Math.ceil(words.length / 2)) {
        console.log(`Voice command partially recognized: "${command.command}"`);
        command.action();
        return;
      }
    }
  }, [commands]);

  // Start listening
  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening && enabled) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting speech recognition:', error);
      }
    }
  }, [isListening, enabled]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  // Toggle listening
  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return {
    isSupported,
    isListening,
    transcript,
    startListening,
    stopListening,
    toggleListening,
  };
};

// Educational voice commands for children
export const createEducationalCommands = (callbacks: {
  onNext?: () => void;
  onPrevious?: () => void;
  onRepeat?: () => void;
  onHelp?: () => void;
  onHome?: () => void;
  onSelect?: (option: string) => void;
}): VoiceCommand[] => {
  return [
    {
      command: 'next',
      action: callbacks.onNext || (() => {}),
      description: 'Go to next question',
      aliases: ['next question', 'continue', 'move on']
    },
    {
      command: 'previous',
      action: callbacks.onPrevious || (() => {}),
      description: 'Go to previous question',
      aliases: ['go back', 'back', 'previous question']
    },
    {
      command: 'repeat',
      action: callbacks.onRepeat || (() => {}),
      description: 'Repeat the question',
      aliases: ['say again', 'repeat question', 'what was that']
    },
    {
      command: 'help',
      action: callbacks.onHelp || (() => {}),
      description: 'Get help',
      aliases: ['help me', 'I need help', 'hint']
    },
    {
      command: 'home',
      action: callbacks.onHome || (() => {}),
      description: 'Go to main menu',
      aliases: ['main menu', 'go home', 'menu']
    },
    {
      command: 'small',
      action: () => callbacks.onSelect?.('small'),
      description: 'Select small option',
      aliases: ['little', 'tiny', 'smallest']
    },
    {
      command: 'medium',
      action: () => callbacks.onSelect?.('medium'),
      description: 'Select medium option',
      aliases: ['middle', 'average', 'normal']
    },
    {
      command: 'large',
      action: () => callbacks.onSelect?.('large'),
      description: 'Select large option',
      aliases: ['big', 'huge', 'largest', 'giant']
    },
    {
      command: 'circle',
      action: () => callbacks.onSelect?.('circle'),
      description: 'Select circle',
      aliases: ['round', 'ball']
    },
    {
      command: 'square',
      action: () => callbacks.onSelect?.('square'),
      description: 'Select square',
      aliases: ['box']
    },
    {
      command: 'triangle',
      action: () => callbacks.onSelect?.('triangle'),
      description: 'Select triangle',
      aliases: ['three sides']
    },
    {
      command: 'rectangle',
      action: () => callbacks.onSelect?.('rectangle'),
      description: 'Select rectangle',
      aliases: ['long box']
    },
    {
      command: 'star',
      action: () => callbacks.onSelect?.('star'),
      description: 'Select star',
      aliases: ['starfish']
    },
    {
      command: 'heart',
      action: () => callbacks.onSelect?.('heart'),
      description: 'Select heart',
      aliases: ['love']
    }
  ];
};

// Hook for accessibility features
export const useAccessibilityVoice = (elementRef: React.RefObject<HTMLElement>) => {
  const [isReading, setIsReading] = useState(false);
  
  const speak = useCallback((text: string, options?: SpeechSynthesisUtteranceOptions) => {
    if ('speechSynthesis' in window) {
      // Stop any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Apply options
      if (options) {
        Object.assign(utterance, options);
      }
      
      // Set defaults for children
      utterance.rate = options?.rate || 0.8; // Slower for children
      utterance.pitch = options?.pitch || 1.1; // Slightly higher pitch
      utterance.volume = options?.volume || 0.8;
      
      utterance.onstart = () => setIsReading(true);
      utterance.onend = () => setIsReading(false);
      utterance.onerror = () => setIsReading(false);
      
      window.speechSynthesis.speak(utterance);
    }
  }, []);
  
  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsReading(false);
    }
  }, []);
  
  // Read element content
  const readElement = useCallback(() => {
    if (elementRef.current) {
      const text = elementRef.current.textContent || elementRef.current.innerText;
      if (text) {
        speak(text);
      }
    }
  }, [elementRef, speak]);
  
  return {
    speak,
    stopSpeaking,
    readElement,
    isReading,
    isSupported: 'speechSynthesis' in window,
  };
};