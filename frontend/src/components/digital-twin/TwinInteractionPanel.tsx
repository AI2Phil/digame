import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Database
} from 'lucide-react';
import { useToastHelpers } from '../ui/Toaster';
import { digitalTwinApi } from '../../services/digitalTwinApi';

interface TwinInteractionPanelProps {
  twinId: string;
}

interface Message {
  id: string;
  type: 'user' | 'twin';
  content: string;
  timestamp: Date;
  confidence?: number;
  interactionId?: string;
}

export const TwinInteractionPanel: React.FC<TwinInteractionPanelProps> = ({ twinId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingFallbackData, setUsingFallbackData] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const toast = useToastHelpers();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadInteractionHistory = useCallback(async () => {
    try {
      setLoadingHistory(true);
      setError(null);
      
      const response = await digitalTwinApi.getTwinInteractions(undefined, 10);
      
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
            interactionId: interaction.id,
          }
        ]).flat().sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

        setMessages(historyMessages);
        setUsingFallbackData(false);
        toast.success("Interaction history loaded successfully");
      } else {
        throw new Error(response.message || 'Failed to load interaction history');
      }
    } catch (error: any) {
      console.error('Failed to load interaction history:', error);
      setError(error.message || "Failed to load interaction history");
      
      // Load enhanced fallback interaction history
      loadFallbackInteractionHistory();
      toast.warning("Using demo conversation - Digital Twin API currently unavailable");
    } finally {
      setLoadingHistory(false);
    }
  }, [toast]);

  useEffect(() => {
    loadInteractionHistory();
  }, [loadInteractionHistory]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadFallbackInteractionHistory = () => {
    // Enhanced fallback interaction history with realistic conversation
    const fallbackMessages: Message[] = [
      {
        id: `fallback_${Date.now()}_1`,
        type: 'user',
        content: 'How is my productivity trending this week?',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
      {
        id: `fallback_${Date.now()}_2`,
        type: 'twin',
        content: 'Based on your recent activity patterns, your productivity has increased by 12% this week. Your peak performance hours are between 9-11 AM and 2-4 PM. I\'ve noticed you\'re most effective when working in 90-minute focused blocks.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 30000), // 2 hours ago + 30 seconds
        confidence: 0.87,
        interactionId: 'demo_interaction_1'
      },
      {
        id: `fallback_${Date.now()}_3`,
        type: 'user',
        content: 'What patterns have you discovered about my work habits?',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      },
      {
        id: `fallback_${Date.now()}_4`,
        type: 'twin',
        content: 'I\'ve identified several key patterns: You tend to be most creative in the morning, handle administrative tasks better in the afternoon, and your energy dips around 2 PM. You also work more efficiently when you batch similar tasks together.',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000 + 45000), // 1 hour ago + 45 seconds
        confidence: 0.82,
        interactionId: 'demo_interaction_2'
      },
      {
        id: `fallback_${Date.now()}_5`,
        type: 'user',
        content: 'Can you predict my energy levels for tomorrow?',
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      },
      {
        id: `fallback_${Date.now()}_6`,
        type: 'twin',
        content: 'Based on your historical patterns, tomorrow you\'ll likely have high energy from 9-11 AM (85% predicted), moderate energy 11 AM-2 PM (70%), a dip 2-3 PM (55%), then recovery 3-5 PM (75%). I recommend scheduling important tasks during your morning peak.',
        timestamp: new Date(Date.now() - 30 * 60 * 1000 + 60000), // 30 minutes ago + 1 minute
        confidence: 0.79,
        interactionId: 'demo_interaction_3'
      }
    ];

    setMessages(fallbackMessages);
    setUsingFallbackData(true);
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await digitalTwinApi.interactWithTwin({
        query: userMessage.content,
        context: {
          conversation_history: messages.slice(-5), // Last 5 messages for context
          timestamp: new Date().toISOString(),
        }
      });

      if (response.success && response.data) {
        const twinMessage: Message = {
          id: `twin-${Date.now()}`,
          type: 'twin',
          content: response.data.response?.text || 'I received your message but had trouble generating a response.',
          timestamp: new Date(),
          confidence: response.data.response?.confidence,
          interactionId: response.data.interaction_id,
        };

        setMessages(prev => [...prev, twinMessage]);
      } else {
        throw new Error(response.message || 'Failed to get response from twin');
      }
    } catch (error: any) {
      console.error('Failed to send message:', error);
      toast.error(error.message || "Failed to send message to twin");

      // Generate enhanced fallback response
      const fallbackResponse = generateFallbackResponse(userMessage.content);
      const twinMessage: Message = {
        id: `twin-${Date.now()}`,
        type: 'twin',
        content: fallbackResponse.content,
        timestamp: new Date(),
        confidence: fallbackResponse.confidence,
        interactionId: `demo_${Date.now()}`
      };
      setMessages(prev => [...prev, twinMessage]);
      setUsingFallbackData(true);
      toast.warning("Using demo response - Digital Twin API currently unavailable");
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

  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return 'bg-gray-500';
    if (confidence >= 0.8) return 'bg-green-500';
    if (confidence >= 0.6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const suggestedQuestions = [
    "How is my productivity trending?",
    "What patterns have you discovered?",
    "Can you predict my energy levels tomorrow?",
    "What recommendations do you have for me?",
    "Show me my recent work patterns",
  ];

  const handleSuggestedQuestion = (question: string) => {
    setInputValue(question);
  };

  const generateFallbackResponse = (userInput: string): { content: string; confidence: number } => {
    const input = userInput.toLowerCase();
    
    if (input.includes('productivity') || input.includes('performance')) {
      return {
        content: 'Based on your recent patterns, your productivity has been trending upward with a 15% improvement this week. Your most productive hours are 9-11 AM and 2-4 PM. I recommend maintaining your current 90-minute focus blocks.',
        confidence: 0.85
      };
    }
    
    if (input.includes('pattern') || input.includes('habit')) {
      return {
        content: 'I\'ve discovered several key patterns: You work best in the morning, prefer batching similar tasks, and take breaks every 90 minutes. Your energy peaks at 10 AM and dips around 2 PM.',
        confidence: 0.82
      };
    }
    
    if (input.includes('energy') || input.includes('tired') || input.includes('fatigue')) {
      return {
        content: 'Your energy patterns show peaks at 10 AM and 3 PM, with a natural dip around 2 PM. I predict tomorrow you\'ll have high energy 9-11 AM (85% confidence) and moderate energy in the afternoon.',
        confidence: 0.78
      };
    }
    
    if (input.includes('recommend') || input.includes('advice') || input.includes('suggest')) {
      return {
        content: 'Based on your patterns, I recommend: 1) Schedule important tasks during 9-11 AM, 2) Take a 15-minute break around 2 PM, 3) Batch similar tasks together, 4) Use 90-minute focus blocks for deep work.',
        confidence: 0.80
      };
    }
    
    if (input.includes('tomorrow') || input.includes('predict') || input.includes('forecast')) {
      return {
        content: 'Tomorrow\'s forecast: High productivity 9-11 AM (85%), moderate 11 AM-2 PM (70%), energy dip 2-3 PM (55%), recovery 3-5 PM (75%). Plan your most important work for the morning.',
        confidence: 0.77
      };
    }
    
    // Default response
    return {
      content: 'I understand you\'re asking about your behavioral patterns. Based on my analysis, you have consistent productivity cycles with peak performance in the morning. Would you like me to elaborate on any specific aspect of your patterns?',
      confidence: 0.75
    };
  };

  if (loadingHistory) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin mr-2" />
          <span>Loading conversation history...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            Chat with Your Digital Twin
            {usingFallbackData && (
              <Badge variant="secondary" className="ml-2">
                Demo Data
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Messages Area */}
            <div className="h-96 w-full border rounded-lg p-4 overflow-y-auto">
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <Bot className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>Start a conversation with your digital twin!</p>
                    <p className="text-sm mt-2">Ask about your productivity patterns, predictions, or get recommendations.</p>
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
                            : 'bg-gray-100 text-gray-900'
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
                              </div>
                              {message.confidence && (
                                <span
                                  className={`text-xs px-2 py-1 rounded ${getConfidenceColor(message.confidence)} text-white`}
                                >
                                  {Math.round(message.confidence * 100)}% confident
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
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

            {/* Suggested Questions */}
            {messages.length === 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Suggested questions:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSuggestedQuestion(question)}
                      className="text-xs"
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            )}

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

            {/* Quick Actions */}
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>Press Enter to send, Shift+Enter for new line</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={loadInteractionHistory}
                className="text-xs"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Refresh History
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};