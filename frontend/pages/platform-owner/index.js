import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function PlatformOwnerIndex() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the console page as the main platform owner dashboard
    router.replace('/platform-owner/console');
  }, [router]);

  return (
    <>
      <Head>
        <title>Platform Owner Dashboard - Digame</title>
        <meta name="description" content="Platform Owner Dashboard" />
      </Head>
      
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Platform Owner Dashboard...</p>
        </div>
      </div>
    </>
  );
}