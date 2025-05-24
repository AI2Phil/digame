/**
 * Biometric Authentication Service
 * Handles Face ID, Touch ID, and Fingerprint authentication for mobile devices
 */

import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Alert } from 'react-native';

class BiometricAuthService {
  constructor() {
    this.isSupported = false;
    this.availableTypes = [];
    this.isEnrolled = false;
    this.authenticationEnabled = false;
    this.fallbackToPassword = true;
    this.maxRetryAttempts = 3;
    this.lockoutDuration = 30000; // 30 seconds
    this.lastFailedAttempt = null;
    this.failedAttempts = 0;
  }

  /**
   * Initialize biometric authentication
   */
  async initialize() {
    try {
      // Check if biometric authentication is supported
      this.isSupported = await LocalAuthentication.hasHardwareAsync();
      
      if (this.isSupported) {
        // Get available biometric types
        this.availableTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
        
        // Check if user has enrolled biometrics
        this.isEnrolled = await LocalAuthentication.isEnrolledAsync();
        
        // Load user preferences
        await this.loadUserPreferences();
        
        console.log('Biometric authentication initialized:', {
          supported: this.isSupported,
          types: this.availableTypes,
          enrolled: this.isEnrolled,
          enabled: this.authenticationEnabled
        });
      }
      
      return {
        supported: this.isSupported,
        enrolled: this.isEnrolled,
        types: this.availableTypes,
        enabled: this.authenticationEnabled
      };
    } catch (error) {
      console.error('Failed to initialize biometric authentication:', error);
      throw error;
    }
  }

  /**
   * Check if biometric authentication is available and ready
   */
  async isAvailable() {
    try {
      if (!this.isSupported) {
        return {
          available: false,
          reason: 'Biometric hardware not supported'
        };
      }

      if (!this.isEnrolled) {
        return {
          available: false,
          reason: 'No biometric data enrolled'
        };
      }

      if (!this.authenticationEnabled) {
        return {
          available: false,
          reason: 'Biometric authentication disabled by user'
        };
      }

      if (this.isLockedOut()) {
        return {
          available: false,
          reason: 'Temporarily locked due to failed attempts'
        };
      }

      return {
        available: true,
        types: this.availableTypes
      };
    } catch (error) {
      console.error('Failed to check biometric availability:', error);
      return {
        available: false,
        reason: 'Error checking biometric availability'
      };
    }
  }

  /**
   * Authenticate user with biometrics
   */
  async authenticate(options = {}) {
    try {
      const availability = await this.isAvailable();
      
      if (!availability.available) {
        throw new Error(availability.reason);
      }

      // Prepare authentication options
      const authOptions = {
        promptMessage: options.promptMessage || 'Authenticate to access your account',
        cancelLabel: options.cancelLabel || 'Cancel',
        fallbackLabel: options.fallbackLabel || 'Use Password',
        disableDeviceFallback: options.disableDeviceFallback || false,
        ...options
      };

      // Perform biometric authentication
      const result = await LocalAuthentication.authenticateAsync(authOptions);
      
      if (result.success) {
        // Reset failed attempts on successful authentication
        this.resetFailedAttempts();
        
        // Log successful authentication
        await this.logAuthenticationEvent('success', 'biometric');
        
        return {
          success: true,
          authType: this.getPrimaryBiometricType(),
          timestamp: Date.now()
        };
      } else {
        // Handle authentication failure
        await this.handleAuthenticationFailure(result);
        
        return {
          success: false,
          error: result.error,
          reason: this.getFailureReason(result.error)
        };
      }
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      
      // Log failed authentication
      await this.logAuthenticationEvent('error', 'biometric', error.message);
      
      return {
        success: false,
        error: error.message,
        reason: 'Authentication error occurred'
      };
    }
  }

  /**
   * Enable biometric authentication for the user
   */
  async enableBiometricAuth(userCredentials) {
    try {
      // Verify user credentials first
      const credentialsValid = await this.verifyUserCredentials(userCredentials);
      
      if (!credentialsValid) {
        throw new Error('Invalid credentials provided');
      }

      // Check if biometrics are available
      const availability = await this.isAvailable();
      
      if (!this.isSupported) {
        throw new Error('Biometric authentication not supported on this device');
      }

      if (!this.isEnrolled) {
        throw new Error('No biometric data enrolled on this device');
      }

      // Test biometric authentication
      const testAuth = await this.authenticate({
        promptMessage: 'Verify your biometric to enable authentication',
        disableDeviceFallback: true
      });

      if (!testAuth.success) {
        throw new Error('Biometric verification failed');
      }

      // Store encrypted credentials securely
      await this.storeSecureCredentials(userCredentials);
      
      // Enable biometric authentication
      this.authenticationEnabled = true;
      await this.saveUserPreferences();
      
      // Log enablement
      await this.logAuthenticationEvent('enabled', 'biometric');
      
      console.log('Biometric authentication enabled successfully');
      
      return {
        success: true,
        message: 'Biometric authentication enabled successfully'
      };
    } catch (error) {
      console.error('Failed to enable biometric authentication:', error);
      throw error;
    }
  }

  /**
   * Disable biometric authentication
   */
  async disableBiometricAuth() {
    try {
      // Disable biometric authentication
      this.authenticationEnabled = false;
      await this.saveUserPreferences();
      
      // Remove stored credentials
      await this.removeSecureCredentials();
      
      // Log disablement
      await this.logAuthenticationEvent('disabled', 'biometric');
      
      console.log('Biometric authentication disabled');
      
      return {
        success: true,
        message: 'Biometric authentication disabled successfully'
      };
    } catch (error) {
      console.error('Failed to disable biometric authentication:', error);
      throw error;
    }
  }

  /**
   * Get biometric authentication status and capabilities
   */
  async getStatus() {
    try {
      const availability = await this.isAvailable();
      
      return {
        supported: this.isSupported,
        enrolled: this.isEnrolled,
        enabled: this.authenticationEnabled,
        available: availability.available,
        availableTypes: this.availableTypes,
        primaryType: this.getPrimaryBiometricType(),
        failedAttempts: this.failedAttempts,
        isLockedOut: this.isLockedOut(),
        lockoutTimeRemaining: this.getLockoutTimeRemaining()
      };
    } catch (error) {
      console.error('Failed to get biometric status:', error);
      throw error;
    }
  }

  /**
   * Get primary biometric type available
   */
  getPrimaryBiometricType() {
    if (this.availableTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      return Platform.OS === 'ios' ? 'Face ID' : 'Face Recognition';
    } else if (this.availableTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return Platform.OS === 'ios' ? 'Touch ID' : 'Fingerprint';
    } else if (this.availableTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      return 'Iris Recognition';
    }
    return 'Biometric';
  }

  /**
   * Get user-friendly biometric type names
   */
  getBiometricTypeNames() {
    const names = [];
    
    this.availableTypes.forEach(type => {
      switch (type) {
        case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
          names.push(Platform.OS === 'ios' ? 'Face ID' : 'Face Recognition');
          break;
        case LocalAuthentication.AuthenticationType.FINGERPRINT:
          names.push(Platform.OS === 'ios' ? 'Touch ID' : 'Fingerprint');
          break;
        case LocalAuthentication.AuthenticationType.IRIS:
          names.push('Iris Recognition');
          break;
      }
    });
    
    return names;
  }

  /**
   * Handle authentication failure
   */
  async handleAuthenticationFailure(result) {
    this.failedAttempts++;
    this.lastFailedAttempt = Date.now();
    
    // Log failed attempt
    await this.logAuthenticationEvent('failed', 'biometric', result.error);
    
    // Check if user should be locked out
    if (this.failedAttempts >= this.maxRetryAttempts) {
      await this.logAuthenticationEvent('lockout', 'biometric');
      
      // Show lockout alert
      Alert.alert(
        'Too Many Failed Attempts',
        `Biometric authentication has been temporarily disabled. Please try again in ${this.lockoutDuration / 1000} seconds.`,
        [{ text: 'OK' }]
      );
    }
    
    // Save failed attempts
    await AsyncStorage.setItem('biometric_failed_attempts', this.failedAttempts.toString());
    await AsyncStorage.setItem('biometric_last_failed', this.lastFailedAttempt.toString());
  }

  /**
   * Reset failed attempts counter
   */
  async resetFailedAttempts() {
    this.failedAttempts = 0;
    this.lastFailedAttempt = null;
    
    await AsyncStorage.multiRemove([
      'biometric_failed_attempts',
      'biometric_last_failed'
    ]);
  }

  /**
   * Check if user is currently locked out
   */
  isLockedOut() {
    if (this.failedAttempts < this.maxRetryAttempts) {
      return false;
    }
    
    if (!this.lastFailedAttempt) {
      return false;
    }
    
    const timeSinceLastFailure = Date.now() - this.lastFailedAttempt;
    return timeSinceLastFailure < this.lockoutDuration;
  }

  /**
   * Get remaining lockout time in milliseconds
   */
  getLockoutTimeRemaining() {
    if (!this.isLockedOut()) {
      return 0;
    }
    
    const timeSinceLastFailure = Date.now() - this.lastFailedAttempt;
    return Math.max(0, this.lockoutDuration - timeSinceLastFailure);
  }

  /**
   * Get failure reason from error code
   */
  getFailureReason(error) {
    switch (error) {
      case 'UserCancel':
        return 'Authentication was cancelled by user';
      case 'UserFallback':
        return 'User chose to use fallback authentication';
      case 'SystemCancel':
        return 'Authentication was cancelled by system';
      case 'PasscodeNotSet':
        return 'Device passcode is not set';
      case 'BiometryNotAvailable':
        return 'Biometric authentication is not available';
      case 'BiometryNotEnrolled':
        return 'No biometric data is enrolled';
      case 'BiometryLockout':
        return 'Biometric authentication is locked out';
      case 'AuthenticationFailed':
        return 'Biometric authentication failed';
      default:
        return 'Unknown authentication error';
    }
  }

  /**
   * Store user credentials securely
   */
  async storeSecureCredentials(credentials) {
    try {
      const encryptedCredentials = JSON.stringify(credentials);
      await SecureStore.setItemAsync('biometric_credentials', encryptedCredentials);
    } catch (error) {
      console.error('Failed to store secure credentials:', error);
      throw error;
    }
  }

  /**
   * Retrieve stored credentials
   */
  async getStoredCredentials() {
    try {
      const encryptedCredentials = await SecureStore.getItemAsync('biometric_credentials');
      
      if (encryptedCredentials) {
        return JSON.parse(encryptedCredentials);
      }
      
      return null;
    } catch (error) {
      console.error('Failed to retrieve stored credentials:', error);
      return null;
    }
  }

  /**
   * Remove stored credentials
   */
  async removeSecureCredentials() {
    try {
      await SecureStore.deleteItemAsync('biometric_credentials');
    } catch (error) {
      console.error('Failed to remove secure credentials:', error);
    }
  }

  /**
   * Verify user credentials
   */
  async verifyUserCredentials(credentials) {
    try {
      // This would typically verify against your authentication service
      // For now, we'll assume credentials are valid if they contain required fields
      return credentials && credentials.username && credentials.password;
    } catch (error) {
      console.error('Failed to verify user credentials:', error);
      return false;
    }
  }

  /**
   * Load user preferences
   */
  async loadUserPreferences() {
    try {
      const enabled = await AsyncStorage.getItem('biometric_auth_enabled');
      this.authenticationEnabled = enabled === 'true';
      
      const fallback = await AsyncStorage.getItem('biometric_fallback_enabled');
      this.fallbackToPassword = fallback !== 'false';
      
      const maxRetries = await AsyncStorage.getItem('biometric_max_retries');
      if (maxRetries) {
        this.maxRetryAttempts = parseInt(maxRetries, 10);
      }
      
      const lockoutDuration = await AsyncStorage.getItem('biometric_lockout_duration');
      if (lockoutDuration) {
        this.lockoutDuration = parseInt(lockoutDuration, 10);
      }
      
      // Load failed attempts data
      const failedAttempts = await AsyncStorage.getItem('biometric_failed_attempts');
      if (failedAttempts) {
        this.failedAttempts = parseInt(failedAttempts, 10);
      }
      
      const lastFailed = await AsyncStorage.getItem('biometric_last_failed');
      if (lastFailed) {
        this.lastFailedAttempt = parseInt(lastFailed, 10);
      }
    } catch (error) {
      console.error('Failed to load user preferences:', error);
    }
  }

  /**
   * Save user preferences
   */
  async saveUserPreferences() {
    try {
      await AsyncStorage.multiSet([
        ['biometric_auth_enabled', this.authenticationEnabled.toString()],
        ['biometric_fallback_enabled', this.fallbackToPassword.toString()],
        ['biometric_max_retries', this.maxRetryAttempts.toString()],
        ['biometric_lockout_duration', this.lockoutDuration.toString()]
      ]);
    } catch (error) {
      console.error('Failed to save user preferences:', error);
    }
  }

  /**
   * Log authentication events
   */
  async logAuthenticationEvent(event, method, details = null) {
    try {
      const logEntry = {
        event,
        method,
        details,
        timestamp: Date.now(),
        platform: Platform.OS,
        biometricType: this.getPrimaryBiometricType()
      };
      
      const logs = await this.getAuthenticationLogs();
      logs.push(logEntry);
      
      // Keep only last 50 logs
      if (logs.length > 50) {
        logs.splice(0, logs.length - 50);
      }
      
      await AsyncStorage.setItem('biometric_auth_logs', JSON.stringify(logs));
    } catch (error) {
      console.error('Failed to log authentication event:', error);
    }
  }

  /**
   * Get authentication logs
   */
  async getAuthenticationLogs() {
    try {
      const logs = await AsyncStorage.getItem('biometric_auth_logs');
      return logs ? JSON.parse(logs) : [];
    } catch (error) {
      console.error('Failed to get authentication logs:', error);
      return [];
    }
  }

  /**
   * Get authentication analytics
   */
  async getAuthenticationAnalytics() {
    try {
      const logs = await this.getAuthenticationLogs();
      
      if (logs.length === 0) {
        return {
          totalAttempts: 0,
          successRate: 0,
          averageAuthTime: 0,
          mostUsedMethod: 'none',
          recentActivity: []
        };
      }
      
      const totalAttempts = logs.length;
      const successfulAttempts = logs.filter(log => log.event === 'success').length;
      const successRate = Math.round((successfulAttempts / totalAttempts) * 100);
      
      // Calculate average authentication time (if available)
      const authTimes = logs
        .filter(log => log.details && log.details.duration)
        .map(log => log.details.duration);
      const averageAuthTime = authTimes.length > 0 
        ? Math.round(authTimes.reduce((a, b) => a + b, 0) / authTimes.length)
        : 0;
      
      // Find most used method
      const methodCounts = logs.reduce((counts, log) => {
        counts[log.method] = (counts[log.method] || 0) + 1;
        return counts;
      }, {});
      
      const mostUsedMethod = Object.keys(methodCounts).reduce((a, b) => 
        methodCounts[a] > methodCounts[b] ? a : b
      );
      
      // Get recent activity (last 10 events)
      const recentActivity = logs.slice(-10).reverse();
      
      return {
        totalAttempts,
        successRate,
        averageAuthTime,
        mostUsedMethod,
        recentActivity,
        methodBreakdown: methodCounts
      };
    } catch (error) {
      console.error('Failed to get authentication analytics:', error);
      return null;
    }
  }

  /**
   * Update biometric settings
   */
  async updateSettings(settings) {
    try {
      if (settings.fallbackToPassword !== undefined) {
        this.fallbackToPassword = settings.fallbackToPassword;
      }
      
      if (settings.maxRetryAttempts !== undefined) {
        this.maxRetryAttempts = Math.max(1, Math.min(10, settings.maxRetryAttempts));
      }
      
      if (settings.lockoutDuration !== undefined) {
        this.lockoutDuration = Math.max(10000, Math.min(300000, settings.lockoutDuration));
      }
      
      await this.saveUserPreferences();
      
      return {
        success: true,
        message: 'Biometric settings updated successfully'
      };
    } catch (error) {
      console.error('Failed to update biometric settings:', error);
      throw error;
    }
  }

  /**
   * Clear all biometric data
   */
  async clearBiometricData() {
    try {
      // Disable biometric authentication
      this.authenticationEnabled = false;
      
      // Reset counters
      this.failedAttempts = 0;
      this.lastFailedAttempt = null;
      
      // Remove all stored data
      await AsyncStorage.multiRemove([
        'biometric_auth_enabled',
        'biometric_fallback_enabled',
        'biometric_max_retries',
        'biometric_lockout_duration',
        'biometric_failed_attempts',
        'biometric_last_failed',
        'biometric_auth_logs'
      ]);
      
      // Remove secure credentials
      await this.removeSecureCredentials();
      
      console.log('Biometric data cleared');
      
      return {
        success: true,
        message: 'All biometric data cleared successfully'
      };
    } catch (error) {
      console.error('Failed to clear biometric data:', error);
      throw error;
    }
  }

  /**
   * Test biometric authentication without storing credentials
   */
  async testBiometricAuth() {
    try {
      const result = await this.authenticate({
        promptMessage: 'Test your biometric authentication',
        disableDeviceFallback: true
      });
      
      return result;
    } catch (error) {
      console.error('Biometric test failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Create singleton instance
const biometricAuthService = new BiometricAuthService();

export default biometricAuthService;