import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import {
  OptimizedContainer,
  AdaptiveLayout,
  EnhancedTouchable,
  ResponsiveText,
  AdaptiveCard,
  usePerformanceMonitor,
} from '../components/MobileOptimizedUI';

import accessibilityService from '../services/accessibilityService';
import advancedMobileFeaturesService from '../services/advancedMobileFeatures';
import gestureNavigationService from '../services/gestureNavigationService';
import responsiveDesign from '../utils/responsiveDesign';

const AuthScreen = ({ navigation }) => {
  usePerformanceMonitor('AuthScreen');

  const [isLoading, setIsLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState('biometric'); // 'biometric', 'passcode', 'demo'

  const handleBiometricAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const authResult = await advancedMobileFeaturesService.authenticateWithBiometrics({
        promptMessage: 'Authenticate to access Digame',
        fallbackLabel: 'Use Passcode',
      });
      
      if (authResult.success) {
        // Provide success feedback
        if (gestureNavigationService.hapticEnabled) {
          await gestureNavigationService.triggerHaptic('success');
        }
        
        if (accessibilityService.isScreenReaderEnabled()) {
          await accessibilityService.announceForScreenReader('Authentication successful');
        }
        
        // Navigate to main app (this would be handled by the parent component)
        Alert.alert('Success', 'Authentication successful!');
      } else {
        // Handle authentication failure
        if (gestureNavigationService.hapticEnabled) {
          await gestureNavigationService.triggerHaptic('error');
        }
        
        Alert.alert(
          'Authentication Failed', 
          authResult.error || 'Please try again',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Try Again', onPress: handleBiometricAuth },
            { text: 'Use Passcode', onPress: () => setAuthMethod('passcode') },
          ]
        );
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
      Alert.alert('Error', 'Authentication service unavailable');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handlePasscodeAuth = useCallback(() => {
    // In a real app, this would show a passcode input screen
    Alert.alert(
      'Passcode Authentication',
      'Passcode authentication would be implemented here',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Demo Login', onPress: handleDemoLogin },
      ]
    );
  }, []);

  const handleDemoLogin = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Simulate demo login
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (gestureNavigationService.hapticEnabled) {
        await gestureNavigationService.triggerHaptic('success');
      }
      
      Alert.alert('Demo Mode', 'Logged in with demo account');
    } catch (error) {
      console.error('Demo login error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const AuthMethodButton = useCallback(({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    primary = false,
    disabled = false 
  }) => (
    <AdaptiveCard style={{ marginBottom: 16 }}>
      <EnhancedTouchable
        style={{
          padding: 20,
          alignItems: 'center',
          backgroundColor: primary ? '#007AFF' : 'transparent',
          borderRadius: 12,
        }}
        onPress={onPress}
        disabled={disabled || isLoading}
        loading={isLoading && primary}
        hapticFeedback="medium"
        {...accessibilityService.createAccessibilityProps({
          label: title,
          hint: subtitle,
          role: 'button',
          state: { disabled: disabled || isLoading },
        })}
      >
        <Ionicons
          name={icon}
          size={48}
          color={primary ? '#FFFFFF' : '#007AFF'}
          style={{ marginBottom: 12 }}
        />
        <ResponsiveText
          variant="headline"
          style={{
            fontSize: responsiveDesign.scaledFont(18),
            fontWeight: '600',
            color: primary ? '#FFFFFF' : '#000000',
            marginBottom: 4,
            textAlign: 'center',
          }}
        >
          {title}
        </ResponsiveText>
        <ResponsiveText
          variant="body"
          style={{
            fontSize: responsiveDesign.scaledFont(14),
            color: primary ? 'rgba(255, 255, 255, 0.8)' : '#8E8E93',
            textAlign: 'center',
          }}
        >
          {subtitle}
        </ResponsiveText>
      </EnhancedTouchable>
    </AdaptiveCard>
  ), [isLoading]);

  return (
    <OptimizedContainer>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <AdaptiveLayout>
          {({ isTablet, orientation }) => (
            <ScrollView
              contentContainerStyle={{
                flexGrow: 1,
                justifyContent: 'center',
                padding: responsiveDesign.getSpacing(24),
                paddingTop: responsiveDesign.getSafeAreaInsets().top + 40,
                paddingBottom: responsiveDesign.getSafeAreaInsets().bottom + 40,
              }}
              showsVerticalScrollIndicator={false}
            >
              {/* App Logo/Header */}
              <View style={{ alignItems: 'center', marginBottom: 48 }}>
                <View
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 20,
                    backgroundColor: '#007AFF',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: 24,
                  }}
                >
                  <Ionicons name="business" size={40} color="#FFFFFF" />
                </View>
                
                <ResponsiveText
                  variant="title"
                  style={{
                    fontSize: responsiveDesign.scaledFont(32),
                    fontWeight: '700',
                    marginBottom: 8,
                    textAlign: 'center',
                  }}
                  {...accessibilityService.createAccessibilityProps({
                    label: 'Digame app',
                    role: 'header',
                  })}
                >
                  Digame
                </ResponsiveText>
                
                <ResponsiveText
                  variant="body"
                  style={{
                    fontSize: responsiveDesign.scaledFont(16),
                    color: '#8E8E93',
                    textAlign: 'center',
                    maxWidth: 280,
                  }}
                >
                  Intelligent productivity platform with advanced mobile optimizations
                </ResponsiveText>
              </View>

              {/* Authentication Methods */}
              <View style={{ maxWidth: 400, alignSelf: 'center', width: '100%' }}>
                {/* Biometric Authentication */}
                {advancedMobileFeaturesService.isBiometricSupported() && (
                  <AuthMethodButton
                    icon="finger-print"
                    title="Biometric Login"
                    subtitle="Use fingerprint or face ID to sign in"
                    onPress={handleBiometricAuth}
                    primary={authMethod === 'biometric'}
                  />
                )}

                {/* Passcode Authentication */}
                <AuthMethodButton
                  icon="keypad"
                  title="Passcode Login"
                  subtitle="Enter your passcode to sign in"
                  onPress={handlePasscodeAuth}
                  primary={authMethod === 'passcode' && !advancedMobileFeaturesService.isBiometricSupported()}
                />

                {/* Demo Mode */}
                <AuthMethodButton
                  icon="play-circle"
                  title="Demo Mode"
                  subtitle="Explore the app with sample data"
                  onPress={handleDemoLogin}
                />

                {/* Alternative Options */}
                <View style={{ marginTop: 32, alignItems: 'center' }}>
                  <ResponsiveText
                    variant="caption"
                    style={{
                      fontSize: responsiveDesign.scaledFont(14),
                      color: '#8E8E93',
                      textAlign: 'center',
                      marginBottom: 16,
                    }}
                  >
                    Need help accessing your account?
                  </ResponsiveText>
                  
                  <EnhancedTouchable
                    onPress={() => Alert.alert('Support', 'Contact support options would be available here')}
                    hapticFeedback="light"
                    {...accessibilityService.createAccessibilityProps({
                      label: 'Contact support',
                      hint: 'Get help with account access',
                      role: 'button',
                    })}
                  >
                    <ResponsiveText
                      variant="body"
                      style={{
                        fontSize: responsiveDesign.scaledFont(16),
                        color: '#007AFF',
                        fontWeight: '500',
                      }}
                    >
                      Contact Support
                    </ResponsiveText>
                  </EnhancedTouchable>
                </View>
              </View>

              {/* Device Info (for debugging/demo) */}
              {__DEV__ && (
                <View style={{ marginTop: 40, padding: 16, backgroundColor: '#F2F2F7', borderRadius: 8 }}>
                  <ResponsiveText
                    variant="caption"
                    style={{
                      fontSize: responsiveDesign.scaledFont(12),
                      color: '#8E8E93',
                      textAlign: 'center',
                    }}
                  >
                    Debug Info: {responsiveDesign.getDeviceInfo().deviceType} | 
                    Biometric: {advancedMobileFeaturesService.isBiometricSupported() ? 'Yes' : 'No'} | 
                    Screen Reader: {accessibilityService.isScreenReaderEnabled() ? 'Yes' : 'No'}
                  </ResponsiveText>
                </View>
              )}
            </ScrollView>
          )}
        </AdaptiveLayout>
      </KeyboardAvoidingView>
    </OptimizedContainer>
  );
};

export default AuthScreen;