import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

const Accordion = forwardRef(({ 
  className,
  type = 'single',
  collapsible = false,
  children,
  ...props 
}, ref) => {
  return (
    <AccordionProvider type={type} collapsible={collapsible}>
      <div
        ref={ref}
        className={cn("space-y-2", className)}
        {...props}
      >
        {children}
      </div>
    </AccordionProvider>
  );
});

Accordion.displayName = "Accordion";

const AccordionContext = React.createContext();

const AccordionProvider = ({ children, type, collapsible }) => {
  const [openItems, setOpenItems] = React.useState(new Set());

  const toggleItem = React.useCallback((value) => {
    setOpenItems(prev => {
      const newSet = new Set(prev);
      
      if (type === 'single') {
        // Single accordion: only one item can be open
        if (newSet.has(value)) {
          if (collapsible) {
            newSet.delete(value);
          }
        } else {
          newSet.clear();
          newSet.add(value);
        }
      } else {
        // Multiple accordion: multiple items can be open
        if (newSet.has(value)) {
          newSet.delete(value);
        } else {
          newSet.add(value);
        }
      }
      
      return newSet;
    });
  }, [type, collapsible]);

  const isOpen = React.useCallback((value) => {
    return openItems.has(value);
  }, [openItems]);

  return (
    <AccordionContext.Provider value={{ toggleItem, isOpen, type }}>
      {children}
    </AccordionContext.Provider>
  );
};

const useAccordion = () => {
  const context = React.useContext(AccordionContext);
  if (!context) {
    throw new Error('useAccordion must be used within Accordion');
  }
  return context;
};

const AccordionItem = forwardRef(({ 
  className,
  value,
  disabled = false,
  children,
  ...props 
}, ref) => {
  const { isOpen } = useAccordion();
  const open = isOpen(value);

  return (
    <div
      ref={ref}
      className={cn(
        "border rounded-lg",
        disabled && "opacity-50 pointer-events-none",
        className
      )}
      data-state={open ? "open" : "closed"}
      {...props}
    >
      {children}
    </div>
  );
});

AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = forwardRef(({ 
  className,
  children,
  ...props 
}, ref) => {
  const { toggleItem, isOpen } = useAccordion();
  const accordionItem = React.useContext(AccordionItemContext);
  const value = accordionItem?.value;
  const disabled = accordionItem?.disabled;
  const open = isOpen(value);

  const handleClick = () => {
    if (!disabled && value) {
      toggleItem(value);
    }
  };

  const handleKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        "flex flex-1 items-center justify-between py-4 px-4 font-medium transition-all",
        "hover:bg-accent hover:text-accent-foreground",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        "text-left",
        className
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      aria-expanded={open}
      data-state={open ? "open" : "closed"}
      {...props}
    >
      {children}
      <ChevronDown className={cn(
        "h-4 w-4 shrink-0 transition-transform duration-200",
        open && "rotate-180"
      )} />
    </button>
  );
});

AccordionTrigger.displayName = "AccordionTrigger";

const AccordionContent = forwardRef(({ 
  className,
  children,
  ...props 
}, ref) => {
  const { isOpen } = useAccordion();
  const accordionItem = React.useContext(AccordionItemContext);
  const value = accordionItem?.value;
  const open = isOpen(value);

  return (
    <div
      ref={ref}
      className={cn(
        "overflow-hidden transition-all duration-200",
        open ? "animate-accordion-down" : "animate-accordion-up"
      )}
      data-state={open ? "open" : "closed"}
      {...props}
    >
      <div className={cn("px-4 pb-4 pt-0", className)}>
        {children}
      </div>
    </div>
  );
});

AccordionContent.displayName = "AccordionContent";

// Context for accordion item
const AccordionItemContext = React.createContext();

// Enhanced AccordionItem with context
const EnhancedAccordionItem = forwardRef(({ 
  value,
  disabled = false,
  children,
  ...props 
}, ref) => {
  return (
    <AccordionItemContext.Provider value={{ value, disabled }}>
      <AccordionItem ref={ref} value={value} disabled={disabled} {...props}>
        {children}
      </AccordionItem>
    </AccordionItemContext.Provider>
  );
});

EnhancedAccordionItem.displayName = "AccordionItem";

// Predefined accordion variants
export const AccordionVariants = {
  // Card-style accordion
  Cards: forwardRef(({ className, children, ...props }, ref) => (
    <Accordion ref={ref} className={cn("space-y-4", className)} {...props}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            className: cn(
              "border border-border bg-card text-card-foreground shadow-sm",
              child.props.className
            )
          });
        }
        return child;
      })}
    </Accordion>
  )),

  // Minimal accordion without borders
  Minimal: forwardRef(({ className, children, ...props }, ref) => (
    <Accordion ref={ref} className={cn("space-y-1", className)} {...props}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            className: cn("border-0 border-b border-border last:border-b-0", child.props.className)
          });
        }
        return child;
      })}
    </Accordion>
  )),

  // Flush accordion (no spacing)
  Flush: forwardRef(({ className, ...props }, ref) => (
    <Accordion
      ref={ref}
      className={cn("space-y-0 border rounded-lg overflow-hidden", className)}
      {...props}
    />
  ))
};

// Hook for accordion state management
export const useAccordionState = (type = 'single', initialValues = []) => {
  const [openItems, setOpenItems] = React.useState(new Set(initialValues));

  const toggleItem = React.useCallback((value) => {
    setOpenItems(prev => {
      const newSet = new Set(prev);
      
      if (type === 'single') {
        if (newSet.has(value)) {
          newSet.delete(value);
        } else {
          newSet.clear();
          newSet.add(value);
        }
      } else {
        if (newSet.has(value)) {
          newSet.delete(value);
        } else {
          newSet.add(value);
        }
      }
      
      return newSet;
    });
  }, [type]);

  const openItem = React.useCallback((value) => {
    setOpenItems(prev => {
      const newSet = new Set(prev);
      if (type === 'single') {
        newSet.clear();
      }
      newSet.add(value);
      return newSet;
    });
  }, [type]);

  const closeItem = React.useCallback((value) => {
    setOpenItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(value);
      return newSet;
    });
  }, []);

  const closeAll = React.useCallback(() => {
    setOpenItems(new Set());
  }, []);

  const openAll = React.useCallback((values) => {
    if (type === 'multiple') {
      setOpenItems(new Set(values));
    }
  }, [type]);

  const isOpen = React.useCallback((value) => {
    return openItems.has(value);
  }, [openItems]);

  return {
    openItems: Array.from(openItems),
    toggleItem,
    openItem,
    closeItem,
    closeAll,
    openAll,
    isOpen
  };
};

// Utility function to create accordion items
export const createAccordionItems = (items) => {
  return items.map((item, index) => ({
    value: item.value || `item-${index}`,
    title: item.title,
    content: item.content,
    disabled: item.disabled || false
  }));
};

// Simple accordion component for quick use
export const SimpleAccordion = ({ items = [], ...props }) => {
  return (
    <Accordion {...props}>
      {items.map((item) => (
        <EnhancedAccordionItem key={item.value} value={item.value} disabled={item.disabled}>
          <AccordionTrigger>{item.title}</AccordionTrigger>
          <AccordionContent>{item.content}</AccordionContent>
        </EnhancedAccordionItem>
      ))}
    </Accordion>
  );
};

// Export the enhanced version as the default AccordionItem
export { 
  Accordion, 
  EnhancedAccordionItem as AccordionItem, 
  AccordionTrigger, 
  AccordionContent 
};

export default Accordion;