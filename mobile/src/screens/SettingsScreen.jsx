import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import {
  OptimizedContainer,
  AdaptiveLayout,
  EnhancedTouchable,
  ResponsiveText,
  AdaptiveCard,
  LoadingSkeleton,
  usePerformanceMonitor,
} from '../components/MobileOptimizedUI';

import accessibilityService from '../services/accessibilityService';
import advancedMobileFeaturesService from '../services/advancedMobileFeatures';
import gestureNavigationService from '../services/gestureNavigationService';
import responsiveDesign from '../utils/responsiveDesign';

const SettingsScreen = ({ navigation }) => {
  usePerformanceMonitor('SettingsScreen');

  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState({
    notifications: true,
    biometric: false,
    hapticFeedback: true,
    voiceControl: false,
    darkMode: false,
    highContrast: false,
    reducedMotion: false,
    largeText: false,
    autoSync: true,
    offlineMode: false,
  });
  const [accessibilityState, setAccessibilityState] = useState({});

  useEffect(() => {
    loadSettings();
    loadAccessibilityState();
  }, []);

  const loadSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Load settings from various services
      const securitySettings = advancedMobileFeaturesService.getSecuritySettings();
      const deviceInfo = advancedMobileFeaturesService.getDeviceInfo();
      
      setSettings(prev => ({
        ...prev,
        biometric: securitySettings.biometricEnabled,
        hapticFeedback: gestureNavigationService.hapticEnabled,
        voiceControl: accessibilityService.isVoiceControlEnabled(),
      }));
      
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadAccessibilityState = useCallback(() => {
    const state = accessibilityService.getAccessibilityState();
    setAccessibilityState(state);
    
    setSettings(prev => ({
      ...prev,
      highContrast: state.highContrastEnabled,
      reducedMotion: state.reducedMotionEnabled,
      largeText: state.largeTextEnabled,
    }));
  }, []);

  const handleSettingToggle = useCallback(async (settingKey, value) => {
    try {
      setSettings(prev => ({ ...prev, [settingKey]: value }));
      
      switch (settingKey) {
        case 'biometric':
          if (value) {
            const authResult = await advancedMobileFeaturesService.authenticateWithBiometrics({
              promptMessage: 'Authenticate to enable biometric login',
            });
            
            if (authResult.success) {
              advancedMobileFeaturesService.updateSecuritySettings({
                biometricEnabled: true,
              });
              Alert.alert('Success', 'Biometric authentication enabled');
            } else {
              setSettings(prev => ({ ...prev, [settingKey]: false }));
            }
          } else {
            advancedMobileFeaturesService.updateSecuritySettings({
              biometricEnabled: false,
            });
          }
          break;
          
        case 'hapticFeedback':
          gestureNavigationService.setHapticEnabled(value);
          if (value) {
            await gestureNavigationService.triggerHaptic('light');
          }
          break;
          
        case 'voiceControl':
          // Voice control would be enabled/disabled here
          Alert.alert('Voice Control', `Voice control ${value ? 'enabled' : 'disabled'}`);
          break;
          
        case 'notifications':
          // Handle notification settings
          Alert.alert('Notifications', `Notifications ${value ? 'enabled' : 'disabled'}`);
          break;
          
        case 'darkMode':
          // Handle dark mode toggle
          Alert.alert('Dark Mode', `Dark mode ${value ? 'enabled' : 'disabled'}`);
          break;
          
        case 'autoSync':
          // Handle auto sync settings
          Alert.alert('Auto Sync', `Auto sync ${value ? 'enabled' : 'disabled'}`);
          break;
          
        case 'offlineMode':
          // Handle offline mode
          Alert.alert('Offline Mode', `Offline mode ${value ? 'enabled' : 'disabled'}`);
          break;
          
        default:
          console.log(`Setting ${settingKey} changed to:`, value);
      }
      
      // Provide haptic feedback for setting changes
      if (gestureNavigationService.hapticEnabled) {
        await gestureNavigationService.triggerHaptic('light');
      }
      
    } catch (error) {
      console.error(`Failed to toggle ${settingKey}:`, error);
      // Revert the setting
      setSettings(prev => ({ ...prev, [settingKey]: !value }));
      Alert.alert('Error', `Failed to update ${settingKey} setting`);
    }
  }, []);

  const SettingItem = useCallback(({ 
    icon, 
    title, 
    subtitle, 
    value, 
    onToggle, 
    disabled = false,
    type = 'switch' // 'switch' or 'button'
  }) => (
    <AdaptiveCard style={{ marginBottom: 12 }}>
      <View
        style={{
          padding: 16,
          flexDirection: 'row',
          alignItems: 'center',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <Ionicons
          name={icon}
          size={24}
          color={disabled ? '#C6C6C8' : '#007AFF'}
          style={{ marginRight: 16 }}
        />
        <View style={{ flex: 1 }}>
          <ResponsiveText
            variant="body"
            style={{
              fontSize: responsiveDesign.scaledFont(16),
              fontWeight: '500',
              marginBottom: 2,
            }}
          >
            {title}
          </ResponsiveText>
          <ResponsiveText
            variant="caption"
            style={{
              color: '#8E8E93',
              fontSize: responsiveDesign.scaledFont(14),
            }}
          >
            {subtitle}
          </ResponsiveText>
        </View>
        
        {type === 'switch' ? (
          <Switch
            value={value}
            onValueChange={onToggle}
            disabled={disabled}
            trackColor={{ false: '#E5E5EA', true: '#34C759' }}
            thumbColor="#FFFFFF"
            {...accessibilityService.createAccessibilityProps({
              label: `${title} ${value ? 'enabled' : 'disabled'}`,
              hint: `Tap to ${value ? 'disable' : 'enable'} ${title.toLowerCase()}`,
              role: 'switch',
              state: { checked: value },
            })}
          />
        ) : (
          <EnhancedTouchable
            onPress={onToggle}
            disabled={disabled}
            hapticFeedback="light"
            {...accessibilityService.createAccessibilityProps({
              label: title,
              hint: subtitle,
              role: 'button',
            })}
          >
            <Ionicons name="chevron-forward" size={20} color="#C6C6C8" />
          </EnhancedTouchable>
        )}
      </View>
    </AdaptiveCard>
  ), []);

  if (isLoading) {
    return (
      <OptimizedContainer>
        <ScrollView style={{ padding: responsiveDesign.getSpacing(16) }}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <AdaptiveCard key={i} style={{ marginBottom: 12 }}>
              <View style={{ padding: 16, flexDirection: 'row', alignItems: 'center' }}>
                <LoadingSkeleton width={24} height={24} borderRadius={12} style={{ marginRight: 16 }} />
                <View style={{ flex: 1 }}>
                  <LoadingSkeleton width="70%" height={16} style={{ marginBottom: 4 }} />
                  <LoadingSkeleton width="50%" height={12} />
                </View>
                <LoadingSkeleton width={40} height={20} borderRadius={10} />
              </View>
            </AdaptiveCard>
          ))}
        </ScrollView>
      </OptimizedContainer>
    );
  }

  return (
    <OptimizedContainer>
      <AdaptiveLayout>
        {({ isTablet }) => (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              padding: responsiveDesign.getSpacing(16),
              paddingTop: responsiveDesign.getSafeAreaInsets().top + 16,
              paddingBottom: responsiveDesign.getSafeAreaInsets().bottom + 20,
            }}
          >
            {/* Header */}
            <ResponsiveText
              variant="title"
              style={{
                fontSize: responsiveDesign.scaledFont(28),
                fontWeight: '700',
                marginBottom: 24,
              }}
              {...accessibilityService.createAccessibilityProps({
                label: 'Settings screen',
                role: 'header',
              })}
            >
              Settings
            </ResponsiveText>

            {/* Security Section */}
            <ResponsiveText
              variant="headline"
              style={{
                fontSize: responsiveDesign.scaledFont(20),
                fontWeight: '600',
                marginBottom: 16,
              }}
            >
              Security
            </ResponsiveText>

            <SettingItem
              icon="finger-print"
              title="Biometric Authentication"
              subtitle="Use fingerprint or face ID to unlock"
              value={settings.biometric}
              onToggle={(value) => handleSettingToggle('biometric', value)}
              disabled={!advancedMobileFeaturesService.isBiometricSupported()}
            />

            {/* Accessibility Section */}
            <ResponsiveText
              variant="headline"
              style={{
                fontSize: responsiveDesign.scaledFont(20),
                fontWeight: '600',
                marginTop: 24,
                marginBottom: 16,
              }}
            >
              Accessibility
            </ResponsiveText>

            <SettingItem
              icon="hand-left"
              title="Haptic Feedback"
              subtitle="Feel vibrations for interactions"
              value={settings.hapticFeedback}
              onToggle={(value) => handleSettingToggle('hapticFeedback', value)}
            />

            <SettingItem
              icon="mic"
              title="Voice Control"
              subtitle="Control app with voice commands"
              value={settings.voiceControl}
              onToggle={(value) => handleSettingToggle('voiceControl', value)}
            />

            <SettingItem
              icon="contrast"
              title="High Contrast"
              subtitle="Increase contrast for better visibility"
              value={settings.highContrast}
              onToggle={(value) => handleSettingToggle('highContrast', value)}
              disabled={true} // System controlled
            />

            <SettingItem
              icon="text"
              title="Large Text"
              subtitle="Use larger text sizes"
              value={settings.largeText}
              onToggle={(value) => handleSettingToggle('largeText', value)}
              disabled={true} // System controlled
            />

            {/* Appearance Section */}
            <ResponsiveText
              variant="headline"
              style={{
                fontSize: responsiveDesign.scaledFont(20),
                fontWeight: '600',
                marginTop: 24,
                marginBottom: 16,
              }}
            >
              Appearance
            </ResponsiveText>

            <SettingItem
              icon="moon"
              title="Dark Mode"
              subtitle="Use dark theme throughout the app"
              value={settings.darkMode}
              onToggle={(value) => handleSettingToggle('darkMode', value)}
            />

            {/* Data & Sync Section */}
            <ResponsiveText
              variant="headline"
              style={{
                fontSize: responsiveDesign.scaledFont(20),
                fontWeight: '600',
                marginTop: 24,
                marginBottom: 16,
              }}
            >
              Data & Sync
            </ResponsiveText>

            <SettingItem
              icon="notifications"
              title="Notifications"
              subtitle="Receive push notifications"
              value={settings.notifications}
              onToggle={(value) => handleSettingToggle('notifications', value)}
            />

            <SettingItem
              icon="sync"
              title="Auto Sync"
              subtitle="Automatically sync data when online"
              value={settings.autoSync}
              onToggle={(value) => handleSettingToggle('autoSync', value)}
            />

            <SettingItem
              icon="cloud-offline"
              title="Offline Mode"
              subtitle="Enable enhanced offline capabilities"
              value={settings.offlineMode}
              onToggle={(value) => handleSettingToggle('offlineMode', value)}
            />

            {/* About Section */}
            <ResponsiveText
              variant="headline"
              style={{
                fontSize: responsiveDesign.scaledFont(20),
                fontWeight: '600',
                marginTop: 24,
                marginBottom: 16,
              }}
            >
              About
            </ResponsiveText>

            <SettingItem
              icon="information-circle"
              title="App Version"
              subtitle="1.0.0 (Build 1)"
              type="button"
              onToggle={() => Alert.alert('Version Info', 'Digame Mobile v1.0.0\nBuild 1\n\nAdvanced mobile optimizations enabled')}
            />

            <SettingItem
              icon="help-circle"
              title="Help & Support"
              subtitle="Get help and contact support"
              type="button"
              onToggle={() => Alert.alert('Help & Support', 'Help and support options would be available here')}
            />

            <SettingItem
              icon="document-text"
              title="Privacy Policy"
              subtitle="Read our privacy policy"
              type="button"
              onToggle={() => Alert.alert('Privacy Policy', 'Privacy policy would be displayed here')}
            />
          </ScrollView>
        )}
      </AdaptiveLayout>
    </OptimizedContainer>
  );
};

export default SettingsScreen;