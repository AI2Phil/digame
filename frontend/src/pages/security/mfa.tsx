/**
 * MFA Setup Page - Multi-Factor Authentication setup and management
 * Dedicated page for MFA configuration accessed via /security/mfa
 */

import React from 'react';
import { EnhancedMFASetup } from '../../components/security/EnhancedMFASetup';

const MFAPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Multi-Factor Authentication</h1>
          <p className="text-gray-600 mt-1">
            Secure your account with an additional layer of protection
          </p>
        </div>
        <EnhancedMFASetup />
      </div>
    </div>
  );
};

export default MFAPage;
