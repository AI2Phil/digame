import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';

const Slider = forwardRef(/** @param {{
  className?: string,
  value?: number[],
  onValueChange?: (value: number[]) => void,
  min?: number,
  max?: number,
  step?: number,
  disabled?: boolean,
  orientation?: 'horizontal'|'vertical',
  inverted?: boolean
} & React.HTMLAttributes<HTMLDivElement>} props */ ({
  className,
  value,
  onValueChange,
  min,
  max,
  step,
  disabled,
  orientation,
  inverted,
  ...props
}, ref) => {
  // Set default values
  const finalValue = value ?? [0];
  const finalMin = min ?? 0;
  const finalMax = max ?? 100;
  const finalStep = step ?? 1;
  const finalDisabled = disabled ?? false;
  const finalOrientation = orientation ?? 'horizontal';
  const finalInverted = inverted ?? false;
  const [internalValue, setInternalValue] = React.useState(finalValue);
  const [isDragging, setIsDragging] = React.useState(false);
  const [activeThumb, setActiveThumb] = React.useState(-1);
  const trackRef = React.useRef(null);

  const currentValue = value !== undefined ? value : internalValue;

  React.useImperativeHandle(ref, () => ({
    focus: () => {
      const firstThumb = trackRef.current?.querySelector('[role="slider"]');
      firstThumb?.focus();
    }
  }));

  const handleValueChange = (newValue) => {
    if (value === undefined) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
  };

  const getValueFromPointer = (event) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return currentValue[0];

    const { clientX, clientY } = event.touches?.[0] || event;
    const isHorizontal = finalOrientation === 'horizontal';
    const trackLength = isHorizontal ? rect.width : rect.height;
    const trackStart = isHorizontal ? rect.left : rect.top;
    const pointerPosition = isHorizontal ? clientX : clientY;
    
    let percentage = (pointerPosition - trackStart) / trackLength;
    
    if (finalInverted) {
      percentage = 1 - percentage;
    }
    
    if (!isHorizontal) {
      percentage = 1 - percentage;
    }

    const range = finalMax - finalMin;
    const rawValue = finalMin + percentage * range;
    const steppedValue = Math.round(rawValue / finalStep) * finalStep;
    
    return Math.max(finalMin, Math.min(finalMax, steppedValue));
  };

  const handlePointerDown = (event, thumbIndex) => {
    if (finalDisabled) return;
    
    event.preventDefault();
    setIsDragging(true);
    setActiveThumb(thumbIndex);
    
    const handlePointerMove = (moveEvent) => {
      const newValue = getValueFromPointer(moveEvent);
      const newValues = [...currentValue];
      newValues[thumbIndex] = newValue;
      
      // Ensure values don't cross over for range sliders
      if (currentValue.length > 1) {
        if (thumbIndex === 0 && newValue > currentValue[1]) {
          newValues[0] = currentValue[1];
        } else if (thumbIndex === 1 && newValue < currentValue[0]) {
          newValues[1] = currentValue[0];
        }
      }
      
      handleValueChange(newValues);
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      setActiveThumb(-1);
      document.removeEventListener('mousemove', handlePointerMove);
      document.removeEventListener('mouseup', handlePointerUp);
      document.removeEventListener('touchmove', handlePointerMove);
      document.removeEventListener('touchend', handlePointerUp);
    };

    document.addEventListener('mousemove', handlePointerMove);
    document.addEventListener('mouseup', handlePointerUp);
    document.addEventListener('touchmove', handlePointerMove);
    document.addEventListener('touchend', handlePointerUp);
  };

  const handleKeyDown = (event, thumbIndex) => {
    if (finalDisabled) return;

    let delta = 0;
    const largeStep = finalStep * 10;

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        delta = finalStep;
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        delta = -finalStep;
        break;
      case 'PageUp':
        delta = largeStep;
        break;
      case 'PageDown':
        delta = -largeStep;
        break;
      case 'Home':
        delta = finalMin - currentValue[thumbIndex];
        break;
      case 'End':
        delta = finalMax - currentValue[thumbIndex];
        break;
      default:
        return;
    }

    event.preventDefault();
    const newValue = Math.max(finalMin, Math.min(finalMax, currentValue[thumbIndex] + delta));
    const newValues = [...currentValue];
    newValues[thumbIndex] = newValue;
    handleValueChange(newValues);
  };

  const getThumbPosition = (value) => {
    const percentage = ((value - finalMin) / (finalMax - finalMin)) * 100;
    return finalInverted ? 100 - percentage : percentage;
  };

  const getRangePosition = () => {
    if (currentValue.length === 1) {
      return {
        start: finalInverted ? getThumbPosition(currentValue[0]) : 0,
        end: finalInverted ? 100 : getThumbPosition(currentValue[0])
      };
    } else {
      const start = Math.min(getThumbPosition(currentValue[0]), getThumbPosition(currentValue[1]));
      const end = Math.max(getThumbPosition(currentValue[0]), getThumbPosition(currentValue[1]));
      return { start, end };
    }
  };

  const range = getRangePosition();

  return (
    <div
      ref={trackRef}
      className={cn(
        "relative flex touch-none select-none items-center",
        finalOrientation === 'horizontal' ? "w-full h-5" : "h-full w-5 flex-col",
        finalDisabled && "opacity-50 cursor-not-allowed",
        className
      )}
      {...props}
    >
      {/* Track */}
      <div
        className={cn(
          "relative bg-secondary rounded-full grow",
          finalOrientation === 'horizontal' ? "h-1.5 w-full" : "w-1.5 h-full"
        )}
      >
        {/* Range */}
        <div
          className={cn(
            "absolute bg-primary rounded-full",
            finalOrientation === 'horizontal' ? "h-full" : "w-full"
          )}
          style={{
            [finalOrientation === 'horizontal' ? 'left' : 'bottom']: `${range.start}%`,
            [finalOrientation === 'horizontal' ? 'width' : 'height']: `${range.end - range.start}%`
          }}
        />
      </div>

      {/* Thumbs */}
      {currentValue.map((value, index) => (
        <div
          key={index}
          role="slider"
          tabIndex={finalDisabled ? -1 : 0}
          aria-valuemin={finalMin}
          aria-valuemax={finalMax}
          aria-valuenow={value}
          aria-orientation={finalOrientation}
          className={cn(
            "absolute block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            "disabled:pointer-events-none disabled:opacity-50",
            activeThumb === index && "scale-110",
            !finalDisabled && "hover:bg-accent cursor-grab",
            isDragging && activeThumb === index && "cursor-grabbing"
          )}
          style={{
            [finalOrientation === 'horizontal' ? 'left' : 'bottom']: `calc(${getThumbPosition(value)}% - 8px)`
          }}
          onMouseDown={(e) => handlePointerDown(e, index)}
          onTouchStart={(e) => handlePointerDown(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
        />
      ))}
    </div>
  );
});

Slider.displayName = "Slider";

// Predefined slider variants
export const SliderVariants = {
  // Range slider
  Range: forwardRef(/** @param {{value?: number[]} & React.ComponentProps<typeof Slider>} props */ ({ value = [20, 80], ...props }, ref) => (
    <Slider ref={ref} value={value} {...props} />
  )),

  // Vertical slider
  Vertical: forwardRef(/** @param {{className?: string} & React.ComponentProps<typeof Slider>} props */ ({ className, ...props }, ref) => (
    <Slider
      ref={ref}
      orientation="vertical"
      className={cn("h-40", className)}
      {...props}
    />
  )),

  // Large slider
  Large: forwardRef(/** @param {{className?: string} & React.ComponentProps<typeof Slider>} props */ ({ className, ...props }, ref) => (
    <div className={cn("space-y-3", className)}>
      <Slider ref={ref} {...props} />
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>{props.min || 0}</span>
        <span>{props.max || 100}</span>
      </div>
    </div>
  )),

  // Stepped slider with marks
  Stepped: forwardRef(/** @param {{className?: string, min?: number, max?: number, step?: number} & React.ComponentProps<typeof Slider>} props */ ({ className, min = 0, max = 100, step = 10, ...props }, ref) => {
    const marks = [];
    for (let i = min; i <= max; i += step) {
      marks.push(i);
    }

    return (
      <div className={cn("space-y-2", className)}>
        <Slider ref={ref} min={min} max={max} step={step} {...props} />
        <div className="flex justify-between">
          {marks.map((mark) => (
            <div key={mark} className="flex flex-col items-center">
              <div className="w-px h-2 bg-border" />
              <span className="text-xs text-muted-foreground mt-1">{mark}</span>
            </div>
          ))}
        </div>
      </div>
    );
  })
};

// Hook for slider state
/**
 * @param {number[]} [initialValue=[0]] - Initial slider value
 * @param {{min?: number, max?: number, step?: number}} [options={}] - Slider options
 * @returns {{
 *   value: number[],
 *   onValueChange: (value: number[]) => void,
 *   increment: (index?: number) => void,
 *   decrement: (index?: number) => void,
 *   reset: () => void,
 *   setToMin: () => void,
 *   setToMax: () => void
 * }}
 */
export const useSliderState = (initialValue = [0], options = {}) => {
  const [value, setValue] = React.useState(initialValue);
  const { min = 0, max = 100, step = 1 } = options;

  const handleValueChange = React.useCallback((newValue) => {
    setValue(newValue);
  }, []);

  const increment = React.useCallback((index = 0) => {
    setValue(prev => {
      const newValues = [...prev];
      newValues[index] = Math.min(max, newValues[index] + step);
      return newValues;
    });
  }, [max, step]);

  const decrement = React.useCallback((index = 0) => {
    setValue(prev => {
      const newValues = [...prev];
      newValues[index] = Math.max(min, newValues[index] - step);
      return newValues;
    });
  }, [min, step]);

  const reset = React.useCallback(() => {
    setValue(initialValue);
  }, [initialValue]);

  const setToMin = React.useCallback(() => {
    setValue(value.map(() => min));
  }, [value, min]);

  const setToMax = React.useCallback(() => {
    setValue(value.map(() => max));
  }, [value, max]);

  return {
    value,
    onValueChange: handleValueChange,
    increment,
    decrement,
    reset,
    setToMin,
    setToMax
  };
};

// Simple slider for quick use
/**
 * @param {{
 *   label?: string,
 *   value?: number | number[],
 *   onChange?: (value: number[]) => void,
 *   showValue?: boolean
 * } & React.ComponentProps<typeof Slider>} props
 */
export const SimpleSlider = ({
  label,
  value,
  onChange,
  showValue = true,
  ...props
}) => {
  return (
    <div className="space-y-2">
      {label && (
        <div className="flex justify-between">
          <label className="text-sm font-medium">{label}</label>
          {showValue && (
            <span className="text-sm text-muted-foreground">
              {Array.isArray(value) ? value.join(' - ') : value}
            </span>
          )}
        </div>
      )}
      <Slider value={Array.isArray(value) ? value : [value]} onValueChange={onChange} {...props} />
    </div>
  );
};

// Named export for convenience
export { Slider };
export default Slider;