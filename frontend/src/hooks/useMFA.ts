/**
 * MFA (Multi-Factor Authentication) React Hooks
 * Custom hooks for MFA operations and security management
 */

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mfaApi, MFADevice, MFAStatus, SecurityMetrics, ThreatDetection, SecurityIncident } from '../services/api/mfa';

// ===== MFA DEVICE HOOKS =====

/**
 * Hook to get all MFA devices for the current user
 */
export const useMFADevices = () => {
  return useQuery({
    queryKey: ['mfa', 'devices'],
    queryFn: () => mfaApi.getMFADevices(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook to get MFA status for the current user
 */
export const useMFAStatus = () => {
  return useQuery({
    queryKey: ['mfa', 'status'],
    queryFn: () => mfaApi.getMFAStatus(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true,
  });
};

/**
 * Hook to create a new MFA device
 */
export const useCreateMFADevice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: mfaApi.createMFADevice,
    onSuccess: () => {
      // Invalidate and refetch MFA-related queries
      queryClient.invalidateQueries({ queryKey: ['mfa'] });
    },
  });
};

/**
 * Hook to verify an MFA device
 */
export const useVerifyMFADevice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ deviceId, code }: { deviceId: number; code: string }) =>
      mfaApi.verifyMFADevice(deviceId, code),
    onSuccess: () => {
      // Invalidate and refetch MFA-related queries
      queryClient.invalidateQueries({ queryKey: ['mfa'] });
    },
  });
};

/**
 * Hook to verify an MFA code during authentication
 */
export const useVerifyMFACode = () => {
  return useMutation({
    mutationFn: ({ deviceId, code }: { deviceId: number; code: string }) =>
      mfaApi.verifyMFACode(deviceId, code),
  });
};

/**
 * Hook to delete an MFA device
 */
export const useDeleteMFADevice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (deviceId: number) => mfaApi.deleteMFADevice(deviceId),
    onSuccess: () => {
      // Invalidate and refetch MFA-related queries
      queryClient.invalidateQueries({ queryKey: ['mfa'] });
    },
  });
};

/**
 * Hook to generate new backup codes
 */
export const useGenerateBackupCodes = () => {
  return useMutation({
    mutationFn: () => mfaApi.generateBackupCodes(),
  });
};

/**
 * Hook to disable MFA
 */
export const useDisableMFA = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => mfaApi.disableMFA(),
    onSuccess: () => {
      // Invalidate and refetch MFA-related queries
      queryClient.invalidateQueries({ queryKey: ['mfa'] });
    },
  });
};

// ===== IP RESTRICTION HOOKS =====

/**
 * Hook to get IP restrictions
 */
export const useIPRestrictions = () => {
  return useQuery({
    queryKey: ['mfa', 'ip-restrictions'],
    queryFn: () => mfaApi.getIPRestrictions(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to create an IP restriction
 */
export const useCreateIPRestriction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: mfaApi.createIPRestriction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mfa', 'ip-restrictions'] });
      queryClient.invalidateQueries({ queryKey: ['mfa', 'status'] });
    },
  });
};

/**
 * Hook to delete an IP restriction
 */
export const useDeleteIPRestriction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (restrictionId: number) => mfaApi.deleteIPRestriction(restrictionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mfa', 'ip-restrictions'] });
      queryClient.invalidateQueries({ queryKey: ['mfa', 'status'] });
    },
  });
};

/**
 * Hook to validate IP access
 */
export const useValidateIPAccess = () => {
  return useMutation({
    mutationFn: () => mfaApi.validateIPAccess(),
  });
};

// ===== SECURITY DASHBOARD HOOKS =====

/**
 * Hook to get security metrics
 */
export const useSecurityMetrics = () => {
  return useQuery({
    queryKey: ['security', 'metrics'],
    queryFn: () => mfaApi.getSecurityMetrics(),
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
  });
};

/**
 * Hook to get threat detections
 */
export const useThreatDetections = (params: { limit?: number; status?: string } = {}) => {
  return useQuery({
    queryKey: ['security', 'threats', params],
    queryFn: () => mfaApi.getThreatDetections(params),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
};

/**
 * Hook to get security incidents
 */
export const useSecurityIncidents = (params: { limit?: number; severity?: string } = {}) => {
  return useQuery({
    queryKey: ['security', 'incidents', params],
    queryFn: () => mfaApi.getSecurityIncidents(params),
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
  });
};

/**
 * Hook to get threat metrics
 */
export const useThreatMetrics = () => {
  return useQuery({
    queryKey: ['security', 'threat-metrics'],
    queryFn: () => mfaApi.getThreatMetrics(),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
};

/**
 * Hook to take action on a threat
 */
export const useThreatAction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ threatId, action }: {
      threatId: number;
      action: {
        action_type: 'block' | 'investigate' | 'ignore' | 'escalate';
        notes?: string;
      };
    }) => mfaApi.takeThreatAction(threatId, action),
    onSuccess: () => {
      // Invalidate threat-related queries
      queryClient.invalidateQueries({ queryKey: ['security', 'threats'] });
      queryClient.invalidateQueries({ queryKey: ['security', 'threat-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['security', 'metrics'] });
    },
  });
};

// ===== COMPOSITE HOOKS =====

/**
 * Comprehensive MFA management hook
 */
export const useMFAManagement = () => {
  const [currentStep, setCurrentStep] = useState<'overview' | 'setup' | 'verify' | 'backup' | 'manage'>('overview');
  const [selectedMethod, setSelectedMethod] = useState<'totp' | 'sms' | 'email'>('totp');
  const [setupData, setSetupData] = useState<any>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const mfaStatus = useMFAStatus();
  const mfaDevices = useMFADevices();
  const createDevice = useCreateMFADevice();
  const verifyDevice = useVerifyMFADevice();
  const deleteDevice = useDeleteMFADevice();
  const generateBackup = useGenerateBackupCodes();
  const disableMFA = useDisableMFA();

  const handleSetupMFA = useCallback(async () => {
    try {
      const result = await createDevice.mutateAsync({
        device_type: selectedMethod,
        device_name: deviceName || `${selectedMethod.toUpperCase()} Device`,
        phone_number: selectedMethod === 'sms' ? phoneNumber : undefined,
      });
      setSetupData(result);
      setCurrentStep('verify');
    } catch (error) {
      console.error('MFA setup failed:', error);
      throw error;
    }
  }, [createDevice, selectedMethod, deviceName, phoneNumber]);

  const handleVerifyMFA = useCallback(async () => {
    if (!setupData?.device_id || !verificationCode) {
      throw new Error('Missing device ID or verification code');
    }

    try {
      await verifyDevice.mutateAsync({
        deviceId: setupData.device_id,
        code: verificationCode,
      });
      setCurrentStep('backup');
    } catch (error) {
      console.error('MFA verification failed:', error);
      throw error;
    }
  }, [verifyDevice, setupData, verificationCode]);

  const handleComplete = useCallback(() => {
    setCurrentStep('manage');
    // Reset form state
    setSetupData(null);
    setVerificationCode('');
    setDeviceName('');
    setPhoneNumber('');
  }, []);

  return {
    // State
    currentStep,
    selectedMethod,
    setupData,
    verificationCode,
    deviceName,
    phoneNumber,
    
    // Setters
    setCurrentStep,
    setSelectedMethod,
    setVerificationCode,
    setDeviceName,
    setPhoneNumber,
    
    // Data
    mfaStatus: mfaStatus.data,
    mfaDevices: mfaDevices.data,
    
    // Actions
    handleSetupMFA,
    handleVerifyMFA,
    handleComplete,
    deleteDevice: deleteDevice.mutateAsync,
    generateBackup: generateBackup.mutateAsync,
    disableMFA: disableMFA.mutateAsync,
    
    // Loading states
    isLoading: mfaStatus.isLoading || mfaDevices.isLoading,
    isSetupLoading: createDevice.isPending,
    isVerifyLoading: verifyDevice.isPending,
    isDeleteLoading: deleteDevice.isPending,
    
    // Error states
    error: mfaStatus.error || mfaDevices.error,
    setupError: createDevice.error,
    verifyError: verifyDevice.error,
  };
};

/**
 * Security dashboard management hook
 */
export const useSecurityDashboard = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'threats' | 'incidents' | 'audit'>('overview');
  const [refreshInterval, setRefreshInterval] = useState(60000); // 1 minute default

  const securityMetrics = useSecurityMetrics();
  const threatDetections = useThreatDetections({ limit: 10 });
  const securityIncidents = useSecurityIncidents({ limit: 10 });
  const threatMetrics = useThreatMetrics();
  const threatAction = useThreatAction();

  const handleThreatAction = useCallback(async (
    threatId: number,
    actionType: 'block' | 'investigate' | 'ignore' | 'escalate',
    notes?: string
  ) => {
    try {
      await threatAction.mutateAsync({
        threatId,
        action: { action_type: actionType, notes },
      });
    } catch (error) {
      console.error('Threat action failed:', error);
      throw error;
    }
  }, [threatAction]);

  return {
    // State
    activeTab,
    refreshInterval,
    
    // Setters
    setActiveTab,
    setRefreshInterval,
    
    // Data
    securityMetrics: securityMetrics.data,
    threatDetections: threatDetections.data,
    securityIncidents: securityIncidents.data,
    threatMetrics: threatMetrics.data,
    
    // Actions
    handleThreatAction,
    
    // Loading states
    isLoading: securityMetrics.isLoading || threatDetections.isLoading || securityIncidents.isLoading,
    isThreatActionLoading: threatAction.isPending,
    
    // Error states
    error: securityMetrics.error || threatDetections.error || securityIncidents.error,
    threatActionError: threatAction.error,
  };
};

export default {
  useMFADevices,
  useMFAStatus,
  useCreateMFADevice,
  useVerifyMFADevice,
  useVerifyMFACode,
  useDeleteMFADevice,
  useGenerateBackupCodes,
  useDisableMFA,
  useIPRestrictions,
  useCreateIPRestriction,
  useDeleteIPRestriction,
  useValidateIPAccess,
  useSecurityMetrics,
  useThreatDetections,
  useSecurityIncidents,
  useThreatMetrics,
  useThreatAction,
  useMFAManagement,
  useSecurityDashboard,
};