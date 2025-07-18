import { useEffect } from 'react';
import { usePerformanceOptimization } from '../../hooks/usePerformanceOptimization';

const PerformanceOptimizer = () => {
  // This component will only run on the client side due to dynamic import with ssr: false
  usePerformanceOptimization();

  // This component doesn't render anything visible
  return null;
};

export default PerformanceOptimizer;