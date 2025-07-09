import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { Alert, AlertDescription } from '../ui/Alert';
import { Badge } from '../ui/Badge';
import { Loader2, Sparkles, Copy, Check, AlertCircle, Wand2, RefreshCw } from 'lucide-react';
import { useToast } from '../ui/Toast';

const WritingAssistance = () => {
  const [inputText, setInputText] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [originalText, setOriginalText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [isFeatureEnabled, setIsFeatureEnabled] = useState(false);
  const [userTier, setUserTier] = useState('');
  const [suggestionHistory, setSuggestionHistory] = useState([]);
  const [usingFallbackData, setUsingFallbackData] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkFeatureAvailability();
    loadSuggestionHistory();
  }, []);

  const checkFeatureAvailability = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      // Try to fetch user features from database
      const response = await fetch('http://localhost:8001/api/ai/writing-assistance/features', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUserTier(userData.tier || 'professional');
        setIsFeatureEnabled(
          userData.featureEnabled === true ||
          ['professional', 'enterprise'].includes(userData.tier)
        );
        setUsingFallbackData(false);
      } else {
        throw new Error('Failed to load feature availability');
      }
    } catch (err) {
      console.warn('Failed to load feature availability from database, using fallback:', err);
      // Fallback to demo mode
      setUserTier('professional');
      setIsFeatureEnabled(true);
      setUsingFallbackData(true);
    }
  };

  const loadSuggestionHistory = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const response = await fetch('http://localhost:8001/api/ai/writing-assistance/history', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSuggestionHistory(data.data || []);
      } else {
        throw new Error('Failed to load suggestion history');
      }
    } catch (err) {
      console.warn('Failed to load suggestion history from database:', err);
      // Use fallback history data
      setSuggestionHistory([
        {
          id: 1,
          original_text: 'Sample text for improvement...',
          suggestion: 'Enhanced sample text with better clarity and structure...',
          timestamp: new Date().toISOString()
        }
      ]);
    }
  };

  const handleGetSuggestion = async () => {
    if (!inputText.trim()) {
      setError('Please enter some text to get suggestions.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuggestion('');

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:8001/api/ai/writing-assistance/suggest', {
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
        setSuggestion(data.suggestion || data.data?.suggestion);
        setOriginalText(data.original_text || data.data?.original_text || inputText);
        
        // Add to history
        setSuggestionHistory(prev => [{
          id: Date.now(),
          original_text: inputText,
          suggestion: data.suggestion || data.data?.suggestion,
          timestamp: new Date().toISOString()
        }, ...prev.slice(0, 9)]);
        
        toast({
          title: 'Suggestion Generated',
          description: 'Writing suggestion created successfully',
          variant: 'success'
        });
        setUsingFallbackData(false);
      } else {
        throw new Error('Failed to get writing suggestions');
      }
    } catch (err) {
      console.warn('Writing assistance API error, using fallback:', err);
      
      // Generate fallback suggestion
      const fallbackSuggestion = generateFallbackSuggestion(inputText);
      setSuggestion(fallbackSuggestion);
      setOriginalText(inputText);
      
      // Add to history
      setSuggestionHistory(prev => [{
        id: Date.now(),
        original_text: inputText,
        suggestion: fallbackSuggestion,
        timestamp: new Date().toISOString()
      }, ...prev.slice(0, 9)]);
      
      setUsingFallbackData(true);
      toast({
        title: 'Demo Suggestion',
        description: 'Using demo mode - database unavailable',
        variant: 'warning'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateFallbackSuggestion = (text) => {
    // Simple fallback suggestion generator
    const improvements = [
      'Consider using more active voice to make your writing more engaging.',
      'Try breaking long sentences into shorter, clearer ones.',
      'Add transitional phrases to improve flow between ideas.',
      'Use more specific and descriptive language.',
      'Consider your audience and adjust the tone accordingly.'
    ];
    
    const randomImprovement = improvements[Math.floor(Math.random() * improvements.length)];
    return `${text}\n\n[AI Suggestion]: ${randomImprovement}`;
  };

  const handleCopySuggestion = async () => {
    try {
      await navigator.clipboard.writeText(suggestion);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleApplySuggestion = () => {
    setInputText(suggestion);
    setSuggestion('');
    setOriginalText('');
  };

  const handleClear = () => {
    setInputText('');
    setSuggestion('');
    setOriginalText('');
    setError('');
  };

  if (!isFeatureEnabled) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-purple-600" />
            AI Writing Assistance
            <Badge variant="secondary">Premium Feature</Badge>
          </CardTitle>
          <CardDescription>
            AI-powered writing suggestions and improvements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              AI Writing Assistance is available for Professional and Enterprise plans. 
              Current plan: <strong>{userTier}</strong>
              {userTier === 'basic' && (
                <span className="block mt-2">
                  <Button variant="outline" size="sm" className="mt-2">
                    Upgrade to Professional
                  </Button>
                </span>
              )}
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
              <Wand2 className="h-5 w-5 text-purple-600" />
              AI Writing Assistance
              <Badge variant="default" className="bg-purple-100 text-purple-800">
                {userTier}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              {usingFallbackData && (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  Demo Data
                </Badge>
              )}
              <Button onClick={loadSuggestionHistory} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            Get AI-powered suggestions to improve your writing style, clarity, and effectiveness
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Input Section */}
          <div className="space-y-2">
            <label htmlFor="writing-input" className="text-sm font-medium text-gray-700">
              Enter your text for AI suggestions:
            </label>
            <Textarea
              id="writing-input"
              placeholder="Type or paste your text here. The AI will analyze it and provide suggestions for improvement..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="min-h-[120px] resize-none"
              disabled={isLoading}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {inputText.length} characters
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClear}
                  disabled={!inputText && !suggestion}
                >
                  Clear
                </Button>
                <Button
                  onClick={handleGetSuggestion}
                  disabled={!inputText.trim() || isLoading}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Get AI Suggestions
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Suggestion Display */}
          {suggestion && (
            <div className="space-y-4">
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  AI Suggestion:
                </h3>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <p className="text-gray-800 whitespace-pre-wrap">{suggestion}</p>
                  <div className="flex gap-2 mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopySuggestion}
                      className="flex items-center gap-1"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3 w-3" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          Copy
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleApplySuggestion}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      Apply Suggestion
                    </Button>
                  </div>
                </div>
              </div>

              {/* Original vs Improved Comparison */}
              {originalText && (
                <div className="grid md:grid-cols-2 gap-4 border-t pt-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-2">Original:</h4>
                    <div className="bg-gray-50 border rounded-lg p-3">
                      <p className="text-gray-700 text-sm whitespace-pre-wrap">{originalText}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-purple-600 mb-2">AI Improved:</h4>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                      <p className="text-gray-700 text-sm whitespace-pre-wrap">{suggestion}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Usage Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <h4 className="text-sm font-medium text-blue-800 mb-2">💡 Tips for better results:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Provide context about your audience and purpose</li>
              <li>• Include complete sentences or paragraphs</li>
              <li>• Specify the tone you want (formal, casual, professional)</li>
              <li>• Ask for specific improvements (clarity, conciseness, engagement)</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Suggestion History */}
      {suggestionHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-purple-600" />
              Recent Writing Suggestions
            </CardTitle>
            <CardDescription>
              Your previous writing assistance sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {suggestionHistory.slice(0, 5).map((item, index) => (
                <div key={item.id || index} className="border rounded-lg p-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-600 mb-2">Original:</h4>
                      <div className="bg-gray-50 border rounded-lg p-3">
                        <p className="text-gray-700 text-sm whitespace-pre-wrap">
                          {item.original_text?.substring(0, 150)}
                          {item.original_text?.length > 150 ? '...' : ''}
                        </p>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-purple-600 mb-2">AI Improved:</h4>
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                        <p className="text-gray-700 text-sm whitespace-pre-wrap">
                          {item.suggestion?.substring(0, 150)}
                          {item.suggestion?.length > 150 ? '...' : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {item.timestamp ? new Date(item.timestamp).toLocaleString() : 'Recent'}
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

export default WritingAssistance;