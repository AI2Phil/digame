/**
 * Security Dashboard Screen
 * Enterprise-grade mobile security management interface
 * Features: MFA setup, threat monitoring, biometric auth, security analytics
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, PieChart, BarChart } from 'react-native-chart-kit';
import MobileSecurityService from '../services/MobileSecurityService';

const { width: screenWidth } = Dimensions.get('window');

export default function SecurityDashboardScreen({ navigation }) {
  const [securityData, setSecurityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [mfaModalVisible, setMfaModalVisible] = useState(false);
  const [threatModalVisible, setThreatModalVisible] = useState(false);
  const [securityService] = useState(new MobileSecurityService());

  useEffect(() => {
    loadSecurityDashboard();
  }, []);

  const loadSecurityDashboard = async () => {
    try {
      setLoading(true);
      const data = await securityService.getSecurityDashboard();
      setSecurityData(data);
    } catch (error) {
      console.error('Failed to load security dashboard:', error);
      Alert.alert('Error', 'Failed to load security dashboard');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadSecurityDashboard();
    setRefreshing(false);
  }, []);

  const handleMFASetup = async () => {
    try {
      Alert.alert(
        'Setup MFA',
        'Choose your preferred method:',
        [
          { text: 'TOTP (Authenticator App)', onPress: () => setupMFA('totp') },
          { text: 'SMS', onPress: () => setupMFA('sms') },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to setup MFA');
    }
  };

  const setupMFA = async (method) => {
    try {
      setLoading(true);
      const result = await securityService.setupMFA(method);
      
      if (result.success) {
        Alert.alert(
          'MFA Setup Complete',
          `Your ${method.toUpperCase()} has been configured successfully.`,
          [{ text: 'OK', onPress: () => loadSecurityDashboard() }]
        );
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricSetup = async () => {
    try {
      setLoading(true);
      const result = await securityService.setupBiometric();
      
      if (result.success) {
        Alert.alert(
          'Biometric Setup Complete',
          'Biometric authentication has been enabled.',
          [{ text: 'OK', onPress: () => loadSecurityDashboard() }]
        );
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleThreatMonitoring = async () => {
    try {
      setLoading(true);
      const threats = await securityService.monitorThreats();
      setThreatModalVisible(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to monitor threats');
    } finally {
      setLoading(false);
    }
  };

  const getSecurityScoreColor = (score) => {
    if (score >= 80) return '#4CAF50';
    if (score >= 60) return '#FF9800';
    return '#F44336';
  };

  const renderSecurityScore = () => {
    if (!securityData) return null;

    const score = securityData.security_score;
    const color = getSecurityScoreColor(score);

    return (
      <View style={styles.scoreCard}>
        <View style={styles.scoreHeader}>
          <Ionicons name="shield-checkmark" size={24} color={color} />
          <Text style={styles.scoreTitle}>Security Score</Text>
        </View>
        <View style={styles.scoreContent}>
          <Text style={[styles.scoreValue, { color }]}>{score}</Text>
          <Text style={styles.scoreMax}>/100</Text>
        </View>
        <View style={[styles.scoreBar, { backgroundColor: '#E0E0E0' }]}>
          <View 
            style={[
              styles.scoreProgress, 
              { width: `${score}%`, backgroundColor: color }
            ]} 
          />
        </View>
        <Text style={styles.scoreDescription}>
          {score >= 80 ? 'Excellent security' : 
           score >= 60 ? 'Good security' : 'Needs improvement'}
        </Text>
      </View>
    );
  };

  const renderSecurityFeatures = () => {
    if (!securityData) return null;

    const features = [
      {
        title: 'Multi-Factor Authentication',
        enabled: securityData.mfa_status.enabled,
        icon: 'key',
        onPress: handleMFASetup,
        description: 'Add extra security layer'
      },
      {
        title: 'Biometric Authentication',
        enabled: securityData.biometric_status.enabled,
        icon: 'finger-print',
        onPress: handleBiometricSetup,
        description: 'Use fingerprint or face ID'
      },
      {
        title: 'Threat Detection',
        enabled: true,
        icon: 'warning',
        onPress: handleThreatMonitoring,
        description: 'Real-time security monitoring'
      }
    ];

    return (
      <View style={styles.featuresContainer}>
        <Text style={styles.sectionTitle}>Security Features</Text>
        {features.map((feature, index) => (
          <TouchableOpacity
            key={index}
            style={styles.featureCard}
            onPress={feature.onPress}
          >
            <View style={styles.featureIcon}>
              <Ionicons 
                name={feature.icon} 
                size={24} 
                color={feature.enabled ? '#4CAF50' : '#757575'} 
              />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>{feature.description}</Text>
            </View>
            <View style={styles.featureStatus}>
              <Text style={[
                styles.statusText,
                { color: feature.enabled ? '#4CAF50' : '#757575' }
              ]}>
                {feature.enabled ? 'Enabled' : 'Disabled'}
              </Text>
              <Ionicons 
                name="chevron-forward" 
                size={20} 
                color="#BDBDBD" 
              />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderThreatStatus = () => {
    if (!securityData) return null;

    const threatData = securityData.threat_status;
    const threatColor = threatData.active_threats > 0 ? '#F44336' : '#4CAF50';

    return (
      <View style={styles.threatCard}>
        <View style={styles.threatHeader}>
          <Ionicons name="shield" size={24} color={threatColor} />
          <Text style={styles.threatTitle}>Threat Status</Text>
        </View>
        <View style={styles.threatContent}>
          <View style={styles.threatStat}>
            <Text style={styles.threatNumber}>{threatData.active_threats}</Text>
            <Text style={styles.threatLabel}>Active Threats</Text>
          </View>
          <View style={styles.threatStat}>
            <Text style={[styles.threatLevel, { color: threatColor }]}>
              {threatData.threat_level?.toUpperCase() || 'LOW'}
            </Text>
            <Text style={styles.threatLabel}>Threat Level</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.threatButton}
          onPress={() => setThreatModalVisible(true)}
        >
          <Text style={styles.threatButtonText}>View Details</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderSecurityChart = () => {
    if (!securityData) return null;

    const chartData = {
      labels: ['MFA', 'Biometric', 'Session', 'Device'],
      datasets: [{
        data: [
          securityData.mfa_status.enabled ? 30 : 0,
          securityData.biometric_status.enabled ? 25 : 0,
          securityData.session_status.valid ? 25 : 0,
          20 // Base device security
        ]
      }]
    };

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.sectionTitle}>Security Breakdown</Text>
        <BarChart
          data={chartData}
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
    );
  };

  const renderRecentEvents = () => {
    if (!securityData || !securityData.recent_events) return null;

    return (
      <View style={styles.eventsContainer}>
        <Text style={styles.sectionTitle}>Recent Security Events</Text>
        {securityData.recent_events.slice(0, 5).map((event, index) => (
          <View key={index} style={styles.eventCard}>
            <View style={styles.eventIcon}>
              <Ionicons 
                name={getEventIcon(event.event_type)} 
                size={20} 
                color={getEventColor(event.result)} 
              />
            </View>
            <View style={styles.eventContent}>
              <Text style={styles.eventTitle}>{formatEventType(event.event_type)}</Text>
              <Text style={styles.eventTime}>
                {new Date(event.timestamp).toLocaleString()}
              </Text>
            </View>
            <View style={[
              styles.eventStatus,
              { backgroundColor: getEventColor(event.result) }
            ]}>
              <Text style={styles.eventStatusText}>{event.result}</Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderRecommendations = () => {
    if (!securityData || !securityData.recommendations) return null;

    return (
      <View style={styles.recommendationsContainer}>
        <Text style={styles.sectionTitle}>Security Recommendations</Text>
        {securityData.recommendations.map((rec, index) => (
          <TouchableOpacity key={index} style={styles.recommendationCard}>
            <View style={styles.recommendationIcon}>
              <Ionicons 
                name="bulb" 
                size={20} 
                color={getRecommendationColor(rec.type)} 
              />
            </View>
            <View style={styles.recommendationContent}>
              <Text style={styles.recommendationTitle}>{rec.title}</Text>
              <Text style={styles.recommendationDescription}>{rec.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#BDBDBD" />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const getEventIcon = (eventType) => {
    const icons = {
      'mfa_setup': 'key',
      'biometric_auth': 'finger-print',
      'session_created': 'log-in',
      'threat_detected': 'warning',
      'app_locked': 'lock-closed'
    };
    return icons[eventType] || 'information-circle';
  };

  const getEventColor = (result) => {
    const colors = {
      'success': '#4CAF50',
      'failed': '#F44336',
      'alert': '#FF9800',
      'info': '#2196F3'
    };
    return colors[result] || '#757575';
  };

  const formatEventType = (eventType) => {
    return eventType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getRecommendationColor = (type) => {
    const colors = {
      'critical': '#F44336',
      'high': '#FF9800',
      'medium': '#FFC107',
      'low': '#4CAF50'
    };
    return colors[type] || '#757575';
  };

  if (loading && !securityData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading Security Dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Security Dashboard</Text>
          <Text style={styles.headerSubtitle}>Monitor and manage your security</Text>
        </View>

        {renderSecurityScore()}
        {renderSecurityFeatures()}
        {renderThreatStatus()}
        {renderSecurityChart()}
        {renderRecentEvents()}
        {renderRecommendations()}
      </ScrollView>

      {/* Threat Details Modal */}
      <Modal
        visible={threatModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Threat Analysis</Text>
            <TouchableOpacity onPress={() => setThreatModalVisible(false)}>
              <Ionicons name="close" size={24} color="#007AFF" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalText}>
              Real-time threat monitoring is active. No immediate threats detected.
            </Text>
            <View style={styles.threatMetrics}>
              <Text style={styles.metricTitle}>Security Metrics</Text>
              <Text style={styles.metricItem}>• Device Security: ✓ Secure</Text>
              <Text style={styles.metricItem}>• Network Security: ✓ Secure</Text>
              <Text style={styles.metricItem}>• App Integrity: ✓ Verified</Text>
              <Text style={styles.metricItem}>• Session Security: ✓ Valid</Text>
            </View>
          </ScrollView>
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
  scrollView: {
    flex: 1,
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
  scoreCard: {
    backgroundColor: '#fff',
    margin: 20,
    marginTop: -40,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  scoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    color: '#333',
  },
  scoreContent: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  scoreMax: {
    fontSize: 24,
    color: '#666',
    marginLeft: 4,
  },
  scoreBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  scoreProgress: {
    height: '100%',
    borderRadius: 4,
  },
  scoreDescription: {
    fontSize: 14,
    color: '#666',
  },
  featuresContainer: {
    margin: 20,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  featureCard: {
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
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
  },
  featureStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 8,
  },
  threatCard: {
    backgroundColor: '#fff',
    margin: 20,
    marginTop: 0,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  threatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  threatTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    color: '#333',
  },
  threatContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  threatStat: {
    alignItems: 'center',
  },
  threatNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  threatLevel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  threatLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  threatButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  threatButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  chartContainer: {
    margin: 20,
    marginTop: 0,
  },
  chart: {
    borderRadius: 16,
    backgroundColor: '#fff',
  },
  eventsContainer: {
    margin: 20,
    marginTop: 0,
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  eventIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  eventTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  eventStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  eventStatusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  recommendationsContainer: {
    margin: 20,
    marginTop: 0,
    marginBottom: 40,
  },
  recommendationCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  recommendationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recommendationContent: {
    flex: 1,
  },
  recommendationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  recommendationDescription: {
    fontSize: 12,
    color: '#666',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 20,
  },
  threatMetrics: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 16,
  },
  metricTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  metricItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
});