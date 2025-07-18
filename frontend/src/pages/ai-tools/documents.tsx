import React, { useState, useRef } from 'react';
import Head from 'next/head';
import {
  FileText,
  Upload,
  Eye,
  Brain,
  Search,
  Download,
  AlertCircle,
  CheckCircle,
  TrendingUp,
} from 'lucide-react';
import PageHeader from '../../components/navigation/PageHeader';

const DocumentAnalysis: React.FC = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [analysisType, setAnalysisType] = useState('summary');
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const analysisOptions = [
    { id: 'summary', label: 'Document Summary', icon: <FileText className="w-4 h-4" /> },
    { id: 'sentiment', label: 'Sentiment Analysis', icon: <Brain className="w-4 h-4" /> },
    { id: 'keywords', label: 'Key Topics & Keywords', icon: <Search className="w-4 h-4" /> },
    { id: 'insights', label: 'Business Insights', icon: <TrendingUp className="w-4 h-4" /> },
  ];

  const mockResults = {
    summary: {
      type: 'summary',
      content: {
        executive_summary:
          'This quarterly business report demonstrates strong performance across all key metrics. Revenue increased by 23% compared to the previous quarter, driven primarily by expansion in the digital services sector. Customer satisfaction scores improved to 4.7/5, while operational efficiency gains of 15% were achieved through process automation initiatives.',
        key_points: [
          'Revenue growth of 23% quarter-over-quarter',
          'Digital services sector showing strongest performance',
          'Customer satisfaction improved to 4.7/5 stars',
          '15% operational efficiency improvement',
          'Successful automation initiatives implemented',
          'Market expansion into 3 new regions completed',
        ],
        document_stats: {
          pages: 47,
          words: 12450,
          reading_time: '25 minutes',
          complexity: 'Professional',
        },
      },
    },
    sentiment: {
      type: 'sentiment',
      content: {
        overall_sentiment: 'positive',
        confidence: 0.89,
        sentiment_breakdown: [
          { section: 'Executive Summary', sentiment: 'very positive', score: 0.92 },
          { section: 'Financial Performance', sentiment: 'positive', score: 0.85 },
          { section: 'Market Analysis', sentiment: 'neutral', score: 0.52 },
          { section: 'Challenges & Risks', sentiment: 'negative', score: -0.34 },
          { section: 'Future Outlook', sentiment: 'positive', score: 0.78 },
        ],
        emotional_indicators: [
          { emotion: 'confidence', strength: 0.87 },
          { emotion: 'optimism', strength: 0.82 },
          { emotion: 'concern', strength: 0.31 },
          { emotion: 'satisfaction', strength: 0.76 },
        ],
        tone_analysis: {
          formality: 'high',
          objectivity: 'moderate',
          urgency: 'low',
          persuasiveness: 'moderate',
        },
      },
    },
    keywords: {
      type: 'keywords',
      content: {
        primary_topics: [
          { topic: 'Revenue Growth', relevance: 0.95, mentions: 23 },
          { topic: 'Digital Transformation', relevance: 0.89, mentions: 18 },
          { topic: 'Customer Experience', relevance: 0.84, mentions: 15 },
          { topic: 'Operational Efficiency', relevance: 0.78, mentions: 12 },
          { topic: 'Market Expansion', relevance: 0.72, mentions: 9 },
        ],
        key_entities: [
          { entity: 'Q3 2024', type: 'date', frequency: 34 },
          { entity: 'Digital Services Division', type: 'organization', frequency: 28 },
          { entity: 'North American Market', type: 'location', frequency: 19 },
          { entity: 'Customer Satisfaction Survey', type: 'document', frequency: 12 },
          { entity: 'Automation Platform', type: 'technology', frequency: 15 },
        ],
        trending_phrases: [
          'digital transformation initiative',
          'customer-centric approach',
          'operational excellence',
          'sustainable growth',
          'market leadership position',
        ],
      },
    },
    insights: {
      type: 'insights',
      content: {
        business_insights: [
          {
            category: 'Growth Opportunities',
            insight:
              'Digital services sector shows 40% higher profit margins than traditional services',
            confidence: 0.91,
            impact: 'high',
          },
          {
            category: 'Risk Assessment',
            insight:
              'Heavy dependence on North American market poses geographic concentration risk',
            confidence: 0.84,
            impact: 'medium',
          },
          {
            category: 'Operational Excellence',
            insight:
              'Automation initiatives could be expanded to reduce costs by additional 8-12%',
            confidence: 0.78,
            impact: 'high',
          },
          {
            category: 'Customer Strategy',
            insight: 'Customer satisfaction improvements correlate strongly with retention rates',
            confidence: 0.93,
            impact: 'high',
          },
        ],
        recommendations: [
          {
            priority: 'high',
            action: 'Accelerate digital services expansion',
            rationale: 'Higher margins and growing market demand',
            timeline: '6 months',
          },
          {
            priority: 'medium',
            action: 'Diversify geographic presence',
            rationale: 'Reduce concentration risk and access new markets',
            timeline: '12 months',
          },
          {
            priority: 'high',
            action: 'Expand automation program',
            rationale: 'Proven ROI and efficiency gains',
            timeline: '3 months',
          },
        ],
        financial_projections: {
          revenue_forecast: '+18-25% next quarter',
          cost_reduction_potential: '8-12%',
          roi_automation: '340% over 18 months',
        },
      },
    },
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (
      file &&
      (file.type === 'application/pdf' ||
        file.type.includes('document') ||
        file.type === 'text/plain')
    ) {
      setUploadedFile(file);
      setAnalysisResult(null);
    }
  };

  const analyzeDocument = async () => {
    if (!uploadedFile) return;

    setIsAnalyzing(true);

    // Simulate analysis time
    setTimeout(() => {
      setAnalysisResult(mockResults[analysisType as keyof typeof mockResults]);
      setIsAnalyzing(false);
    }, 3000);
  };

  const getSentimentColor = (sentiment: string | number) => {
    if (typeof sentiment === 'string') {
      switch (sentiment) {
        case 'very positive':
          return 'text-green-700 bg-green-100';
        case 'positive':
          return 'text-green-600 bg-green-100';
        case 'neutral':
          return 'text-gray-600 bg-gray-100';
        case 'negative':
          return 'text-red-600 bg-red-100';
        case 'very negative':
          return 'text-red-700 bg-red-100';
        default:
          return 'text-gray-600 bg-gray-100';
      }
    }

    // Handle numeric sentiment scores
    if (sentiment > 0.6) return 'text-green-600 bg-green-100';
    if (sentiment > 0.2) return 'text-yellow-600 bg-yellow-100';
    if (sentiment > -0.2) return 'text-gray-600 bg-gray-100';
    return 'text-red-600 bg-red-100';
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'text-red-600 bg-red-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <>
      <Head>
        <title>Document Analysis - AI Tools - Digame</title>
        <meta name="description" content="AI-powered document analysis and insights" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <PageHeader title="Document Analysis"
          subtitle="Extract insights, summaries, and key information from documents"
        />

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Upload & Configuration */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Document</h3>

                {/* File Upload */}
                <div className="mb-6">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
                      Upload PDF, Word, or text document
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      Choose File
                    </button>
                  </div>
                  {uploadedFile && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">
                          {uploadedFile.name}
                        </span>
                      </div>
                      <p className="text-xs text-blue-700 mt-1">
                        Size: {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  )}
                </div>

                {/* Analysis Type */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-700 mb-3">Analysis Type</h4>
                  <div className="space-y-2">
                    {analysisOptions.map(option => (
                      <label
                        key={option.id}
                        className="flex items-center space-x-3 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="analysisType"
                          value={option.id}
                          checked={analysisType === option.id}
                          onChange={e => setAnalysisType(e.target.value)}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex items-center space-x-2">
                          {option.icon}
                          <span className="text-sm text-gray-700">{option.label}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Search Query for Keywords */}
                {analysisType === 'keywords' && (
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-700 mb-3">Focus Keywords (Optional)</h4>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="e.g., revenue, growth, strategy"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}

                {/* Analyze Button */}
                <button
                  onClick={analyzeDocument}
                  disabled={!uploadedFile || isAnalyzing}
                  className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4" />
                      <span>Analyze Document</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Results Section */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Analysis Results</h3>

                {!analysisResult ? (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">
                      Upload a document and select analysis type to see results
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Summary Results */}
                    {analysisResult.type === 'summary' && (
                      <div className="space-y-6">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Executive Summary</h4>
                          <div className="bg-blue-50 rounded-lg p-4">
                            <p className="text-gray-700 leading-relaxed">
                              {analysisResult.content.executive_summary}
                            </p>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Key Points</h4>
                          <ul className="space-y-2">
                            {analysisResult.content.key_points.map((point: string, index: number) => (
                              <li key={index} className="flex items-start space-x-2">
                                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-gray-700">{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Document Statistics</h4>
                          <div className="grid grid-cols-2 gap-4">
                            {Object.entries(analysisResult.content.document_stats).map(
                              ([key, value]) => (
                                <div key={key} className="bg-gray-50 rounded-lg p-3">
                                  <div className="text-sm text-gray-600 capitalize">
                                    {key.replace('_', ' ')}
                                  </div>
                                  <div className="font-medium text-gray-900">{String(value)}</div>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Export Options */}
                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                      <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                        <Download className="w-4 h-4" />
                        <span>Export PDF</span>
                      </button>
                      <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">
                        <Download className="w-4 h-4" />
                        <span>Export JSON</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DocumentAnalysis;
