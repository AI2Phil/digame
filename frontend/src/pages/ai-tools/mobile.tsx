import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import PageHeader from '../../components/navigation/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Progress } from '../../components/ui/Progress';
import {
  Smartphone,
  Camera,
  Mic,
  MapPin,
  Battery,
  Wifi,
  Bell,
  MessageSquare,
  Calendar,
  Clock,
  TrendingUp,
  BarChart3,
  Zap,
  Shield,
  Settings,
  Download,
  Upload,
  Scan,
  QrCode,
  Navigation,
  Heart,
  ArrowLeft,
} from 'lucide-react';

interface DeviceInfo {
  platform: string;
  version: string;
  model: string;
  batteryLevel: number;
  networkType: string;
  location: string;
}

interface AICapability {
  available: boolean;
  accuracy?: number;
  languages?: number;
}

interface AICapabilities {
  voiceRecognition: AICapability;
  imageRecognition: AICapability;
  textAnalysis: AICapability;
  translation: AICapability;
  ocr: AICapability;
  faceDetection: AICapability;
}

interface Usage {
  dailyInteractions: number;
  weeklyTrend: number;
  mostUsedFeature: string;
  totalProcessingTime: number;
  dataUsage: number;
}

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  usage: number;
  accuracy: number;
  status: 'active' | 'beta' | 'inactive';
}

interface MobileData {
  deviceInfo: DeviceInfo;
  aiCapabilities: AICapabilities;
  usage: Usage;
  tools: Tool[];
  insights: string[];
  recommendations: string[];
}

const MobileAITools: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileData, setMobileData] = useState<MobileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);

  useEffect(() => {
    fetchMobileData();
  }, []);

  const fetchMobileData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ai-tools/mobile', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMobileData(data);
      }
    } catch (error) {
      console.error('Error fetching mobile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const mockMobileData: MobileData = {
    deviceInfo: {
      platform: 'iOS',
      version: '17.2',
      model: 'iPhone 15 Pro',
      batteryLevel: 78,
      networkType: '5G',
      location: 'San Francisco, CA',
    },
    aiCapabilities: {
      voiceRecognition: { available: true, accuracy: 96.5 },
      imageRecognition: { available: true, accuracy: 94.2 },
      textAnalysis: { available: true, accuracy: 98.1 },
      translation: { available: true, languages: 47 },
      ocr: { available: true, accuracy: 92.8 },
      faceDetection: { available: true, accuracy: 97.3 },
    },
    usage: {
      dailyInteractions: 127,
      weeklyTrend: 15.3,
      mostUsedFeature: 'Voice Assistant',
      totalProcessingTime: 45.2,
      dataUsage: 2.3,
    },
    tools: [
      {
        id: 'voice-assistant',
        name: 'Voice Assistant',
        description: 'AI-powered voice commands and responses',
        icon: <Mic className="h-6 w-6" />,
        usage: 89,
        accuracy: 96.5,
        status: 'active',
      },
      {
        id: 'smart-camera',
        name: 'Smart Camera',
        description: 'Object recognition and scene analysis',
        icon: <Camera className="h-6 w-6" />,
        usage: 67,
        accuracy: 94.2,
        status: 'active',
      },
      {
        id: 'location-ai',
        name: 'Location Intelligence',
        description: 'Context-aware location services',
        icon: <MapPin className="h-6 w-6" />,
        usage: 54,
        accuracy: 91.7,
        status: 'active',
      },
      {
        id: 'text-scanner',
        name: 'Text Scanner',
        description: 'OCR and document processing',
        icon: <Scan className="h-6 w-6" />,
        usage: 43,
        accuracy: 92.8,
        status: 'active',
      },
      {
        id: 'smart-notifications',
        name: 'Smart Notifications',
        description: 'AI-filtered and prioritized alerts',
        icon: <Bell className="h-6 w-6" />,
        usage: 78,
        accuracy: 88.4,
        status: 'active',
      },
      {
        id: 'health-monitor',
        name: 'Health Monitor',
        description: 'Wellness tracking and insights',
        icon: <Heart className="h-6 w-6" />,
        usage: 32,
        accuracy: 89.6,
        status: 'beta',
      },
    ],
    insights: [
      'Voice Assistant usage increased 23% this week',
      'Smart Camera performs best in outdoor lighting',
      'Location AI accuracy improves with GPS enabled',
      'Text Scanner works optimally with high-contrast documents',
    ],
    recommendations: [
      'Enable background processing for better performance',
      'Update to latest AI models for improved accuracy',
      'Consider upgrading storage for offline capabilities',
      'Optimize battery usage by adjusting AI processing frequency',
    ],
  };

  const currentData = mobileData || mockMobileData;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'beta':
        return 'secondary';
      case 'inactive':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 95) return 'text-green-600';
    if (accuracy >= 90) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getBatteryColor = (level: number) => {
    if (level >= 50) return 'text-green-600';
    if (level >= 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <>
      <Head>
        <title>Mobile AI Tools - Digame</title>
        <meta name="description" content="AI-powered mobile capabilities and device optimization" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Return to AI Tools Navigation */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-3">
            <Link
              href="/ai-tools"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Return to AI Tools</span>
            </Link>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Mobile AI Tools</h1>
                <p className="text-gray-600">
                  AI-powered mobile capabilities and device optimization
                </p>
              </div>
              <div className="ml-auto">
                <Button variant="outline" onClick={fetchMobileData} disabled={false}>
                  <Download className="h-4 w-4 mr-2" />
                  Sync Device
                </Button>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Smartphone className="h-4 w-4 inline mr-2" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('tools')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'tools'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Zap className="h-4 w-4 inline mr-2" />
              AI Tools
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
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'settings'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Settings className="h-4 w-4 inline mr-2" />
              Settings
            </button>
          </div>

          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Device Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Device</p>
                        <p className="text-lg font-bold">{currentData.deviceInfo.model}</p>
                        <p className="text-xs text-gray-500">
                          {currentData.deviceInfo.platform} {currentData.deviceInfo.version}
                        </p>
                      </div>
                      <Smartphone className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Battery</p>
                        <p
                          className={`text-2xl font-bold ${getBatteryColor(currentData.deviceInfo.batteryLevel)}`}
                        >
                          {currentData.deviceInfo.batteryLevel}%
                        </p>
                      </div>
                      <Battery
                        className={`h-8 w-8 ${getBatteryColor(currentData.deviceInfo.batteryLevel)}`}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Network</p>
                        <p className="text-2xl font-bold text-green-600">
                          {currentData.deviceInfo.networkType}
                        </p>
                      </div>
                      <Wifi className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Location</p>
                        <p className="text-sm font-bold">{currentData.deviceInfo.location}</p>
                      </div>
                      <MapPin className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* AI Capabilities Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    AI Capabilities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.entries(currentData.aiCapabilities).map(([capability, data]) => (
                      <div key={capability} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium capitalize">
                            {capability.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                          <Badge variant={data.available ? 'default' : 'secondary'}>
                            {data.available ? 'Available' : 'Unavailable'}
                          </Badge>
                        </div>
                        {data.available && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span>Accuracy</span>
                              <span className={getAccuracyColor(data.accuracy || 0)}>
                                {data.accuracy
                                  ? `${data.accuracy}%`
                                  : data.languages
                                    ? `${data.languages} languages`
                                    : 'N/A'}
                              </span>
                            </div>
                            {data.accuracy && <Progress value={data.accuracy} className="h-1" />}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Usage Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Daily Interactions</p>
                        <p className="text-2xl font-bold">{currentData.usage.dailyInteractions}</p>
                      </div>
                      <MessageSquare className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Weekly Growth</p>
                        <p className="text-2xl font-bold text-green-600">
                          +{currentData.usage.weeklyTrend}%
                        </p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Processing Time</p>
                        <p className="text-2xl font-bold">{currentData.usage.totalProcessingTime}h</p>
                      </div>
                      <Clock className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Data Usage</p>
                        <p className="text-2xl font-bold">{currentData.usage.dataUsage}GB</p>
                      </div>
                      <Upload className="h-8 w-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'tools' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentData.tools.map(tool => (
                <Card key={tool.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg">{tool.icon}</div>
                      <div>
                        <h3 className="font-medium">{tool.name}</h3>
                        <Badge variant={getStatusColor(tool.status)} className="mt-1">
                          {tool.status}
                        </Badge>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600">{tool.description}</p>

                    <div className="space-y-3">
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Usage</span>
                          <span>{tool.usage}%</span>
                        </div>
                        <Progress value={tool.usage} className="h-2" />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Accuracy</span>
                          <span className={getAccuracyColor(tool.accuracy)}>{tool.accuracy}%</span>
                        </div>
                        <Progress value={tool.accuracy} className="h-2" />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => {}} disabled={false}>
                        Configure
                      </Button>
                      <Button size="sm" className="flex-1" onClick={() => {}} disabled={false}>
                        Launch
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {/* Usage Trends */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Usage Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-medium mb-4">Most Used Features</h4>
                      <div className="space-y-3">
                        {currentData.tools
                          .sort((a, b) => b.usage - a.usage)
                          .slice(0, 5)
                          .map((tool, index) => (
                            <div key={tool.id} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">#{index + 1}</span>
                                <span className="text-sm">{tool.name}</span>
                              </div>
                              <span className="text-sm font-bold">{tool.usage}%</span>
                            </div>
                          ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-4">Performance Metrics</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm">Average Accuracy</span>
                          <span className="text-sm font-bold text-green-600">
                            {(
                              currentData.tools.reduce((acc, tool) => acc + tool.accuracy, 0) /
                              currentData.tools.length
                            ).toFixed(1)}
                            %
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Active Tools</span>
                          <span className="text-sm font-bold">
                            {currentData.tools.filter(tool => tool.status === 'active').length}/
                            {currentData.tools.length}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Beta Features</span>
                          <span className="text-sm font-bold text-blue-600">
                            {currentData.tools.filter(tool => tool.status === 'beta').length}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Insights */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Key Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {currentData.insights.map((insight, index) => (
                        <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                          <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{insight}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {currentData.recommendations.map((recommendation, index) => (
                        <div key={index} className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
                          <Shield className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{recommendation}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Mobile AI Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Background Processing</h4>
                        <p className="text-sm text-gray-600">Allow AI tools to run in background</p>
                      </div>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Auto-sync Data</h4>
                        <p className="text-sm text-gray-600">Automatically sync AI insights</p>
                      </div>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Offline Mode</h4>
                        <p className="text-sm text-gray-600">Enable offline AI processing</p>
                      </div>
                      <input type="checkbox" className="rounded" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Battery Optimization</h4>
                        <p className="text-sm text-gray-600">Optimize AI processing for battery life</p>
                      </div>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Processing Quality</h4>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input type="radio" name="quality" value="high" defaultChecked />
                        <span className="text-sm">High Quality (More battery usage)</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="radio" name="quality" value="balanced" />
                        <span className="text-sm">Balanced (Recommended)</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="radio" name="quality" value="efficient" />
                        <span className="text-sm">Efficient (Battery saving)</span>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Data Usage</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Monthly limit</span>
                        <span>5GB</span>
                      </div>
                      <Progress value={46} className="h-2" />
                      <p className="text-xs text-gray-500">2.3GB used this month</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex-1" onClick={() => {}} disabled={false}>Save Settings</Button>
                    <Button variant="outline" className="flex-1" onClick={() => {}} disabled={false}>
                      Reset to Default
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MobileAITools;
