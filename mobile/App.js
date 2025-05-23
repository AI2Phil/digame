import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, AppState } from 'react-native';

// Import screens
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';

// Import services
import { AuthService } from './src/services/AuthService';
import notificationService from './src/services/notificationService';
import biometricService from './src/services/biometricService';
import offlineService from './src/services/offlineService';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Main Tab Navigator for authenticated users
function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Analytics') {
            iconName = focused ? 'analytics' : 'analytics-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        headerStyle: {
          backgroundColor: '#007AFF',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen 
        name="Analytics" 
        component={AnalyticsScreen}
        options={{ title: 'Analytics' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [servicesInitialized, setServicesInitialized] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'active' && servicesInitialized) {
        // App came to foreground, sync data if online
        offlineService.syncData();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [servicesInitialized]);

  const initializeApp = async () => {
    try {
      // Initialize enhanced services
      await initializeServices();
      
      // Check authentication status
      await checkAuthStatus();
    } catch (error) {
      console.error('Error initializing app:', error);
      setIsLoading(false);
    }
  };

  const initializeServices = async () => {
    try {
      // Initialize offline service first
      await offlineService.initialize();
      
      // Initialize notifications
      const pushToken = await notificationService.initialize();
      if (pushToken) {
        console.log('Push token:', pushToken);
        // TODO: Send token to backend when user logs in
      }
      
      // Initialize biometric service
      const biometricStatus = await biometricService.initialize();
      console.log('Biometric status:', biometricStatus);
      
      // Schedule productivity reminders
      await notificationService.scheduleProductivityReminders();
      
      setServicesInitialized(true);
    } catch (error) {
      console.error('Failed to initialize services:', error);
      setServicesInitialized(true); // Continue even if some services fail
    }
  };

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const onboardingCompleted = await AsyncStorage.getItem('onboardingCompleted');
      
      if (token) {
        // Verify token with backend
        const isValid = await AuthService.verifyToken(token);
        if (isValid) {
          setIsAuthenticated(true);
          setNeedsOnboarding(onboardingCompleted !== 'true');
        } else {
          await AsyncStorage.removeItem('authToken');
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (token, user) => {
    await AsyncStorage.setItem('authToken', token);
    await AsyncStorage.setItem('user', JSON.stringify(user));
    
    // Register push token with backend if available
    if (notificationService.expoPushToken) {
      try {
        await notificationService.registerTokenWithBackend(
          notificationService.expoPushToken,
          user.id
        );
      } catch (error) {
        console.error('Failed to register push token:', error);
      }
    }
    
    // Check if user wants to enable biometric login
    const biometricStatus = await biometricService.initialize();
    if (biometricStatus.isAvailable && biometricStatus.isEnrolled) {
      const shouldEnable = await biometricService.showBiometricSetupPrompt();
      if (shouldEnable) {
        try {
          await biometricService.enableBiometricLogin({
            email: user.email,
            token: token,
          });
          Alert.alert(
            'Success',
            'Biometric login has been enabled for your account.'
          );
        } catch (error) {
          console.error('Failed to enable biometric login:', error);
        }
      }
    }
    
    setIsAuthenticated(true);
    setNeedsOnboarding(!user.onboarding_completed);
  };

  const handleLogout = async () => {
    try {
      // Clean up biometric data
      await biometricService.disableBiometricLogin();
      
      // Cancel all scheduled notifications
      await notificationService.cancelAllNotifications();
      
      // Clear offline cache
      await offlineService.clearCache();
      
      // Remove stored data
      await AsyncStorage.multiRemove(['authToken', 'user']);
      
      setIsAuthenticated(false);
      setNeedsOnboarding(false);
    } catch (error) {
      console.error('Error during logout:', error);
      // Still proceed with logout even if cleanup fails
      await AsyncStorage.multiRemove(['authToken', 'user']);
      setIsAuthenticated(false);
      setNeedsOnboarding(false);
    }
  };

  const handleOnboardingComplete = async () => {
    await AsyncStorage.setItem('onboardingCompleted', 'true');
    setNeedsOnboarding(false);
  };

  if (isLoading) {
    return null; // You could show a loading screen here
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          // Auth Stack
          <>
            <Stack.Screen name="Login">
              {props => <LoginScreen {...props} onLogin={handleLogin} />}
            </Stack.Screen>
            <Stack.Screen name="Register">
              {props => <RegisterScreen {...props} onLogin={handleLogin} />}
            </Stack.Screen>
          </>
        ) : needsOnboarding ? (
          // Onboarding Stack
          <Stack.Screen name="Onboarding">
            {props => <OnboardingScreen {...props} onComplete={handleOnboardingComplete} />}
          </Stack.Screen>
        ) : (
          // Main App Stack
          <Stack.Screen name="Main">
            {props => <MainTabNavigator {...props} onLogout={handleLogout} />}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}