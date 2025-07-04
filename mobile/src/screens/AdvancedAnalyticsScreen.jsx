import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { ApiService } from '../services/ApiService';
import { AdvancedAnalyticsService } from '../services/AdvancedAnalyticsService';
import {
  OptimizedContainer,
  AdaptiveLayout,
  ResponsiveText,
  LoadingSkeleton,
  usePerformanceMonitor,
} from '../components/MobileOptimizedUI';

const screenWidth = Dimensions.get('window').width;

const AdvancedAnalyticsScreen = () => {
  usePerformanceMonitor('AdvancedAnalyticsScreen');

  // State Management
  const [timeRange, setTimeRange] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Analytics Data State
  const [analyticsData, setAnalyticsData] = useState({
    userBehavior: null,
    anomalies: [],
    revenuePrediction: null,
    churnAnalysis: null,
    insightsReport: null,
    performanceMetrics: null,
    mlModelsStatus: null,
  });

  // Configuration
  const timeRangeOptions = [
    { label: '7D', value: '7d', days: 7 },
    { label: '30D', value: '30d', days: 30 },
    { label: '90D', value: '90d', days: 90 },
  ];

  const tabOptions = [
    { id: 'overview', label: 'Overview', icon: 'analytics' },
    { id: 'predictions', label: 'Predictions', icon: 'trending-up' },
    { id: 'anomalies', label: 'Anomalies', icon: 'warning' },
    { id: 'insights', label: 'Insights', icon: 'bulb' },
  ];

  // Load Analytics Data
  const loadAnalyticsData = useCallback(async () => {
    try {
      setError(null);
      const timeRangeConfig = timeRangeOptions.find(opt => opt.value === timeRange);
      const days = timeRangeConfig?.days || 30;

      // Load all analytics data in parallel for better performance
      const [
        userBehavior,
        anomalies,
        revenuePrediction,
        churnAnalysis,
        insightsReport,
        performanceMetrics,
        mlModelsStatus,
      ] = await Promise.allSettled([
        AdvancedAnalyticsService.getUserBehaviorAnalysis(null, days),
        AdvancedAnalyticsService.getAnomalyDetection('user_activity', days),
        AdvancedAnalyticsService.getRevenuePrediction(30),
        AdvancedAnalyticsService.getChurnPrediction(),
        AdvancedAnalyticsService.getInsightsReport(days),
        AdvancedAnalyticsService.getPerformanceMetrics(),
        AdvancedAnalyticsService.getMLModelsStatus(),
      ]);

      // Process results and handle errors gracefully
      setAnalyticsData({
        userBehavior: userBehavior.status === 'fulfilled' ? userBehavior.value : null,
        anomalies: anomalies.status === 'fulfilled' ? anomalies.value : [],
        revenuePrediction: revenuePrediction.status === 'fulfilled' ? revenuePrediction.value : null,
        churnAnalysis: churnAnalysis.status === 'fulfilled' ? churnAnalysis.value : null,
        insightsReport: insightsReport.status === 'fulfilled' ? insightsReport.value : null,
        performanceMetrics: performanceMetrics.status === 'fulfilled' ? performanceMetrics.value : null,
        mlModelsStatus: mlModelsStatus.status === 'fulfilled' ? mlModelsStatus.value : null,
      });

      // Log any failed requests for debugging
      [userBehavior, anomalies, revenuePrediction, churnAnalysis, insightsReport, performanceMetrics, mlModelsStatus]
        .forEach((result, index) => {
          if (result.status === 'rejected') {
            console.warn(`Analytics request ${index} failed:`, result.reason);
          }
        });

    } catch (error) {
      console.error('Error loading analytics data:', error);
      setError('Failed to load analytics data. Please try again.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [timeRange]);

  // Effects
  useEffect(() => {
    loadAnalyticsData();
  }, [loadAnalyticsData]);

  // Handlers
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadAnalyticsData();
  }, [loadAnalyticsData]);

  const handleTimeRangeChange = useCallback((newTimeRange) => {
    setTimeRange(newTimeRange);
  }, []);

  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
  }, []);

  // Memoized Chart Configuration
  const chartConfig = useMemo(() => ({
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: { borderRadius: 16 },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#007AFF',
    },
  }), []);

  // Render Components
  const renderHeader = () => (
    <View style={styles.header}>
      <ResponsiveText variant="title1" style={styles.title}>
        Advanced Analytics
      </ResponsiveText>
      <ResponsiveText variant="body" style={styles.subtitle}>
        ML-powered insights and predictions
      </ResponsiveText>
      {analyticsData.mlModelsStatus && (
        <View style={styles.mlStatusBadge}>
          <Ionicons 
            name={analyticsData.mlModelsStatus.ml_available ? "checkmark-circle" : "alert-circle"} 
            size={16} 
            color={analyticsData.mlModelsStatus.ml_available ? "#34C759" : "#FF9500"} 
          />
          <Text style={styles.mlStatusText}>
            ML {analyticsData.mlModelsStatus.ml_available ? 'Enabled' : 'Limited'}
          </Text>
        </View>
      )}
    </View>
  );

  const renderTimeRangeSelector = () => (
    <View style={styles.timeRangeContainer}>
      {timeRangeOptions.map((option) => (
        <TouchableOpacity
          key={option.value}
          style={[
            styles.timeRangeButton,
            timeRange === option.value && styles.timeRangeButtonActive,
          ]}
          onPress={() => handleTimeRangeChange(option.value)}
          accessibilityLabel={`Select ${option.label} time range`}
          accessibilityRole="button"
        >
          <Text
            style={[
              styles.timeRangeButtonText,
              timeRange === option.value && styles.timeRangeButtonTextActive,
            ]}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderTabSelector = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.tabContainer}
      contentContainerStyle={styles.tabContentContainer}
    >
      {tabOptions.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[
            styles.tabButton,
            activeTab === tab.id && styles.tabButtonActive,
          ]}
          onPress={() => handleTabChange(tab.id)}
          accessibilityLabel={`Switch to ${tab.label} tab`}
          accessibilityRole="tab"
        >
          <Ionicons 
            name={tab.icon} 
            size={20} 
            color={activeTab === tab.id ? '#007AFF' : '#666'} 
          />
          <Text
            style={[
              styles.tabButtonText,
              activeTab === tab.id && styles.tabButtonTextActive,
            ]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderOverviewTab = () => (
    <View style={styles.tabContent}>
      {/* User Behavior Analysis */}
      {analyticsData.userBehavior && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>User Behavior Patterns</Text>
          <Text style={styles.chartSubtitle}>
            Confidence: {(analyticsData.userBehavior.confidence * 100).toFixed(1)}%
          </Text>
          {analyticsData.userBehavior.data.activity_trend && (
            <LineChart
              data={{
                labels: analyticsData.userBehavior.data.activity_trend.map((_, index) => 
                  `Day ${index + 1}`
                ),
                datasets: [{
                  data: analyticsData.userBehavior.data.activity_trend,
                  color: (opacity = 1) => `rgba(52, 199, 89, ${opacity})`,
                  strokeWidth: 3,
                }],
              }}
              width={screenWidth - 40}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          )}
          
          {/* Insights */}
          <View style={styles.insightsContainer}>
            {analyticsData.userBehavior.insights.map((insight, index) => (
              <View key={index} style={styles.insightItem}>
                <Ionicons name="bulb-outline" size={16} color="#FF9500" />
                <Text style={styles.insightText}>{insight}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Performance Metrics */}
      {analyticsData.performanceMetrics && (
        <View style={styles.metricsContainer}>
          <Text style={styles.sectionTitle}>Platform Performance</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>
                {analyticsData.performanceMetrics.cache_performance?.hit_rate || 'N/A'}
              </Text>
              <Text style={styles.metricLabel}>Cache Hit Rate</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>
                {analyticsData.performanceMetrics.task_processing?.queue_size || 'N/A'}
              </Text>
              <Text style={styles.metricLabel}>Queue Size</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );

  const renderPredictionsTab = () => (
    <View style={styles.tabContent}>
      {/* Revenue Prediction */}
      {analyticsData.revenuePrediction && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Revenue Prediction</Text>
          <Text style={styles.chartSubtitle}>
            30-day forecast • Accuracy: {(analyticsData.revenuePrediction.model_accuracy * 100).toFixed(1)}%
          </Text>
          
          <View style={styles.predictionCard}>
            <View style={styles.predictionHeader}>
              <Ionicons name="trending-up" size={24} color="#34C759" />
              <Text style={styles.predictionValue}>
                ${analyticsData.revenuePrediction.predicted_value.toLocaleString()}
              </Text>
            </View>
            <Text style={styles.predictionLabel}>Predicted Revenue</Text>
            <Text style={styles.confidenceInterval}>
              Range: ${analyticsData.revenuePrediction.confidence_interval[0].toLocaleString()} - 
              ${analyticsData.revenuePrediction.confidence_interval[1].toLocaleString()}
            </Text>
          </View>

          {/* Prediction Factors */}
          <View style={styles.factorsContainer}>
            <Text style={styles.factorsTitle}>Key Factors</Text>
            {analyticsData.revenuePrediction.factors.map((factor, index) => (
              <View key={index} style={styles.factorItem}>
                <Text style={styles.factorName}>{factor.name}</Text>
                <Text style={styles.factorImpact}>
                  Impact: {(factor.importance * 100).toFixed(1)}%
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Churn Analysis */}
      {analyticsData.churnAnalysis && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Churn Risk Analysis</Text>
          <View style={styles.churnMetrics}>
            <View style={styles.churnCard}>
              <Text style={styles.churnValue}>
                {(analyticsData.churnAnalysis.overall_churn_risk * 100).toFixed(1)}%
              </Text>
              <Text style={styles.churnLabel}>Overall Risk</Text>
            </View>
            <View style={styles.churnCard}>
              <Text style={styles.churnValue}>
                {analyticsData.churnAnalysis.high_risk_users || 0}
              </Text>
              <Text style={styles.churnLabel}>High Risk Users</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );

  const renderAnomaliesTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Anomaly Detection</Text>
      {analyticsData.anomalies.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="checkmark-circle-outline" size={48} color="#34C759" />
          <Text style={styles.emptyStateText}>No anomalies detected</Text>
          <Text style={styles.emptyStateSubtext}>System behavior is normal</Text>
        </View>
      ) : (
        analyticsData.anomalies.map((anomaly, index) => (
          <View key={index} style={styles.anomalyCard}>
            <View style={styles.anomalyHeader}>
              <Ionicons 
                name="warning" 
                size={20} 
                color={getSeverityColor(anomaly.severity)} 
              />
              <Text style={styles.anomalyMetric}>{anomaly.metric_name}</Text>
              <Text style={styles.anomalyDate}>
                {new Date(anomaly.timestamp).toLocaleDateString()}
              </Text>
            </View>
            <Text style={styles.anomalyDescription}>{anomaly.description}</Text>
            <View style={styles.anomalyDetails}>
              <Text style={styles.anomalyValue}>
                Value: {anomaly.value.toFixed(2)}
              </Text>
              <Text style={styles.anomalyScore}>
                Score: {anomaly.anomaly_score.toFixed(3)}
              </Text>
            </View>
            <View style={[
              styles.severityBadge, 
              { backgroundColor: getSeverityColor(anomaly.severity) }
            ]}>
              <Text style={styles.severityText}>{anomaly.severity}</Text>
            </View>
          </View>
        ))
      )}
    </View>
  );

  const renderInsightsTab = () => (
    <View style={styles.tabContent}>
      {analyticsData.insightsReport && (
        <>
          <Text style={styles.sectionTitle}>Key Insights</Text>
          {analyticsData.insightsReport.key_insights.map((insight, index) => (
            <View key={index} style={styles.insightCard}>
              <Ionicons name="bulb" size={20} color="#FF9500" />
              <Text style={styles.insightCardText}>{insight}</Text>
            </View>
          ))}

          <Text style={styles.sectionTitle}>Recommendations</Text>
          {analyticsData.insightsReport.recommendations.map((recommendation, index) => (
            <View key={index} style={styles.recommendationCard}>
              <Ionicons name="arrow-forward-circle" size={20} color="#007AFF" />
              <Text style={styles.recommendationText}>{recommendation}</Text>
            </View>
          ))}
        </>
      )}
    </View>
  );

  // Helper Functions
  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high': return '#FF3B30';
      case 'medium': return '#FF9500';
      case 'low': return '#34C759';
      default: return '#666';
    }
  };

  // Main Render
  if (isLoading) {
    return (
      <OptimizedContainer style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <ResponsiveText variant="body" style={styles.loadingText}>
          Loading advanced analytics...
        </ResponsiveText>
        <LoadingSkeleton width={screenWidth - 40} height={200} style={styles.loadingSkeleton} />
      </OptimizedContainer>
    );
  }

  if (error) {
    return (
      <OptimizedContainer style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color="#FF3B30" />
        <ResponsiveText variant="headline" style={styles.errorTitle}>
          Analytics Unavailable
        </ResponsiveText>
        <ResponsiveText variant="body" style={styles.errorText}>
          {error}
        </ResponsiveText>
        <TouchableOpacity style={styles.retryButton} onPress={loadAnalyticsData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </OptimizedContainer>
    );
  }

  return (
    <AdaptiveLayout>
      {({ isTablet, orientation }) => (
        <OptimizedContainer style={styles.container}>
          <ScrollView
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
          >
            {renderHeader()}
            {renderTimeRangeSelector()}
            {renderTabSelector()}
            
            {activeTab === 'overview' && renderOverviewTab()}
            {activeTab === 'predictions' && renderPredictionsTab()}
            {activeTab === 'anomalies' && renderAnomaliesTab()}
            {activeTab === 'insights' && renderInsightsTab()}
          </ScrollView>
        </OptimizedContainer>
      )}
    </AdaptiveLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
    textAlign: 'center',
  },
  loadingSkeleton: {
    marginTop: 20,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    marginTop: 16,
    textAlign: 'center',
    color: '#333',
  },
  errorText: {
    marginTop: 8,
    textAlign: 'center',
    color: '#666',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  header: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  mlStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  mlStatusText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  timeRangeContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  timeRangeButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  timeRangeButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  timeRangeButtonTextActive: {
    color: '#fff',
  },
  tabContainer: {
    marginBottom: 20,
  },
  tabContentContainer: {
    paddingHorizontal: 20,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  tabButtonActive: {
    backgroundColor: '#E3F2FD',
    borderColor: '#007AFF',
  },
  tabButtonText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  tabButtonTextActive: {
    color: '#007AFF',
  },
  tabContent: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  chartSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  chart: {
    borderRadius: 16,
    marginVertical: 8,
  },
  insightsContainer: {
    marginTop: 16,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  insightText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  metricsContainer: {
    marginBottom: 20,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  predictionCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  predictionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  predictionValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#34C759',
    marginLeft: 8,
  },
  predictionLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  confidenceInterval: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  factorsContainer: {
    marginTop: 16,
  },
  factorsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  factorItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  factorName: {
    fontSize: 14,
    color: '#333',
  },
  factorImpact: {
    fontSize: 14,
    color: '#666',
  },
  churnMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  churnCard: {
    flex: 1,
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  churnValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF3B30',
  },
  churnLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  anomalyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  anomalyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  anomalyMetric: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  anomalyDate: {
    fontSize: 12,
    color: '#666',
  },
  anomalyDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  anomalyDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  anomalyValue: {
    fontSize: 12,
    color: '#333',
  },
  anomalyScore: {
    fontSize: 12,
    color: '#333',
  },
  severityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severityText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  insightCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  insightCardText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  recommendationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  recommendationText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
});

export default AdvancedAnalyticsScreen;