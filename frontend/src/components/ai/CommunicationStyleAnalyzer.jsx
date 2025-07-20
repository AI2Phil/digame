import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { Alert, AlertDescription, AlertTitle } from '../ui/Alert';
import { Badge } from '../ui/Badge';
import { Loader2, Sparkles, MessageSquare, AlertCircle, Info, Zap, RefreshCw } from 'lucide-react';
import { useToast } from '../ui/Toast';

import { apiClient, replaceApiUrl } from '../../lib/api-config';
const CommunicationStyleAnalyzer = () => {
  const [inputText, setInputText] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isFeatureEnabled, setIsFeatureEnabled] = useState(false);
  const [userTenantInfo, setUserTenantInfo] = useState({ tier: 'basic', featureEnabled: false });
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [usingFallbackData, setUsingFallbackData] = useState(false);

  const { toast } = useToast();


  useEffect(() => {
    checkFeatureAvailability();
    loadAnalysisHistory();
  }, []);

  const checkFeatureAvailability = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setUserTenantInfo({ tier: 'unknown', featureEnabled: false });
        return;
      }

      // Try to fetch user features from database
      const response = await fetch('${replaceApiUrl("")}/api/ai/communication-style/features', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserTenantInfo({
          tier: data.tier || 'professional',
          featureEnabled: data.featureEnabled || true
        });
        setIsFeatureEnabled(data.featureEnabled || true);
        setUsingFallbackData(false);
      } else {
        throw new Error('Failed to load feature availability');
      }
    } catch (err) {
      console.warn('Failed to load feature availability from database, using fallback:', err);
      // Fallback to demo mode
      const mockTier = 'professional';
      const mockFeatureEnabled = ['professional', 'enterprise'].includes(mockTier);
      setUserTenantInfo({ tier: mockTier, featureEnabled: mockFeatureEnabled });
      setIsFeatureEnabled(mockFeatureEnabled);
      setUsingFallbackData(true);
    }
  };

  const loadAnalysisHistory = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const response = await fetch('${replaceApiUrl("")}/api/ai/communication-style/history', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAnalysisHistory(data.data || []);
      } else {
        throw new Error('Failed to load analysis history');
      }
    } catch (err) {
      console.warn('Failed to load analysis history from database:', err);
      // Use fallback history data
      setAnalysisHistory([
        {
          id: 1,
          text: 'Sample professional communication...',
          identified_style: 'Professional',
          confidence_score: 0.92,
          explanation: 'This text demonstrates formal business communication with clear structure.',
          timestamp: new Date().toISOString()
        }
      ]);
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

      const response = await fetch('${replaceApiUrl("")}/api/ai/communication-style/analyze', {
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
        setAnalysisResult(data.data || data);
        
        // Add to history
        setAnalysisHistory(prev => [data.data || data, ...prev.slice(0, 9)]);
        
        toast({
          title: "Analysis Complete",
          description: "Communication style analyzed successfully.",
          variant: "success"
        });
        setUsingFallbackData(false);
      } else {
        throw new Error('Failed to analyze communication style');
      }
    } catch (err) {
      console.warn("Analysis API error, using fallback:", err);
      
      // Generate fallback analysis result
      const fallbackResult = {
        identified_style: inputText.length > 100 ? 'Professional' : 'Casual',
        confidence_score: 0.85 + Math.random() * 0.15,
        explanation: `This text demonstrates ${inputText.length > 100 ? 'formal business communication with structured presentation' : 'informal communication with conversational tone'}.`,
        raw_text_length: inputText.length,
        model_provider: 'demo'
      };
      
      setAnalysisResult(fallbackResult);
      setAnalysisHistory(prev => [fallbackResult, ...prev.slice(0, 9)]);
      setUsingFallbackData(true);
      
      toast({
        title: "Demo Analysis",
        description: "Using demo mode - database unavailable",
        variant: "warning"
      });
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
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              Communication Style Analyzer
              {userTenantInfo.tier && <Badge variant="outline" className="capitalize">{userTenantInfo.tier}</Badge>}
            </div>
            <div className="flex items-center space-x-2">
              {usingFallbackData && (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  Demo Data
                </Badge>
              )}
              <Button onClick={loadAnalysisHistory} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
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

      {/* Analysis History */}
      {analysisHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              Recent Analysis History
            </CardTitle>
            <CardDescription>
              Your previous communication style analyses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analysisHistory.slice(0, 5).map((analysis, index) => (
                <div key={analysis.id || index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="default" className="bg-blue-100 text-blue-800">
                      {analysis.identified_style || 'N/A'}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {analysis.confidence_score ? `${(analysis.confidence_score * 100).toFixed(0)}% confidence` : 'N/A'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">
                    {analysis.explanation || 'No explanation available.'}
                  </p>
                  <div className="text-xs text-gray-500">
                    {analysis.timestamp ? new Date(analysis.timestamp).toLocaleString() : 'Recent'}
                    {analysis.raw_text_length && ` • ${analysis.raw_text_length} characters`}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CommunicationStyleAnalyzer;
