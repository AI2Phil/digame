/**
 * Security Page - Main security dashboard and management
 * Provides access to all security features including MFA setup
 */

import React from 'react';
import { Security } from '../components/security/Security';

const SecurityPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Security />
      </div>
    </div>
  );
};

export default SecurityPage;
