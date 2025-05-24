import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WritingAssistance from '../components/ai/WritingAssistance';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { Badge } from '../components/ui/Badge';
import { 
  Wand2, 
  Brain, 
  MessageSquare, 
  FileText, 
  TrendingUp, 
  Users, 
  ArrowLeft,
  Sparkles,
  Zap,
  Target
} from 'lucide-react';

export default function AiToolsPage({ isDemoMode, onLogout }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('writing');

  const aiTools = [
    {
      id: 'writing',
      name: 'Writing Assistance',
      icon: Wand2,
      description: 'AI-powered writing suggestions and improvements',
      status: 'available',
      tier: 'Professional+',
      component: WritingAssistance
    },
    {
      id: 'insights',
      name: 'AI Insights',
      icon: Brain,
      description: 'Behavioral pattern analysis and recommendations',
      status: 'available',
      tier: 'Professional+',
      component: null // Will be implemented later
    },
    {
      id: 'coaching',
      name: 'AI Coaching',
      icon: Target,
      description: 'Personalized productivity coaching and goal setting',
      status: 'available',
      tier: 'Professional+',
      component: null // Will be implemented later
    },
    {
      id: 'summarization',
      name: 'Content Summarization',
      icon: FileText,
      description: 'Automatically summarize documents and meetings',
      status: 'coming-soon',
      tier: 'Enterprise',
      component: null
    },
    {
      id: 'chat',
      name: 'AI Assistant',
      icon: MessageSquare,
      description: 'Conversational AI for productivity questions',
      status: 'coming-soon',
      tier: 'Enterprise',
      component: null
    },
    {
      id: 'predictions',
      name: 'Predictive Analytics',
      icon: TrendingUp,
      description: 'Forecast productivity trends and outcomes',
      status: 'available',
      tier: 'Professional+',
      component: null
    }
  ];

  const availableTools = aiTools.filter(tool => tool.status === 'available');
  const comingSoonTools = aiTools.filter(tool => tool.status === 'coming-soon');

  const renderToolCard = (tool, isComingSoon = false) => (
    <Card key={tool.id} className={`transition-all duration-200 ${isComingSoon ? 'opacity-60' : 'hover:shadow-md cursor-pointer'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isComingSoon ? 'bg-gray-100' : 'bg-purple-100'}`}>
              <tool.icon className={`h-5 w-5 ${isComingSoon ? 'text-gray-500' : 'text-purple-600'}`} />
            </div>
            <div>
              <CardTitle className="text-lg">{tool.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={isComingSoon ? "secondary" : "default"} className="text-xs">
                  {tool.tier}
                </Badge>
                {isComingSoon && (
                  <Badge variant="outline" className="text-xs">
                    Coming Soon
                  </Badge>
                )}
              </div>
            </div>
          </div>
          {!isComingSoon && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab(tool.id)}
              className="text-purple-600 hover:text-purple-700"
            >
              Try Now
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-sm">
          {tool.description}
        </CardDescription>
      </CardContent>
    </Card>
  );

  const renderTabContent = (tool) => {
    if (tool.component) {
      const Component = tool.component;
      return <Component />;
    }
    
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <tool.icon className="h-5 w-5 text-purple-600" />
            {tool.name}
            <Badge variant="secondary">Coming Soon</Badge>
          </CardTitle>
          <CardDescription>{tool.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <tool.icon className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {tool.name} is in development
            </h3>
            <p className="text-gray-600 mb-4">
              We're working hard to bring you this powerful AI feature. Stay tuned for updates!
            </p>
            <Button variant="outline">
              Get Notified When Available
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
              <div className="flex items-center space-x-3">
                <div className="digame-logo">
                  <span className="text-white font-bold text-sm">D</span>
                </div>
                <span className="text-xl font-bold text-gray-900">AI Tools</span>
              </div>
              {isDemoMode && (
                <Badge variant="secondary">Demo Mode</Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/dashboard')}
              >
                Dashboard
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onLogout}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">AI-Powered Tools</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Enhance your productivity with cutting-edge artificial intelligence tools designed to help you work smarter, not harder.
          </p>
        </div>

        {/* AI Tools Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 mb-8">
            {availableTools.map((tool) => (
              <TabsTrigger key={tool.id} value={tool.id} className="flex items-center gap-2">
                <tool.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tool.name}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {availableTools.map((tool) => (
            <TabsContent key={tool.id} value={tool.id}>
              {renderTabContent(tool)}
            </TabsContent>
          ))}
        </Tabs>

        {/* Available Tools Overview */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Zap className="h-6 w-6 text-purple-600" />
            Available AI Tools
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {availableTools.map((tool) => renderToolCard(tool))}
          </div>
        </div>

        {/* Coming Soon Tools */}
        {comingSoonTools.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Brain className="h-6 w-6 text-gray-600" />
              Coming Soon
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {comingSoonTools.map((tool) => renderToolCard(tool, true))}
            </div>
          </div>
        )}

        {/* Feature Highlight */}
        <div className="mt-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-8 text-white">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Unlock the Full Power of AI</h2>
            <p className="text-lg mb-6 opacity-90">
              Upgrade to Professional or Enterprise to access all AI-powered features and transform your productivity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="secondary" size="lg">
                View Pricing Plans
              </Button>
              <Button variant="outline" size="lg" className="text-white border-white hover:bg-white hover:text-purple-600">
                Schedule Demo
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}