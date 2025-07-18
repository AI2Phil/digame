import { useEffect, useState } from 'react';

// Client-side only navigation hook that doesn't use React Router during SSR
export const useClientNavigation = () => {
  const [isClient, setIsClient] = useState(false);
  const [navigate, setNavigate] = useState(null);

  useEffect(() => {
    setIsClient(true);
    
    // Only import and use React Router on the client side
    if (typeof window !== 'undefined') {
      // Dynamic import removed - using Next.js router
        // This won't work as useNavigate needs to be called in component context
        // We'll use window.location instead for SSR compatibility
      });
    }
  }, []);

  const clientNavigate = (path) => {
    if (typeof window !== 'undefined') {
      // Use window.location for navigation to avoid SSR issues
      window.location.href = path;
    }
  };

  return {
    navigate: clientNavigate,
    isClient
  };
};

// Safe navigation function that works during SSR
export const safeNavigate = (path) => {
  if (typeof window !== 'undefined') {
    window.location.href = path;
  }
};