/**
 * OAuth Callback Page - Next.js Page
 * Route: /integrations/oauth/callback
 */

import React, { useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { CircularProgress, Alert, Box, Typography, Button } from '@mui/material';

interface OAuthCallbackProps {
  code?: string;
  state?: string;
  error?: string;
  error_description?: string;
}

const OAuthCallback: React.FC<OAuthCallbackProps> = ({ 
  code, 
  state, 
  error, 
  error_description 
}) => {
  const router = useRouter();
  const [processing, setProcessing] = useState(true);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    const processOAuthCallback = async () => {
      try {
        if (error) {
          setResult({
            success: false,
            message: error_description || error
          });
          setProcessing(false);
          return;
        }

        if (!code) {
          setResult({
            success: false,
            message: 'No authorization code received'
          });
          setProcessing(false);
          return;
        }

        // Process the OAuth callback
        const response = await fetch('/api/v1/integrations/oauth/callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            code,
            state
          })
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setResult({
            success: true,
            message: 'Integration connected successfully!'
          });
          
          // Close the popup window and redirect parent
          if (window.opener) {
            window.opener.postMessage({
              type: 'oauth_success',
              data: data.data
            }, window.location.origin);
            window.close();
          } else {
            // If not in popup, redirect to integrations page
            setTimeout(() => {
              router.push('/integrations');
            }, 2000);
          }
        } else {
          setResult({
            success: false,
            message: data.message || 'Failed to connect integration'
          });
        }
      } catch (err) {
        setResult({
          success: false,
          message: 'Network error occurred while processing OAuth callback'
        });
      } finally {
        setProcessing(false);
      }
    };

    processOAuthCallback();
  }, [code, state, error, error_description, router]);

  return (
    <>
      <Head>
        <title>OAuth Callback - Digame</title>
        <meta name="description" content="Processing OAuth authentication" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <Box 
        display="flex" 
        flexDirection="column" 
        alignItems="center" 
        justifyContent="center" 
        minHeight="100vh"
        p={3}
      >
        {processing ? (
          <>
            <CircularProgress size={60} sx={{ mb: 3 }} />
            <Typography variant="h6" gutterBottom>
              Processing OAuth Authentication...
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Please wait while we connect your integration.
            </Typography>
          </>
        ) : result ? (
          <>
            <Alert 
              severity={result.success ? 'success' : 'error'} 
              sx={{ mb: 3, minWidth: 300 }}
            >
              {result.message}
            </Alert>
            
            {result.success ? (
              <Typography variant="body2" color="textSecondary" textAlign="center">
                {window.opener ? 
                  'This window will close automatically.' : 
                  'Redirecting to integrations page...'
                }
              </Typography>
            ) : (
              <Box textAlign="center">
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  You can close this window and try again.
                </Typography>
                <Button 
                  variant="contained" 
                  onClick={() => {
                    if (window.opener) {
                      window.close();
                    } else {
                      router.push('/integrations');
                    }
                  }}
                >
                  {window.opener ? 'Close Window' : 'Back to Integrations'}
                </Button>
              </Box>
            )}
          </>
        ) : null}
      </Box>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { code, state, error, error_description } = context.query;

  return {
    props: {
      code: code || null,
      state: state || null,
      error: error || null,
      error_description: error_description || null,
    },
  };
};

export default OAuthCallback;