/**
 * Skip Links Component for Play & Learn Spark
 * Provides keyboard navigation shortcuts for better accessibility
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface SkipLink {
  href: string;
  label: string;
}

interface SkipLinksProps {
  links?: SkipLink[];
  className?: string;
}

const defaultLinks: SkipLink[] = [
  { href: '#main-content', label: 'Skip to main content' },
  { href: '#navigation', label: 'Skip to navigation' },
  { href: '#footer', label: 'Skip to footer' }
];

export const SkipLinks: React.FC<SkipLinksProps> = ({ 
  links = defaultLinks, 
  className 
}) => {
  return (
    <nav 
      className={cn(
        'skip-links sr-only focus-within:not-sr-only',
        'fixed top-0 left-0 z-50 bg-white border border-gray-300 rounded-br-lg shadow-lg',
        'p-2 space-y-1',
        className
      )}
      aria-label="Skip links"
    >
      {links.map((link, index) => (
        <a
          key={index}
          href={link.href}
          className={cn(
            'block px-3 py-2 text-sm font-medium text-blue-600',
            'bg-white border border-blue-600 rounded',
            'hover:bg-blue-50 focus:bg-blue-50',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
            'transition-colors duration-200'
          )}
          onClick={(e) => {
            // Ensure the target element receives focus
            const target = document.querySelector(link.href);
            if (target) {
              e.preventDefault();
              (target as HTMLElement).focus();
              target.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
              });
            }
          }}
        >
          {link.label}
        </a>
      ))}
    </nav>
  );
};

export default SkipLinks;