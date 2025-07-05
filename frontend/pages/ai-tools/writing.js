import React, { useState } from 'react';
import Head from 'next/head';
import PageHeader from '../../components/PageHeader';
import { FileText, Zap, Send, Copy, Download, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

export default function WritingAssistance() {
  const [inputText, setInputText] = useState('');
  const [action, setAction] = useState('improve');
  const [style, setStyle] = useState('professional');
  const [length, setLength] = useState('medium');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const actions = [
    { value: 'improve', label: 'Improve Writing', description: 'Enhance clarity, flow, and readability' },
    { value: 'summarize', label: 'Summarize', description: 'Create a concise summary' },
    { value: 'expand', label: 'Expand Content', description: 'Add more detail and depth' },
    { value: 'rewrite', label: 'Rewrite', description: 'Complete rewrite with same meaning' }
  ];

  const styles = [
    { value: 'professional', label: 'Professional' },
    { value: 'casual', label: 'Casual' },
    { value: 'academic', label: 'Academic' },
    { value: 'creative', label: 'Creative' }
  ];

  const lengths = [
    { value: 'short', label: 'Short' },
    { value: 'medium', label: 'Medium' },
    { value: 'long', label: 'Long' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai-tools/writing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: inputText,
          action,
          style,
          length
        })
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data.data);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to process writing assistance');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const downloadResult = () => {
    if (!result) return;
    
    const content = `Original Text:\n${result.original}\n\nProcessed Text:\n${result.result}\n\nSuggestions:\n${result.suggestions.join('\n')}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'writing-assistance-result.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getReadabilityColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <>
      <Head>
        <title>Writing Assistance - Digame</title>
        <meta name="description" content="AI-powered writing assistance and content optimization" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <PageHeader
          title="Writing Assistance"
          subtitle="AI-powered content creation and optimization"
          badge="AI-POWERED"
        />
        
        <div className="container mx-auto px-4 py-8">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Input Text</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Enter your text here for AI-powered writing assistance..."
                      className="w-full h-40 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      required
                    />
                    <div className="mt-2 text-sm text-gray-500">
                      {inputText.split(' ').filter(word => word.length > 0).length} words
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
                      <select
                        value={action}
                        onChange={(e) => setAction(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {actions.map((act) => (
                          <option key={act.value} value={act.value}>
                            {act.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Style</label>
                      <select
                        value={style}
                        onChange={(e) => setStyle(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {styles.map((st) => (
                          <option key={st.value} value={st.value}>
                            {st.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Length</label>
                      <select
                        value={length}
                        onChange={(e) => setLength(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {lengths.map((len) => (
                          <option key={len.value} value={len.value}>
                            {len.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !inputText.trim()}
                    className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    {loading ? 'Processing...' : 'Enhance Writing'}
                  </button>
                </form>

                {/* Action Descriptions */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Selected Action:</h4>
                  <p className="text-sm text-gray-600">
                    {actions.find(act => act.value === action)?.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Results Section */}
            <div className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                    <span className="text-red-800">{error}</span>
                  </div>
                </div>
              )}

              {result && (
                <>
                  {/* Enhanced Text */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Enhanced Text</h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => copyToClipboard(result.result)}
                          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                          title="Copy to clipboard"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={downloadResult}
                          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                          title="Download result"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-800 leading-relaxed">{result.result}</p>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Text Metrics</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className={`text-2xl font-bold ${getReadabilityColor(result.metrics.readabilityScore)}`}>
                          {result.metrics.readabilityScore}
                        </div>
                        <div className="text-sm text-gray-600">Readability Score</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{result.metrics.wordCount}</div>
                        <div className="text-sm text-gray-600">Word Count</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{result.metrics.estimatedReadingTime}</div>
                        <div className="text-sm text-gray-600">Reading Time (min)</div>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">{Math.round(result.confidence * 100)}%</div>
                        <div className="text-sm text-gray-600">AI Confidence</div>
                      </div>
                    </div>
                  </div>

                  {/* Suggestions */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Suggestions</h3>
                    <div className="space-y-3">
                      {result.suggestions.map((suggestion, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span className="text-blue-800 text-sm">{suggestion}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {!result && !error && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Enter text and click "Enhance Writing" to see AI-powered improvements</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Features Overview */}
          <div className="mt-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 text-white">
            <h3 className="text-xl font-semibold mb-4">✨ Writing Assistance Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <h4 className="font-medium mb-2">📝 Content Enhancement</h4>
                <p className="text-sm text-blue-100">Improve clarity, flow, and readability of your writing</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">📊 Style Analysis</h4>
                <p className="text-sm text-blue-100">Analyze and optimize writing style for your audience</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">🎯 Smart Suggestions</h4>
                <p className="text-sm text-blue-100">Get actionable recommendations for improvement</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">⚡ Real-time Processing</h4>
                <p className="text-sm text-blue-100">Fast AI processing with instant results</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}