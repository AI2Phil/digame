import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { Input } from '../ui/Input';
import { Alert, AlertDescription, AlertTitle } from '../ui/Alert';
import { Badge } from '../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { Loader2, Sparkles, Languages, BookOpen, AlertCircle, Info, Zap, Repeat, RefreshCw } from 'lucide-react';
import { useToast } from '../ui/Toast';

const LanguageTool = () => {
  const [activeToolTab, setActiveToolTab] = useState('translate'); // 'translate' or 'define'

  // Translation state
  const [textToTranslate, setTextToTranslate] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('Spanish');
  const [sourceLanguage, setSourceLanguage] = useState('');
  const [translationResult, setTranslationResult] = useState(null);

  // Definition state
  const [wordToDefine, setWordToDefine] = useState('');
  const [definitionLanguage, setDefinitionLanguage] = useState('English');
  const [definitionResult, setDefinitionResult] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [userTenantInfo, setUserTenantInfo] = useState({ tier: 'basic', featureEnabled: false });
  const [translationHistory, setTranslationHistory] = useState([]);
  const [definitionHistory, setDefinitionHistory] = useState([]);
  const [usingFallbackData, setUsingFallbackData] = useState(false);

  const { toast } = useToast();

  // Supported languages (example list)
  const languages = [
    { value: 'English', label: 'English' }, { value: 'Spanish', label: 'Spanish' },
    { value: 'French', label: 'French' }, { value: 'German', label: 'German' },
    { value: 'Italian', label: 'Italian' }, { value: 'Portuguese', label: 'Portuguese' },
    { value: 'Dutch', label: 'Dutch' }, { value: 'Russian', label: 'Russian' },
    { value: 'Chinese', label: 'Chinese' }, { value: 'Japanese', label: 'Japanese' },
    { value: 'Korean', label: 'Korean' }, { value: 'Arabic', label: 'Arabic' },
  ];


  useEffect(() => {
    checkFeatureAvailability();
    loadHistory();
  }, []);

  const checkFeatureAvailability = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setUserTenantInfo({ tier: 'unknown', featureEnabled: false });
        return;
      }

      // Try to fetch user features from database
      const response = await fetch('http://localhost:8001/api/ai/language-tools/features', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUserTenantInfo({
          tier: data.tier || 'professional',
          featureEnabled: data.featureEnabled || true
        });
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
      setUsingFallbackData(true);
    }
  };

  const loadHistory = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const [translationsRes, definitionsRes] = await Promise.all([
        fetch('http://localhost:8001/api/ai/language-tools/translations/history', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        }),
        fetch('http://localhost:8001/api/ai/language-tools/definitions/history', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        })
      ]);

      if (translationsRes.ok && definitionsRes.ok) {
        const [translationsData, definitionsData] = await Promise.all([
          translationsRes.json(),
          definitionsRes.json()
        ]);
        
        setTranslationHistory(translationsData.data || []);
        setDefinitionHistory(definitionsData.data || []);
      } else {
        throw new Error('Failed to load history');
      }
    } catch (err) {
      console.warn('Failed to load history from database:', err);
      // Use fallback history data
      setTranslationHistory([
        {
          id: 1,
          original_text: 'Hello world',
          translated_text: 'Hola mundo',
          source_language: 'English',
          target_language: 'Spanish',
          timestamp: new Date().toISOString()
        }
      ]);
      setDefinitionHistory([
        {
          id: 1,
          word: 'example',
          definition: 'A thing characteristic of its kind or illustrating a general rule.',
          example: 'This is an example sentence.',
          language: 'English',
          timestamp: new Date().toISOString()
        }
      ]);
    }
  };

  const handleTranslate = async () => {
    if (!textToTranslate.trim()) {
      setError('Please enter text to translate.');
      return;
    }
    if (!targetLanguage.trim()) {
        setError('Please select a target language.');
        return;
    }

    setIsLoading(true);
    setError('');
    setTranslationResult(null);

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError("You must be logged in to use this feature.");
        setIsLoading(false);
        return;
      }

      const payload = {
        text: textToTranslate,
        target_language: targetLanguage,
      };
      if (sourceLanguage.trim()) {
        payload.source_language = sourceLanguage;
      }

      const response = await fetch('http://localhost:8001/api/ai/language-tools/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        setTranslationResult(data.data || data);
        
        // Add to history
        setTranslationHistory(prev => [{
          id: Date.now(),
          original_text: textToTranslate,
          translated_text: data.translated_text || data.data?.translated_text,
          source_language: data.source_language || data.data?.source_language || sourceLanguage || 'Auto-detected',
          target_language: targetLanguage,
          timestamp: new Date().toISOString()
        }, ...prev.slice(0, 9)]);
        
        toast({
          title: "Translation Complete",
          description: "Text translated successfully.",
          variant: "success"
        });
        setUsingFallbackData(false);
      } else {
        throw new Error('Failed to translate text');
      }
    } catch (err) {
      console.warn("Translation API error, using fallback:", err);
      
      // Generate fallback translation
      const fallbackTranslation = {
        original_text: textToTranslate,
        translated_text: `[Demo Translation to ${targetLanguage}]: ${textToTranslate}`,
        source_language: sourceLanguage || 'Auto-detected',
        target_language: targetLanguage,
        model_provider: 'demo'
      };
      
      setTranslationResult(fallbackTranslation);
      setTranslationHistory(prev => [{
        id: Date.now(),
        ...fallbackTranslation,
        timestamp: new Date().toISOString()
      }, ...prev.slice(0, 9)]);
      
      setUsingFallbackData(true);
      toast({
        title: "Demo Translation",
        description: "Using demo mode - database unavailable",
        variant: "warning"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDefineWord = async () => {
    if (!wordToDefine.trim()) {
      setError('Please enter a word to define.');
      return;
    }
    if (!definitionLanguage.trim()) {
        setError('Please select a language for the definition.');
        return;
    }
    setIsLoading(true);
    setError('');
    setDefinitionResult(null);

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError("You must be logged in to use this feature.");
        setIsLoading(false);
        return;
      }

      const response = await fetch('http://localhost:8001/api/ai/language-tools/define', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ word: wordToDefine, language: definitionLanguage })
      });

      if (response.ok) {
        const data = await response.json();
        setDefinitionResult(data.data || data);
        
        // Add to history
        setDefinitionHistory(prev => [{
          id: Date.now(),
          word: wordToDefine,
          definition: data.definition || data.data?.definition,
          example: data.example || data.data?.example,
          language: definitionLanguage,
          timestamp: new Date().toISOString()
        }, ...prev.slice(0, 9)]);
        
        toast({
          title: "Definition Found",
          description: `Definition for "${wordToDefine}" retrieved.`,
          variant: "success"
        });
        setUsingFallbackData(false);
      } else {
        throw new Error('Failed to get definition');
      }
    } catch (err) {
      console.warn("Definition API error, using fallback:", err);
      
      // Generate fallback definition
      const fallbackDefinition = {
        word: wordToDefine,
        definition: `[Demo Definition]: A word or term in ${definitionLanguage} language.`,
        example: `Example: "${wordToDefine}" is used in this context.`,
        language: definitionLanguage,
        model_provider: 'demo'
      };
      
      setDefinitionResult(fallbackDefinition);
      setDefinitionHistory(prev => [{
        id: Date.now(),
        ...fallbackDefinition,
        timestamp: new Date().toISOString()
      }, ...prev.slice(0, 9)]);
      
      setUsingFallbackData(true);
      toast({
        title: "Demo Definition",
        description: "Using demo mode - database unavailable",
        variant: "warning"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = (toolType) => {
    if (toolType === 'translate') {
      setTextToTranslate('');
      setTargetLanguage('Spanish');
      setSourceLanguage('');
      setTranslationResult(null);
    } else if (toolType === 'define') {
      setWordToDefine('');
      setDefinitionLanguage('English');
      setDefinitionResult(null);
    }
    setError('');
  };

  if (!userTenantInfo.featureEnabled && userTenantInfo.tier !== 'unknown') {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="h-5 w-5 text-indigo-600" />
            Language Tools
            <Badge variant="secondary">Premium Feature</Badge>
          </CardTitle>
          <CardDescription>
            Translate text and get word definitions across multiple languages.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="default" className="border-indigo-500">
            <Zap className="h-4 w-4 !text-indigo-600" />
            <AlertTitle className="text-indigo-700">Feature Not Available</AlertTitle>
            <AlertDescription>
              Language Tools are available for Professional and Enterprise plans.
              Your current plan: <strong className="capitalize">{userTenantInfo.tier}</strong>.
              <Button variant="outline" size="sm" className="mt-3 w-full hover:bg-indigo-50" onClick={() => alert('Navigate to pricing page')}>
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
              <Languages className="h-5 w-5 text-indigo-600" />
              Language Tools
              {userTenantInfo.tier && <Badge variant="outline" className="capitalize">{userTenantInfo.tier}</Badge>}
            </div>
            <div className="flex items-center space-x-2">
              {usingFallbackData && (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  Demo Data
                </Badge>
              )}
              <Button onClick={loadHistory} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            Translate text or get word definitions using AI.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeToolTab} onValueChange={setActiveToolTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="translate" className="flex items-center gap-1.5">
                <Repeat className="h-4 w-4" /> Translate Text
              </TabsTrigger>
              <TabsTrigger value="define" className="flex items-center gap-1.5">
                <BookOpen className="h-4 w-4" /> Define Word
              </TabsTrigger>
            </TabsList>

            {/* Translator Tab */}
            <TabsContent value="translate" className="pt-6 space-y-4">
              <div className="space-y-2">
                <label htmlFor="translate-input" className="text-sm font-medium">Text to Translate:</label>
                <Textarea
                  id="translate-input"
                  placeholder="Enter text you want to translate..."
                  value={textToTranslate}
                  onChange={(e) => setTextToTranslate(e.target.value)}
                  className="min-h-[120px] resize-none focus:border-indigo-500"
                  disabled={isLoading}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="source-lang" className="text-sm font-medium">Source Language (Optional):</label>
                  <Input
                    id="source-lang"
                    placeholder="e.g., English or auto-detect"
                    value={sourceLanguage}
                    onChange={(e) => setSourceLanguage(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="target-lang" className="text-sm font-medium">Target Language:</label>
                  <select
                    id="target-lang"
                    value={targetLanguage}
                    onChange={(e) => setTargetLanguage(e.target.value)}
                    className="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    disabled={isLoading}
                  >
                    {languages.map(lang => <option key={lang.value} value={lang.value}>{lang.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                 <Button variant="outline" size="sm" onClick={() => handleClear('translate')} disabled={isLoading}>Clear</Button>
                 <Button onClick={handleTranslate} disabled={!textToTranslate.trim() || isLoading} className="bg-indigo-600 hover:bg-indigo-700">
                  {isLoading && activeToolTab === 'translate' ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                  Translate
                </Button>
              </div>
              {translationResult && activeToolTab === 'translate' && (
                <Card className="bg-gray-50/50 mt-4">
                  <CardHeader><CardTitle className="text-md">Translation Result</CardTitle></CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p><strong>Original:</strong> <span className="text-gray-700">{translationResult.original_text}</span></p>
                    <p><strong>Translated ({translationResult.target_language}):</strong> <span className="font-semibold text-indigo-700">{translationResult.translated_text}</span></p>
                    <p className="text-xs text-gray-500">Detected Source: {translationResult.source_language} | Provider: {translationResult.model_provider}</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Definition Tab */}
            <TabsContent value="define" className="pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="word-define" className="text-sm font-medium">Word to Define:</label>
                  <Input
                    id="word-define"
                    placeholder="Enter a single word"
                    value={wordToDefine}
                    onChange={(e) => setWordToDefine(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="define-lang" className="text-sm font-medium">Language of Word:</label>
                   <select
                    id="define-lang"
                    value={definitionLanguage}
                    onChange={(e) => setDefinitionLanguage(e.target.value)}
                    className="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    disabled={isLoading}
                  >
                    {languages.map(lang => <option key={lang.value} value={lang.value}>{lang.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => handleClear('define')} disabled={isLoading}>Clear</Button>
                <Button onClick={handleDefineWord} disabled={!wordToDefine.trim() || isLoading} className="bg-indigo-600 hover:bg-indigo-700">
                  {isLoading && activeToolTab === 'define' ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                  Get Definition
                </Button>
              </div>
              {definitionResult && activeToolTab === 'define' && (
                 <Card className="bg-gray-50/50 mt-4">
                  <CardHeader><CardTitle className="text-md">Definition for "{definitionResult.word}" ({definitionResult.language})</CardTitle></CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p><strong>Definition:</strong> <span className="text-gray-700">{definitionResult.definition}</span></p>
                    <p><strong>Example:</strong> <span className="italic text-gray-700">{definitionResult.example}</span></p>
                     <p className="text-xs text-gray-500">Provider: {definitionResult.model_provider}</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!isLoading && !translationResult && !definitionResult && !error && (
             <Alert variant="default" className="border-indigo-300 bg-indigo-50 mt-4">
                <Info className="h-4 w-4 !text-indigo-600" />
                <AlertDescription className="text-indigo-700">
                  Select a tool (Translate or Define) and input the required information to get started.
                </AlertDescription>
              </Alert>
           )}
        </CardContent>
      </Card>

      {/* History Section */}
      {(translationHistory.length > 0 || definitionHistory.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Languages className="h-5 w-5 text-indigo-600" />
              Recent Language Tool Usage
            </CardTitle>
            <CardDescription>
              Your previous translations and definitions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="translations">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="translations">Translations ({translationHistory.length})</TabsTrigger>
                <TabsTrigger value="definitions">Definitions ({definitionHistory.length})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="translations" className="space-y-4 mt-4">
                {translationHistory.slice(0, 5).map((item, index) => (
                  <div key={item.id || index} className="border rounded-lg p-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-600 mb-1">Original ({item.source_language}):</h4>
                        <p className="text-gray-800 bg-gray-50 p-2 rounded">{item.original_text}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-indigo-600 mb-1">Translation ({item.target_language}):</h4>
                        <p className="text-gray-800 bg-indigo-50 p-2 rounded">{item.translated_text}</p>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      {item.timestamp ? new Date(item.timestamp).toLocaleString() : 'Recent'}
                    </div>
                  </div>
                ))}
                {translationHistory.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No translation history available</p>
                )}
              </TabsContent>
              
              <TabsContent value="definitions" className="space-y-4 mt-4">
                {definitionHistory.slice(0, 5).map((item, index) => (
                  <div key={item.id || index} className="border rounded-lg p-4">
                    <div className="mb-2">
                      <h4 className="text-lg font-medium text-indigo-600">{item.word}</h4>
                      <Badge variant="outline" className="text-xs">{item.language}</Badge>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium text-gray-600">Definition:</span>
                        <p className="text-gray-800">{item.definition}</p>
                      </div>
                      {item.example && (
                        <div>
                          <span className="text-sm font-medium text-gray-600">Example:</span>
                          <p className="text-gray-700 italic">{item.example}</p>
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      {item.timestamp ? new Date(item.timestamp).toLocaleString() : 'Recent'}
                    </div>
                  </div>
                ))}
                {definitionHistory.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No definition history available</p>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LanguageTool;
