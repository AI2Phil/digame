import { Dimensions, Platform } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import DeviceInfo from 'react-native-device-info';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

class GestureNavigationService {
  constructor() {
    this.isInitialized = false;
    this.gestureEnabled = true;
    this.hapticEnabled = true;
    this.deviceType = 'phone';
    this.gestureThresholds = {
      swipeMinDistance: 50,
      swipeMaxTime: 300,
      pinchMinScale: 0.8,
      pinchMaxScale: 3.0,
      longPressMinDuration: 500,
      doubleTapMaxDelay: 300,
    };
    this.navigationCallbacks = new Map();
  }

  async initialize() {
    try {
      this.deviceType = await DeviceInfo.getDeviceType();
      this.adjustThresholdsForDevice();
      this.isInitialized = true;
      console.log('Gesture Navigation Service initialized');
      return true;
    } catch (error) {
      console.error('Failed to initialize gesture navigation:', error);
      return false;
    }
  }

  adjustThresholdsForDevice() {
    if (this.deviceType === 'Tablet') {
      this.gestureThresholds.swipeMinDistance = 80;
      this.gestureThresholds.longPressMinDuration = 400;
    } else if (Platform.OS === 'ios') {
      // iOS specific adjustments
      this.gestureThresholds.swipeMinDistance = 60;
    }
  }

  // Enhanced swipe gesture with direction detection and momentum
  createSwipeGesture(onSwipe, options = {}) {
    const {
      direction = 'all', // 'left', 'right', 'up', 'down', 'horizontal', 'vertical', 'all'
      minDistance = this.gestureThresholds.swipeMinDistance,
      maxTime = this.gestureThresholds.swipeMaxTime,
      enableHaptic = this.hapticEnabled,
    } = options;

    const startTime = useSharedValue(0);
    const startPosition = useSharedValue({ x: 0, y: 0 });

    const gesture = Gesture.Pan()
      .onBegin((event) => {
        startTime.value = Date.now();
        startPosition.value = { x: event.x, y: event.y };
      })
      .onEnd((event) => {
        const endTime = Date.now();
        const duration = endTime - startTime.value;
        const deltaX = event.x - startPosition.value.x;
        const deltaY = event.y - startPosition.value.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const velocity = distance / duration;

        if (distance >= minDistance && duration <= maxTime) {
          const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
          const swipeDirection = this.getSwipeDirection(angle);

          if (this.isDirectionAllowed(swipeDirection, direction)) {
            if (enableHaptic) {
              runOnJS(this.triggerHaptic)('light');
            }
            
            runOnJS(onSwipe)({
              direction: swipeDirection,
              distance,
              velocity,
              duration,
              deltaX,
              deltaY,
            });
          }
        }
      });

    return gesture;
  }

  // Advanced pinch gesture with scale limits and momentum
  createPinchGesture(onPinch, options = {}) {
    const {
      minScale = this.gestureThresholds.pinchMinScale,
      maxScale = this.gestureThresholds.pinchMaxScale,
      enableHaptic = this.hapticEnabled,
    } = options;

    const scale = useSharedValue(1);
    const savedScale = useSharedValue(1);

    const gesture = Gesture.Pinch()
      .onUpdate((event) => {
        const newScale = savedScale.value * event.scale;
        scale.value = Math.max(minScale, Math.min(maxScale, newScale));
      })
      .onEnd(() => {
        savedScale.value = scale.value;
        
        if (enableHaptic) {
          runOnJS(this.triggerHaptic)('medium');
        }
        
        runOnJS(onPinch)({
          scale: scale.value,
          isZoomIn: scale.value > 1,
          isZoomOut: scale.value < 1,
        });
      });

    return { gesture, scale };
  }

  // Long press gesture with progress feedback
  createLongPressGesture(onLongPress, options = {}) {
    const {
      minDuration = this.gestureThresholds.longPressMinDuration,
      enableHaptic = this.hapticEnabled,
      showProgress = true,
    } = options;

    const progress = useSharedValue(0);
    let timeoutId = null;

    const gesture = Gesture.LongPress()
      .minDuration(minDuration)
      .onStart(() => {
        if (showProgress) {
          progress.value = withTiming(1, { duration: minDuration });
        }
        
        if (enableHaptic) {
          runOnJS(this.triggerHaptic)('heavy');
        }
      })
      .onEnd(() => {
        progress.value = withTiming(0, { duration: 200 });
        runOnJS(onLongPress)();
      })
      .onTouchesUp(() => {
        progress.value = withTiming(0, { duration: 200 });
      });

    return { gesture, progress };
  }

  // Double tap gesture with timing control
  createDoubleTapGesture(onDoubleTap, options = {}) {
    const {
      maxDelay = this.gestureThresholds.doubleTapMaxDelay,
      enableHaptic = this.hapticEnabled,
    } = options;

    const gesture = Gesture.Tap()
      .numberOfTaps(2)
      .maxDelay(maxDelay)
      .onEnd(() => {
        if (enableHaptic) {
          runOnJS(this.triggerHaptic)('light');
        }
        runOnJS(onDoubleTap)();
      });

    return gesture;
  }

  // Advanced rotation gesture
  createRotationGesture(onRotation, options = {}) {
    const {
      enableHaptic = this.hapticEnabled,
      snapToAngles = [], // Array of angles to snap to (e.g., [0, 90, 180, 270])
      snapThreshold = 15, // Degrees
    } = options;

    const rotation = useSharedValue(0);
    const savedRotation = useSharedValue(0);

    const gesture = Gesture.Rotation()
      .onUpdate((event) => {
        let newRotation = savedRotation.value + event.rotation;
        
        // Snap to angles if specified
        if (snapToAngles.length > 0) {
          const degrees = (newRotation * 180) / Math.PI;
          for (const snapAngle of snapToAngles) {
            if (Math.abs(degrees - snapAngle) < snapThreshold) {
              newRotation = (snapAngle * Math.PI) / 180;
              break;
            }
          }
        }
        
        rotation.value = newRotation;
      })
      .onEnd(() => {
        savedRotation.value = rotation.value;
        
        if (enableHaptic) {
          runOnJS(this.triggerHaptic)('medium');
        }
        
        const degrees = (rotation.value * 180) / Math.PI;
        runOnJS(onRotation)({
          rotation: rotation.value,
          degrees,
        });
      });

    return { gesture, rotation };
  }

  // Edge swipe gesture for navigation
  createEdgeSwipeGesture(onEdgeSwipe, options = {}) {
    const {
      edge = 'left', // 'left', 'right', 'top', 'bottom'
      edgeWidth = 20,
      enableHaptic = this.hapticEnabled,
    } = options;

    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);

    const gesture = Gesture.Pan()
      .onBegin((event) => {
        const isValidEdge = this.isEdgeSwipe(event, edge, edgeWidth);
        if (!isValidEdge) {
          return;
        }
      })
      .onUpdate((event) => {
        if (edge === 'left' || edge === 'right') {
          translateX.value = event.translationX;
        } else {
          translateY.value = event.translationY;
        }
      })
      .onEnd((event) => {
        const threshold = SCREEN_WIDTH * 0.3;
        const shouldTrigger = Math.abs(event.translationX) > threshold || 
                             Math.abs(event.translationY) > threshold;

        if (shouldTrigger) {
          if (enableHaptic) {
            runOnJS(this.triggerHaptic)('heavy');
          }
          
          runOnJS(onEdgeSwipe)({
            edge,
            translation: {
              x: event.translationX,
              y: event.translationY,
            },
          });
        }

        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      });

    return { gesture, translateX, translateY };
  }

  // Multi-finger gesture detection
  createMultiFingerGesture(onMultiFinger, options = {}) {
    const {
      minFingers = 2,
      maxFingers = 5,
      enableHaptic = this.hapticEnabled,
    } = options;

    const gesture = Gesture.Manual()
      .onTouchesDown((event) => {
        const fingerCount = event.allTouches.length;
        
        if (fingerCount >= minFingers && fingerCount <= maxFingers) {
          if (enableHaptic) {
            runOnJS(this.triggerHaptic)('medium');
          }
          
          runOnJS(onMultiFinger)({
            fingerCount,
            touches: event.allTouches,
          });
        }
      });

    return gesture;
  }

  // Gesture combination for complex interactions
  createComboGesture(gestures, options = {}) {
    const {
      simultaneous = false,
      enableHaptic = this.hapticEnabled,
    } = options;

    if (simultaneous) {
      return Gesture.Simultaneous(...gestures);
    } else {
      return Gesture.Exclusive(...gestures);
    }
  }

  // Navigation-specific gestures
  createNavigationGestures(navigation) {
    const backGesture = this.createEdgeSwipeGesture(
      () => {
        if (navigation.canGoBack()) {
          navigation.goBack();
        }
      },
      { edge: 'left' }
    );

    const menuGesture = this.createEdgeSwipeGesture(
      () => {
        navigation.openDrawer?.();
      },
      { edge: 'right' }
    );

    const refreshGesture = this.createSwipeGesture(
      ({ direction }) => {
        if (direction === 'down') {
          this.triggerRefresh();
        }
      },
      { direction: 'down' }
    );

    return {
      backGesture: backGesture.gesture,
      menuGesture: menuGesture.gesture,
      refreshGesture,
    };
  }

  // Utility methods
  getSwipeDirection(angle) {
    const absAngle = Math.abs(angle);
    
    if (absAngle <= 45) return 'right';
    if (absAngle >= 135) return 'left';
    if (angle > 0) return 'down';
    return 'up';
  }

  isDirectionAllowed(swipeDirection, allowedDirection) {
    if (allowedDirection === 'all') return true;
    if (allowedDirection === 'horizontal') return ['left', 'right'].includes(swipeDirection);
    if (allowedDirection === 'vertical') return ['up', 'down'].includes(swipeDirection);
    return swipeDirection === allowedDirection;
  }

  isEdgeSwipe(event, edge, edgeWidth) {
    switch (edge) {
      case 'left':
        return event.x <= edgeWidth;
      case 'right':
        return event.x >= SCREEN_WIDTH - edgeWidth;
      case 'top':
        return event.y <= edgeWidth;
      case 'bottom':
        return event.y >= SCREEN_HEIGHT - edgeWidth;
      default:
        return false;
    }
  }

  async triggerHaptic(intensity = 'light') {
    if (!this.hapticEnabled) return;
    
    try {
      switch (intensity) {
        case 'light':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'medium':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'heavy':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        case 'success':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'warning':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
        case 'error':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
        default:
          await Haptics.selectionAsync();
      }
    } catch (error) {
      console.error('Haptic feedback failed:', error);
    }
  }

  triggerRefresh() {
    const callback = this.navigationCallbacks.get('refresh');
    if (callback) {
      callback();
    }
  }

  // Configuration methods
  setGestureEnabled(enabled) {
    this.gestureEnabled = enabled;
  }

  setHapticEnabled(enabled) {
    this.hapticEnabled = enabled;
  }

  updateThresholds(newThresholds) {
    this.gestureThresholds = { ...this.gestureThresholds, ...newThresholds };
  }

  registerNavigationCallback(type, callback) {
    this.navigationCallbacks.set(type, callback);
  }

  unregisterNavigationCallback(type) {
    this.navigationCallbacks.delete(type);
  }

  // Animated style helpers
  createSwipeAnimatedStyle(translateX, translateY) {
    return useAnimatedStyle(() => ({
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
      ],
    }));
  }

  createScaleAnimatedStyle(scale) {
    return useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));
  }

  createRotationAnimatedStyle(rotation) {
    return useAnimatedStyle(() => ({
      transform: [{ rotate: `${rotation.value}rad` }],
    }));
  }

  createProgressAnimatedStyle(progress, options = {}) {
    const { color = '#007AFF', backgroundColor = '#E5E5EA' } = options;
    
    return useAnimatedStyle(() => ({
      backgroundColor: backgroundColor,
      borderRadius: 2,
      overflow: 'hidden',
      '::after': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        height: '100%',
        width: `${progress.value * 100}%`,
        backgroundColor: color,
        transition: 'width 0.2s ease',
      },
    }));
  }

  // Gesture state management
  getGestureState() {
    return {
      isInitialized: this.isInitialized,
      gestureEnabled: this.gestureEnabled,
      hapticEnabled: this.hapticEnabled,
      deviceType: this.deviceType,
      thresholds: this.gestureThresholds,
    };
  }
}

export default new GestureNavigationService();