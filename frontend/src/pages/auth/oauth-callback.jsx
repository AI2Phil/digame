import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Alert, AlertDescription } from '../components/ui/Alert';
import { Progress } from '../components/ui/Progress';
import { CheckCircle, AlertCircle, RefreshCw, ExternalLink } from 'lucide-react';

const OAuthCallbackPage = () => {
  const router = useRouter();
  const searchParams = router.query;
  const [status, setStatus] = useState('processing'); // processing, success, error
  const [message, setMessage] = useState('Processing authorization...');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get parameters from URL
        const code = router.query.code;
        const state = router.query.state;
        const error = router.query.error;
        const errorDescription = router.query.error_description;

        // Check for OAuth errors
        if (error) {
          setStatus('error');
          setMessage(errorDescription || `OAuth error: ${error}`);

          // Send error message to parent window
          if (window.opener) {
            window.opener.postMessage(
              {
                type: 'oauth_error',
                error: errorDescription || error,
              },
              window.location.origin
            );
          }
          return;
        }

        // Check for required parameters
        if (!code || !state) {
          setStatus('error');
          setMessage('Missing required authorization parameters');

          if (window.opener) {
            window.opener.postMessage(
              {
                type: 'oauth_error',
                error: 'Missing authorization parameters',
              },
              window.location.origin
            );
          }
          return;
        }

        // Update progress
        setProgress(25);
        setMessage('Validating authorization code...');

        // Simulate processing delay for better UX
        await new Promise(resolve => setTimeout(resolve, 1000));

        setProgress(50);
        setMessage('Verifying state parameter...');

        // Verify state parameter
        const storedState = sessionStorage.getItem('oauth_state');
        if (state !== storedState) {
          setStatus('error');
          setMessage('Invalid state parameter. Possible security issue.');

          if (window.opener) {
            window.opener.postMessage(
              {
                type: 'oauth_error',
                error: 'Invalid state parameter',
              },
              window.location.origin
            );
          }
          return;
        }

        setProgress(75);
        setMessage('Completing authorization...');

        // Another delay for UX
        await new Promise(resolve => setTimeout(resolve, 1000));

        setProgress(100);
        setStatus('success');
        setMessage('Authorization successful! Redirecting...');

        // Send success message to parent window
        if (window.opener) {
          window.opener.postMessage(
            {
              type: 'oauth_success',
              code: code,
              state: state,
            },
            window.location.origin
          );
        }

        // Close popup after a short delay
        setTimeout(() => {
          if (window.opener) {
            window.close();
          } else {
            // If not in popup, redirect to integrations page
            router.push('/integrations');
          }
        }, 2000);
      } catch (err) {
        setStatus('error');
        setMessage(`Unexpected error: ${err.message}`);

        if (window.opener) {
          window.opener.postMessage(
            {
              type: 'oauth_error',
              error: err.message,
            },
            window.location.origin
          );
        }
      }
    };

    handleCallback();
  }, [searchParams, router]);

  const getStatusIcon = () => {
    switch (status) {
      case 'processing':
        return <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-8 w-8 text-red-500" />;
      default:
        return <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'processing':
        return 'text-blue-700';
      case 'success':
        return 'text-green-700';
      case 'error':
        return 'text-red-700';
      default:
        return 'text-blue-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">{getStatusIcon()}</div>
            <CardTitle className={getStatusColor()}>
              {status === 'processing' && 'Processing Authorization'}
              {status === 'success' && 'Authorization Successful'}
              {status === 'error' && 'Authorization Failed'}
            </CardTitle>
            <CardDescription>
              {status === 'processing' && 'Please wait while we complete your authorization...'}
              {status === 'success' && 'Your integration has been successfully authorized.'}
              {status === 'error' && 'There was an issue with the authorization process.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {status === 'processing' && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}

            <div className="text-center">
              <p className={`text-sm ${getStatusColor()}`}>{message}</p>
            </div>

            {status === 'success' && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  You can now close this window and return to the main application.
                </AlertDescription>
              </Alert>
            )}

            {status === 'error' && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            {status === 'error' && !window.opener && (
              <div className="text-center pt-4">
                <button
                  onClick={() => router.push('/integrations')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Return to Integrations
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            This window will close automatically when the process is complete.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OAuthCallbackPage;
