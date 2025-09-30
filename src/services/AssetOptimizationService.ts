/**
 * Asset optimization service for improved performance
 */

interface ImageOptimizationOptions {
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
  quality?: number;
  width?: number;
  height?: number;
  lazy?: boolean;
}

interface FontPreloadOptions {
  family: string;
  weight?: string | number;
  style?: string;
  display?: 'swap' | 'fallback' | 'optional';
}

class AssetOptimizationService {
  private imageCache = new Map<string, string>();
  private fontCache = new Set<string>();
  private observerSupported = typeof IntersectionObserver !== 'undefined';

  /**
   * Initialize asset optimization
   */
  initialize(): void {
    this.setupImageOptimization();
    this.preloadCriticalFonts();
    this.setupServiceWorker();
    
    console.log('🚀 Asset Optimization Service initialized');
  }

  /**
   * Optimize image loading with lazy loading and format detection
   */
  optimizeImage(src: string, options: ImageOptimizationOptions = {}): string {
    const {
      format = 'webp',
      quality = 85,
      width,
      height,
      lazy = true
    } = options;

    // Check cache first
    const cacheKey = `${src}-${format}-${quality}-${width}-${height}`;
    if (this.imageCache.has(cacheKey)) {
      return this.imageCache.get(cacheKey)!;
    }

    // Generate optimized image URL
    let optimizedSrc = src;

    // If using a CDN or image service, append optimization parameters
    if (this.isExternalImage(src)) {
      optimizedSrc = this.addImageOptimizationParams(src, {
        format,
        quality,
        width,
        height
      });
    }

    // Cache the optimized URL
    this.imageCache.set(cacheKey, optimizedSrc);

    return optimizedSrc;
  }

  /**
   * Create optimized image element with lazy loading
   */
  createOptimizedImage(
    src: string, 
    alt: string, 
    options: ImageOptimizationOptions = {}
  ): HTMLImageElement {
    const img = document.createElement('img');
    const optimizedSrc = this.optimizeImage(src, options);

    img.alt = alt;
    img.setAttribute('data-src', optimizedSrc);

    // Add responsive image attributes
    if (options.width && options.height) {
      img.width = options.width;
      img.height = options.height;
    }

    // Setup lazy loading
    if (options.lazy && this.observerSupported) {
      img.classList.add('lazy-image');
      img.src = this.generatePlaceholder(options.width, options.height);
      this.setupLazyLoading(img);
    } else {
      img.src = optimizedSrc;
    }

    // Add WebP support with fallback
    if (this.supportsWebP()) {
      const picture = document.createElement('picture');
      const sourceWebP = document.createElement('source');
      sourceWebP.srcset = this.optimizeImage(src, { ...options, format: 'webp' });
      sourceWebP.type = 'image/webp';
      
      picture.appendChild(sourceWebP);
      picture.appendChild(img);
      
      return picture as any; // Return picture element
    }

    return img;
  }

  /**
   * Setup lazy loading for images
   */
  private setupLazyLoading(img: HTMLImageElement): void {
    if (!this.observerSupported) {
      // Fallback for browsers without IntersectionObserver
      img.src = img.getAttribute('data-src') || '';
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const lazyImg = entry.target as HTMLImageElement;
          const src = lazyImg.getAttribute('data-src');
          
          if (src) {
            lazyImg.src = src;
            lazyImg.classList.remove('lazy-image');
            lazyImg.classList.add('lazy-loaded');
            observer.unobserve(lazyImg);
          }
        }
      });
    }, {
      rootMargin: '50px 0px', // Start loading 50px before entering viewport
      threshold: 0.01
    });

    observer.observe(img);
  }

  /**
   * Generate placeholder image
   */
  private generatePlaceholder(width?: number, height?: number): string {
    const w = width || 400;
    const h = height || 300;
    
    // Generate a simple SVG placeholder
    const svg = `
      <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f0f0f0"/>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="14" 
              fill="#999" text-anchor="middle" dy=".3em">Loading...</text>
      </svg>
    `;
    
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  /**
   * Check if browser supports WebP
   */
  private supportsWebP(): boolean {
    if (typeof window === 'undefined') return false;
    
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }

  /**
   * Check if image is external
   */
  private isExternalImage(src: string): boolean {
    return src.startsWith('http') || src.startsWith('//');
  }

  /**
   * Add optimization parameters to image URL
   */
  private addImageOptimizationParams(
    src: string, 
    options: Required<Pick<ImageOptimizationOptions, 'format' | 'quality' | 'width' | 'height'>>
  ): string {
    // This would be customized based on your CDN/image service
    // Example for Cloudinary, ImageKit, etc.
    const url = new URL(src);
    
    if (options.width) url.searchParams.set('w', options.width.toString());
    if (options.height) url.searchParams.set('h', options.height.toString());
    url.searchParams.set('q', options.quality.toString());
    url.searchParams.set('f', options.format);
    
    return url.toString();
  }

  /**
   * Setup image optimization for existing images
   */
  private setupImageOptimization(): void {
    // Optimize existing images on page
    const images = document.querySelectorAll('img:not(.lazy-image)');
    
    images.forEach((img) => {
      const htmlImg = img as HTMLImageElement;
      
      if (!htmlImg.hasAttribute('data-optimized')) {
        const src = htmlImg.src;
        const alt = htmlImg.alt;
        
        // Mark as optimized to prevent re-processing
        htmlImg.setAttribute('data-optimized', 'true');
        
        // Setup lazy loading for images below the fold
        const rect = htmlImg.getBoundingClientRect();
        if (rect.top > window.innerHeight) {
          htmlImg.setAttribute('data-src', src);
          htmlImg.src = this.generatePlaceholder(htmlImg.width, htmlImg.height);
          htmlImg.classList.add('lazy-image');
          this.setupLazyLoading(htmlImg);
        }
      }
    });
  }

  /**
   * Preload critical fonts
   */
  preloadCriticalFonts(): void {
    const criticalFonts: FontPreloadOptions[] = [
      { family: 'Comic Neue', weight: '400', style: 'normal', display: 'swap' },
      { family: 'Comic Neue', weight: '700', style: 'normal', display: 'swap' },
      { family: 'Fredoka One', weight: '400', style: 'normal', display: 'swap' }
    ];

    criticalFonts.forEach((font) => {
      this.preloadFont(font);
    });
  }

  /**
   * Preload a specific font
   */
  preloadFont(options: FontPreloadOptions): void {
    const { family, weight = '400', style = 'normal', display = 'swap' } = options;
    const fontKey = `${family}-${weight}-${style}`;

    if (this.fontCache.has(fontKey)) return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.type = 'font/woff2';
    link.crossOrigin = 'anonymous';
    
    // This would need to be updated with actual font URLs
    // For Google Fonts or custom font hosting
    const fontUrl = this.generateFontUrl(family, weight, style);
    link.href = fontUrl;

    document.head.appendChild(link);
    this.fontCache.add(fontKey);

    // Also add font-display CSS
    this.addFontDisplayCSS(family, display);
  }

  /**
   * Generate font URL
   */
  private generateFontUrl(family: string, weight: string | number, style: string): string {
    // This is a placeholder - would be customized for your font source
    const familyParam = family.replace(/\s+/g, '+');
    return `https://fonts.gstatic.com/s/${familyParam.toLowerCase()}/${weight}/${style}.woff2`;
  }

  /**
   * Add font-display CSS
   */
  private addFontDisplayCSS(family: string, display: string): void {
    const styleId = `font-display-${family.replace(/\s+/g, '-').toLowerCase()}`;
    
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @font-face {
        font-family: '${family}';
        font-display: ${display};
      }
    `;
    
    document.head.appendChild(style);
  }

  /**
   * Setup service worker for caching
   */
  private setupServiceWorker(): void {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('🔧 Service Worker registered:', registration);
          
          // Handle updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New content available
                  this.notifyUserOfUpdate();
                }
              });
            }
          });
        })
        .catch((error) => {
          console.warn('Service Worker registration failed:', error);
        });
    }
  }

  /**
   * Notify user of service worker update
   */
  private notifyUserOfUpdate(): void {
    // This could integrate with your notification system
    console.log('📦 New app version available! Refresh to update.');
    
    // Example: Show a toast notification
    if (typeof window !== 'undefined' && 'CustomEvent' in window) {
      window.dispatchEvent(new CustomEvent('app-update-available'));
    }
  }

  /**
   * Prefetch critical assets
   */
  prefetchAsset(url: string, type: 'script' | 'style' | 'image' | 'font' = 'image'): void {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    
    if (type === 'font') {
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
    } else if (type === 'style') {
      link.as = 'style';
    } else if (type === 'script') {
      link.as = 'script';
    } else {
      link.as = 'image';
    }
    
    document.head.appendChild(link);
  }

  /**
   * Get optimization statistics
   */
  getStats(): {
    cachedImages: number;
    preloadedFonts: number;
    lazyImagesCount: number;
    webpSupported: boolean;
  } {
    return {
      cachedImages: this.imageCache.size,
      preloadedFonts: this.fontCache.size,
      lazyImagesCount: document.querySelectorAll('.lazy-image').length,
      webpSupported: this.supportsWebP()
    };
  }
}

// Export singleton instance
export const assetOptimizationService = new AssetOptimizationService();
export default assetOptimizationService;