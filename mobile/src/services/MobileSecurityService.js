/**
 * Mobile Security Service
 * Enterprise-grade security management for mobile application
 * Implements MFA, threat detection, biometric authentication, and security monitoring
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import * as Device from 'expo-device';
import * as Network from 'expo-network';
import { Platform } from 'react-native';

const API_BASE_URL = 'http://localhost:8000';

class MobileSecurityService {
  constructor() {
    this.securityConfig = {
      maxFailedAttempts: 5,
      lockoutDuration: 300000, // 5 minutes
      sessionTimeout: 1800000, // 30 minutes
      threatDetectionEnabled: true,
      biometricEnabled: false,
      mfaEnabled: false
    };
    
    this.threatDetector = new ThreatDetectionEngine();
    this.sessionManager = new SessionManager();
    this.biometricManager = new BiometricManager();
    this.mfaManager = new MFAManager();
  }

  // ==================== MFA MANAGEMENT ====================

  /**
   * Setup Multi-Factor Authentication
   */
  async setupMFA(method = 'totp', phoneNumber = null) {
    try {
      const token = await this.getAuthToken();
      const deviceInfo = await this.getDeviceInfo();

      const response = await fetch(`${API_BASE_URL}/security/mfa/setup`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method,
          phone_number: phoneNumber,
          device_info: deviceInfo
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to setup MFA');
      }

      const data = await response.json();
      
      // Store MFA configuration securely
      await SecureStore.setItemAsync('mfa_config', JSON.stringify({
        enabled: true,
        method,
        backup_codes: data.backup_codes,
        setup_date: new Date().toISOString()
      }));

      this.securityConfig.mfaEnabled = true;
      await this.logSecurityEvent('mfa_setup', 'success', { method });

      return {
        success: true,
        qr_code_url: data.qr_code_url,
        secret_key: data.secret_key,
        backup_codes: data.backup_codes
      };
    } catch (error) {
      await this.logSecurityEvent('mfa_setup', 'failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Verify MFA code
   */
  async verifyMFA(code, method = 'totp') {
    try {
      const token = await this.getAuthToken();

      const response = await fetch(`${API_BASE_URL}/security/mfa/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          method
        }),
      });

      if (!response.ok) {
        await this.logSecurityEvent('mfa_verification', 'failed', { method });
        throw new Error('Invalid MFA code');
      }

      const data = await response.json();
      await this.logSecurityEvent('mfa_verification', 'success', { method });
      
      return data.valid;
    } catch (error) {
      await this.logSecurityEvent('mfa_verification', 'failed', { 
        method, 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Get MFA status
   */
  async getMFAStatus() {
    try {
      const mfaConfig = await SecureStore.getItemAsync('mfa_config');
      if (!mfaConfig) {
        return { enabled: false };
      }

      const config = JSON.parse(mfaConfig);
      const token = await this.getAuthToken();

      const response = await fetch(`${API_BASE_URL}/security/mfa/config`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const serverConfig = await response.json();
        return {
          ...config,
          server_config: serverConfig
        };
      }

      return config;
    } catch (error) {
      console.error('Failed to get MFA status:', error);
      return { enabled: false };
    }
  }

  // ==================== BIOMETRIC AUTHENTICATION ====================

  /**
   * Setup biometric authentication
   */
  async setupBiometric() {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) {
        throw new Error('Biometric hardware not available');
      }

      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) {
        throw new Error('No biometric data enrolled');
      }

      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      
      // Store biometric configuration
      await SecureStore.setItemAsync('biometric_config', JSON.stringify({
        enabled: true,
        supported_types: supportedTypes,
        setup_date: new Date().toISOString()
      }));

      this.securityConfig.biometricEnabled = true;
      await this.logSecurityEvent('biometric_setup', 'success', { 
        supported_types: supportedTypes 
      });

      return {
        success: true,
        supported_types: supportedTypes
      };
    } catch (error) {
      await this.logSecurityEvent('biometric_setup', 'failed', { 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Authenticate with biometrics
   */
  async authenticateWithBiometric(promptMessage = 'Authenticate to continue') {
    try {
      const biometricConfig = await SecureStore.getItemAsync('biometric_config');
      if (!biometricConfig) {
        throw new Error('Biometric authentication not setup');
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        cancelLabel: 'Cancel',
        fallbackLabel: 'Use Password',
        disableDeviceFallback: false,
      });

      if (result.success) {
        await this.logSecurityEvent('biometric_auth', 'success');
        return true;
      } else {
        await this.logSecurityEvent('biometric_auth', 'failed', { 
          error: result.error 
        });
        return false;
      }
    } catch (error) {
      await this.logSecurityEvent('biometric_auth', 'failed', { 
        error: error.message 
      });
      throw error;
    }
  }

  // ==================== THREAT DETECTION ====================

  /**
   * Monitor for security threats
   */
  async monitorThreats() {
    try {
      const deviceInfo = await this.getDeviceInfo();
      const networkInfo = await this.getNetworkInfo();
      const appState = await this.getAppSecurityState();

      const threats = await this.threatDetector.analyze({
        device: deviceInfo,
        network: networkInfo,
        app: appState
      });

      if (threats.length > 0) {
        await this.handleThreats(threats);
      }

      return threats;
    } catch (error) {
      console.error('Threat monitoring failed:', error);
      return [];
    }
  }

  /**
   * Handle detected threats
   */
  async handleThreats(threats) {
    for (const threat of threats) {
      await this.logSecurityEvent('threat_detected', 'alert', {
        threat_type: threat.type,
        severity: threat.severity,
        details: threat.details
      });

      // Auto-mitigation based on threat level
      if (threat.severity === 'critical') {
        await this.lockApplication();
      } else if (threat.severity === 'high') {
        await this.requireReauthentication();
      }
    }
  }

  /**
   * Get real-time threat status
   */
  async getThreatStatus() {
    try {
      const token = await this.getAuthToken();

      const response = await fetch(`${API_BASE_URL}/security/threats`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get threat status');
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get threat status:', error);
      return { active_threats: 0, threat_level: 'low' };
    }
  }

  // ==================== SESSION MANAGEMENT ====================

  /**
   * Enhanced session management with security monitoring
   */
  async createSecureSession(token, user) {
    try {
      const sessionId = this.generateSessionId();
      const deviceInfo = await this.getDeviceInfo();
      const networkInfo = await this.getNetworkInfo();

      const sessionData = {
        id: sessionId,
        token,
        user,
        device: deviceInfo,
        network: networkInfo,
        created_at: new Date().toISOString(),
        last_activity: new Date().toISOString(),
        security_level: await this.calculateSecurityLevel()
      };

      await SecureStore.setItemAsync('secure_session', JSON.stringify(sessionData));
      await AsyncStorage.setItem('authToken', token);

      // Start session monitoring
      this.sessionManager.startMonitoring(sessionId);

      await this.logSecurityEvent('session_created', 'success', {
        session_id: sessionId,
        security_level: sessionData.security_level
      });

      return sessionData;
    } catch (error) {
      await this.logSecurityEvent('session_creation', 'failed', { 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Validate session security
   */
  async validateSession() {
    try {
      const sessionData = await SecureStore.getItemAsync('secure_session');
      if (!sessionData) {
        return false;
      }

      const session = JSON.parse(sessionData);
      const now = new Date();
      const lastActivity = new Date(session.last_activity);
      const timeDiff = now - lastActivity;

      // Check session timeout
      if (timeDiff > this.securityConfig.sessionTimeout) {
        await this.invalidateSession();
        return false;
      }

      // Check for security anomalies
      const currentDeviceInfo = await this.getDeviceInfo();
      if (!this.compareDeviceFingerprint(session.device, currentDeviceInfo)) {
        await this.logSecurityEvent('session_anomaly', 'alert', {
          type: 'device_mismatch'
        });
        await this.invalidateSession();
        return false;
      }

      // Update last activity
      session.last_activity = now.toISOString();
      await SecureStore.setItemAsync('secure_session', JSON.stringify(session));

      return true;
    } catch (error) {
      console.error('Session validation failed:', error);
      return false;
    }
  }

  /**
   * Invalidate session
   */
  async invalidateSession() {
    try {
      await SecureStore.deleteItemAsync('secure_session');
      await AsyncStorage.removeItem('authToken');
      this.sessionManager.stopMonitoring();
      
      await this.logSecurityEvent('session_invalidated', 'info');
    } catch (error) {
      console.error('Failed to invalidate session:', error);
    }
  }

  // ==================== SECURITY DASHBOARD ====================

  /**
   * Get comprehensive security dashboard data
   */
  async getSecurityDashboard() {
    try {
      const [
        mfaStatus,
        biometricStatus,
        threatStatus,
        sessionStatus,
        auditLogs
      ] = await Promise.all([
        this.getMFAStatus(),
        this.getBiometricStatus(),
        this.getThreatStatus(),
        this.getSessionStatus(),
        this.getRecentAuditLogs()
      ]);

      const securityScore = this.calculateSecurityScore({
        mfa: mfaStatus.enabled,
        biometric: biometricStatus.enabled,
        threats: threatStatus.active_threats,
        session: sessionStatus.valid
      });

      return {
        security_score: securityScore,
        mfa_status: mfaStatus,
        biometric_status: biometricStatus,
        threat_status: threatStatus,
        session_status: sessionStatus,
        recent_events: auditLogs,
        recommendations: this.getSecurityRecommendations(securityScore)
      };
    } catch (error) {
      console.error('Failed to get security dashboard:', error);
      throw error;
    }
  }

  /**
   * Get security recommendations
   */
  getSecurityRecommendations(securityScore) {
    const recommendations = [];

    if (securityScore < 70) {
      recommendations.push({
        type: 'critical',
        title: 'Enable Multi-Factor Authentication',
        description: 'Add an extra layer of security to your account',
        action: 'setup_mfa'
      });
    }

    if (!this.securityConfig.biometricEnabled) {
      recommendations.push({
        type: 'medium',
        title: 'Enable Biometric Authentication',
        description: 'Use fingerprint or face recognition for quick access',
        action: 'setup_biometric'
      });
    }

    if (securityScore < 50) {
      recommendations.push({
        type: 'high',
        title: 'Review Security Settings',
        description: 'Your account security needs immediate attention',
        action: 'review_security'
      });
    }

    return recommendations;
  }

  // ==================== UTILITY METHODS ====================

  async getDeviceInfo() {
    return {
      id: Device.deviceId || 'unknown',
      name: Device.deviceName || 'unknown',
      type: Device.deviceType || 'unknown',
      os: Platform.OS,
      os_version: Device.osVersion || 'unknown',
      brand: Device.brand || 'unknown',
      model: Device.modelName || 'unknown',
      fingerprint: await this.generateDeviceFingerprint()
    };
  }

  async getNetworkInfo() {
    try {
      const networkState = await Network.getNetworkStateAsync();
      return {
        type: networkState.type,
        is_connected: networkState.isConnected,
        is_internet_reachable: networkState.isInternetReachable
      };
    } catch (error) {
      return { type: 'unknown', is_connected: false };
    }
  }

  async generateDeviceFingerprint() {
    const deviceInfo = {
      id: Device.deviceId,
      name: Device.deviceName,
      type: Device.deviceType,
      os: Platform.OS,
      version: Device.osVersion
    };
    
    return btoa(JSON.stringify(deviceInfo));
  }

  compareDeviceFingerprint(stored, current) {
    return stored.fingerprint === current.fingerprint;
  }

  generateSessionId() {
    return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  async getAuthToken() {
    return await AsyncStorage.getItem('authToken');
  }

  async calculateSecurityLevel() {
    const factors = {
      mfa: this.securityConfig.mfaEnabled ? 30 : 0,
      biometric: this.securityConfig.biometricEnabled ? 25 : 0,
      device: 20, // Base device security
      network: 15, // Network security
      session: 10  // Session security
    };

    return Object.values(factors).reduce((sum, value) => sum + value, 0);
  }

  calculateSecurityScore(factors) {
    let score = 40; // Base score

    if (factors.mfa) score += 30;
    if (factors.biometric) score += 20;
    if (factors.threats === 0) score += 10;
    if (factors.session) score += 10;

    return Math.min(100, score);
  }

  async getBiometricStatus() {
    try {
      const config = await SecureStore.getItemAsync('biometric_config');
      return config ? JSON.parse(config) : { enabled: false };
    } catch (error) {
      return { enabled: false };
    }
  }

  async getSessionStatus() {
    try {
      const session = await SecureStore.getItemAsync('secure_session');
      return session ? { valid: true, ...JSON.parse(session) } : { valid: false };
    } catch (error) {
      return { valid: false };
    }
  }

  async getAppSecurityState() {
    return {
      version: '1.0.0',
      debug_mode: __DEV__,
      jailbroken: false, // Would implement jailbreak detection
      rooted: false      // Would implement root detection
    };
  }

  async getRecentAuditLogs() {
    try {
      const logs = await AsyncStorage.getItem('security_audit_logs');
      return logs ? JSON.parse(logs).slice(-10) : [];
    } catch (error) {
      return [];
    }
  }

  async logSecurityEvent(event_type, result, details = {}) {
    try {
      const logEntry = {
        id: Date.now(),
        event_type,
        result,
        details,
        timestamp: new Date().toISOString(),
        device_id: Device.deviceId || 'unknown'
      };

      // Store locally
      const existingLogs = await AsyncStorage.getItem('security_audit_logs');
      const logs = existingLogs ? JSON.parse(existingLogs) : [];
      logs.push(logEntry);
      
      // Keep only last 100 logs
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
      }
      
      await AsyncStorage.setItem('security_audit_logs', JSON.stringify(logs));

      // Send to server
      try {
        const token = await this.getAuthToken();
        if (token) {
          await fetch(`${API_BASE_URL}/security/audit/log`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(logEntry),
          });
        }
      } catch (serverError) {
        console.warn('Failed to send audit log to server:', serverError);
      }
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  async lockApplication() {
    await AsyncStorage.setItem('app_locked', 'true');
    await this.logSecurityEvent('app_locked', 'security_measure');
  }

  async unlockApplication() {
    await AsyncStorage.removeItem('app_locked');
    await this.logSecurityEvent('app_unlocked', 'user_action');
  }

  async isApplicationLocked() {
    const locked = await AsyncStorage.getItem('app_locked');
    return locked === 'true';
  }

  async requireReauthentication() {
    await AsyncStorage.setItem('reauth_required', 'true');
    await this.logSecurityEvent('reauth_required', 'security_measure');
  }

  async isReauthenticationRequired() {
    const required = await AsyncStorage.getItem('reauth_required');
    return required === 'true';
  }

  async clearReauthenticationFlag() {
    await AsyncStorage.removeItem('reauth_required');
  }
}

// ==================== THREAT DETECTION ENGINE ====================

class ThreatDetectionEngine {
  constructor() {
    this.rules = {
      jailbreak: { severity: 'critical', enabled: true },
      root: { severity: 'critical', enabled: true },
      debugger: { severity: 'high', enabled: true },
      emulator: { severity: 'medium', enabled: true },
      network_anomaly: { severity: 'medium', enabled: true }
    };
  }

  async analyze(context) {
    const threats = [];

    // Check for jailbreak/root
    if (this.rules.jailbreak.enabled && await this.detectJailbreak()) {
      threats.push({
        type: 'jailbreak',
        severity: 'critical',
        details: 'Device appears to be jailbroken/rooted'
      });
    }

    // Check for debugging
    if (this.rules.debugger.enabled && context.app.debug_mode) {
      threats.push({
        type: 'debug_mode',
        severity: 'high',
        details: 'Application running in debug mode'
      });
    }

    // Check network security
    if (this.rules.network_anomaly.enabled && !context.network.is_connected) {
      threats.push({
        type: 'network_disconnected',
        severity: 'low',
        details: 'Device not connected to network'
      });
    }

    return threats;
  }

  async detectJailbreak() {
    // Simplified jailbreak detection
    // In production, would use more sophisticated detection
    return false;
  }
}

// ==================== SESSION MANAGER ====================

class SessionManager {
  constructor() {
    this.monitoringInterval = null;
  }

  startMonitoring(sessionId) {
    this.stopMonitoring();
    
    this.monitoringInterval = setInterval(async () => {
      try {
        const session = await SecureStore.getItemAsync('secure_session');
        if (session) {
          const sessionData = JSON.parse(session);
          sessionData.last_activity = new Date().toISOString();
          await SecureStore.setItemAsync('secure_session', JSON.stringify(sessionData));
        }
      } catch (error) {
        console.error('Session monitoring error:', error);
      }
    }, 60000); // Update every minute
  }

  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }
}

// ==================== BIOMETRIC MANAGER ====================

class BiometricManager {
  async getSupportedTypes() {
    try {
      return await LocalAuthentication.supportedAuthenticationTypesAsync();
    } catch (error) {
      return [];
    }
  }

  async isAvailable() {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      return hasHardware && isEnrolled;
    } catch (error) {
      return false;
    }
  }
}

// ==================== MFA MANAGER ====================

class MFAManager {
  constructor() {
    this.totpWindow = 30; // 30 second window
  }

  generateBackupCodes(count = 10) {
    const codes = [];
    for (let i = 0; i < count; i++) {
      codes.push(this.generateRandomCode(8));
    }
    return codes;
  }

  generateRandomCode(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  validateTOTPCode(secret, code) {
    // In production, would use proper TOTP validation library
    return code.length === 6 && /^\d+$/.test(code);
  }
}

export default MobileSecurityService;