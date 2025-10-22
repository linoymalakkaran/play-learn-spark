import { useState, useEffect, useCallback, useContext, createContext } from 'react';

// Language switching context
interface LanguageSwitchingContext {
  currentLanguage: string;
  availableLanguages: string[];
  isRTL: boolean;
  direction: 'ltr' | 'rtl';
  fallbackLanguage: string;
  isLoading: boolean;
  switchLanguage: (language: string) => Promise<void>;
  getLocalizedContent: (contentKey: string, fallback?: string) => string;
  formatText: (text: string, params?: Record<string, any>) => string;
  getLanguageConfig: () => any;
}

// Language configuration
interface LanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  isRTL: boolean;
  flag: string;
  region: string;
  typography: {
    fontFamily: string[];
    fontSize: number;
    lineHeight: number;
    textDirection: 'ltr' | 'rtl';
  };
  cultural: {
    dateFormat: string;
    timeFormat: string;
    numberFormat: string;
    currency: string;
    firstDayOfWeek: number;
  };
  accessibility: {
    screenReaderSupport: boolean;
    highContrastSupport: boolean;
    keyboardNavigation: boolean;
  };
}

// Content cache for translations
interface ContentCache {
  [language: string]: {
    [contentKey: string]: string;
  };
}

// Performance metrics
interface SwitchingMetrics {
  switchCount: number;
  averageSwitchTime: number;
  cacheHitRate: number;
  errorRate: number;
  totalSwitches: number;
  lastSwitchTime: number;
}

// Create context
const LanguageContext = createContext<LanguageSwitchingContext | null>(null);

// Language configurations
const LANGUAGE_CONFIGS: Record<string, LanguageConfig> = {
  'en': {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    isRTL: false,
    flag: '🇺🇸',
    region: 'US',
    typography: {
      fontFamily: ['Inter', 'Arial', 'sans-serif'],
      fontSize: 16,
      lineHeight: 1.5,
      textDirection: 'ltr'
    },
    cultural: {
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h',
      numberFormat: '1,234.56',
      currency: 'USD',
      firstDayOfWeek: 0
    },
    accessibility: {
      screenReaderSupport: true,
      highContrastSupport: true,
      keyboardNavigation: true
    }
  },
  'es': {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    isRTL: false,
    flag: '🇪🇸',
    region: 'ES',
    typography: {
      fontFamily: ['Inter', 'Arial', 'sans-serif'],
      fontSize: 16,
      lineHeight: 1.6,
      textDirection: 'ltr'
    },
    cultural: {
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h',
      numberFormat: '1.234,56',
      currency: 'EUR',
      firstDayOfWeek: 1
    },
    accessibility: {
      screenReaderSupport: true,
      highContrastSupport: true,
      keyboardNavigation: true
    }
  },
  'fr': {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    isRTL: false,
    flag: '🇫🇷',
    region: 'FR',
    typography: {
      fontFamily: ['Inter', 'Arial', 'sans-serif'],
      fontSize: 16,
      lineHeight: 1.6,
      textDirection: 'ltr'
    },
    cultural: {
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h',
      numberFormat: '1 234,56',
      currency: 'EUR',
      firstDayOfWeek: 1
    },
    accessibility: {
      screenReaderSupport: true,
      highContrastSupport: true,
      keyboardNavigation: true
    }
  },
  'ar': {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    isRTL: true,
    flag: '🇸🇦',
    region: 'SA',
    typography: {
      fontFamily: ['Amiri', 'Arial', 'sans-serif'],
      fontSize: 18,
      lineHeight: 1.8,
      textDirection: 'rtl'
    },
    cultural: {
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '12h',
      numberFormat: '1,234.56',
      currency: 'SAR',
      firstDayOfWeek: 6
    },
    accessibility: {
      screenReaderSupport: true,
      highContrastSupport: true,
      keyboardNavigation: true
    }
  },
  'zh': {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    isRTL: false,
    flag: '🇨🇳',
    region: 'CN',
    typography: {
      fontFamily: ['Noto Sans SC', 'Arial', 'sans-serif'],
      fontSize: 16,
      lineHeight: 1.7,
      textDirection: 'ltr'
    },
    cultural: {
      dateFormat: 'YYYY/MM/DD',
      timeFormat: '24h',
      numberFormat: '1,234.56',
      currency: 'CNY',
      firstDayOfWeek: 1
    },
    accessibility: {
      screenReaderSupport: true,
      highContrastSupport: true,
      keyboardNavigation: true
    }
  }
};

// Language switching hook
export function useLanguageSwitching() {
  const [currentLanguage, setCurrentLanguage] = useState<string>('en');
  const [availableLanguages, setAvailableLanguages] = useState<string[]>(['en', 'es', 'fr', 'ar', 'zh']);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [contentCache, setContentCache] = useState<ContentCache>({});
  const [metrics, setMetrics] = useState<SwitchingMetrics>({
    switchCount: 0,
    averageSwitchTime: 0,
    cacheHitRate: 0,
    errorRate: 0,
    totalSwitches: 0,
    lastSwitchTime: Date.now()
  });

  // Get current language configuration
  const getCurrentConfig = useCallback((): LanguageConfig => {
    return LANGUAGE_CONFIGS[currentLanguage] || LANGUAGE_CONFIGS['en'];
  }, [currentLanguage]);

  // Initialize language from storage or browser
  useEffect(() => {
    const initializeLanguage = async () => {
      try {
        // Try to get from localStorage first
        const savedLanguage = localStorage.getItem('preferred-language');
        if (savedLanguage && availableLanguages.includes(savedLanguage)) {
          setCurrentLanguage(savedLanguage);
          return;
        }

        // Try to detect from browser
        const browserLanguage = navigator.language.split('-')[0];
        if (availableLanguages.includes(browserLanguage)) {
          setCurrentLanguage(browserLanguage);
          return;
        }

        // Load available languages from backend
        const response = await fetch('/api/languages/available');
        if (response.ok) {
          const languages = await response.json();
          setAvailableLanguages(languages.map((lang: any) => lang.code));
        }
      } catch (error) {
        console.error('Error initializing language:', error);
      }
    };

    initializeLanguage();
  }, []);

  // Apply language changes to document
  useEffect(() => {
    const config = getCurrentConfig();
    
    // Update document attributes
    document.documentElement.lang = currentLanguage;
    document.documentElement.dir = config.isRTL ? 'rtl' : 'ltr';
    
    // Update CSS custom properties for typography
    const root = document.documentElement;
    root.style.setProperty('--font-family', config.typography.fontFamily.join(', '));
    root.style.setProperty('--font-size', `${config.typography.fontSize}px`);
    root.style.setProperty('--line-height', config.typography.lineHeight.toString());
    root.style.setProperty('--text-direction', config.typography.textDirection);
    
    // Update text alignment based on direction
    if (config.isRTL) {
      root.style.setProperty('--text-align', 'right');
      root.style.setProperty('--text-align-opposite', 'left');
    } else {
      root.style.setProperty('--text-align', 'left');
      root.style.setProperty('--text-align-opposite', 'right');
    }
    
    // Save to localStorage
    localStorage.setItem('preferred-language', currentLanguage);
    
  }, [currentLanguage, getCurrentConfig]);

  // Switch language function
  const switchLanguage = useCallback(async (newLanguage: string): Promise<void> => {
    if (!availableLanguages.includes(newLanguage)) {
      throw new Error(`Language ${newLanguage} is not available`);
    }

    if (newLanguage === currentLanguage) {
      return; // No change needed
    }

    const startTime = performance.now();
    setIsLoading(true);

    try {
      // Preload critical content for the new language
      await preloadLanguageContent(newLanguage);
      
      // Switch the language
      setCurrentLanguage(newLanguage);
      
      // Update metrics
      const switchTime = performance.now() - startTime;
      setMetrics(prev => ({
        ...prev,
        switchCount: prev.switchCount + 1,
        totalSwitches: prev.totalSwitches + 1,
        averageSwitchTime: (prev.averageSwitchTime * prev.switchCount + switchTime) / (prev.switchCount + 1),
        lastSwitchTime: Date.now()
      }));

      // Dispatch language change event
      window.dispatchEvent(new CustomEvent('languageChanged', {
        detail: { 
          previousLanguage: currentLanguage,
          newLanguage,
          switchTime
        }
      }));

    } catch (error) {
      console.error('Error switching language:', error);
      
      // Update error metrics
      setMetrics(prev => ({
        ...prev,
        errorRate: prev.errorRate + 1
      }));
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [availableLanguages, currentLanguage]);

  // Preload language content
  const preloadLanguageContent = useCallback(async (language: string): Promise<void> => {
    try {
      // Check if already cached
      if (contentCache[language]) {
        setMetrics(prev => ({
          ...prev,
          cacheHitRate: prev.cacheHitRate + 1
        }));
        return;
      }

      // Load language content from backend
      const response = await fetch(`/api/languages/${language}/content`);
      if (!response.ok) {
        throw new Error(`Failed to load content for language: ${language}`);
      }

      const content = await response.json();
      
      // Cache the content
      setContentCache(prev => ({
        ...prev,
        [language]: content
      }));

    } catch (error) {
      console.warn(`Could not preload content for language ${language}:`, error);
    }
  }, [contentCache]);

  // Get localized content
  const getLocalizedContent = useCallback((
    contentKey: string, 
    fallback?: string
  ): string => {
    // Try current language first
    const currentContent = contentCache[currentLanguage]?.[contentKey];
    if (currentContent) {
      return currentContent;
    }

    // Try fallback language
    if (fallback) {
      const fallbackContent = contentCache['en']?.[contentKey];
      if (fallbackContent) {
        return fallbackContent;
      }
    }

    // Return the key as fallback
    return contentKey;
  }, [currentLanguage, contentCache]);

  // Format text with parameters
  const formatText = useCallback((
    text: string, 
    params?: Record<string, any>
  ): string => {
    if (!params) return text;

    let formattedText = text;
    
    // Replace placeholders
    Object.entries(params).forEach(([key, value]) => {
      const placeholder = `{${key}}`;
      formattedText = formattedText.replace(new RegExp(placeholder, 'g'), String(value));
    });

    return formattedText;
  }, []);

  // Get language configuration
  const getLanguageConfig = useCallback(() => {
    return getCurrentConfig();
  }, [getCurrentConfig]);

  // Create context value
  const contextValue: LanguageSwitchingContext = {
    currentLanguage,
    availableLanguages,
    isRTL: getCurrentConfig().isRTL,
    direction: getCurrentConfig().typography.textDirection,
    fallbackLanguage: 'en',
    isLoading,
    switchLanguage,
    getLocalizedContent,
    formatText,
    getLanguageConfig
  };

  return contextValue;
}

// Language provider component
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const languageContext = useLanguageSwitching();

  return (
    <LanguageContext.Provider value={languageContext}>
      {children}
    </LanguageContext.Provider>
  );
}

// Hook to use language context
export function useLanguage(): LanguageSwitchingContext {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// Language switcher component
export function LanguageSwitcher({ 
  variant = 'dropdown',
  showFlags = true,
  showNativeNames = true 
}: {
  variant?: 'dropdown' | 'buttons' | 'minimal';
  showFlags?: boolean;
  showNativeNames?: boolean;
}) {
  const { 
    currentLanguage, 
    availableLanguages, 
    isLoading, 
    switchLanguage 
  } = useLanguage();

  const handleLanguageChange = async (language: string) => {
    try {
      await switchLanguage(language);
    } catch (error) {
      console.error('Failed to switch language:', error);
      // Show user-friendly error message
    }
  };

  if (variant === 'dropdown') {
    return (
      <div className="language-switcher-dropdown">
        <select
          value={currentLanguage}
          onChange={(e) => handleLanguageChange(e.target.value)}
          disabled={isLoading}
          className="language-select"
          aria-label="Select language"
        >
          {availableLanguages.map(lang => {
            const config = LANGUAGE_CONFIGS[lang];
            return (
              <option key={lang} value={lang}>
                {showFlags && config?.flag} {' '}
                {showNativeNames ? config?.nativeName : config?.name}
              </option>
            );
          })}
        </select>
        {isLoading && <span className="loading-indicator">⟳</span>}
      </div>
    );
  }

  if (variant === 'buttons') {
    return (
      <div className="language-switcher-buttons">
        {availableLanguages.map(lang => {
          const config = LANGUAGE_CONFIGS[lang];
          const isActive = lang === currentLanguage;
          
          return (
            <button
              key={lang}
              onClick={() => handleLanguageChange(lang)}
              disabled={isLoading || isActive}
              className={`language-button ${isActive ? 'active' : ''}`}
              aria-label={`Switch to ${config?.name}`}
            >
              {showFlags && config?.flag}
              <span className="language-text">
                {showNativeNames ? config?.nativeName : config?.name}
              </span>
            </button>
          );
        })}
        {isLoading && <span className="loading-indicator">⟳</span>}
      </div>
    );
  }

  // Minimal variant
  return (
    <div className="language-switcher-minimal">
      <button
        onClick={() => {
          const currentIndex = availableLanguages.indexOf(currentLanguage);
          const nextIndex = (currentIndex + 1) % availableLanguages.length;
          handleLanguageChange(availableLanguages[nextIndex]);
        }}
        disabled={isLoading}
        className="language-toggle"
        aria-label="Switch language"
      >
        {showFlags && LANGUAGE_CONFIGS[currentLanguage]?.flag}
        <span>{currentLanguage.toUpperCase()}</span>
        {isLoading && <span className="loading-indicator">⟳</span>}
      </button>
    </div>
  );
}

// RTL Layout wrapper component
export function RTLAwareLayout({ children }: { children: React.ReactNode }) {
  const { isRTL, direction } = useLanguage();

  return (
    <div 
      className={`layout-wrapper ${isRTL ? 'rtl-layout' : 'ltr-layout'}`}
      dir={direction}
      style={{
        direction,
        textAlign: isRTL ? 'right' : 'left'
      }}
    >
      {children}
    </div>
  );
}

// Hook for content with fallback
export function useLocalizedContent(contentKey: string, fallback?: string): string {
  const { getLocalizedContent } = useLanguage();
  return getLocalizedContent(contentKey, fallback);
}

// Hook for formatted text
export function useFormattedText(textKey: string, params?: Record<string, any>): string {
  const { getLocalizedContent, formatText } = useLanguage();
  const text = getLocalizedContent(textKey);
  return formatText(text, params);
}

// CSS-in-JS styles for language switching components
export const languageSwitcherStyles = `
  .language-switcher-dropdown {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .language-select {
    padding: 8px 12px;
    border: 1px solid #ccc;
    border-radius: 4px;
    background: white;
    font-size: 14px;
    cursor: pointer;
  }

  .language-select:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .language-switcher-buttons {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .language-button {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 12px;
    border: 1px solid #ccc;
    border-radius: 4px;
    background: white;
    cursor: pointer;
    transition: all 0.2s;
  }

  .language-button:hover {
    background: #f5f5f5;
  }

  .language-button.active {
    background: #007bff;
    color: white;
    border-color: #007bff;
  }

  .language-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .language-switcher-minimal {
    display: inline-flex;
  }

  .language-toggle {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    background: white;
    cursor: pointer;
    font-size: 12px;
    font-weight: bold;
  }

  .loading-indicator {
    animation: spin 1s linear infinite;
    display: inline-block;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .layout-wrapper.rtl-layout {
    direction: rtl;
  }

  .layout-wrapper.ltr-layout {
    direction: ltr;
  }

  /* RTL-specific adjustments */
  .rtl-layout .language-switcher-buttons {
    flex-direction: row-reverse;
  }

  .rtl-layout .language-button {
    flex-direction: row-reverse;
  }
`;