import { Dimensions, PixelRatio, Platform, StatusBar } from 'react-native';
import DeviceInfo from 'react-native-device-info';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Design system breakpoints
export const BREAKPOINTS = {
  xs: 320,   // iPhone SE
  sm: 375,   // iPhone 12 mini
  md: 414,   // iPhone 12 Pro
  lg: 768,   // iPad mini
  xl: 1024,  // iPad
  xxl: 1366, // iPad Pro
};

// Device categories
export const DEVICE_TYPES = {
  PHONE_SMALL: 'phone_small',
  PHONE_MEDIUM: 'phone_medium',
  PHONE_LARGE: 'phone_large',
  TABLET_SMALL: 'tablet_small',
  TABLET_LARGE: 'tablet_large',
};

// Orientation types
export const ORIENTATIONS = {
  PORTRAIT: 'portrait',
  LANDSCAPE: 'landscape',
};

class ResponsiveDesignService {
  constructor() {
    this.screenData = {
      width: SCREEN_WIDTH,
      height: SCREEN_HEIGHT,
      orientation: SCREEN_WIDTH > SCREEN_HEIGHT ? ORIENTATIONS.LANDSCAPE : ORIENTATIONS.PORTRAIT,
      deviceType: this.getDeviceType(SCREEN_WIDTH, SCREEN_HEIGHT),
      pixelRatio: PixelRatio.get(),
      fontScale: PixelRatio.getFontScale(),
      isTablet: false,
      hasNotch: false,
      statusBarHeight: 0,
    };
    
    this.listeners = new Set();
    this.isInitialized = false;
    this.setupDimensionListener();
  }

  async initialize() {
    try {
      // Get device information
      this.screenData.isTablet = await DeviceInfo.isTablet();
      this.screenData.hasNotch = await this.detectNotch();
      this.screenData.statusBarHeight = this.getStatusBarHeight();
      
      // Update device type based on tablet detection
      if (this.screenData.isTablet) {
        this.screenData.deviceType = this.screenData.width >= BREAKPOINTS.xl 
          ? DEVICE_TYPES.TABLET_LARGE 
          : DEVICE_TYPES.TABLET_SMALL;
      }
      
      this.isInitialized = true;
      console.log('Responsive Design Service initialized:', this.screenData);
      return true;
    } catch (error) {
      console.error('Failed to initialize responsive design service:', error);
      return false;
    }
  }

  setupDimensionListener() {
    const subscription = Dimensions.addEventListener('change', ({ window, screen }) => {
      const newScreenData = {
        ...this.screenData,
        width: window.width,
        height: window.height,
        orientation: window.width > window.height ? ORIENTATIONS.LANDSCAPE : ORIENTATIONS.PORTRAIT,
        deviceType: this.getDeviceType(window.width, window.height),
      };
      
      this.screenData = newScreenData;
      this.notifyListeners(newScreenData);
    });

    // Store subscription for cleanup
    this.dimensionSubscription = subscription;
  }

  getDeviceType(width, height) {
    const minDimension = Math.min(width, height);
    
    if (minDimension >= BREAKPOINTS.lg) {
      return minDimension >= BREAKPOINTS.xl ? DEVICE_TYPES.TABLET_LARGE : DEVICE_TYPES.TABLET_SMALL;
    }
    
    if (minDimension >= BREAKPOINTS.md) return DEVICE_TYPES.PHONE_LARGE;
    if (minDimension >= BREAKPOINTS.sm) return DEVICE_TYPES.PHONE_MEDIUM;
    return DEVICE_TYPES.PHONE_SMALL;
  }

  async detectNotch() {
    try {
      if (Platform.OS === 'ios') {
        const model = await DeviceInfo.getModel();
        const notchModels = ['iPhone X', 'iPhone XS', 'iPhone XS Max', 'iPhone XR', 
                           'iPhone 11', 'iPhone 11 Pro', 'iPhone 11 Pro Max',
                           'iPhone 12', 'iPhone 12 mini', 'iPhone 12 Pro', 'iPhone 12 Pro Max',
                           'iPhone 13', 'iPhone 13 mini', 'iPhone 13 Pro', 'iPhone 13 Pro Max',
                           'iPhone 14', 'iPhone 14 Plus', 'iPhone 14 Pro', 'iPhone 14 Pro Max'];
        return notchModels.some(notchModel => model.includes(notchModel));
      }
      return false;
    } catch (error) {
      console.error('Error detecting notch:', error);
      return false;
    }
  }

  getStatusBarHeight() {
    if (Platform.OS === 'ios') {
      return this.screenData.hasNotch ? 44 : 20;
    }
    return StatusBar.currentHeight || 24;
  }

  // Responsive scaling functions
  scale(size) {
    const baseWidth = 375; // iPhone X width as base
    return (this.screenData.width / baseWidth) * size;
  }

  verticalScale(size) {
    const baseHeight = 812; // iPhone X height as base
    return (this.screenData.height / baseHeight) * size;
  }

  moderateScale(size, factor = 0.5) {
    return size + (this.scale(size) - size) * factor;
  }

  // Font scaling with accessibility support
  scaledFont(size, options = {}) {
    const { 
      maxScale = 1.3, 
      minScale = 0.8,
      respectAccessibility = true 
    } = options;
    
    let scaledSize = this.moderateScale(size);
    
    if (respectAccessibility) {
      scaledSize *= this.screenData.fontScale;
    }
    
    // Apply min/max constraints
    const baseScaledSize = this.moderateScale(size);
    scaledSize = Math.max(baseScaledSize * minScale, Math.min(baseScaledSize * maxScale, scaledSize));
    
    return Math.round(scaledSize);
  }

  // Spacing calculations
  getSpacing(baseSpacing = 8) {
    const spacingMap = {
      [DEVICE_TYPES.PHONE_SMALL]: baseSpacing * 0.8,
      [DEVICE_TYPES.PHONE_MEDIUM]: baseSpacing,
      [DEVICE_TYPES.PHONE_LARGE]: baseSpacing * 1.1,
      [DEVICE_TYPES.TABLET_SMALL]: baseSpacing * 1.3,
      [DEVICE_TYPES.TABLET_LARGE]: baseSpacing * 1.5,
    };
    
    return spacingMap[this.screenData.deviceType] || baseSpacing;
  }

  // Layout calculations
  getColumns(baseColumns = 1) {
    const columnMap = {
      [DEVICE_TYPES.PHONE_SMALL]: Math.max(1, baseColumns - 1),
      [DEVICE_TYPES.PHONE_MEDIUM]: baseColumns,
      [DEVICE_TYPES.PHONE_LARGE]: baseColumns,
      [DEVICE_TYPES.TABLET_SMALL]: baseColumns + 1,
      [DEVICE_TYPES.TABLET_LARGE]: baseColumns + 2,
    };
    
    // Adjust for orientation
    let columns = columnMap[this.screenData.deviceType] || baseColumns;
    if (this.screenData.orientation === ORIENTATIONS.LANDSCAPE && !this.screenData.isTablet) {
      columns = Math.min(columns + 1, 3);
    }
    
    return columns;
  }

  // Container width calculations
  getContainerWidth(maxWidth = null) {
    const { width, deviceType } = this.screenData;
    
    if (maxWidth && width > maxWidth) {
      return maxWidth;
    }
    
    const paddingMap = {
      [DEVICE_TYPES.PHONE_SMALL]: 16,
      [DEVICE_TYPES.PHONE_MEDIUM]: 20,
      [DEVICE_TYPES.PHONE_LARGE]: 24,
      [DEVICE_TYPES.TABLET_SMALL]: 32,
      [DEVICE_TYPES.TABLET_LARGE]: 48,
    };
    
    const padding = paddingMap[deviceType] || 20;
    return width - (padding * 2);
  }

  // Responsive styles generator
  createResponsiveStyles(styleMap) {
    const { deviceType, orientation } = this.screenData;
    
    let styles = styleMap.default || {};
    
    // Apply device-specific styles
    if (styleMap[deviceType]) {
      styles = { ...styles, ...styleMap[deviceType] };
    }
    
    // Apply orientation-specific styles
    const orientationKey = `${deviceType}_${orientation}`;
    if (styleMap[orientationKey]) {
      styles = { ...styles, ...styleMap[orientationKey] };
    }
    
    // Apply general orientation styles
    if (styleMap[orientation]) {
      styles = { ...styles, ...styleMap[orientation] };
    }
    
    return styles;
  }

  // Breakpoint utilities
  isBreakpoint(breakpoint) {
    const breakpointValue = BREAKPOINTS[breakpoint];
    return this.screenData.width >= breakpointValue;
  }

  isBetweenBreakpoints(minBreakpoint, maxBreakpoint) {
    const minValue = BREAKPOINTS[minBreakpoint];
    const maxValue = BREAKPOINTS[maxBreakpoint];
    return this.screenData.width >= minValue && this.screenData.width < maxValue;
  }

  // Device type checks
  isPhone() {
    return [DEVICE_TYPES.PHONE_SMALL, DEVICE_TYPES.PHONE_MEDIUM, DEVICE_TYPES.PHONE_LARGE]
      .includes(this.screenData.deviceType);
  }

  isTablet() {
    return [DEVICE_TYPES.TABLET_SMALL, DEVICE_TYPES.TABLET_LARGE]
      .includes(this.screenData.deviceType);
  }

  isLandscape() {
    return this.screenData.orientation === ORIENTATIONS.LANDSCAPE;
  }

  isPortrait() {
    return this.screenData.orientation === ORIENTATIONS.PORTRAIT;
  }

  // Safe area calculations
  getSafeAreaInsets() {
    const { hasNotch, statusBarHeight, orientation, isTablet } = this.screenData;
    
    let top = statusBarHeight;
    let bottom = 0;
    let left = 0;
    let right = 0;
    
    if (hasNotch) {
      if (orientation === ORIENTATIONS.PORTRAIT) {
        top = 44;
        bottom = 34;
      } else {
        top = 0;
        bottom = 21;
        left = 44;
        right = 44;
      }
    }
    
    // iPad adjustments
    if (isTablet && Platform.OS === 'ios') {
      top = Math.max(top, 20);
      if (orientation === ORIENTATIONS.LANDSCAPE) {
        left = Math.max(left, 20);
        right = Math.max(right, 20);
      }
    }
    
    return { top, bottom, left, right };
  }

  // Touch target sizing
  getTouchTargetSize(baseSize = 44) {
    const sizeMap = {
      [DEVICE_TYPES.PHONE_SMALL]: Math.max(44, baseSize),
      [DEVICE_TYPES.PHONE_MEDIUM]: Math.max(44, baseSize),
      [DEVICE_TYPES.PHONE_LARGE]: Math.max(48, baseSize),
      [DEVICE_TYPES.TABLET_SMALL]: Math.max(48, baseSize),
      [DEVICE_TYPES.TABLET_LARGE]: Math.max(52, baseSize),
    };
    
    return sizeMap[this.screenData.deviceType] || baseSize;
  }

  // Typography scaling
  getTypographyScale() {
    const scaleMap = {
      [DEVICE_TYPES.PHONE_SMALL]: 0.9,
      [DEVICE_TYPES.PHONE_MEDIUM]: 1.0,
      [DEVICE_TYPES.PHONE_LARGE]: 1.1,
      [DEVICE_TYPES.TABLET_SMALL]: 1.2,
      [DEVICE_TYPES.TABLET_LARGE]: 1.3,
    };
    
    return scaleMap[this.screenData.deviceType] || 1.0;
  }

  // Image sizing
  getOptimalImageSize(aspectRatio = 16/9, maxWidth = null) {
    const containerWidth = this.getContainerWidth(maxWidth);
    const width = containerWidth;
    const height = width / aspectRatio;
    
    return { width, height };
  }

  // Grid calculations
  getGridItemSize(columns, spacing = 16) {
    const containerWidth = this.getContainerWidth();
    const totalSpacing = spacing * (columns - 1);
    const itemWidth = (containerWidth - totalSpacing) / columns;
    
    return {
      width: itemWidth,
      height: itemWidth, // Square by default
    };
  }

  // Performance optimizations
  shouldUseNativeDriver() {
    // Use native driver for better performance on lower-end devices
    return this.screenData.deviceType === DEVICE_TYPES.PHONE_SMALL;
  }

  getOptimalImageQuality() {
    const qualityMap = {
      [DEVICE_TYPES.PHONE_SMALL]: 0.7,
      [DEVICE_TYPES.PHONE_MEDIUM]: 0.8,
      [DEVICE_TYPES.PHONE_LARGE]: 0.9,
      [DEVICE_TYPES.TABLET_SMALL]: 0.9,
      [DEVICE_TYPES.TABLET_LARGE]: 1.0,
    };
    
    return qualityMap[this.screenData.deviceType] || 0.8;
  }

  // Event handling
  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners(screenData) {
    this.listeners.forEach(callback => {
      try {
        callback(screenData);
      } catch (error) {
        console.error('Error in responsive design listener:', error);
      }
    });
  }

  // Utility getters
  getScreenData() {
    return { ...this.screenData };
  }

  getDimensions() {
    return {
      width: this.screenData.width,
      height: this.screenData.height,
    };
  }

  getDeviceInfo() {
    return {
      deviceType: this.screenData.deviceType,
      orientation: this.screenData.orientation,
      isTablet: this.screenData.isTablet,
      hasNotch: this.screenData.hasNotch,
      pixelRatio: this.screenData.pixelRatio,
      fontScale: this.screenData.fontScale,
    };
  }

  // Cleanup
  cleanup() {
    if (this.dimensionSubscription) {
      this.dimensionSubscription.remove();
    }
    this.listeners.clear();
  }
}

// Create singleton instance
const responsiveDesign = new ResponsiveDesignService();

// Export utilities
export const {
  scale,
  verticalScale,
  moderateScale,
  scaledFont,
  getSpacing,
  getColumns,
  getContainerWidth,
  createResponsiveStyles,
  isBreakpoint,
  isBetweenBreakpoints,
  isPhone,
  isTablet,
  isLandscape,
  isPortrait,
  getSafeAreaInsets,
  getTouchTargetSize,
  getTypographyScale,
  getOptimalImageSize,
  getGridItemSize,
  shouldUseNativeDriver,
  getOptimalImageQuality,
  addListener,
  getScreenData,
  getDimensions,
  getDeviceInfo,
} = responsiveDesign;

export default responsiveDesign;