import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Bot, FileText, Mic, Mail, Video, MessageSquare, Smartphone, GraduationCap, Wrench } from 'lucide-react';

export default function AIToolsHub() {
  const aiTools = [
    {
      title: 'Writing Assistance',
      description: 'AI-powered content creation and editing tools',
      icon: <FileText className="w-6 h-6" />,
      path: '/ai-tools/writing',
      color: 'blue',
      features: ['Content Generation', 'Grammar Check', 'Style Enhancement']
    },
    {
      title: 'Voice Processing',
      description: 'Speech-to-text and voice command processing',
      icon: <Mic className="w-6 h-6" />,
      path: '/ai-tools/voice',
      color: 'green',
      features: ['Speech Recognition', 'Voice Commands', 'Audio Analysis']
    },
    {
      title: 'Document Processing',
      description: 'Automated document analysis and extraction',
      icon: <FileText className="w-6 h-6" />,
      path: '/ai-tools/documents',
      color: 'purple',
      features: ['OCR Processing', 'Data Extraction', 'Document Classification']
    },
    {
      title: 'Email Analysis',
      description: 'Smart email categorization and response suggestions',
      icon: <Mail className="w-6 h-6" />,
      path: '/ai-tools/email',
      color: 'orange',
      features: ['Smart Categorization', 'Response Suggestions', 'Priority Detection']
    },
    {
      title: 'Meeting Insights',
      description: 'Automated meeting transcription and action items',
      icon: <Video className="w-6 h-6" />,
      path: '/ai-tools/meetings',
      color: 'red',
      features: ['Auto Transcription', 'Action Items', 'Meeting Summary']
    },
    {
      title: 'Communication Style',
      description: 'Communication style analysis and optimization',
      icon: <MessageSquare className="w-6 h-6" />,
      path: '/ai-tools/communication',
      color: 'indigo',
      features: ['Style Analysis', 'Tone Detection', 'Communication Tips']
    },
    {
      title: 'Mobile AI',
      description: 'AI features optimized for mobile devices',
      icon: <Smartphone className="w-6 h-6" />,
      path: '/ai-tools/mobile',
      color: 'pink',
      features: ['Mobile Optimization', 'Offline AI', 'Quick Actions']
    },
    {
      title: 'Language Learning',
      description: 'AI-powered language learning and translation',
      icon: <GraduationCap className="w-6 h-6" />,
      path: '/ai-tools/language',
      color: 'yellow',
      features: ['Language Translation', 'Learning Paths', 'Practice Sessions']
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600 hover:bg-blue-200',
      green: 'bg-green-100 text-green-600 hover:bg-green-200',
      purple: 'bg-purple-100 text-purple-600 hover:bg-purple-200',
      orange: 'bg-orange-100 text-orange-600 hover:bg-orange-200',
      red: 'bg-red-100 text-red-600 hover:bg-red-200',
      indigo: 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200',
      pink: 'bg-pink-100 text-pink-600 hover:bg-pink-200',
      yellow: 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
    };
    return colors[color] || colors.blue;
  };

  return (
    <>
      <Head>
        <title>AI Tools Hub - Digame</title>
        <meta name="description" content="Comprehensive AI-powered tools and automation features" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Bot className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">AI Tools Hub</h1>
                <p className="text-gray-600">Powerful AI-driven tools to enhance your productivity</p>
              </div>
              <div className="ml-auto">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <Wrench className="w-3 h-3 mr-1" />
                  8 TOOLS AVAILABLE
                </span>
              </div>
            </div>
          </div>

          {/* AI Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {aiTools.map((tool, index) => (
              <Link key={index} href={tool.path}>
                <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${getColorClasses(tool.color)}`}>
                    {tool.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{tool.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{tool.description}</p>
                  <div className="space-y-1">
                    {tool.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center text-xs text-gray-500">
                        <div className="w-1 h-1 bg-gray-400 rounded-full mr-2"></div>
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Usage Statistics */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Tools Usage This Month</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">1,247</div>
                <div className="text-gray-600 text-sm">Total AI Requests</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">89%</div>
                <div className="text-gray-600 text-sm">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">2.3s</div>
                <div className="text-gray-600 text-sm">Avg Response Time</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">6.8h</div>
                <div className="text-gray-600 text-sm">Time Saved</div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent AI Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <FileText className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Document processed</div>
                  <div className="text-sm text-gray-600">Extracted key information from quarterly report</div>
                </div>
                <div className="text-xs text-gray-500">2 min ago</div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Mic className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Voice note transcribed</div>
                  <div className="text-sm text-gray-600">Meeting notes converted to text</div>
                </div>
                <div className="text-xs text-gray-500">15 min ago</div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Mail className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Email analysis complete</div>
                  <div className="text-sm text-gray-600">Categorized 23 emails and suggested responses</div>
                </div>
                <div className="text-xs text-gray-500">1 hour ago</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}