import React, { useState, useEffect, useCallback, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { AdvancedAnalyticsService } from '../services/AdvancedAnalyticsService';
import {
  OptimizedContainer,
  ResponsiveText,
  LoadingSkeleton,
  usePerformanceMonitor,
} from './MobileOptimizedUI';

const screenWidth = Dimensions.get('window').width;

/**
 * Mobile Analytics Widget
 * Compact analytics component for dashboard and other screens
 * Shows key metrics with drill-down capability
 */
const MobileAnalyticsWidget = memo(({ 
  widgetType = 'summary',
  timeRange = '7d',
  onPress,
  showHeader = true,
  compact = false,
  style = {},
}) => {
  usePerformanceMonitor('MobileAnalyticsWidget');

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load widget data based on type
  const loadWidgetData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      let widgetData;
      const days = parseInt(timeRange.replace('d', ''));

      switch (widgetType) {
        case 'summary':
          widgetData = await AdvancedAnalyticsService.getAnalyticsSummary(days);
          break;
        case 'anomalies':
          widgetData = await AdvancedAnalyticsService.getAnomalyDetection('user_activity', days);
          break;
        case 'performance':
          widgetData = await AdvancedAnalyticsService.getPerformanceMetrics();
          break;
        case 'userBehavior':
          widgetData = await AdvancedAnalyticsService.getUserBehaviorAnalysis(null, days);
          break;
        default:
          widgetData = await AdvancedAnalyticsService.getAnalyticsSummary(days);
      }

      setData(widgetData);
    } catch (error) {
      console.error('Widget data loading error:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [widgetType, timeRange]);

  useEffect(() => {
    loadWidgetData();
  }, [loadWidgetData]);

  // Render different widget types
  const renderSummaryWidget = () => {
    if (!data) return null;

    return (
      <View style={styles.summaryContent}>
        <View style={styles.metricsRow}>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>
              {data.anomalies_count || 0}
            </Text>
            <Text style={styles.metricLabel}>Anomalies</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={[
              styles.metricValue,
              { color: data.critical_anomalies > 0 ? '#FF3B30' : '#34C759' }
            ]}>
              {data.critical_anomalies || 0}
            </Text>
            <Text style={styles.metricLabel}>Critical</Text>
          </View>
          <View style={styles.metricItem}>
            <View style={[
              styles.statusIndicator,
              { backgroundColor: data.performance_status === 'healthy' ? '#34C759' : '#FF9500' }
            ]} />
            <Text style={styles.metricLabel}>System</Text>
          </View>
        </View>

        {data.user_behavior?.data?.activity_trend && !compact && (
          <View style={styles.chartContainer}>
            <LineChart
              data={{
                labels: data.user_behavior.data.activity_trend.map((_, index) => 
                  `D${index + 1}`
                ),
                datasets: [{
                  data: data.user_behavior.data.activity_trend.slice(0, 7), // Show last 7 days
                  color: (opacity = 1) => `rgba(52, 199, 89, ${opacity})`,
                  strokeWidth: 2,
                }],
              }}
              width={screenWidth - 80}
              height={120}
              chartConfig={{
                backgroundColor: 'transparent',
                backgroundGradientFrom: 'transparent',
                backgroundGradientTo: 'transparent',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(52, 199, 89, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(102, 102, 102, ${opacity})`,
                style: { borderRadius: 8 },
                propsForDots: {
                  r: '3',
                  strokeWidth: '1',
                  stroke: '#34C759',
                },
              }}
              bezier
              style={styles.miniChart}
              withHorizontalLabels={false}
              withVerticalLabels={false}
              withDots={false}
            />
          </View>
        )}
      </View>
    );
  };

  const renderAnomaliesWidget = () => {
    if (!data || !Array.isArray(data)) return null;

    const recentAnomalies = data.slice(0, 3);
    const criticalCount = data.filter(a => a.severity === 'high').length;

    return (
      <View style={styles.anomaliesContent}>
        <View style={styles.anomaliesHeader}>
          <Text style={styles.anomaliesCount}>{data.length}</Text>
          <Text style={styles.anomaliesLabel}>Total Anomalies</Text>
          {criticalCount > 0 && (
            <View style={styles.criticalBadge}>
              <Text style={styles.criticalText}>{criticalCount} Critical</Text>
            </View>
          )}
        </View>

        {recentAnomalies.map((anomaly, index) => (
          <View key={index} style={styles.anomalyItem}>
            <Ionicons 
              name="warning" 
              size={16} 
              color={getSeverityColor(anomaly.severity)} 
            />
            <Text style={styles.anomalyText} numberOfLines={1}>
              {anomaly.metric_name}: {anomaly.description}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderPerformanceWidget = () => {
    if (!data) return null;

    return (
      <View style={styles.performanceContent}>
        <View style={styles.performanceMetrics}>
          <View style={styles.performanceItem}>
            <Text style={styles.performanceValue}>
              {data.cache_performance?.hit_rate || 'N/A'}
            </Text>
            <Text style={styles.performanceLabel}>Cache Hit</Text>
          </View>
          <View style={styles.performanceItem}>
            <Text style={styles.performanceValue}>
              {data.task_processing?.queue_size || '0'}
            </Text>
            <Text style={styles.performanceLabel}>Queue Size</Text>
          </View>
        </View>

        <View style={styles.performanceStatus}>
          <Ionicons 
            name="checkmark-circle" 
            size={20} 
            color="#34C759" 
          />
          <Text style={styles.performanceStatusText}>System Healthy</Text>
        </View>
      </View>
    );
  };

  const renderUserBehaviorWidget = () => {
    if (!data) return null;

    return (
      <View style={styles.behaviorContent}>
        <Text style={styles.behaviorConfidence}>
          Confidence: {(data.confidence * 100).toFixed(1)}%
        </Text>
        
        {data.insights && data.insights.length > 0 && (
          <View style={styles.behaviorInsight}>
            <Ionicons name="bulb-outline" size={16} color="#FF9500" />
            <Text style={styles.behaviorInsightText} numberOfLines={2}>
              {data.insights[0]}
            </Text>
          </View>
        )}

        {data.recommendations && data.recommendations.length > 0 && (
          <View style={styles.behaviorRecommendation}>
            <Ionicons name="arrow-forward-circle-outline" size={16} color="#007AFF" />
            <Text style={styles.behaviorRecommendationText} numberOfLines={2}>
              {data.recommendations[0]}
            </Text>
          </View>
        )}
      </View>
    );
  };

  // Helper function
  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high': return '#FF3B30';
      case 'medium': return '#FF9500';
      case 'low': return '#34C759';
      default: return '#666';
    }
  };

  const getWidgetTitle = () => {
    switch (widgetType) {
      case 'summary': return 'Analytics Summary';
      case 'anomalies': return 'Anomaly Detection';
      case 'performance': return 'Performance Metrics';
      case 'userBehavior': return 'User Behavior';
      default: return 'Analytics';
    }
  };

  const getWidgetIcon = () => {
    switch (widgetType) {
      case 'summary': return 'analytics';
      case 'anomalies': return 'warning';
      case 'performance': return 'speedometer';
      case 'userBehavior': return 'people';
      default: return 'analytics';
    }
  };

  // Main render
  if (isLoading) {
    return (
      <TouchableOpacity 
        style={[styles.container, style]} 
        onPress={onPress}
        disabled={!onPress}
      >
        {showHeader && (
          <View style={styles.header}>
            <LoadingSkeleton width={120} height={16} />
            <ActivityIndicator size="small" color="#007AFF" />
          </View>
        )}
        <LoadingSkeleton width="100%" height={compact ? 60 : 120} style={styles.loadingContent} />
      </TouchableOpacity>
    );
  }

  if (error) {
    return (
      <TouchableOpacity 
        style={[styles.container, styles.errorContainer, style]} 
        onPress={onPress}
        disabled={!onPress}
      >
        <Ionicons name="alert-circle" size={24} color="#FF3B30" />
        <Text style={styles.errorText}>Analytics Unavailable</Text>
        <Text style={styles.errorSubtext}>Tap to retry</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity 
      style={[styles.container, style]} 
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {showHeader && (
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name={getWidgetIcon()} size={20} color="#007AFF" />
            <ResponsiveText variant="headline" style={styles.title}>
              {getWidgetTitle()}
            </ResponsiveText>
          </View>
          {onPress && (
            <Ionicons name="chevron-forward" size={16} color="#666" />
          )}
        </View>
      )}

      <View style={styles.content}>
        {widgetType === 'summary' && renderSummaryWidget()}
        {widgetType === 'anomalies' && renderAnomaliesWidget()}
        {widgetType === 'performance' && renderPerformanceWidget()}
        {widgetType === 'userBehavior' && renderUserBehaviorWidget()}
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
  loadingContent: {
    marginTop: 8,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
    marginTop: 8,
  },
  errorSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  
  // Summary Widget Styles
  summaryContent: {
    flex: 1,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  chartContainer: {
    alignItems: 'center',
  },
  miniChart: {
    borderRadius: 8,
  },

  // Anomalies Widget Styles
  anomaliesContent: {
    flex: 1,
  },
  anomaliesHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  anomaliesCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF9500',
  },
  anomaliesLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  criticalBadge: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 4,
  },
  criticalText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  anomalyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  anomalyText: {
    flex: 1,
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },

  // Performance Widget Styles
  performanceContent: {
    flex: 1,
  },
  performanceMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  performanceItem: {
    alignItems: 'center',
  },
  performanceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  performanceLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  performanceStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  performanceStatusText: {
    fontSize: 14,
    color: '#34C759',
    marginLeft: 6,
    fontWeight: '500',
  },

  // User Behavior Widget Styles
  behaviorContent: {
    flex: 1,
  },
  behaviorConfidence: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  behaviorInsight: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  behaviorInsightText: {
    flex: 1,
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
    lineHeight: 16,
  },
  behaviorRecommendation: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  behaviorRecommendationText: {
    flex: 1,
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
    lineHeight: 16,
  },
});

MobileAnalyticsWidget.displayName = 'MobileAnalyticsWidget';

export default MobileAnalyticsWidget;