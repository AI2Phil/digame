import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { 
  Shield, Smartphone, Mail, Key, Copy, Download, 
  CheckCircle, AlertCircle, QrCode, RefreshCw,
  Eye, EyeOff, Clock, Users, Settings
} from 'lucide-react';

interface MFAMethod {
  id: string;
  type: 'totp' | 'sms' | 'email' | 'backup_codes';
  name: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
  primary: boolean;
  last_used?: string;
  created_at?: string;
}

interface MFASetupData {
  qr_code_url?: string;
  secret_key?: string;
  backup_codes: string[];
  recovery_email?: string;
  phone_number?: string;
}

interface MFAStats {
  total_users: number;
  mfa_enabled_users: number;
  adoption_rate: number;
  method_distribution: Record<string, number>;
}

export const EnhancedMFASetup: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<'overview' | 'setup' | 'verify' | 'backup' | 'manage'>('overview');
  const [selectedMethod, setSelectedMethod] = useState<'totp' | 'sms' | 'email'>('totp');
  const [setupData, setSetupData] = useState<MFASetupData | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState<Set<number>>(new Set());
  const [mfaMethods, setMfaMethods] = useState<MFAMethod[]>([]);
  const [mfaStats, setMfaStats] = useState<MFAStats | null>(null);

  useEffect(() => {
    fetchMFAStatus();
    fetchMFAStats();
  }, []);

  const fetchMFAStatus = async () => {
    try {
      const response = await fetch('/api/security/mfa/status', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMfaMethods(data.methods || []);
        
        // If user has MFA enabled, show management view
        if (data.methods?.some((m: MFAMethod) => m.enabled)) {
          setCurrentStep('manage');
        }
      }
    } catch (err) {
      console.error('Failed to fetch MFA status:', err);
    }
  };

  const fetchMFAStats = async () => {
    try {
      const response = await fetch('/api/security/mfa/stats', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMfaStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch MFA stats:', err);
    }
  };

  const handleSetupMFA = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/security/mfa/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          method: selectedMethod,
          phone_number: phoneNumber || null,
          recovery_email: recoveryEmail || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to set up MFA');
      }

      const data = await response.json();
      setSetupData(data);
      setCurrentStep('verify');
      setSuccess('MFA setup initiated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyMFA = async () => {
    if (!verificationCode.trim()) {
      setError('Please enter a verification code');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/security/mfa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          code: verificationCode,
          method: selectedMethod,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Invalid verification code');
      }

      setCurrentStep('backup');
      setSuccess('MFA verified successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDisableMFA = async (methodId: string) => {
    try {
      const response = await fetch(`/api/security/mfa/disable/${methodId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        await fetchMFAStatus();
        setSuccess('MFA method disabled successfully');
      }
    } catch (err) {
      setError('Failed to disable MFA method');
    }
  };

  const copyToClipboard = (text: string, index?: number) => {
    navigator.clipboard.writeText(text);
    if (index !== undefined) {
      setCopiedCodes(prev => new Set(Array.from(prev).concat([index])));
      setTimeout(() => {
        setCopiedCodes(prev => {
          const newSet = new Set(prev);
          newSet.delete(index);
          return newSet;
        });
      }, 2000);
    }
    setSuccess('Copied to clipboard');
  };

  const downloadBackupCodes = () => {
    if (!setupData?.backup_codes) return;
    
    const content = setupData.backup_codes.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mfa-backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Multi-Factor Authentication
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Why Enable MFA?</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Protect against password breaches
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Prevent unauthorized access
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Meet security compliance requirements
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Secure sensitive data and operations
                </li>
              </ul>
            </div>

            {mfaStats && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Organization Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">MFA Adoption Rate</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${mfaStats.adoption_rate}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{mfaStats.adoption_rate}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Users with MFA</span>
                    <span className="font-medium">{mfaStats.mfa_enabled_users} / {mfaStats.total_users}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 pt-6 border-t">
            <h3 className="font-semibold text-gray-900 mb-4">Available Methods</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  type: 'totp',
                  name: 'Authenticator App',
                  description: 'Use Google Authenticator, Authy, or similar apps',
                  icon: <Smartphone className="h-5 w-5" />,
                  recommended: true
                },
                {
                  type: 'sms',
                  name: 'SMS Verification',
                  description: 'Receive codes via text message',
                  icon: <Mail className="h-5 w-5" />
                },
                {
                  type: 'email',
                  name: 'Email Verification',
                  description: 'Receive codes via email',
                  icon: <Mail className="h-5 w-5" />
                }
              ].map((method) => (
                <Card key={method.type} className="relative">
                  <CardContent className="p-4">
                    {method.recommended && (
                      <Badge 
                        variant="success" 
                        size="xs" 
                        className="absolute -top-2 -right-2"
                        icon={null}
                        onRemove={() => {}}
                      >
                        Recommended
                      </Badge>
                    )}
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        {method.icon}
                      </div>
                      <h4 className="font-medium text-gray-900">{method.name}</h4>
                    </div>
                    <p className="text-sm text-gray-600">{method.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <Button onClick={() => setCurrentStep('setup')} className="px-8">
              <Shield className="mr-2 h-4 w-4" />
              Set Up MFA
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSetup = () => (
    <Card>
      <CardHeader>
        <CardTitle>Choose MFA Method</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { value: 'totp', label: 'Authenticator App', icon: <Smartphone className="h-5 w-5" /> },
            { value: 'sms', label: 'SMS', icon: <Mail className="h-5 w-5" /> },
            { value: 'email', label: 'Email', icon: <Mail className="h-5 w-5" /> },
          ].map((method) => (
            <button
              key={method.value}
              onClick={() => setSelectedMethod(method.value as typeof selectedMethod)}
              className={`p-4 border-2 rounded-lg transition-all ${
                selectedMethod === method.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                {method.icon}
                <span className="font-medium">{method.label}</span>
              </div>
            </button>
          ))}
        </div>

        {selectedMethod === 'sms' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Recovery Email (Optional)
          </label>
          <input
            type="email"
            placeholder="recovery@example.com"
            value={recoveryEmail}
            onChange={(e) => setRecoveryEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            Used for account recovery if you lose access to your primary MFA method
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setCurrentStep('overview')}>
            Back
          </Button>
          <Button onClick={handleSetupMFA} disabled={loading}>
            {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Key className="mr-2 h-4 w-4" />}
            {loading ? 'Setting up...' : 'Continue Setup'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderVerify = () => (
    <Card>
      <CardHeader>
        <CardTitle>Verify Your Setup</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {selectedMethod === 'totp' && setupData?.qr_code_url && (
          <div className="text-center">
            <h3 className="font-medium text-gray-900 mb-4">Scan QR Code</h3>
            <div className="inline-block p-4 bg-white border rounded-lg">
              <img 
                src={setupData.qr_code_url} 
                alt="MFA QR Code" 
                className="w-48 h-48"
              />
            </div>
            
            {setupData.secret_key && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Manual entry key:</p>
                <div className="flex items-center justify-center gap-2">
                  <code className="px-3 py-2 bg-gray-100 rounded font-mono text-sm">
                    {showSecretKey ? setupData.secret_key : '••••••••••••••••'}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSecretKey(!showSecretKey)}
                  >
                    {showSecretKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(setupData.secret_key!)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Verification Code
          </label>
          <input
            type="text"
            placeholder="Enter 6-digit code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg font-mono"
            maxLength={6}
          />
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setCurrentStep('setup')}>
            Back
          </Button>
          <Button onClick={handleVerifyMFA} disabled={loading || verificationCode.length !== 6}>
            {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
            {loading ? 'Verifying...' : 'Verify & Enable'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderBackupCodes = () => (
    <Card>
      <CardHeader>
        <CardTitle className="text-green-600">MFA Setup Complete!</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-800">Important: Save Your Backup Codes</h4>
              <p className="text-sm text-yellow-700 mt-1">
                Store these codes securely. Each code can only be used once to access your account if you lose your primary MFA device.
              </p>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">Backup Codes</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => copyToClipboard(setupData?.backup_codes.join('\n') || '')}>
                <Copy className="mr-2 h-4 w-4" />
                Copy All
              </Button>
              <Button variant="outline" size="sm" onClick={downloadBackupCodes}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {setupData?.backup_codes.map((code, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg font-mono text-sm"
              >
                <span>{code}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(code, index)}
                >
                  {copiedCodes.has(index) ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <h4 className="font-medium text-green-800">MFA Successfully Enabled</h4>
              <p className="text-sm text-green-700">Your account is now protected with multi-factor authentication</p>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <Button onClick={() => { setCurrentStep('manage'); fetchMFAStatus(); }}>
            <Settings className="mr-2 h-4 w-4" />
            Manage MFA Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderManagement = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>MFA Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mfaMethods.map((method) => (
              <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {method.icon}
                  <div>
                    <h4 className="font-medium text-gray-900">{method.name}</h4>
                    <p className="text-sm text-gray-600">{method.description}</p>
                    {method.last_used && (
                      <p className="text-xs text-gray-500">
                        Last used: {new Date(method.last_used).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {method.primary && (
                    <Badge variant="success" size="sm" icon={null} onRemove={() => {}}>
                      Primary
                    </Badge>
                  )}
                  <Badge 
                    variant={method.enabled ? 'success' : 'secondary'} 
                    size="sm"
                    icon={null}
                    onRemove={() => {}}
                  >
                    {method.enabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                  {method.enabled && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDisableMFA(method.id)}
                    >
                      Disable
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t">
            <Button variant="outline" onClick={() => setCurrentStep('setup')}>
              <Shield className="mr-2 h-4 w-4" />
              Add Another Method
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {success && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <span>{success}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 'overview' && renderOverview()}
      {currentStep === 'setup' && renderSetup()}
      {currentStep === 'verify' && renderVerify()}
      {currentStep === 'backup' && renderBackupCodes()}
      {currentStep === 'manage' && renderManagement()}
    </div>
  );
};

export default EnhancedMFASetup;