import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';
import Toggle from './Toggle';

const ToggleGroup = forwardRef(({ 
  className,
  type = 'single',
  value,
  onValueChange,
  disabled = false,
  orientation = 'horizontal',
  children,
  ...props 
}, ref) => {
  return (
    <ToggleGroupProvider type={type} value={value} onValueChange={onValueChange} disabled={disabled}>
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-center gap-1",
          orientation === 'vertical' && "flex-col",
          className
        )}
        role={type === 'single' ? 'radiogroup' : 'group'}
        {...props}
      >
        {children}
      </div>
    </ToggleGroupProvider>
  );
});

ToggleGroup.displayName = "ToggleGroup";

const ToggleGroupContext = React.createContext();

const ToggleGroupProvider = ({ children, type, value, onValueChange, disabled }) => {
  const handleItemToggle = React.useCallback((itemValue) => {
    if (disabled) return;

    if (type === 'single') {
      // Single selection: toggle off if same value, otherwise set new value
      const newValue = value === itemValue ? undefined : itemValue;
      onValueChange?.(newValue);
    } else {
      // Multiple selection: add/remove from array
      const currentValues = Array.isArray(value) ? value : [];
      const newValues = currentValues.includes(itemValue)
        ? currentValues.filter(v => v !== itemValue)
        : [...currentValues, itemValue];
      onValueChange?.(newValues);
    }
  }, [type, value, onValueChange, disabled]);

  const isPressed = React.useCallback((itemValue) => {
    if (type === 'single') {
      return value === itemValue;
    } else {
      return Array.isArray(value) && value.includes(itemValue);
    }
  }, [type, value]);

  return (
    <ToggleGroupContext.Provider value={{
      type,
      disabled,
      handleItemToggle,
      isPressed
    }}>
      {children}
    </ToggleGroupContext.Provider>
  );
};

const useToggleGroup = () => {
  const context = React.useContext(ToggleGroupContext);
  if (!context) {
    throw new Error('useToggleGroup must be used within ToggleGroup');
  }
  return context;
};

const ToggleGroupItem = forwardRef(({ 
  className,
  value,
  disabled: itemDisabled = false,
  children,
  ...props 
}, ref) => {
  const { disabled: groupDisabled, handleItemToggle, isPressed } = useToggleGroup();
  const disabled = groupDisabled || itemDisabled;
  const pressed = isPressed(value);

  const handleClick = () => {
    if (!disabled) {
      handleItemToggle(value);
    }
  };

  return (
    <Toggle
      ref={ref}
      pressed={pressed}
      onPressedChange={handleClick}
      disabled={disabled}
      className={cn(
        "data-[state=on]:bg-accent data-[state=on]:text-accent-foreground",
        className
      )}
      {...props}
    >
      {children}
    </Toggle>
  );
});

ToggleGroupItem.displayName = "ToggleGroupItem";

// Predefined toggle group variants
export const ToggleGroupVariants = {
  // Segmented control style
  Segmented: forwardRef(({ className, children, ...props }, ref) => (
    <ToggleGroup
      ref={ref}
      className={cn(
        "inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
        className
      )}
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            className: cn(
              "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "disabled:pointer-events-none disabled:opacity-50",
              "data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow",
              child.props.className
            )
          });
        }
        return child;
      })}
    </ToggleGroup>
  )),

  // Outline style
  Outline: forwardRef(({ className, children, ...props }, ref) => (
    <ToggleGroup
      ref={ref}
      className={cn("inline-flex rounded-md shadow-sm", className)}
      {...props}
    >
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          const isFirst = index === 0;
          const isLast = index === React.Children.count(children) - 1;
          
          return React.cloneElement(child, {
            className: cn(
              "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
              "focus:z-10 focus:ring-2 focus:ring-ring",
              "data-[state=on]:bg-accent data-[state=on]:text-accent-foreground",
              !isFirst && "-ml-px",
              isFirst && "rounded-l-md",
              isLast && "rounded-r-md",
              !isFirst && !isLast && "rounded-none",
              child.props.className
            )
          });
        }
        return child;
      })}
    </ToggleGroup>
  )),

  // Pills style
  Pills: forwardRef(({ className, ...props }, ref) => (
    <ToggleGroup
      ref={ref}
      className={cn("flex flex-wrap gap-2", className)}
      {...props}
    />
  ))
};

// Hook for toggle group state
export const useToggleGroupState = (type = 'single', initialValue) => {
  const [value, setValue] = React.useState(initialValue);

  const handleValueChange = React.useCallback((newValue) => {
    setValue(newValue);
  }, []);

  const selectItem = React.useCallback((itemValue) => {
    if (type === 'single') {
      setValue(itemValue);
    } else {
      setValue(prev => {
        const currentValues = Array.isArray(prev) ? prev : [];
        return currentValues.includes(itemValue) 
          ? currentValues 
          : [...currentValues, itemValue];
      });
    }
  }, [type]);

  const deselectItem = React.useCallback((itemValue) => {
    if (type === 'single') {
      setValue(undefined);
    } else {
      setValue(prev => {
        const currentValues = Array.isArray(prev) ? prev : [];
        return currentValues.filter(v => v !== itemValue);
      });
    }
  }, [type]);

  const toggleItem = React.useCallback((itemValue) => {
    if (type === 'single') {
      setValue(prev => prev === itemValue ? undefined : itemValue);
    } else {
      setValue(prev => {
        const currentValues = Array.isArray(prev) ? prev : [];
        return currentValues.includes(itemValue)
          ? currentValues.filter(v => v !== itemValue)
          : [...currentValues, itemValue];
      });
    }
  }, [type]);

  const clear = React.useCallback(() => {
    setValue(type === 'single' ? undefined : []);
  }, [type]);

  const isSelected = React.useCallback((itemValue) => {
    if (type === 'single') {
      return value === itemValue;
    } else {
      return Array.isArray(value) && value.includes(itemValue);
    }
  }, [type, value]);

  return {
    value,
    onValueChange: handleValueChange,
    selectItem,
    deselectItem,
    toggleItem,
    clear,
    isSelected
  };
};

// Simple toggle group for quick use
export const SimpleToggleGroup = ({ 
  items = [], 
  type = 'single',
  ...props 
}) => {
  return (
    <ToggleGroup type={type} {...props}>
      {items.map((item) => (
        <ToggleGroupItem key={item.value} value={item.value}>
          {item.icon && <span className="mr-2">{item.icon}</span>}
          {item.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
};

export { ToggleGroup, ToggleGroupItem };
export default ToggleGroup;