import { performanceApi } from './performanceApi';

export interface PerformanceOptimization {
  id: string;
  type: 'bundle' | 'runtime' | 'network' | 'memory' | 'rendering';
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: {
    performance: number; // 1-10 scale
    userExperience: number;
    maintainability: number;
  };
  effort: 'low' | 'medium' | 'high';
  estimatedTimeHours: number;
  implementation: {
    steps: string[];
    codeChanges: string[];
    dependencies?: string[];
  };
  metrics: {
    before: Record<string, number>;
    after?: Record<string, number>;
    improvement?: Record<string, number>;
  };
  status: 'pending' | 'in_progress' | 'completed' | 'deferred';
  createdAt: Date;
  completedAt?: Date;
}

export interface PerformanceMetrics {
  bundleSize: number;
  loadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  timeToInteractive: number;
  memoryUsage: number;
  jsHeapSize: number;
  domNodes: number;
  networkRequests: number;
  cacheHitRate: number;
}

export interface OptimizationRecommendation {
  category: string;
  recommendations: PerformanceOptimization[];
  totalImpact: number;
  totalEffort: number;
}

class PerformanceOptimizationService {
  private currentMetrics: PerformanceMetrics | null = null;
  private optimizations: PerformanceOptimization[] = [];
  private observers: PerformanceObserver[] = [];

  // Initialize performance monitoring
  async initialize(): Promise<void> {
    this.setupPerformanceObservers();
    await this.collectInitialMetrics();
    this.generateOptimizationRecommendations();
  }

  // Setup performance observers for real-time monitoring
  private setupPerformanceObservers(): void {
    if (typeof window === 'undefined') return;

    // Web Vitals Observer
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        if (lastEntry) {
          this.updateMetric('largestContentfulPaint', lastEntry.startTime);
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);

      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          this.updateMetric('firstInputDelay', entry.processingStart - entry.startTime);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.push(fidObserver);

      // Cumulative Layout Shift
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        this.updateMetric('cumulativeLayoutShift', clsValue);
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(clsObserver);
    }
  }

  // Collect initial performance metrics
  private async collectInitialMetrics(): Promise<void> {
    if (typeof window === 'undefined') return;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paint = performance.getEntriesByType('paint');
    
    const fcp = paint.find(entry => entry.name === 'first-contentful-paint');
    
    // Memory information (if available)
    const memory = (performance as any).memory;
    
    this.currentMetrics = {
      bundleSize: await this.estimateBundleSize(),
      loadTime: navigation ? navigation.loadEventEnd - navigation.fetchStart : 0,
      firstContentfulPaint: fcp ? fcp.startTime : 0,
      largestContentfulPaint: 0, // Will be updated by observer
      cumulativeLayoutShift: 0, // Will be updated by observer
      firstInputDelay: 0, // Will be updated by observer
      timeToInteractive: await this.calculateTimeToInteractive(),
      memoryUsage: memory ? memory.usedJSHeapSize : 0,
      jsHeapSize: memory ? memory.totalJSHeapSize : 0,
      domNodes: document.querySelectorAll('*').length,
      networkRequests: performance.getEntriesByType('resource').length,
      cacheHitRate: this.calculateCacheHitRate(),
    };
  }

  // Update a specific metric
  private updateMetric(metric: keyof PerformanceMetrics, value: number): void {
    if (this.currentMetrics) {
      this.currentMetrics[metric] = value;
      this.evaluateMetricThresholds(metric, value);
    }
  }

  // Evaluate if metric exceeds thresholds and create optimizations
  private evaluateMetricThresholds(metric: keyof PerformanceMetrics, value: number): void {
    const thresholds = {
      firstContentfulPaint: 1800, // 1.8s
      largestContentfulPaint: 2500, // 2.5s
      firstInputDelay: 100, // 100ms
      cumulativeLayoutShift: 0.1, // 0.1
      timeToInteractive: 3800, // 3.8s
      bundleSize: 500000, // 500KB
    };

    if (metric in thresholds && value > thresholds[metric as keyof typeof thresholds]) {
      this.createOptimizationForMetric(metric, value);
    }
  }

  // Create optimization recommendation for specific metric
  private createOptimizationForMetric(metric: keyof PerformanceMetrics, value: number): void {
    const optimizationMap: Record<string, Partial<PerformanceOptimization>> = {
      firstContentfulPaint: {
        type: 'rendering',
        title: 'Optimize First Contentful Paint',
        description: 'Reduce time to first contentful paint by optimizing critical rendering path',
        implementation: {
          steps: [
            'Minimize render-blocking resources',
            'Optimize CSS delivery',
            'Preload critical resources',
            'Use resource hints (preconnect, dns-prefetch)',
          ],
          codeChanges: [
            'Add <link rel="preload"> for critical CSS',
            'Inline critical CSS',
            'Defer non-critical JavaScript',
          ],
        },
      },
      largestContentfulPaint: {
        type: 'rendering',
        title: 'Optimize Largest Contentful Paint',
        description: 'Improve LCP by optimizing largest element loading',
        implementation: {
          steps: [
            'Optimize images and media',
            'Preload LCP element',
            'Remove render-blocking resources',
            'Use efficient image formats (WebP, AVIF)',
          ],
          codeChanges: [
            'Add <link rel="preload"> for LCP image',
            'Implement responsive images with srcset',
            'Use next-gen image formats',
          ],
        },
      },
      firstInputDelay: {
        type: 'runtime',
        title: 'Reduce First Input Delay',
        description: 'Minimize main thread blocking to improve interactivity',
        implementation: {
          steps: [
            'Break up long tasks',
            'Use web workers for heavy computations',
            'Optimize JavaScript execution',
            'Implement code splitting',
          ],
          codeChanges: [
            'Use React.lazy() for component splitting',
            'Implement requestIdleCallback for non-critical tasks',
            'Optimize event handlers',
          ],
        },
      },
      cumulativeLayoutShift: {
        type: 'rendering',
        title: 'Minimize Cumulative Layout Shift',
        description: 'Prevent unexpected layout shifts for better user experience',
        implementation: {
          steps: [
            'Set dimensions for images and videos',
            'Reserve space for dynamic content',
            'Avoid inserting content above existing content',
            'Use CSS aspect-ratio property',
          ],
          codeChanges: [
            'Add width/height attributes to images',
            'Use CSS aspect-ratio for responsive media',
            'Implement skeleton screens for loading states',
          ],
        },
      },
      bundleSize: {
        type: 'bundle',
        title: 'Reduce Bundle Size',
        description: 'Optimize bundle size to improve load times',
        implementation: {
          steps: [
            'Implement code splitting',
            'Remove unused dependencies',
            'Use tree shaking',
            'Optimize imports',
          ],
          codeChanges: [
            'Use dynamic imports for routes',
            'Import only needed functions from libraries',
            'Remove unused code and dependencies',
          ],
        },
      },
    };

    const baseOptimization = optimizationMap[metric];
    if (baseOptimization) {
      const optimization: PerformanceOptimization = {
        id: `${metric}-${Date.now()}`,
        priority: this.calculatePriority(metric, value),
        impact: this.calculateImpact(metric, value),
        effort: this.calculateEffort(metric),
        estimatedTimeHours: this.estimateTimeRequired(metric),
        metrics: {
          before: { [metric]: value },
        },
        status: 'pending',
        createdAt: new Date(),
        ...baseOptimization,
      } as PerformanceOptimization;

      this.optimizations.push(optimization);
    }
  }

  // Calculate priority based on metric and value
  private calculatePriority(metric: keyof PerformanceMetrics, value: number): 'critical' | 'high' | 'medium' | 'low' {
    const criticalThresholds = {
      firstContentfulPaint: 3000,
      largestContentfulPaint: 4000,
      firstInputDelay: 300,
      cumulativeLayoutShift: 0.25,
      bundleSize: 1000000,
    };

    if (metric in criticalThresholds && value > criticalThresholds[metric as keyof typeof criticalThresholds]) {
      return 'critical';
    }

    const highThresholds = {
      firstContentfulPaint: 2400,
      largestContentfulPaint: 3000,
      firstInputDelay: 200,
      cumulativeLayoutShift: 0.15,
      bundleSize: 750000,
    };

    if (metric in highThresholds && value > highThresholds[metric as keyof typeof highThresholds]) {
      return 'high';
    }

    return 'medium';
  }

  // Calculate impact scores
  private calculateImpact(metric: keyof PerformanceMetrics, value: number): { performance: number; userExperience: number; maintainability: number } {
    const impactMap = {
      firstContentfulPaint: { performance: 9, userExperience: 8, maintainability: 6 },
      largestContentfulPaint: { performance: 9, userExperience: 9, maintainability: 6 },
      firstInputDelay: { performance: 8, userExperience: 10, maintainability: 5 },
      cumulativeLayoutShift: { performance: 7, userExperience: 9, maintainability: 7 },
      bundleSize: { performance: 8, userExperience: 7, maintainability: 8 },
    };

    return impactMap[metric as keyof typeof impactMap] || { performance: 5, userExperience: 5, maintainability: 5 };
  }

  // Calculate effort required
  private calculateEffort(metric: keyof PerformanceMetrics): 'low' | 'medium' | 'high' {
    const effortMap = {
      firstContentfulPaint: 'medium',
      largestContentfulPaint: 'medium',
      firstInputDelay: 'high',
      cumulativeLayoutShift: 'low',
      bundleSize: 'high',
    };

    return effortMap[metric as keyof typeof effortMap] as 'low' | 'medium' | 'high' || 'medium';
  }

  // Estimate time required in hours
  private estimateTimeRequired(metric: keyof PerformanceMetrics): number {
    const timeMap = {
      firstContentfulPaint: 8,
      largestContentfulPaint: 6,
      firstInputDelay: 16,
      cumulativeLayoutShift: 4,
      bundleSize: 20,
    };

    return timeMap[metric as keyof typeof timeMap] || 8;
  }

  // Generate comprehensive optimization recommendations
  private generateOptimizationRecommendations(): void {
    if (!this.currentMetrics) return;

    // Bundle optimizations
    if (this.currentMetrics.bundleSize > 500000) {
      this.createBundleOptimizations();
    }

    // Runtime optimizations
    if (this.currentMetrics.memoryUsage > 50000000) { // 50MB
      this.createMemoryOptimizations();
    }

    // Network optimizations
    if (this.currentMetrics.networkRequests > 50) {
      this.createNetworkOptimizations();
    }
  }

  // Create bundle-specific optimizations
  private createBundleOptimizations(): void {
    const bundleOptimizations: Partial<PerformanceOptimization>[] = [
      {
        type: 'bundle',
        title: 'Implement Route-Based Code Splitting',
        description: 'Split code by routes to reduce initial bundle size',
        priority: 'high',
        effort: 'medium',
        estimatedTimeHours: 12,
        implementation: {
          steps: [
            'Implement React.lazy() for route components',
            'Add Suspense boundaries',
            'Configure webpack for optimal chunking',
          ],
          codeChanges: [
            'const Dashboard = React.lazy(() => Promise.resolve({ default: () => null }))',
            '<Suspense fallback={<Loading />}><Dashboard /></Suspense>',
          ],
        },
      },
      {
        type: 'bundle',
        title: 'Optimize Third-Party Dependencies',
        description: 'Reduce bundle size by optimizing external dependencies',
        priority: 'medium',
        effort: 'high',
        estimatedTimeHours: 16,
        implementation: {
          steps: [
            'Audit dependencies with webpack-bundle-analyzer',
            'Replace heavy libraries with lighter alternatives',
            'Use tree shaking for large libraries',
          ],
          codeChanges: [
            'import { debounce } from "lodash/debounce" // instead of entire lodash',
            'Use date-fns instead of moment.js',
          ],
        },
      },
    ];

    bundleOptimizations.forEach((opt, index) => {
      const optimization: PerformanceOptimization = {
        id: `bundle-${index}-${Date.now()}`,
        impact: { performance: 8, userExperience: 7, maintainability: 8 },
        metrics: { before: { bundleSize: this.currentMetrics!.bundleSize } },
        status: 'pending',
        createdAt: new Date(),
        ...opt,
      } as PerformanceOptimization;

      this.optimizations.push(optimization);
    });
  }

  // Create memory-specific optimizations
  private createMemoryOptimizations(): void {
    const memoryOptimization: PerformanceOptimization = {
      id: `memory-${Date.now()}`,
      type: 'memory',
      title: 'Optimize Memory Usage',
      description: 'Reduce memory consumption and prevent memory leaks',
      priority: 'high',
      effort: 'medium',
      estimatedTimeHours: 10,
      impact: { performance: 7, userExperience: 6, maintainability: 9 },
      implementation: {
        steps: [
          'Implement proper cleanup in useEffect',
          'Use React.memo for expensive components',
          'Optimize large lists with virtualization',
          'Remove event listeners on unmount',
        ],
        codeChanges: [
          'useEffect(() => { return () => cleanup(); }, [])',
          'const MemoizedComponent = React.memo(Component)',
          'Use react-window for large lists',
        ],
      },
      metrics: { before: { memoryUsage: this.currentMetrics!.memoryUsage } },
      status: 'pending',
      createdAt: new Date(),
    };

    this.optimizations.push(memoryOptimization);
  }

  // Create network-specific optimizations
  private createNetworkOptimizations(): void {
    const networkOptimization: PerformanceOptimization = {
      id: `network-${Date.now()}`,
      type: 'network',
      title: 'Optimize Network Requests',
      description: 'Reduce number of network requests and improve caching',
      priority: 'medium',
      effort: 'medium',
      estimatedTimeHours: 8,
      impact: { performance: 8, userExperience: 7, maintainability: 6 },
      implementation: {
        steps: [
          'Implement request batching',
          'Add proper caching headers',
          'Use service workers for caching',
          'Optimize API endpoints',
        ],
        codeChanges: [
          'Batch multiple API calls into single request',
          'Add Cache-Control headers',
          'Implement service worker caching strategy',
        ],
      },
      metrics: { before: { networkRequests: this.currentMetrics!.networkRequests } },
      status: 'pending',
      createdAt: new Date(),
    };

    this.optimizations.push(networkOptimization);
  }

  // Helper methods
  private async estimateBundleSize(): Promise<number> {
    // In a real implementation, this would analyze the actual bundle
    // For now, return an estimated size based on loaded resources
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    return resources.reduce((total, resource) => {
      return total + (resource.transferSize || 0);
    }, 0);
  }

  private async calculateTimeToInteractive(): Promise<number> {
    // Simplified TTI calculation
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    return navigation ? navigation.domInteractive - navigation.fetchStart : 0;
  }

  private calculateCacheHitRate(): number {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const cachedResources = resources.filter(resource => resource.transferSize === 0);
    return resources.length > 0 ? (cachedResources.length / resources.length) * 100 : 0;
  }

  // Public API methods
  public getCurrentMetrics(): PerformanceMetrics | null {
    return this.currentMetrics;
  }

  public getOptimizations(): PerformanceOptimization[] {
    return this.optimizations;
  }

  public getOptimizationsByCategory(): OptimizationRecommendation[] {
    const categories = ['bundle', 'runtime', 'network', 'memory', 'rendering'];
    
    return categories.map(category => {
      const categoryOptimizations = this.optimizations.filter(opt => opt.type === category);
      const totalImpact = categoryOptimizations.reduce((sum, opt) => 
        sum + opt.impact.performance + opt.impact.userExperience, 0);
      const totalEffort = categoryOptimizations.reduce((sum, opt) => {
        const effortMap = { low: 1, medium: 2, high: 3 };
        return sum + effortMap[opt.effort];
      }, 0);

      return {
        category,
        recommendations: categoryOptimizations,
        totalImpact,
        totalEffort,
      };
    }).filter(cat => cat.recommendations.length > 0);
  }

  public async implementOptimization(optimizationId: string): Promise<void> {
    const optimization = this.optimizations.find(opt => opt.id === optimizationId);
    if (optimization) {
      optimization.status = 'in_progress';
      
      // In a real implementation, this would trigger the actual optimization
      // For now, we'll simulate completion after a delay
      setTimeout(() => {
        optimization.status = 'completed';
        optimization.completedAt = new Date();
        
        // Simulate performance improvement
        if (this.currentMetrics && optimization.metrics.before) {
          const metricKey = Object.keys(optimization.metrics.before)[0] as keyof PerformanceMetrics;
          const beforeValue = optimization.metrics.before[metricKey];
          const improvement = beforeValue * 0.2; // 20% improvement
          const afterValue = beforeValue - improvement;
          
          optimization.metrics.after = { [metricKey]: afterValue };
          optimization.metrics.improvement = { [metricKey]: improvement };
          
          // Update current metrics
          this.currentMetrics[metricKey] = afterValue;
        }
      }, 1000);
    }
  }

  public cleanup(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

export const performanceOptimizationService = new PerformanceOptimizationService();
export default performanceOptimizationService;