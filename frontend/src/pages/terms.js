// Simple terms page
import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <>
      <Head>
        <title>Terms of Service - Digame</title>
        <meta name="description" content="Digame Terms of Service" />
      </Head>

      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow-lg rounded-lg p-8">
            <div className="mb-8">
              <Link href="/" className="text-blue-600 hover:text-blue-500 text-sm font-medium">
                ← Back to Home
              </Link>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 mb-6">
                <strong>Last updated:</strong> {new Date().toLocaleDateString()}
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
                <p className="text-gray-700 mb-4">
                  By accessing and using Digame, you accept and agree to be bound by the terms 
                  and provision of this agreement.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Use of Service</h2>
                <p className="text-gray-700 mb-4">
                  You agree to use Digame in accordance with all applicable laws and regulations.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Privacy</h2>
                <p className="text-gray-700 mb-4">
                  Your privacy is important to us. Please review our{' '}
                  <Link href="/privacy" className="text-blue-600 hover:text-blue-500">
                    Privacy Policy
                  </Link>
                  .
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Contact</h2>
                <p className="text-gray-700 mb-4">
                  If you have questions about these terms, please contact us at legal@digame.com
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}