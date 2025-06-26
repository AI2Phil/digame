import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { Alert, AlertDescription } from '../ui/Alert';
import { Badge } from '../ui/Badge';
import { Loader2, Sparkles, Copy, Check, AlertCircle, Wand2 } from 'lucide-react';

const WritingAssistance = () => {
  const [inputText, setInputText] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [originalText, setOriginalText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [isFeatureEnabled, setIsFeatureEnabled] = useState(false);
  const [userTier, setUserTier] = useState('');

  useEffect(() => {
    checkFeatureAvailability();
  }, []);

  const checkFeatureAvailability = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      // Check user's tenant features
      const response = await fetch('http://localhost:8000/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUserTier(userData.tenant?.subscription_tier || 'basic');
        setIsFeatureEnabled(
          userData.tenant?.features?.writing_assistance === true ||
          ['professional', 'enterprise'].includes(userData.tenant?.subscription_tier)
        );
      }
    } catch (err) {
      console.error('Error checking feature availability:', err);
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
      const response = await fetch('http://localhost:8000/ai/writing-assistance/suggest', {
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
        setSuggestion(data.suggestion);
        setOriginalText(data.original_text);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to get writing suggestions. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
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
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-purple-600" />
            AI Writing Assistance
            <Badge variant="default" className="bg-purple-100 text-purple-800">
              {userTier}
            </Badge>
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
    </div>
  );
};

export default WritingAssistance;