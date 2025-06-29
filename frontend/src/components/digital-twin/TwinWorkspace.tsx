import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Lightbulb,
  Clock,
  TrendingUp
} from 'lucide-react';

interface DigitalTwin {
  id: string;
  name: string;
  status: string;
  learning_progress: number;
  accuracy_score: number;
}

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'twin';
  timestamp: string;
  confidence?: number;
}

interface TwinWorkspaceProps {
  twinId: string;
  twin: DigitalTwin;
}

export const TwinWorkspace: React.FC<TwinWorkspaceProps> = ({ twinId, twin }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Add welcome message
    setMessages([
      {
        id: '1',
        content: `Hello! I'm ${twin.name}, your digital productivity twin. I'm currently ${twin.learning_progress}% through learning your patterns. How can I help you optimize your productivity today?`,
        sender: 'twin',
        timestamp: new Date().toISOString(),
        confidence: 0.9
      }
    ]);
  }, [twin]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    setLoading(true);

    try {
      const response = await fetch(`/api/v1/digital-twins/${twinId}/chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          context: {}
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        const twinMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: data.response.text || 'I apologize, but I encountered an issue processing your request.',
          sender: 'twin',
          timestamp: new Date().toISOString(),
          confidence: data.confidence || 0.8
        };

        setMessages(prev => [...prev, twinMessage]);
      } else {
        throw new Error('Failed to get response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'I apologize, but I encountered an error. Please try again.',
        sender: 'twin',
        timestamp: new Date().toISOString(),
        confidence: 0.5
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestedQuestions = [
    "How productive was I today?",
    "What patterns do you see in my work?",
    "How can I optimize my schedule?",
    "What are my peak productivity hours?",
    "Give me productivity recommendations"
  ];

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  return (
    <div className="space-y-6">
      {/* Chat Interface */}
      <Card className="h-96">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5 text-blue-600" />
            <span>Chat with {twin.name}</span>
            <Badge
              variant={twin.status === 'active' ? 'success' : 'warning'}
              icon={undefined}
              onRemove={undefined}
            >
              {twin.status}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col h-80">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {message.sender === 'twin' && (
                      <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    )}
                    {message.sender === 'user' && (
                      <User className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm">{message.content}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs opacity-70">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </span>
                        {message.confidence && message.sender === 'twin' && (
                          <span className="text-xs opacity-70">
                            {Math.round(message.confidence * 100)}% confident
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
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

          {/* Input Area */}
          <div className="flex space-x-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask your digital twin anything..."
              className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={2}
              disabled={loading}
            />
            <Button 
              onClick={handleSend} 
              disabled={!input.trim() || loading}
              className="self-end"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Suggested Questions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            <span>Suggested Questions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {suggestedQuestions.map((question, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleSuggestionClick(question)}
                className="text-left justify-start h-auto py-2 px-3"
              >
                {question}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div>
                <h3 className="font-medium">Productivity Analysis</h3>
                <p className="text-sm text-gray-600">Get insights about your productivity patterns</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-3 w-full"
              onClick={() => handleSuggestionClick("Analyze my productivity patterns")}
            >
              Analyze Now
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <Clock className="h-8 w-8 text-blue-600" />
              <div>
                <h3 className="font-medium">Schedule Optimization</h3>
                <p className="text-sm text-gray-600">Optimize your daily schedule</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-3 w-full"
              onClick={() => handleSuggestionClick("How can I optimize my schedule?")}
            >
              Optimize
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <Lightbulb className="h-8 w-8 text-yellow-600" />
              <div>
                <h3 className="font-medium">Recommendations</h3>
                <p className="text-sm text-gray-600">Get personalized productivity tips</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-3 w-full"
              onClick={() => handleSuggestionClick("Give me productivity recommendations")}
            >
              Get Tips
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TwinWorkspace;