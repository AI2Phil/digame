import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  Platform,
  StatusBar,
  SafeAreaView,
  TouchableOpacity,
  TouchableHighlight,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import DeviceInfo from 'react-native-device-info';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Responsive breakpoints
const BREAKPOINTS = {
  small: 320,
  medium: 375,
  large: 414,
  xlarge: 768,
};

// Touch target sizes (Apple HIG and Material Design)
const TOUCH_TARGETS = {
  minimum: 44, // iOS minimum
  recommended: 48, // Material Design
  comfortable: 56,
};

// Performance-optimized container component
export const OptimizedContainer = React.memo(({ 
  children, 
  style, 
  enableBlur = false,
  blurIntensity = 20,
  ...props 
}) => {
  const insets = useSafeAreaInsets();
  
  const containerStyle = useMemo(() => [
    {
      flex: 1,
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
      paddingLeft: insets.left,
      paddingRight: insets.right,
    },
    style,
  ], [insets, style]);

  if (enableBlur) {
    return (
      <BlurView intensity={blurIntensity} style={containerStyle} {...props}>
        {children}
      </BlurView>
    );
  }

  return (
    <SafeAreaView style={containerStyle} {...props}>
      {children}
    </SafeAreaView>
  );
});

// Adaptive layout component based on screen size
export const AdaptiveLayout = React.memo(({ 
  children, 
  breakpoint = 'medium',
  orientation = 'portrait',
  ...props 
}) => {
  const [screenData, setScreenData] = useState({
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    orientation: 'portrait',
    isTablet: false,
  });

  useEffect(() => {
    const updateScreenData = () => {
      const { width, height } = Dimensions.get('window');
      const isLandscape = width > height;
      const isTablet = Math.min(width, height) >= BREAKPOINTS.xlarge;
      
      setScreenData({
        width,
        height,
        orientation: isLandscape ? 'landscape' : 'portrait',
        isTablet,
      });
    };

    const subscription = Dimensions.addEventListener('change', updateScreenData);
    updateScreenData();

    return () => subscription?.remove();
  }, []);

  const layoutStyle = useMemo(() => {
    const { width, isTablet, orientation } = screenData;
    
    if (isTablet) {
      return {
        flexDirection: orientation === 'landscape' ? 'row' : 'column',
        maxWidth: orientation === 'landscape' ? '100%' : 768,
        alignSelf: 'center',
      };
    }

    return {
      flexDirection: 'column',
      width: '100%',
    };
  }, [screenData]);

  return (
    <View style={[layoutStyle, props.style]} {...props}>
      {typeof children === 'function' ? children(screenData) : children}
    </View>
  );
});

// Enhanced touchable component with proper sizing and feedback
export const EnhancedTouchable = React.memo(({ 
  children,
  onPress,
  style,
  variant = 'opacity', // 'opacity', 'highlight', 'pressable'
  size = 'recommended',
  hapticFeedback = 'light',
  disabled = false,
  loading = false,
  ...props 
}) => {
  const minSize = TOUCH_TARGETS[size] || TOUCH_TARGETS.recommended;
  
  const handlePress = useCallback(async () => {
    if (disabled || loading) return;
    
    if (hapticFeedback) {
      try {
        await Haptics.impactAsync(
          hapticFeedback === 'light' 
            ? Haptics.ImpactFeedbackStyle.Light
            : hapticFeedback === 'medium'
            ? Haptics.ImpactFeedbackStyle.Medium
            : Haptics.ImpactFeedbackStyle.Heavy
        );
      } catch (error) {
        console.warn('Haptic feedback failed:', error);
      }
    }
    
    onPress?.();
  }, [onPress, disabled, loading, hapticFeedback]);

  const touchableStyle = useMemo(() => [
    {
      minHeight: minSize,
      minWidth: minSize,
      justifyContent: 'center',
      alignItems: 'center',
      opacity: disabled ? 0.5 : 1,
    },
    style,
  ], [minSize, disabled, style]);

  const content = loading ? (
    <ActivityIndicator size="small" color="#007AFF" />
  ) : (
    children
  );

  switch (variant) {
    case 'highlight':
      return (
        <TouchableHighlight
          style={touchableStyle}
          onPress={handlePress}
          disabled={disabled || loading}
          underlayColor="rgba(0, 0, 0, 0.1)"
          {...props}
        >
          {content}
        </TouchableHighlight>
      );
    
    case 'pressable':
      return (
        <Pressable
          style={({ pressed }) => [
            touchableStyle,
            pressed && { opacity: 0.7 },
          ]}
          onPress={handlePress}
          disabled={disabled || loading}
          {...props}
        >
          {content}
        </Pressable>
      );
    
    default:
      return (
        <TouchableOpacity
          style={touchableStyle}
          onPress={handlePress}
          disabled={disabled || loading}
          activeOpacity={0.7}
          {...props}
        >
          {content}
        </TouchableOpacity>
      );
  }
});

// Responsive text component with automatic scaling
export const ResponsiveText = React.memo(({ 
  children,
  style,
  variant = 'body', // 'title', 'headline', 'body', 'caption'
  maxFontSizeMultiplier = 1.3,
  ...props 
}) => {
  const [deviceInfo, setDeviceInfo] = useState({
    fontScale: 1,
    isTablet: false,
  });

  useEffect(() => {
    const getDeviceInfo = async () => {
      const isTablet = await DeviceInfo.isTablet();
      const fontScale = await DeviceInfo.getFontScale();
      
      setDeviceInfo({ fontScale, isTablet });
    };
    
    getDeviceInfo();
  }, []);

  const textStyle = useMemo(() => {
    const baseStyles = {
      title: { fontSize: 28, fontWeight: '700', lineHeight: 34 },
      headline: { fontSize: 22, fontWeight: '600', lineHeight: 28 },
      body: { fontSize: 16, fontWeight: '400', lineHeight: 22 },
      caption: { fontSize: 12, fontWeight: '400', lineHeight: 16 },
    };

    const baseStyle = baseStyles[variant] || baseStyles.body;
    const scaleFactor = Math.min(deviceInfo.fontScale, maxFontSizeMultiplier);
    
    return [
      {
        ...baseStyle,
        fontSize: baseStyle.fontSize * scaleFactor,
        lineHeight: baseStyle.lineHeight * scaleFactor,
      },
      deviceInfo.isTablet && { fontSize: baseStyle.fontSize * 1.1 },
      style,
    ];
  }, [variant, deviceInfo, maxFontSizeMultiplier, style]);

  return (
    <Text
      style={textStyle}
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      {...props}
    >
      {children}
    </Text>
  );
});

// Performance-optimized list component
export const OptimizedFlatList = React.memo(({ 
  data,
  renderItem,
  keyExtractor,
  onRefresh,
  refreshing = false,
  estimatedItemSize = 60,
  windowSize = 10,
  maxToRenderPerBatch = 5,
  updateCellsBatchingPeriod = 50,
  removeClippedSubviews = true,
  ...props 
}) => {
  const getItemLayout = useCallback((data, index) => ({
    length: estimatedItemSize,
    offset: estimatedItemSize * index,
    index,
  }), [estimatedItemSize]);

  const refreshControl = onRefresh ? (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor="#007AFF"
      colors={['#007AFF']}
    />
  ) : undefined;

  return (
    <Animated.FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
      windowSize={windowSize}
      maxToRenderPerBatch={maxToRenderPerBatch}
      updateCellsBatchingPeriod={updateCellsBatchingPeriod}
      removeClippedSubviews={removeClippedSubviews}
      refreshControl={refreshControl}
      showsVerticalScrollIndicator={false}
      {...props}
    />
  );
});

// Adaptive card component with elevation and shadows
export const AdaptiveCard = React.memo(({ 
  children,
  style,
  elevation = 2,
  borderRadius = 12,
  padding = 16,
  margin = 8,
  backgroundColor = '#FFFFFF',
  shadowColor = '#000000',
  ...props 
}) => {
  const cardStyle = useMemo(() => {
    const shadowStyle = Platform.select({
      ios: {
        shadowColor,
        shadowOffset: { width: 0, height: elevation },
        shadowOpacity: 0.1 + (elevation * 0.05),
        shadowRadius: elevation * 2,
      },
      android: {
        elevation: elevation * 2,
      },
    });

    return [
      {
        backgroundColor,
        borderRadius,
        padding,
        margin,
        ...shadowStyle,
      },
      style,
    ];
  }, [elevation, borderRadius, padding, margin, backgroundColor, shadowColor, style]);

  return (
    <View style={cardStyle} {...props}>
      {children}
    </View>
  );
});

// Animated loading skeleton
export const LoadingSkeleton = React.memo(({ 
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
  ...props 
}) => {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    const animate = () => {
      opacity.value = withTiming(1, { duration: 800 }, () => {
        opacity.value = withTiming(0.3, { duration: 800 }, animate);
      });
    };
    animate();
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const skeletonStyle = useMemo(() => [
    {
      width,
      height,
      borderRadius,
      backgroundColor: '#E1E1E1',
    },
    style,
  ], [width, height, borderRadius, style]);

  return (
    <Animated.View style={[skeletonStyle, animatedStyle]} {...props} />
  );
});

// Responsive grid component
export const ResponsiveGrid = React.memo(({ 
  data,
  renderItem,
  numColumns = 2,
  spacing = 8,
  style,
  ...props 
}) => {
  const [screenWidth, setScreenWidth] = useState(SCREEN_WIDTH);

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenWidth(window.width);
    });

    return () => subscription?.remove();
  }, []);

  const itemWidth = useMemo(() => {
    const totalSpacing = spacing * (numColumns + 1);
    return (screenWidth - totalSpacing) / numColumns;
  }, [screenWidth, numColumns, spacing]);

  const renderGridItem = useCallback(({ item, index }) => {
    const marginLeft = index % numColumns === 0 ? spacing : spacing / 2;
    const marginRight = (index + 1) % numColumns === 0 ? spacing : spacing / 2;
    
    return (
      <View style={{ 
        width: itemWidth, 
        marginLeft, 
        marginRight, 
        marginBottom: spacing 
      }}>
        {renderItem({ item, index, itemWidth })}
      </View>
    );
  }, [renderItem, itemWidth, numColumns, spacing]);

  return (
    <View style={[{ paddingTop: spacing }, style]} {...props}>
      <OptimizedFlatList
        data={data}
        renderItem={renderGridItem}
        numColumns={numColumns}
        key={numColumns} // Force re-render when columns change
        columnWrapperStyle={numColumns > 1 ? { justifyContent: 'space-between' } : null}
        {...props}
      />
    </View>
  );
});

// Performance monitoring hook
export const usePerformanceMonitor = (componentName) => {
  useEffect(() => {
    const startTime = Date.now();
    
    return () => {
      const endTime = Date.now();
      const renderTime = endTime - startTime;
      
      if (renderTime > 100) {
        console.warn(`${componentName} took ${renderTime}ms to render`);
      }
    };
  }, [componentName]);
};

// Device-specific utilities
export const DeviceUtils = {
  isSmallScreen: () => SCREEN_WIDTH < BREAKPOINTS.medium,
  isMediumScreen: () => SCREEN_WIDTH >= BREAKPOINTS.medium && SCREEN_WIDTH < BREAKPOINTS.large,
  isLargeScreen: () => SCREEN_WIDTH >= BREAKPOINTS.large,
  isTablet: () => SCREEN_WIDTH >= BREAKPOINTS.xlarge,
  
  getOptimalColumns: () => {
    if (SCREEN_WIDTH < BREAKPOINTS.medium) return 1;
    if (SCREEN_WIDTH < BREAKPOINTS.large) return 2;
    if (SCREEN_WIDTH < BREAKPOINTS.xlarge) return 3;
    return 4;
  },
  
  getOptimalSpacing: () => {
    if (SCREEN_WIDTH < BREAKPOINTS.medium) return 8;
    if (SCREEN_WIDTH < BREAKPOINTS.xlarge) return 12;
    return 16;
  },
  
  getStatusBarHeight: () => {
    if (Platform.OS === 'ios') {
      return StatusBar.currentHeight || 44;
    }
    return StatusBar.currentHeight || 24;
  },
};

export default {
  OptimizedContainer,
  AdaptiveLayout,
  EnhancedTouchable,
  ResponsiveText,
  OptimizedFlatList,
  AdaptiveCard,
  LoadingSkeleton,
  ResponsiveGrid,
  usePerformanceMonitor,
  DeviceUtils,
  BREAKPOINTS,
  TOUCH_TARGETS,
};