import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StatusBar,
  Platform,
  AppState,
  Alert,
  Linking,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';

// Services
import enhancedOfflineService from './services/enhancedOfflineService';
import gestureNavigationService from './services/gestureNavigationService';
import accessibilityService from './services/accessibilityService';
import advancedMobileFeaturesService from './services/advancedMobileFeatures';
import responsiveDesign from './utils/responsiveDesign';

// Components
import {
  OptimizedContainer,
  AdaptiveLayout,
  EnhancedTouchable,
  ResponsiveText,
  LoadingSkeleton,
  usePerformanceMonitor,
} from './components/MobileOptimizedUI';

// Screens (these would be your actual app screens)
import HomeScreen from './screens/HomeScreen';
import ProfileScreen from './screens/ProfileScreen';
import SettingsScreen from './screens/SettingsScreen';
import AuthScreen from './screens/AuthScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync();

// Main App Component
const MobileApp = () => {
  usePerformanceMonitor('MobileApp');

  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [appState, setAppState] = useState(AppState.currentState);
  const [screenData, setScreenData] = useState(responsiveDesign.getScreenData());
  const [accessibilityState, setAccessibilityState] = useState({});
  const [error, setError] = useState(null);

  // Initialize app services
  const initializeApp = useCallback(async () => {
    try {
      console.log('Initializing mobile app...');

      // Load custom fonts
      await Font.loadAsync({
        'Inter-Regular': require('../assets/fonts/Inter-Regular.ttf'),
        'Inter-Medium': require('../assets/fonts/Inter-Medium.ttf'),
        'Inter-Bold': require('../assets/fonts/Inter-Bold.ttf'),
      });

      // Initialize services in parallel for better performance
      const initPromises = [
        responsiveDesign.initialize(),
        enhancedOfflineService.initialize(),
        gestureNavigationService.initialize(),
        accessibilityService.initialize(),
        advancedMobileFeaturesService.initialize(),
      ];

      const results = await Promise.allSettled(initPromises);
      
      // Log initialization results
      results.forEach((result, index) => {
        const services = ['ResponsiveDesign', 'OfflineService', 'GestureNavigation', 'Accessibility', 'AdvancedFeatures'];
        if (result.status === 'rejected') {
          console.error(`Failed to initialize ${services[index]}:`, result.reason);
        } else {
          console.log(`${services[index]} initialized successfully`);
        }
      });

      // Check authentication status
      const authResult = await checkAuthenticationStatus();
      setIsAuthenticated(authResult);

      // Update accessibility state
      setAccessibilityState(accessibilityService.getAccessibilityState());

      console.log('Mobile app initialization complete');
    } catch (error) {
      console.error('App initialization failed:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
      await SplashScreen.hideAsync();
    }
  }, []);

  // Check if user needs to authenticate
  const checkAuthenticationStatus = useCallback(async () => {
    try {
      // Check if biometric authentication is required
      const requiresAuth = await advancedMobileFeaturesService.isBiometricAuthenticationRequired();
      
      if (requiresAuth) {
        const authResult = await advancedMobileFeaturesService.authenticateWithBiometrics({
          promptMessage: 'Authenticate to access the app',
        });
        return authResult.success;
      }
      
      // Check for existing session or token
      const hasValidSession = await enhancedOfflineService.hasValidSession();
      return hasValidSession;
    } catch (error) {
      console.error('Authentication check failed:', error);
      return false;
    }
  }, []);

  // Handle app state changes
  const handleAppStateChange = useCallback(async (nextAppState) => {
    console.log('App state changing from', appState, 'to', nextAppState);
    
    if (appState.match(/inactive|background/) && nextAppState === 'active') {
      // App has come to the foreground
      const authResult = await advancedMobileFeaturesService.handleAppForeground();
      if (!authResult.success) {
        setIsAuthenticated(false);
      }
    } else if (nextAppState === 'background') {
      // App has gone to the background
      await advancedMobileFeaturesService.handleAppBackground();
    }
    
    setAppState(nextAppState);
  }, [appState]);

  // Handle deep links
  const handleDeepLink = useCallback((url) => {
    console.log('Deep link received:', url);
    // Implement your deep link handling logic here
  }, []);

  // Set up event listeners
  useEffect(() => {
    // App state listener
    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
    
    // Deep link listener
    const linkingSubscription = Linking.addEventListener('url', handleDeepLink);
    
    // Responsive design listener
    const responsiveUnsubscribe = responsiveDesign.addListener(setScreenData);
    
    // Accessibility change listener
    accessibilityService.registerAccessibilityCallback('screenReaderChanged', (enabled) => {
      setAccessibilityState(prev => ({ ...prev, screenReaderEnabled: enabled }));
    });

    return () => {
      appStateSubscription?.remove();
      linkingSubscription?.remove();
      responsiveUnsubscribe?.();
    };
  }, [handleAppStateChange, handleDeepLink]);

  // Initialize app on mount
  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  // Memoized navigation theme
  const navigationTheme = useMemo(() => ({
    dark: false,
    colors: {
      primary: '#007AFF',
      background: '#FFFFFF',
      card: '#F2F2F7',
      text: '#000000',
      border: '#C6C6C8',
      notification: '#FF3B30',
    },
  }), []);

  // Memoized tab bar options
  const tabBarOptions = useMemo(() => ({
    tabBarActiveTintColor: '#007AFF',
    tabBarInactiveTintColor: '#8E8E93',
    tabBarStyle: {
      backgroundColor: '#F2F2F7',
      borderTopColor: '#C6C6C8',
      height: screenData.isTablet ? 70 : 60,
      paddingBottom: screenData.hasNotch ? 20 : 10,
    },
    tabBarLabelStyle: {
      fontSize: responsiveDesign.scaledFont(12),
      fontFamily: 'Inter-Medium',
    },
    tabBarIconStyle: {
      marginTop: 4,
    },
  }), [screenData]);

  // Tab Navigator Component
  const TabNavigator = useCallback(() => (
    <Tab.Navigator screenOptions={tabBarOptions}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  ), [tabBarOptions]);

  // Loading Screen Component
  const LoadingScreen = useCallback(() => (
    <OptimizedContainer style={{ justifyContent: 'center', alignItems: 'center' }}>
      <LoadingSkeleton width={200} height={20} style={{ marginBottom: 20 }} />
      <LoadingSkeleton width={150} height={16} style={{ marginBottom: 10 }} />
      <LoadingSkeleton width={100} height={14} />
      <ResponsiveText variant="body" style={{ marginTop: 20, color: '#8E8E93' }}>
        Loading your experience...
      </ResponsiveText>
    </OptimizedContainer>
  ), []);

  // Error Screen Component
  const ErrorScreen = useCallback(() => (
    <OptimizedContainer style={{ justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Ionicons name="alert-circle" size={64} color="#FF3B30" />
      <ResponsiveText variant="headline" style={{ marginTop: 20, textAlign: 'center' }}>
        Something went wrong
      </ResponsiveText>
      <ResponsiveText variant="body" style={{ marginTop: 10, textAlign: 'center', color: '#8E8E93' }}>
        {error}
      </ResponsiveText>
      <EnhancedTouchable
        style={{
          backgroundColor: '#007AFF',
          paddingHorizontal: 24,
          paddingVertical: 12,
          borderRadius: 8,
          marginTop: 20,
        }}
        onPress={() => {
          setError(null);
          setIsLoading(true);
          initializeApp();
        }}
      >
        <ResponsiveText variant="body" style={{ color: '#FFFFFF', fontWeight: '600' }}>
          Try Again
        </ResponsiveText>
      </EnhancedTouchable>
    </OptimizedContainer>
  ), [error, initializeApp]);

  // Main render logic
  if (error) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
          <ErrorScreen />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  if (isLoading) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
          <LoadingScreen />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar 
          barStyle={screenData.orientation === 'landscape' ? 'light-content' : 'dark-content'}
          backgroundColor="#FFFFFF"
          translucent={Platform.OS === 'android'}
        />
        
        <NavigationContainer theme={navigationTheme}>
          <AdaptiveLayout>
            {({ isTablet, orientation }) => (
              <Stack.Navigator
                screenOptions={{
                  headerShown: false,
                  gestureEnabled: true,
                  animation: accessibilityState.reducedMotionEnabled ? 'none' : 'slide_from_right',
                }}
              >
                {!isAuthenticated ? (
                  <Stack.Screen 
                    name="Auth" 
                    component={AuthScreen}
                    options={{ gestureEnabled: false }}
                  />
                ) : (
                  <Stack.Screen name="Main" component={TabNavigator} />
                )}
              </Stack.Navigator>
            )}
          </AdaptiveLayout>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default MobileApp;