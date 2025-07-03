import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import PageHeader from '../../src/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../src/components/ui/card';
import { Button } from '../../src/components/ui/button';
import { Badge } from '../../src/components/ui/badge';
import { Textarea } from '../../src/components/ui/textarea';
import { Input } from '../../src/components/ui/input';
import { Progress } from '../../src/components/ui/progress';
import { 
  Video, 
  Mic, 
  Users, 
  Clock, 
  FileText, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle,
  Calendar,
  BarChart3,
  MessageSquare,
  Target,
  Brain,
  Download,
  Play,
  Pause,
  Upload
} from 'lucide-react';

const MeetingInsights = () => {
  const router = useRouter();
  const [meetingData, setMeetingData] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('analyze');
  const [meetingHistory, setMeetingHistory] = useState([]);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    fetchMeetingHistory();
  }, []);

  const fetchMeetingHistory = async () => {
    try {
      const response = await fetch('/api/ai-tools/meetings/history', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMeetingHistory(data.meetings || []);
      }
    } catch (error) {
      console.error('Error fetching meeting history:', error);
    }
  };

  const analyzeMeeting = async () => {
    if (!meetingData.trim()) return;

    try {
      setLoading(true);
      const response = await fetch('/api/ai-tools/meetings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          content: meetingData,
          action: 'analyze'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAnalysis(data);
      }
    } catch (error) {
      console.error('Error analyzing meeting:', error);
    } finally {
      setLoading(false);
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    // Implement actual recording logic here
  };

  const stopRecording = () => {
    setIsRecording(false);
    // Implement stop recording and transcription logic here
  };

  const mockAnalysis = {
    summary: {
      duration: 45,
      participants: 6,
      topics: 4,
      actionItems: 8,
      decisions: 3
    },
    keyInsights: {
      engagement: {
        score: 8.2,
        level: 'High',
        participantEngagement: [
          { name: 'John Smith', engagement: 92, speakingTime: 18 },
          { name: 'Sarah Johnson', engagement: 87, speakingTime: 22 },
          { name: 'Mike Chen', engagement: 76, speakingTime: 15 },
          { name: 'Lisa Brown', engagement: 68, speakingTime: 12 }
        ]
      },
      sentiment: {
        overall: 'Positive',
        score: 0.72,
        trends: [
          { time: '0-15min', sentiment: 0.65 },
          { time: '15-30min', sentiment: 0.78 },
          { time: '30-45min', sentiment: 0.73 }
        ]
      },
      productivity: {
        score: 7.8,
        factors: {
          focusTime: 85,
          offTopicTime: 15,
          decisionsMade: 3,
          actionItemsCreated: 8
        }
      }
    },
    topics: [
      {
        topic: 'Q4 Budget Planning',
        timeSpent: 15,
        importance: 'High',
        sentiment: 'Neutral',
        keyPoints: [
          'Budget increase of 15% approved',
          'Marketing allocation needs review',
          'IT infrastructure upgrade priority'
        ]
      },
      {
        topic: 'Product Roadmap',
        timeSpent: 18,
        importance: 'High',
        sentiment: 'Positive',
        keyPoints: [
          'New feature release scheduled for Q1',
          'User feedback integration planned',
          'Mobile app development approved'
        ]
      },
      {
        topic: 'Team Performance',
        timeSpent: 8,
        importance: 'Medium',
        sentiment: 'Positive',
        keyPoints: [
          'Team exceeded quarterly targets',
          'New hiring plan discussed',
          'Training program expansion'
        ]
      }
    ],
    actionItems: [
      {
        item: 'Finalize Q4 budget proposal',
        assignee: 'John Smith',
        dueDate: '2024-01-15',
        priority: 'High'
      },
      {
        item: 'Review marketing allocation strategy',
        assignee: 'Sarah Johnson',
        dueDate: '2024-01-20',
        priority: 'Medium'
      },
      {
        item: 'Prepare mobile app development timeline',
        assignee: 'Mike Chen',
        dueDate: '2024-01-25',
        priority: 'High'
      }
    ],
    decisions: [
      'Approved 15% budget increase for Q4',
      'Greenlit mobile app development project',
      'Scheduled quarterly team performance reviews'
    ],
    recommendations: [
      'Consider reducing off-topic discussions to improve meeting efficiency',
      'Encourage more participation from quieter team members',
      'Follow up on action items within 48 hours',
      'Schedule shorter, more focused meetings for better engagement'
    ]
  };

  const mockMeetingHistory = [
    {
      id: 1,
      title: 'Q4 Planning Meeting',
      date: '2024-01-10',
      duration: 45,
      participants: 6,
      sentiment: 'Positive',
      productivity: 8.2
    },
    {
      id: 2,
      title: 'Product Review',
      date: '2024-01-08',
      duration: 30,
      participants: 4,
      sentiment: 'Neutral',
      productivity: 7.5
    },
    {
      id: 3,
      title: 'Team Standup',
      date: '2024-01-05',
      duration: 15,
      participants: 8,
      sentiment: 'Positive',
      productivity: 9.1
    }
  ];

  const currentAnalysis = analysis || mockAnalysis;
  const currentHistory = meetingHistory.length > 0 ? meetingHistory : mockMeetingHistory;

  const getSentimentColor = (sentiment) => {
    switch (sentiment.toLowerCase()) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Meeting Insights & Analysis"
        subtitle="AI-powered meeting transcription, analysis, and productivity insights"
        icon={<Video className="h-8 w-8" />}
        breadcrumb={[
          { label: 'AI Tools', href: '/ai-tools' },
          { label: 'Meetings', href: '/ai-tools/meetings' }
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchMeetingHistory}>
              <Calendar className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        }
      />

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('analyze')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'analyze'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Brain className="h-4 w-4 inline mr-2" />
          Analyze Meeting
        </button>
        <button
          onClick={() => setActiveTab('record')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'record'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Mic className="h-4 w-4 inline mr-2" />
          Live Recording
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'history'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <FileText className="h-4 w-4 inline mr-2" />
          Meeting History
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

      {activeTab === 'analyze' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Meeting Input */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Meeting Content
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input placeholder="Meeting title" />
                  <Input placeholder="Date (YYYY-MM-DD)" />
                </div>
                
                <Textarea
                  placeholder="Paste meeting transcript, notes, or upload audio file..."
                  value={meetingData}
                  onChange={(e) => setMeetingData(e.target.value)}
                  rows={15}
                  className="min-h-[400px]"
                />
                
                <div className="flex gap-2">
                  <Button onClick={analyzeMeeting} disabled={loading || !meetingData.trim()}>
                    {loading ? 'Analyzing...' : 'Analyze Meeting'}
                  </Button>
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Audio
                  </Button>
                  <Button variant="outline" onClick={() => setMeetingData('')}>
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Meeting Summary */}
            {meetingData && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Meeting Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{currentAnalysis.summary.duration}m</div>
                      <div className="text-sm text-gray-600">Duration</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{currentAnalysis.summary.participants}</div>
                      <div className="text-sm text-gray-600">Participants</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{currentAnalysis.summary.topics}</div>
                      <div className="text-sm text-gray-600">Topics</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{currentAnalysis.summary.actionItems}</div>
                      <div className="text-sm text-gray-600">Action Items</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{currentAnalysis.summary.decisions}</div>
                      <div className="text-sm text-gray-600">Decisions</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Analysis Results */}
          <div className="space-y-6">
            {meetingData && (
              <>
                {/* Engagement Score */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Engagement
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">{currentAnalysis.keyInsights.engagement.score}</div>
                      <div className="text-sm text-gray-600">{currentAnalysis.keyInsights.engagement.level} Engagement</div>
                    </div>
                    
                    <div className="space-y-3">
                      {currentAnalysis.keyInsights.engagement.participantEngagement.map((participant, index) => (
                        <div key={index} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{participant.name}</span>
                            <span>{participant.engagement}%</span>
                          </div>
                          <Progress value={participant.engagement} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Sentiment Analysis */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Sentiment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <Badge variant="default" className="mb-2">
                        {currentAnalysis.keyInsights.sentiment.overall}
                      </Badge>
                      <div className="text-2xl font-bold">{(currentAnalysis.keyInsights.sentiment.score * 10).toFixed(1)}/10</div>
                    </div>
                  </CardContent>
                </Card>

                {/* Productivity Score */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Productivity
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">{currentAnalysis.keyInsights.productivity.score}</div>
                      <div className="text-sm text-gray-600">Productivity Score</div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Focus Time</span>
                        <span>{currentAnalysis.keyInsights.productivity.factors.focusTime}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Decisions Made</span>
                        <span>{currentAnalysis.keyInsights.productivity.factors.decisionsMade}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Action Items</span>
                        <span>{currentAnalysis.keyInsights.productivity.factors.actionItemsCreated}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      )}

      {activeTab === 'record' && (
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="h-5 w-5" />
                Live Meeting Recording
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="w-32 h-32 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                <Mic className={`h-16 w-16 ${isRecording ? 'text-red-600 animate-pulse' : 'text-gray-400'}`} />
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">
                  {isRecording ? 'Recording in Progress...' : 'Ready to Record'}
                </h3>
                <p className="text-gray-600">
                  {isRecording 
                    ? 'AI is transcribing and analyzing your meeting in real-time'
                    : 'Click start to begin recording and real-time analysis'
                  }
                </p>
              </div>

              <div className="flex gap-4 justify-center">
                {!isRecording ? (
                  <Button onClick={startRecording} size="lg">
                    <Play className="h-5 w-5 mr-2" />
                    Start Recording
                  </Button>
                ) : (
                  <Button onClick={stopRecording} variant="destructive" size="lg">
                    <Pause className="h-5 w-5 mr-2" />
                    Stop Recording
                  </Button>
                )}
              </div>

              {isRecording && (
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="flex items-center justify-center gap-2 text-red-600">
                    <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                    <span className="font-medium">Live Recording - 00:05:23</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-6">
          {/* Action Items & Decisions */}
          {meetingData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Action Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {currentAnalysis.actionItems.map((item, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-sm">{item.item}</h4>
                          <Badge variant={getPriorityColor(item.priority)}>
                            {item.priority}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-600">
                          <div>Assigned to: {item.assignee}</div>
                          <div>Due: {item.dueDate}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Key Decisions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {currentAnalysis.decisions.map((decision, index) => (
                      <div key={index} className="p-3 bg-green-50 rounded-lg">
                        <div className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{decision}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Meeting History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Recent Meetings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentHistory.map((meeting) => (
                  <div key={meeting.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <h4 className="font-medium">{meeting.title}</h4>
                      <div className="text-sm text-gray-600 mt-1">
                        <span>{meeting.date}</span> • 
                        <span className="ml-1">{meeting.duration} min</span> • 
                        <span className="ml-1">{meeting.participants} participants</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {meeting.sentiment}
                      </Badge>
                      <div className="text-sm font-medium">
                        {meeting.productivity}/10
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Export
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Meetings</p>
                  <p className="text-2xl font-bold">156</p>
                </div>
                <Video className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Productivity</p>
                  <p className="text-2xl font-bold text-green-600">8.2</p>
                </div>
                <Target className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Hours</p>
                  <p className="text-2xl font-bold">89</p>
                </div>
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Action Items</p>
                  <p className="text-2xl font-bold">342</p>
                </div>
                <CheckCircle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MeetingInsights;