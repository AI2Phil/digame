import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  Alert,
  Share,
  Vibration,
  AppState
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Brightness from 'expo-brightness';
import * as ScreenOrientation from 'expo-screen-orientation';
import * as KeepAwake from 'expo-keep-awake';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  runOnJS
} from 'react-native-reanimated';

// Services
import enhancedOfflineService from '../services/enhancedOfflineService';
import MobileAIService from '../services/MobileAIService';
import MobileAnalyticsCacheManager from '../services/MobileAnalyticsCacheManager';
import biometricService from '../services/biometricService';
import voiceProcessingService from '../services/voiceProcessingService';
import gestureNavigationService from '../services/gestureNavigationService';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const EnhancedMobileFeatures = ({ navigation, user }) => {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);
  const [aiInsights, setAiInsights] = useState([]);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [performanceMetrics, setPerformanceMetrics] = useState({});

  // Animated values
  const fadeAnim = useSharedValue(0);
  const scaleAnim = useSharedValue(0.8);
  const slideAnim = useSharedValue(50);

  useEffect(() => {
    initializeEnhancedFeatures();
    setupAnimations();
    setupEventListeners();
  }, []);

  const initializeEnhancedFeatures = async () => {
    try {
      setLoading(true);

      // Initialize services
      await Promise.all([
        enhancedOfflineService.initialize(),
        MobileAIService.initialize(),
        MobileAnalyticsCacheManager.initialize(),
        voiceProcessingService.initialize(),
        gestureNavigationService.initialize()
      ]);

      // Load enhanced features
      const [
        featuresData,
        insights,
        metrics,
        offlineStatus,
        biometricStatus,
        voiceStatus
      ] = await Promise.all([
        loadEnhancedFeatures(),
        MobileAIService.getPersonalizedInsights(user?.id),
        MobileAnalyticsCacheManager.getPerformanceMetrics(),
        enhancedOfflineService.getOfflineStatus(),
        biometricService.isEnabled(),
        voiceProcessingService.isEnabled()
      ]);

      setFeatures(featuresData);
      setAiInsights(insights || []);
      setPerformanceMetrics(metrics || {});
      setOfflineMode(offlineStatus);
      setBiometricEnabled(biometricStatus);
      setVoiceEnabled(voiceStatus);

    } catch (error) {
      console.error('Failed to initialize enhanced features:', error);
      setFeatures(getMockFeatures());
      setAiInsights(getMockInsights());
    } finally {
      setLoading(false);
    }
  };

  const setupAnimations = () => {
    fadeAnim.value = withTiming(1, { duration: 800 });
    scaleAnim.value = withSpring(1, { damping: 15, stiffness: 150 });
    slideAnim.value = withTiming(0, { duration: 600 });
  };

  const setupEventListeners = () => {
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'active') {
        // Refresh data when app becomes active
        refreshEnhancedData();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  };

  const loadEnhancedFeatures = async () => {
    // Simulate loading enhanced features
    return [
      {
        id: 'ai_insights',
        title: 'AI Personal Insights',
        description: 'Personalized recommendations based on your usage patterns',
        icon: 'brain-outline',
        color: '#6366F1',
        enabled: true,
        premium: false
      },
      {
        id: 'offline_sync',
        title: 'Advanced Offline Sync',
        description: 'Seamless data synchronization when offline',
        icon: 'cloud-offline-outline',
        color: '#10B981',
        enabled: offlineMode,
        premium: false
      },
      {
        id: 'voice_commands',
        title: 'Voice Commands',
        description: 'Control the app with voice commands',
        icon: 'mic-outline',
        color: '#F59E0B',
        enabled: voiceEnabled,
        premium: true
      },
      {
        id: 'biometric_security',
        title: 'Biometric Security',
        description: 'Enhanced security with fingerprint/face recognition',
        icon: 'finger-print-outline',
        color: '#EF4444',
        enabled: biometricEnabled,
        premium: false
      },
      {
        id: 'smart_notifications',
        title: 'Smart Notifications',
        description: 'AI-powered intelligent notification management',
        icon: 'notifications-outline',
        color: '#8B5CF6',
        enabled: true,
        premium: true
      },
      {
        id: 'gesture_navigation',
        title: 'Gesture Navigation',
        description: 'Navigate with intuitive gestures',
        icon: 'hand-left-outline',
        color: '#06B6D4',
        enabled: true,
        premium: false
      },
      {
        id: 'performance_optimization',
        title: 'Performance Optimization',
        description: 'Real-time performance monitoring and optimization',
        icon: 'speedometer-outline',
        color: '#84CC16',
        enabled: true,
        premium: true
      },
      {
        id: 'dark_mode_plus',
        title: 'Dark Mode Plus',
        description: 'Advanced dark mode with customization options',
        icon: 'moon-outline',
        color: '#64748B',
        enabled: darkMode,
        premium: false
      }
    ];
  };

  const getMockFeatures = () => [
    {
      id: 'mock_feature',
      title: 'Enhanced Features',
      description: 'Advanced mobile capabilities',
      icon: 'star-outline',
      color: '#3B82F6',
      enabled: true,
      premium: false
    }
  ];

  const getMockInsights = () => [
    {
      id: 1,
      type: 'productivity',
      title: 'Peak Performance Time',
      description: 'You are most productive between 9-11 AM',
      confidence: 0.87,
      actionable: true
    },
    {
      id: 2,
      type: 'usage',
      title: 'Feature Discovery',
      description: 'Try the new voice commands feature to boost efficiency',
      confidence: 0.92,
      actionable: true
    }
  ];

  const handleFeatureToggle = useCallback(async (featureId) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      switch (featureId) {
        case 'voice_commands':
          const voiceResult = await voiceProcessingService.toggle();
          setVoiceEnabled(voiceResult.enabled);
          break;
          
        case 'biometric_security':
          const biometricResult = await biometricService.toggle();
          setBiometricEnabled(biometricResult.enabled);
          break;
          
        case 'offline_sync':
          const offlineResult = await enhancedOfflineService.toggle();
          setOfflineMode(offlineResult.enabled);
          break;
          
        case 'dark_mode_plus':
          setDarkMode(!darkMode);
          await toggleDarkMode();
          break;
          
        default:
          console.log(`Toggling feature: ${featureId}`);
      }
      
      // Update features list
      const updatedFeatures = await loadEnhancedFeatures();
      setFeatures(updatedFeatures);
      
    } catch (error) {
      console.error('Failed to toggle feature:', error);
      Alert.alert('Error', 'Failed to toggle feature. Please try again.');
    }
  }, [darkMode, offlineMode, voiceEnabled, biometricEnabled]);

  const toggleDarkMode = async () => {
    try {
      if (darkMode) {
        await Brightness.setBrightnessAsync(0.8);
      } else {
        await Brightness.setBrightnessAsync(0.3);
      }
    } catch (error) {
      console.error('Failed to adjust brightness:', error);
    }
  };

  const handleVoiceCommand = useCallback(async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      const result = await voiceProcessingService.startListening();
      
      if (result.success) {
        // Process voice command
        const command = result.transcript.toLowerCase();
        
        if (command.includes('dashboard')) {
          navigation.navigate('Dashboard');
        } else if (command.includes('analytics')) {
          navigation.navigate('Analytics');
        } else if (command.includes('profile')) {
          navigation.navigate('Profile');
        } else {
          Alert.alert('Voice Command', `Heard: "${result.transcript}"`);
        }
      }
    } catch (error) {
      console.error('Voice command failed:', error);
    }
  }, [navigation]);

  const handleShareInsight = useCallback(async (insight) => {
    try {
      await Share.share({
        message: `${insight.title}: ${insight.description}`,
        title: 'AI Insight from Digame'
      });
    } catch (error) {
      console.error('Failed to share insight:', error);
    }
  }, []);

  const refreshEnhancedData = useCallback(async () => {
    try {
      const [insights, metrics] = await Promise.all([
        MobileAIService.getPersonalizedInsights(user?.id),
        MobileAnalyticsCacheManager.getPerformanceMetrics()
      ]);
      
      setAiInsights(insights || getMockInsights());
      setPerformanceMetrics(metrics || {});
    } catch (error) {
      console.error('Failed to refresh enhanced data:', error);
    }
  }, [user?.id]);

  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      opacity: fadeAnim.value,
      transform: [
        { scale: scaleAnim.value },
        { translateY: slideAnim.value }
      ]
    };
  });

  const renderFeatureCard = useCallback((feature, index) => {
    const cardAnimatedStyle = useAnimatedStyle(() => {
      const delay = index * 100;
      return {
        opacity: withTiming(1, { duration: 500 }),
        transform: [
          {
            translateX: withTiming(0, { duration: 600 + delay })
          }
        ]
      };
    });

    return (
      <Animated.View key={feature.id} style={[styles.featureCard, cardAnimatedStyle]}>
        <TouchableOpacity
          style={[styles.featureContent, { borderLeftColor: feature.color }]}
          onPress={() => handleFeatureToggle(feature.id)}
          activeOpacity={0.7}
        >
          <View style={styles.featureHeader}>
            <View style={[styles.featureIcon, { backgroundColor: feature.color + '20' }]}>
              <Ionicons name={feature.icon} size={24} color={feature.color} />
            </View>
            <View style={styles.featureInfo}>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>{feature.description}</Text>
            </View>
            <View style={styles.featureToggle}>
              <View style={[
                styles.toggleSwitch,
                { backgroundColor: feature.enabled ? feature.color : '#E5E7EB' }
              ]}>
                <View style={[
                  styles.toggleThumb,
                  { transform: [{ translateX: feature.enabled ? 20 : 2 }] }
                ]} />
              </View>
              {feature.premium && (
                <View style={styles.premiumBadge}>
                  <Text style={styles.premiumText}>PRO</Text>
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }, [handleFeatureToggle]);

  const renderAIInsight = useCallback((insight, index) => {
    return (
      <View key={insight.id} style={styles.insightCard}>
        <LinearGradient
          colors={['#6366F1', '#8B5CF6']}
          style={styles.insightGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.insightHeader}>
            <Ionicons name="bulb-outline" size={20} color="#FFFFFF" />
            <Text style={styles.insightType}>{insight.type.toUpperCase()}</Text>
            <Text style={styles.insightConfidence}>
              {(insight.confidence * 100).toFixed(0)}%
            </Text>
          </View>
          <Text style={styles.insightTitle}>{insight.title}</Text>
          <Text style={styles.insightDescription}>{insight.description}</Text>
          
          {insight.actionable && (
            <View style={styles.insightActions}>
              <TouchableOpacity
                style={styles.insightAction}
                onPress={() => handleShareInsight(insight)}
              >
                <Ionicons name="share-outline" size={16} color="#FFFFFF" />
                <Text style={styles.insightActionText}>Share</Text>
              </TouchableOpacity>
            </View>
          )}
        </LinearGradient>
      </View>
    );
  }, [handleShareInsight]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="rocket-outline" size={48} color="#6366F1" />
        <Text style={styles.loadingText}>Loading Enhanced Features...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Animated.View style={[styles.content, animatedContainerStyle]}>
        {/* Header */}
        <View style={styles.header}>
          <LinearGradient
            colors={['#6366F1', '#8B5CF6']}
            style={styles.headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.headerTitle}>Enhanced Features</Text>
            <Text style={styles.headerSubtitle}>
              Advanced mobile capabilities for power users
            </Text>
            
            {voiceEnabled && (
              <TouchableOpacity
                style={styles.voiceButton}
                onPress={handleVoiceCommand}
              >
                <Ionicons name="mic" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </LinearGradient>
        </View>

        {/* Performance Metrics */}
        {Object.keys(performanceMetrics).length > 0 && (
          <View style={styles.metricsContainer}>
            <Text style={styles.sectionTitle}>Performance Metrics</Text>
            <View style={styles.metricsGrid}>
              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>
                  {performanceMetrics.responseTime || '245'}ms
                </Text>
                <Text style={styles.metricLabel}>Response Time</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>
                  {performanceMetrics.cacheHitRate || '87'}%
                </Text>
                <Text style={styles.metricLabel}>Cache Hit Rate</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>
                  {performanceMetrics.batteryOptimization || '92'}%
                </Text>
                <Text style={styles.metricLabel}>Battery Efficiency</Text>
              </View>
            </View>
          </View>
        )}

        {/* AI Insights */}
        {aiInsights.length > 0 && (
          <View style={styles.insightsContainer}>
            <Text style={styles.sectionTitle}>AI Personal Insights</Text>
            {aiInsights.map(renderAIInsight)}
          </View>
        )}

        {/* Enhanced Features */}
        <View style={styles.featuresContainer}>
          <Text style={styles.sectionTitle}>Enhanced Features</Text>
          {features.map(renderFeatureCard)}
        </View>

        {/* Offline Status */}
        {offlineMode && (
          <View style={styles.offlineStatus}>
            <Ionicons name="cloud-offline" size={20} color="#10B981" />
            <Text style={styles.offlineText}>
              Offline mode active - Data will sync when connected
            </Text>
          </View>
        )}
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  content: {
    padding: 16
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC'
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500'
  },
  header: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden'
  },
  headerGradient: {
    padding: 24,
    position: 'relative'
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#E0E7FF',
    opacity: 0.9
  },
  voiceButton: {
    position: 'absolute',
    top: 24,
    right: 24,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16
  },
  metricsContainer: {
    marginBottom: 24
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6366F1',
    marginBottom: 4
  },
  metricLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center'
  },
  insightsContainer: {
    marginBottom: 24
  },
  insightCard: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden'
  },
  insightGradient: {
    padding: 20
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  insightType: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#E0E7FF',
    marginLeft: 8,
    flex: 1
  },
  insightConfidence: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  insightTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8
  },
  insightDescription: {
    fontSize: 14,
    color: '#E0E7FF',
    lineHeight: 20,
    marginBottom: 16
  },
  insightActions: {
    flexDirection: 'row'
  },
  insightAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12
  },
  insightActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 4
  },
  featuresContainer: {
    marginBottom: 24
  },
  featureCard: {
    marginBottom: 12
  },
  featureContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16
  },
  featureInfo: {
    flex: 1
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4
  },
  featureDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20
  },
  featureToggle: {
    alignItems: 'center'
  },
  toggleSwitch: {
    width: 44,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    marginBottom: 4
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2
  },
  premiumBadge: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8
  },
  premiumText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF'
  },
  offlineStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    padding: 16,
    borderRadius: 12,
    marginTop: 16
  },
  offlineText: {
    fontSize: 14,
    color: '#065F46',
    marginLeft: 8,
    flex: 1
  }
});

export default EnhancedMobileFeatures;