import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ApiKeyManagementSection from '../../src/components/admin/ApiKeyManagementSection';
import { ToastProvider } from '../../src/components/ui/Toast';

export default function AdminApiKeys() {
  return (
    <ToastProvider>
      <Head>
        <title>API Key Management - Admin - Digame</title>
        <meta name="description" content="Manage API keys, access tokens, and service integrations" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link
                  href="/admin"
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors duration-200"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">API Key Management</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Manage API keys, access tokens, and service integrations with advanced controls
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-6 py-8">
          <ApiKeyManagementSection />
        </div>
      </div>
    </ToastProvider>
  );
}