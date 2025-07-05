import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import PageHeader from '../../components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../src/components/ui/card';
import { Button } from '../../src/components/ui/button';
import { Badge } from '../../src/components/ui/badge';
import { Textarea } from '../../src/components/ui/textarea';
import { Input } from '../../src/components/ui/input';
import { 
  Mail, 
  Send, 
  Inbox, 
  Star, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Filter,
  Search,
  BarChart3,
  MessageSquare,
  Users,
  Calendar
} from 'lucide-react';

const EmailAnalysis = () => {
  const router = useRouter();
  const [emailContent, setEmailContent] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('compose');
  const [emailHistory, setEmailHistory] = useState([]);

  useEffect(() => {
    fetchEmailHistory();
  }, []);

  const fetchEmailHistory = async () => {
    try {
      const response = await fetch('/api/ai-tools/email/history', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setEmailHistory(data.emails || []);
      }
    } catch (error) {
      console.error('Error fetching email history:', error);
    }
  };

  const analyzeEmail = async () => {
    if (!emailContent.trim()) return;

    try {
      setLoading(true);
      const response = await fetch('/api/ai-tools/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          content: emailContent,
          action: 'analyze'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAnalysis(data);
      }
    } catch (error) {
      console.error('Error analyzing email:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateEmail = async (prompt, type = 'compose') => {
    try {
      setLoading(true);
      const response = await fetch('/api/ai-tools/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          prompt,
          type,
          action: 'generate'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setEmailContent(data.content);
      }
    } catch (error) {
      console.error('Error generating email:', error);
    } finally {
      setLoading(false);
    }
  };

  const mockAnalysis = {
    sentiment: {
      score: 0.7,
      label: 'Positive',
      confidence: 0.85
    },
    tone: {
      primary: 'Professional',
      secondary: 'Friendly',
      formality: 'Formal'
    },
    urgency: {
      level: 'Medium',
      score: 0.6,
      indicators: ['deadline mentioned', 'follow-up requested']
    },
    keyTopics: [
      { topic: 'Project Update', confidence: 0.92 },
      { topic: 'Meeting Request', confidence: 0.78 },
      { topic: 'Budget Discussion', confidence: 0.65 }
    ],
    suggestions: [
      'Consider adding a clear call-to-action',
      'The tone is appropriate for business communication',
      'Email length is optimal for engagement'
    ],
    readability: {
      score: 8.2,
      level: 'Easy to read',
      avgSentenceLength: 15.3
    },
    actionItems: [
      'Schedule follow-up meeting',
      'Review budget proposal',
      'Send project timeline'
    ]
  };

  const mockEmailHistory = [
    {
      id: 1,
      subject: 'Project Status Update',
      recipient: 'team@company.com',
      sentiment: 'Positive',
      timestamp: '2 hours ago',
      status: 'sent'
    },
    {
      id: 2,
      subject: 'Meeting Follow-up',
      recipient: 'client@example.com',
      sentiment: 'Neutral',
      timestamp: '1 day ago',
      status: 'sent'
    },
    {
      id: 3,
      subject: 'Budget Proposal Review',
      recipient: 'finance@company.com',
      sentiment: 'Professional',
      timestamp: '3 days ago',
      status: 'draft'
    }
  ];

  const emailTemplates = [
    {
      name: 'Meeting Request',
      prompt: 'Write a professional email requesting a meeting to discuss project progress'
    },
    {
      name: 'Follow-up',
      prompt: 'Write a polite follow-up email for a previous conversation'
    },
    {
      name: 'Thank You',
      prompt: 'Write a thank you email after a successful meeting'
    },
    {
      name: 'Project Update',
      prompt: 'Write an email updating stakeholders on project status'
    }
  ];

  const currentAnalysis = analysis || mockAnalysis;
  const currentHistory = emailHistory.length > 0 ? emailHistory : mockEmailHistory;

  const getSentimentColor = (sentiment) => {
    switch (sentiment.toLowerCase()) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getSentimentBadge = (sentiment) => {
    switch (sentiment.toLowerCase()) {
      case 'positive': return 'default';
      case 'negative': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Email Analysis & Generation"
        subtitle="AI-powered email composition, analysis, and optimization"
        icon={<Mail className="h-8 w-8" />}
        breadcrumb={[
          { label: 'AI Tools', href: '/ai-tools' },
          { label: 'Email', href: '/ai-tools/email' }
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchEmailHistory}>
              <Inbox className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        }
      />

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('compose')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'compose'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Send className="h-4 w-4 inline mr-2" />
          Compose & Analyze
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'history'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Inbox className="h-4 w-4 inline mr-2" />
          Email History
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'analytics'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <BarChart3 className="h-4 w-4 inline mr-2" />
          Analytics
        </button>
      </div>

      {activeTab === 'compose' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Email Composer */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Email Composer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input placeholder="To: recipient@example.com" />
                  <Input placeholder="Subject: Email subject" />
                </div>
                
                <Textarea
                  placeholder="Write your email content here or use AI generation..."
                  value={emailContent}
                  onChange={(e) => setEmailContent(e.target.value)}
                  rows={12}
                  className="min-h-[300px]"
                />
                
                <div className="flex gap-2">
                  <Button onClick={analyzeEmail} disabled={loading || !emailContent.trim()}>
                    {loading ? 'Analyzing...' : 'Analyze Email'}
                  </Button>
                  <Button variant="outline" onClick={() => setEmailContent('')}>
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Templates */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {emailTemplates.map((template, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      onClick={() => generateEmail(template.prompt)}
                      disabled={loading}
                      className="justify-start h-auto p-3"
                    >
                      <div className="text-left">
                        <div className="font-medium">{template.name}</div>
                        <div className="text-xs text-gray-500 mt-1">{template.prompt}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Analysis Results */}
          <div className="space-y-6">
            {emailContent && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Email Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Sentiment Analysis */}
                  <div className="space-y-2">
                    <h4 className="font-medium">Sentiment</h4>
                    <div className="flex items-center justify-between">
                      <Badge variant={getSentimentBadge(currentAnalysis.sentiment.label)}>
                        {currentAnalysis.sentiment.label}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {(currentAnalysis.sentiment.confidence * 100).toFixed(0)}% confidence
                      </span>
                    </div>
                  </div>

                  {/* Tone Analysis */}
                  <div className="space-y-2">
                    <h4 className="font-medium">Tone</h4>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-sm">Primary:</span>
                        <span className="text-sm font-medium">{currentAnalysis.tone.primary}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Formality:</span>
                        <span className="text-sm font-medium">{currentAnalysis.tone.formality}</span>
                      </div>
                    </div>
                  </div>

                  {/* Urgency Level */}
                  <div className="space-y-2">
                    <h4 className="font-medium">Urgency</h4>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{currentAnalysis.urgency.level}</Badge>
                      {currentAnalysis.urgency.level === 'High' && <AlertCircle className="h-4 w-4 text-red-500" />}
                      {currentAnalysis.urgency.level === 'Medium' && <Clock className="h-4 w-4 text-yellow-500" />}
                      {currentAnalysis.urgency.level === 'Low' && <CheckCircle className="h-4 w-4 text-green-500" />}
                    </div>
                  </div>

                  {/* Key Topics */}
                  <div className="space-y-2">
                    <h4 className="font-medium">Key Topics</h4>
                    <div className="space-y-1">
                      {currentAnalysis.keyTopics.map((topic, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm">{topic.topic}</span>
                          <span className="text-xs text-gray-500">
                            {(topic.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Readability Score */}
                  <div className="space-y-2">
                    <h4 className="font-medium">Readability</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{currentAnalysis.readability.level}</span>
                      <Badge variant="default">{currentAnalysis.readability.score}/10</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Suggestions */}
            {emailContent && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Suggestions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {currentAnalysis.suggestions.map((suggestion, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 bg-blue-50 rounded">
                        <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{suggestion}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Items */}
            {emailContent && currentAnalysis.actionItems.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Action Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {currentAnalysis.actionItems.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Inbox className="h-5 w-5" />
              Email History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {currentHistory.map((email) => (
                <div key={email.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{email.subject}</h4>
                      <Badge variant={email.status === 'sent' ? 'default' : 'secondary'}>
                        {email.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">To: {email.recipient}</p>
                    <p className="text-xs text-gray-500">{email.timestamp}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getSentimentBadge(email.sentiment)}>
                      {email.sentiment}
                    </Badge>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Emails Analyzed</p>
                  <p className="text-2xl font-bold">247</p>
                </div>
                <Mail className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Sentiment Score</p>
                  <p className="text-2xl font-bold text-green-600">7.2</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Response Rate</p>
                  <p className="text-2xl font-bold">89%</p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default EmailAnalysis;