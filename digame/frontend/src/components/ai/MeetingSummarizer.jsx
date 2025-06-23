import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { Alert, AlertDescription, AlertTitle } from '../ui/Alert';
import { Badge } from '../ui/Badge';
import { Loader2, Sparkles, FileText, ListChecks, AlertCircle, Info, Zap } from 'lucide-react';
import { useToast } from '../ui/Toast';

const MeetingSummarizer = () => {
  const [inputText, setInputText] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [userTenantInfo, setUserTenantInfo] = useState({ tier: 'basic', featureEnabled: false });

  const { toast } = useToast();

  useEffect(() => {
    checkFeatureAvailability();
  }, []);

  const checkFeatureAvailability = async () => {
    // Mocked: In a real app, fetch this from a user context or API
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setUserTenantInfo({ tier: 'unknown', featureEnabled: false });
        return;
      }
      // Simulate API call for user features
      // const response = await fetch('/api/users/me/features');
      // const data = await response.json();
      // const meetingInsightsFeature = data.features.find(f => f.id === 'meeting_insights');
      // setUserTenantInfo({ tier: data.tenantTier, featureEnabled: meetingInsightsFeature?.enabled });

      const mockTier = 'enterprise'; // Simulate user tier that has this feature
      const mockFeatureEnabled = ['enterprise'].includes(mockTier); // Typically an enterprise feature
      setUserTenantInfo({ tier: mockTier, featureEnabled: mockFeatureEnabled });

    } catch (err) {
      console.error('Error checking feature availability:', err);
      setUserTenantInfo({ tier: 'unknown', featureEnabled: false });
    }
  };

  const handleAnalyzeMeeting = async () => {
    if (!inputText.trim()) {
      setError('Please enter some meeting text to analyze.');
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

      const response = await fetch('http://localhost:8000/ai/meeting-insights/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          meeting_text: inputText
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAnalysisResult(data);
        toast({ title: "Analysis Complete", description: "Meeting insights generated successfully." });
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to generate meeting insights. Please try again.');
        toast({ variant: "destructive", title: "Analysis Failed", description: errorData.detail || 'Unknown error' });
      }
    } catch (err) {
      console.error("Meeting Analysis API error:", err);
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

  if (!userTenantInfo.featureEnabled && userTenantInfo.tier !== 'unknown') {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-green-600" />
            Meeting Summarizer & Insights
            <Badge variant="secondary">Premium Feature</Badge>
          </CardTitle>
          <CardDescription>
            Automatically summarize your meeting notes or transcripts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="default" className="border-green-500">
            <Zap className="h-4 w-4 !text-green-600" />
            <AlertTitle className="text-green-700">Feature Not Available</AlertTitle>
            <AlertDescription>
              The Meeting Summarizer is typically available for Enterprise plans.
              Your current plan: <strong className="capitalize">{userTenantInfo.tier}</strong>.
              <Button variant="outline" size="sm" className="mt-3 w-full hover:bg-green-50" onClick={() => alert('Navigate to pricing page')}>
                Upgrade to Enterprise
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
            <FileText className="h-5 w-5 text-green-600" />
            Meeting Summarizer & Insights
            {userTenantInfo.tier && <Badge variant="outline" className="capitalize">{userTenantInfo.tier}</Badge>}
          </CardTitle>
          <CardDescription>
            Paste your meeting notes or transcript below to get a summary, key points, and action items.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="meeting-input" className="text-sm font-medium text-gray-700">
              Meeting Text:
            </label>
            <Textarea
              id="meeting-input"
              placeholder="Paste your full meeting notes or transcript here..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="min-h-[200px] resize-none focus:border-green-500"
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
                  onClick={handleAnalyzeMeeting}
                  disabled={!inputText.trim() || isLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing Meeting...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Insights
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
                  <Zap className="h-5 w-5 text-green-600" />
                  Meeting Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-1">Summary:</h3>
                  <p className="text-gray-800 p-3 bg-white border rounded-md whitespace-pre-wrap">
                    {analysisResult.summary || 'N/A'}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                    <ListChecks className="h-4 w-4 text-green-700" /> Key Discussion Points:
                  </h3>
                  {analysisResult.key_points && analysisResult.key_points.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1 pl-4 text-gray-800 bg-white border rounded-md p-3">
                      {analysisResult.key_points.map((point, index) => (
                        <li key={index}>{point}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-600 p-3 bg-white border rounded-md">No key points extracted.</p>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                    <ListChecks className="h-4 w-4 text-green-700" /> Action Items:
                  </h3>
                  {analysisResult.action_items && analysisResult.action_items.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1 pl-4 text-gray-800 bg-white border rounded-md p-3">
                      {analysisResult.action_items.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-600 p-3 bg-white border rounded-md">No action items extracted.</p>
                  )}
                </div>
                {analysisResult.text_length !== undefined && (
                  <div className="text-xs text-gray-500 pt-2 border-t">
                    Analyzed {analysisResult.text_length} characters. Provider: {analysisResult.model_provider || 'default'}.
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          {!isLoading && !analysisResult && !error && (
             <Alert variant="default" className="border-green-300 bg-green-50">
                <Info className="h-4 w-4 !text-green-600" />
                <AlertDescription className="text-green-700">
                  Paste your meeting notes or transcript to get an AI-generated summary, key discussion points, and actionable items.
                </AlertDescription>
              </Alert>
           )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MeetingSummarizer;
