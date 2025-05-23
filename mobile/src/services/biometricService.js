import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { Alert, Platform } from 'react-native';

class BiometricService {
  constructor() {
    this.isAvailable = false;
    this.supportedTypes = [];
  }

  async initialize() {
    try {
      // Check if biometric authentication is available
      this.isAvailable = await LocalAuthentication.hasHardwareAsync();
      
      if (this.isAvailable) {
        // Check if biometric records are enrolled
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        
        if (isEnrolled) {
          // Get supported authentication types
          this.supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
        }
        
        return {
          isAvailable: this.isAvailable,
          isEnrolled,
          supportedTypes: this.supportedTypes,
        };
      }
      
      return {
        isAvailable: false,
        isEnrolled: false,
        supportedTypes: [],
      };
    } catch (error) {
      console.error('Failed to initialize biometric service:', error);
      return {
        isAvailable: false,
        isEnrolled: false,
        supportedTypes: [],
      };
    }
  }

  async authenticate(reason = 'Authenticate to access your account') {
    try {
      if (!this.isAvailable) {
        throw new Error('Biometric authentication is not available');
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: reason,
        cancelLabel: 'Cancel',
        fallbackLabel: 'Use Password',
        disableDeviceFallback: false,
      });

      return result;
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async enableBiometricLogin(credentials) {
    try {
      // First authenticate with biometrics to confirm user intent
      const authResult = await this.authenticate('Enable biometric login for Digame');
      
      if (!authResult.success) {
        return {
          success: false,
          error: 'Biometric authentication failed',
        };
      }

      // Store encrypted credentials securely
      await SecureStore.setItemAsync('biometric_enabled', 'true');
      await SecureStore.setItemAsync('user_credentials', JSON.stringify(credentials));

      return {
        success: true,
        message: 'Biometric login enabled successfully',
      };
    } catch (error) {
      console.error('Failed to enable biometric login:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async disableBiometricLogin() {
    try {
      await SecureStore.deleteItemAsync('biometric_enabled');
      await SecureStore.deleteItemAsync('user_credentials');

      return {
        success: true,
        message: 'Biometric login disabled successfully',
      };
    } catch (error) {
      console.error('Failed to disable biometric login:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async isBiometricLoginEnabled() {
    try {
      const enabled = await SecureStore.getItemAsync('biometric_enabled');
      return enabled === 'true';
    } catch (error) {
      console.error('Failed to check biometric login status:', error);
      return false;
    }
  }

  async getStoredCredentials() {
    try {
      const credentials = await SecureStore.getItemAsync('user_credentials');
      return credentials ? JSON.parse(credentials) : null;
    } catch (error) {
      console.error('Failed to get stored credentials:', error);
      return null;
    }
  }

  async biometricLogin() {
    try {
      // Check if biometric login is enabled
      const isEnabled = await this.isBiometricLoginEnabled();
      
      if (!isEnabled) {
        return {
          success: false,
          error: 'Biometric login is not enabled',
        };
      }

      // Authenticate with biometrics
      const authResult = await this.authenticate('Login to Digame');
      
      if (!authResult.success) {
        return {
          success: false,
          error: 'Biometric authentication failed',
        };
      }

      // Get stored credentials
      const credentials = await this.getStoredCredentials();
      
      if (!credentials) {
        return {
          success: false,
          error: 'No stored credentials found',
        };
      }

      return {
        success: true,
        credentials,
      };
    } catch (error) {
      console.error('Biometric login failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  getBiometricTypeString() {
    if (!this.supportedTypes || this.supportedTypes.length === 0) {
      return 'Biometric';
    }

    const types = this.supportedTypes.map(type => {
      switch (type) {
        case LocalAuthentication.AuthenticationType.FINGERPRINT:
          return 'Fingerprint';
        case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
          return Platform.OS === 'ios' ? 'Face ID' : 'Face Recognition';
        case LocalAuthentication.AuthenticationType.IRIS:
          return 'Iris';
        default:
          return 'Biometric';
      }
    });

    return types.join(' or ');
  }

  async showBiometricSetupPrompt() {
    const biometricType = this.getBiometricTypeString();
    
    return new Promise((resolve) => {
      Alert.alert(
        'Enable Biometric Login',
        `Would you like to enable ${biometricType} login for faster and more secure access to your account?`,
        [
          {
            text: 'Not Now',
            style: 'cancel',
            onPress: () => resolve(false),
          },
          {
            text: 'Enable',
            onPress: () => resolve(true),
          },
        ]
      );
    });
  }

  async securelyStoreData(key, data) {
    try {
      await SecureStore.setItemAsync(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Failed to store data securely:', error);
      return false;
    }
  }

  async securelyRetrieveData(key) {
    try {
      const data = await SecureStore.getItemAsync(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to retrieve data securely:', error);
      return null;
    }
  }

  async securelyDeleteData(key) {
    try {
      await SecureStore.deleteItemAsync(key);
      return true;
    } catch (error) {
      console.error('Failed to delete data securely:', error);
      return false;
    }
  }
}

export default new BiometricService();