import React, { useState, useEffect } from 'react';
import { 
  Smartphone, Battery, Wifi, Clock, 
  TrendingUp, Activity, Zap, Volume2,
  Settings, Bell, Eye, BarChart3,
  Mic, RefreshCw, Brain, Target
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Progress } from '../components/ui/Progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { Toast } from '../components/ui/Toast';
import advancedMobileService from '../services/advancedMobileService';
import apiService from '../services/apiService';

const MobileAnalyticsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileAnalytics, setMobileAnalytics] = useState({});
  const [backgroundSyncStatus, setBackgroundSyncStatus] = useState({});
  const [notificationSettings, setNotificationSettings] = useState({});
  const [voiceSettings, setVoiceSettings] = useState({});
  const [performanceMetrics, setPerformanceMetrics] = useState({});

  useEffect(() => {
    loadMobileAnalytics();
  }, []);

  const loadMobileAnalytics = async () => {
    setLoading(true);
    try {
      const userId = localStorage.getItem('userId');
      
      // Initialize advanced mobile service if not already done
      if (!advancedMobileService.isInitialized) {
        await advancedMobileService.initialize();
      }

      // Load comprehensive mobile analytics
      const [
        analytics,
        syncStatus,
        notifications,
        voice,
        performance
      ] = await Promise.all([
        advancedMobileService.generateAdvancedAnalytics(),
        apiService.getMobileAnalytics(userId),
        apiService.getOptimalNotificationTimes(userId),
        apiService.getVoiceCommandHistory(userId),
        apiService.getMobilePerformanceMetrics(userId)
      ]);

      setMobileAnalytics(analytics || {});
      setBackgroundSyncStatus(syncStatus || {});
      setNotificationSettings(notifications || {});
      setVoiceSettings(voice || {});
      setPerformanceMetrics(performance || {});

    } catch (error) {
      console.error('Failed to load mobile analytics:', error);
      Toast.error('Failed to load mobile analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBackgroundSync = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const newStatus = !backgroundSyncStatus.enabled;
      
      await apiService.updateBackgroundSyncStatus(userId, { enabled: newStatus });
      setBackgroundSyncStatus(prev => ({ ...prev, enabled: newStatus }));
      
      Toast.success(`Background sync ${newStatus ? 'enabled' : 'disabled'}`);
    } catch (error) {
      Toast.error('Failed to update background sync settings');
    }
  };

  const handleStartVoiceRecognition = async () => {
    try {
      await advancedMobileService.startVoiceRecognition();
      Toast.success('Voice recognition started. Say a command!');
    } catch (error) {
      Toast.error('Failed to start voice recognition');
    }
  };

  const handleStopVoiceRecognition = async () => {
    try {
      await advancedMobileService.stopVoiceRecognition();
      Toast.success('Voice recognition stopped');
    } catch (error) {
      Toast.error('Failed to stop voice recognition');
    }
  };

  const handleOptimizeNotifications = async () => {
    try {
      const userId = localStorage.getItem('userId');
      await advancedMobileService.processAiNotifications();
      Toast.success('Notification timing optimized based on your behavior patterns');
      loadMobileAnalytics(); // Refresh data
    } catch (error) {
      Toast.error('Failed to optimize notifications');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading advanced mobile analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full">
              <Smartphone className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Advanced Mobile Analytics</h1>
              <p className="text-gray-600">Comprehensive mobile experience optimization and insights</p>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <MobileMetricCard
              title="Background Sync"
              value={backgroundSyncStatus.enabled ? "Active" : "Inactive"}
              icon={RefreshCw}
              color={backgroundSyncStatus.enabled ? "green" : "gray"}
              trend={`Last sync: ${backgroundSyncStatus.lastSync || 'Never'}`}
            />
            <MobileMetricCard
              title="AI Notifications"
              value={notificationSettings.optimizedCount || 0}
              icon={Brain}
              color="blue"
              trend="Optimized timing"
            />
            <MobileMetricCard
              title="Voice Commands"
              value={voiceSettings.commandsToday || 0}
              icon={Mic}
              color="purple"
              trend="Commands today"
            />
            <MobileMetricCard
              title="Performance Score"
              value={`${performanceMetrics.overallScore || 85}%`}
              icon={TrendingUp}
              color="orange"
              trend="App performance"
            />
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="background-sync">Background Sync</TabsTrigger>
            <TabsTrigger value="notifications">AI Notifications</TabsTrigger>
            <TabsTrigger value="voice">Voice Recognition</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <MobileOverviewSection 
              analytics={mobileAnalytics}
              backgroundSync={backgroundSyncStatus}
              notifications={notificationSettings}
              voice={voiceSettings}
              performance={performanceMetrics}
            />
          </TabsContent>

          {/* Background Sync Tab */}
          <TabsContent value="background-sync" className="space-y-6">
            <BackgroundSyncSection 
              syncStatus={backgroundSyncStatus}
              onToggleSync={handleToggleBackgroundSync}
            />
          </TabsContent>

          {/* AI Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <AiNotificationsSection 
              notificationData={notificationSettings}
              onOptimize={handleOptimizeNotifications}
            />
          </TabsContent>

          {/* Voice Recognition Tab */}
          <TabsContent value="voice" className="space-y-6">
            <VoiceRecognitionSection 
              voiceData={voiceSettings}
              onStartVoice={handleStartVoiceRecognition}
              onStopVoice={handleStopVoiceRecognition}
            />
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <PerformanceSection 
              performanceData={performanceMetrics}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Mobile Metric Card Component
const MobileMetricCard = ({ title, value, icon: Icon, color, trend }) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    purple: 'text-purple-600 bg-purple-100',
    orange: 'text-orange-600 bg-orange-100',
    gray: 'text-gray-600 bg-gray-100'
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-1">{trend}</p>
          </div>
          <div className={`p-3 rounded-full ${colorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Mobile Overview Section Component
const MobileOverviewSection = ({ analytics, backgroundSync, notifications, voice, performance }) => (
  <div className="space-y-6">
    {/* Mobile Experience Summary */}
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Mobile Experience Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {analytics.sessionData?.duration ? Math.round(analytics.sessionData.duration / 60000) : 0}m
            </div>
            <p className="text-sm text-gray-600">Session Duration</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {analytics.insights?.engagementLevel || 0}%
            </div>
            <p className="text-sm text-gray-600">Engagement Level</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {analytics.insights?.productivityScore || 0}%
            </div>
            <p className="text-sm text-gray-600">Productivity Score</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {Object.keys(analytics.sessionData?.screenViews || {}).length}
            </div>
            <p className="text-sm text-gray-600">Screens Visited</p>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Feature Status Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FeatureStatusCard
        title="Background App Refresh"
        status={backgroundSync.enabled ? "Active" : "Inactive"}
        description="Automatic data synchronization when app is in background"
        icon={RefreshCw}
        color={backgroundSync.enabled ? "green" : "gray"}
        details={[
          `Last sync: ${backgroundSync.lastSync || 'Never'}`,
          `Sync frequency: ${backgroundSync.frequency || '15 minutes'}`,
          `Data synced: ${backgroundSync.dataSynced || 'Goals, notifications, analytics'}`
        ]}
      />
      
      <FeatureStatusCard
        title="AI-Powered Notifications"
        status={notifications.optimized ? "Optimized" : "Standard"}
        description="Smart notification timing based on your behavior patterns"
        icon={Brain}
        color="blue"
        details={[
          `Optimal times: ${notifications.optimalTimes?.join(', ') || 'Learning...'}`,
          `Notifications today: ${notifications.todayCount || 0}`,
          `Engagement rate: ${notifications.engagementRate || 0}%`
        ]}
      />
    </div>

    {/* Quick Actions */}
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Button className="flex items-center gap-2 h-auto p-4">
            <Mic className="w-5 h-5" />
            <div className="text-left">
              <div className="font-medium">Voice Commands</div>
              <div className="text-xs opacity-75">Try "Show analytics"</div>
            </div>
          </Button>
          <Button variant="outline" className="flex items-center gap-2 h-auto p-4">
            <Bell className="w-5 h-5" />
            <div className="text-left">
              <div className="font-medium">Optimize Notifications</div>
              <div className="text-xs opacity-75">AI-powered timing</div>
            </div>
          </Button>
          <Button variant="outline" className="flex items-center gap-2 h-auto p-4">
            <RefreshCw className="w-5 h-5" />
            <div className="text-left">
              <div className="font-medium">Force Sync</div>
              <div className="text-xs opacity-75">Update all data</div>
            </div>
          </Button>
          <Button variant="outline" className="flex items-center gap-2 h-auto p-4">
            <BarChart3 className="w-5 h-5" />
            <div className="text-left">
              <div className="font-medium">Performance Report</div>
              <div className="text-xs opacity-75">Detailed insights</div>
            </div>
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Feature Status Card Component
const FeatureStatusCard = ({ title, status, description, icon: Icon, color, details }) => {
  const colorClasses = {
    green: 'text-green-600 bg-green-100',
    blue: 'text-blue-600 bg-blue-100',
    gray: 'text-gray-600 bg-gray-100'
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-full ${colorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-semibold text-gray-900">{title}</h4>
              <Badge variant={color === 'green' ? 'success' : 'secondary'}>
                {status}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mb-3">{description}</p>
            <div className="space-y-1">
              {details.map((detail, index) => (
                <p key={index} className="text-xs text-gray-500">• {detail}</p>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Background Sync Section Component
const BackgroundSyncSection = ({ syncStatus, onToggleSync }) => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5" />
          Background App Refresh for iOS
        </CardTitle>
        <CardDescription>
          Automatic data synchronization when the app is in the background
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Sync Status */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium">Background Sync Status</h4>
              <p className="text-sm text-gray-600">
                {syncStatus.enabled ? 'Active - Data syncs automatically' : 'Inactive - Manual sync only'}
              </p>
            </div>
            <Button onClick={onToggleSync}>
              {syncStatus.enabled ? 'Disable' : 'Enable'}
            </Button>
          </div>

          {/* Sync Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {syncStatus.syncCount || 0}
              </div>
              <p className="text-sm text-gray-600">Total Syncs</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-2">
                {syncStatus.successRate || 100}%
              </div>
              <p className="text-sm text-gray-600">Success Rate</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-2">
                {syncStatus.dataSize || '2.3'}MB
              </div>
              <p className="text-sm text-gray-600">Data Synced</p>
            </div>
          </div>

          {/* Sync Configuration */}
          <div className="space-y-4">
            <h4 className="font-medium">Sync Configuration</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h5 className="font-medium mb-2">Sync Frequency</h5>
                <p className="text-sm text-gray-600 mb-2">Every 15 minutes (iOS minimum)</p>
                <Progress value={75} className="h-2" />
              </div>
              <div className="p-4 border rounded-lg">
                <h5 className="font-medium mb-2">Battery Impact</h5>
                <p className="text-sm text-gray-600 mb-2">Low impact optimization</p>
                <Progress value={25} className="h-2" />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

// AI Notifications Section Component
const AiNotificationsSection = ({ notificationData, onOptimize }) => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          AI-Powered Notification Timing
        </CardTitle>
        <CardDescription>
          Smart notification scheduling based on your behavior patterns
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Optimization Status */}
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div>
              <h4 className="font-medium">Notification Optimization</h4>
              <p className="text-sm text-gray-600">
                AI analyzes your productivity patterns to find optimal notification times
              </p>
            </div>
            <Button onClick={onOptimize}>
              Optimize Now
            </Button>
          </div>

          {/* Optimal Times */}
          <div>
            <h4 className="font-medium mb-4">Your Optimal Notification Times</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(notificationData.optimalTimes || ['9:00 AM', '2:00 PM', '6:00 PM']).map((time, index) => (
                <div key={index} className="text-center p-3 border rounded-lg">
                  <Clock className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-medium">{time}</p>
                  <p className="text-xs text-gray-500">Peak focus</p>
                </div>
              ))}
            </div>
          </div>

          {/* Notification Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-2">
                {notificationData.engagementRate || 85}%
              </div>
              <p className="text-sm text-gray-600">Engagement Rate</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {notificationData.todayCount || 12}
              </div>
              <p className="text-sm text-gray-600">Notifications Today</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-2">
                {notificationData.responseTime || 3.2}s
              </div>
              <p className="text-sm text-gray-600">Avg Response Time</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Voice Recognition Section Component
const VoiceRecognitionSection = ({ voiceData, onStartVoice, onStopVoice }) => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="w-5 h-5" />
          Voice Recognition Support
        </CardTitle>
        <CardDescription>
          Natural language commands for hands-free app control
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Voice Control */}
          <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
            <div>
              <h4 className="font-medium">Voice Commands</h4>
              <p className="text-sm text-gray-600">
                Say commands like "Show analytics" or "Add goal"
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={onStartVoice}>
                <Mic className="w-4 h-4 mr-2" />
                Start Listening
              </Button>
              <Button variant="outline" onClick={onStopVoice}>
                Stop
              </Button>
            </div>
          </div>

          {/* Available Commands */}
          <div>
            <h4 className="font-medium mb-4">Available Voice Commands</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { command: "Add goal", description: "Create a new goal" },
                { command: "Show analytics", description: "Display analytics dashboard" },
                { command: "Update progress", description: "Update goal progress" },
                { command: "Read notifications", description: "Read unread notifications" },
                { command: "Start focus session", description: "Begin a focus session" },
                { command: "Take break", description: "Start break reminder" },
                { command: "Show recommendations", description: "Display AI recommendations" }
              ].map((item, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <p className="font-medium text-purple-600">"{item.command}"</p>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Voice Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-2">
                {voiceData.commandsToday || 0}
              </div>
              <p className="text-sm text-gray-600">Commands Today</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-2">
                {voiceData.accuracy || 95}%
              </div>
              <p className="text-sm text-gray-600">Recognition Accuracy</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {voiceData.mostUsed || 'Show analytics'}
              </div>
              <p className="text-sm text-gray-600">Most Used Command</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Performance Section Component
const PerformanceSection = ({ performanceData }) => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Advanced Mobile Performance Analytics
        </CardTitle>
        <CardDescription>
          Comprehensive performance metrics and optimization insights
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Performance Score */}
          <div className="text-center p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
            <div className="text-4xl font-bold text-green-600 mb-2">
              {performanceData.overallScore || 85}%
            </div>
            <p className="text-lg font-medium text-gray-900">Overall Performance Score</p>
            <p className="text-sm text-gray-600">Excellent mobile experience</p>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <Battery className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <div className="text-xl font-bold text-gray-900">
                {performanceData.batteryImpact || 'Low'}
              </div>
              <p className="text-sm text-gray-600">Battery Impact</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Wifi className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <div className="text-xl font-bold text-gray-900">
                {performanceData.networkEfficiency || 92}%
              </div>
              <p className="text-sm text-gray-600">Network Efficiency</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Zap className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
              <div className="text-xl font-bold text-gray-900">
                {performanceData.loadTime || 1.2}s
              </div>
              <p className="text-sm text-gray-600">Avg Load Time</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Activity className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <div className="text-xl font-bold text-gray-900">
                {performanceData.memoryUsage || 45}MB
              </div>
              <p className="text-sm text-gray-600">Memory Usage</p>
            </div>
          </div>

          {/* Performance Trends */}
          <div>
            <h4 className="font-medium mb-4">Performance Trends</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">App Launch Time</span>
                <div className="flex items-center gap-2">
                  <Progress value={85} className="w-32 h-2" />
                  <span className="text-sm font-medium">1.2s</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Screen Transition Speed</span>
                <div className="flex items-center gap-2">
                  <Progress value={92} className="w-32 h-2" />
                  <span className="text-sm font-medium">0.3s</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">API Response Time</span>
                <div className="flex items-center gap-2">
                  <Progress value={78} className="w-32 h-2" />
                  <span className="text-sm font-medium">0.8s</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default MobileAnalyticsDashboard;