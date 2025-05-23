import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthService } from '../services/AuthService';

const onboardingSteps = [
  {
    id: 1,
    title: 'Welcome to Digame',
    subtitle: 'Your Digital Activity Intelligence Platform',
    description: 'Track, analyze, and optimize your digital productivity with AI-powered insights.',
    icon: 'analytics',
    color: '#007AFF',
  },
  {
    id: 2,
    title: 'Activity Tracking',
    subtitle: 'Automatic Digital Behavior Monitoring',
    description: 'We automatically track your digital activities to provide meaningful insights about your productivity patterns.',
    icon: 'pulse',
    color: '#34C759',
  },
  {
    id: 3,
    title: 'Smart Analytics',
    subtitle: 'AI-Powered Insights',
    description: 'Our AI analyzes your behavior patterns to detect anomalies and suggest productivity improvements.',
    icon: 'bulb',
    color: '#FF9500',
  },
  {
    id: 4,
    title: 'Privacy First',
    subtitle: 'Your Data, Your Control',
    description: 'All your data is encrypted and stored securely. You have full control over your privacy settings.',
    icon: 'shield-checkmark',
    color: '#AF52DE',
  },
];

const preferences = [
  {
    id: 'productivity_focus',
    title: 'Productivity Focus',
    description: 'Get insights on your most productive hours',
    icon: 'trending-up',
    selected: true,
  },
  {
    id: 'anomaly_detection',
    title: 'Anomaly Detection',
    description: 'Detect unusual patterns in your digital behavior',
    icon: 'warning',
    selected: true,
  },
  {
    id: 'task_suggestions',
    title: 'Task Suggestions',
    description: 'Receive AI-generated task recommendations',
    icon: 'list',
    selected: false,
  },
  {
    id: 'weekly_reports',
    title: 'Weekly Reports',
    description: 'Get comprehensive weekly productivity reports',
    icon: 'document-text',
    selected: true,
  },
];

export default function OnboardingScreen({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedPreferences, setSelectedPreferences] = useState(
    preferences.reduce((acc, pref) => {
      acc[pref.id] = pref.selected;
      return acc;
    }, {})
  );
  const [isLoading, setIsLoading] = useState(false);

  const isLastStep = currentStep === onboardingSteps.length;

  const handleNext = () => {
    if (currentStep < onboardingSteps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const togglePreference = (preferenceId) => {
    setSelectedPreferences(prev => ({
      ...prev,
      [preferenceId]: !prev[preferenceId],
    }));
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      const onboardingData = {
        preferences: selectedPreferences,
        completed_at: new Date().toISOString(),
        version: '1.0',
      };

      await AuthService.updateOnboardingStatus(onboardingData);
      onComplete();
    } catch (error) {
      Alert.alert('Error', 'Failed to complete onboarding. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = (step) => (
    <View style={styles.stepContainer}>
      <View style={[styles.iconContainer, { backgroundColor: step.color }]}>
        <Ionicons name={step.icon} size={48} color="#fff" />
      </View>
      <Text style={styles.stepTitle}>{step.title}</Text>
      <Text style={styles.stepSubtitle}>{step.subtitle}</Text>
      <Text style={styles.stepDescription}>{step.description}</Text>
    </View>
  );

  const renderPreferences = () => (
    <View style={styles.preferencesContainer}>
      <Text style={styles.preferencesTitle}>Customize Your Experience</Text>
      <Text style={styles.preferencesSubtitle}>
        Choose the features you'd like to enable
      </Text>
      
      <ScrollView style={styles.preferencesList}>
        {preferences.map((preference) => (
          <TouchableOpacity
            key={preference.id}
            style={[
              styles.preferenceItem,
              selectedPreferences[preference.id] && styles.preferenceItemSelected,
            ]}
            onPress={() => togglePreference(preference.id)}
          >
            <View style={styles.preferenceIcon}>
              <Ionicons
                name={preference.icon}
                size={24}
                color={selectedPreferences[preference.id] ? '#007AFF' : '#666'}
              />
            </View>
            <View style={styles.preferenceContent}>
              <Text style={[
                styles.preferenceTitle,
                selectedPreferences[preference.id] && styles.preferenceTitleSelected,
              ]}>
                {preference.title}
              </Text>
              <Text style={styles.preferenceDescription}>
                {preference.description}
              </Text>
            </View>
            <View style={styles.preferenceCheckbox}>
              {selectedPreferences[preference.id] && (
                <Ionicons name="checkmark" size={20} color="#007AFF" />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${((currentStep + 1) / (onboardingSteps.length + 1)) * 100}%` },
          ]}
        />
      </View>
      <Text style={styles.progressText}>
        {currentStep + 1} of {onboardingSteps.length + 1}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {renderProgressBar()}
      
      <ScrollView contentContainerStyle={styles.content}>
        {isLastStep ? renderPreferences() : renderStep(onboardingSteps[currentStep])}
      </ScrollView>

      <View style={styles.navigation}>
        {currentStep > 0 && (
          <TouchableOpacity style={styles.backButton} onPress={handlePrevious}>
            <Ionicons name="arrow-back" size={20} color="#007AFF" />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}

        <View style={styles.spacer} />

        {isLastStep ? (
          <TouchableOpacity
            style={[styles.completeButton, isLoading && styles.disabledButton]}
            onPress={handleComplete}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.completeButtonText}>Get Started</Text>
                <Ionicons name="checkmark" size={20} color="#fff" />
              </>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>Next</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  stepContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 18,
    color: '#007AFF',
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '600',
  },
  stepDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  preferencesContainer: {
    flex: 1,
    paddingVertical: 20,
  },
  preferencesTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  preferencesSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  preferencesList: {
    flex: 1,
  },
  preferenceItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  preferenceItemSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  preferenceIcon: {
    marginRight: 16,
  },
  preferenceContent: {
    flex: 1,
  },
  preferenceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  preferenceTitleSelected: {
    color: '#007AFF',
  },
  preferenceDescription: {
    fontSize: 14,
    color: '#666',
  },
  preferenceCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    marginLeft: 8,
    fontWeight: '600',
  },
  spacer: {
    flex: 1,
  },
  nextButton: {
    backgroundColor: '#007AFF',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  nextButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    marginRight: 8,
  },
  completeButton: {
    backgroundColor: '#34C759',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#34C759',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  completeButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    marginRight: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
});