import AsyncStorage from '@react-native-async-storage/async-storage';
import MobileSecurityService from './MobileSecurityService';

const API_BASE_URL = 'http://localhost:8000'; // Update this for production

class AuthService {
  static securityService = new MobileSecurityService();

  static async login(username, password, mfaCode = null) {
    try {
      // Log security event
      await this.securityService.logSecurityEvent('login_attempt', 'info', {
        username,
        has_mfa: !!mfaCode
      });

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          username,
          password,
          mfa_code: mfaCode || '',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Log failed login
        await this.securityService.logSecurityEvent('login_failed', 'failed', {
          username,
          error: errorData.detail
        });

        // Check for MFA requirement
        if (errorData.detail?.includes('MFA') || errorData.mfa_required) {
          throw new Error('MFA_REQUIRED');
        }

        throw new Error(errorData.detail || 'Login failed');
      }

      const data = await response.json();
      
      // Create secure session
      const sessionData = await this.securityService.createSecureSession(
        data.access_token,
        data.user
      );

      // Log successful login
      await this.securityService.logSecurityEvent('login_success', 'success', {
        username,
        session_id: sessionData.id
      });

      return {
        token: data.access_token,
        user: data.user,
        session: sessionData,
        mfa_required: data.mfa_required || false
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  static async loginWithMFA(username, password, mfaCode) {
    return this.login(username, password, mfaCode);
  }

  static async register(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Registration failed');
      }

      const data = await response.json();
      return {
        token: data.access_token,
        user: data.user,
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  static async verifyToken(token) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Token verification error:', error);
      return false;
    }
  }

  static async getCurrentUser() {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('No token found');
      }

      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get user data');
      }

      return await response.json();
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  }

  static async updateOnboardingStatus(onboardingData) {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('No token found');
      }

      const response = await fetch(`${API_BASE_URL}/auth/onboarding`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(onboardingData),
      });

      if (!response.ok) {
        throw new Error('Failed to update onboarding status');
      }

      return await response.json();
    } catch (error) {
      console.error('Update onboarding error:', error);
      throw error;
    }
  }

  static async logout() {
    try {
      // Log security event
      await this.securityService.logSecurityEvent('logout', 'success');
      
      // Invalidate secure session
      await this.securityService.invalidateSession();
      
      // Clear local storage
      await AsyncStorage.multiRemove(['authToken', 'user']);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  // ==================== ENHANCED SECURITY METHODS ====================

  /**
   * Validate current session security
   */
  static async validateSession() {
    try {
      return await this.securityService.validateSession();
    } catch (error) {
      console.error('Session validation error:', error);
      return false;
    }
  }

  /**
   * Check if application is locked
   */
  static async isApplicationLocked() {
    try {
      return await this.securityService.isApplicationLocked();
    } catch (error) {
      console.error('Lock check error:', error);
      return false;
    }
  }

  /**
   * Check if re-authentication is required
   */
  static async isReauthenticationRequired() {
    try {
      return await this.securityService.isReauthenticationRequired();
    } catch (error) {
      console.error('Reauth check error:', error);
      return false;
    }
  }

  /**
   * Authenticate with biometrics
   */
  static async authenticateWithBiometric(promptMessage) {
    try {
      return await this.securityService.authenticateWithBiometric(promptMessage);
    } catch (error) {
      console.error('Biometric auth error:', error);
      return false;
    }
  }

  /**
   * Get MFA status
   */
  static async getMFAStatus() {
    try {
      return await this.securityService.getMFAStatus();
    } catch (error) {
      console.error('MFA status error:', error);
      return { enabled: false };
    }
  }

  /**
   * Enhanced getCurrentUser with security validation
   */
  static async getCurrentUserSecure() {
    try {
      // Validate session first
      const isValidSession = await this.validateSession();
      if (!isValidSession) {
        throw new Error('Invalid session');
      }

      // Check if app is locked
      const isLocked = await this.isApplicationLocked();
      if (isLocked) {
        throw new Error('Application locked');
      }

      // Check if re-authentication is required
      const needsReauth = await this.isReauthenticationRequired();
      if (needsReauth) {
        throw new Error('Re-authentication required');
      }

      return await this.getCurrentUser();
    } catch (error) {
      console.error('Secure user fetch error:', error);
      throw error;
    }
  }

  /**
   * Monitor security threats
   */
  static async monitorThreats() {
    try {
      return await this.securityService.monitorThreats();
    } catch (error) {
      console.error('Threat monitoring error:', error);
      return [];
    }
  }

  /**
   * Get security dashboard data
   */
  static async getSecurityDashboard() {
    try {
      return await this.securityService.getSecurityDashboard();
    } catch (error) {
      console.error('Security dashboard error:', error);
      throw error;
    }
  }
}

export { AuthService };