import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { Alert, AlertDescription, AlertTitle } from '../ui/Alert';
import { Badge } from '../ui/Badge';
import { Loader2, Sparkles, MessageSquare, AlertCircle, Info, Zap } from 'lucide-react';
import { useToast } from '../ui/Toast'; // Assuming useToast is available

const CommunicationStyleAnalyzer = () => {
  const [inputText, setInputText] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isFeatureEnabled, setIsFeatureEnabled] = useState(false);
  const [userTenantInfo, setUserTenantInfo] = useState({ tier: 'basic', featureEnabled: false });

  const { toast } = useToast();

  useEffect(() => {
    checkFeatureAvailability();
  }, []);

  const checkFeatureAvailability = async () => {
    // This function would ideally fetch actual user tenant and feature flag info
    // For now, simulating based on documentation patterns
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setUserTenantInfo({ tier: 'unknown', featureEnabled: false });
        // setError("Authentication required to check feature availability.");
        return;
      }

      // Replace with actual API call to get user/tenant features
      // const response = await fetch('/api/users/me/features'); // Example endpoint
      // const data = await response.json();
      // const commStyleFeature = data.features.find(f => f.id === 'communication_style_analysis');
      // setUserTenantInfo({ tier: data.tenantTier, featureEnabled: commStyleFeature?.enabled });

      // Mocked response for now, assuming professional+ has it
      const mockTier = 'professional'; // Simulate user tier
      const mockFeatureEnabled = ['professional', 'enterprise'].includes(mockTier);
      setUserTenantInfo({ tier: mockTier, featureEnabled: mockFeatureEnabled });
      setIsFeatureEnabled(mockFeatureEnabled);

    } catch (err) {
      console.error('Error checking feature availability:', err);
      setUserTenantInfo({ tier: 'unknown', featureEnabled: false });
      // setError("Could not verify feature availability at this time.");
    }
  };


  const handleAnalyzeStyle = async () => {
    if (!inputText.trim()) {
      setError('Please enter some text to analyze.');
      return;
    }

    setIsLoading(true);
    setError('');
    setAnalysisResult(null);

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError("You must be logged in to use this feature.");
        setIsLoading(false);
        return;
      }

      const response = await fetch('http://localhost:8000/ai/communication-style/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          text_input: inputText
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAnalysisResult(data);
        toast({ title: "Analysis Complete", description: "Communication style analyzed successfully." });
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to analyze communication style. Please try again.');
        toast({ variant: "destructive", title: "Analysis Failed", description: errorData.detail || 'Unknown error' });
      }
    } catch (err) {
      console.error("Analysis API error:", err);
      setError('Network error or server issue. Please check your connection and try again.');
      toast({ variant: "destructive", title: "Network Error", description: "Could not connect to the server." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setInputText('');
    setAnalysisResult(null);
    setError('');
  };

  if (!userTenantInfo.featureEnabled && userTenantInfo.tier !== 'unknown') { // Don't show if availability check failed
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            Communication Style Analyzer
            <Badge variant="secondary">Premium Feature</Badge>
          </CardTitle>
          <CardDescription>
            Understand the underlying style of your written communication.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="default" className="border-blue-500">
            <Zap className="h-4 w-4 !text-blue-600" />
            <AlertTitle className="text-blue-700">Feature Not Available</AlertTitle>
            <AlertDescription>
              The Communication Style Analyzer is available for Professional and Enterprise plans.
              Your current plan: <strong className="capitalize">{userTenantInfo.tier}</strong>.
              <Button variant="outline" size="sm" className="mt-3 w-full hover:bg-blue-50" onClick={() => alert('Navigate to pricing page')}>
                Upgrade Your Plan
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }


  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            Communication Style Analyzer
            {userTenantInfo.tier && <Badge variant="outline" className="capitalize">{userTenantInfo.tier}</Badge>}
          </CardTitle>
          <CardDescription>
            Input text to get an AI-powered analysis of its communication style.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="style-input" className="text-sm font-medium text-gray-700">
              Enter text for analysis:
            </label>
            <Textarea
              id="style-input"
              placeholder="Paste your email, message, or any text here..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="min-h-[150px] resize-none focus:border-blue-500"
              disabled={isLoading}
            />
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-gray-500">
                {inputText.length} characters
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClear}
                  disabled={!inputText && !analysisResult && !error}
                >
                  Clear
                </Button>
                <Button
                  onClick={handleAnalyzeStyle}
                  disabled={!inputText.trim() || isLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Analyze Style
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Analysis Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {analysisResult && (
            <Card className="bg-gray-50/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="h-5 w-5 text-blue-600" />
                  Analysis Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-600">Identified Style:</span>
                  <Badge variant="default" className="text-base bg-blue-100 text-blue-800 px-3 py-1">
                    {analysisResult.identified_style || 'N/A'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-600">Confidence Score:</span>
                  <span className="font-semibold text-blue-700">
                    {analysisResult.confidence_score !== undefined ? (analysisResult.confidence_score * 100).toFixed(0) + '%' : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-600 block mb-1">Explanation:</span>
                  <p className="text-gray-700 p-3 bg-white border rounded-md whitespace-pre-wrap">
                    {analysisResult.explanation || 'No explanation provided.'}
                  </p>
                </div>
                {analysisResult.raw_text_length !== undefined && (
                  <div className="text-xs text-gray-500 pt-2 border-t">
                    Analyzed {analysisResult.raw_text_length} characters. Provider: {analysisResult.model_provider || 'default'}.
                  </div>
                )}
              </CardContent>
            </Card>
          )}
           {!isLoading && !analysisResult && !error && (
             <Alert variant="default" className="border-blue-300 bg-blue-50">
                <Info className="h-4 w-4 !text-blue-600" />
                <AlertDescription className="text-blue-700">
                  Enter some text and click "Analyze Style" to see the AI's assessment of the communication style.
                  This can help you understand how your message might be perceived.
                </AlertDescription>
              </Alert>
           )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CommunicationStyleAnalyzer;
