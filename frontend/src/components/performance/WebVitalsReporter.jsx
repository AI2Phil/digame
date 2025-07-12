import { useEffect } from 'react';
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

const WebVitalsReporter = () => {
  useEffect(() => {
    // Function to send metrics to analytics
    const sendToAnalytics = (metric) => {
      // In production, you would send this to your analytics service
      if (process.env.NODE_ENV === 'development') {
        console.log('Web Vitals Metric:', metric);
      }
      
      // Example: Send to Google Analytics 4
      if (typeof gtag !== 'undefined') {
        gtag('event', metric.name, {
          event_category: 'Web Vitals',
          event_label: metric.id,
          value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
          non_interaction: true,
        });
      }
      
      // Example: Send to custom analytics endpoint
      if (typeof fetch !== 'undefined') {
        fetch('/api/analytics/web-vitals', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: metric.name,
            value: metric.value,
            id: metric.id,
            delta: metric.delta,
            rating: metric.rating,
            navigationType: metric.navigationType,
            timestamp: Date.now(),
            url: window.location.href,
            userAgent: navigator.userAgent,
          }),
        }).catch(console.error);
      }
    };

    // Measure and report Core Web Vitals
    getCLS(sendToAnalytics);
    getFID(sendToAnalytics);
    getFCP(sendToAnalytics);
    getLCP(sendToAnalytics);
    getTTFB(sendToAnalytics);

    // Additional performance monitoring
    const measureResourceTiming = () => {
      if ('performance' in window && 'getEntriesByType' in performance) {
        const resources = performance.getEntriesByType('resource');
        const slowResources = resources.filter(resource => resource.duration > 1000);
        
        if (slowResources.length > 0) {
          console.warn('Slow resources detected:', slowResources);
          
          // Report slow resources
          slowResources.forEach(resource => {
            sendToAnalytics({
              name: 'slow_resource',
              value: resource.duration,
              id: `${resource.name}-${Date.now()}`,
              delta: resource.duration,
              rating: resource.duration > 2000 ? 'poor' : 'needs-improvement',
              resourceName: resource.name,
              resourceType: resource.initiatorType,
            });
          });
        }
      }
    };

    // Measure resource timing after page load
    if (document.readyState === 'complete') {
      measureResourceTiming();
    } else {
      window.addEventListener('load', measureResourceTiming);
    }

    // Monitor layout shifts
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.hadRecentInput) continue;
          
          if (entry.value > 0.1) {
            console.warn('Large layout shift detected:', entry);
            sendToAnalytics({
              name: 'layout_shift',
              value: entry.value,
              id: `ls-${Date.now()}`,
              delta: entry.value,
              rating: entry.value > 0.25 ? 'poor' : 'needs-improvement',
              sources: entry.sources?.map(source => source.node?.tagName).join(', '),
            });
          }
        }
      });

      try {
        observer.observe({ type: 'layout-shift', buffered: true });
      } catch (e) {
        console.warn('Layout shift observer not supported');
      }

      return () => {
        observer.disconnect();
      };
    }
  }, []);

  // This component doesn't render anything
  return null;
};

export default WebVitalsReporter;