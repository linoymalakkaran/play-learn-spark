import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLanguage } from '../hooks/useLanguageSwitching';

// RTL Context interface
interface RTLContext {
  isRTL: boolean;
  direction: 'ltr' | 'rtl';
  textAlign: 'left' | 'right';
  toggleDirection: () => void;
  getDirectionalStyle: (styles: DirectionalStyles) => React.CSSProperties;
  getLayoutClass: (baseClass: string) => string;
}

// Directional styles interface
interface DirectionalStyles {
  ltr?: React.CSSProperties;
  rtl?: React.CSSProperties;
  common?: React.CSSProperties;
}

// Layout configuration
interface LayoutConfig {
  autoDetect: boolean;
  forcedDirection?: 'ltr' | 'rtl';
  preserveLogicalProperties: boolean;
  enableAnimations: boolean;
  debugMode: boolean;
}

// Create RTL context
const RTLContext = createContext<RTLContext | null>(null);

// RTL Provider component
export function RTLProvider({ 
  children, 
  config = {} 
}: { 
  children: React.ReactNode;
  config?: Partial<LayoutConfig>;
}) {
  const { isRTL: languageIsRTL, direction: languageDirection } = useLanguage();
  const [isRTL, setIsRTL] = useState<boolean>(false);
  const [direction, setDirection] = useState<'ltr' | 'rtl'>('ltr');

  const defaultConfig: LayoutConfig = {
    autoDetect: true,
    preserveLogicalProperties: true,
    enableAnimations: true,
    debugMode: false,
    ...config
  };

  // Update RTL state based on language or forced direction
  useEffect(() => {
    let newDirection: 'ltr' | 'rtl';
    let newIsRTL: boolean;

    if (defaultConfig.forcedDirection) {
      newDirection = defaultConfig.forcedDirection;
      newIsRTL = defaultConfig.forcedDirection === 'rtl';
    } else if (defaultConfig.autoDetect) {
      newDirection = languageDirection;
      newIsRTL = languageIsRTL;
    } else {
      newDirection = 'ltr';
      newIsRTL = false;
    }

    setDirection(newDirection);
    setIsRTL(newIsRTL);

    // Apply to document
    document.documentElement.dir = newDirection;
    document.documentElement.setAttribute('data-dir', newDirection);
    
    // Add CSS class to body
    document.body.classList.remove('ltr-layout', 'rtl-layout');
    document.body.classList.add(`${newDirection}-layout`);

    if (defaultConfig.debugMode) {
      console.log(`RTL Layout: Direction changed to ${newDirection}`);
    }

  }, [languageDirection, languageIsRTL, defaultConfig]);

  // Toggle direction manually
  const toggleDirection = () => {
    const newDirection = direction === 'ltr' ? 'rtl' : 'ltr';
    setDirection(newDirection);
    setIsRTL(newDirection === 'rtl');
  };

  // Get directional styles
  const getDirectionalStyle = (styles: DirectionalStyles): React.CSSProperties => {
    const commonStyles = styles.common || {};
    const directionalStyles = isRTL ? (styles.rtl || {}) : (styles.ltr || {});

    // Convert logical properties if needed
    const convertedStyles = defaultConfig.preserveLogicalProperties 
      ? convertLogicalProperties(directionalStyles, isRTL)
      : directionalStyles;

    return {
      ...commonStyles,
      ...convertedStyles,
      direction
    };
  };

  // Get layout class with directional modifier
  const getLayoutClass = (baseClass: string): string => {
    return `${baseClass} ${baseClass}--${direction}`;
  };

  const contextValue: RTLContext = {
    isRTL,
    direction,
    textAlign: isRTL ? 'right' : 'left',
    toggleDirection,
    getDirectionalStyle,
    getLayoutClass
  };

  return (
    <RTLContext.Provider value={contextValue}>
      <div 
        className={`rtl-layout-root ${direction}-layout`}
        dir={direction}
        data-rtl={isRTL}
      >
        {children}
      </div>
    </RTLContext.Provider>
  );
}

// Hook to use RTL context
export function useRTL(): RTLContext {
  const context = useContext(RTLContext);
  if (!context) {
    throw new Error('useRTL must be used within an RTLProvider');
  }
  return context;
}

// RTL-aware container component
export function RTLContainer({ 
  children, 
  className = '',
  style = {},
  tag = 'div',
  ...props 
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  tag?: keyof JSX.IntrinsicElements;
  [key: string]: any;
}) {
  const { direction, getLayoutClass, getDirectionalStyle } = useRTL();

  const Component = tag as any;
  const containerStyle = getDirectionalStyle({
    common: style,
    ltr: {},
    rtl: {}
  });

  return (
    <Component
      className={getLayoutClass(`rtl-container ${className}`)}
      style={containerStyle}
      dir={direction}
      {...props}
    >
      {children}
    </Component>
  );
}

// RTL-aware flex layout
export function RTLFlex({
  children,
  direction: flexDirection = 'row',
  justify = 'flex-start',
  align = 'stretch',
  wrap = 'nowrap',
  gap = 0,
  className = '',
  style = {},
  ...props
}: {
  children: React.ReactNode;
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  justify?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  align?: 'stretch' | 'flex-start' | 'flex-end' | 'center' | 'baseline';
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  gap?: number | string;
  className?: string;
  style?: React.CSSProperties;
  [key: string]: any;
}) {
  const { isRTL, getDirectionalStyle, getLayoutClass } = useRTL();

  // Adjust flex direction for RTL
  const adjustedFlexDirection = adjustFlexDirection(flexDirection, isRTL);
  const adjustedJustify = adjustJustifyContent(justify, isRTL, flexDirection);

  const flexStyle = getDirectionalStyle({
    common: {
      display: 'flex',
      flexDirection: adjustedFlexDirection,
      justifyContent: adjustedJustify,
      alignItems: align,
      flexWrap: wrap,
      gap: typeof gap === 'number' ? `${gap}px` : gap,
      ...style
    }
  });

  return (
    <div
      className={getLayoutClass(`rtl-flex ${className}`)}
      style={flexStyle}
      {...props}
    >
      {children}
    </div>
  );
}

// RTL-aware grid layout
export function RTLGrid({
  children,
  columns = 'auto',
  rows = 'auto',
  gap = 0,
  columnGap,
  rowGap,
  justify = 'stretch',
  align = 'stretch',
  className = '',
  style = {},
  ...props
}: {
  children: React.ReactNode;
  columns?: string | number;
  rows?: string | number;
  gap?: number | string;
  columnGap?: number | string;
  rowGap?: number | string;
  justify?: 'start' | 'end' | 'center' | 'stretch' | 'space-around' | 'space-between' | 'space-evenly';
  align?: 'start' | 'end' | 'center' | 'stretch' | 'space-around' | 'space-between' | 'space-evenly';
  className?: string;
  style?: React.CSSProperties;
  [key: string]: any;
}) {
  const { getDirectionalStyle, getLayoutClass } = useRTL();

  const gridStyle = getDirectionalStyle({
    common: {
      display: 'grid',
      gridTemplateColumns: typeof columns === 'number' ? `repeat(${columns}, 1fr)` : columns,
      gridTemplateRows: typeof rows === 'number' ? `repeat(${rows}, 1fr)` : rows,
      gap: typeof gap === 'number' ? `${gap}px` : gap,
      columnGap: columnGap ? (typeof columnGap === 'number' ? `${columnGap}px` : columnGap) : undefined,
      rowGap: rowGap ? (typeof rowGap === 'number' ? `${rowGap}px` : rowGap) : undefined,
      justifyItems: justify,
      alignItems: align,
      ...style
    }
  });

  return (
    <div
      className={getLayoutClass(`rtl-grid ${className}`)}
      style={gridStyle}
      {...props}
    >
      {children}
    </div>
  );
}

// RTL-aware text component
export function RTLText({
  children,
  align,
  variant = 'body',
  className = '',
  style = {},
  ...props
}: {
  children: React.ReactNode;
  align?: 'start' | 'end' | 'center' | 'justify';
  variant?: 'title' | 'subtitle' | 'body' | 'caption' | 'label';
  className?: string;
  style?: React.CSSProperties;
  [key: string]: any;
}) {
  const { isRTL, getDirectionalStyle, getLayoutClass } = useRTL();

  const textAlign = align ? getTextAlign(align, isRTL) : isRTL ? 'right' : 'left';

  const textStyle = getDirectionalStyle({
    common: {
      textAlign,
      ...getVariantStyles(variant),
      ...style
    }
  });

  return (
    <span
      className={getLayoutClass(`rtl-text rtl-text--${variant} ${className}`)}
      style={textStyle}
      {...props}
    >
      {children}
    </span>
  );
}

// RTL-aware input component
export function RTLInput({
  type = 'text',
  placeholder,
  className = '',
  style = {},
  ...props
}: {
  type?: string;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  [key: string]: any;
}) {
  const { isRTL, getDirectionalStyle, getLayoutClass } = useRTL();

  const inputStyle = getDirectionalStyle({
    common: {
      textAlign: isRTL ? 'right' : 'left',
      ...style
    },
    ltr: {
      paddingLeft: '12px',
      paddingRight: '12px'
    },
    rtl: {
      paddingLeft: '12px',
      paddingRight: '12px'
    }
  });

  return (
    <input
      type={type}
      placeholder={placeholder}
      className={getLayoutClass(`rtl-input ${className}`)}
      style={inputStyle}
      {...props}
    />
  );
}

// RTL-aware button component
export function RTLButton({
  children,
  variant = 'primary',
  size = 'medium',
  icon,
  iconPosition = 'start',
  className = '',
  style = {},
  ...props
}: {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  icon?: React.ReactNode;
  iconPosition?: 'start' | 'end';
  className?: string;
  style?: React.CSSProperties;
  [key: string]: any;
}) {
  const { isRTL, getDirectionalStyle, getLayoutClass } = useRTL();

  const buttonStyle = getDirectionalStyle({
    common: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      ...getButtonVariantStyles(variant, size),
      ...style
    }
  });

  const shouldReverseIcon = isRTL && iconPosition === 'start';
  const iconElement = icon && (
    <span className="rtl-button__icon">{icon}</span>
  );

  return (
    <button
      className={getLayoutClass(`rtl-button rtl-button--${variant} rtl-button--${size} ${className}`)}
      style={buttonStyle}
      {...props}
    >
      {shouldReverseIcon ? (
        <>
          {children}
          {iconElement}
        </>
      ) : (
        <>
          {iconPosition === 'start' && iconElement}
          {children}
          {iconPosition === 'end' && iconElement}
        </>
      )}
    </button>
  );
}

// Direction indicator component for debugging
export function DirectionIndicator({ show = false }: { show?: boolean }) {
  const { direction, isRTL, toggleDirection } = useRTL();

  if (!show) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '4px',
        fontSize: '12px',
        fontFamily: 'monospace',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}
    >
      <span>DIR: {direction.toUpperCase()}</span>
      <span>RTL: {isRTL ? 'YES' : 'NO'}</span>
      <button
        onClick={toggleDirection}
        style={{
          background: 'white',
          color: 'black',
          border: 'none',
          padding: '2px 6px',
          borderRadius: '2px',
          fontSize: '10px',
          cursor: 'pointer'
        }}
      >
        Toggle
      </button>
    </div>
  );
}

// Utility functions
function convertLogicalProperties(
  styles: React.CSSProperties, 
  isRTL: boolean
): React.CSSProperties {
  const converted = { ...styles };

  // Convert margin logical properties
  if (styles.marginInlineStart !== undefined) {
    converted[isRTL ? 'marginRight' : 'marginLeft'] = styles.marginInlineStart;
    delete converted.marginInlineStart;
  }
  if (styles.marginInlineEnd !== undefined) {
    converted[isRTL ? 'marginLeft' : 'marginRight'] = styles.marginInlineEnd;
    delete converted.marginInlineEnd;
  }

  // Convert padding logical properties
  if (styles.paddingInlineStart !== undefined) {
    converted[isRTL ? 'paddingRight' : 'paddingLeft'] = styles.paddingInlineStart;
    delete converted.paddingInlineStart;
  }
  if (styles.paddingInlineEnd !== undefined) {
    converted[isRTL ? 'paddingLeft' : 'paddingRight'] = styles.paddingInlineEnd;
    delete converted.paddingInlineEnd;
  }

  // Convert border logical properties
  if (styles.borderInlineStart !== undefined) {
    converted[isRTL ? 'borderRight' : 'borderLeft'] = styles.borderInlineStart;
    delete converted.borderInlineStart;
  }
  if (styles.borderInlineEnd !== undefined) {
    converted[isRTL ? 'borderLeft' : 'borderRight'] = styles.borderInlineEnd;
    delete converted.borderInlineEnd;
  }

  return converted;
}

function adjustFlexDirection(
  direction: string, 
  isRTL: boolean
): 'row' | 'column' | 'row-reverse' | 'column-reverse' {
  if (!isRTL || direction.includes('column')) {
    return direction as any;
  }

  if (direction === 'row') return 'row-reverse';
  if (direction === 'row-reverse') return 'row';
  
  return direction as any;
}

function adjustJustifyContent(
  justify: string, 
  isRTL: boolean, 
  flexDirection: string
): string {
  if (!isRTL || flexDirection.includes('column')) {
    return justify;
  }

  if (justify === 'flex-start') return 'flex-end';
  if (justify === 'flex-end') return 'flex-start';
  
  return justify;
}

function getTextAlign(align: string, isRTL: boolean): 'left' | 'right' | 'center' | 'justify' {
  if (align === 'center' || align === 'justify') {
    return align as any;
  }

  if (align === 'start') return isRTL ? 'right' : 'left';
  if (align === 'end') return isRTL ? 'left' : 'right';

  return 'left';
}

function getVariantStyles(variant: string): React.CSSProperties {
  const variants = {
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      lineHeight: 1.2
    },
    subtitle: {
      fontSize: '18px',
      fontWeight: '600',
      lineHeight: 1.3
    },
    body: {
      fontSize: '16px',
      fontWeight: 'normal',
      lineHeight: 1.5
    },
    caption: {
      fontSize: '14px',
      fontWeight: 'normal',
      lineHeight: 1.4
    },
    label: {
      fontSize: '12px',
      fontWeight: '500',
      lineHeight: 1.3
    }
  };

  return variants[variant as keyof typeof variants] || variants.body;
}

function getButtonVariantStyles(variant: string, size: string): React.CSSProperties {
  const sizes = {
    small: { padding: '6px 12px', fontSize: '14px' },
    medium: { padding: '8px 16px', fontSize: '16px' },
    large: { padding: '12px 24px', fontSize: '18px' }
  };

  const variants = {
    primary: {
      backgroundColor: '#007bff',
      color: 'white',
      border: '1px solid #007bff'
    },
    secondary: {
      backgroundColor: '#6c757d',
      color: 'white',
      border: '1px solid #6c757d'
    },
    outline: {
      backgroundColor: 'transparent',
      color: '#007bff',
      border: '1px solid #007bff'
    },
    ghost: {
      backgroundColor: 'transparent',
      color: '#007bff',
      border: '1px solid transparent'
    }
  };

  return {
    ...sizes[size as keyof typeof sizes],
    ...variants[variant as keyof typeof variants],
    borderRadius: '4px',
    cursor: 'pointer',
    fontFamily: 'inherit'
  };
}

// CSS for RTL layout support
export const rtlLayoutStyles = `
  .rtl-layout-root {
    width: 100%;
    height: 100%;
  }

  .ltr-layout {
    direction: ltr;
  }

  .rtl-layout {
    direction: rtl;
  }

  /* Container styles */
  .rtl-container {
    display: block;
  }

  /* Flex layout styles */
  .rtl-flex {
    display: flex;
  }

  .rtl-flex--ltr {
    /* LTR specific flex styles */
  }

  .rtl-flex--rtl {
    /* RTL specific flex styles */
  }

  /* Grid layout styles */
  .rtl-grid {
    display: grid;
  }

  /* Text styles */
  .rtl-text {
    display: inline;
  }

  .rtl-text--title {
    display: block;
    margin-bottom: 16px;
  }

  .rtl-text--subtitle {
    display: block;
    margin-bottom: 12px;
  }

  /* Input styles */
  .rtl-input {
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 8px 12px;
    font-size: 16px;
    font-family: inherit;
    width: 100%;
    box-sizing: border-box;
  }

  .rtl-input:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }

  /* Button styles */
  .rtl-button {
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.2s ease;
  }

  .rtl-button:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  .rtl-button:active {
    transform: translateY(0);
  }

  .rtl-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  .rtl-button__icon {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* RTL-specific adjustments */
  .rtl-layout .rtl-flex {
    /* RTL flex adjustments */
  }

  .rtl-layout .rtl-button {
    /* RTL button adjustments */
  }

  .rtl-layout .rtl-input {
    /* RTL input adjustments */
  }

  /* Animation support */
  @media (prefers-reduced-motion: no-preference) {
    .rtl-layout-root {
      transition: direction 0.3s ease;
    }

    .rtl-container,
    .rtl-flex,
    .rtl-grid,
    .rtl-text,
    .rtl-input,
    .rtl-button {
      transition: all 0.2s ease;
    }
  }

  /* High contrast support */
  @media (prefers-contrast: high) {
    .rtl-input {
      border-width: 2px;
    }

    .rtl-button {
      border-width: 2px;
    }
  }

  /* Print styles */
  @media print {
    .rtl-layout-root {
      color: black;
      background: white;
    }
  }
`;