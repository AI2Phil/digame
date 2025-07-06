/**
 * MFA (Multi-Factor Authentication) API Service
 * Comprehensive API client for MFA operations and security management
 */

import { apiHelpers } from './client';

// ===== INTERFACES =====

export interface MFADevice {
  id: number;
  device_type: 'totp' | 'sms' | 'email';
  device_name: string;
  is_active: boolean;
  is_verified: boolean;
  use_count: number;
  last_used?: string;
  created_at: string;
}

export interface MFASetupResponse {
  device_id: number;
  qr_code_url?: string;
  secret_key?: string;
  backup_codes: string[];
}

export interface MFAVerifyResponse {
  success: boolean;
  message: string;
  backup_codes?: string[];
}

export interface MFAStatus {
  mfa_enabled: boolean;
  device_count: number;
  devices: Array<{
    id: number;
    type: string;
    name: string;
    last_used?: string;
  }>;
  ip_restrictions_enabled: boolean;
  ip_restriction_count: number;
  security_level: 'basic' | 'medium' | 'high';
}

export interface IPRestriction {
  id: number;
  ip_address: string;
  description?: string;
  is_active: boolean;
  use_count: number;
  last_used?: string;
  created_at: string;
}

export interface SecurityMetrics {
  total_users_with_mfa: number;
  mfa_adoption_rate: number;
  active_threats: number;
  resolved_threats_today: number;
  open_incidents: number;
  critical_incidents: number;
  failed_login_attempts_today: number;
  security_score: number;
}

export interface ThreatDetection {
  id: number;
  detection_type: string;
  threat_level: 'low' | 'medium' | 'high' | 'critical';
  source_ip: string;
  description: string;
  detected_at: string;
  status: string;
}

export interface SecurityIncident {
  id: number;
  incident_id: string;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: string;
  created_at: string;
}

// ===== REQUEST TYPES =====

export interface MFADeviceCreateRequest {
  device_type: 'totp' | 'sms' | 'email';
  device_name: string;
  phone_number?: string;
}

export interface MFAVerifyRequest {
  device_id: number;
  code: string;
}

export interface IPRestrictionCreateRequest {
  ip_address: string;
  description?: string;
}

// ===== MFA API CLIENT =====

class MFAApi {
  private baseUrl = '/mfa';

  // ===== MFA DEVICE MANAGEMENT =====

  /**
   * Get all MFA devices for the current user
   */
  async getMFADevices(): Promise<MFADevice[]> {
    return await apiHelpers.get<MFADevice[]>(`${this.baseUrl}/devices`);
  }

  /**
   * Create a new MFA device
   */
  async createMFADevice(deviceData: MFADeviceCreateRequest): Promise<MFASetupResponse> {
    return await apiHelpers.post<MFASetupResponse>(`${this.baseUrl}/devices`, deviceData);
  }

  /**
   * Verify and activate an MFA device
   */
  async verifyMFADevice(deviceId: number, code: string): Promise<MFAVerifyResponse> {
    return await apiHelpers.post<MFAVerifyResponse>(
      `${this.baseUrl}/devices/${deviceId}/verify`,
      { device_id: deviceId, code }
    );
  }

  /**
   * Verify an MFA code during authentication
   */
  async verifyMFACode(deviceId: number, code: string): Promise<MFAVerifyResponse> {
    return await apiHelpers.post<MFAVerifyResponse>(
      `${this.baseUrl}/verify`,
      { device_id: deviceId, code }
    );
  }

  /**
   * Delete an MFA device
   */
  async deleteMFADevice(deviceId: number): Promise<{ message: string }> {
    return await apiHelpers.delete<{ message: string }>(`${this.baseUrl}/devices/${deviceId}`);
  }

  /**
   * Generate new backup codes
   */
  async generateBackupCodes(): Promise<{ backup_codes: string[] }> {
    return await apiHelpers.post<{ backup_codes: string[] }>(`${this.baseUrl}/backup-codes`);
  }

  /**
   * Get MFA status for the current user
   */
  async getMFAStatus(): Promise<MFAStatus> {
    return await apiHelpers.get<MFAStatus>(`${this.baseUrl}/status`);
  }

  /**
   * Disable MFA for the current user (removes all devices)
   */
  async disableMFA(): Promise<{ message: string; devices_removed: number }> {
    return await apiHelpers.post<{ message: string; devices_removed: number }>(`${this.baseUrl}/disable`);
  }

  // ===== IP RESTRICTION MANAGEMENT =====

  /**
   * Get all IP restrictions for the current user
   */
  async getIPRestrictions(): Promise<IPRestriction[]> {
    return await apiHelpers.get<IPRestriction[]>(`${this.baseUrl}/ip-restrictions`);
  }

  /**
   * Add a new IP restriction
   */
  async createIPRestriction(restrictionData: IPRestrictionCreateRequest): Promise<IPRestriction> {
    return await apiHelpers.post<IPRestriction>(`${this.baseUrl}/ip-restrictions`, restrictionData);
  }

  /**
   * Remove an IP restriction
   */
  async deleteIPRestriction(restrictionId: number): Promise<{ message: string }> {
    return await apiHelpers.delete<{ message: string }>(`${this.baseUrl}/ip-restrictions/${restrictionId}`);
  }

  /**
   * Validate if current IP is allowed for the user
   */
  async validateIPAccess(): Promise<{
    ip_address: string;
    is_allowed: boolean;
    message: string;
  }> {
    return await apiHelpers.post<{
      ip_address: string;
      is_allowed: boolean;
      message: string;
    }>(`${this.baseUrl}/ip-restrictions/validate`);
  }

  // ===== SECURITY DASHBOARD =====

  /**
   * Get security dashboard metrics
   */
  async getSecurityMetrics(): Promise<SecurityMetrics> {
    return await apiHelpers.get<SecurityMetrics>('/api/security/dashboard');
  }

  /**
   * Get threat detections
   */
  async getThreatDetections(params: {
    limit?: number;
    status?: string;
  } = {}): Promise<ThreatDetection[]> {
    return await apiHelpers.get<ThreatDetection[]>('/api/security/threats', params);
  }

  /**
   * Get security incidents
   */
  async getSecurityIncidents(params: {
    limit?: number;
    severity?: string;
  } = {}): Promise<SecurityIncident[]> {
    return await apiHelpers.get<SecurityIncident[]>('/api/security/incidents', params);
  }

  /**
   * Get threat metrics for monitoring dashboard
   */
  async getThreatMetrics(): Promise<{
    total_threats: number;
    active_threats: number;
    resolved_today: number;
    threat_levels: Record<string, number>;
  }> {
    return await apiHelpers.get<{
      total_threats: number;
      active_threats: number;
      resolved_today: number;
      threat_levels: Record<string, number>;
    }>('/api/security/threat-metrics');
  }

  /**
   * Take action on a threat
   */
  async takeThreatAction(threatId: number, action: {
    action_type: 'block' | 'investigate' | 'ignore' | 'escalate';
    notes?: string;
  }): Promise<{ message: string; success: boolean }> {
    return await apiHelpers.post<{ message: string; success: boolean }>(
      `/api/security/threats/${threatId}/action`,
      action
    );
  }

  // ===== HEALTH CHECK =====

  /**
   * Check MFA service health
   */
  async getHealthStatus(): Promise<{
    status: string;
    service: string;
    timestamp: string;
    features: string[];
  }> {
    return await apiHelpers.get<{
      status: string;
      service: string;
      timestamp: string;
      features: string[];
    }>(`${this.baseUrl}/health`);
  }
}

// ===== EXPORT =====

export const mfaApi = new MFAApi();
export default mfaApi;