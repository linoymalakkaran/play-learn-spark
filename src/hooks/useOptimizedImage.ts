/**
 * React hook for optimized image loading
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { assetOptimizationService } from '@/services/AssetOptimizationService';

interface UseOptimizedImageOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
  lazy?: boolean;
  placeholder?: string;
}

export function useOptimizedImage(src: string, options: UseOptimizedImageOptions = {}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [optimizedSrc, setOptimizedSrc] = useState<string>('');
  const imgRef = useRef<HTMLImageElement>(null);

  const {
    width,
    height,
    quality = 85,
    format = 'webp',
    lazy = true,
    placeholder
  } = options;

  // Generate optimized source
  useEffect(() => {
    if (src) {
      const optimized = assetOptimizationService.optimizeImage(src, {
        width,
        height,
        quality,
        format,
        lazy
      });
      setOptimizedSrc(optimized);
    }
  }, [src, width, height, quality, format, lazy]);

  // Handle image loading
  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    setIsLoading(false);
    setError(null);
  }, []);

  const handleError = useCallback(() => {
    setIsLoaded(false);
    setIsLoading(false);
    setError('Failed to load image');
  }, []);

  const handleLoadStart = useCallback(() => {
    setIsLoading(true);
    setError(null);
  }, []);

  // Setup image element
  useEffect(() => {
    const img = imgRef.current;
    if (!img || !optimizedSrc) return;

    img.addEventListener('load', handleLoad);
    img.addEventListener('error', handleError);
    img.addEventListener('loadstart', handleLoadStart);

    return () => {
      img.removeEventListener('load', handleLoad);
      img.removeEventListener('error', handleError);
      img.removeEventListener('loadstart', handleLoadStart);
    };
  }, [optimizedSrc, handleLoad, handleError, handleLoadStart]);

  const imgProps = {
    ref: imgRef,
    src: optimizedSrc,
    onLoad: handleLoad,
    onError: handleError,
    onLoadStart: handleLoadStart,
    style: {
      opacity: isLoaded ? 1 : 0,
      transition: 'opacity 0.3s ease-in-out'
    }
  };

  return {
    imgRef,
    imgProps,
    isLoaded,
    isLoading,
    error,
    optimizedSrc
  };
}

export function useImagePreloader(urls: string[]) {
  const [preloadedCount, setPreloadedCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (urls.length === 0) {
      setIsComplete(true);
      return;
    }

    let loadedCount = 0;
    const images: HTMLImageElement[] = [];

    const handleLoad = () => {
      loadedCount++;
      setPreloadedCount(loadedCount);
      
      if (loadedCount === urls.length) {
        setIsComplete(true);
      }
    };

    const handleError = () => {
      loadedCount++;
      setPreloadedCount(loadedCount);
      
      if (loadedCount === urls.length) {
        setIsComplete(true);
      }
    };

    urls.forEach((url) => {
      const img = new Image();
      img.addEventListener('load', handleLoad);
      img.addEventListener('error', handleError);
      
      const optimizedUrl = assetOptimizationService.optimizeImage(url, {
        format: 'webp',
        quality: 85
      });
      
      img.src = optimizedUrl;
      images.push(img);
    });

    return () => {
      images.forEach((img) => {
        img.removeEventListener('load', handleLoad);
        img.removeEventListener('error', handleError);
      });
    };
  }, [urls]);

  return {
    preloadedCount,
    totalCount: urls.length,
    isComplete,
    progress: urls.length > 0 ? (preloadedCount / urls.length) * 100 : 100
  };
}

export function useLazyImage(threshold = 0.1, rootMargin = '50px') {
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(img);
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    observer.observe(img);

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return {
    imgRef,
    isInView
  };
}

export function useAssetOptimizationStats() {
  const [stats, setStats] = useState({
    cachedImages: 0,
    preloadedFonts: 0,
    lazyImagesCount: 0,
    webpSupported: false
  });

  const updateStats = useCallback(() => {
    const currentStats = assetOptimizationService.getStats();
    setStats(currentStats);
  }, []);

  useEffect(() => {
    updateStats();
    
    // Update stats periodically
    const interval = setInterval(updateStats, 5000);
    
    return () => clearInterval(interval);
  }, [updateStats]);

  return {
    stats,
    updateStats
  };
}