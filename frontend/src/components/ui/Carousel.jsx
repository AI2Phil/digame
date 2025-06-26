import React, { forwardRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

const Carousel = forwardRef(({ 
  className,
  children,
  orientation = 'horizontal',
  ...props 
}, ref) => {
  return (
    <CarouselProvider orientation={orientation}>
      <div
        ref={ref}
        className={cn(
          "relative",
          className
        )}
        role="region"
        aria-roledescription="carousel"
        {...props}
      >
        {children}
      </div>
    </CarouselProvider>
  );
});

Carousel.displayName = "Carousel";

const CarouselContext = React.createContext();

const CarouselProvider = ({ children, orientation }) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [itemsCount, setItemsCount] = React.useState(0);
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);

  const scrollToPrevious = React.useCallback(() => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  }, []);

  const scrollToNext = React.useCallback(() => {
    setCurrentIndex(prev => Math.min(itemsCount - 1, prev + 1));
  }, [itemsCount]);

  const scrollToIndex = React.useCallback((index) => {
    setCurrentIndex(Math.max(0, Math.min(itemsCount - 1, index)));
  }, [itemsCount]);

  React.useEffect(() => {
    setCanScrollPrev(currentIndex > 0);
    setCanScrollNext(currentIndex < itemsCount - 1);
  }, [currentIndex, itemsCount]);

  return (
    <CarouselContext.Provider value={{
      currentIndex,
      itemsCount,
      canScrollPrev,
      canScrollNext,
      scrollToPrevious,
      scrollToNext,
      scrollToIndex,
      setItemsCount,
      orientation
    }}>
      {children}
    </CarouselContext.Provider>
  );
};

const useCarousel = () => {
  const context = React.useContext(CarouselContext);
  if (!context) {
    throw new Error('useCarousel must be used within Carousel');
  }
  return context;
};

const CarouselContent = forwardRef(({ 
  className,
  children,
  ...props 
}, ref) => {
  const { currentIndex, setItemsCount, orientation } = useCarousel();
  const contentRef = React.useRef(null);

  React.useImperativeHandle(ref, () => contentRef.current);

  React.useEffect(() => {
    const childrenArray = React.Children.toArray(children);
    setItemsCount(childrenArray.length);
  }, [children, setItemsCount]);

  React.useEffect(() => {
    if (contentRef.current) {
      const translateValue = orientation === 'horizontal' 
        ? `translateX(-${currentIndex * 100}%)`
        : `translateY(-${currentIndex * 100}%)`;
      
      contentRef.current.style.transform = translateValue;
    }
  }, [currentIndex, orientation]);

  return (
    <div className="overflow-hidden">
      <div
        ref={contentRef}
        className={cn(
          "flex transition-transform duration-300 ease-in-out",
          orientation === 'horizontal' ? "flex-row" : "flex-col",
          className
        )}
        {...props}
      >
        {React.Children.map(children, (child, index) => (
          <div
            key={index}
            className="min-w-0 shrink-0 grow-0 basis-full"
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${React.Children.count(children)}`}
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  );
});

CarouselContent.displayName = "CarouselContent";

const CarouselItem = forwardRef(({ 
  className,
  children,
  ...props 
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn("min-w-0 shrink-0 grow-0 basis-full", className)}
      {...props}
    >
      {children}
    </div>
  );
});

CarouselItem.displayName = "CarouselItem";

const CarouselPrevious = forwardRef(({ 
  className,
  variant = 'outline',
  size = 'icon',
  ...props 
}, ref) => {
  const { scrollToPrevious, canScrollPrev, orientation } = useCarousel();

  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        "absolute h-8 w-8 rounded-full border border-input bg-background shadow-sm",
        "hover:bg-accent hover:text-accent-foreground",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        orientation === 'horizontal'
          ? "left-4 top-1/2 -translate-y-1/2"
          : "top-4 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      disabled={!canScrollPrev}
      onClick={scrollToPrevious}
      {...props}
    >
      <ChevronLeft className="h-4 w-4" />
      <span className="sr-only">Previous slide</span>
    </button>
  );
});

CarouselPrevious.displayName = "CarouselPrevious";

const CarouselNext = forwardRef(({ 
  className,
  variant = 'outline',
  size = 'icon',
  ...props 
}, ref) => {
  const { scrollToNext, canScrollNext, orientation } = useCarousel();

  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        "absolute h-8 w-8 rounded-full border border-input bg-background shadow-sm",
        "hover:bg-accent hover:text-accent-foreground",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        orientation === 'horizontal'
          ? "right-4 top-1/2 -translate-y-1/2"
          : "bottom-4 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      disabled={!canScrollNext}
      onClick={scrollToNext}
      {...props}
    >
      <ChevronRight className="h-4 w-4" />
      <span className="sr-only">Next slide</span>
    </button>
  );
});

CarouselNext.displayName = "CarouselNext";

const CarouselIndicators = forwardRef(({ 
  className,
  ...props 
}, ref) => {
  const { currentIndex, itemsCount, scrollToIndex } = useCarousel();

  return (
    <div
      ref={ref}
      className={cn(
        "absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2",
        className
      )}
      {...props}
    >
      {Array.from({ length: itemsCount }, (_, index) => (
        <button
          key={index}
          type="button"
          className={cn(
            "h-2 w-2 rounded-full transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            currentIndex === index
              ? "bg-primary"
              : "bg-primary/50 hover:bg-primary/75"
          )}
          onClick={() => scrollToIndex(index)}
          aria-label={`Go to slide ${index + 1}`}
        />
      ))}
    </div>
  );
});

CarouselIndicators.displayName = "CarouselIndicators";

// Predefined carousel variants
export const CarouselVariants = {
  // Auto-playing carousel
  Auto: forwardRef(({ autoplayDelay = 3000, pauseOnHover = true, children, ...props }, ref) => {
    const { scrollToNext, currentIndex, itemsCount } = useCarousel();
    const [isPlaying, setIsPlaying] = React.useState(true);
    const intervalRef = React.useRef(null);

    React.useEffect(() => {
      if (isPlaying) {
        intervalRef.current = setInterval(() => {
          scrollToNext();
        }, autoplayDelay);
      } else {
        clearInterval(intervalRef.current);
      }

      return () => clearInterval(intervalRef.current);
    }, [isPlaying, scrollToNext, autoplayDelay]);

    // Reset to first slide when reaching the end
    React.useEffect(() => {
      if (currentIndex === itemsCount - 1) {
        setTimeout(() => {
          scrollToNext();
        }, autoplayDelay);
      }
    }, [currentIndex, itemsCount, scrollToNext, autoplayDelay]);

    const handleMouseEnter = () => {
      if (pauseOnHover) setIsPlaying(false);
    };

    const handleMouseLeave = () => {
      if (pauseOnHover) setIsPlaying(true);
    };

    return (
      <Carousel
        ref={ref}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {children}
      </Carousel>
    );
  }),

  // Thumbnail carousel
  Thumbnails: forwardRef(({ thumbnails = [], children, ...props }, ref) => {
    const { currentIndex, scrollToIndex } = useCarousel();

    return (
      <div className="space-y-4">
        <Carousel ref={ref} {...props}>
          {children}
        </Carousel>
        
        <div className="flex justify-center space-x-2 overflow-x-auto">
          {thumbnails.map((thumbnail, index) => (
            <button
              key={index}
              type="button"
              className={cn(
                "flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-colors",
                currentIndex === index
                  ? "border-primary"
                  : "border-transparent hover:border-primary/50"
              )}
              onClick={() => scrollToIndex(index)}
            >
              <img
                src={thumbnail}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    );
  }),

  // Fade transition carousel
  Fade: forwardRef(({ className, children, ...props }, ref) => {
    const { currentIndex } = useCarousel();

    return (
      <Carousel ref={ref} {...props}>
        <div className={cn("relative", className)}>
          {React.Children.map(children, (child, index) => (
            <div
              key={index}
              className={cn(
                "absolute inset-0 transition-opacity duration-500",
                currentIndex === index ? "opacity-100" : "opacity-0"
              )}
            >
              {child}
            </div>
          ))}
        </div>
      </Carousel>
    );
  })
};

// Hook for carousel state management
export const useCarouselState = (initialIndex = 0) => {
  const [currentIndex, setCurrentIndex] = React.useState(initialIndex);
  const [itemsCount, setItemsCount] = React.useState(0);

  const scrollToPrevious = React.useCallback(() => {
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : itemsCount - 1));
  }, [itemsCount]);

  const scrollToNext = React.useCallback(() => {
    setCurrentIndex(prev => (prev < itemsCount - 1 ? prev + 1 : 0));
  }, [itemsCount]);

  const scrollToIndex = React.useCallback((index) => {
    setCurrentIndex(Math.max(0, Math.min(itemsCount - 1, index)));
  }, [itemsCount]);

  const canScrollPrev = currentIndex > 0;
  const canScrollNext = currentIndex < itemsCount - 1;

  return {
    currentIndex,
    itemsCount,
    canScrollPrev,
    canScrollNext,
    scrollToPrevious,
    scrollToNext,
    scrollToIndex,
    setItemsCount
  };
};

// Simple carousel component for quick use
export const SimpleCarousel = ({ items = [], renderItem, ...props }) => {
  return (
    <Carousel {...props}>
      <CarouselContent>
        {items.map((item, index) => (
          <CarouselItem key={index}>
            {renderItem ? renderItem(item, index) : item}
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
      <CarouselIndicators />
    </Carousel>
  );
};

export {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  CarouselIndicators,
};

export default Carousel;