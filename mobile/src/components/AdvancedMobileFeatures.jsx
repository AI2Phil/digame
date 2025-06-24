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
  const [nluInteractionDetails, setNluInteractionDetails] = useState(null);
  const [nluDisplayTimeoutId, setNluDisplayTimeoutId] = useState(null);
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
      // Ensure service is initialized even if other parts fail, or handle error appropriately
      // For now, we assume initialize itself doesn't throw often or is critical to proceed
      // await advancedMobileService.initialize(); // This was already called above
      Alert.alert('Error', 'Failed to initialize advanced mobile features');
    } finally {
      setLoading(false);
    }
  };

  const toggleBackgroundSync = async () => {
    try {
      if (backgroundSyncEnabled) {
        // Disable background sync
        // Assuming this part remains platform-specific and not part of advancedMobileService
        await BackgroundFetch.unregisterTaskAsync('background-fetch-task');
        setBackgroundSyncEnabled(false);
        Alert.alert('Success', 'Background sync disabled');
      } else {
        // Enable background sync
        await advancedMobileService.setupBackgroundFetch(); // Service call
        // Potentially, platform-specific registration might still be needed here
        // For now, we assume the service handles it or it's a separate concern
        setBackgroundSyncEnabled(true);
        Alert.alert('Success', 'Background sync enabled');
      }
    } catch (error) {
      console.error('Failed to toggle background sync:', error);
      Alert.alert('Error', 'Failed to toggle background sync');
    }
  };

  const toggleAiNotifications = async () => {
    try {
      const newState = !aiNotificationsEnabled;
      
      if (newState) {
        // Enable AI notifications
        await advancedMobileService.setupAiNotifications(); // Service call
        await AsyncStorage.setItem('ai_notifications_enabled', 'true');
        Alert.alert('Success', 'AI-powered notifications enabled');
      } else {
        // Disable AI notifications
        // Assuming disabling doesn't need a service call, or it's handled by platform/AsyncStorage
        await AsyncStorage.setItem('ai_notifications_enabled', 'false');
        Alert.alert('Success', 'AI-powered notifications disabled');
      }
      
      setAiNotificationsEnabled(newState);
    } catch (error) {
      console.error('Failed to toggle AI notifications:', error);
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
                handleVoiceIntent(backendIntentResponse);
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

  const handleVoiceIntent = (nluResponse) => {
    // Log the full NLU response for debugging
    console.log("Handling Rich NLU Response:", JSON.stringify(nluResponse, null, 2));

    if (!nluResponse || !nluResponse.intent) {
      Speech.speak("Sorry, I had trouble understanding that. Please try again.");
      Alert.alert("NLU Error", "Response structure missing intent.");
      return;
    }

    const intent = nluResponse.intent;
    const entities = nluResponse.entities || {}; // Ensure entities is an object

    // Log extracted intent and entities for structured data handling
    console.log(`Intent: ${intent}`);
    console.log("Entities:", JSON.stringify(entities, null, 2));

    // Example of preparing structured data for potential UI update
    // This data could be passed to a state variable or a dedicated UI component later
    const structuredUIData = {
      intent: intent,
      entities: entities,
      originalQuery: nluResponse.originalText || "",
      // Potentially add confidence scores if provided by OpenAI
      confidence: nluResponse.confidence || null,
    };
    console.log("Prepared structured UI data:", JSON.stringify(structuredUIData, null, 2));

    // Clear previous timeout if any
    if (nluDisplayTimeoutId) {
      clearTimeout(nluDisplayTimeoutId);
    }

    setNluInteractionDetails(structuredUIData);

    // Set a timeout to clear the NLU details display
    const timeoutId = setTimeout(() => {
      setNluInteractionDetails(null);
    }, 15000); // Display for 15 seconds
    setNluDisplayTimeoutId(timeoutId);

    switch (intent) {
      case 'show_analytics':
      case 'VIEW_ANALYTICS':
        Speech.speak("Showing analytics.");
        navigation.navigate('Analytics');
        // Future UI update: Could display "Showing analytics" with a confidence score
        break;
      case 'add_goal':
      case 'ADD_GOAL':
        Speech.speak("Opening goals to add a new one.");
        navigation.navigate('Goals');
        // Future UI update: Could display "Navigating to Goals" and list any relevant entities found
        break;
      case 'update_progress':
      case 'UPDATE_PROGRESS':
        Speech.speak("Opening progress to update.");
        navigation.navigate('Progress');
        break;
      case 'NAVIGATE_TO_SCREEN':
        const screenName = entities?.screen_name; // Assuming screen_name is a top-level entity
        // If screen_name could be nested, e.g., entities.navigation_details.screen_name, adjust access accordingly
        if (screenName && typeof screenName === 'string' && screenName.trim() !== '') {
          Speech.speak(`Navigating to ${screenName}.`);
          const validScreens = ['Analytics', 'Goals', 'Progress', 'Settings', 'Home', 'Profile'];
          if (validScreens.includes(screenName)) {
             navigation.navigate(screenName);
          } else {
             Speech.speak(`Sorry, I can't navigate to a screen called ${screenName}.`);
             console.warn(`Attempted to navigate to an invalid screen by voice: ${screenName}`);
             Alert.alert("Navigation Error", `Screen "${screenName}" not found.`);
          }
        } else {
          Speech.speak("Sorry, I understood you want to navigate, but not to which screen.");
          console.warn(`Invalid or missing screen_name entity for NAVIGATE_TO_SCREEN. Received: ${screenName}`);
          Alert.alert("Navigation Error", "Screen name not specified or invalid.");
        }
        break;
      // Example of handling a more complex intent with multiple entities
      case 'CREATE_REMINDER':
        const reminderText = entities?.reminder_text || "your reminder";
        const reminderTime = entities?.time_detail?.iso || "an unspecified time"; // Example of nested entity
        Speech.speak(`Okay, creating a reminder: "${reminderText}" for ${reminderTime}.`);
        // TODO: Implement actual reminder creation logic
        // Future UI update: Display "Reminder: [text]" and "Time: [time]"
        console.log(`Reminder to create: Text - ${reminderText}, Time - ${reminderTime}`);
        Alert.alert("Reminder Intent", `Reminder: ${reminderText}\nTime: ${reminderTime}`);
        break;
      case 'unknown_command':
      default:
        const message = nluResponse.message || nluResponse.originalText || "Sorry, I couldn't understand that command.";
        Speech.speak(message.startsWith("Command not recognized:") ? message : `I heard "${nluResponse.originalText || 'that'}", but I'm not sure what to do.`);
        Alert.alert("Unknown Command", `Heard: "${nluResponse.originalText || 'N/A'}" - Intent not recognized.`);
        break;
    }
  };

  const testVoiceCommand = async (command) => {
    try {
      setVoiceRecognitionActive(true);
      // Use the legacy processVoiceCommand method for testing
      if (advancedMobileService.processVoiceCommand) {
        const intentObject = await advancedMobileService.processVoiceCommand(command);
        handleVoiceIntent(intentObject);
      } else {
        // Fallback to direct intent handling
        const intentResponse = await advancedMobileService.handleIntent(command);
        handleVoiceIntent(intentResponse);
      }
    } catch (error) {
      console.error('Failed to process voice command:', error);
      Alert.alert('Error', 'Failed to process voice command');
    } finally {
      setVoiceRecognitionActive(false);
    }
  };

  const optimizeNotifications = async () => {
    try {
      const backendResponse = await advancedMobileService.processAiNotifications();
      if (backendResponse && backendResponse.status) {
        Alert.alert('Success', backendResponse.message || 'Notifications optimized based on your behavior patterns.');
      } else {
        Alert.alert('Info', backendResponse.message || 'Notifications optimization process completed.');
      }
    } catch (error) {
      console.error('Failed to optimize notifications:', error);
      Alert.alert('Error', error.message || 'Failed to optimize notifications.');
    }
  };

  const viewPerformanceMetrics = () => {
    navigation.navigate('MobileAnalytics'); // This is the old navigation
  };

  const viewInsightsDashboard = () => {
    navigation.navigate('InsightsDashboardScreen'); // New navigation target
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
            description="Delivers notifications at optimal times for maximum engagement. Timings automatically adapt to your usage patterns."
            stats={[
              { label: 'Engagement Rate', value: '87%' },
              { label: 'Adaptive Mode', value: 'Active' }, // Changed 'Optimal Times' to 'Adaptive Mode'
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
            nluDetails={nluInteractionDetails}
          />

          {/* AI Insights Dashboard Link - using FeatureCard */}
          <FeatureCard
            title="AI Insights Dashboard"
            subtitle="Personalized productivity intelligence"
            icon="insights"
            enabled={aiNotificationsEnabled} // Re-using aiNotificationsEnabled for the switch, or could be true
            onToggle={toggleAiNotifications} // Or a dummy function if this switch means something else
            description="Explore AI-driven recommendations, predictions, and suggestions to boost your productivity."
            actionButton={{
              title: 'Explore Insights',
              onPress: viewInsightsDashboard,
            }}
          />
          {/* The original AnalyticsCard that shows mobileAnalytics can be kept if needed,
              or removed if InsightsDashboardScreen replaces its functionality.
              For now, I'm replacing it. If 'MobileAnalytics' screen is still valuable,
              another card or entry point would be needed for it.
          */}
          {/*
          <AnalyticsCard
            analytics={mobileAnalytics}
            onViewDetails={viewPerformanceMetrics} // This navigates to 'MobileAnalytics'
          />
          */}

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
              icon="insights" // Changed icon
              title="AI Insights" // Changed title
              subtitle="View dashboard" // Changed subtitle
              onPress={viewInsightsDashboard} // Changed navigation target
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

// NLU Display Component
// Exported for testing purposes
export const NLUDisplay = ({ details }) => {
  if (!details) {
    return null;
  }

  const { intent, entities, originalQuery, confidence } = details;

  return (
    <View style={styles.nluDisplayContainer}>
      <Text style={styles.nluTitle}>Voice Command Details:</Text>
      {originalQuery && <Text style={styles.nluText}><Text style={styles.nluLabel}>You said:</Text> "{originalQuery}"</Text>}
      <Text style={styles.nluText}><Text style={styles.nluLabel}>Intent:</Text> {intent}</Text>
      {confidence && <Text style={styles.nluText}><Text style={styles.nluLabel}>Confidence:</Text> {Math.round(confidence * 100)}%</Text>}
      {entities && Object.keys(entities).length > 0 && (
        <View>
          <Text style={styles.nluLabel}>Entities:</Text>
          {Object.entries(entities).map(([key, value]) => (
            <Text key={key} style={styles.nluEntityText}>
              - {key}: {typeof value === 'object' ? JSON.stringify(value) : value}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
};

// Voice Recognition Card Component
// Exported for testing purposes
export const VoiceRecognitionCard = ({ active, onStart, onStop, onTestCommand, pulseAnim, nluDetails }) => (
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
    <NLUDisplay details={nluDetails} />
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
  nluDisplayContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f9fafb', // Lighter gray, almost white
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb', // Light gray border
  },
  nluTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937', // Dark gray
    marginBottom: 8,
  },
  nluText: {
    fontSize: 14,
    color: '#374151', // Medium-dark gray
    marginBottom: 4,
  },
  nluLabel: {
    fontWeight: 'bold',
    color: '#4b5563', // Slightly lighter than text, but still dark
  },
  nluEntityText: {
    fontSize: 13,
    color: '#4b5563', // Medium gray
    marginLeft: 8,
    fontStyle: 'italic',
  }
});

export default AdvancedMobileFeatures;