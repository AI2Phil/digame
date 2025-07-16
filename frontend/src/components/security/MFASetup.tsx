import React, { useState } from 'react';

interface MFASetupProps {
  onSetupComplete?: () => void;
}

interface MFASetupResponse {
  qr_code_url?: string;
  backup_codes: string[];
  secret_key?: string;
}

export const MFASetup: React.FC<MFASetupProps> = ({ onSetupComplete }) => {
  const [step, setStep] = useState<'setup' | 'verify' | 'backup'>('setup');
  const [method, setMethod] = useState<'totp' | 'sms' | 'email'>('totp');
  const [setupData, setSetupData] = useState<MFASetupResponse | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedCodes, setCopiedCodes] = useState<Set<number>>(new Set());

  const handleSetupMFA = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/security/mfa/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method,
          recovery_email: recoveryEmail || null,
          phone_number: phoneNumber || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to set up MFA');
      }

      const data: MFASetupResponse = await response.json();
      setSetupData(data);
      setStep('verify');
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
        },
        body: JSON.stringify({
          code: verificationCode,
          method,
        }),
      });

      if (!response.ok) {
        throw new Error('Invalid verification code');
      }

      setStep('backup');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const copyBackupCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedCodes(prev => new Set(Array.from(prev).concat([index])));
    
    // Reset copied state after 2 seconds
    setTimeout(() => {
      setCopiedCodes(prev => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });
    }, 2000);
  };

  const copyAllBackupCodes = () => {
    if (setupData?.backup_codes) {
      const allCodes = setupData.backup_codes.join('\n');
      navigator.clipboard.writeText(allCodes);
    }
  };

  const handleComplete = () => {
    onSetupComplete?.();
  };

  const cardStyle = {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '24px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    backgroundColor: 'white',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  };

  const buttonStyle = {
    padding: '8px 16px',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    backgroundColor: '#3b82f6',
    color: 'white',
    cursor: 'pointer',
    fontSize: '14px',
  };

  const inputStyle = {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
  };

  const errorStyle = {
    padding: '12px',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '6px',
    color: '#dc2626',
    fontSize: '14px',
  };

  if (step === 'setup') {
    return (
      <div style={cardStyle}>
        <h2 style={{ marginBottom: '8px', fontSize: '20px', fontWeight: 'bold' }}>
          🛡️ Set Up Multi-Factor Authentication
        </h2>
        <p style={{ marginBottom: '24px', color: '#6b7280', fontSize: '14px' }}>
          Add an extra layer of security to your account by enabling MFA
        </p>

        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ marginBottom: '12px', fontSize: '16px', fontWeight: '600' }}>
            Choose MFA Method
          </h3>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            {[
              { value: 'totp', label: '📱 Authenticator App' },
              { value: 'sms', label: '📞 SMS' },
              { value: 'email', label: '📧 Email' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setMethod(option.value as typeof method)}
                style={{
                  ...buttonStyle,
                  backgroundColor: method === option.value ? '#3b82f6' : '#f9fafb',
                  color: method === option.value ? 'white' : '#374151',
                }}
              >
                {option.label}
              </button>
            ))}
          </div>

          {method === 'totp' && (
            <p style={{ fontSize: '14px', color: '#6b7280' }}>
              Use an authenticator app like Google Authenticator, Authy, or 1Password to generate verification codes.
            </p>
          )}

          {method === 'sms' && (
            <div style={{ marginTop: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                style={inputStyle}
              />
            </div>
          )}

          {method === 'email' && (
            <div style={{ marginTop: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                Email Address
              </label>
              <input
                type="email"
                placeholder="recovery@example.com"
                value={recoveryEmail}
                onChange={(e) => setRecoveryEmail(e.target.value)}
                style={inputStyle}
              />
            </div>
          )}
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
            Recovery Email (Optional)
          </label>
          <input
            type="email"
            placeholder="backup@example.com"
            value={recoveryEmail}
            onChange={(e) => setRecoveryEmail(e.target.value)}
            style={inputStyle}
          />
          <p style={{ marginTop: '4px', fontSize: '12px', color: '#6b7280' }}>
            Used for account recovery if you lose access to your primary MFA method.
          </p>
        </div>

        {error && (
          <div style={errorStyle}>
            ⚠️ {error}
          </div>
        )}

        <button
          onClick={handleSetupMFA}
          disabled={loading}
          data-testid="setup-mfa-button"
          style={{
            ...buttonStyle,
            width: '100%',
            marginTop: '16px',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? 'Setting up...' : 'Set Up MFA'}
        </button>
      </div>
    );
  }

  if (step === 'verify') {
    return (
      <div style={cardStyle}>
        <h2 style={{ marginBottom: '8px', fontSize: '20px', fontWeight: 'bold' }}>
          🔑 Verify Your Setup
        </h2>
        <p style={{ marginBottom: '24px', color: '#6b7280', fontSize: '14px' }}>
          Enter the verification code from your {method === 'totp' ? 'authenticator app' : method === 'sms' ? 'phone' : 'email'}
        </p>

        {method === 'totp' && setupData?.qr_code_url && (
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <p style={{ marginBottom: '16px', fontSize: '14px', color: '#6b7280' }}>
              Scan this QR code with your authenticator app:
            </p>
            <img
              src={setupData.qr_code_url}
              alt="MFA QR Code"
              data-testid="mfa-qr-code"
              style={{ border: '1px solid #d1d5db', borderRadius: '8px' }}
            />
            {setupData.secret_key && (
              <p style={{ marginTop: '8px', fontSize: '12px', color: '#6b7280' }}>
                Manual entry key: <code style={{ backgroundColor: '#f3f4f6', padding: '2px 4px', borderRadius: '4px' }}>
                  {setupData.secret_key}
                </code>
              </p>
            )}
          </div>
        )}

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
            Verification Code
          </label>
          <input
            type="text"
            placeholder="Enter 6-digit code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            maxLength={6}
            data-testid="mfa-verification-code"
            style={inputStyle}
          />
        </div>

        {error && (
          <div style={errorStyle}>
            ⚠️ {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
          <button
            onClick={() => setStep('setup')}
            style={{
              ...buttonStyle,
              backgroundColor: '#f9fafb',
              color: '#374151',
            }}
          >
            Back
          </button>
          <button
            onClick={handleVerifyMFA}
            disabled={loading}
            data-testid="verify-mfa-button"
            style={{
              ...buttonStyle,
              flex: 1,
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? 'Verifying...' : 'Verify & Enable MFA'}
          </button>
        </div>
      </div>
    );
  }

  if (step === 'backup') {
    return (
      <div style={cardStyle}>
        <h2 style={{ marginBottom: '8px', fontSize: '20px', fontWeight: 'bold', color: '#059669' }}>
          🛡️ MFA Setup Complete!
        </h2>
        <p style={{ marginBottom: '24px', color: '#6b7280', fontSize: '14px' }}>
          Save these backup codes in a secure location. You can use them to access your account if you lose your primary MFA device.
        </p>

        <div style={{ ...errorStyle, backgroundColor: '#fef3c7', borderColor: '#fcd34d', color: '#92400e', marginBottom: '24px' }}>
          <strong>Important:</strong> Store these backup codes securely. Each code can only be used once.
        </div>

        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Backup Codes</h3>
            <button
              onClick={copyAllBackupCodes}
              style={{
                ...buttonStyle,
                backgroundColor: '#f9fafb',
                color: '#374151',
                fontSize: '12px',
              }}
            >
              📋 Copy All
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {setupData?.backup_codes.map((code, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '6px',
                  fontFamily: 'monospace',
                  fontSize: '14px',
                }}
              >
                <span>{code}</span>
                <button
                  onClick={() => copyBackupCode(code, index)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                >
                  {copiedCodes.has(index) ? '✅' : '📋'}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '16px',
          backgroundColor: '#f0fdf4',
          borderRadius: '6px',
          marginBottom: '24px',
        }}>
          <span style={{
            padding: '4px 8px',
            backgroundColor: '#dcfce7',
            color: '#166534',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: '500',
          }}>
            🛡️ MFA Enabled
          </span>
          <span style={{ fontSize: '14px', color: '#166534' }}>
            Your account is now protected with multi-factor authentication
          </span>
        </div>

        <button
          onClick={handleComplete}
          style={{
            ...buttonStyle,
            width: '100%',
            backgroundColor: '#059669',
          }}
        >
          Continue to Dashboard
        </button>
      </div>
    );
  }

  return null;
};