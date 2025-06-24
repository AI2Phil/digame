// Accessibility utilities for WCAG 2.1 compliance

/**
 * Focus management utilities
 */
export const focusUtils = {
  // Get all focusable elements within a container
  getFocusableElements: (container) => {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ');
    
    return Array.from(container.querySelectorAll(focusableSelectors));
  },

  // Trap focus within a container (for modals, dropdowns, etc.)
  trapFocus: (container, event) => {
    const focusableElements = focusUtils.getFocusableElements(container);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.key === 'Tab') {
      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }
  },

  // Save and restore focus
  saveFocus: () => {
    return document.activeElement;
  },

  restoreFocus: (element) => {
    if (element && element.focus) {
      element.focus();
    }
  },

  // Focus first focusable element
  focusFirst: (container) => {
    const focusableElements = focusUtils.getFocusableElements(container);
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  }
};

/**
 * ARIA utilities
 */
export const ariaUtils = {
  // Generate unique IDs for ARIA relationships
  generateId: (prefix = 'aria') => {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },

  // Announce to screen readers
  announce: (message, priority = 'polite') => {
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', priority);
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    announcer.textContent = message;
    
    document.body.appendChild(announcer);
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcer);
    }, 1000);
  },

  // Set ARIA expanded state
  setExpanded: (element, expanded) => {
    element.setAttribute('aria-expanded', expanded.toString());
  },

  // Set ARIA selected state
  setSelected: (element, selected) => {
    element.setAttribute('aria-selected', selected.toString());
  },

  // Set ARIA pressed state
  setPressed: (element, pressed) => {
    element.setAttribute('aria-pressed', pressed.toString());
  }
};

/**
 * Keyboard navigation utilities
 */
export const keyboardUtils = {
  // Common key codes
  keys: {
    ENTER: 'Enter',
    SPACE: ' ',
    ESCAPE: 'Escape',
    ARROW_UP: 'ArrowUp',
    ARROW_DOWN: 'ArrowDown',
    ARROW_LEFT: 'ArrowLeft',
    ARROW_RIGHT: 'ArrowRight',
    HOME: 'Home',
    END: 'End',
    TAB: 'Tab'
  },

  // Handle arrow key navigation in lists
  handleArrowNavigation: (event, items, currentIndex, onIndexChange) => {
    const { key } = event;
    let newIndex = currentIndex;

    switch (key) {
      case keyboardUtils.keys.ARROW_UP:
        event.preventDefault();
        newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        break;
      case keyboardUtils.keys.ARROW_DOWN:
        event.preventDefault();
        newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        break;
      case keyboardUtils.keys.HOME:
        event.preventDefault();
        newIndex = 0;
        break;
      case keyboardUtils.keys.END:
        event.preventDefault();
        newIndex = items.length - 1;
        break;
      default:
        return;
    }

    onIndexChange(newIndex);
    if (items[newIndex] && items[newIndex].focus) {
      items[newIndex].focus();
    }
  },

  // Check if event is activation key (Enter or Space)
  isActivationKey: (event) => {
    return event.key === keyboardUtils.keys.ENTER || event.key === keyboardUtils.keys.SPACE;
  }
};

/**
 * Color contrast utilities
 */
export const contrastUtils = {
  // Calculate relative luminance
  getLuminance: (r, g, b) => {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  },

  // Calculate contrast ratio between two colors
  getContrastRatio: (color1, color2) => {
    const lum1 = contrastUtils.getLuminance(...color1);
    const lum2 = contrastUtils.getLuminance(...color2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
  },

  // Check if contrast meets WCAG standards
  meetsWCAG: (color1, color2, level = 'AA', size = 'normal') => {
    const ratio = contrastUtils.getContrastRatio(color1, color2);
    const requirements = {
      'AA': { normal: 4.5, large: 3 },
      'AAA': { normal: 7, large: 4.5 }
    };
    return ratio >= requirements[level][size];
  },

  // Convert hex to RGB
  hexToRgb: (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : null;
  }
};

/**
 * Screen reader utilities
 */
export const screenReaderUtils = {
  // Hide content from screen readers
  hideFromScreenReader: (element) => {
    element.setAttribute('aria-hidden', 'true');
  },

  // Show content to screen readers
  showToScreenReader: (element) => {
    element.removeAttribute('aria-hidden');
  },

  // Make content screen reader only
  makeScreenReaderOnly: (element) => {
    element.className += ' sr-only';
  },

  // Remove screen reader only class
  removeScreenReaderOnly: (element) => {
    element.className = element.className.replace(/\bsr-only\b/g, '').trim();
  }
};

/**
 * Motion and animation utilities
 */
export const motionUtils = {
  // Check if user prefers reduced motion
  prefersReducedMotion: () => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  // Conditionally apply animation
  conditionalAnimation: (element, animationClass) => {
    if (!motionUtils.prefersReducedMotion()) {
      element.classList.add(animationClass);
    }
  },

  // Remove animations if user prefers reduced motion
  respectMotionPreference: () => {
    if (motionUtils.prefersReducedMotion()) {
      document.body.classList.add('no-animations');
    }
  }
};

/**
 * Form accessibility utilities
 */
export const formUtils = {
  // Associate label with input
  associateLabel: (input, label) => {
    const id = ariaUtils.generateId('input');
    input.id = id;
    label.setAttribute('for', id);
  },

  // Add error message to input
  addErrorMessage: (input, errorElement, message) => {
    const errorId = ariaUtils.generateId('error');
    errorElement.id = errorId;
    errorElement.textContent = message;
    input.setAttribute('aria-describedby', errorId);
    input.setAttribute('aria-invalid', 'true');
  },

  // Remove error message from input
  removeErrorMessage: (input, errorElement) => {
    input.removeAttribute('aria-describedby');
    input.removeAttribute('aria-invalid');
    errorElement.textContent = '';
  },

  // Validate form accessibility
  validateFormAccessibility: (form) => {
    const issues = [];
    const inputs = form.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
      // Check for labels
      const label = form.querySelector(`label[for="${input.id}"]`);
      if (!label && !input.getAttribute('aria-label') && !input.getAttribute('aria-labelledby')) {
        issues.push(`Input ${input.name || input.type} is missing a label`);
      }
      
      // Check for required field indicators
      if (input.required && !input.getAttribute('aria-required')) {
        input.setAttribute('aria-required', 'true');
      }
    });
    
    return issues;
  }
};

/**
 * Live region utilities
 */
export const liveRegionUtils = {
  // Create a live region
  createLiveRegion: (priority = 'polite') => {
    const region = document.createElement('div');
    region.setAttribute('aria-live', priority);
    region.setAttribute('aria-atomic', 'true');
    region.className = 'sr-only';
    document.body.appendChild(region);
    return region;
  },

  // Update live region content
  updateLiveRegion: (region, content) => {
    region.textContent = content;
  },

  // Remove live region
  removeLiveRegion: (region) => {
    if (region && region.parentNode) {
      region.parentNode.removeChild(region);
    }
  }
};

/**
 * High contrast mode detection
 */
export const highContrastUtils = {
  // Detect if high contrast mode is enabled
  isHighContrastMode: () => {
    // Create a test element to detect high contrast mode
    const testElement = document.createElement('div');
    testElement.style.border = '1px solid';
    testElement.style.borderColor = 'red green';
    document.body.appendChild(testElement);
    
    const computedStyle = window.getComputedStyle(testElement);
    const isHighContrast = computedStyle.borderTopColor === computedStyle.borderRightColor;
    
    document.body.removeChild(testElement);
    return isHighContrast;
  },

  // Apply high contrast styles
  applyHighContrastStyles: () => {
    document.body.classList.add('high-contrast');
  },

  // Remove high contrast styles
  removeHighContrastStyles: () => {
    document.body.classList.remove('high-contrast');
  }
};

// Initialize accessibility features
export const initializeAccessibility = () => {
  // Respect motion preferences
  motionUtils.respectMotionPreference();
  
  // Detect and apply high contrast mode if needed
  if (highContrastUtils.isHighContrastMode()) {
    highContrastUtils.applyHighContrastStyles();
  }
  
  // Add skip link if not present
  if (!document.querySelector('.skip-link')) {
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.className = 'skip-link';
    skipLink.textContent = 'Skip to main content';
    document.body.insertBefore(skipLink, document.body.firstChild);
  }
};

// Export all utilities
export default {
  focusUtils,
  ariaUtils,
  keyboardUtils,
  contrastUtils,
  screenReaderUtils,
  motionUtils,
  formUtils,
  liveRegionUtils,
  highContrastUtils,
  initializeAccessibility
};