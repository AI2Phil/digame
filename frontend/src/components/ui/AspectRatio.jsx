import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';

/**
 * @typedef {Object} AspectRatioProps
 * @property {string} [className] - Additional CSS classes
 * @property {number} [ratio] - Aspect ratio (width/height)
 * @property {React.ReactNode} [children] - Child elements
 */

const AspectRatio = forwardRef(/** @param {AspectRatioProps & React.HTMLAttributes<HTMLDivElement>} props */ (props, ref) => {
  const {
    className,
    ratio = 16 / 9,
    children,
    ...restProps
  } = props;
  return (
    <div
      ref={ref}
      className={cn("relative w-full", className)}
      style={{
        paddingBottom: `${(1 / ratio) * 100}%`
      }}
      {...restProps}
    >
      <div className="absolute inset-0">
        {children}
      </div>
    </div>
  );
});

AspectRatio.displayName = "AspectRatio";

/**
 * @typedef {Object} AspectRatioVariantProps
 * @property {string} [className] - Additional CSS classes
 * @property {React.ReactNode} [children] - Child elements
 */

// Predefined aspect ratio variants
export const AspectRatioVariants = {
  // Common video ratios
  Video: forwardRef(
    /** @param {AspectRatioVariantProps} props */
    ({ className, ...props }, ref) => (
      <AspectRatio ref={ref} ratio={16 / 9} className={className} {...props} />
    )
  ),

  // Square ratio
  Square: forwardRef(
    /** @param {AspectRatioVariantProps} props */
    ({ className, ...props }, ref) => (
      <AspectRatio ref={ref} ratio={1} className={className} {...props} />
    )
  ),

  // Portrait ratios
  Portrait: forwardRef(
    /** @param {AspectRatioVariantProps} props */
    ({ className, ...props }, ref) => (
      <AspectRatio ref={ref} ratio={3 / 4} className={className} {...props} />
    )
  ),

  // Landscape ratios
  Landscape: forwardRef(
    /** @param {AspectRatioVariantProps} props */
    ({ className, ...props }, ref) => (
      <AspectRatio ref={ref} ratio={4 / 3} className={className} {...props} />
    )
  ),

  // Ultrawide ratio
  Ultrawide: forwardRef(
    /** @param {AspectRatioVariantProps} props */
    ({ className, ...props }, ref) => (
      <AspectRatio ref={ref} ratio={21 / 9} className={className} {...props} />
    )
  ),

  // Golden ratio
  Golden: forwardRef(
    /** @param {AspectRatioVariantProps} props */
    ({ className, ...props }, ref) => (
      <AspectRatio ref={ref} ratio={1.618} className={className} {...props} />
    )
  ),

  // A4 paper ratio
  A4: forwardRef(
    /** @param {AspectRatioVariantProps} props */
    ({ className, ...props }, ref) => (
      <AspectRatio ref={ref} ratio={210 / 297} className={className} {...props} />
    )
  ),

  // Instagram post ratio
  Instagram: forwardRef(
    /** @param {AspectRatioVariantProps} props */
    ({ className, ...props }, ref) => (
      <AspectRatio ref={ref} ratio={1} className={className} {...props} />
    )
  ),

  // Instagram story ratio
  Story: forwardRef(
    /** @param {AspectRatioVariantProps} props */
    ({ className, ...props }, ref) => (
      <AspectRatio ref={ref} ratio={9 / 16} className={className} {...props} />
    )
  ),

  // Twitter header ratio
  TwitterHeader: forwardRef(
    /** @param {AspectRatioVariantProps} props */
    ({ className, ...props }, ref) => (
      <AspectRatio ref={ref} ratio={3} className={className} {...props} />
    )
  ),

  // YouTube thumbnail ratio
  YouTubeThumbnail: forwardRef(
    /** @param {AspectRatioVariantProps} props */
    ({ className, ...props }, ref) => (
      <AspectRatio ref={ref} ratio={16 / 9} className={className} {...props} />
    )
  )
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

/**
 * @typedef {Object} ResponsiveAspectRatioProps
 * @property {string} [className] - Additional CSS classes
 * @property {Object} [ratios] - Responsive ratios object
 * @property {number} ratios.default - Default ratio
 * @property {number} [ratios.sm] - Small screen ratio
 * @property {number} [ratios.md] - Medium screen ratio
 * @property {number} [ratios.lg] - Large screen ratio
 * @property {React.ReactNode} [children] - Child elements
 */

// Responsive aspect ratio component
export const ResponsiveAspectRatio = forwardRef(
  /** @param {ResponsiveAspectRatioProps} props */
  ({
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

/**
 * @typedef {Object} AspectRatioImageProps
 * @property {string} [className] - Additional CSS classes
 * @property {number} [ratio] - Aspect ratio (width/height)
 * @property {string} src - Image source URL
 * @property {string} alt - Image alt text
 * @property {'cover'|'contain'|'fill'|'none'|'scale-down'} [objectFit] - Object fit property
 * @property {'lazy'|'eager'} [loading] - Loading strategy
 */

// Image with aspect ratio component
export const AspectRatioImage = forwardRef(
  /** @param {AspectRatioImageProps} props */
  ({
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

/**
 * @typedef {Object} AspectRatioVideoProps
 * @property {string} [className] - Additional CSS classes
 * @property {number} [ratio] - Aspect ratio (width/height)
 * @property {string} src - Video source URL
 * @property {string} [poster] - Video poster image URL
 * @property {boolean} [controls] - Show video controls
 * @property {boolean} [autoPlay] - Auto play video
 * @property {boolean} [muted] - Mute video
 * @property {boolean} [loop] - Loop video
 */

// Video with aspect ratio component
export const AspectRatioVideo = forwardRef(
  /** @param {AspectRatioVideoProps} props */
  ({
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

/**
 * @typedef {Object} AspectRatioIframeProps
 * @property {string} [className] - Additional CSS classes
 * @property {number} [ratio] - Aspect ratio (width/height)
 * @property {string} src - Iframe source URL
 * @property {string} title - Iframe title
 * @property {boolean} [allowFullScreen] - Allow fullscreen
 */

// Iframe with aspect ratio component
export const AspectRatioIframe = forwardRef(
  /** @param {AspectRatioIframeProps} props */
  ({
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
/**
 * @param {number} width - Width value
 * @param {number} height - Height value
 * @returns {{
 *   ratio: number,
 *   getClosestStandardRatio: () => {name: string, ratio: number},
 *   formatRatio: (precision?: number) => string,
 *   getDimensions: (targetWidth: number) => {width: number, height: number}
 * }}
 */
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
/**
 * @param {Object} breakpoints - Responsive breakpoints object
 * @param {number} breakpoints.default - Default ratio
 * @param {number} [breakpoints.sm] - Small screen ratio
 * @param {number} [breakpoints.md] - Medium screen ratio
 * @param {number} [breakpoints.lg] - Large screen ratio
 * @param {number} [breakpoints.xl] - Extra large screen ratio
 * @returns {number} Current aspect ratio
 */
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
/**
 * @param {number} width - Width value
 * @param {number} height - Height value
 * @returns {number} Calculated aspect ratio
 */
export const calculateAspectRatio = (width, height) => {
  if (!width || !height) return 1;
  return width / height;
};

// Utility function to get dimensions from ratio and width
/**
 * @param {number} ratio - Aspect ratio
 * @param {number} width - Target width
 * @returns {{width: number, height: number}} Calculated dimensions
 */
export const getDimensionsFromRatio = (ratio, width) => {
  return {
    width,
    height: width / ratio
  };
};

// Utility function to get dimensions from ratio and height
/**
 * @param {number} ratio - Aspect ratio
 * @param {number} height - Target height
 * @returns {{width: number, height: number}} Calculated dimensions
 */
export const getDimensionsFromRatioAndHeight = (ratio, height) => {
  return {
    width: height * ratio,
    height
  };
};

/**
 * @typedef {Object} SimpleAspectRatioProps
 * @property {string|number} [ratio] - Aspect ratio as string (e.g., '16:9') or number
 * @property {React.ReactNode} [children] - Child elements
 */

// Simple aspect ratio component for quick use
export const SimpleAspectRatio = (
  /** @param {SimpleAspectRatioProps} props */
  {
    ratio = '16:9',
    children,
    ...props
  }
) => {
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