import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { ApiService } from '../services/ApiService';

const screenWidth = Dimensions.get('window').width;

export default function AnalyticsScreen() {
  const [timeRange, setTimeRange] = useState('7d');
  const [productivityData, setProductivityData] = useState(null);
  const [anomalies, setAnomalies] = useState([]);
  const [behavioralPatterns, setBehavioralPatterns] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const timeRangeOptions = [
    { label: '7 Days', value: '7d' },
    { label: '30 Days', value: '30d' },
    { label: '90 Days', value: '90d' },
  ];

  const loadAnalyticsData = useCallback(async () => {
    try {
      const [productivity, anomaliesData, patterns] = await Promise.all([
        ApiService.getProductivityData(timeRange),
        ApiService.getAnomalies(),
        ApiService.getBehavioralPatterns(),
      ]);

      setProductivityData(productivity);
      setAnomalies(anomaliesData);
      setBehavioralPatterns(patterns);
    } catch (error) {
      console.error('Error loading analytics data:', error);
      Alert.alert('Error', 'Failed to load analytics data');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [timeRange]);

  useEffect(() => {
    loadAnalyticsData();
  }, [loadAnalyticsData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadAnalyticsData();
  }, [loadAnalyticsData]);

  const renderTimeRangeSelector = () => (
    <View style={styles.timeRangeContainer}>
      {timeRangeOptions.map((option) => (
        <TouchableOpacity
          key={option.value}
          style={[
            styles.timeRangeButton,
            timeRange === option.value && styles.timeRangeButtonActive,
          ]}
          onPress={() => setTimeRange(option.value)}
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

  const renderProductivityChart = () => {
    if (!productivityData?.productivity_trend) return null;

    const chartData = {
      labels: productivityData.productivity_trend.map(item => 
        new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      ),
      datasets: [{
        data: productivityData.productivity_trend.map(item => item.score),
        color: (opacity = 1) => `rgba(52, 199, 89, ${opacity})`,
        strokeWidth: 3,
      }],
    };

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Productivity Trend</Text>
        <LineChart
          data={chartData}
          width={screenWidth - 40}
          height={220}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(52, 199, 89, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: '#34C759',
            },
          }}
          bezier
          style={styles.chart}
        />
      </View>
    );
  };

  const renderActivityPatternChart = () => {
    if (!productivityData?.hourly_activity) return null;

    const chartData = {
      labels: productivityData.hourly_activity.map(item => `${item.hour}:00`),
      datasets: [{
        data: productivityData.hourly_activity.map(item => item.activity_count),
      }],
    };

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Activity Patterns by Hour</Text>
        <BarChart
          data={chartData}
          width={screenWidth - 40}
          height={220}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
            },
          }}
          style={styles.chart}
        />
      </View>
    );
  };

  const renderAnomalies = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Recent Anomalies</Text>
      {anomalies.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="checkmark-circle-outline" size={48} color="#34C759" />
          <Text style={styles.emptyStateText}>No anomalies detected</Text>
          <Text style={styles.emptyStateSubtext}>Your activity patterns look normal</Text>
        </View>
      ) : (
        anomalies.slice(0, 5).map((anomaly, index) => (
          <View key={index} style={styles.anomalyCard}>
            <View style={styles.anomalyHeader}>
              <Ionicons name="warning-outline" size={20} color="#FF9500" />
              <Text style={styles.anomalyType}>{anomaly.anomaly_type}</Text>
              <Text style={styles.anomalyDate}>
                {new Date(anomaly.timestamp).toLocaleDateString()}
              </Text>
            </View>
            <Text style={styles.anomalyDescription}>{anomaly.description}</Text>
            <View style={[styles.anomalyStatus, { backgroundColor: getStatusColor(anomaly.status) }]}>
              <Text style={styles.anomalyStatusText}>{anomaly.status}</Text>
            </View>
          </View>
        ))
      )}
    </View>
  );

  const renderInsights = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Insights</Text>
      <View style={styles.insightCard}>
        <Ionicons name="bulb-outline" size={24} color="#FF9500" />
        <View style={styles.insightContent}>
          <Text style={styles.insightTitle}>Peak Productivity Hours</Text>
          <Text style={styles.insightText}>
            You're most productive between 9 AM and 11 AM. Consider scheduling important tasks during this time.
          </Text>
        </View>
      </View>
      <View style={styles.insightCard}>
        <Ionicons name="trending-up-outline" size={24} color="#34C759" />
        <View style={styles.insightContent}>
          <Text style={styles.insightTitle}>Productivity Improvement</Text>
          <Text style={styles.insightText}>
            Your productivity has increased by 15% compared to last week. Keep up the great work!
          </Text>
        </View>
      </View>
    </View>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return '#FF3B30';
      case 'acknowledged': return '#FF9500';
      case 'resolved': return '#34C759';
      default: return '#666';
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="analytics" size={50} color="#007AFF" />
        <Text style={styles.loadingText}>Loading Analytics...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Analytics</Text>
        <Text style={styles.subtitle}>Insights into your digital behavior</Text>
      </View>

      {renderTimeRangeSelector()}
      {renderProductivityChart()}
      {renderActivityPatternChart()}
      {renderAnomalies()}
      {renderInsights()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 20,
    paddingTop: 10,
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
  timeRangeContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
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
  chartContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  chart: {
    borderRadius: 16,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
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
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  anomalyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  anomalyType: {
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
  },
  anomalyStatus: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  anomalyStatusText: {
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  insightContent: {
    flex: 1,
    marginLeft: 12,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  insightText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});