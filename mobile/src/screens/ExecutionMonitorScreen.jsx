/**
 * Execution Monitor Screen
 * Real-time workflow execution monitoring with live updates
 * Features: Progress tracking, step-by-step execution, logs, and controls
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import WorkflowAutomationService from '../services/WorkflowAutomationService';

export default function ExecutionMonitorScreen({ navigation, route }) {
  const [execution, setExecution] = useState(null);
  const [logs, setLogs] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [workflowService] = useState(new WorkflowAutomationService());
  
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const refreshInterval = useRef(null);

  const { executionId } = route.params;

  useEffect(() => {
    loadExecutionData();
    
    if (autoRefresh) {
      startAutoRefresh();
    }

    return () => {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
    };
  }, []);

  useEffect(() => {
    if (execution?.progress) {
      Animated.timing(progressAnimation, {
        toValue: execution.progress / 100,
        duration: 500,
        useNativeDriver: false,
      }).start();
    }
  }, [execution?.progress]);

  useEffect(() => {
    if (execution?.state === 'running') {
      startPulseAnimation();
    } else {
      stopPulseAnimation();
    }
  }, [execution?.state]);

  const startAutoRefresh = () => {
    refreshInterval.current = setInterval(() => {
      if (execution && !isTerminalState(execution.state)) {
        loadExecutionData(false);
      }
    }, 3000); // Refresh every 3 seconds
  };

  const stopAutoRefresh = () => {
    if (refreshInterval.current) {
      clearInterval(refreshInterval.current);
      refreshInterval.current = null;
    }
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopPulseAnimation = () => {
    pulseAnimation.stopAnimation();
    pulseAnimation.setValue(1);
  };

  const loadExecutionData = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      
      const [executionData, executionLogs, executionMetrics] = await Promise.all([
        workflowService.getExecutionStatus(executionId),
        getExecutionLogs(executionId),
        getExecutionMetrics(executionId)
      ]);

      setExecution(executionData);
      setLogs(executionLogs);
      setMetrics(executionMetrics);

      // Stop auto-refresh if execution is complete
      if (isTerminalState(executionData.state)) {
        stopAutoRefresh();
        setAutoRefresh(false);
      }
    } catch (error) {
      console.error('Failed to load execution data:', error);
      if (showLoading) {
        Alert.alert('Error', 'Failed to load execution data');
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const getExecutionLogs = async (executionId) => {
    // Mock implementation - would call actual API
    return [
      {
        id: 1,
        timestamp: new Date().toISOString(),
        level: 'info',
        message: 'Execution started',
        step: 'trigger'
      },
      {
        id: 2,
        timestamp: new Date(Date.now() - 30000).toISOString(),
        level: 'info',
        message: 'Processing data...',
        step: 'action'
      }
    ];
  };

  const getExecutionMetrics = async (executionId) => {
    // Mock implementation - would call actual API
    return {
      cpu_usage: [20, 35, 45, 30, 25, 40, 35],
      memory_usage: [60, 65, 70, 68, 72, 75, 73],
      network_io: [10, 15, 20, 18, 22, 25, 23],
      execution_time: 120 // seconds
    };
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadExecutionData(false);
    setRefreshing(false);
  };

  const handleCancelExecution = () => {
    Alert.alert(
      'Cancel Execution',
      'Are you sure you want to cancel this workflow execution?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await workflowService.cancelExecution(executionId);
              Alert.alert('Success', 'Execution cancelled successfully');
              await loadExecutionData();
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel execution');
            }
          }
        }
      ]
    );
  };

  const handlePauseExecution = () => {
    Alert.alert('Feature Coming Soon', 'Pause/Resume functionality will be available in a future update.');
  };

  const isTerminalState = (state) => {
    return ['completed', 'failed', 'cancelled'].includes(state);
  };

  const getStatusColor = (state) => {
    const colors = {
      'pending': '#FF9800',
      'running': '#4CAF50',
      'completed': '#2196F3',
      'failed': '#F44336',
      'paused': '#9E9E9E',
      'cancelled': '#666'
    };
    return colors[state] || '#666';
  };

  const getStatusIcon = (state) => {
    const icons = {
      'pending': 'time',
      'running': 'play-circle',
      'completed': 'checkmark-circle',
      'failed': 'close-circle',
      'paused': 'pause-circle',
      'cancelled': 'stop-circle'
    };
    return icons[state] || 'help-circle';
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>Execution Monitor</Text>
        <Text style={styles.headerSubtitle}>
          {execution?.workflow_name || 'Loading...'}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.refreshButton}
        onPress={() => setAutoRefresh(!autoRefresh)}
      >
        <Ionicons 
          name={autoRefresh ? 'pause' : 'play'} 
          size={20} 
          color="#fff" 
        />
      </TouchableOpacity>
    </View>
  );

  const renderExecutionStatus = () => {
    if (!execution) return null;

    return (
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <Animated.View 
            style={[
              styles.statusIcon,
              { 
                backgroundColor: getStatusColor(execution.state) + '20',
                transform: [{ scale: pulseAnimation }]
              }
            ]}
          >
            <Ionicons 
              name={getStatusIcon(execution.state)} 
              size={32} 
              color={getStatusColor(execution.state)} 
            />
          </Animated.View>
          <View style={styles.statusContent}>
            <Text style={styles.statusTitle}>{execution.state.toUpperCase()}</Text>
            <Text style={styles.statusSubtitle}>
              Execution ID: {execution.id}
            </Text>
            <Text style={styles.statusTime}>
              Started: {new Date(execution.started_at).toLocaleString()}
            </Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progress</Text>
            <Text style={styles.progressValue}>{execution.progress}%</Text>
          </View>
          <View style={styles.progressBar}>
            <Animated.View 
              style={[
                styles.progressFill,
                {
                  width: progressAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%']
                  }),
                  backgroundColor: getStatusColor(execution.state)
                }
              ]} 
            />
          </View>
          {execution.estimated_completion && (
            <Text style={styles.estimatedTime}>
              Estimated completion: {new Date(execution.estimated_completion).toLocaleString()}
            </Text>
          )}
        </View>

        {execution.current_step && (
          <View style={styles.currentStepContainer}>
            <Text style={styles.currentStepLabel}>Current Step:</Text>
            <Text style={styles.currentStepValue}>{execution.current_step}</Text>
          </View>
        )}
      </View>
    );
  };

  const renderExecutionControls = () => {
    if (!execution || isTerminalState(execution.state)) return null;

    return (
      <View style={styles.controlsContainer}>
        <Text style={styles.sectionTitle}>Execution Controls</Text>
        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={[styles.controlButton, styles.pauseButton]}
            onPress={handlePauseExecution}
          >
            <Ionicons name="pause" size={20} color="#FF9800" />
            <Text style={[styles.controlButtonText, { color: '#FF9800' }]}>
              Pause
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.controlButton, styles.cancelButton]}
            onPress={handleCancelExecution}
          >
            <Ionicons name="stop" size={20} color="#F44336" />
            <Text style={[styles.controlButtonText, { color: '#F44336' }]}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderExecutionSteps = () => {
    if (!execution?.steps) return null;

    return (
      <View style={styles.stepsContainer}>
        <Text style={styles.sectionTitle}>Execution Steps</Text>
        {execution.steps.map((step, index) => (
          <View key={index} style={styles.stepItem}>
            <View style={[
              styles.stepIndicator,
              {
                backgroundColor: step.status === 'completed' ? '#4CAF50' :
                                step.status === 'running' ? '#2196F3' :
                                step.status === 'failed' ? '#F44336' : '#E0E0E0'
              }
            ]}>
              <Ionicons 
                name={
                  step.status === 'completed' ? 'checkmark' :
                  step.status === 'running' ? 'play' :
                  step.status === 'failed' ? 'close' : 'ellipse'
                }
                size={16} 
                color="#fff" 
              />
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepName}>{step.name}</Text>
              <Text style={styles.stepStatus}>{step.status}</Text>
              {step.duration && (
                <Text style={styles.stepDuration}>
                  Duration: {step.duration}s
                </Text>
              )}
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderExecutionLogs = () => (
    <View style={styles.logsContainer}>
      <Text style={styles.sectionTitle}>Execution Logs</Text>
      <ScrollView style={styles.logsScrollView} nestedScrollEnabled>
        {logs.map((log) => (
          <View key={log.id} style={styles.logItem}>
            <View style={[
              styles.logIndicator,
              {
                backgroundColor: 
                  log.level === 'error' ? '#F44336' :
                  log.level === 'warning' ? '#FF9800' :
                  log.level === 'info' ? '#2196F3' : '#4CAF50'
              }
            ]} />
            <View style={styles.logContent}>
              <Text style={styles.logMessage}>{log.message}</Text>
              <Text style={styles.logMeta}>
                {new Date(log.timestamp).toLocaleTimeString()} • {log.step}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const renderMetrics = () => {
    if (!metrics) return null;

    return (
      <View style={styles.metricsContainer}>
        <Text style={styles.sectionTitle}>Performance Metrics</Text>
        
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{metrics.execution_time}s</Text>
            <Text style={styles.metricLabel}>Execution Time</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>
              {metrics.cpu_usage[metrics.cpu_usage.length - 1]}%
            </Text>
            <Text style={styles.metricLabel}>CPU Usage</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>
              {metrics.memory_usage[metrics.memory_usage.length - 1]}MB
            </Text>
            <Text style={styles.metricLabel}>Memory</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>
              {metrics.network_io[metrics.network_io.length - 1]}KB/s
            </Text>
            <Text style={styles.metricLabel}>Network I/O</Text>
          </View>
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>CPU Usage Over Time</Text>
          <LineChart
            data={{
              labels: ['', '', '', '', '', '', ''],
              datasets: [{
                data: metrics.cpu_usage
              }]
            }}
            width={320}
            height={200}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
              style: {
                borderRadius: 16,
              },
            }}
            style={styles.chart}
          />
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading execution data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderExecutionStatus()}
        {renderExecutionControls()}
        {renderExecutionSteps()}
        {renderExecutionLogs()}
        {renderMetrics()}
      </ScrollView>
    </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#007AFF',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E3F2FD',
    marginTop: 2,
  },
  refreshButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  statusCard: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statusContent: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statusSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  statusTime: {
    fontSize: 12,
    color: '#999',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  progressValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  estimatedTime: {
    fontSize: 12,
    color: '#666',
  },
  currentStepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentStepLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  currentStepValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  controlsContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  pauseButton: {
    borderColor: '#FF9800',
    backgroundColor: '#FFF3E0',
  },
  cancelButton: {
    borderColor: '#F44336',
    backgroundColor: '#FFEBEE',
  },
  controlButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  stepsContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepContent: {
    flex: 1,
  },
  stepName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  stepStatus: {
    fontSize: 14,
    color: '#666',
    textTransform: 'capitalize',
  },
  stepDuration: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  logsContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  logsScrollView: {
    maxHeight: 200,
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  logIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    marginRight: 12,
  },
  logContent: {
    flex: 1,
  },
  logMessage: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  logMeta: {
    fontSize: 12,
    color: '#666',
  },
  metricsContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  chartContainer: {
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  chart: {
    borderRadius: 16,
  },
});