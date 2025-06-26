import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import { Alert, AlertDescription } from '../ui/Alert';
import { Stepper } from '../ui/Stepper';
import { 
  ExternalLink, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Shield,
  Key,
  Globe,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

const OAuthFlowWizard = ({ provider, onComplete, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [authState, setAuthState] = useState('idle'); // idle, authorizing, exchanging, completed, error
  const [authCode, setAuthCode] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [error, setError] = useState('');
  const [connectionData, setConnectionData] = useState(null);

  const steps = [
    {
      id: 'authorize',
      title: 'Authorization',
      description: 'Authorize Digame to access your account'
    },
    {
      id: 'exchange',
      title: 'Token Exchange',
      description: 'Exchange authorization code for access token'
    },
    {
      id: 'test',
      title: 'Test Connection',
      description: 'Verify the connection is working'
    },
    {
      id: 'complete',
      title: 'Complete',
      description: 'Integration setup complete'
    }
  ];

  const initiateOAuth = () => {
    setAuthState('authorizing');
    setCurrentStep(0);
    
    // Generate state parameter for security
    const state = btoa(Math.random().toString(36).substring(2, 15));
    
    // Store state in sessionStorage for verification
    sessionStorage.setItem('oauth_state', state);
    sessionStorage.setItem('oauth_provider', provider.name);
    
    // Build OAuth URL
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: provider.client_id || 'demo_client_id',
      redirect_uri: `${window.location.origin}/integrations/oauth/callback`,
      scope: provider.default_scopes?.join(' ') || 'read',
      state: state
    });
    
    const authUrl = `${provider.auth_config?.authorization_url || `https://oauth.${provider.name.toLowerCase()}.com/authorize`}?${params}`;
    
    // Open OAuth popup
    const popup = window.open(
      authUrl,
      'oauth_popup',
      'width=600,height=700,scrollbars=yes,resizable=yes'
    );
    
    // Listen for popup messages
    const messageListener = (event) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'oauth_success') {
        popup.close();
        handleAuthSuccess(event.data.code, event.data.state);
        window.removeEventListener('message', messageListener);
      } else if (event.data.type === 'oauth_error') {
        popup.close();
        handleAuthError(event.data.error);
        window.removeEventListener('message', messageListener);
      }
    };
    
    window.addEventListener('message', messageListener);
    
    // Handle popup closed manually
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        window.removeEventListener('message', messageListener);
        if (authState === 'authorizing') {
          setAuthState('error');
          setError('Authorization was cancelled');
        }
      }
    }, 1000);
  };

  const handleAuthSuccess = async (code, state) => {
    // Verify state parameter
    const storedState = sessionStorage.getItem('oauth_state');
    if (state !== storedState) {
      setAuthState('error');
      setError('Invalid state parameter. Possible CSRF attack.');
      return;
    }
    
    setAuthCode(code);
    setCurrentStep(1);
    setAuthState('exchanging');
    
    try {
      // Exchange code for token
      const response = await fetch('/api/v1/integrations/oauth/exchange', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider_id: provider.id,
          code: code,
          redirect_uri: `${window.location.origin}/integrations/oauth/callback`
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to exchange authorization code');
      }
      
      const tokenData = await response.json();
      setAccessToken(tokenData.access_token);
      setCurrentStep(2);
      
      // Test the connection
      await testConnection(tokenData.access_token);
      
    } catch (err) {
      setAuthState('error');
      setError(err.message);
    }
  };

  const handleAuthError = (error) => {
    setAuthState('error');
    setError(error || 'Authorization failed');
  };

  const testConnection = async (token) => {
    try {
      const response = await fetch('/api/v1/integrations/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider_id: provider.id,
          access_token: token
        })
      });
      
      if (!response.ok) {
        throw new Error('Connection test failed');
      }
      
      const testResult = await response.json();
      setConnectionData(testResult);
      setCurrentStep(3);
      setAuthState('completed');
      
    } catch (err) {
      setAuthState('error');
      setError(`Connection test failed: ${err.message}`);
    }
  };

  const completeSetup = () => {
    if (onComplete) {
      onComplete({
        provider_id: provider.id,
        access_token: accessToken,
        connection_data: connectionData
      });
    }
  };

  const retryFlow = () => {
    setAuthState('idle');
    setCurrentStep(0);
    setAuthCode('');
    setAccessToken('');
    setError('');
    setConnectionData(null);
  };

  const getStepStatus = (stepIndex) => {
    if (stepIndex < currentStep) return 'completed';
    if (stepIndex === currentStep) {
      if (authState === 'error') return 'error';
      if (authState === 'completed') return 'completed';
      return 'current';
    }
    return 'pending';
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <img 
              src={provider.logo_url || '/api/placeholder/40/40'} 
              alt={provider.name}
              className="w-10 h-10 rounded"
            />
            <div>
              <CardTitle>Connect to {provider.display_name}</CardTitle>
              <CardDescription>{provider.description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <Stepper 
              steps={steps}
              currentStep={currentStep}
              getStepStatus={getStepStatus}
            />
            
            {authState === 'idle' && (
              <div className="text-center space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Ready to Connect</h3>
                  <p className="text-gray-600">
                    Click the button below to authorize Digame to access your {provider.display_name} account.
                  </p>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                  <div className="flex items-center justify-center space-x-2">
                    <Shield className="h-5 w-5 text-blue-500" />
                    <span className="font-medium text-blue-900">Secure OAuth 2.0 Flow</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    Your credentials are never stored by Digame. We only receive an access token to make API calls on your behalf.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium">Permissions Requested:</p>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {(provider.default_scopes || ['read']).map((scope) => (
                      <Badge key={scope} variant="outline" className="text-xs">
                        {scope}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <Button onClick={initiateOAuth} className="w-full">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Authorize with {provider.display_name}
                </Button>
              </div>
            )}
            
            {authState === 'authorizing' && (
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center space-x-2">
                  <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
                  <span className="font-medium">Waiting for Authorization</span>
                </div>
                <p className="text-gray-600">
                  Please complete the authorization in the popup window.
                </p>
                <Button variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              </div>
            )}
            
            {authState === 'exchanging' && (
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center space-x-2">
                  <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
                  <span className="font-medium">Exchanging Authorization Code</span>
                </div>
                <p className="text-gray-600">
                  Securely exchanging your authorization code for an access token...
                </p>
                <Progress value={66} className="w-full" />
              </div>
            )}
            
            {authState === 'completed' && (
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                  <span className="text-lg font-semibold text-green-700">Connection Successful!</span>
                </div>
                
                {connectionData && (
                  <div className="bg-green-50 p-4 rounded-lg space-y-2">
                    <p className="font-medium text-green-900">Connection Details:</p>
                    <div className="text-sm text-green-700 space-y-1">
                      {connectionData.user_info && (
                        <p>Connected as: {connectionData.user_info.name || connectionData.user_info.email}</p>
                      )}
                      {connectionData.workspace && (
                        <p>Workspace: {connectionData.workspace}</p>
                      )}
                      <p>Status: {connectionData.status || 'Active'}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex space-x-3">
                  <Button variant="outline" onClick={retryFlow}>
                    Start Over
                  </Button>
                  <Button onClick={completeSetup} className="flex-1">
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Complete Setup
                  </Button>
                </div>
              </div>
            )}
            
            {authState === 'error' && (
              <div className="space-y-4">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {error}
                  </AlertDescription>
                </Alert>
                
                <div className="flex space-x-3">
                  <Button variant="outline" onClick={onCancel}>
                    Cancel
                  </Button>
                  <Button onClick={retryFlow} className="flex-1">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">What happens next?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start space-x-2">
              <Key className="h-4 w-4 mt-0.5 text-gray-400" />
              <p>Your access token will be securely stored and encrypted</p>
            </div>
            <div className="flex items-start space-x-2">
              <Globe className="h-4 w-4 mt-0.5 text-gray-400" />
              <p>Digame will sync data according to your preferences</p>
            </div>
            <div className="flex items-start space-x-2">
              <Shield className="h-4 w-4 mt-0.5 text-gray-400" />
              <p>You can revoke access at any time from your account settings</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OAuthFlowWizard;