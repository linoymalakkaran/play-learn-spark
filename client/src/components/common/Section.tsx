import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ChevronRight, ChevronDown } from 'lucide-react';

// Main Section Component
interface SectionProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'card' | 'glass' | 'minimal';
  spacing?: 'tight' | 'normal' | 'loose';
}

const Section: React.FC<SectionProps> & {
  Header: typeof SectionHeader;
  Title: typeof SectionTitle;
  Subtitle: typeof SectionSubtitle;
  Description: typeof SectionDescription;
  Actions: typeof SectionActions;
  Content: typeof SectionContent;
  Footer: typeof SectionFooter;
} = ({ 
  children, 
  className = '', 
  variant = 'default',
  spacing = 'normal'
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'card':
        return 'bg-white border border-gray-200 shadow-sm rounded-xl';
      case 'glass':
        return 'bg-white/80 backdrop-blur-md border border-white/20 shadow-xl rounded-2xl';
      case 'minimal':
        return 'bg-transparent';
      default:
        return 'bg-gray-50/50 rounded-lg';
    }
  };

  const getSpacingClasses = () => {
    switch (spacing) {
      case 'tight': return 'space-y-3';
      case 'loose': return 'space-y-8';
      default: return 'space-y-6';
    }
  };

  return (
    <section className={`${getVariantClasses()} ${getSpacingClasses()} ${className}`}>
      {children}
    </section>
  );
};

// Section Header Component
interface SectionHeaderProps {
  children: React.ReactNode;
  className?: string;
  collapsible?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ 
  children, 
  className = '',
  collapsible = false,
  isCollapsed = false,
  onToggleCollapse
}) => {
  return (
    <div 
      className={`flex items-center justify-between p-4 ${collapsible ? 'cursor-pointer' : ''} ${className}`}
      onClick={collapsible ? onToggleCollapse : undefined}
    >
      <div className="flex-1">
        {children}
      </div>
      {collapsible && (
        <Button variant="ghost" size="icon" className="ml-2">
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      )}
    </div>
  );
};

// Section Title Component
interface SectionTitleProps {
  children: React.ReactNode;
  level?: 1 | 2 | 3 | 4;
  className?: string;
  badge?: string | React.ReactNode;
}

const SectionTitle: React.FC<SectionTitleProps> = ({ 
  children, 
  level = 2,
  className = '',
  badge
}) => {
  const getHeadingClasses = () => {
    switch (level) {
      case 1: return 'text-3xl md:text-4xl font-bold';
      case 2: return 'text-xl md:text-2xl font-bold';
      case 3: return 'text-lg md:text-xl font-semibold';
      case 4: return 'text-base md:text-lg font-medium';
      default: return 'text-xl md:text-2xl font-bold';
    }
  };

  const Tag = `h${level}` as keyof JSX.IntrinsicElements;

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <Tag className={`${getHeadingClasses()} text-gray-900`}>
        {children}
      </Tag>
      {badge && (
        typeof badge === 'string' ? (
          <Badge variant="secondary">{badge}</Badge>
        ) : (
          badge
        )
      )}
    </div>
  );
};

// Section Subtitle Component
interface SectionSubtitleProps {
  children: React.ReactNode;
  className?: string;
}

const SectionSubtitle: React.FC<SectionSubtitleProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <h3 className={`text-sm md:text-base text-gray-600 font-medium ${className}`}>
      {children}
    </h3>
  );
};

// Section Description Component
interface SectionDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

const SectionDescription: React.FC<SectionDescriptionProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <p className={`text-sm text-gray-600 leading-relaxed ${className}`}>
      {children}
    </p>
  );
};

// Section Actions Component
interface SectionActionsProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'right' | 'center' | 'between';
}

const SectionActions: React.FC<SectionActionsProps> = ({ 
  children, 
  className = '',
  align = 'right'
}) => {
  const getAlignClasses = () => {
    switch (align) {
      case 'left': return 'justify-start';
      case 'center': return 'justify-center';
      case 'between': return 'justify-between';
      default: return 'justify-end';
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${getAlignClasses()} ${className}`}>
      {children}
    </div>
  );
};

// Section Content Component
interface SectionContentProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  isCollapsed?: boolean;
}

const SectionContent: React.FC<SectionContentProps> = ({ 
  children, 
  className = '',
  padding = 'md',
  isCollapsed = false
}) => {
  const getPaddingClasses = () => {
    switch (padding) {
      case 'none': return '';
      case 'sm': return 'p-2';
      case 'lg': return 'p-6';
      default: return 'p-4';
    }
  };

  if (isCollapsed) {
    return null;
  }

  return (
    <div className={`${getPaddingClasses()} ${className}`}>
      {children}
    </div>
  );
};

// Section Footer Component
interface SectionFooterProps {
  children: React.ReactNode;
  className?: string;
  withSeparator?: boolean;
}

const SectionFooter: React.FC<SectionFooterProps> = ({ 
  children, 
  className = '',
  withSeparator = true
}) => {
  return (
    <>
      {withSeparator && <Separator />}
      <div className={`p-4 bg-gray-50/50 rounded-b-lg ${className}`}>
        {children}
      </div>
    </>
  );
};

// Attach sub-components to main component
Section.Header = SectionHeader;
Section.Title = SectionTitle;
Section.Subtitle = SectionSubtitle;
Section.Description = SectionDescription;
Section.Actions = SectionActions;
Section.Content = SectionContent;
Section.Footer = SectionFooter;

export default Section;