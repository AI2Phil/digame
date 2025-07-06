import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  RefreshControl,
  Alert,
  Share,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate
} from 'react-native-reanimated';
import {
  LineChart,
  BarChart,
  PieChart,
  AreaChart,
  ContributionGraph
} from 'react-native-chart-kit';

// Services
import MobileAnalyticsCacheManager from '../services/MobileAnalyticsCacheManager';
import MobileAIService from '../services/MobileAIService';
import enhancedOfflineService from '../services/enhancedOfflineService';
import { ApiService } from '../services/ApiService';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const chartWidth = screenWidth - 32;

const ComprehensiveMobileAnalytics = ({ navigation, route }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('30d');
  const [analyticsData, setAnalyticsData] = useState({});
  const [performanceData, setPerformanceData] = useState({});
  const [userBehaviorData, setUserBehaviorData] = useState({});
  const [predictiveData, setPredictiveData] = useState({});
  const [realTimeMetrics, setRealTimeMetrics] = useState({});
  const [offlineMode, setOfflineMode] = useState(false);

  // Animation values
  const fadeAnim = useSharedValue(0);
  const slideAnim = useSharedValue(50);

  useEffect(() => {
    initializeAnalytics();
    setupAnimations();
    setupRealTimeUpdates();
  }, [timeRange]);

  const initializeAnalytics = async () => {
    try {
      setLoading(true);

      // Check offline status
      const offlineStatus = await enhancedOfflineService.getOfflineStatus();
      setOfflineMode(!offlineStatus.isOnline);

      // Load analytics data
      const [
        analytics,
        performance,
        userBehavior,
        predictions,
        realTime
      ] = await Promise.all([
        loadAnalyticsData(),
        loadPerformanceData(),
        loadUserBehaviorData(),
        loadPredictiveData(),
        loadRealTimeMetrics()
      ]);

      setAnalyticsData(analytics);
      setPerformanceData(performance);
      setUserBehaviorData(userBehavior);
      setPredictiveData(predictions);
      setRealTimeMetrics(realTime);

    } catch (error) {
      console.error('Failed to initialize analytics:', error);
      // Load mock data as fallback
      setAnalyticsData(generateMockAnalyticsData());
      setPerformanceData(generateMockPerformanceData());
      setUserBehaviorData(generateMockUserBehaviorData());
      setPredictiveData(generateMockPredictiveData());
      setRealTimeMetrics(generateMockRealTimeData());
    } finally {
      setLoading(false);
    }
  };

  const setupAnimations = () => {
    fadeAnim.value = withTiming(1, { duration: 800 });
    slideAnim.value = withTiming(0, { duration: 600 });
  };

  const setupRealTimeUpdates = () => {
    const interval = setInterval(async () => {
      if (!offlineMode) {
        try {
          const realTime = await loadRealTimeMetrics();
          setRealTimeMetrics(realTime);
        } catch (error) {
          console.error('Failed to update real-time metrics:', error);
        }
      }
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  };

  const loadAnalyticsData = async () => {
    try {
      if (offlineMode) {
        return await enhancedOfflineService.getAnalyticsData('comprehensive', 100);
      }
      
      const cached = await MobileAnalyticsCacheManager.getCachedData('analytics', timeRange);
      if (cached) return cached;

      const data = await ApiService.getAnalytics({ timeRange });
      await MobileAnalyticsCacheManager.cacheData('analytics', timeRange, data);
      
      return data || generateMockAnalyticsData();
    } catch (error) {
      console.error('Failed to load analytics data:', error);
      return generateMockAnalyticsData();
    }
  };

  const loadPerformanceData = async () => {
    try {
      if (offlineMode) {
        return await enhancedOfflineService.getCache('performance_data');
      }

      const data = await ApiService.getPerformanceMetrics();
      await enhancedOfflineService.setCache('performance_data', data, 300000); // 5 min cache
      
      return data || generateMockPerformanceData();
    } catch (error) {
      console.error('Failed to load performance data:', error);
      return generateMockPerformanceData();
    }
  };

  const loadUserBehaviorData = async () => {
    try {
      const insights = await MobileAIService.getUserBehaviorAnalysis();
      return insights || generateMockUserBehaviorData();
    } catch (error) {
      console.error('Failed to load user behavior data:', error);
      return generateMockUserBehaviorData();
    }
  };

  const loadPredictiveData = async () => {
    try {
      const predictions = await MobileAIService.getPredictiveInsights();
      return predictions || generateMockPredictiveData();
    } catch (error) {
      console.error('Failed to load predictive data:', error);
      return generateMockPredictiveData();
    }
  };

  const loadRealTimeMetrics = async () => {
    try {
      if (offlineMode) {
        return await enhancedOfflineService.getCache('realtime_metrics');
      }

      const metrics = await ApiService.getRealTimeMetrics();
      await enhancedOfflineService.setCache('realtime_metrics', metrics, 30000); // 30 sec cache
      
      return metrics || generateMockRealTimeData();
    } catch (error) {
      console.error('Failed to load real-time metrics:', error);
      return generateMockRealTimeData();
    }
  };

  // Mock data generators
  const generateMockAnalyticsData = () => ({
    overview: {
      totalUsers: 12847,
      activeUsers: 8956,
      sessions: 15234,
      pageViews: 89234,
      bounceRate: 23.4,
      avgSessionDuration: 485
    },
    trends: [
      { date: '2025-01-01', users: 8500, sessions: 12000, pageViews: 45000 },
      { date: '2025-01-02', users: 8750, sessions: 12500, pageViews: 47000 },
      { date: '2025-01-03', users: 9100, sessions: 13200, pageViews: 49500 },
      { date: '2025-01-04', users: 9350, sessions: 13800, pageViews: 52000 },
      { date: '2025-01-05', users: 9600, sessions: 14500, pageViews: 54500 },
      { date: '2025-01-06', users: 9850, sessions: 15000, pageViews: 57000 },
      { date: '2025-01-07', users: 10200, sessions: 15600, pageViews: 59500 }
    ],
    deviceTypes: [
      { name: 'Mobile', value: 65, color: '#3B82F6' },
      { name: 'Desktop', value: 25, color: '#10B981' },
      { name: 'Tablet', value: 10, color: '#F59E0B' }
    ],
    topPages: [
      { page: '/dashboard', views: 25000, percentage: 28 },
      { page: '/analytics', views: 18000, percentage: 20 },
      { page: '/profile', views: 15000, percentage: 17 },
      { page: '/settings', views: 12000, percentage: 13 },
      { page: '/help', views: 8000, percentage: 9 }
    ]
  });

  const generateMockPerformanceData = () => ({
    metrics: {
      responseTime: 245,
      uptime: 99.8,
      errorRate: 0.02,
      throughput: 1250,
      cpuUsage: 45,
      memoryUsage: 68
    },
    trends: [
      { time: '00:00', responseTime: 230, cpuUsage: 40, memoryUsage: 65 },
      { time: '04:00', responseTime: 220, cpuUsage: 35, memoryUsage: 62 },
      { time: '08:00', responseTime: 250, cpuUsage: 50, memoryUsage: 70 },
      { time: '12:00', responseTime: 280, cpuUsage: 60, memoryUsage: 75 },
      { time: '16:00', responseTime: 260, cpuUsage: 55, memoryUsage: 72 },
      { time: '20:00', responseTime: 240, cpuUsage: 45, memoryUsage: 68 }
    ]
  });

  const generateMockUserBehaviorData = () => ({
    engagement: {
      dailyActiveUsers: 8956,
      weeklyActiveUsers: 12847,
      monthlyActiveUsers: 18234,
      retentionRate: 78.5
    },
    patterns: [
      { hour: 0, activity: 15 },
      { hour: 6, activity: 25 },
      { hour: 9, activity: 85 },
      { hour: 12, activity: 95 },
      { hour: 15, activity: 75 },
      { hour: 18, activity: 65 },
      { hour: 21, activity: 45 },
      { hour: 23, activity: 20 }
    ],
    features: [
      { feature: 'Dashboard', usage: 92 },
      { feature: 'Analytics', usage: 78 },
      { feature: 'Reports', usage: 65 },
      { feature: 'Settings', usage: 45 },
      { feature: 'Help', usage: 32 }
    ]
  });

  const generateMockPredictiveData = () => ({
    userGrowth: {
      predicted: 15620,
      confidence: 0.87,
      trend: 'up',
      change: 21.6
    },
    churnRisk: {
      highRisk: 45,
      mediumRisk: 120,
      lowRisk: 890
    },
    recommendations: [
      {
        type: 'engagement',
        title: 'Improve Mobile Experience',
        description: 'Mobile users show 40% higher engagement potential',
        impact: 'High',
        effort: 'Medium'
      },
      {
        type: 'retention',
        title: 'Enhanced Onboarding',
        description: 'Better onboarding can reduce churn by 25%',
        impact: 'High',
        effort: 'Low'
      }
    ]
  });

  const generateMockRealTimeData = () => ({
    activeUsers: 1247,
    requestsPerMinute: 342,
    responseTime: 245,
    errorRate: 0.02,
    lastUpdated: new Date().toISOString()
  });

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await initializeAnalytics();
    setRefreshing(false);
  }, [timeRange]);

  const handleExport = useCallback(async () => {
    try {
      const exportData = {
        analytics: analyticsData,
        performance: performanceData,
        userBehavior: userBehaviorData,
        predictive: predictiveData,
        timeRange,
        exportedAt: new Date().toISOString()
      };

      if (Platform.OS === 'ios') {
        await Share.share({
          message: JSON.stringify(exportData, null, 2),
          title: 'Analytics Export'
        });
      } else {
        await Share.share({
          message: 'Analytics data exported',
          title: 'Analytics Export'
        });
      }
    } catch (error) {
      Alert.alert('Export Failed', 'Unable to export analytics data');
    }
  }, [analyticsData, performanceData, userBehaviorData, predictiveData, timeRange]);

  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      opacity: fadeAnim.value,
      transform: [{ translateY: slideAnim.value }]
    };
  });

  const chartConfig = {
    backgroundColor: '#FFFFFF',
    backgroundGradientFrom: '#FFFFFF',
    backgroundGradientTo: '#FFFFFF',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
    style: {
      borderRadius: 16
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#3B82F6'
    }
  };

  const tabs = [
    { id: 'overview', title: 'Overview', icon: 'analytics-outline' },
    { id: 'performance', title: 'Performance', icon: 'speedometer-outline' },
    { id: 'behavior', title: 'Behavior', icon: 'people-outline' },
    { id: 'predictions', title: 'AI Insights', icon: 'brain-outline' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'performance':
        return renderPerformanceTab();
      case 'behavior':
        return renderBehaviorTab();
      case 'predictions':
        return renderPredictionsTab();
      default:
        return renderOverviewTab();
    }
  };

  const renderOverviewTab = () => (
    <View style={styles.tabContent}>
      {/* KPI Cards */}
      <View style={styles.kpiContainer}>
        <View style={styles.kpiRow}>
          <KPICard
            title="Total Users"
            value={analyticsData.overview?.totalUsers?.toLocaleString() || '0'}
            icon="people"
            color="#3B82F6"
            trend="up"
            change="+12.5%"
          />
          <KPICard
            title="Active Users"
            value={analyticsData.overview?.activeUsers?.toLocaleString() || '0'}
            icon="pulse"
            color="#10B981"
            trend="up"
            change="+8.3%"
          />
        </View>
        <View style={styles.kpiRow}>
          <KPICard
            title="Sessions"
            value={analyticsData.overview?.sessions?.toLocaleString() || '0'}
            icon="time"
            color="#F59E0B"
            trend="up"
            change="+15.2%"
          />
          <KPICard
            title="Page Views"
            value={analyticsData.overview?.pageViews?.toLocaleString() || '0'}
            icon="eye"
            color="#8B5CF6"
            trend="up"
            change="+6.7%"
          />
        </View>
      </View>

      {/* Trends Chart */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>User Trends (7 Days)</Text>
        {analyticsData.trends && analyticsData.trends.length > 0 && (
          <LineChart
            data={{
              labels: analyticsData.trends.map(item => 
                new Date(item.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })
              ),
              datasets: [{
                data: analyticsData.trends.map(item => item.users)
              }]
            }}
            width={chartWidth}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        )}
      </View>

      {/* Device Types */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Device Distribution</Text>
        {analyticsData.deviceTypes && analyticsData.deviceTypes.length > 0 && (
          <PieChart
            data={analyticsData.deviceTypes.map(item => ({
              name: item.name,
              population: item.value,
              color: item.color,
              legendFontColor: '#6B7280',
              legendFontSize: 12
            }))}
            width={chartWidth}
            height={220}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            style={styles.chart}
          />
        )}
      </View>
    </View>
  );

  const renderPerformanceTab = () => (
    <View style={styles.tabContent}>
      {/* Performance Metrics */}
      <View style={styles.metricsGrid}>
        <PerformanceMetric
          title="Response Time"
          value={`${performanceData.metrics?.responseTime || 0}ms`}
          icon="flash"
          color="#3B82F6"
        />
        <PerformanceMetric
          title="Uptime"
          value={`${performanceData.metrics?.uptime || 0}%`}
          icon="checkmark-circle"
          color="#10B981"
        />
        <PerformanceMetric
          title="Error Rate"
          value={`${performanceData.metrics?.errorRate || 0}%`}
          icon="warning"
          color="#EF4444"
        />
        <PerformanceMetric
          title="Throughput"
          value={`${performanceData.metrics?.throughput || 0}/min`}
          icon="trending-up"
          color="#8B5CF6"
        />
      </View>

      {/* Performance Trends */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Response Time Trends</Text>
        {performanceData.trends && performanceData.trends.length > 0 && (
          <AreaChart
            data={{
              labels: performanceData.trends.map(item => item.time),
              datasets: [{
                data: performanceData.trends.map(item => item.responseTime)
              }]
            }}
            width={chartWidth}
            height={220}
            chartConfig={{
              ...chartConfig,
              color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`
            }}
            style={styles.chart}
          />
        )}
      </View>
    </View>
  );

  const renderBehaviorTab = () => (
    <View style={styles.tabContent}>
      {/* Engagement Metrics */}
      <View style={styles.engagementContainer}>
        <Text style={styles.sectionTitle}>User Engagement</Text>
        <View style={styles.engagementGrid}>
          <EngagementCard
            title="Daily Active"
            value={userBehaviorData.engagement?.dailyActiveUsers?.toLocaleString() || '0'}
            subtitle="users"
          />
          <EngagementCard
            title="Weekly Active"
            value={userBehaviorData.engagement?.weeklyActiveUsers?.toLocaleString() || '0'}
            subtitle="users"
          />
          <EngagementCard
            title="Monthly Active"
            value={userBehaviorData.engagement?.monthlyActiveUsers?.toLocaleString() || '0'}
            subtitle="users"
          />
          <EngagementCard
            title="Retention Rate"
            value={`${userBehaviorData.engagement?.retentionRate || 0}%`}
            subtitle="retained"
          />
        </View>
      </View>

      {/* Activity Patterns */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Daily Activity Patterns</Text>
        {userBehaviorData.patterns && userBehaviorData.patterns.length > 0 && (
          <BarChart
            data={{
              labels: userBehaviorData.patterns.map(item => `${item.hour}:00`),
              datasets: [{
                data: userBehaviorData.patterns.map(item => item.activity)
              }]
            }}
            width={chartWidth}
            height={220}
            chartConfig={{
              ...chartConfig,
              color: (opacity = 1) => `rgba(245, 158, 11, ${opacity})`
            }}
            style={styles.chart}
          />
        )}
      </View>

      {/* Feature Usage */}
      <View style={styles.featureUsageContainer}>
        <Text style={styles.sectionTitle}>Feature Usage</Text>
        {userBehaviorData.features && userBehaviorData.features.map((feature, index) => (
          <FeatureUsageBar
            key={index}
            feature={feature.feature}
            usage={feature.usage}
          />
        ))}
      </View>
    </View>
  );

  const renderPredictionsTab = () => (
    <View style={styles.tabContent}>
      {/* Prediction Cards */}
      <View style={styles.predictionContainer}>
        <PredictionCard
          title="User Growth Prediction"
          current={analyticsData.overview?.totalUsers || 0}
          predicted={predictiveData.userGrowth?.predicted || 0}
          confidence={predictiveData.userGrowth?.confidence || 0}
          trend={predictiveData.userGrowth?.trend || 'stable'}
          change={predictiveData.userGrowth?.change || 0}
        />
      </View>

      {/* Churn Risk Analysis */}
      <View style={styles.churnContainer}>
        <Text style={styles.sectionTitle}>Churn Risk Analysis</Text>
        <View style={styles.churnGrid}>
          <ChurnRiskCard
            title="High Risk"
            value={predictiveData.churnRisk?.highRisk || 0}
            color="#EF4444"
          />
          <ChurnRiskCard
            title="Medium Risk"
            value={predictiveData.churnRisk?.mediumRisk || 0}
            color="#F59E0B"
          />
          <ChurnRiskCard
            title="Low Risk"
            value={predictiveData.churnRisk?.lowRisk || 0}
            color="#10B981"
          />
        </View>
      </View>

      {/* AI Recommendations */}
      <View style={styles.recommendationsContainer}>
        <Text style={styles.sectionTitle}>AI Recommendations</Text>
        {predictiveData.recommendations && predictiveData.recommendations.map((rec, index) => (
          <RecommendationCard
            key={index}
            type={rec.type}
            title={rec.title}
            description={rec.description}
            impact={rec.impact}
            effort={rec.effort}
          />
        ))}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="analytics-outline" size={48} color="#3B82F6" />
        <Text style={styles.loadingText}>Loading Analytics...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#3B82F6', '#1D4ED8']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Analytics</Text>
            <Text style={styles.headerSubtitle}>
              Comprehensive insights and metrics
            </Text>
          </View>

          <TouchableOpacity
            style={styles.exportButton}
            onPress={handleExport}
          >
            <Ionicons name="share-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Real-time Status */}
        <View style={styles.realTimeStatus}>
          <View style={styles.statusItem}>
            <Ionicons name="pulse" size={16} color="#FFFFFF" />
            <Text style={styles.statusText}>
              {realTimeMetrics.activeUsers || 0} active
            </Text>
          </View>
          <View style={styles.statusItem}>
            <Ionicons name="flash" size={16} color="#FFFFFF" />
            <Text style={styles.statusText}>
              {realTimeMetrics.responseTime || 0}ms
            </Text>
          </View>
          {offlineMode && (
            <View style={styles.statusItem}>
              <Ionicons name="cloud-offline" size={16} color="#F59E0B" />
              <Text style={[styles.statusText, { color: '#F59E0B' }]}>
                Offline
              </Text>
            </View>
          )}
        </View>

        {/* Time Range Selector */}
        <View style={styles.timeRangeContainer}>
          {['7d', '30d', '90d'].map(range => (
            <TouchableOpacity
              key={range}
              style={[
                styles.timeRangeButton,
                timeRange === range && styles.timeRangeButtonActive
              ]}
              onPress={() => setTimeRange(range)}
            >
              <Text style={[
                styles.timeRangeText,
                timeRange === range && styles.timeRangeTextActive
              ]}>
                {range}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tabButton,
                activeTab === tab.id && styles.tabButtonActive
              ]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Ionicons
                name={tab.icon}
                size={20}
                color={activeTab === tab.id ? '#3B82F6' : '#6B7280'}
              />
              <Text style={[
                styles.tabText,
                activeTab === tab.id && styles.tabTextActive
              ]}>
                {tab.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#3B82F6']}
            tintColor="#3B82F6"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={animatedContainerStyle}>
          {renderTabContent()}
        </Animated.View>
      </ScrollView>
    </View>
  );
};

// Component definitions for KPICard, PerformanceMetric, etc. would go here
// Due to length constraints, I'll include a few key ones:

const KPICard = ({ title, value, icon, color, trend, change }) => (
  <View style={[styles.kpiCard, { borderLeftColor: color }]}>
    <View style={styles.kpiHeader}>
      <Ionicons name={icon} size={20} color={color} />
      <Text style={styles.kpiTitle}>{title}</Text>
    </View>
    <Text style={styles.kpiValue}>{value}</Text>
    <View style={styles.kpiTrend}>
      <Ionicons
        name={trend === 'up' ? 'trending-up' : 'trending-down'}
        size={12}
        color={trend === 'up' ? '#10B981' : '#EF4444'}
      />
      <Text style={[
        styles.kpiChange,
        { color: trend === 'up' ? '#10B981' : '#EF4444' }
      ]}>
        {change}
      </Text>
    </View>
  </View>
);

const PerformanceMetric = ({ title, value, icon, color }) => (
  <View style={styles.performanceCard}>
    <View style={[styles.performanceIcon, { backgroundColor: color + '20' }]}>
      <Ionicons name={icon} size={24} color={color} />
    </View>
    <Text style={styles.performanceValue}>{value}</Text>
    <Text style={styles.performanceTitle}>{title}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC'
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500'
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 20,
    paddingHorizontal: 16
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerInfo: {
    flex: 1,
    marginLeft: 16
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF'
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E0E7FF',
    marginTop: 4
  },
  exportButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  realTimeStatus: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingHorizontal: 16
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  statusText: {
    fontSize: 12,
    color: '#FFFFFF',
    marginLeft: 4,
    fontWeight: '500'
  },
  timeRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8
  },
  timeRangeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)'
  },
  timeRangeButtonActive: {
    backgroundColor: '#FFFFFF'
  },
  timeRangeText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500'
  },
  timeRangeTextActive: {
    color: '#3B82F6'
  },
  tabNavigation: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 4
  },
  tabButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#3B82F6'
  },
  tabText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
    fontWeight: '500'
  },
  tabTextActive: {
    color: '#3B82F6'
  },
  content: {
    flex: 1
  },
  tabContent: {
    padding: 16
  },
  kpiContainer: {
    marginBottom: 24
  },
  kpiRow: {
    flexDirection: 'row',
    marginBottom: 12
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 6,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  kpiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  kpiTitle: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 8,
    fontWeight: '500'
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4
  },
  kpiTrend: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  kpiChange: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16
  },
  chart: {
    borderRadius: 16
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24
  },
  performanceCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  performanceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12
  },
  performanceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4
  },
  performanceTitle: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center'
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16
  },
  engagementContainer: {
    marginBottom: 24
  },
  engagementGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  featureUsageContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  predictionContainer: {
    marginBottom: 24
  },
  churnContainer: {
    marginBottom: 24
  },
  churnGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  recommendationsContainer: {
    marginBottom: 24
  }
});

// Additional component definitions
const EngagementCard = ({ title, value, subtitle }) => (
  <View style={styles.performanceCard}>
    <Text style={styles.performanceValue}>{value}</Text>
    <Text style={styles.performanceTitle}>{title}</Text>
    <Text style={[styles.performanceTitle, { fontSize: 10, marginTop: 2 }]}>{subtitle}</Text>
  </View>
);

const FeatureUsageBar = ({ feature, usage }) => (
  <View style={{ marginBottom: 12 }}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
      <Text style={{ fontSize: 14, color: '#1F2937', fontWeight: '500' }}>{feature}</Text>
      <Text style={{ fontSize: 14, color: '#6B7280' }}>{usage}%</Text>
    </View>
    <View style={{ height: 6, backgroundColor: '#E5E7EB', borderRadius: 3 }}>
      <View style={{
        height: 6,
        backgroundColor: '#3B82F6',
        borderRadius: 3,
        width: `${usage}%`
      }} />
    </View>
  </View>
);

const PredictionCard = ({ title, current, predicted, confidence, trend, change }) => (
  <View style={[styles.chartContainer, { marginBottom: 16 }]}>
    <Text style={styles.chartTitle}>{title}</Text>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <View>
        <Text style={{ fontSize: 12, color: '#6B7280' }}>Current</Text>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1F2937' }}>
          {current.toLocaleString()}
        </Text>
      </View>
      <View style={{ alignItems: 'center' }}>
        <Text style={{ fontSize: 12, color: '#6B7280' }}>Predicted</Text>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#3B82F6' }}>
          {predicted.toLocaleString()}
        </Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={{ fontSize: 12, color: '#6B7280' }}>Confidence</Text>
        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#10B981' }}>
          {(confidence * 100).toFixed(0)}%
        </Text>
      </View>
    </View>
  </View>
);

export default ComprehensiveMobileAnalytics;

const ChurnRiskCard = ({ title, value, color }) => (
  <View style={[styles.performanceCard, { width: '30%' }]}>
    <View style={[styles.performanceIcon, { backgroundColor: color + '20' }]}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', color }}>
        {value}
      </Text>
    </View>
    <Text style={styles.performanceTitle}>{title}</Text>
  </View>
);

const RecommendationCard = ({ type, title, description, impact, effort }) => (
  <View style={[styles.chartContainer, { marginBottom: 12 }]}>
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
      <View style={{
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: '#3B82F6',
        borderRadius: 12,
        marginRight: 8
      }}>
        <Text style={{ fontSize: 10, color: '#FFFFFF', fontWeight: 'bold' }}>
          {type.toUpperCase()}
        </Text>
      </View>
      <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1F2937', flex: 1 }}>
        {title}
      </Text>
    </View>
    <Text style={{ fontSize: 14, color: '#6B7280', marginBottom: 12, lineHeight: 20 }}>
      {description}
    </Text>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ fontSize: 12, color: '#6B7280', marginRight: 4 }}>Impact:</Text>
        <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#10B981' }}>{impact}</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ fontSize: 12, color: '#6B7280', marginRight: 4 }}>Effort:</Text>
        <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#F59E0B' }}>{effort}</Text>
      </View>
    </View>
  </View>
);