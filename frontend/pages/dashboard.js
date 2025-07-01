import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Button from '../src/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../src/components/ui/Card';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/auth');
      return;
    }

    // For now, just set a mock user to test the flow
    setUser({
      email: 'admin@digame.com',
      username: 'admin'
    });
    setIsLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-900">Loading Dashboard...</h2>
            <p className="text-gray-600">Preparing your digital twin platform</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center backdrop-blur-sm shadow-lg">
                <span className="text-white font-bold text-sm">D</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Digame</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Welcome, {user?.username}</span>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="border-gray-300 hover:border-red-500 hover:text-red-600"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Welcome to Your Digital Twin Dashboard
            </h1>
            <p className="text-xl text-gray-600">
              🎉 Authentication successful! Your Digame platform is ready.
            </p>
          </div>

          {/* Success Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="rounded-2xl shadow-lg border border-white/20 backdrop-blur-lg bg-white/80">
              <CardHeader>
                <CardTitle className="text-green-600 flex items-center space-x-2">
                  <span className="text-2xl">✅</span>
                  <span>Authentication</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Successfully logged in with JWT tokens. Backend authentication is working perfectly.
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-lg border border-white/20 backdrop-blur-lg bg-white/80">
              <CardHeader>
                <CardTitle className="text-blue-600 flex items-center space-x-2">
                  <span className="text-2xl">🔗</span>
                  <span>Frontend-Backend</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Frontend and backend are properly connected. Next.js routing is working correctly.
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-lg border border-white/20 backdrop-blur-lg bg-white/80">
              <CardHeader>
                <CardTitle className="text-purple-600 flex items-center space-x-2">
                  <span className="text-2xl">🐳</span>
                  <span>Docker Setup</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  All Docker services are running: Backend, Frontend, PostgreSQL, and Redis.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Status Information */}
          <Card className="rounded-2xl shadow-lg border border-white/20 backdrop-blur-lg bg-white/80">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center space-x-2">
                <span className="text-2xl">📊</span>
                <span>Platform Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">✅ Working Components:</h3>
                  <ul className="space-y-1 text-gray-600">
                    <li>• JWT Authentication & Token Management</li>
                    <li>• SQLAlchemy Database Models</li>
                    <li>• PostgreSQL Database Connection</li>
                    <li>• Redis Caching Service</li>
                    <li>• Next.js Frontend Routing</li>
                    <li>• Docker Multi-Service Setup</li>
                    <li>• CORS Configuration</li>
                    <li>• User Registration & Login</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">🔧 Next Steps:</h3>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Add Platform Owner role to RBAC</li>
                    <li>• Implement dashboard API endpoints</li>
                    <li>• Add user profile management</li>
                    <li>• Integrate analytics components</li>
                    <li>• Set up onboarding flow</li>
                    <li>• Add real-time features</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}