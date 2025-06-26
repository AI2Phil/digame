import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';

const ScrollArea = forwardRef(({ 
  className,
  children,
  type = 'auto',
  scrollHideDelay = 600,
  dir = 'ltr',
  ...props 
}, ref) => {
  const [scrollbarVisible, setScrollbarVisible] = React.useState(false);
  const [isScrolling, setIsScrolling] = React.useState(false);
  const scrollAreaRef = React.useRef(null);
  const hideTimeoutRef = React.useRef(null);

  React.useImperativeHandle(ref, () => scrollAreaRef.current);

  const showScrollbar = React.useCallback(() => {
    setScrollbarVisible(true);
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
  }, []);

  const hideScrollbar = React.useCallback(() => {
    if (type === 'hover' || type === 'scroll') {
      hideTimeoutRef.current = setTimeout(() => {
        setScrollbarVisible(false);
      }, scrollHideDelay);
    }
  }, [type, scrollHideDelay]);

  const handleScroll = React.useCallback(() => {
    setIsScrolling(true);
    showScrollbar();
    
    // Hide scrollbar after scrolling stops
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    
    hideTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
      hideScrollbar();
    }, 150);
  }, [showScrollbar, hideScrollbar]);

  const handleMouseEnter = React.useCallback(() => {
    if (type === 'hover') {
      showScrollbar();
    }
  }, [type, showScrollbar]);

  const handleMouseLeave = React.useCallback(() => {
    if (type === 'hover') {
      hideScrollbar();
    }
  }, [type, hideScrollbar]);

  React.useEffect(() => {
    const element = scrollAreaRef.current;
    if (!element) return;

    element.addEventListener('scroll', handleScroll);
    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);

    // Show scrollbar initially if type is 'always'
    if (type === 'always') {
      setScrollbarVisible(true);
    }

    return () => {
      element.removeEventListener('scroll', handleScroll);
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [type, handleScroll, handleMouseEnter, handleMouseLeave]);

  return (
    <div
      ref={scrollAreaRef}
      className={cn(
        "relative overflow-auto",
        // Custom scrollbar styles
        "scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border",
        "hover:scrollbar-thumb-border/80",
        // Hide scrollbar based on type
        type === 'never' && "scrollbar-none",
        type === 'hover' && !scrollbarVisible && "scrollbar-none",
        type === 'scroll' && !isScrolling && "scrollbar-none",
        className
      )}
      dir={dir}
      {...props}
    >
      {children}
    </div>
  );
});

ScrollArea.displayName = "ScrollArea";

// Scrollbar component for custom styling
export const Scrollbar = forwardRef(({ 
  className,
  orientation = 'vertical',
  ...props 
}, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex touch-none select-none transition-colors",
      orientation === 'vertical' && "h-full w-2.5 border-l border-l-transparent p-[1px]",
      orientation === 'horizontal' && "h-2.5 w-full border-t border-t-transparent p-[1px]",
      className
    )}
    {...props}
  />
));

Scrollbar.displayName = "Scrollbar";

// Scroll thumb component
export const ScrollThumb = forwardRef(({ 
  className,
  ...props 
}, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative flex-1 rounded-full bg-border transition-colors hover:bg-border/80",
      className
    )}
    {...props}
  />
));

ScrollThumb.displayName = "ScrollThumb";

// Predefined scroll area variants
export const ScrollAreaVariants = {
  // Thin scrollbar
  Thin: forwardRef(({ className, ...props }, ref) => (
    <ScrollArea
      ref={ref}
      className={cn("scrollbar-thin", className)}
      {...props}
    />
  )),

  // Thick scrollbar
  Thick: forwardRef(({ className, ...props }, ref) => (
    <ScrollArea
      ref={ref}
      className={cn("scrollbar-thick", className)}
      {...props}
    />
  )),

  // Rounded scrollbar
  Rounded: forwardRef(({ className, ...props }, ref) => (
    <ScrollArea
      ref={ref}
      className={cn("scrollbar-thumb-rounded-full", className)}
      {...props}
    />
  )),

  // Colored scrollbar
  Colored: forwardRef(({ className, color = 'primary', ...props }, ref) => (
    <ScrollArea
      ref={ref}
      className={cn(
        color === 'primary' && "scrollbar-thumb-primary",
        color === 'secondary' && "scrollbar-thumb-secondary",
        color === 'accent' && "scrollbar-thumb-accent",
        className
      )}
      {...props}
    />
  ))
};

// Hook for scroll area state
export const useScrollArea = () => {
  const [scrollTop, setScrollTop] = React.useState(0);
  const [scrollLeft, setScrollLeft] = React.useState(0);
  const [scrollHeight, setScrollHeight] = React.useState(0);
  const [scrollWidth, setScrollWidth] = React.useState(0);
  const [clientHeight, setClientHeight] = React.useState(0);
  const [clientWidth, setClientWidth] = React.useState(0);
  const elementRef = React.useRef(null);

  const updateScrollInfo = React.useCallback(() => {
    const element = elementRef.current;
    if (element) {
      setScrollTop(element.scrollTop);
      setScrollLeft(element.scrollLeft);
      setScrollHeight(element.scrollHeight);
      setScrollWidth(element.scrollWidth);
      setClientHeight(element.clientHeight);
      setClientWidth(element.clientWidth);
    }
  }, []);

  const scrollTo = React.useCallback((options) => {
    const element = elementRef.current;
    if (element) {
      element.scrollTo(options);
    }
  }, []);

  const scrollToTop = React.useCallback(() => {
    scrollTo({ top: 0, behavior: 'smooth' });
  }, [scrollTo]);

  const scrollToBottom = React.useCallback(() => {
    scrollTo({ top: scrollHeight, behavior: 'smooth' });
  }, [scrollTo, scrollHeight]);

  const scrollToElement = React.useCallback((selector, options = {}) => {
    const element = elementRef.current;
    if (element) {
      const targetElement = element.querySelector(selector);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', ...options });
      }
    }
  }, []);

  React.useEffect(() => {
    const element = elementRef.current;
    if (element) {
      element.addEventListener('scroll', updateScrollInfo);
      updateScrollInfo(); // Initial call
      
      return () => {
        element.removeEventListener('scroll', updateScrollInfo);
      };
    }
  }, [updateScrollInfo]);

  const isAtTop = scrollTop === 0;
  const isAtBottom = scrollTop + clientHeight >= scrollHeight;
  const isAtLeft = scrollLeft === 0;
  const isAtRight = scrollLeft + clientWidth >= scrollWidth;

  return {
    elementRef,
    scrollTop,
    scrollLeft,
    scrollHeight,
    scrollWidth,
    clientHeight,
    clientWidth,
    isAtTop,
    isAtBottom,
    isAtLeft,
    isAtRight,
    scrollTo,
    scrollToTop,
    scrollToBottom,
    scrollToElement,
    updateScrollInfo
  };
};

// Hook for infinite scroll
export const useInfiniteScroll = (callback, options = {}) => {
  const { threshold = 100, enabled = true } = options;
  const elementRef = React.useRef(null);

  React.useEffect(() => {
    const element = elementRef.current;
    if (!element || !enabled) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = element;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      
      if (distanceFromBottom < threshold) {
        callback();
      }
    };

    element.addEventListener('scroll', handleScroll);
    return () => element.removeEventListener('scroll', handleScroll);
  }, [callback, threshold, enabled]);

  return elementRef;
};

// Simple scroll area for quick use
export const SimpleScrollArea = ({ 
  height = '200px',
  children,
  className,
  ...props 
}) => {
  return (
    <ScrollArea
      className={cn("border rounded-md", className)}
      style={{ height }}
      {...props}
    >
      <div className="p-4">
        {children}
      </div>
    </ScrollArea>
  );
};

export default ScrollArea;