import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';

const Slider = forwardRef(({ 
  className,
  value = [0],
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  orientation = 'horizontal',
  inverted = false,
  ...props 
}, ref) => {
  const [internalValue, setInternalValue] = React.useState(value);
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
    const isHorizontal = orientation === 'horizontal';
    const trackLength = isHorizontal ? rect.width : rect.height;
    const trackStart = isHorizontal ? rect.left : rect.top;
    const pointerPosition = isHorizontal ? clientX : clientY;
    
    let percentage = (pointerPosition - trackStart) / trackLength;
    
    if (inverted) {
      percentage = 1 - percentage;
    }
    
    if (!isHorizontal) {
      percentage = 1 - percentage;
    }

    const range = max - min;
    const rawValue = min + percentage * range;
    const steppedValue = Math.round(rawValue / step) * step;
    
    return Math.max(min, Math.min(max, steppedValue));
  };

  const handlePointerDown = (event, thumbIndex) => {
    if (disabled) return;
    
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
    if (disabled) return;

    let delta = 0;
    const largeStep = step * 10;

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        delta = step;
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        delta = -step;
        break;
      case 'PageUp':
        delta = largeStep;
        break;
      case 'PageDown':
        delta = -largeStep;
        break;
      case 'Home':
        delta = min - currentValue[thumbIndex];
        break;
      case 'End':
        delta = max - currentValue[thumbIndex];
        break;
      default:
        return;
    }

    event.preventDefault();
    const newValue = Math.max(min, Math.min(max, currentValue[thumbIndex] + delta));
    const newValues = [...currentValue];
    newValues[thumbIndex] = newValue;
    handleValueChange(newValues);
  };

  const getThumbPosition = (value) => {
    const percentage = ((value - min) / (max - min)) * 100;
    return inverted ? 100 - percentage : percentage;
  };

  const getRangePosition = () => {
    if (currentValue.length === 1) {
      return {
        start: inverted ? getThumbPosition(currentValue[0]) : 0,
        end: inverted ? 100 : getThumbPosition(currentValue[0])
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
        orientation === 'horizontal' ? "w-full h-5" : "h-full w-5 flex-col",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      {...props}
    >
      {/* Track */}
      <div
        className={cn(
          "relative bg-secondary rounded-full grow",
          orientation === 'horizontal' ? "h-1.5 w-full" : "w-1.5 h-full"
        )}
      >
        {/* Range */}
        <div
          className={cn(
            "absolute bg-primary rounded-full",
            orientation === 'horizontal' ? "h-full" : "w-full"
          )}
          style={{
            [orientation === 'horizontal' ? 'left' : 'bottom']: `${range.start}%`,
            [orientation === 'horizontal' ? 'width' : 'height']: `${range.end - range.start}%`
          }}
        />
      </div>

      {/* Thumbs */}
      {currentValue.map((value, index) => (
        <div
          key={index}
          role="slider"
          tabIndex={disabled ? -1 : 0}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-orientation={orientation}
          className={cn(
            "absolute block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            "disabled:pointer-events-none disabled:opacity-50",
            activeThumb === index && "scale-110",
            !disabled && "hover:bg-accent cursor-grab",
            isDragging && activeThumb === index && "cursor-grabbing"
          )}
          style={{
            [orientation === 'horizontal' ? 'left' : 'bottom']: `calc(${getThumbPosition(value)}% - 8px)`
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
  Range: forwardRef(({ value = [20, 80], ...props }, ref) => (
    <Slider ref={ref} value={value} {...props} />
  )),

  // Vertical slider
  Vertical: forwardRef(({ className, ...props }, ref) => (
    <Slider
      ref={ref}
      orientation="vertical"
      className={cn("h-40", className)}
      {...props}
    />
  )),

  // Large slider
  Large: forwardRef(({ className, ...props }, ref) => (
    <div className={cn("space-y-3", className)}>
      <Slider ref={ref} {...props} />
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>{props.min || 0}</span>
        <span>{props.max || 100}</span>
      </div>
    </div>
  )),

  // Stepped slider with marks
  Stepped: forwardRef(({ className, min = 0, max = 100, step = 10, ...props }, ref) => {
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

export default Slider;