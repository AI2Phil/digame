import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';

const AspectRatio = forwardRef(({ 
  className,
  ratio = 16 / 9,
  children,
  ...props 
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn("relative w-full", className)}
      style={{
        paddingBottom: `${(1 / ratio) * 100}%`
      }}
      {...props}
    >
      <div className="absolute inset-0">
        {children}
      </div>
    </div>
  );
});

AspectRatio.displayName = "AspectRatio";

// Predefined aspect ratio variants
export const AspectRatioVariants = {
  // Common video ratios
  Video: forwardRef(({ className, ...props }, ref) => (
    <AspectRatio ref={ref} ratio={16 / 9} className={className} {...props} />
  )),

  // Square ratio
  Square: forwardRef(({ className, ...props }, ref) => (
    <AspectRatio ref={ref} ratio={1} className={className} {...props} />
  )),

  // Portrait ratios
  Portrait: forwardRef(({ className, ...props }, ref) => (
    <AspectRatio ref={ref} ratio={3 / 4} className={className} {...props} />
  )),

  // Landscape ratios
  Landscape: forwardRef(({ className, ...props }, ref) => (
    <AspectRatio ref={ref} ratio={4 / 3} className={className} {...props} />
  )),

  // Ultrawide ratio
  Ultrawide: forwardRef(({ className, ...props }, ref) => (
    <AspectRatio ref={ref} ratio={21 / 9} className={className} {...props} />
  )),

  // Golden ratio
  Golden: forwardRef(({ className, ...props }, ref) => (
    <AspectRatio ref={ref} ratio={1.618} className={className} {...props} />
  )),

  // A4 paper ratio
  A4: forwardRef(({ className, ...props }, ref) => (
    <AspectRatio ref={ref} ratio={210 / 297} className={className} {...props} />
  )),

  // Instagram post ratio
  Instagram: forwardRef(({ className, ...props }, ref) => (
    <AspectRatio ref={ref} ratio={1} className={className} {...props} />
  )),

  // Instagram story ratio
  Story: forwardRef(({ className, ...props }, ref) => (
    <AspectRatio ref={ref} ratio={9 / 16} className={className} {...props} />
  )),

  // Twitter header ratio
  TwitterHeader: forwardRef(({ className, ...props }, ref) => (
    <AspectRatio ref={ref} ratio={3} className={className} {...props} />
  )),

  // YouTube thumbnail ratio
  YouTubeThumbnail: forwardRef(({ className, ...props }, ref) => (
    <AspectRatio ref={ref} ratio={16 / 9} className={className} {...props} />
  ))
};

// Common aspect ratios as constants
export const ASPECT_RATIOS = {
  SQUARE: 1,
  LANDSCAPE: 4 / 3,
  PORTRAIT: 3 / 4,
  VIDEO: 16 / 9,
  WIDESCREEN: 16 / 10,
  ULTRAWIDE: 21 / 9,
  GOLDEN: 1.618,
  A4: 210 / 297,
  INSTAGRAM_POST: 1,
  INSTAGRAM_STORY: 9 / 16,
  TWITTER_HEADER: 3,
  YOUTUBE_THUMBNAIL: 16 / 9,
  CINEMA: 2.35,
  IMAX: 1.43
};

// Responsive aspect ratio component
export const ResponsiveAspectRatio = forwardRef(({ 
  className,
  ratios = { default: 16 / 9 },
  children,
  ...props 
}, ref) => {
  const [currentRatio, setCurrentRatio] = React.useState(ratios.default);

  React.useEffect(() => {
    const updateRatio = () => {
      const width = window.innerWidth;
      
      if (ratios.lg && width >= 1024) {
        setCurrentRatio(ratios.lg);
      } else if (ratios.md && width >= 768) {
        setCurrentRatio(ratios.md);
      } else if (ratios.sm && width >= 640) {
        setCurrentRatio(ratios.sm);
      } else {
        setCurrentRatio(ratios.default);
      }
    };

    updateRatio();
    window.addEventListener('resize', updateRatio);
    return () => window.removeEventListener('resize', updateRatio);
  }, [ratios]);

  return (
    <AspectRatio
      ref={ref}
      ratio={currentRatio}
      className={className}
      {...props}
    >
      {children}
    </AspectRatio>
  );
});

ResponsiveAspectRatio.displayName = "ResponsiveAspectRatio";

// Image with aspect ratio component
export const AspectRatioImage = forwardRef(({ 
  className,
  ratio = 16 / 9,
  src,
  alt,
  objectFit = 'cover',
  loading = 'lazy',
  ...props 
}, ref) => {
  return (
    <AspectRatio ratio={ratio} className={className} {...props}>
      <img
        ref={ref}
        src={src}
        alt={alt}
        loading={loading}
        className={cn(
          "h-full w-full",
          {
            'object-cover': objectFit === 'cover',
            'object-contain': objectFit === 'contain',
            'object-fill': objectFit === 'fill',
            'object-none': objectFit === 'none',
            'object-scale-down': objectFit === 'scale-down'
          }
        )}
      />
    </AspectRatio>
  );
});

AspectRatioImage.displayName = "AspectRatioImage";

// Video with aspect ratio component
export const AspectRatioVideo = forwardRef(({ 
  className,
  ratio = 16 / 9,
  src,
  poster,
  controls = true,
  autoPlay = false,
  muted = false,
  loop = false,
  ...props 
}, ref) => {
  return (
    <AspectRatio ratio={ratio} className={className} {...props}>
      <video
        ref={ref}
        src={src}
        poster={poster}
        controls={controls}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        className="h-full w-full object-cover"
      />
    </AspectRatio>
  );
});

AspectRatioVideo.displayName = "AspectRatioVideo";

// Iframe with aspect ratio component
export const AspectRatioIframe = forwardRef(({ 
  className,
  ratio = 16 / 9,
  src,
  title,
  allowFullScreen = true,
  ...props 
}, ref) => {
  return (
    <AspectRatio ratio={ratio} className={className} {...props}>
      <iframe
        ref={ref}
        src={src}
        title={title}
        allowFullScreen={allowFullScreen}
        className="h-full w-full border-0"
      />
    </AspectRatio>
  );
});

AspectRatioIframe.displayName = "AspectRatioIframe";

// Hook for calculating aspect ratios
export const useAspectRatio = (width, height) => {
  const ratio = React.useMemo(() => {
    if (!width || !height) return 1;
    return width / height;
  }, [width, height]);

  const getClosestStandardRatio = React.useCallback(() => {
    const standardRatios = [
      { name: 'Square', ratio: 1 },
      { name: 'Portrait', ratio: 3 / 4 },
      { name: 'Landscape', ratio: 4 / 3 },
      { name: 'Video', ratio: 16 / 9 },
      { name: 'Widescreen', ratio: 16 / 10 },
      { name: 'Ultrawide', ratio: 21 / 9 },
      { name: 'Golden', ratio: 1.618 }
    ];

    return standardRatios.reduce((closest, current) => {
      return Math.abs(current.ratio - ratio) < Math.abs(closest.ratio - ratio)
        ? current
        : closest;
    });
  }, [ratio]);

  const formatRatio = React.useCallback((precision = 2) => {
    return ratio.toFixed(precision);
  }, [ratio]);

  const getDimensions = React.useCallback((targetWidth) => {
    return {
      width: targetWidth,
      height: targetWidth / ratio
    };
  }, [ratio]);

  return {
    ratio,
    getClosestStandardRatio,
    formatRatio,
    getDimensions
  };
};

// Hook for responsive aspect ratios
export const useResponsiveAspectRatio = (breakpoints) => {
  const [currentRatio, setCurrentRatio] = React.useState(breakpoints.default);

  React.useEffect(() => {
    const updateRatio = () => {
      const width = window.innerWidth;
      
      if (breakpoints.xl && width >= 1280) {
        setCurrentRatio(breakpoints.xl);
      } else if (breakpoints.lg && width >= 1024) {
        setCurrentRatio(breakpoints.lg);
      } else if (breakpoints.md && width >= 768) {
        setCurrentRatio(breakpoints.md);
      } else if (breakpoints.sm && width >= 640) {
        setCurrentRatio(breakpoints.sm);
      } else {
        setCurrentRatio(breakpoints.default);
      }
    };

    updateRatio();
    window.addEventListener('resize', updateRatio);
    return () => window.removeEventListener('resize', updateRatio);
  }, [breakpoints]);

  return currentRatio;
};

// Utility function to calculate ratio from dimensions
export const calculateAspectRatio = (width, height) => {
  if (!width || !height) return 1;
  return width / height;
};

// Utility function to get dimensions from ratio and width
export const getDimensionsFromRatio = (ratio, width) => {
  return {
    width,
    height: width / ratio
  };
};

// Utility function to get dimensions from ratio and height
export const getDimensionsFromRatioAndHeight = (ratio, height) => {
  return {
    width: height * ratio,
    height
  };
};

// Simple aspect ratio component for quick use
export const SimpleAspectRatio = ({ 
  ratio = '16:9', 
  children, 
  ...props 
}) => {
  const numericRatio = React.useMemo(() => {
    if (typeof ratio === 'number') return ratio;
    
    const [width, height] = ratio.split(':').map(Number);
    return width / height;
  }, [ratio]);

  return (
    <AspectRatio ratio={numericRatio} {...props}>
      {children}
    </AspectRatio>
  );
};

export default AspectRatio;