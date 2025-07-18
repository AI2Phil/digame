import { useEffect, useCallback } from 'react';

export const usePerformanceOptimization = () => {
  // Preload critical resources
  const preloadCriticalResources = useCallback(() => {
    // Skip resource preloading in development to avoid 404 errors
    if (process.env.NODE_ENV === 'development') {
      console.log('Skipping resource preloading in development mode');
      return;
    }

    const criticalResources = [
      '/fonts/inter-var.woff2',
      '/icons/icon-192x192.png',
      '/api/user/profile'
    ];

    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      
      if (resource.endsWith('.woff2')) {
        link.as = 'font';
        link.type = 'font/woff2';
        link.crossOrigin = 'anonymous';
      } else if (resource.endsWith('.png') || resource.endsWith('.jpg') || resource.endsWith('.webp')) {
        link.as = 'image';
      } else if (resource.startsWith('/api/')) {
        link.as = 'fetch';
        link.crossOrigin = 'anonymous';
      }
      
      link.href = resource;
      document.head.appendChild(link);
    });
  }, []);

  // Optimize images with Intersection Observer
  const optimizeImages = useCallback(() => {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            
            // Load high-quality image
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
            }
            
            // Add fade-in animation
            img.style.opacity = '0';
            img.onload = () => {
              img.style.transition = 'opacity 0.3s';
              img.style.opacity = '1';
            };
            
            observer.unobserve(img);
          }
        });
      }, {
        rootMargin: '50px 0px',
        threshold: 0.01
      });

      // Observe all images with data-src attribute
      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });

      return () => imageObserver.disconnect();
    }
  }, []);

  // Optimize third-party scripts
  const optimizeThirdPartyScripts = useCallback(() => {
    // Skip third-party scripts in development environment
    if (process.env.NODE_ENV === 'development') {
      console.log('Skipping third-party scripts in development mode');
      return;
    }
    
    // Defer non-critical scripts (only in production)
    const deferredScripts = [
      'https://www.googletagmanager.com/gtag/js',
      'https://connect.facebook.net/en_US/fbevents.js'
    ];

    deferredScripts.forEach(src => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    });
  }, []);

  // Implement resource hints
  const addResourceHints = useCallback(() => {
    const hints = [
      { rel: 'dns-prefetch', href: '//fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' }
    ];

    // Only add external API hints in production
    if (process.env.NODE_ENV === 'production') {
      hints.push(
        { rel: 'dns-prefetch', href: '//www.google-analytics.com' },
        { rel: 'preconnect', href: 'https://api.digame.com', crossOrigin: 'anonymous' }
      );
    }

    hints.forEach(hint => {
      const link = document.createElement('link');
      link.rel = hint.rel;
      link.href = hint.href;
      if (hint.crossOrigin) {
        link.crossOrigin = hint.crossOrigin;
      }
      document.head.appendChild(link);
    });
  }, []);

  // Monitor and optimize Core Web Vitals
  const optimizeCoreWebVitals = useCallback(() => {
    // Reduce Cumulative Layout Shift (CLS)
    const preventLayoutShifts = () => {
      // Add size attributes to images without them
      document.querySelectorAll('img:not([width]):not([height])').forEach(img => {
        if (img.naturalWidth && img.naturalHeight) {
          img.setAttribute('width', img.naturalWidth);
          img.setAttribute('height', img.naturalHeight);
        }
      });

      // Reserve space for dynamic content
      document.querySelectorAll('[data-dynamic-content]').forEach(element => {
        if (!element.style.minHeight) {
          element.style.minHeight = '100px';
        }
      });
    };

    // Optimize Largest Contentful Paint (LCP)
    const optimizeLCP = () => {
      // Preload LCP candidate images
      const heroImages = document.querySelectorAll('.hero-image, .banner-image, [data-lcp]');
      heroImages.forEach(img => {
        if (img.src || img.dataset.src) {
          const link = document.createElement('link');
          link.rel = 'preload';
          link.as = 'image';
          link.href = img.src || img.dataset.src;
          document.head.appendChild(link);
        }
      });
    };

    // Optimize First Input Delay (FID)
    const optimizeFID = () => {
      // Break up long tasks
      const breakUpLongTasks = (callback) => {
        if ('scheduler' in window && 'postTask' in scheduler) {
          scheduler.postTask(callback, { priority: 'user-blocking' });
        } else {
          setTimeout(callback, 0);
        }
      };

      // Use this for heavy computations
      window.breakUpLongTasks = breakUpLongTasks;
    };

    preventLayoutShifts();
    optimizeLCP();
    optimizeFID();
  }, []);

  // Service Worker optimization
  const optimizeServiceWorker = useCallback(() => {
    if ('serviceWorker' in navigator) {
      // Update service worker strategy
      navigator.serviceWorker.addEventListener('message', event => {
        if (event.data && event.data.type === 'SKIP_WAITING') {
          window.location.reload();
        }
      });

      // Handle service worker updates
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    }
  }, []);

  useEffect(() => {
    // Run optimizations after DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        preloadCriticalResources();
        addResourceHints();
        optimizeCoreWebVitals();
        optimizeServiceWorker();
      });
    } else {
      preloadCriticalResources();
      addResourceHints();
      optimizeCoreWebVitals();
      optimizeServiceWorker();
    }

    // Run image optimization after load
    if (document.readyState === 'complete') {
      optimizeImages();
      optimizeThirdPartyScripts();
    } else {
      window.addEventListener('load', () => {
        optimizeImages();
        optimizeThirdPartyScripts();
      });
    }
  }, [
    preloadCriticalResources,
    addResourceHints,
    optimizeCoreWebVitals,
    optimizeServiceWorker,
    optimizeImages,
    optimizeThirdPartyScripts
  ]);

  return {
    preloadCriticalResources,
    optimizeImages,
    optimizeThirdPartyScripts,
    addResourceHints,
    optimizeCoreWebVitals,
    optimizeServiceWorker
  };
};

export default usePerformanceOptimization;