import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { debounce, throttle } from 'lodash';

// Types for performance optimization
export interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  bundleSize: number;
  networkLatency: number;
  cacheHitRate: number;
  errorRate: number;
  userInteractionDelay: number;
}

export interface ComponentPerformanceData {
  componentName: string;
  renderCount: number;
  averageRenderTime: number;
  memoryLeaks: number;
  reRenderReasons: string[];
  optimizationSuggestions: string[];
}

export interface VirtualScrollConfig {
  itemHeight: number;
  containerHeight: number;
  overscan: number;
  threshold: number;
}

export interface ImageOptimizationConfig {
  quality: number;
  format: 'webp' | 'avif' | 'jpeg' | 'png';
  lazy: boolean;
  placeholder: 'blur' | 'empty' | 'skeleton';
  sizes: string;
}

// Performance Monitoring Hook
export const usePerformanceMonitor = (componentName: string) => {
  const [metrics, setMetrics] = useState<ComponentPerformanceData>({
    componentName,
    renderCount: 0,
    averageRenderTime: 0,
    memoryLeaks: 0,
    reRenderReasons: [],
    optimizationSuggestions: []
  });

  const renderStartTime = useRef<number>(0);
  const previousProps = useRef<any>(null);
  const previousState = useRef<any>(null);

  const startRender = useCallback(() => {
    renderStartTime.current = performance.now();
  }, []);

  const endRender = useCallback(() => {
    const renderTime = performance.now() - renderStartTime.current;
    setMetrics(prev => ({
      ...prev,
      renderCount: prev.renderCount + 1,
      averageRenderTime: (prev.averageRenderTime * prev.renderCount + renderTime) / (prev.renderCount + 1)
    }));
  }, []);

  const trackReRender = useCallback((props: any, state?: any) => {
    const reasons: string[] = [];
    
    if (previousProps.current) {
      Object.keys(props).forEach(key => {
        if (previousProps.current[key] !== props[key]) {
          reasons.push(`Props changed: ${key}`);
        }
      });
    }

    if (state && previousState.current) {
      Object.keys(state).forEach(key => {
        if (previousState.current[key] !== state[key]) {
          reasons.push(`State changed: ${key}`);
        }
      });
    }

    if (reasons.length > 0) {
      setMetrics(prev => ({
        ...prev,
        reRenderReasons: [...prev.reRenderReasons, ...reasons].slice(-10) // Keep last 10
      }));
    }

    previousProps.current = props;
    previousState.current = state;
  }, []);

  const generateOptimizationSuggestions = useCallback(() => {
    const suggestions: string[] = [];
    
    if (metrics.renderCount > 100 && metrics.averageRenderTime > 16) {
      suggestions.push('Consider using React.memo() to prevent unnecessary re-renders');
    }
    
    if (metrics.reRenderReasons.filter(r => r.includes('Props changed')).length > 50) {
      suggestions.push('Consider using useMemo() or useCallback() for props');
    }
    
    if (metrics.averageRenderTime > 50) {
      suggestions.push('Consider code splitting or lazy loading for this component');
    }

    setMetrics(prev => ({ ...prev, optimizationSuggestions: suggestions }));
  }, [metrics]);

  useEffect(() => {
    generateOptimizationSuggestions();
  }, [generateOptimizationSuggestions]);

  return {
    metrics,
    startRender,
    endRender,
    trackReRender
  };
};

// Memory Leak Detection
export class MemoryLeakDetector {
  private static instance: MemoryLeakDetector;
  private componentInstances: Map<string, number> = new Map();
  private memorySnapshots: number[] = [];
  private intervalId: NodeJS.Timeout | null = null;

  static getInstance(): MemoryLeakDetector {
    if (!MemoryLeakDetector.instance) {
      MemoryLeakDetector.instance = new MemoryLeakDetector();
    }
    return MemoryLeakDetector.instance;
  }

  startMonitoring(): void {
    this.intervalId = setInterval(() => {
      if ('memory' in performance) {
        const memInfo = (performance as any).memory;
        this.memorySnapshots.push(memInfo.usedJSHeapSize);
        
        // Keep only last 100 snapshots
        if (this.memorySnapshots.length > 100) {
          this.memorySnapshots.shift();
        }
        
        this.detectLeaks();
      }
    }, 5000); // Check every 5 seconds
  }

  stopMonitoring(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  registerComponent(componentName: string): void {
    const count = this.componentInstances.get(componentName) || 0;
    this.componentInstances.set(componentName, count + 1);
  }

  unregisterComponent(componentName: string): void {
    const count = this.componentInstances.get(componentName) || 0;
    if (count > 0) {
      this.componentInstances.set(componentName, count - 1);
    }
  }

  private detectLeaks(): void {
    if (this.memorySnapshots.length < 10) return;

    const recent = this.memorySnapshots.slice(-10);
    const trend = this.calculateTrend(recent);
    
    if (trend > 1000000) { // 1MB increase trend
      console.warn('Potential memory leak detected:', {
        trend: `${(trend / 1024 / 1024).toFixed(2)}MB increase`,
        components: Array.from(this.componentInstances.entries())
      });
    }
  }

  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;
    
    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = values.reduce((sum, val, index) => sum + index * val, 0);
    const sumXX = (n * (n - 1) * (2 * n - 1)) / 6;
    
    return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  }

  getMemoryReport(): any {
    return {
      currentInstances: Array.from(this.componentInstances.entries()),
      memoryTrend: this.memorySnapshots.length > 1 ? 
        this.calculateTrend(this.memorySnapshots) : 0,
      averageMemoryUsage: this.memorySnapshots.length > 0 ?
        this.memorySnapshots.reduce((sum, val) => sum + val, 0) / this.memorySnapshots.length : 0
    };
  }
}

// Virtual Scrolling Hook
export const useVirtualScroll = <T>(
  items: T[],
  config: VirtualScrollConfig
) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(config.containerHeight);

  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / config.itemHeight) - config.overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / config.itemHeight) + config.overscan
    );
    return { startIndex, endIndex };
  }, [scrollTop, containerHeight, config.itemHeight, config.overscan, items.length]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1).map((item, index) => ({
      item,
      index: visibleRange.startIndex + index
    }));
  }, [items, visibleRange]);

  const totalHeight = items.length * config.itemHeight;
  const offsetY = visibleRange.startIndex * config.itemHeight;

  const handleScroll = useCallback(
    throttle((event: React.UIEvent<HTMLDivElement>) => {
      setScrollTop(event.currentTarget.scrollTop);
    }, 16), // 60fps
    []
  );

  return {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
    setContainerHeight
  };
};

// Image Optimization Hook
export const useOptimizedImage = (
  src: string,
  config: ImageOptimizationConfig
) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(!config.lazy);
  const [error, setError] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!config.lazy || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [config.lazy, isInView]);

  // Generate optimized src
  const optimizedSrc = useMemo(() => {
    if (!isInView) return '';
    
    // This would integrate with your image optimization service
    const params = new URLSearchParams({
      q: config.quality.toString(),
      f: config.format,
      w: '800', // Default width, should be dynamic
      h: '600'  // Default height, should be dynamic
    });
    
    return `${src}?${params.toString()}`;
  }, [src, config, isInView]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    setError(null);
  }, []);

  const handleError = useCallback(() => {
    setError('Failed to load image');
    setIsLoaded(false);
  }, []);

  return {
    src: optimizedSrc,
    isLoaded,
    isInView,
    error,
    imgRef,
    onLoad: handleLoad,
    onError: handleError
  };
};

// Component Memoization Utilities
export const createMemoizedComponent = <P extends object>(
  Component: React.ComponentType<P>,
  propsAreEqual?: (prevProps: P, nextProps: P) => boolean
) => {
  const MemoizedComponent = React.memo(Component, propsAreEqual);
  MemoizedComponent.displayName = `Memoized(${Component.displayName || Component.name})`;
  return MemoizedComponent;
};

export const createDeepMemoizedComponent = <P extends object>(
  Component: React.ComponentType<P>
) => {
  return createMemoizedComponent(Component, (prevProps, nextProps) => {
    return JSON.stringify(prevProps) === JSON.stringify(nextProps);
  });
};

// Performance Optimization Utilities
export class PerformanceOptimizer {
  private static bundleAnalyzer: any = null;
  private static performanceObserver: PerformanceObserver | null = null;

  static initializeBundleAnalyzer(): void {
    if (typeof window === 'undefined') return;

    // Initialize bundle analyzer for development
    if (process.env.NODE_ENV === 'development') {
      this.bundleAnalyzer = {
        chunks: new Map(),
        totalSize: 0,
        loadTimes: new Map()
      };
    }
  }

  static startPerformanceObserver(): void {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

    this.performanceObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      entries.forEach((entry) => {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming;
          console.log('Navigation Performance:', {
            domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
            loadComplete: navEntry.loadEventEnd - navEntry.loadEventStart,
            firstPaint: navEntry.responseEnd - navEntry.requestStart
          });
        }
        
        if (entry.entryType === 'resource') {
          const resourceEntry = entry as PerformanceResourceTiming;
          console.log('Resource Performance:', {
            name: resourceEntry.name,
            duration: resourceEntry.duration,
            size: resourceEntry.transferSize || 0
          });
        }
      });
    });

    this.performanceObserver.observe({ 
      entryTypes: ['navigation', 'resource', 'paint', 'largest-contentful-paint'] 
    });
  }

  static measureComponentPerformance<T extends any[], R>(
    fn: (...args: T) => R,
    componentName: string
  ): (...args: T) => R {
    return (...args: T): R => {
      const start = performance.now();
      const result = fn(...args);
      const end = performance.now();
      
      console.log(`${componentName} execution time: ${end - start}ms`);
      
      return result;
    };
  }

  static createOptimizedEventHandler<T extends Event>(
    handler: (event: T) => void,
    delay: number = 100,
    type: 'debounce' | 'throttle' = 'debounce'
  ): (event: T) => void {
    return type === 'debounce' 
      ? debounce(handler, delay)
      : throttle(handler, delay);
  }

  static preloadCriticalResources(resources: string[]): void {
    if (typeof window === 'undefined') return;

    resources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource;
      
      if (resource.endsWith('.js')) {
        link.as = 'script';
      } else if (resource.endsWith('.css')) {
        link.as = 'style';
      } else if (resource.match(/\.(jpg|jpeg|png|webp|avif)$/)) {
        link.as = 'image';
      }
      
      document.head.appendChild(link);
    });
  }

  static enableServiceWorker(): void {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('Service Worker registered:', registration);
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error);
      });
  }

  static getPerformanceReport(): PerformanceMetrics {
    if (typeof window === 'undefined') {
      return {
        renderTime: 0,
        memoryUsage: 0,
        bundleSize: 0,
        networkLatency: 0,
        cacheHitRate: 0,
        errorRate: 0,
        userInteractionDelay: 0
      };
    }

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const memory = (performance as any).memory;

    return {
      renderTime: navigation ? navigation.loadEventEnd - navigation.loadEventStart : 0,
      memoryUsage: memory ? memory.usedJSHeapSize : 0,
      bundleSize: this.calculateBundleSize(),
      networkLatency: navigation ? navigation.responseStart - navigation.requestStart : 0,
      cacheHitRate: this.calculateCacheHitRate(),
      errorRate: this.calculateErrorRate(),
      userInteractionDelay: this.calculateInteractionDelay()
    };
  }

  private static calculateBundleSize(): number {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    return resources
      .filter(resource => resource.name.includes('.js') || resource.name.includes('.css'))
      .reduce((total, resource) => total + (resource.transferSize || 0), 0);
  }

  private static calculateCacheHitRate(): number {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const cached = resources.filter(resource => resource.transferSize === 0).length;
    return resources.length > 0 ? (cached / resources.length) * 100 : 0;
  }

  private static calculateErrorRate(): number {
    // This would integrate with your error tracking system
    return 0; // Placeholder
  }

  private static calculateInteractionDelay(): number {
    // This would measure First Input Delay (FID)
    return 0; // Placeholder
  }
}

// React Suspense Utilities
export const createSuspenseWrapper = <P extends object>(
  Component: any,
  fallback: any = null
) => {
  return (props: P) => {
    // This would be implemented with React.Suspense in a React component file
    return Component(props);
  };
};

// Code Splitting Utilities
export const createLazyComponent = <P extends object>(
  importFn: () => Promise<{ default: any }>,
  fallback?: any
) => {
  // This would be implemented with React.lazy in a React component file
  return importFn;
};

// Export performance optimization instance
export const performanceOptimizer = PerformanceOptimizer;
export const memoryLeakDetector = MemoryLeakDetector.getInstance();

// Initialize performance monitoring
if (typeof window !== 'undefined') {
  PerformanceOptimizer.initializeBundleAnalyzer();
  PerformanceOptimizer.startPerformanceObserver();
  memoryLeakDetector.startMonitoring();
}

export default {
  usePerformanceMonitor,
  useVirtualScroll,
  useOptimizedImage,
  createMemoizedComponent,
  createDeepMemoizedComponent,
  createSuspenseWrapper,
  createLazyComponent,
  performanceOptimizer,
  memoryLeakDetector
};