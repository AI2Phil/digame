import '../src/styles/globals.css'
import '../src/App.css'
import '../src/styles/theme.css'
import '../src/styles/performance.css'
import { ThemeProvider } from '../src/contexts/ThemeContext'
import { ToastProvider } from '../src/components/ui/Toast'
import { AuthProvider } from '../src/contexts/AuthContext.tsx'
import WebVitalsReporter from '../src/components/performance/WebVitalsReporter'
import { usePerformanceOptimization } from '../src/hooks/usePerformanceOptimization'
import { useEffect } from 'react'

function AppWithPerformance({ Component, pageProps }) {
  // Initialize performance optimizations
  usePerformanceOptimization()

  // Add performance monitoring
  useEffect(() => {
    // Monitor performance metrics
    if (typeof window !== 'undefined') {
      // Track page load performance
      window.addEventListener('load', () => {
        if ('performance' in window) {
          const perfData = performance.getEntriesByType('navigation')[0]
          if (perfData) {
            console.log('Page Load Performance:', {
              domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
              loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
              totalTime: perfData.loadEventEnd - perfData.fetchStart
            })
          }
        }
      })

      // Monitor memory usage (if available)
      if ('memory' in performance) {
        const logMemoryUsage = () => {
          const memory = performance.memory
          console.log('Memory Usage:', {
            used: Math.round(memory.usedJSHeapSize / 1048576) + ' MB',
            total: Math.round(memory.totalJSHeapSize / 1048576) + ' MB',
            limit: Math.round(memory.jsHeapSizeLimit / 1048576) + ' MB'
          })
        }
        
        // Log memory usage every 30 seconds in development
        if (process.env.NODE_ENV === 'development') {
          const memoryInterval = setInterval(logMemoryUsage, 30000)
          return () => clearInterval(memoryInterval)
        }
      }
    }
  }, [])

  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider position="top-right">
          <div className="App">
            <WebVitalsReporter />
            <Component {...pageProps} />
          </div>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default AppWithPerformance