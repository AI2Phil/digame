import React from 'react';
import { useRouter } from 'next/router';
import { Button } from '../src/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../src/components/ui/Card';
import { Home, RefreshCw, AlertTriangle } from 'lucide-react';

export default function ServerErrorPage() {
  const router = useRouter();

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <div className="text-6xl font-bold text-gray-400 mb-4">500</div>
          <CardTitle className="text-2xl">Server Error</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Something went wrong on our end. We're working to fix this issue.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button
              variant="outline"
              onClick={handleRefresh}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
            <Button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}