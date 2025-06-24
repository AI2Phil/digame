import { AccessibilityInfo, Platform, Alert } from 'react-native';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

class AccessibilityService {
  constructor() {
    this.isInitialized = false;
    this.screenReaderEnabled = false;
    this.voiceControlEnabled = false;
    this.highContrastEnabled = false;
    this.reducedMotionEnabled = false;
    this.largeTextEnabled = false;
    this.voiceRecognition = null;
    this.speechSettings = {
      rate: 0.5,
      pitch: 1.0,
      language: 'en-US',
      voice: null,
    };
    this.accessibilityCallbacks = new Map();
    this.focusHistory = [];
    this.currentFocus = null;
  }

  async initialize() {
    try {
      // Check accessibility settings
      await this.checkAccessibilitySettings();
      
      // Initialize voice recognition if available
      await this.initializeVoiceRecognition();
      
      // Load user preferences
      await this.loadAccessibilityPreferences();
      
      // Set up accessibility listeners
      this.setupAccessibilityListeners();
      
      this.isInitialized = true;
      console.log('Accessibility Service initialized');
      return true;
    } catch (error) {
      console.error('Failed to initialize accessibility service:', error);
      return false;
    }
  }

  async checkAccessibilitySettings() {
    try {
      // Check if screen reader is enabled
      this.screenReaderEnabled = await AccessibilityInfo.isScreenReaderEnabled();
      
      // Check if reduce motion is enabled
      this.reducedMotionEnabled = await AccessibilityInfo.isReduceMotionEnabled();
      
      // Check if reduce transparency is enabled (iOS)
      if (Platform.OS === 'ios') {
        this.highContrastEnabled = await AccessibilityInfo.isReduceTransparencyEnabled();
      }
      
      // Check if bold text is enabled (iOS)
      if (Platform.OS === 'ios') {
        this.largeTextEnabled = await AccessibilityInfo.isBoldTextEnabled();
      }
      
      console.log('Accessibility settings:', {
        screenReader: this.screenReaderEnabled,
        reducedMotion: this.reducedMotionEnabled,
        highContrast: this.highContrastEnabled,
        largeText: this.largeTextEnabled,
      });
    } catch (error) {
      console.error('Error checking accessibility settings:', error);
    }
  }

  setupAccessibilityListeners() {
    // Listen for screen reader changes
    AccessibilityInfo.addEventListener('screenReaderChanged', (enabled) => {
      this.screenReaderEnabled = enabled;
      this.notifyAccessibilityChange('screenReader', enabled);
    });

    // Listen for reduce motion changes
    AccessibilityInfo.addEventListener('reduceMotionChanged', (enabled) => {
      this.reducedMotionEnabled = enabled;
      this.notifyAccessibilityChange('reducedMotion', enabled);
    });

    // Listen for reduce transparency changes (iOS)
    if (Platform.OS === 'ios') {
      AccessibilityInfo.addEventListener('reduceTransparencyChanged', (enabled) => {
        this.highContrastEnabled = enabled;
        this.notifyAccessibilityChange('highContrast', enabled);
      });
    }

    // Listen for bold text changes (iOS)
    if (Platform.OS === 'ios') {
      AccessibilityInfo.addEventListener('boldTextChanged', (enabled) => {
        this.largeTextEnabled = enabled;
        this.notifyAccessibilityChange('largeText', enabled);
      });
    }
  }

  async initializeVoiceRecognition() {
    try {
      // Request microphone permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Microphone permission not granted');
        return;
      }

      // Initialize voice recognition (platform-specific implementation would go here)
      this.voiceControlEnabled = true;
      console.log('Voice recognition initialized');
    } catch (error) {
      console.error('Failed to initialize voice recognition:', error);
    }
  }

  // Screen reader support
  async announceForScreenReader(message, priority = 'polite') {
    if (!this.screenReaderEnabled) return;

    try {
      if (Platform.OS === 'ios') {
        AccessibilityInfo.announceForAccessibility(message);
      } else {
        // Android implementation
        AccessibilityInfo.announceForAccessibility(message);
      }
    } catch (error) {
      console.error('Failed to announce for screen reader:', error);
    }
  }

  // Text-to-speech functionality
  async speak(text, options = {}) {
    const settings = { ...this.speechSettings, ...options };
    
    try {
      await Speech.speak(text, {
        language: settings.language,
        pitch: settings.pitch,
        rate: settings.rate,
        voice: settings.voice,
        onStart: () => console.log('Speech started'),
        onDone: () => console.log('Speech completed'),
        onStopped: () => console.log('Speech stopped'),
        onError: (error) => console.error('Speech error:', error),
      });
    } catch (error) {
      console.error('Failed to speak text:', error);
    }
  }

  async stopSpeaking() {
    try {
      await Speech.stop();
    } catch (error) {
      console.error('Failed to stop speech:', error);
    }
  }

  async pauseSpeaking() {
    try {
      await Speech.pause();
    } catch (error) {
      console.error('Failed to pause speech:', error);
    }
  }

  async resumeSpeaking() {
    try {
      await Speech.resume();
    } catch (error) {
      console.error('Failed to resume speech:', error);
    }
  }

  // Voice control commands
  registerVoiceCommand(command, callback, description = '') {
    if (!this.voiceControlEnabled) return false;

    const commandKey = command.toLowerCase();
    this.accessibilityCallbacks.set(`voice_${commandKey}`, {
      callback,
      description,
      command,
    });
    
    console.log(`Voice command registered: "${command}"`);
    return true;
  }

  unregisterVoiceCommand(command) {
    const commandKey = `voice_${command.toLowerCase()}`;
    return this.accessibilityCallbacks.delete(commandKey);
  }

  async processVoiceCommand(recognizedText) {
    const text = recognizedText.toLowerCase().trim();
    
    // Check for registered commands
    for (const [key, commandData] of this.accessibilityCallbacks) {
      if (key.startsWith('voice_')) {
        const command = commandData.command.toLowerCase();
        if (text.includes(command)) {
          try {
            await commandData.callback(recognizedText);
            await this.announceForScreenReader(`Executed command: ${commandData.command}`);
            return true;
          } catch (error) {
            console.error(`Error executing voice command "${command}":`, error);
            await this.announceForScreenReader(`Failed to execute command: ${commandData.command}`);
          }
        }
      }
    }

    // Built-in commands
    if (text.includes('go back') || text.includes('navigate back')) {
      this.executeBuiltInCommand('goBack');
      return true;
    }
    
    if (text.includes('scroll up')) {
      this.executeBuiltInCommand('scrollUp');
      return true;
    }
    
    if (text.includes('scroll down')) {
      this.executeBuiltInCommand('scrollDown');
      return true;
    }
    
    if (text.includes('read page') || text.includes('read content')) {
      this.executeBuiltInCommand('readPage');
      return true;
    }

    if (text.includes('help') || text.includes('what can i say')) {
      this.executeBuiltInCommand('showHelp');
      return true;
    }

    return false;
  }

  executeBuiltInCommand(command) {
    const callback = this.accessibilityCallbacks.get(`builtin_${command}`);
    if (callback) {
      callback.callback();
    } else {
      console.warn(`Built-in command "${command}" not registered`);
    }
  }

  // Focus management
  setAccessibilityFocus(element, announce = true) {
    if (!element) return;

    try {
      this.currentFocus = element;
      this.focusHistory.push(element);
      
      // Limit focus history
      if (this.focusHistory.length > 10) {
        this.focusHistory.shift();
      }

      if (Platform.OS === 'ios') {
        AccessibilityInfo.setAccessibilityFocus(element);
      }

      if (announce && this.screenReaderEnabled) {
        const label = element.props?.accessibilityLabel || 'Element focused';
        this.announceForScreenReader(label);
      }
    } catch (error) {
      console.error('Failed to set accessibility focus:', error);
    }
  }

  moveFocusToNext() {
    // Implementation would depend on the specific navigation structure
    this.announceForScreenReader('Moving to next element');
  }

  moveFocusToPrevious() {
    // Implementation would depend on the specific navigation structure
    this.announceForScreenReader('Moving to previous element');
  }

  // Accessibility helpers for components
  createAccessibilityProps(options = {}) {
    const {
      label,
      hint,
      role = 'button',
      state,
      value,
      actions = [],
      traits = [],
    } = options;

    const props = {
      accessible: true,
      accessibilityLabel: label,
      accessibilityHint: hint,
      accessibilityRole: role,
    };

    if (state) {
      props.accessibilityState = state;
    }

    if (value) {
      props.accessibilityValue = value;
    }

    if (actions.length > 0) {
      props.accessibilityActions = actions;
    }

    if (Platform.OS === 'ios' && traits.length > 0) {
      props.accessibilityTraits = traits;
    }

    return props;
  }

  // High contrast support
  getHighContrastStyles() {
    if (!this.highContrastEnabled) return {};

    return {
      backgroundColor: '#000000',
      color: '#FFFFFF',
      borderColor: '#FFFFFF',
      borderWidth: 2,
    };
  }

  // Large text support
  getScaledFontSize(baseFontSize) {
    if (!this.largeTextEnabled) return baseFontSize;
    
    // Scale font size for accessibility
    return baseFontSize * 1.3;
  }

  // Reduced motion support
  getReducedMotionConfig() {
    return {
      useNativeDriver: !this.reducedMotionEnabled,
      duration: this.reducedMotionEnabled ? 0 : undefined,
    };
  }

  // Gesture alternatives for accessibility
  createAccessibleGesture(originalGesture, alternativeAction, description) {
    if (!this.screenReaderEnabled) {
      return originalGesture;
    }

    // Return alternative action for screen reader users
    return {
      ...originalGesture,
      accessibilityActions: [
        {
          name: 'activate',
          label: description,
        },
      ],
      onAccessibilityAction: (event) => {
        if (event.nativeEvent.actionName === 'activate') {
          alternativeAction();
        }
      },
    };
  }

  // Accessibility testing helpers
  validateAccessibility(component) {
    const issues = [];

    if (!component.props.accessible && !component.props.accessibilityLabel) {
      issues.push('Component should have accessibility label');
    }

    if (component.props.onPress && !component.props.accessibilityRole) {
      issues.push('Interactive component should have accessibility role');
    }

    if (component.props.accessibilityLabel && component.props.accessibilityLabel.length > 40) {
      issues.push('Accessibility label should be concise (under 40 characters)');
    }

    return issues;
  }

  // Preferences management
  async saveAccessibilityPreferences() {
    try {
      const preferences = {
        speechSettings: this.speechSettings,
        voiceControlEnabled: this.voiceControlEnabled,
      };
      
      await AsyncStorage.setItem(
        'accessibility_preferences',
        JSON.stringify(preferences)
      );
    } catch (error) {
      console.error('Failed to save accessibility preferences:', error);
    }
  }

  async loadAccessibilityPreferences() {
    try {
      const preferences = await AsyncStorage.getItem('accessibility_preferences');
      if (preferences) {
        const parsed = JSON.parse(preferences);
        this.speechSettings = { ...this.speechSettings, ...parsed.speechSettings };
        this.voiceControlEnabled = parsed.voiceControlEnabled ?? this.voiceControlEnabled;
      }
    } catch (error) {
      console.error('Failed to load accessibility preferences:', error);
    }
  }

  // Event handling
  registerAccessibilityCallback(event, callback) {
    this.accessibilityCallbacks.set(event, { callback });
  }

  unregisterAccessibilityCallback(event) {
    this.accessibilityCallbacks.delete(event);
  }

  notifyAccessibilityChange(type, value) {
    const callback = this.accessibilityCallbacks.get(`${type}Changed`);
    if (callback) {
      callback.callback(value);
    }
  }

  // Utility methods
  isScreenReaderEnabled() {
    return this.screenReaderEnabled;
  }

  isReducedMotionEnabled() {
    return this.reducedMotionEnabled;
  }

  isHighContrastEnabled() {
    return this.highContrastEnabled;
  }

  isLargeTextEnabled() {
    return this.largeTextEnabled;
  }

  isVoiceControlEnabled() {
    return this.voiceControlEnabled;
  }

  getAccessibilityState() {
    return {
      isInitialized: this.isInitialized,
      screenReaderEnabled: this.screenReaderEnabled,
      voiceControlEnabled: this.voiceControlEnabled,
      highContrastEnabled: this.highContrastEnabled,
      reducedMotionEnabled: this.reducedMotionEnabled,
      largeTextEnabled: this.largeTextEnabled,
      speechSettings: this.speechSettings,
    };
  }

  // Cleanup
  cleanup() {
    this.accessibilityCallbacks.clear();
    this.focusHistory = [];
    this.currentFocus = null;
    
    // Remove event listeners
    AccessibilityInfo.removeEventListener('screenReaderChanged');
    AccessibilityInfo.removeEventListener('reduceMotionChanged');
    
    if (Platform.OS === 'ios') {
      AccessibilityInfo.removeEventListener('reduceTransparencyChanged');
      AccessibilityInfo.removeEventListener('boldTextChanged');
    }
  }
}

export default new AccessibilityService();