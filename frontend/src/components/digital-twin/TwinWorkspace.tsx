import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import {
  MessageSquare,
  Send,
  Bot,
  User,
  Clock,
  Brain,
  Target,
  TrendingUp,
  Lightbulb,
  Settings,
  RefreshCw,
  Mic,
  MicOff,
  FileText,
  BarChart3,
  Database
} from 'lucide-react';
import { useToastHelpers } from '../ui/Toaster';
import { digitalTwinApi } from '../../services/digitalTwinApi';

interface TwinWorkspaceProps {
  twinId: string;
}

interface Message {
  id: string;
  type: 'user' | 'twin';
  content: string;
  timestamp: Date;
  intent?: string;
  confidence?: number;
  suggestions?: string[];
}

interface IntentClassification {
  intent: string;
  confidence: number;
  entities: Record<string, any>;
  suggestions: string[];
}

export const TwinWorkspace: React.FC<TwinWorkspaceProps> = ({ twinId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentIntent, setCurrentIntent] = useState<IntentClassification | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [usingFallbackData, setUsingFallbackData] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const toast = useToastHelpers();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversationHistory = async () => {
    try {
      setError(null);
      const response = await digitalTwinApi.getTwinInteractions(undefined, 20);
      if (response.success && response.data) {
        const historyMessages: Message[] = response.data.interactions.map(interaction => [
          {
            id: `${interaction.id}-input`,
            type: 'user' as const,
            content: interaction.input_data?.query || 'Previous interaction',
            timestamp: new Date(interaction.created_at || Date.now()),
          },
          {
            id: `${interaction.id}-response`,
            type: 'twin' as const,
            content: interaction.response_data?.text || 'Previous response',
            timestamp: new Date(interaction.created_at || Date.now()),
            confidence: interaction.response_data?.confidence,
          }
        ]).flat().sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

        setMessages(historyMessages);
        setUsingFallbackData(false);
        toast.success("Workspace conversation history loaded successfully");
      }
    } catch (error: any) {
      console.error('Failed to load conversation history:', error);
      setError(error.message || "Failed to load conversation history");
      
      // Load enhanced fallback workspace conversation
      loadFallbackWorkspaceConversation();
      toast.warning("Using demo workspace conversation - Digital Twin API currently unavailable");
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Load conversation history
    loadConversationHistory();
  }, [twinId, loadConversationHistory]);

  const loadFallbackWorkspaceConversation = () => {
    // Enhanced fallback workspace conversation with intent classification
    const fallbackMessages: Message[] = [
      {
        id: `workspace_${Date.now()}_1`,
        type: 'user',
        content: 'Show me my recent productivity patterns',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
        intent: 'pattern_analysis',
      },
      {
        id: `workspace_${Date.now()}_2`,
        type: 'twin',
        content: 'I\'ve analyzed your productivity patterns over the last two weeks. You show consistent peak performance between 9-11 AM with 87% efficiency. Your focus sessions average 85 minutes, and you\'re most productive on Tuesdays and Wednesdays.',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000 + 45000), // 3 hours ago + 45 seconds
        confidence: 0.89,
        intent: 'pattern_analysis',
        suggestions: ['Analyze focus time patterns', 'Show weekly productivity trends', 'Display energy level patterns']
      },
      {
        id: `workspace_${Date.now()}_3`,
        type: 'user',
        content: 'Generate productivity predictions for next week',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        intent: 'prediction_request',
      },
      {
        id: `workspace_${Date.now()}_4`,
        type: 'twin',
        content: 'Based on your historical patterns, next week I predict: Monday 78% productivity, Tuesday 92% (peak day), Wednesday 88%, Thursday 82%, Friday 75%. I recommend scheduling your most important tasks on Tuesday and Wednesday mornings.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 60000), // 2 hours ago + 1 minute
        confidence: 0.84,
        intent: 'prediction_request',
        suggestions: ['Get task completion forecast', 'Predict energy levels', 'Show optimization opportunities']
      },
      {
        id: `workspace_${Date.now()}_5`,
        type: 'user',
        content: 'What recommendations do you have for improving my productivity?',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        intent: 'recommendation_request',
      },
      {
        id: `workspace_${Date.now()}_6`,
        type: 'twin',
        content: 'Here are my top recommendations: 1) Extend your morning focus blocks to 90 minutes, 2) Schedule breaks every 90 minutes to maintain energy, 3) Batch similar tasks together, 4) Avoid meetings before 11 AM when possible, 5) Use your Tuesday/Wednesday peak days for complex work.',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000 + 75000), // 1 hour ago + 75 seconds
        confidence: 0.91,
        intent: 'recommendation_request',
        suggestions: ['Get schedule optimization tips', 'Show focus strategies', 'Analyze workflow efficiency']
      }
    ];

    setMessages(fallbackMessages);
    setUsingFallbackData(true);
    
    // Set current intent based on last message
    setCurrentIntent({
      intent: 'recommendation_request',
      confidence: 0.91,
      entities: { category: 'productivity', urgency: 'normal' },
      suggestions: ['Get schedule optimization tips', 'Show focus strategies', 'Analyze workflow efficiency']
    });
  };

  const _classify_intent = (query: string): IntentClassification => {
    const queryLower = query.toLowerCase();
    
    // Intent classification logic
    if (queryLower.includes('predict') || queryLower.includes('forecast') || queryLower.includes('future')) {
      return {
        intent: 'prediction_request',
        confidence: 0.9,
        entities: { type: 'productivity', timeframe: 'week' },
        suggestions: [
          'Generate productivity forecast for next week',
          'Predict task completion rates',
          'Show energy level predictions'
        ]
      };
    }
    
    if (queryLower.includes('pattern') || queryLower.includes('trend') || queryLower.includes('behavior')) {
      return {
        intent: 'pattern_analysis',
        confidence: 0.85,
        entities: { type: 'behavioral', scope: 'recent' },
        suggestions: [
          'Show my productivity patterns',
          'Analyze work behavior trends',
          'Display focus time patterns'
        ]
      };
    }
    
    if (queryLower.includes('recommend') || queryLower.includes('suggest') || queryLower.includes('advice')) {
      return {
        intent: 'recommendation_request',
        confidence: 0.8,
        entities: { category: 'productivity', urgency: 'normal' },
        suggestions: [
          'Get productivity recommendations',
          'Suggest schedule optimizations',
          'Recommend focus strategies'
        ]
      };
    }
    
    if (queryLower.includes('status') || queryLower.includes('progress') || queryLower.includes('how am i')) {
      return {
        intent: 'status_inquiry',
        confidence: 0.9,
        entities: { metric: 'overall', period: 'current' },
        suggestions: [
          'Show my current progress',
          'Display productivity status',
          'Check learning progress'
        ]
      };
    }
    
    if (queryLower.includes('schedule') || queryLower.includes('calendar') || queryLower.includes('time')) {
      return {
        intent: 'schedule_optimization',
        confidence: 0.75,
        entities: { scope: 'daily', focus: 'optimization' },
        suggestions: [
          'Optimize my daily schedule',
          'Suggest better time blocks',
          'Analyze calendar efficiency'
        ]
      };
    }
    
    // Default intent
    return {
      intent: 'general_inquiry',
      confidence: 0.6,
      entities: {},
      suggestions: [
        'Ask about productivity patterns',
        'Request predictions',
        'Get recommendations'
      ]
    };
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    // Classify intent before sending
    const intentClassification = _classify_intent(inputValue.trim());
    setCurrentIntent(intentClassification);

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
      intent: intentClassification.intent,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Use Phase 2 conversation engine
      const response = await fetch('/api/twin/phase2/conversation/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          twin_id: twinId,
          query: userMessage.content,
          context: {
            intent: intentClassification.intent,
            entities: intentClassification.entities,
            conversation_history: messages.slice(-5),
            timestamp: new Date().toISOString(),
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      const twinMessage: Message = {
        id: `twin-${Date.now()}`,
        type: 'twin',
        content: data.response || 'I received your message but had trouble generating a response.',
        timestamp: new Date(),
        confidence: data.confidence,
        suggestions: data.actions || intentClassification.suggestions,
        intent: data.intent,
      };

      setMessages(prev => [...prev, twinMessage]);
      
      // Update current intent with actual classified intent
      if (data.intent !== intentClassification.intent) {
        setCurrentIntent({
          intent: data.intent,
          confidence: data.confidence,
          entities: intentClassification.entities,
          suggestions: data.actions || []
        });
      }
    } catch (error: any) {
      console.error('Failed to send message:', error);
      toast.error(error.message || "Failed to send message to twin");

      // Generate enhanced fallback response with intent classification
      const fallbackResponse = generateFallbackWorkspaceResponse(userMessage.content, intentClassification);
      const twinMessage: Message = {
        id: `twin-${Date.now()}`,
        type: 'twin',
        content: fallbackResponse.content,
        timestamp: new Date(),
        confidence: fallbackResponse.confidence,
        suggestions: fallbackResponse.suggestions,
        intent: intentClassification.intent,
      };
      setMessages(prev => [...prev, twinMessage]);
      setUsingFallbackData(true);
      toast.warning("Using demo workspace response - Digital Twin API currently unavailable");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getIntentIcon = (intent?: string) => {
    switch (intent) {
      case 'prediction_request': return <TrendingUp className="h-4 w-4" />;
      case 'pattern_analysis': return <BarChart3 className="h-4 w-4" />;
      case 'recommendation_request': return <Lightbulb className="h-4 w-4" />;
      case 'status_inquiry': return <Target className="h-4 w-4" />;
      case 'schedule_optimization': return <Clock className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getIntentColor = (intent?: string) => {
    switch (intent) {
      case 'prediction_request': return 'text-blue-600 bg-blue-50';
      case 'pattern_analysis': return 'text-green-600 bg-green-50';
      case 'recommendation_request': return 'text-yellow-600 bg-yellow-50';
      case 'status_inquiry': return 'text-purple-600 bg-purple-50';
      case 'schedule_optimization': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const quickActions = [
    { 
      label: 'Show Patterns', 
      intent: 'pattern_analysis',
      query: 'Show me my recent productivity patterns',
      icon: <BarChart3 className="h-4 w-4" />
    },
    { 
      label: 'Get Predictions', 
      intent: 'prediction_request',
      query: 'Generate productivity predictions for next week',
      icon: <TrendingUp className="h-4 w-4" />
    },
    { 
      label: 'Recommendations', 
      intent: 'recommendation_request',
      query: 'What recommendations do you have for improving my productivity?',
      icon: <Lightbulb className="h-4 w-4" />
    },
    { 
      label: 'Status Check', 
      intent: 'status_inquiry',
      query: 'How is my productivity progress?',
      icon: <Target className="h-4 w-4" />
    },
  ];

  const handleQuickAction = (action: typeof quickActions[0]) => {
    setInputValue(action.query);
  };

  const generateFallbackWorkspaceResponse = (userInput: string, intent: IntentClassification): { content: string; confidence: number; suggestions: string[] } => {
    switch (intent.intent) {
      case 'prediction_request':
        return {
          content: 'Based on your workspace patterns, I predict high productivity (85-90%) for the next 3 days, with peak performance on Tuesday morning. Your optimal work blocks will be 90 minutes with 15-minute breaks.',
          confidence: 0.87,
          suggestions: ['Get detailed weekly forecast', 'Predict task completion rates', 'Show energy level predictions']
        };
      
      case 'pattern_analysis':
        return {
          content: 'Your workspace analysis shows consistent patterns: 87% efficiency during morning hours, average focus sessions of 85 minutes, and highest productivity on Tuesdays/Wednesdays. You work best with minimal interruptions.',
          confidence: 0.89,
          suggestions: ['Analyze focus time patterns', 'Show weekly productivity trends', 'Display energy level patterns']
        };
      
      case 'recommendation_request':
        return {
          content: 'Workspace recommendations: 1) Optimize your environment for 90-minute focus blocks, 2) Use noise-canceling during peak hours, 3) Schedule complex tasks for Tuesday/Wednesday mornings, 4) Implement the 90/15 work/break cycle.',
          confidence: 0.91,
          suggestions: ['Get workspace optimization tips', 'Show focus strategies', 'Analyze environment factors']
        };
      
      case 'status_inquiry':
        return {
          content: 'Current workspace status: 82% productivity this week, 15 completed focus sessions, 7.2 hours of deep work. You\'re performing 12% above your baseline with consistent improvement trends.',
          confidence: 0.85,
          suggestions: ['Show detailed progress', 'Display productivity metrics', 'Check learning progress']
        };
      
      case 'schedule_optimization':
        return {
          content: 'Schedule optimization analysis: Your ideal daily structure is 9-11 AM for complex work, 11 AM-1 PM for collaboration, 2-4 PM for focused tasks, and 4-5 PM for administrative work. This maximizes your natural energy cycles.',
          confidence: 0.83,
          suggestions: ['Optimize daily schedule', 'Suggest better time blocks', 'Analyze calendar efficiency']
        };
      
      default:
        return {
          content: 'I\'m here to help optimize your workspace productivity. I can analyze your patterns, make predictions, provide recommendations, and help you understand your work habits better. What would you like to explore?',
          confidence: 0.75,
          suggestions: ['Ask about productivity patterns', 'Request predictions', 'Get workspace recommendations']
        };
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Brain className="h-8 w-8 mr-3 text-blue-500" />
            Twin Workspace
            {usingFallbackData && (
              <Badge variant="secondary" className="ml-3">
                Demo Data
              </Badge>
            )}
          </h1>
          <p className="text-gray-600 mt-1">
            Advanced conversation interface with intent recognition
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {currentIntent && (
            <div className={`px-3 py-1 rounded-full text-sm ${getIntentColor(currentIntent.intent)}`}>
              <div className="flex items-center space-x-1">
                {getIntentIcon(currentIntent.intent)}
                <span className="capitalize">{currentIntent.intent.replace('_', ' ')}</span>
                <span className="text-xs">({Math.round(currentIntent.confidence * 100)}%)</span>
              </div>
            </div>
          )}
          <Button variant="outline" size="sm" onClick={loadConversationHistory}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Chat Interface */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Conversation with Your Digital Twin
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Messages Area */}
                <div className="h-96 w-full border rounded-lg p-4 overflow-y-auto bg-gray-50">
                  <div className="space-y-4">
                    {messages.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        <Bot className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p>Start a conversation with your digital twin!</p>
                        <p className="text-sm mt-2">I can help with patterns, predictions, recommendations, and more.</p>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg p-3 ${
                              message.type === 'user'
                                ? 'bg-blue-500 text-white'
                                : 'bg-white text-gray-900 border'
                            }`}
                          >
                            <div className="flex items-start space-x-2">
                              {message.type === 'twin' && (
                                <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />
                              )}
                              {message.type === 'user' && (
                                <User className="h-4 w-4 mt-0.5 flex-shrink-0" />
                              )}
                              <div className="flex-1">
                                <p className="text-sm">{message.content}</p>
                                <div className="flex items-center justify-between mt-2">
                                  <div className="flex items-center space-x-2">
                                    <Clock className="h-3 w-3 opacity-70" />
                                    <span className="text-xs opacity-70">
                                      {formatTime(message.timestamp)}
                                    </span>
                                    {message.intent && (
                                      <div className="flex items-center space-x-1">
                                        {getIntentIcon(message.intent)}
                                        <span className="text-xs opacity-70 capitalize">
                                          {message.intent.replace('_', ' ')}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                  {message.confidence && (
                                    <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                                      {Math.round(message.confidence * 100)}% confident
                                    </span>
                                  )}
                                </div>
                                {message.suggestions && message.suggestions.length > 0 && (
                                  <div className="mt-2 pt-2 border-t border-gray-200">
                                    <p className="text-xs text-gray-600 mb-1">Suggestions:</p>
                                    <div className="flex flex-wrap gap-1">
                                      {message.suggestions.slice(0, 2).map((suggestion, idx) => (
                                        <button
                                          key={idx}
                                          onClick={() => setInputValue(suggestion)}
                                          className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                                        >
                                          {suggestion}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-white border rounded-lg p-3 max-w-[80%]">
                          <div className="flex items-center space-x-2">
                            <Bot className="h-4 w-4" />
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* Input Area */}
                <div className="flex space-x-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask your digital twin anything..."
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button 
                    onClick={sendMessage} 
                    disabled={!inputValue.trim() || isLoading}
                    size="sm"
                  >
                    {isLoading ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAction(action)}
                    className="w-full justify-start"
                  >
                    {action.icon}
                    <span className="ml-2">{action.label}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Intent Classification */}
          {currentIntent && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Intent Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className={`p-3 rounded-lg ${getIntentColor(currentIntent.intent)}`}>
                    <div className="flex items-center space-x-2 mb-2">
                      {getIntentIcon(currentIntent.intent)}
                      <span className="font-medium capitalize">
                        {currentIntent.intent.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-sm">
                      Confidence: {Math.round(currentIntent.confidence * 100)}%
                    </div>
                  </div>
                  {Object.keys(currentIntent.entities).length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">Entities:</h4>
                      <div className="space-y-1">
                        {Object.entries(currentIntent.entities).map(([key, value]) => (
                          <div key={key} className="text-xs bg-gray-100 p-2 rounded">
                            <span className="font-medium">{key}:</span> {String(value)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Conversation Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Session Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Messages:</span>
                  <span className="font-medium">{messages.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>User Messages:</span>
                  <span className="font-medium">{messages.filter(m => m.type === 'user').length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Twin Responses:</span>
                  <span className="font-medium">{messages.filter(m => m.type === 'twin').length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Intents Detected:</span>
                  <span className="font-medium">{messages.filter(m => m.intent).length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};