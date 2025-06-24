import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  Alert,
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
import responsiveDesign from '../utils/responsiveDesign';

const ProfileScreen = ({ navigation }) => {
  usePerformanceMonitor('ProfileScreen');

  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Simulate loading user profile
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUserProfile({
        name: 'John Doe',
        email: 'john.doe@example.com',
        avatar: null,
        memberSince: '2023',
        preferences: {
          notifications: true,
          biometric: true,
          darkMode: false,
        },
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleBiometricToggle = useCallback(async () => {
    try {
      if (userProfile.preferences.biometric) {
        // Disable biometric
        setUserProfile(prev => ({
          ...prev,
          preferences: { ...prev.preferences, biometric: false }
        }));
        
        advancedMobileFeaturesService.updateSecuritySettings({
          biometricEnabled: false,
        });
      } else {
        // Enable biometric - require authentication first
        const authResult = await advancedMobileFeaturesService.authenticateWithBiometrics({
          promptMessage: 'Authenticate to enable biometric login',
        });
        
        if (authResult.success) {
          setUserProfile(prev => ({
            ...prev,
            preferences: { ...prev.preferences, biometric: true }
          }));
          
          advancedMobileFeaturesService.updateSecuritySettings({
            biometricEnabled: true,
          });
          
          Alert.alert('Success', 'Biometric authentication enabled');
        }
      }
    } catch (error) {
      console.error('Failed to toggle biometric:', error);
      Alert.alert('Error', 'Failed to update biometric settings');
    }
  }, [userProfile]);

  if (isLoading) {
    return (
      <OptimizedContainer>
        <ScrollView style={{ padding: responsiveDesign.getSpacing(16) }}>
          <AdaptiveCard style={{ marginBottom: 16, alignItems: 'center', padding: 24 }}>
            <LoadingSkeleton width={80} height={80} borderRadius={40} style={{ marginBottom: 16 }} />
            <LoadingSkeleton width="60%" height={20} style={{ marginBottom: 8 }} />
            <LoadingSkeleton width="40%" height={16} />
          </AdaptiveCard>
          
          {[1, 2, 3, 4].map(i => (
            <AdaptiveCard key={i} style={{ marginBottom: 12 }}>
              <View style={{ padding: 16, flexDirection: 'row', alignItems: 'center' }}>
                <LoadingSkeleton width={24} height={24} borderRadius={12} style={{ marginRight: 16 }} />
                <View style={{ flex: 1 }}>
                  <LoadingSkeleton width="70%" height={16} style={{ marginBottom: 4 }} />
                  <LoadingSkeleton width="50%" height={12} />
                </View>
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
            {/* Profile Header */}
            <AdaptiveCard style={{ marginBottom: 24, alignItems: 'center', padding: 24 }}>
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: '#007AFF',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 16,
                }}
              >
                <Ionicons name="person" size={40} color="#FFFFFF" />
              </View>
              
              <ResponsiveText
                variant="title"
                style={{
                  fontSize: responsiveDesign.scaledFont(24),
                  fontWeight: '700',
                  marginBottom: 4,
                }}
              >
                {userProfile.name}
              </ResponsiveText>
              
              <ResponsiveText
                variant="body"
                style={{
                  color: '#8E8E93',
                  fontSize: responsiveDesign.scaledFont(16),
                  marginBottom: 8,
                }}
              >
                {userProfile.email}
              </ResponsiveText>
              
              <ResponsiveText
                variant="caption"
                style={{
                  color: '#8E8E93',
                  fontSize: responsiveDesign.scaledFont(14),
                }}
              >
                Member since {userProfile.memberSince}
              </ResponsiveText>
            </AdaptiveCard>

            {/* Settings */}
            <ResponsiveText
              variant="headline"
              style={{
                fontSize: responsiveDesign.scaledFont(20),
                fontWeight: '600',
                marginBottom: 16,
              }}
            >
              Settings
            </ResponsiveText>

            {/* Biometric Setting */}
            <AdaptiveCard style={{ marginBottom: 12 }}>
              <EnhancedTouchable
                style={{
                  padding: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
                onPress={handleBiometricToggle}
                hapticFeedback="light"
                {...accessibilityService.createAccessibilityProps({
                  label: `Biometric authentication ${userProfile.preferences.biometric ? 'enabled' : 'disabled'}`,
                  hint: 'Tap to toggle biometric authentication',
                  role: 'switch',
                  state: { checked: userProfile.preferences.biometric },
                })}
              >
                <Ionicons
                  name="finger-print"
                  size={24}
                  color="#007AFF"
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
                    Biometric Authentication
                  </ResponsiveText>
                  <ResponsiveText
                    variant="caption"
                    style={{
                      color: '#8E8E93',
                      fontSize: responsiveDesign.scaledFont(14),
                    }}
                  >
                    Use fingerprint or face ID to unlock
                  </ResponsiveText>
                </View>
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: userProfile.preferences.biometric ? '#34C759' : '#E5E5EA',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  {userProfile.preferences.biometric && (
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  )}
                </View>
              </EnhancedTouchable>
            </AdaptiveCard>

            {/* Other Settings */}
            {[
              { icon: 'notifications', title: 'Notifications', subtitle: 'Manage your notifications' },
              { icon: 'shield-checkmark', title: 'Privacy', subtitle: 'Privacy and security settings' },
              { icon: 'help-circle', title: 'Help & Support', subtitle: 'Get help and contact support' },
              { icon: 'information-circle', title: 'About', subtitle: 'App version and information' },
            ].map((item, index) => (
              <AdaptiveCard key={index} style={{ marginBottom: 12 }}>
                <EnhancedTouchable
                  style={{
                    padding: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                  onPress={() => Alert.alert(item.title, `${item.title} settings would open here`)}
                  hapticFeedback="light"
                  {...accessibilityService.createAccessibilityProps({
                    label: item.title,
                    hint: item.subtitle,
                    role: 'button',
                  })}
                >
                  <Ionicons
                    name={item.icon}
                    size={24}
                    color="#007AFF"
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
                      {item.title}
                    </ResponsiveText>
                    <ResponsiveText
                      variant="caption"
                      style={{
                        color: '#8E8E93',
                        fontSize: responsiveDesign.scaledFont(14),
                      }}
                    >
                      {item.subtitle}
                    </ResponsiveText>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#C6C6C8" />
                </EnhancedTouchable>
              </AdaptiveCard>
            ))}
          </ScrollView>
        )}
      </AdaptiveLayout>
    </OptimizedContainer>
  );
};

export default ProfileScreen;