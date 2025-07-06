import React, { forwardRef } from 'react';
import { Search, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * @typedef {Object} CommandProps
 * @property {string} [className] - Additional CSS classes
 * @property {React.ReactNode} [children] - Child elements
 */

const Command = forwardRef(
  /** @param {CommandProps} props */
  ({
    className,
    children,
    ...props
  }, ref) => {
  return (
    <CommandProvider>
      <div
        ref={ref}
        className={cn(
          "flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground",
          className
        )}
        cmdk-root=""
        {...props}
      >
        {children}
      </div>
    </CommandProvider>
  );
});

Command.displayName = "Command";

const CommandContext = React.createContext({
  search: '',
  setSearch: (/** @type {string} */ value) => {},
  value: '',
  setValue: (/** @type {string} */ value) => {},
  open: false,
  setOpen: (/** @type {boolean} */ value) => {}
});

/**
 * @typedef {Object} CommandProviderProps
 * @property {React.ReactNode} children - Child elements
 */

const CommandProvider = (
  /** @param {CommandProviderProps} props */
  { children }
) => {
  const [search, setSearch] = React.useState('');
  const [value, setValue] = React.useState('');
  const [open, setOpen] = React.useState(false);

  return (
    <CommandContext.Provider value={{
      search,
      setSearch,
      value,
      setValue,
      open,
      setOpen
    }}>
      {children}
    </CommandContext.Provider>
  );
};

const useCommand = () => {
  const context = React.useContext(CommandContext);
  if (!context) {
    throw new Error('useCommand must be used within Command');
  }
  return context;
};

/**
 * @typedef {Object} CommandInputProps
 * @property {string} [className] - Additional CSS classes
 * @property {string} [placeholder] - Input placeholder text
 * @property {string} [value] - Input value
 * @property {function} [onChange] - Change handler
 */

const CommandInput = forwardRef(
  /** @param {CommandInputProps} props */
  ({
    className,
    placeholder = "Type a command or search...",
    value: externalValue,
    onChange: externalOnChange,
    ...props
  }, ref) => {
  const { search, setSearch } = useCommand();

  const handleChange = (e) => {
    if (externalOnChange) {
      externalOnChange(e);
    } else {
      setSearch(e.target.value);
    }
  };

  const inputValue = externalValue !== undefined ? externalValue : search;

  return (
    <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
      <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
      <input
        ref={ref}
        className={cn(
          "flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none",
          "placeholder:text-muted-foreground",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        placeholder={placeholder}
        value={inputValue}
        onChange={handleChange}
        {...props}
      />
    </div>
  );
});

CommandInput.displayName = "CommandInput";

/**
 * @typedef {Object} CommandListProps
 * @property {string} [className] - Additional CSS classes
 * @property {React.ReactNode} [children] - Child elements
 */

const CommandList = forwardRef(
  /** @param {CommandListProps} props */
  ({
    className,
    children,
    ...props
  }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "max-h-[300px] overflow-y-auto overflow-x-hidden",
        className
      )}
      cmdk-list=""
      {...props}
    >
      {children}
    </div>
  );
});

CommandList.displayName = "CommandList";

/**
 * @typedef {Object} CommandEmptyProps
 * @property {string} [className] - Additional CSS classes
 * @property {React.ReactNode} [children] - Child elements
 */

const CommandEmpty = forwardRef(
  /** @param {CommandEmptyProps} props */
  ({
    className,
    children = "No results found.",
    ...props
  }, ref) => {
  const { search } = useCommand();

  if (!search) return null;

  return (
    <div
      ref={ref}
      className={cn(
        "py-6 text-center text-sm text-muted-foreground",
        className
      )}
      cmdk-empty=""
      {...props}
    >
      {children}
    </div>
  );
});

CommandEmpty.displayName = "CommandEmpty";

/**
 * @typedef {Object} CommandGroupProps
 * @property {string} [className] - Additional CSS classes
 * @property {string} [heading] - Group heading text
 * @property {React.ReactNode} [children] - Child elements
 */

const CommandGroup = forwardRef(
  /** @param {CommandGroupProps} props */
  ({
    className,
    heading,
    children,
    ...props
  }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("overflow-hidden p-1 text-foreground", className)}
      cmdk-group=""
      {...props}
    >
      {heading && (
        <div
          className="px-2 py-1.5 text-xs font-medium text-muted-foreground"
          cmdk-group-heading=""
        >
          {heading}
        </div>
      )}
      <div cmdk-group-items="">
        {children}
      </div>
    </div>
  );
});

CommandGroup.displayName = "CommandGroup";

/**
 * @typedef {Object} CommandSeparatorProps
 * @property {string} [className] - Additional CSS classes
 */

const CommandSeparator = forwardRef(
  /** @param {CommandSeparatorProps} props */
  ({
    className,
    ...props
  }, ref) => (
  <div
    ref={ref}
    className={cn("-mx-1 h-px bg-border", className)}
    cmdk-separator=""
    {...props}
  />
));

CommandSeparator.displayName = "CommandSeparator";

/**
 * @typedef {Object} CommandItemProps
 * @property {string} [className] - Additional CSS classes
 * @property {React.ReactNode} [children] - Child elements
 * @property {Function} [onSelect] - Selection callback function
 * @property {boolean} [disabled] - Whether the item is disabled
 * @property {string} [value] - Item value
 * @property {string[]} [keywords] - Search keywords
 */

const CommandItem = forwardRef(
  /** @param {CommandItemProps} props */
  ({
    className,
    children,
    onSelect,
    disabled = false,
    value,
    keywords = [],
    ...props
  }, ref) => {
  const { search, setValue, setOpen } = useCommand();

  const handleSelect = () => {
    if (!disabled) {
      setValue(value || '');
      onSelect?.(value);
      setOpen(false);
    }
  };

  // Simple search matching
  const isVisible = React.useMemo(() => {
    if (!search) return true;
    
    const searchLower = search.toLowerCase();
    const valueLower = (value || '').toLowerCase();
    const childrenText = typeof children === 'string' ? children.toLowerCase() : '';
    const keywordsText = keywords.join(' ').toLowerCase();
    
    return valueLower.includes(searchLower) || 
           childrenText.includes(searchLower) || 
           keywordsText.includes(searchLower);
  }, [search, value, children, keywords]);

  if (!isVisible) return null;

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
        "hover:bg-accent hover:text-accent-foreground",
        "focus:bg-accent focus:text-accent-foreground",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        disabled && "pointer-events-none opacity-50",
        className
      )}
      onClick={handleSelect}
      data-disabled={disabled}
      cmdk-item=""
      {...props}
    >
      {children}
    </div>
  );
});

CommandItem.displayName = "CommandItem";

/**
 * @typedef {Object} CommandShortcutProps
 * @property {string} [className] - Additional CSS classes
 * @property {React.ReactNode} [children] - Child elements
 */

const CommandShortcut = forwardRef(
  /** @param {CommandShortcutProps} props */
  ({
    className,
    children,
    ...props
  }, ref) => (
  <span
    ref={ref}
    className={cn(
      "ml-auto text-xs tracking-widest text-muted-foreground",
      className
    )}
    {...props}
  >
    {children}
  </span>
));

CommandShortcut.displayName = "CommandShortcut";

/**
 * @typedef {Object} CommandDialogProps
 * @property {boolean} open - Whether the dialog is open
 * @property {Function} [onOpenChange] - Open state change callback
 * @property {React.ReactNode} [children] - Child elements
 */

// Command Dialog for modal usage
export const CommandDialog = (
  /** @param {CommandDialogProps} props */
  {
    open,
    onOpenChange,
    children,
    ...props
  }
) => {
  React.useEffect(() => {
    const down = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange?.(!open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm"
        onClick={() => onOpenChange?.(false)}
      />
      
      {/* Dialog */}
      <div className="relative z-50 w-full max-w-lg">
        <Command
          className="animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2 border shadow-lg"
          {...props}
        >
          {children}
        </Command>
      </div>
    </div>
  );
};

// Predefined command variants
export const CommandVariants = {
  // Search command with recent items
  Search: ({ recentItems = [], onSearch, ...props }) => {
    const [search, setSearch] = React.useState('');

    return (
      <Command {...props}>
        <CommandInput 
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          
          {!search && recentItems.length > 0 && (
            <CommandGroup heading="Recent">
              {recentItems.map((item, index) => (
                <CommandItem
                  key={index}
                  value={item.value}
                  onSelect={() => onSearch?.(item)}
                >
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </Command>
    );
  },

  // Navigation command palette
  Navigation: ({ pages = [], onNavigate, ...props }) => (
    <Command {...props}>
      <CommandInput placeholder="Go to page..." />
      <CommandList>
        <CommandEmpty>No pages found.</CommandEmpty>
        <CommandGroup heading="Pages">
          {pages.map((page, index) => (
            <CommandItem
              key={index}
              value={page.path}
              onSelect={() => onNavigate?.(page)}
            >
              {page.icon && <span className="mr-2">{page.icon}</span>}
              {page.title}
              {page.shortcut && (
                <CommandShortcut>{page.shortcut}</CommandShortcut>
              )}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  ),

  // Action command palette
  Actions: ({ actions = [], onAction, ...props }) => (
    <Command {...props}>
      <CommandInput placeholder="Run command..." />
      <CommandList>
        <CommandEmpty>No commands found.</CommandEmpty>
        {Object.entries(actions).map(([groupName, groupActions]) => (
          <CommandGroup key={groupName} heading={groupName}>
            {groupActions.map((action, index) => (
              <CommandItem
                key={index}
                value={action.id}
                onSelect={() => onAction?.(action)}
                disabled={action.disabled}
              >
                {action.icon && <span className="mr-2">{action.icon}</span>}
                {action.label}
                {action.shortcut && (
                  <CommandShortcut>{action.shortcut}</CommandShortcut>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </Command>
  )
};

// Hook for command palette state
export const useCommandState = () => {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [value, setValue] = React.useState('');

  const toggle = React.useCallback(() => {
    setOpen(prev => !prev);
  }, []);

  const close = React.useCallback(() => {
    setOpen(false);
  }, []);

  const openCommand = React.useCallback(() => {
    setOpen(true);
  }, []);

  React.useEffect(() => {
    const down = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggle();
      }
      if (e.key === 'Escape') {
        close();
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [toggle, close]);

  return {
    open,
    setOpen,
    search,
    setSearch,
    value,
    setValue,
    toggle,
    close,
    openCommand
  };
};

// Hook for command history
export const useCommandHistory = (maxItems = 10) => {
  const [history, setHistory] = React.useState([]);

  const addToHistory = React.useCallback((item) => {
    setHistory(prev => {
      const filtered = prev.filter(h => h.value !== item.value);
      return [item, ...filtered].slice(0, maxItems);
    });
  }, [maxItems]);

  const clearHistory = React.useCallback(() => {
    setHistory([]);
  }, []);

  return {
    history,
    addToHistory,
    clearHistory
  };
};

/**
 * @typedef {Object} SimpleCommandProps
 * @property {Array} [items] - Array of command items
 * @property {Function} [onSelect] - Selection callback function
 * @property {string} [placeholder] - Input placeholder text
 */

// Simple command palette for quick use
export const SimpleCommand = (
  /** @param {SimpleCommandProps} props */
  {
    items = [],
    onSelect,
    placeholder = "Type a command...",
    ...props
  }
) => {
  return (
    <Command {...props}>
      <CommandInput placeholder={placeholder} />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup>
          {items.map((item, index) => (
            <CommandItem
              key={index}
              value={item.value || item.label}
              onSelect={() => onSelect?.(item)}
            >
              {item.icon && <span className="mr-2">{item.icon}</span>}
              {item.label}
              {item.shortcut && (
                <CommandShortcut>{item.shortcut}</CommandShortcut>
              )}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
};

export {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
};

export default Command;