import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
  ActivityIndicator,
  Animated,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as BackgroundFetch from 'expo-background-fetch';
import * as Notifications from 'expo-notifications';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import advancedMobileService from '../services/advancedMobileService';

const { width } = Dimensions.get('window');

const AdvancedMobileFeatures = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [backgroundSyncEnabled, setBackgroundSyncEnabled] = useState(false);
  const [aiNotificationsEnabled, setAiNotificationsEnabled] = useState(false);
  const [voiceRecognitionActive, setVoiceRecognitionActive] = useState(false);
  const [mobileAnalytics, setMobileAnalytics] = useState({});
  const [fadeAnim] = useState(new Animated.Value(0));
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    initializeAdvancedFeatures();
    startAnimations();
  }, []);

  const startAnimations = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const initializeAdvancedFeatures = async () => {
    try {
      setLoading(true);

      // Initialize advanced mobile service
      await advancedMobileService.initialize();

      // Check current feature states
      const backgroundStatus = await BackgroundFetch.getStatusAsync();
      setBackgroundSyncEnabled(backgroundStatus === BackgroundFetch.BackgroundFetchStatus.Available);

      // Load notification settings
      const notificationSettings = await AsyncStorage.getItem('ai_notifications_enabled');
      setAiNotificationsEnabled(notificationSettings === 'true');

      // Load mobile analytics
      const analytics = await advancedMobileService.generateAdvancedAnalytics();
      setMobileAnalytics(analytics || {});

    } catch (error) {
      console.error('Failed to initialize advanced features:', error);
      Alert.alert('Error', 'Failed to initialize advanced mobile features');
    } finally {
      setLoading(false);
    }
  };

  const toggleBackgroundSync = async () => {
    try {
      if (backgroundSyncEnabled) {
        // Disable background sync
        await BackgroundFetch.unregisterTaskAsync('background-fetch-task');
        setBackgroundSyncEnabled(false);
        Alert.alert('Success', 'Background sync disabled');
      } else {
        // Enable background sync
        await advancedMobileService.setupBackgroundFetch();
        setBackgroundSyncEnabled(true);
        Alert.alert('Success', 'Background sync enabled');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to toggle background sync');
    }
  };

  const toggleAiNotifications = async () => {
    try {
      const newState = !aiNotificationsEnabled;
      
      if (newState) {
        // Enable AI notifications
        await advancedMobileService.setupAiNotifications();
        await AsyncStorage.setItem('ai_notifications_enabled', 'true');
        Alert.alert('Success', 'AI-powered notifications enabled');
      } else {
        // Disable AI notifications
        await AsyncStorage.setItem('ai_notifications_enabled', 'false');
        Alert.alert('Success', 'AI-powered notifications disabled');
      }
      
      setAiNotificationsEnabled(newState);
    } catch (error) {
      Alert.alert('Error', 'Failed to toggle AI notifications');
    }
  };

  const startVoiceRecognition = async () => {
    try {
      setVoiceRecognitionActive(true);
      const result = await advancedMobileService.startVoiceRecognition();
      if (result.status === 'recording_started') {
        Speech.speak("Voice recognition started. Please state your command.");
      }
      // No more auto-stop
    } catch (error) {
      setVoiceRecognitionActive(false);
      console.error('Failed to start voice recognition:', error);
      if (error.error === 'permission_denied') {
        Alert.alert('Error', 'Audio recording permission was denied. Please enable it in settings.');
      } else {
        Alert.alert('Error', 'Failed to start voice recognition. Please try again.');
      }
    }
  };

  const stopVoiceRecognition = async () => {
    let stopResult;
    try {
      stopResult = await advancedMobileService.stopVoiceRecognition();
      setVoiceRecognitionActive(false);

      if (stopResult.status === 'recording_stopped' && stopResult.uri) {
        Speech.speak("Processing your command with backend.");
        try {
          const backendTranscriptionResponse = await advancedMobileService.transcribeAudio(stopResult.uri);
          if (backendTranscriptionResponse && backendTranscriptionResponse.transcription) {
            Speech.speak(`Heard from backend: ${backendTranscriptionResponse.transcription}.`);

            try {
              const backendIntentResponse = await advancedMobileService.handleIntent(backendTranscriptionResponse.transcription);
              if (backendIntentResponse && backendIntentResponse.intent) {
                Speech.speak(`Backend intent: ${backendIntentResponse.intent}. Message: ${backendIntentResponse.message}`);
                // Example: if (backendIntentResponse.intent === 'VIEW_ANALYTICS') navigation.navigate('Analytics');
              } else {
                Speech.speak("Could not determine intent from backend.");
                Alert.alert("Error", "Could not determine intent from the backend.");
              }
            } catch (intentError) {
              console.error('Error handling intent with backend:', intentError);
              Speech.speak("Error recognizing intent with backend.");
              Alert.alert('Error', 'Error recognizing intent. Please try again.');
            }
          } else {
            Speech.speak("Could not get transcription from backend.");
            Alert.alert("Error", "Could not get transcription from the backend.");
          }
        } catch (transcriptionError) {
          console.error('Error transcribing audio with backend:', transcriptionError);
          Speech.speak("Error transcribing audio with backend.");
          Alert.alert('Error', 'Error transcribing audio. Please try again.');
        }
      } else if (stopResult.status === 'not_recording') {
        Speech.speak("Voice recognition stopped. No command recorded.");
      } else {
        // This case might include errors like 'uri_null_after_stopping'
        Speech.speak("Voice recognition stopped. Could not process audio.");
         if (stopResult.error) {
            Alert.alert('Error', `Problem stopping recording: ${stopResult.error}`);
        }
      }
    } catch (error) {
      setVoiceRecognitionActive(false);
      console.error('Failed to stop voice recognition or process command:', error);
      Speech.speak("Error stopping voice recognition.");
      Alert.alert('Error', `Failed to stop voice recognition: ${error.message || 'Please try again.'}`);
    }
  };

  const testVoiceCommand = async (command) => {
    try {
      Speech.speak(`Testing voice command: ${command}`);
      
      // Simulate voice command processing
      switch (command) {
        case 'show analytics':
          navigation.navigate('Analytics');
          break;
        case 'add goal':
          navigation.navigate('Goals');
          break;
        case 'update progress':
          navigation.navigate('Progress');
          break;
        default:
          Speech.speak("Command not recognized");
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to process voice command');
    }
  };

  const optimizeNotifications = async () => {
    try {
      const backendResponse = await advancedMobileService.processAiNotifications();
      Alert.alert('Success', backendResponse.message || 'Notifications optimized based on your behavior patterns (via backend).');
    } catch (error) {
      console.error('Failed to optimize notifications via backend:', error);
      Alert.alert('Error', error.message || 'Failed to optimize notifications via backend.');
    }
  };

  const viewPerformanceMetrics = () => {
    navigation.navigate('MobileAnalytics');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Initializing Advanced Features...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Header */}
        <LinearGradient
          colors={['#6366f1', '#8b5cf6']}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Advanced Mobile Features</Text>
          <Text style={styles.headerSubtitle}>
            Enhanced productivity with AI-powered mobile capabilities
          </Text>
        </LinearGradient>

        {/* Feature Cards */}
        <View style={styles.featuresContainer}>
          
          {/* Background App Refresh */}
          <FeatureCard
            title="Background App Refresh"
            subtitle="iOS automatic data synchronization"
            icon="sync"
            enabled={backgroundSyncEnabled}
            onToggle={toggleBackgroundSync}
            description="Keeps your data up-to-date even when the app is closed"
            stats={[
              { label: 'Last Sync', value: '2 min ago' },
              { label: 'Success Rate', value: '98%' },
              { label: 'Data Synced', value: '2.3 MB' }
            ]}
          />

          {/* AI-Powered Notifications */}
          <FeatureCard
            title="AI-Powered Notifications"
            subtitle="Smart timing based on behavior"
            icon="psychology"
            enabled={aiNotificationsEnabled}
            onToggle={toggleAiNotifications}
            description="Delivers notifications at optimal times for maximum engagement"
            stats={[
              { label: 'Engagement Rate', value: '87%' },
              { label: 'Optimal Times', value: '3 found' },
              { label: 'Today', value: '12 sent' }
            ]}
            actionButton={{
              title: 'Optimize Now',
              onPress: optimizeNotifications
            }}
          />

          {/* Voice Recognition */}
          <VoiceRecognitionCard
            active={voiceRecognitionActive}
            onStart={startVoiceRecognition}
            onStop={stopVoiceRecognition}
            onTestCommand={testVoiceCommand}
            pulseAnim={pulseAnim}
          />

          {/* Advanced Analytics */}
          <AnalyticsCard
            analytics={mobileAnalytics}
            onViewDetails={viewPerformanceMetrics}
          />

        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <QuickActionButton
              icon="mic"
              title="Voice Command"
              subtitle="Try voice control"
              onPress={startVoiceRecognition}
              color="#8b5cf6"
            />
            <QuickActionButton
              icon="notifications"
              title="Optimize Alerts"
              subtitle="AI timing"
              onPress={optimizeNotifications}
              color="#06b6d4"
            />
            <QuickActionButton
              icon="analytics"
              title="Performance"
              subtitle="View metrics"
              onPress={viewPerformanceMetrics}
              color="#10b981"
            />
            <QuickActionButton
              icon="settings"
              title="Settings"
              subtitle="Configure"
              onPress={() => navigation.navigate('Settings')}
              color="#f59e0b"
            />
          </View>
        </View>

      </Animated.View>
    </ScrollView>
  );
};

// Feature Card Component
const FeatureCard = ({ 
  title, 
  subtitle, 
  icon, 
  enabled, 
  onToggle, 
  description, 
  stats, 
  actionButton 
}) => (
  <View style={styles.featureCard}>
    <View style={styles.featureHeader}>
      <View style={styles.featureIconContainer}>
        <Icon name={icon} size={24} color="#6366f1" />
      </View>
      <View style={styles.featureInfo}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureSubtitle}>{subtitle}</Text>
      </View>
      <Switch
        value={enabled}
        onValueChange={onToggle}
        trackColor={{ false: '#e5e7eb', true: '#6366f1' }}
        thumbColor={enabled ? '#ffffff' : '#f3f4f6'}
      />
    </View>
    
    <Text style={styles.featureDescription}>{description}</Text>
    
    {stats && (
      <View style={styles.statsContainer}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.statItem}>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>
    )}
    
    {actionButton && (
      <TouchableOpacity style={styles.actionButton} onPress={actionButton.onPress}>
        <Text style={styles.actionButtonText}>{actionButton.title}</Text>
      </TouchableOpacity>
    )}
  </View>
);

// Voice Recognition Card Component
const VoiceRecognitionCard = ({ active, onStart, onStop, onTestCommand, pulseAnim }) => (
  <View style={styles.featureCard}>
    <View style={styles.featureHeader}>
      <View style={styles.featureIconContainer}>
        <Icon name="mic" size={24} color="#8b5cf6" />
      </View>
      <View style={styles.featureInfo}>
        <Text style={styles.featureTitle}>Voice Recognition</Text>
        <Text style={styles.featureSubtitle}>Natural language commands</Text>
      </View>
      <View style={[styles.statusIndicator, { backgroundColor: active ? '#10b981' : '#6b7280' }]} />
    </View>
    
    <Text style={styles.featureDescription}>
      Control the app with voice commands like "Show analytics" or "Add goal"
    </Text>
    
    <View style={styles.voiceControlContainer}>
      <Animated.View style={[styles.voiceButton, { transform: [{ scale: active ? pulseAnim : 1 }] }]}>
        <TouchableOpacity
          style={[styles.voiceButtonInner, { backgroundColor: active ? '#ef4444' : '#8b5cf6' }]}
          onPress={active ? onStop : onStart}
        >
          <Icon name={active ? "stop" : "mic"} size={32} color="#ffffff" />
        </TouchableOpacity>
      </Animated.View>
      <Text style={styles.voiceButtonText}>
        {active ? 'Listening... Tap to stop' : 'Tap to start voice recognition'}
      </Text>
    </View>
    
    <View style={styles.voiceCommandsContainer}>
      <Text style={styles.voiceCommandsTitle}>Try these commands:</Text>
      <View style={styles.voiceCommandsGrid}>
        {['show analytics', 'add goal', 'update progress'].map((command, index) => (
          <TouchableOpacity
            key={index}
            style={styles.voiceCommandChip}
            onPress={() => onTestCommand(command)}
          >
            <Text style={styles.voiceCommandText}>"{command}"</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  </View>
);

// Analytics Card Component
const AnalyticsCard = ({ analytics, onViewDetails }) => (
  <View style={styles.featureCard}>
    <View style={styles.featureHeader}>
      <View style={styles.featureIconContainer}>
        <Icon name="analytics" size={24} color="#10b981" />
      </View>
      <View style={styles.featureInfo}>
        <Text style={styles.featureTitle}>Advanced Analytics</Text>
        <Text style={styles.featureSubtitle}>Mobile performance insights</Text>
      </View>
    </View>
    
    <Text style={styles.featureDescription}>
      Comprehensive mobile usage analytics and performance optimization
    </Text>
    
    <View style={styles.analyticsGrid}>
      <View style={styles.analyticsItem}>
        <Text style={styles.analyticsValue}>
          {analytics.insights?.productivityScore || 85}%
        </Text>
        <Text style={styles.analyticsLabel}>Productivity Score</Text>
      </View>
      <View style={styles.analyticsItem}>
        <Text style={styles.analyticsValue}>
          {analytics.insights?.engagementLevel || 92}%
        </Text>
        <Text style={styles.analyticsLabel}>Engagement Level</Text>
      </View>
      <View style={styles.analyticsItem}>
        <Text style={styles.analyticsValue}>
          {Math.round((analytics.sessionData?.duration || 900000) / 60000)}m
        </Text>
        <Text style={styles.analyticsLabel}>Session Time</Text>
      </View>
      <View style={styles.analyticsItem}>
        <Text style={styles.analyticsValue}>
          {Object.keys(analytics.sessionData?.screenViews || {}).length}
        </Text>
        <Text style={styles.analyticsLabel}>Screens Visited</Text>
      </View>
    </View>
    
    <TouchableOpacity style={styles.actionButton} onPress={onViewDetails}>
      <Text style={styles.actionButtonText}>View Detailed Analytics</Text>
    </TouchableOpacity>
  </View>
);

// Quick Action Button Component
const QuickActionButton = ({ icon, title, subtitle, onPress, color }) => (
  <TouchableOpacity style={styles.quickActionButton} onPress={onPress}>
    <View style={[styles.quickActionIcon, { backgroundColor: color }]}>
      <Icon name={icon} size={20} color="#ffffff" />
    </View>
    <Text style={styles.quickActionTitle}>{title}</Text>
    <Text style={styles.quickActionSubtitle}>{subtitle}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  content: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingTop: 60,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#e0e7ff',
  },
  featuresContainer: {
    padding: 16,
    gap: 16,
  },
  featureCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f0f9ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureInfo: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  featureSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  featureDescription: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  actionButton: {
    backgroundColor: '#6366f1',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  voiceControlContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  voiceButton: {
    marginBottom: 12,
  },
  voiceButtonInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceButtonText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  voiceCommandsContainer: {
    marginTop: 16,
  },
  voiceCommandsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  voiceCommandsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  voiceCommandChip: {
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  voiceCommandText: {
    fontSize: 12,
    color: '#6b7280',
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  analyticsItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 12,
  },
  analyticsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10b981',
  },
  analyticsLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  quickActionsContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
});

export default AdvancedMobileFeatures;