/**
 * Advanced Mobile Features Screen
 * Showcases Phase 1B advanced capabilities: Offline, AI, and Performance features
 * Features: Voice control, offline management, performance monitoring, AI insights
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
  Switch,
  Modal,
  ActivityIndicator,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, PieChart, ProgressChart } from 'react-native-chart-kit';
import AdvancedOfflineService from '../services/AdvancedOfflineService';
import MobileAIService from '../services/MobileAIService';
import MobilePerformanceService from '../services/MobilePerformanceService';

const { width: screenWidth } = Dimensions.get('window');

export default function AdvancedFeaturesScreen({ navigation }) {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [offlineStatus, setOfflineStatus] = useState(null);
  const [aiStatus, setAIStatus] = useState(null);
  const [performanceStatus, setPerformanceStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [voiceControlActive, setVoiceControlActive] = useState(false);
  const [voiceModalVisible, setVoiceModalVisible] = useState(false);
  
  // Services
  const [offlineService] = useState(new AdvancedOfflineService());
  const [aiService] = useState(new MobileAIService());
  const [performanceService] = useState(new MobilePerformanceService());
  
  // Animations
  const pulseAnimation = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadAdvancedFeatures();
  }, []);

  useEffect(() => {
    if (voiceControlActive) {
      startPulseAnimation();
    } else {
      stopPulseAnimation();
    }
  }, [voiceControlActive]);

  const loadAdvancedFeatures = async () => {
    try {
      setLoading(true);
      
      const [offline, ai, performance] = await Promise.all([
        offlineService.getStatus(),
        aiService.getAIStatus(),
        performanceService.getPerformanceStatus()
      ]);

      setOfflineStatus(offline);
      setAIStatus(ai);
      setPerformanceStatus(performance);
    } catch (error) {
      console.error('Failed to load advanced features:', error);
      Alert.alert('Error', 'Failed to load advanced features');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAdvancedFeatures();
    setRefreshing(false);
  }, []);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.3,
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

  const handleVoiceControl = async () => {
    try {
      if (!voiceControlActive) {
        setVoiceModalVisible(true);
        const result = await aiService.startVoiceControl();
        if (result.success) {
          setVoiceControlActive(true);
          Alert.alert('Voice Control', 'Voice control activated. Say a command!');
        }
      } else {
        setVoiceControlActive(false);
        Alert.alert('Voice Control', 'Voice control deactivated');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
      setVoiceModalVisible(false);
    }
  };

  const handleOfflineSync = async () => {
    try {
      if (!offlineStatus?.is_online) {
        Alert.alert('Offline', 'Cannot sync while offline');
        return;
      }

      Alert.alert(
        'Sync Data',
        'Force sync all offline data?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Sync',
            onPress: async () => {
              try {
                await offlineService.forceSyncAll();
                Alert.alert('Success', 'All data synced successfully');
                await loadAdvancedFeatures();
              } catch (error) {
                Alert.alert('Error', 'Sync failed: ' + error.message);
              }
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Sync operation failed');
    }
  };

  const handlePerformanceOptimization = async () => {
    try {
      Alert.alert(
        'Optimize Performance',
        'Run performance optimization?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Optimize',
            onPress: async () => {
              try {
                await performanceService.optimizeMemoryUsage();
                await performanceService.optimizeForBattery();
                Alert.alert('Success', 'Performance optimized');
                await loadAdvancedFeatures();
              } catch (error) {
                Alert.alert('Error', 'Optimization failed');
              }
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Optimization failed');
    }
  };

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      {[
        { id: 'overview', title: 'Overview', icon: 'grid' },
        { id: 'offline', title: 'Offline', icon: 'cloud-offline' },
        { id: 'ai', title: 'AI Features', icon: 'brain' },
        { id: 'performance', title: 'Performance', icon: 'speedometer' }
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
      {renderFeaturesSummary()}
      {renderQuickActions()}
      {renderSystemStatus()}
    </ScrollView>
  );

  const renderFeaturesSummary = () => (
    <View style={styles.summaryContainer}>
      <Text style={styles.sectionTitle}>Advanced Features Summary</Text>
      
      <View style={styles.featureGrid}>
        <View style={styles.featureCard}>
          <View style={[styles.featureIcon, { backgroundColor: '#4CAF50' + '20' }]}>
            <Ionicons name="cloud-offline" size={24} color="#4CAF50" />
          </View>
          <Text style={styles.featureTitle}>Offline Mode</Text>
          <Text style={styles.featureStatus}>
            {offlineStatus?.is_online ? 'Online' : 'Offline'}
          </Text>
          <Text style={styles.featureDetail}>
            {offlineStatus?.sync_queue_size || 0} items queued
          </Text>
        </View>

        <View style={styles.featureCard}>
          <View style={[styles.featureIcon, { backgroundColor: '#9C27B0' + '20' }]}>
            <Ionicons name="brain" size={24} color="#9C27B0" />
          </View>
          <Text style={styles.featureTitle}>AI Features</Text>
          <Text style={styles.featureStatus}>
            {aiStatus?.voice_control?.enabled ? 'Active' : 'Inactive'}
          </Text>
          <Text style={styles.featureDetail}>
            Voice & Behavioral AI
          </Text>
        </View>

        <View style={styles.featureCard}>
          <View style={[styles.featureIcon, { backgroundColor: '#FF9800' + '20' }]}>
            <Ionicons name="speedometer" size={24} color="#FF9800" />
          </View>
          <Text style={styles.featureTitle}>Performance</Text>
          <Text style={styles.featureStatus}>Optimized</Text>
          <Text style={styles.featureDetail}>
            {performanceStatus?.memory_usage?.usage_ratio ? 
              Math.round(performanceStatus.memory_usage.usage_ratio * 100) : 0}% memory used
          </Text>
        </View>

        <View style={styles.featureCard}>
          <View style={[styles.featureIcon, { backgroundColor: '#2196F3' + '20' }]}>
            <Ionicons name="sync" size={24} color="#2196F3" />
          </View>
          <Text style={styles.featureTitle}>Sync Status</Text>
          <Text style={styles.featureStatus}>
            {offlineStatus?.last_sync ? 'Synced' : 'Pending'}
          </Text>
          <Text style={styles.featureDetail}>
            Auto-sync enabled
          </Text>
        </View>
      </View>
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.actionsContainer}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      
      <View style={styles.actionGrid}>
        <TouchableOpacity 
          style={styles.actionCard}
          onPress={handleVoiceControl}
        >
          <Animated.View style={[
            styles.actionIcon,
            voiceControlActive && { transform: [{ scale: pulseAnimation }] }
          ]}>
            <Ionicons 
              name={voiceControlActive ? "mic" : "mic-off"} 
              size={28} 
              color={voiceControlActive ? "#F44336" : "#007AFF"} 
            />
          </Animated.View>
          <Text style={styles.actionTitle}>
            {voiceControlActive ? 'Stop Voice' : 'Voice Control'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionCard}
          onPress={handleOfflineSync}
        >
          <View style={styles.actionIcon}>
            <Ionicons name="sync" size={28} color="#4CAF50" />
          </View>
          <Text style={styles.actionTitle}>Force Sync</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionCard}
          onPress={handlePerformanceOptimization}
        >
          <View style={styles.actionIcon}>
            <Ionicons name="flash" size={28} color="#FF9800" />
          </View>
          <Text style={styles.actionTitle}>Optimize</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => navigation.navigate('AIInsights')}
        >
          <View style={styles.actionIcon}>
            <Ionicons name="analytics" size={28} color="#9C27B0" />
          </View>
          <Text style={styles.actionTitle}>AI Insights</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSystemStatus = () => (
    <View style={styles.statusContainer}>
      <Text style={styles.sectionTitle}>System Status</Text>
      
      <View style={styles.statusGrid}>
        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>Battery Optimization</Text>
          <View style={styles.statusIndicator}>
            <View style={[
              styles.statusDot,
              { backgroundColor: performanceStatus?.battery_optimization?.power_save_mode ? '#FF9800' : '#4CAF50' }
            ]} />
            <Text style={styles.statusValue}>
              {performanceStatus?.battery_optimization?.power_save_mode ? 'Power Save' : 'Normal'}
            </Text>
          </View>
        </View>

        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>Cache Performance</Text>
          <View style={styles.statusIndicator}>
            <View style={[styles.statusDot, { backgroundColor: '#2196F3' }]} />
            <Text style={styles.statusValue}>
              {performanceStatus?.cache_performance?.hit_rate ? 
                Math.round(performanceStatus.cache_performance.hit_rate * 100) : 0}% hit rate
            </Text>
          </View>
        </View>

        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>AI Processing</Text>
          <View style={styles.statusIndicator}>
            <View style={[styles.statusDot, { backgroundColor: '#9C27B0' }]} />
            <Text style={styles.statusValue}>
              {aiStatus?.behavioral_analysis?.enabled ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>

        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>Offline Storage</Text>
          <View style={styles.statusIndicator}>
            <View style={[styles.statusDot, { backgroundColor: '#4CAF50' }]} />
            <Text style={styles.statusValue}>
              {offlineStatus?.storage_usage ? 
                Object.keys(offlineStatus.storage_usage).length : 0} categories
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderOfflineTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.offlineContainer}>
        <Text style={styles.sectionTitle}>Offline Capabilities</Text>
        
        <View style={styles.offlineStatus}>
          <View style={styles.connectionStatus}>
            <Ionicons 
              name={offlineStatus?.is_online ? "wifi" : "wifi-off"} 
              size={32} 
              color={offlineStatus?.is_online ? "#4CAF50" : "#F44336"} 
            />
            <Text style={styles.connectionText}>
              {offlineStatus?.is_online ? 'Online' : 'Offline'}
            </Text>
          </View>
          
          <View style={styles.syncQueue}>
            <Text style={styles.syncQueueTitle}>Sync Queue</Text>
            <Text style={styles.syncQueueCount}>
              {offlineStatus?.sync_queue_size || 0} items pending
            </Text>
          </View>
        </View>

        {offlineStatus?.storage_usage && (
          <View style={styles.storageContainer}>
            <Text style={styles.storageTitle}>Storage Usage</Text>
            {Object.entries(offlineStatus.storage_usage).map(([category, usage]) => (
              <View key={category} style={styles.storageItem}>
                <Text style={styles.storageCategory}>{category}</Text>
                <View style={styles.storageBar}>
                  <View 
                    style={[
                      styles.storageProgress,
                      { 
                        width: `${Math.min((usage / (offlineStatus.storage_quotas[category] * 1024 * 1024)) * 100, 100)}%`,
                        backgroundColor: usage > (offlineStatus.storage_quotas[category] * 1024 * 1024 * 0.8) ? '#F44336' : '#4CAF50'
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.storageSize}>
                  {Math.round(usage / 1024 / 1024)}MB / {offlineStatus.storage_quotas[category]}MB
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );

  const renderAITab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.aiContainer}>
        <Text style={styles.sectionTitle}>AI Features</Text>
        
        <View style={styles.aiFeatures}>
          <View style={styles.aiFeatureCard}>
            <View style={styles.aiFeatureHeader}>
              <Ionicons name="mic" size={24} color="#F44336" />
              <Text style={styles.aiFeatureTitle}>Voice Control</Text>
              <Switch
                value={aiStatus?.voice_control?.enabled || false}
                onValueChange={handleVoiceControl}
              />
            </View>
            <Text style={styles.aiFeatureDescription}>
              Control the app with voice commands
            </Text>
            <Text style={styles.aiFeatureStatus}>
              Status: {voiceControlActive ? 'Listening' : 'Inactive'}
            </Text>
          </View>

          <View style={styles.aiFeatureCard}>
            <View style={styles.aiFeatureHeader}>
              <Ionicons name="analytics" size={24} color="#9C27B0" />
              <Text style={styles.aiFeatureTitle}>Behavioral Analysis</Text>
              <Switch
                value={aiStatus?.behavioral_analysis?.enabled || false}
                onValueChange={() => {}}
              />
            </View>
            <Text style={styles.aiFeatureDescription}>
              Learn from your usage patterns
            </Text>
            <Text style={styles.aiFeatureStatus}>
              Last analysis: {aiStatus?.behavioral_analysis?.last_analysis || 'Never'}
            </Text>
          </View>

          <View style={styles.aiFeatureCard}>
            <View style={styles.aiFeatureHeader}>
              <Ionicons name="notifications" size={24} color="#FF9800" />
              <Text style={styles.aiFeatureTitle}>Smart Notifications</Text>
              <Switch
                value={aiStatus?.notification_optimization?.enabled || false}
                onValueChange={() => {}}
              />
            </View>
            <Text style={styles.aiFeatureDescription}>
              AI-optimized notification timing
            </Text>
            <Text style={styles.aiFeatureStatus}>
              Optimization score: {aiStatus?.notification_optimization?.optimization_score || 0}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderPerformanceTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.performanceContainer}>
        <Text style={styles.sectionTitle}>Performance Metrics</Text>
        
        {performanceStatus?.api_performance && (
          <View style={styles.metricsCard}>
            <Text style={styles.metricsTitle}>API Performance</Text>
            <View style={styles.metricsGrid}>
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>
                  {Math.round(performanceStatus.api_performance.average_response_time)}ms
                </Text>
                <Text style={styles.metricLabel}>Avg Response</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>
                  {Math.round(performanceStatus.api_performance.error_rate * 100)}%
                </Text>
                <Text style={styles.metricLabel}>Error Rate</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>
                  {Math.round(performanceStatus.api_performance.calls_per_minute)}
                </Text>
                <Text style={styles.metricLabel}>Calls/Min</Text>
              </View>
            </View>
          </View>
        )}

        {performanceStatus?.memory_usage && (
          <View style={styles.metricsCard}>
            <Text style={styles.metricsTitle}>Memory Usage</Text>
            <ProgressChart
              data={{
                data: [performanceStatus.memory_usage.usage_ratio]
              }}
              width={screenWidth - 80}
              height={200}
              strokeWidth={16}
              radius={80}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                color: (opacity = 1) => `rgba(255, 152, 0, ${opacity})`,
              }}
              hideLegend={true}
            />
            <Text style={styles.memoryText}>
              {Math.round(performanceStatus.memory_usage.used_memory / 1024 / 1024)}MB / 
              {Math.round(performanceStatus.memory_usage.total_memory / 1024 / 1024)}MB
            </Text>
          </View>
        )}

        {performanceStatus?.cache_performance && (
          <View style={styles.metricsCard}>
            <Text style={styles.metricsTitle}>Cache Performance</Text>
            <PieChart
              data={[
                {
                  name: 'Hits',
                  population: performanceStatus.cache_performance.hits || 0,
                  color: '#4CAF50',
                  legendFontColor: '#333'
                },
                {
                  name: 'Misses',
                  population: performanceStatus.cache_performance.misses || 0,
                  color: '#F44336',
                  legendFontColor: '#333'
                }
              ]}
              width={screenWidth - 80}
              height={200}
              chartConfig={{
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
            />
          </View>
        )}
      </View>
    </ScrollView>
  );

  const renderCurrentTab = () => {
    switch (selectedTab) {
      case 'overview':
        return renderOverviewTab();
      case 'offline':
        return renderOfflineTab();
      case 'ai':
        return renderAITab();
      case 'performance':
        return renderPerformanceTab();
      default:
        return renderOverviewTab();
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading Advanced Features...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Advanced Features</Text>
        <Text style={styles.headerSubtitle}>Phase 1B Mobile Capabilities</Text>
      </View>

      {renderTabBar()}

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderCurrentTab()}
      </ScrollView>

      {/* Voice Control Modal */}
      <Modal
        visible={voiceModalVisible}
        animationType="fade"
        transparent={true}
      >
        <View style={styles.voiceModalOverlay}>
          <View style={styles.voiceModalContent}>
            <Animated.View style={[
              styles.voicePulse,
              { transform: [{ scale: pulseAnimation }] }
            ]}>
              <Ionicons name="mic" size={48} color="#F44336" />
            </Animated.View>
            <Text style={styles.voiceModalText}>Listening...</Text>
            <Text style={styles.voiceModalSubtext}>Say a command</Text>
            <TouchableOpacity
              style={styles.voiceModalClose}
              onPress={() => {
                setVoiceModalVisible(false);
                setVoiceControlActive(false);
              }}
            >
              <Text style={styles.voiceModalCloseText}>Stop</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: 4,
  },
  tabItemActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  tabTextActive: {
    color: '#007AFF',
    fontWeight: '600',
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
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
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
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    textAlign: 'center',
  },
  featureStatus: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
    marginBottom: 4,
  },
  featureDetail: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  actionsContainer: {
    marginBottom: 24,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
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
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  statusContainer: {
    marginBottom: 24,
  },
  statusGrid: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  statusLabel: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusValue: {
    fontSize: 14,
    color: '#666',
  },
  offlineContainer: {
    marginBottom: 24,
  },
  offlineStatus: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  connectionStatus: {
    alignItems: 'center',
    marginBottom: 20,
  },
  connectionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
  },
  syncQueue: {
    alignItems: 'center',
  },
  syncQueueTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  syncQueueCount: {
    fontSize: 14,
    color: '#666',
  },
  storageContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  storageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  storageItem: {
    marginBottom: 16,
  },
  storageCategory: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  storageBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 4,
  },
  storageProgress: {
    height: '100%',
    borderRadius: 4,
  },
  storageSize: {
    fontSize: 12,
    color: '#666',
  },
  aiContainer: {
    marginBottom: 24,
  },
  aiFeatures: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  aiFeatureCard: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  aiFeatureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  aiFeatureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginLeft: 12,
  },
  aiFeatureDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  aiFeatureStatus: {
    fontSize: 12,
    color: '#999',
  },
  performanceContainer: {
    marginBottom: 24,
  },
  metricsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  metricsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  metricItem: {
    alignItems: 'center',
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
  },
  memoryText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
    marginTop: 16,
  },
  voiceModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceModalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    minWidth: 200,
  },
  voicePulse: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  voiceModalText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  voiceModalSubtext: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  voiceModalClose: {
    backgroundColor: '#F44336',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  voiceModalCloseText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});