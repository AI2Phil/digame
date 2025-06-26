import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { Alert, AlertDescription, AlertTitle } from '../ui/Alert';
import { Badge } from '../ui/Badge';
import { Loader2, Sparkles, Mail, BarChart2, AlertCircle, Info, Zap } from 'lucide-react';
import { useToast } from '../ui/Toast';

const EmailAnalyzer = () => {
  const [inputText, setInputText] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [userTenantInfo, setUserTenantInfo] = useState({ tier: 'basic', featureEnabled: false });

  const { toast } = useToast();

  const exampleJsonFormat = `[
  { "subject": "Weekly Report", "sender": "boss@example.com", "timestamp": "2023-10-01T10:00:00Z" },
  { "subject": "Project Update", "sender": "colleague@example.com", "timestamp": "2023-10-02T14:30:00Z" }
]`;

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
      const mockTier = 'enterprise';
      const mockFeatureEnabled = ['enterprise'].includes(mockTier);
      setUserTenantInfo({ tier: mockTier, featureEnabled: mockFeatureEnabled });

    } catch (err) {
      console.error('Error checking feature availability:', err);
      setUserTenantInfo({ tier: 'unknown', featureEnabled: false });
    }
  };

  const handleAnalyzeEmails = async () => {
    if (!inputText.trim()) {
      setError('Please enter email data in JSON format to analyze.');
      return;
    }

    let parsedEmails;
    try {
      parsedEmails = JSON.parse(inputText);
      if (!Array.isArray(parsedEmails)) {
        setError('Input must be a valid JSON array of email objects.');
        return;
      }
      if (parsedEmails.length === 0) {
        setError('The JSON array cannot be empty.');
        return;
      }
      // Optionally, add more validation for the structure of email objects within the array
    } catch (e) {
      setError('Invalid JSON format. Please check your input. See example format below.');
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

      const response = await fetch('http://localhost:8000/ai/email-analysis/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ emails_data: parsedEmails })
      });

      if (response.ok) {
        const data = await response.json();
        setAnalysisResult(data);
        toast({ title: "Analysis Complete", description: "Email data analyzed successfully." });
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to analyze email data. Please try again.');
        toast({ variant: "destructive", title: "Analysis Failed", description: errorData.detail || 'Unknown error' });
      }
    } catch (err) {
      console.error("Email Analysis API error:", err);
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
            <Mail className="h-5 w-5 text-red-600" />
            Email Pattern Analyzer
            <Badge variant="secondary">Premium Feature</Badge>
          </CardTitle>
          <CardDescription>
            Gain insights from your email communication patterns.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="default" className="border-red-500">
            <Zap className="h-4 w-4 !text-red-600" />
            <AlertTitle className="text-red-700">Feature Not Available</AlertTitle>
            <AlertDescription>
              The Email Pattern Analyzer is typically available for Enterprise plans.
              Your current plan: <strong className="capitalize">{userTenantInfo.tier}</strong>.
              <Button variant="outline" size="sm" className="mt-3 w-full hover:bg-red-50" onClick={() => alert('Navigate to pricing page')}>
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
            <Mail className="h-5 w-5 text-red-600" />
            Email Pattern Analyzer
            {userTenantInfo.tier && <Badge variant="outline" className="capitalize">{userTenantInfo.tier}</Badge>}
          </CardTitle>
          <CardDescription>
            Paste your email data as a JSON array to discover patterns and insights.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email-input" className="text-sm font-medium text-gray-700">
              Email Data (JSON Array):
            </label>
            <Textarea
              id="email-input"
              placeholder={exampleJsonFormat}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="min-h-[200px] resize-none font-mono text-xs focus:border-red-500"
              disabled={isLoading}
            />
             <CardDescription className="text-xs">
                Expected format: Array of objects, e.g., `[{`"subject": "...", "sender": "...", "..."`}]`. See placeholder for example.
             </CardDescription>
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
                  onClick={handleAnalyzeEmails}
                  disabled={!inputText.trim() || isLoading}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing Emails...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Analyze Email Patterns
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
                  <BarChart2 className="h-5 w-5 text-red-600" />
                  Email Analysis Insights
                </CardTitle>
                <CardDescription>Type: {analysisResult.analysis_type || 'N/A'}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                {analysisResult.analysis_type === "internal_basic" || analysisResult.analysis_type === "internal_basic_no_data" ? (
                  <>
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-1">Total Emails Analyzed:</h3>
                      <p className="text-gray-800">{analysisResult.total_emails_analyzed ?? '0'}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-1">Most Common Subject Keywords:</h3>
                      {analysisResult.most_common_subject_keywords && analysisResult.most_common_subject_keywords.length > 0 ? (
                        <ul className="list-disc list-inside pl-4 space-y-1">
                          {analysisResult.most_common_subject_keywords.map(([word, count], index) => (
                            <li key={index} className="text-gray-800">{word} ({count})</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-600">No keywords found or not enough data.</p>
                      )}
                    </div>
                  </>
                ) : analysisResult.analysis_type === "openai_assisted" ? (
                  <>
                    <div>
                        <h3 className="font-semibold text-gray-700 mb-1">Overall Sentiment:</h3>
                        <p className="text-gray-800 capitalize">
                            {analysisResult.overall_sentiment || 'N/A'}
                            {analysisResult.sentiment_confidence && ` (Confidence: ${(analysisResult.sentiment_confidence * 100).toFixed(0)}%)`}
                        </p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-1">Common Themes:</h3>
                      {analysisResult.common_themes && analysisResult.common_themes.length > 0 ? (
                        <ul className="list-disc list-inside pl-4 space-y-1">
                          {analysisResult.common_themes.map((theme, index) => (
                            <li key={index} className="text-gray-800">{theme}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-600">No common themes identified by AI.</p>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-1">Productivity Insights:</h3>
                      {analysisResult.productivity_insights && analysisResult.productivity_insights.length > 0 ? (
                        <ul className="list-disc list-inside pl-4 space-y-1">
                          {analysisResult.productivity_insights.map((insight, index) => (
                            <li key={index} className="text-gray-800">{insight}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-600">No specific productivity insights generated by AI.</p>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 pt-2 border-t">
                        AI analyzed a sample of {analysisResult.total_emails_processed_by_ai_prompt} subjects from {analysisResult.total_emails_provided_by_user} emails provided. Provider: {analysisResult.model_provider || 'default'}.
                    </div>
                  </>
                ) : (
                  <p className="text-gray-600">Analysis results are not in the expected format.</p>
                )}
              </CardContent>
            </Card>
          )}
          {!isLoading && !analysisResult && !error && (
             <Alert variant="default" className="border-red-300 bg-red-50">
                <Info className="h-4 w-4 !text-red-600" />
                <AlertDescription className="text-red-700">
                  Paste email data as a JSON array (see example in placeholder). The AI will attempt to identify themes, sentiment, and productivity insights from the subjects.
                </AlertDescription>
              </Alert>
           )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailAnalyzer;
