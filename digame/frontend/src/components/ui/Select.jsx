import React, { forwardRef, useState } from 'react';
import { ChevronDown, Check, X, Search } from 'lucide-react';
import { cn } from '../../lib/utils';

const Select = forwardRef(({ 
  className,
  label,
  error,
  helperText,
  required,
  disabled,
  placeholder = "Select an option...",
  options = [],
  value,
  onChange,
  multiple = false,
  searchable = false,
  clearable = false,
  size = 'default',
  ...props 
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const selectRef = React.useRef(null);

  React.useImperativeHandle(ref, () => selectRef.current);

  // Filter options based on search term
  const filteredOptions = searchable 
    ? options.filter(option => 
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  // Get display value
  const getDisplayValue = () => {
    if (multiple && Array.isArray(value)) {
      if (value.length === 0) return placeholder;
      if (value.length === 1) {
        const option = options.find(opt => opt.value === value[0]);
        return option?.label || value[0];
      }
      return `${value.length} items selected`;
    }
    
    if (value) {
      const option = options.find(opt => opt.value === value);
      return option?.label || value;
    }
    
    return placeholder;
  };

  // Handle option selection
  const handleOptionSelect = (optionValue) => {
    if (multiple) {
      const newValue = Array.isArray(value) ? [...value] : [];
      const index = newValue.indexOf(optionValue);
      
      if (index > -1) {
        newValue.splice(index, 1);
      } else {
        newValue.push(optionValue);
      }
      
      onChange?.(newValue);
    } else {
      onChange?.(optionValue);
      setIsOpen(false);
    }
  };

  // Handle clear
  const handleClear = (e) => {
    e.stopPropagation();
    onChange?.(multiple ? [] : '');
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sizeClasses = {
    sm: 'h-8 px-2 text-xs',
    default: 'h-10 px-3 text-sm',
    lg: 'h-12 px-4 text-base'
  };

  const triggerClasses = cn(
    // Base styles
    "flex w-full items-center justify-between rounded-md border border-input bg-background",
    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    "disabled:cursor-not-allowed disabled:opacity-50",
    
    // Size variants
    sizeClasses[size],
    
    // Error state
    error && "border-destructive focus:ring-destructive",
    
    // Open state
    isOpen && "ring-2 ring-ring ring-offset-2",
    
    className
  );

  return (
    <div className="space-y-2">
      {label && (
        <label className={cn(
          "text-sm font-medium leading-none",
          error && "text-destructive",
          disabled && "opacity-50"
        )}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      
      <div className="relative" ref={selectRef}>
        <button
          type="button"
          className={triggerClasses}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          {...props}
        >
          <span className={cn(
            "truncate text-left",
            !value && "text-muted-foreground"
          )}>
            {getDisplayValue()}
          </span>
          
          <div className="flex items-center space-x-1">
            {clearable && value && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 hover:bg-muted rounded"
              >
                <X className="h-3 w-3" />
              </button>
            )}
            <ChevronDown className={cn(
              "h-4 w-4 transition-transform",
              isOpen && "rotate-180"
            )} />
          </div>
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg">
            {searchable && (
              <div className="p-2 border-b">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search options..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-2 py-1 text-sm border border-input rounded focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>
            )}
            
            <div className="max-h-60 overflow-auto py-1">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  {searchable && searchTerm ? 'No options found' : 'No options available'}
                </div>
              ) : (
                filteredOptions.map((option) => {
                  const isSelected = multiple 
                    ? Array.isArray(value) && value.includes(option.value)
                    : value === option.value;
                    
                  return (
                    <button
                      key={option.value}
                      type="button"
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 text-sm text-left",
                        "hover:bg-accent hover:text-accent-foreground",
                        "focus:bg-accent focus:text-accent-foreground focus:outline-none",
                        isSelected && "bg-accent text-accent-foreground",
                        option.disabled && "opacity-50 cursor-not-allowed"
                      )}
                      onClick={() => !option.disabled && handleOptionSelect(option.value)}
                      disabled={option.disabled}
                    >
                      <span className="truncate">{option.label}</span>
                      {isSelected && <Check className="h-4 w-4 flex-shrink-0" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
      
      {(error || helperText) && (
        <p className={cn(
          "text-sm",
          error ? "text-destructive" : "text-muted-foreground"
        )}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Select.displayName = "Select";

// Helper function to create options
export const createSelectOptions = (items, labelKey = 'label', valueKey = 'value') => {
  return items.map(item => ({
    label: typeof item === 'string' ? item : item[labelKey],
    value: typeof item === 'string' ? item : item[valueKey],
    disabled: item.disabled || false
  }));
};

// Variants for different use cases
export const SelectVariants = {
  default: Select,
  
  // Native select for better mobile experience
  Native: forwardRef(({ className, options = [], ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value} disabled={option.disabled}>
          {option.label}
        </option>
      ))}
    </select>
  )),
  
  // Minimal select without borders
  Minimal: forwardRef(({ className, ...props }, ref) => (
    <Select
      ref={ref}
      className={cn(
        "border-0 bg-transparent focus:ring-0 focus:ring-offset-0",
        className
      )}
      {...props}
    />
  ))
};

export default Select;