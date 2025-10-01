/**
 * Optimized Image Component with lazy loading and performance features
 */

import React, { forwardRef } from 'react';
import { useOptimizedImage, useLazyImage } from '@/hooks/useOptimizedImage';
import { Skeleton } from '@/components/ui/skeleton';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
  lazy?: boolean;
  placeholder?: string;
  fallback?: string;
  className?: string;
  containerClassName?: string;
  showSkeleton?: boolean;
  aspectRatio?: string;
}

export const OptimizedImage = forwardRef<HTMLImageElement, OptimizedImageProps>(({
  src,
  alt,
  width,
  height,
  quality = 85,
  format = 'webp',
  lazy = true,
  placeholder,
  fallback,
  className = '',
  containerClassName = '',
  showSkeleton = true,
  aspectRatio,
  ...props
}, ref) => {
  const { imgProps, isLoaded, isLoading, error } = useOptimizedImage(src, {
    width,
    height,
    quality,
    format,
    lazy
  });

  const { imgRef: lazyRef, isInView } = useLazyImage();

  // Combine refs
  const combinedRef = (node: HTMLImageElement | null) => {
    if (ref) {
      if (typeof ref === 'function') {
        ref(node);
      } else {
        ref.current = node;
      }
    }
    if (lazyRef) {
      lazyRef.current = node;
    }
    // Note: imgProps.ref is handled internally by useOptimizedImage
  };

  // Show skeleton while loading
  if (showSkeleton && (isLoading || (lazy && !isInView))) {
    return (
      <div 
        className={`relative overflow-hidden ${containerClassName}`}
        style={{
          width: width ? `${width}px` : '100%',
          height: height ? `${height}px` : 'auto',
          aspectRatio: aspectRatio || (width && height ? `${width}/${height}` : undefined)
        }}
      >
        <Skeleton className="absolute inset-0 w-full h-full" />
        {lazy && (
          <img
            ref={lazyRef}
            src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
            alt=""
            className="opacity-0 w-full h-full"
            style={{ aspectRatio: aspectRatio || (width && height ? `${width}/${height}` : undefined) }}
          />
        )}
      </div>
    );
  }

  // Show error fallback
  if (error) {
    if (fallback) {
      return (
        <img
          ref={combinedRef}
          src={fallback}
          alt={alt}
          className={className}
          width={width}
          height={height}
          {...props}
        />
      );
    }
    
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 text-gray-400 ${className}`}
        style={{
          width: width ? `${width}px` : '100%',
          height: height ? `${height}px` : '200px',
          aspectRatio: aspectRatio || (width && height ? `${width}/${height}` : undefined)
        }}
      >
        <span className="text-sm">Image unavailable</span>
      </div>
    );
  }

  // Render optimized image
  return (
    <div className={`relative ${containerClassName}`}>
      {showSkeleton && !isLoaded && (
        <Skeleton 
          className="absolute inset-0 w-full h-full" 
          style={{ aspectRatio: aspectRatio || (width && height ? `${width}/${height}` : undefined) }}
        />
      )}
      
      <img
        {...imgProps}
        {...props}
        ref={combinedRef}
        alt={alt}
        width={width}
        height={height}
        className={`transition-opacity duration-300 ${className} ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        style={{
          ...imgProps.style,
          aspectRatio: aspectRatio || (width && height ? `${width}/${height}` : undefined),
          ...props.style
        }}
        loading={lazy ? 'lazy' : 'eager'}
        decoding="async"
      />
    </div>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

export default OptimizedImage;