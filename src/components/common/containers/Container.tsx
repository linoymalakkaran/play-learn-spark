import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface ContainerProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  description?: string;
  headerActions?: React.ReactNode;
  variant?: 'card' | 'glass' | 'simple' | 'gradient';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  spacing?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  contentClassName?: string;
  headerClassName?: string;
}

const Container: React.FC<ContainerProps> = ({
  children,
  title,
  subtitle,
  description,
  headerActions,
  variant = 'card',
  padding = 'md',
  spacing = 'md',
  className = '',
  contentClassName = '',
  headerClassName = ''
}) => {
  const getPaddingClasses = () => {
    switch (padding) {
      case 'none': return '';
      case 'sm': return 'p-2';
      case 'lg': return 'p-8';
      case 'xl': return 'p-12';
      default: return 'p-6';
    }
  };

  const getSpacingClasses = () => {
    switch (spacing) {
      case 'none': return '';
      case 'sm': return 'space-y-2';
      case 'lg': return 'space-y-8';
      case 'xl': return 'space-y-12';
      default: return 'space-y-6';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'glass':
        return 'bg-white/80 backdrop-blur-md border border-white/20 shadow-xl rounded-2xl';
      case 'gradient':
        return 'bg-gradient-to-br from-white via-purple-50/50 to-pink-50/50 border border-purple-100 shadow-lg rounded-2xl';
      case 'simple':
        return 'bg-transparent';
      default:
        return 'bg-white border border-gray-200 shadow-sm rounded-xl';
    }
  };

  const hasHeader = title || subtitle || description || headerActions;

  if (variant === 'simple') {
    return (
      <div className={`${getPaddingClasses()} ${className}`}>
        {hasHeader && (
          <div className={`mb-6 ${headerClassName}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {title && (
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {title}
                  </h2>
                )}
                {subtitle && (
                  <h3 className="text-lg text-gray-600 mb-2">
                    {subtitle}
                  </h3>
                )}
                {description && (
                  <p className="text-gray-600">
                    {description}
                  </p>
                )}
              </div>
              {headerActions && (
                <div className="flex items-center space-x-2">
                  {headerActions}
                </div>
              )}
            </div>
            {hasHeader && <Separator className="mt-4" />}
          </div>
        )}
        <div className={`${getSpacingClasses()} ${contentClassName}`}>
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className={`${getVariantClasses()} ${className}`}>
      {hasHeader && (
        <CardHeader className={headerClassName}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {title && (
                <CardTitle className="text-xl md:text-2xl font-bold">
                  {title}
                </CardTitle>
              )}
              {subtitle && (
                <h3 className="text-base md:text-lg text-muted-foreground mt-1">
                  {subtitle}
                </h3>
              )}
              {description && (
                <p className="text-sm text-muted-foreground mt-2">
                  {description}
                </p>
              )}
            </div>
            {headerActions && (
              <div className="flex items-center space-x-2">
                {headerActions}
              </div>
            )}
          </div>
        </CardHeader>
      )}
      
      <CardContent className={`${hasHeader ? '' : getPaddingClasses()} ${contentClassName}`}>
        <div className={getSpacingClasses()}>
          {children}
        </div>
      </CardContent>
    </div>
  );
};

export default Container;