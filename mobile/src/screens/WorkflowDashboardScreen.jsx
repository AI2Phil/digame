/**
 * Workflow Dashboard Screen
 * Mobile workflow management interface with AI-powered task prioritization
 * Features: Workflow creation, execution monitoring, analytics, and automation
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Modal,
  ActivityIndicator,
  Dimensions,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, PieChart, BarChart } from 'react-native-chart-kit';
import WorkflowAutomationService from '../services/WorkflowAutomationService';

const { width: screenWidth } = Dimensions.get('window');

export default function WorkflowDashboardScreen({ navigation }) {
  const [workflows, setWorkflows] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [taskRecommendations, setTaskRecommendations] = useState([]);
  const [activeExecutions, setActiveExecutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [workflowService] = useState(new WorkflowAutomationService());

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [
        workflowsData,
        analyticsData,
        recommendations,
        executions
      ] = await Promise.all([
        workflowService.getWorkflows(),
        workflowService.getWorkflowAnalytics(),
        workflowService.getTaskRecommendations(),
        workflowService.getExecutionMetrics()
      ]);

      setWorkflows(workflowsData);
      setAnalytics(analyticsData);
      setTaskRecommendations(recommendations);
      setActiveExecutions(executions.active_executions || []);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      Alert.alert('Error', 'Failed to load workflow dashboard');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  }, []);

  const handleCreateWorkflow = () => {
    navigation.navigate('WorkflowBuilder');
  };

  const handleExecuteWorkflow = async (workflowId) => {
    try {
      Alert.alert(
        'Execute Workflow',
        'Are you sure you want to execute this workflow?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Execute', 
            onPress: async () => {
              try {
                const execution = await workflowService.executeWorkflow(workflowId);
                Alert.alert('Success', `Workflow execution started: ${execution.id}`);
                await loadDashboardData();
              } catch (error) {
                Alert.alert('Error', error.message);
              }
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to execute workflow');
    }
  };

  const handleViewExecution = (executionId) => {
    navigation.navigate('ExecutionMonitor', { executionId });
  };

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      {[
        { id: 'overview', title: 'Overview', icon: 'grid' },
        { id: 'workflows', title: 'Workflows', icon: 'git-branch' },
        { id: 'tasks', title: 'Tasks', icon: 'checkmark-circle' },
        { id: 'analytics', title: 'Analytics', icon: 'analytics' }
      ].map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[
            styles.tabItem,
            selectedTab === tab.id && styles.tabItemActive
          ]}
          onPress={() => setSelectedTab(tab.id)}
        >
          <Ionicons 
            name={tab.icon} 
            size={20} 
            color={selectedTab === tab.id ? '#007AFF' : '#666'} 
          />
          <Text style={[
            styles.tabText,
            selectedTab === tab.id && styles.tabTextActive
          ]}>
            {tab.title}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderOverviewTab = () => (
    <ScrollView style={styles.tabContent}>
      {renderSummaryCards()}
      {renderQuickActions()}
      {renderActiveExecutions()}
      {renderRecentWorkflows()}
    </ScrollView>
  );

  const renderSummaryCards = () => {
    if (!analytics) return null;

    return (
      <View style={styles.summaryContainer}>
        <Text style={styles.sectionTitle}>Workflow Summary</Text>
        <View style={styles.summaryGrid}>
          {analytics.summary_cards?.map((card, index) => (
            <View key={index} style={styles.summaryCard}>
              <View style={[styles.summaryIcon, { backgroundColor: card.color + '20' }]}>
                <Ionicons name={card.icon} size={24} color={card.color} />
              </View>
              <Text style={styles.summaryValue}>{card.value}</Text>
              <Text style={styles.summaryLabel}>{card.title}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderQuickActions = () => (
    <View style={styles.quickActionsContainer}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActionsGrid}>
        <TouchableOpacity 
          style={styles.quickActionCard}
          onPress={handleCreateWorkflow}
        >
          <Ionicons name="add-circle" size={32} color="#007AFF" />
          <Text style={styles.quickActionText}>Create Workflow</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionCard}
          onPress={() => navigation.navigate('WorkflowTemplates')}
        >
          <Ionicons name="library" size={32} color="#4CAF50" />
          <Text style={styles.quickActionText}>Browse Templates</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionCard}
          onPress={() => setSelectedTab('analytics')}
        >
          <Ionicons name="analytics" size={32} color="#FF9800" />
          <Text style={styles.quickActionText}>View Analytics</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionCard}
          onPress={() => navigation.navigate('WorkflowSettings')}
        >
          <Ionicons name="settings" size={32} color="#9C27B0" />
          <Text style={styles.quickActionText}>Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderActiveExecutions = () => {
    if (!activeExecutions || activeExecutions.length === 0) return null;

    return (
      <View style={styles.executionsContainer}>
        <Text style={styles.sectionTitle}>Active Executions</Text>
        {activeExecutions.slice(0, 3).map((execution, index) => (
          <TouchableOpacity
            key={index}
            style={styles.executionCard}
            onPress={() => handleViewExecution(execution.id)}
          >
            <View style={styles.executionIcon}>
              <Ionicons 
                name="play-circle" 
                size={24} 
                color={getExecutionStatusColor(execution.status)} 
              />
            </View>
            <View style={styles.executionContent}>
              <Text style={styles.executionTitle}>{execution.workflow_name}</Text>
              <Text style={styles.executionStatus}>
                {execution.status} • {execution.progress}% complete
              </Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill,
                    { 
                      width: `${execution.progress}%`,
                      backgroundColor: getExecutionStatusColor(execution.status)
                    }
                  ]} 
                />
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#BDBDBD" />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderRecentWorkflows = () => (
    <View style={styles.recentContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Workflows</Text>
        <TouchableOpacity onPress={() => setSelectedTab('workflows')}>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>
      {workflows.slice(0, 3).map((workflow, index) => (
        <TouchableOpacity
          key={index}
          style={styles.workflowCard}
          onPress={() => navigation.navigate('WorkflowDetails', { workflowId: workflow.id })}
        >
          <View style={styles.workflowIcon}>
            <Ionicons 
              name="git-branch" 
              size={20} 
              color={getWorkflowStatusColor(workflow.status)} 
            />
          </View>
          <View style={styles.workflowContent}>
            <Text style={styles.workflowTitle}>{workflow.name}</Text>
            <Text style={styles.workflowDescription}>{workflow.description}</Text>
            <Text style={styles.workflowMeta}>
              {workflow.steps?.length || 0} steps • Last run: {formatDate(workflow.last_execution)}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.executeButton}
            onPress={() => handleExecuteWorkflow(workflow.id)}
          >
            <Ionicons name="play" size={16} color="#007AFF" />
          </TouchableOpacity>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderWorkflowsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.workflowsHeader}>
        <Text style={styles.sectionTitle}>My Workflows</Text>
        <TouchableOpacity 
          style={styles.createButton}
          onPress={handleCreateWorkflow}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.createButtonText}>Create</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={workflows}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.workflowListCard}
            onPress={() => navigation.navigate('WorkflowDetails', { workflowId: item.id })}
          >
            <View style={styles.workflowListIcon}>
              <Ionicons 
                name="git-branch" 
                size={24} 
                color={getWorkflowStatusColor(item.status)} 
              />
            </View>
            <View style={styles.workflowListContent}>
              <Text style={styles.workflowListTitle}>{item.name}</Text>
              <Text style={styles.workflowListDescription}>{item.description}</Text>
              <View style={styles.workflowListMeta}>
                <Text style={styles.workflowListStatus}>{item.status}</Text>
                <Text style={styles.workflowListSteps}>{item.steps?.length || 0} steps</Text>
              </View>
            </View>
            <View style={styles.workflowListActions}>
              <TouchableOpacity
                style={styles.workflowActionButton}
                onPress={() => handleExecuteWorkflow(item.id)}
              >
                <Ionicons name="play" size={16} color="#007AFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.workflowActionButton}
                onPress={() => navigation.navigate('WorkflowBuilder', { workflowId: item.id })}
              >
                <Ionicons name="create" size={16} color="#666" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );

  const renderTasksTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>AI-Powered Task Recommendations</Text>
      <FlatList
        data={taskRecommendations}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.taskCard}>
            <View style={styles.taskHeader}>
              <View style={[
                styles.priorityBadge,
                { backgroundColor: getPriorityColor(item.priority_level) }
              ]}>
                <Text style={styles.priorityText}>{item.priority_level}</Text>
              </View>
              <Text style={styles.taskScore}>Score: {item.priority_score}</Text>
            </View>
            <Text style={styles.taskTitle}>{item.title}</Text>
            <Text style={styles.taskDescription}>{item.description}</Text>
            <View style={styles.taskActions}>
              {item.quick_actions?.map((action, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.taskActionButton}
                  onPress={() => handleTaskAction(item.id, action)}
                >
                  <Text style={styles.taskActionText}>{action.replace('_', ' ')}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );

  const renderAnalyticsTab = () => {
    if (!analytics) return null;

    return (
      <ScrollView style={styles.tabContent}>
        <Text style={styles.sectionTitle}>Workflow Analytics</Text>
        
        {/* Performance Chart */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Execution Success Rate</Text>
          <PieChart
            data={[
              { name: 'Success', population: analytics.success_rate || 0, color: '#4CAF50', legendFontColor: '#333' },
              { name: 'Failed', population: 100 - (analytics.success_rate || 0), color: '#F44336', legendFontColor: '#333' }
            ]}
            width={screenWidth - 40}
            height={200}
            chartConfig={{
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
          />
        </View>

        {/* Execution Trends */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Execution Trends (Last 7 Days)</Text>
          <LineChart
            data={{
              labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
              datasets: [{
                data: [12, 15, 8, 20, 18, 10, 14]
              }]
            }}
            width={screenWidth - 40}
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

        {/* Metrics Grid */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{analytics.total_workflows || 0}</Text>
            <Text style={styles.metricLabel}>Total Workflows</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{analytics.time_saved || 0}h</Text>
            <Text style={styles.metricLabel}>Time Saved</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{analytics.active_executions || 0}</Text>
            <Text style={styles.metricLabel}>Active Now</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{analytics.success_rate || 0}%</Text>
            <Text style={styles.metricLabel}>Success Rate</Text>
          </View>
        </View>
      </ScrollView>
    );
  };

  const handleTaskAction = (taskId, action) => {
    Alert.alert('Task Action', `Performing ${action} on task ${taskId}`);
  };

  const getExecutionStatusColor = (status) => {
    const colors = {
      'running': '#4CAF50',
      'pending': '#FF9800',
      'completed': '#2196F3',
      'failed': '#F44336',
      'paused': '#9E9E9E'
    };
    return colors[status] || '#666';
  };

  const getWorkflowStatusColor = (status) => {
    const colors = {
      'active': '#4CAF50',
      'inactive': '#9E9E9E',
      'draft': '#FF9800',
      'archived': '#666'
    };
    return colors[status] || '#007AFF';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'CRITICAL': '#F44336',
      'HIGH': '#FF9800',
      'MEDIUM': '#FFC107',
      'LOW': '#4CAF50'
    };
    return colors[priority] || '#666';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  const renderCurrentTab = () => {
    switch (selectedTab) {
      case 'overview':
        return renderOverviewTab();
      case 'workflows':
        return renderWorkflowsTab();
      case 'tasks':
        return renderTasksTab();
      case 'analytics':
        return renderAnalyticsTab();
      default:
        return renderOverviewTab();
    }
  };

  if (loading && !workflows.length) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading Workflow Dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Workflow Automation</Text>
        <Text style={styles.headerSubtitle}>Intelligent workflow management</Text>
      </View>

      {renderTabBar()}

      <View style={styles.content}>
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          {renderCurrentTab()}
        </ScrollView>
      </View>
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
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#007AFF',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#E3F2FD',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  tabItemActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  tabTextActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    padding: 20,
  },
  summaryContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  quickActionsContainer: {
    marginBottom: 24,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '48%',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionText: {
    fontSize: 14,
    color: '#333',
    marginTop: 8,
    textAlign: 'center',
  },
  executionsContainer: {
    marginBottom: 24,
  },
  executionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  executionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  executionContent: {
    flex: 1,
  },
  executionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  executionStatus: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  recentContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  workflowCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  workflowIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  workflowContent: {
    flex: 1,
  },
  workflowTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  workflowDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  workflowMeta: {
    fontSize: 12,
    color: '#999',
  },
  executeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  workflowsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  createButton: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  workflowListCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  workflowListIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  workflowListContent: {
    flex: 1,
  },
  workflowListTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  workflowListDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  workflowListMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  workflowListStatus: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
    marginRight: 12,
  },
  workflowListSteps: {
    fontSize: 12,
    color: '#999',
  },
  workflowListActions: {
    flexDirection: 'row',
  },
  workflowActionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  taskCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  taskScore: {
    fontSize: 12,
    color: '#666',
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  taskActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  taskActionButton: {
    backgroundColor: '#F0F8FF',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  taskActionText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
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
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});