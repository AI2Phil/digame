import { useEffect, useState, useCallback } from 'react';

// Types for security hardening
export interface SecurityConfig {
  enableCSP: boolean;
  enableXSSProtection: boolean;
  enableClickjacking: boolean;
  enableHTTPS: boolean;
  enableHSTS: boolean;
  enableContentTypeNoSniff: boolean;
  enableReferrerPolicy: boolean;
  enablePermissionsPolicy: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
  passwordPolicy: PasswordPolicy;
  encryptionSettings: EncryptionSettings;
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  preventReuse: number;
  maxAge: number;
}

export interface EncryptionSettings {
  algorithm: string;
  keyLength: number;
  saltRounds: number;
  enableTwoFactor: boolean;
}

export interface SecurityThreat {
  id: string;
  type: 'xss' | 'csrf' | 'injection' | 'brute_force' | 'session_hijack' | 'data_breach';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  source: string;
  timestamp: number;
  blocked: boolean;
  details: any;
}

export interface SecurityMetrics {
  threatsBlocked: number;
  loginAttempts: number;
  failedLogins: number;
  sessionTimeouts: number;
  cspViolations: number;
  xssAttempts: number;
  csrfAttempts: number;
  lastSecurityScan: number;
  vulnerabilityCount: number;
}

// Content Security Policy Manager
export class CSPManager {
  private static instance: CSPManager;
  private cspDirectives: Map<string, string[]> = new Map();
  private violations: SecurityThreat[] = [];

  static getInstance(): CSPManager {
    if (!CSPManager.instance) {
      CSPManager.instance = new CSPManager();
    }
    return CSPManager.instance;
  }

  constructor() {
    this.initializeDefaultDirectives();
    this.setupViolationReporting();
  }

  private initializeDefaultDirectives(): void {
    this.cspDirectives.set('default-src', ["'self'"]);
    this.cspDirectives.set('script-src', ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net']);
    this.cspDirectives.set('style-src', ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com']);
    this.cspDirectives.set('img-src', ["'self'", 'data:', 'https:']);
    this.cspDirectives.set('font-src', ["'self'", 'https://fonts.gstatic.com']);
    this.cspDirectives.set('connect-src', ["'self'", 'https://api.example.com']);
    this.cspDirectives.set('frame-ancestors', ["'none'"]);
    this.cspDirectives.set('base-uri', ["'self'"]);
    this.cspDirectives.set('object-src', ["'none'"]);
  }

  private setupViolationReporting(): void {
    if (typeof window === 'undefined') return;

    document.addEventListener('securitypolicyviolation', (event) => {
      const violation: SecurityThreat = {
        id: this.generateId(),
        type: 'xss',
        severity: 'high',
        description: `CSP violation: ${event.violatedDirective}`,
        source: event.sourceFile || 'unknown',
        timestamp: Date.now(),
        blocked: true,
        details: {
          directive: event.violatedDirective,
          blockedURI: event.blockedURI,
          lineNumber: event.lineNumber,
          columnNumber: event.columnNumber
        }
      };

      this.violations.push(violation);
      this.reportViolation(violation);
    });
  }

  addDirective(directive: string, sources: string[]): void {
    this.cspDirectives.set(directive, sources);
    this.updateCSPHeader();
  }

  removeDirective(directive: string): void {
    this.cspDirectives.delete(directive);
    this.updateCSPHeader();
  }

  private updateCSPHeader(): void {
    if (typeof document === 'undefined') return;

    const cspString = Array.from(this.cspDirectives.entries())
      .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
      .join('; ');

    // Update meta tag
    let cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (!cspMeta) {
      cspMeta = document.createElement('meta');
      cspMeta.setAttribute('http-equiv', 'Content-Security-Policy');
      document.head.appendChild(cspMeta);
    }
    cspMeta.setAttribute('content', cspString);
  }

  private reportViolation(violation: SecurityThreat): void {
    // Report to security monitoring service
    console.warn('CSP Violation:', violation);
    
    // In production, send to security monitoring endpoint
    if (process.env.NODE_ENV === 'production') {
      fetch('/api/security/violations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(violation)
      }).catch(console.error);
    }
  }

  getViolations(): SecurityThreat[] {
    return [...this.violations];
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// XSS Protection Manager
export class XSSProtection {
  private static sanitizationRules: Map<string, RegExp> = new Map([
    ['script', /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi],
    ['iframe', /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi],
    ['object', /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi],
    ['embed', /<embed\b[^<]*>/gi],
    ['link', /<link\b[^<]*>/gi],
    ['meta', /<meta\b[^<]*>/gi],
    ['javascript', /javascript:/gi],
    ['vbscript', /vbscript:/gi],
    ['onload', /onload\s*=/gi],
    ['onerror', /onerror\s*=/gi],
    ['onclick', /onclick\s*=/gi]
  ]);

  static sanitizeInput(input: string): string {
    let sanitized = input;
    
    this.sanitizationRules.forEach((regex, rule) => {
      sanitized = sanitized.replace(regex, '');
    });

    return sanitized;
  }

  static validateInput(input: string): { isValid: boolean; threats: string[] } {
    const threats: string[] = [];
    
    this.sanitizationRules.forEach((regex, rule) => {
      if (regex.test(input)) {
        threats.push(rule);
      }
    });

    return {
      isValid: threats.length === 0,
      threats
    };
  }

  static escapeHTML(input: string): string {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
  }

  static createSafeHTML(html: string): string {
    // Use DOMPurify in production
    return this.sanitizeInput(html);
  }
}

// Authentication Security Manager
export class AuthenticationSecurity {
  private static instance: AuthenticationSecurity;
  private loginAttempts: Map<string, number> = new Map();
  private blockedIPs: Set<string> = new Set();
  private activeSessions: Map<string, any> = new Map();

  static getInstance(): AuthenticationSecurity {
    if (!AuthenticationSecurity.instance) {
      AuthenticationSecurity.instance = new AuthenticationSecurity();
    }
    return AuthenticationSecurity.instance;
  }

  validatePassword(password: string, policy: PasswordPolicy): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < policy.minLength) {
      errors.push(`Password must be at least ${policy.minLength} characters long`);
    }

    if (policy.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (policy.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (policy.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (policy.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  recordLoginAttempt(identifier: string, success: boolean): boolean {
    const attempts = this.loginAttempts.get(identifier) || 0;
    
    if (success) {
      this.loginAttempts.delete(identifier);
      return true;
    }

    const newAttempts = attempts + 1;
    this.loginAttempts.set(identifier, newAttempts);

    if (newAttempts >= 5) { // Max attempts
      this.blockedIPs.add(identifier);
      setTimeout(() => {
        this.blockedIPs.delete(identifier);
        this.loginAttempts.delete(identifier);
      }, 15 * 60 * 1000); // 15 minutes
      return false;
    }

    return true;
  }

  isBlocked(identifier: string): boolean {
    return this.blockedIPs.has(identifier);
  }

  createSecureSession(userId: string, metadata: any): string {
    const sessionId = this.generateSecureToken();
    const session = {
      userId,
      createdAt: Date.now(),
      lastActivity: Date.now(),
      metadata,
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent
    };

    this.activeSessions.set(sessionId, session);
    
    // Set session timeout
    setTimeout(() => {
      this.activeSessions.delete(sessionId);
    }, 24 * 60 * 60 * 1000); // 24 hours

    return sessionId;
  }

  validateSession(sessionId: string): boolean {
    const session = this.activeSessions.get(sessionId);
    if (!session) return false;

    // Check session timeout (30 minutes of inactivity)
    if (Date.now() - session.lastActivity > 30 * 60 * 1000) {
      this.activeSessions.delete(sessionId);
      return false;
    }

    // Update last activity
    session.lastActivity = Date.now();
    return true;
  }

  private generateSecureToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
}

// Security Monitoring Hook
export const useSecurityMonitoring = () => {
  const [threats, setThreats] = useState<SecurityThreat[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    threatsBlocked: 0,
    loginAttempts: 0,
    failedLogins: 0,
    sessionTimeouts: 0,
    cspViolations: 0,
    xssAttempts: 0,
    csrfAttempts: 0,
    lastSecurityScan: Date.now(),
    vulnerabilityCount: 0
  });

  const cspManager = CSPManager.getInstance();
  const authSecurity = AuthenticationSecurity.getInstance();

  const scanForThreats = useCallback(async () => {
    try {
      // Get CSP violations
      const violations = cspManager.getViolations();
      setThreats(violations);

      // Update metrics
      setMetrics(prev => ({
        ...prev,
        cspViolations: violations.length,
        threatsBlocked: violations.filter(v => v.blocked).length,
        lastSecurityScan: Date.now()
      }));

    } catch (error) {
      console.error('Security scan failed:', error);
    }
  }, [cspManager]);

  const reportThreat = useCallback((threat: SecurityThreat) => {
    setThreats(prev => [...prev, threat]);
    setMetrics(prev => ({
      ...prev,
      threatsBlocked: prev.threatsBlocked + (threat.blocked ? 1 : 0)
    }));
  }, []);

  useEffect(() => {
    // Initial scan
    scanForThreats();

    // Set up periodic scanning
    const interval = setInterval(scanForThreats, 60000); // Every minute

    return () => clearInterval(interval);
  }, [scanForThreats]);

  return {
    threats,
    metrics,
    scanForThreats,
    reportThreat
  };
};

// Security Headers Manager
export class SecurityHeaders {
  static setSecurityHeaders(): void {
    if (typeof document === 'undefined') return;

    // X-Content-Type-Options
    this.setMetaHeader('X-Content-Type-Options', 'nosniff');

    // X-Frame-Options
    this.setMetaHeader('X-Frame-Options', 'DENY');

    // X-XSS-Protection
    this.setMetaHeader('X-XSS-Protection', '1; mode=block');

    // Referrer Policy
    this.setMetaHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Permissions Policy
    this.setMetaHeader('Permissions-Policy', 
      'camera=(), microphone=(), geolocation=(), payment=()');

    // Strict-Transport-Security (HSTS)
    if (location.protocol === 'https:') {
      this.setMetaHeader('Strict-Transport-Security', 
        'max-age=31536000; includeSubDomains; preload');
    }
  }

  private static setMetaHeader(name: string, content: string): void {
    let meta = document.querySelector(`meta[http-equiv="${name}"]`);
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('http-equiv', name);
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
  }
}

// Token Security Manager
export class TokenSecurity {
  private static readonly TOKEN_PREFIX = 'digame_';
  private static readonly ENCRYPTION_KEY = 'your-encryption-key'; // Should be from env

  static encryptToken(token: string): string {
    // In production, use proper encryption library
    return btoa(this.TOKEN_PREFIX + token);
  }

  static decryptToken(encryptedToken: string): string | null {
    try {
      const decoded = atob(encryptedToken);
      if (decoded.startsWith(this.TOKEN_PREFIX)) {
        return decoded.substring(this.TOKEN_PREFIX.length);
      }
      return null;
    } catch {
      return null;
    }
  }

  static isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  static secureStorage = {
    setItem: (key: string, value: string): void => {
      if (typeof window === 'undefined') return;
      const encrypted = TokenSecurity.encryptToken(value);
      localStorage.setItem(key, encrypted);
    },

    getItem: (key: string): string | null => {
      if (typeof window === 'undefined') return null;
      const encrypted = localStorage.getItem(key);
      return encrypted ? TokenSecurity.decryptToken(encrypted) : null;
    },

    removeItem: (key: string): void => {
      if (typeof window === 'undefined') return;
      localStorage.removeItem(key);
    }
  };
}

// Initialize security measures
export const initializeSecurity = (config: Partial<SecurityConfig> = {}) => {
  const defaultConfig: SecurityConfig = {
    enableCSP: true,
    enableXSSProtection: true,
    enableClickjacking: true,
    enableHTTPS: true,
    enableHSTS: true,
    enableContentTypeNoSniff: true,
    enableReferrerPolicy: true,
    enablePermissionsPolicy: true,
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
    maxLoginAttempts: 5,
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      preventReuse: 5,
      maxAge: 90 * 24 * 60 * 60 * 1000 // 90 days
    },
    encryptionSettings: {
      algorithm: 'AES-256-GCM',
      keyLength: 256,
      saltRounds: 12,
      enableTwoFactor: true
    }
  };

  const finalConfig = { ...defaultConfig, ...config };

  if (finalConfig.enableCSP) {
    CSPManager.getInstance();
  }

  if (finalConfig.enableXSSProtection || 
      finalConfig.enableClickjacking || 
      finalConfig.enableContentTypeNoSniff) {
    SecurityHeaders.setSecurityHeaders();
  }

  return finalConfig;
};

// Export instances
export const cspManager = CSPManager.getInstance();
export const authSecurity = AuthenticationSecurity.getInstance();

export default {
  CSPManager,
  XSSProtection,
  AuthenticationSecurity,
  SecurityHeaders,
  TokenSecurity,
  useSecurityMonitoring,
  initializeSecurity,
  cspManager,
  authSecurity
};