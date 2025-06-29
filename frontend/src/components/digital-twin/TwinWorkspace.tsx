import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
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
  BarChart3
} from 'lucide-react';
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

// Note: useToast hook would need to be implemented or use a simple alert for now
const useToast = () => ({
  toast: ({ title, description, variant }: any) => {
    console.log(`${variant === 'destructive' ? 'Error' : 'Info'}: ${title} - ${description}`);
    alert(`${title}: ${description}`);
  }
});

export const TwinWorkspace: React.FC<TwinWorkspaceProps> = ({ twinId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentIntent, setCurrentIntent] = useState<IntentClassification | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Load conversation history
    loadConversationHistory();
  }, [twinId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversationHistory = async () => {
    try {
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
      }
    } catch (error) {
      console.error('Failed to load conversation history:', error);
    }
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
      toast({
        title: "Error",
        description: error.message || "Failed to send message to twin",
        variant: "destructive",
      });

      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        type: 'twin',
        content: 'Sorry, I encountered an error processing your message. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
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

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Brain className="h-8 w-8 mr-3 text-blue-500" />
            Twin Workspace
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