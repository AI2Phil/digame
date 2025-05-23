import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import biometricService from '../services/biometricService';
import notificationService from '../services/notificationService';
import offlineService from '../services/offlineService';

export default function SettingsScreen({ navigation }) {
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);
  const [networkStatus, setNetworkStatus] = useState({ isOnline: true, syncQueueLength: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeSettings();
    setupNetworkListener();
  }, []);

  const initializeSettings = async () => {
    try {
      // Check biometric availability and status
      const biometricStatus = await biometricService.initialize();
      setBiometricAvailable(biometricStatus.isAvailable && biometricStatus.isEnrolled);
      
      if (biometricStatus.isAvailable && biometricStatus.isEnrolled) {
        const enabled = await biometricService.isBiometricLoginEnabled();
        setBiometricEnabled(enabled);
      }

      // Get network status
      const status = offlineService.getNetworkStatus();
      setNetworkStatus(status);
      setOfflineMode(!status.isOnline);

    } catch (error) {
      console.error('Failed to initialize settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupNetworkListener = () => {
    const removeListener = offlineService.addNetworkListener((status) => {
      setNetworkStatus({
        isOnline: status.isOnline,
        syncQueueLength: offlineService.syncQueue?.length || 0,
      });
      setOfflineMode(!status.isOnline);
    });

    return removeListener;
  };

  const handleBiometricToggle = async (value) => {
    try {
      if (value) {
        // Enable biometric login
        const result = await biometricService.authenticate('Enable biometric login for Digame');
        
        if (result.success) {
          // For demo purposes, we'll use placeholder credentials
          // In a real app, you'd get these from the current session
          const credentials = {
            email: 'user@example.com', // Get from current user
            token: 'current_token', // Get from AsyncStorage
          };
          
          const enableResult = await biometricService.enableBiometricLogin(credentials);
          
          if (enableResult.success) {
            setBiometricEnabled(true);
            Alert.alert('Success', 'Biometric login has been enabled');
          } else {
            Alert.alert('Error', enableResult.error);
          }
        } else {
          Alert.alert('Authentication Failed', 'Biometric authentication is required to enable this feature');
        }
      } else {
        // Disable biometric login
        Alert.alert(
          'Disable Biometric Login',
          'Are you sure you want to disable biometric login?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Disable',
              style: 'destructive',
              onPress: async () => {
                const result = await biometricService.disableBiometricLogin();
                if (result.success) {
                  setBiometricEnabled(false);
                  Alert.alert('Success', 'Biometric login has been disabled');
                } else {
                  Alert.alert('Error', result.error);
                }
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('Biometric toggle error:', error);
      Alert.alert('Error', 'Failed to update biometric settings');
    }
  };

  const handleNotificationToggle = async (value) => {
    setNotificationsEnabled(value);
    
    if (value) {
      // Re-schedule notifications
      await notificationService.scheduleProductivityReminders();
      Alert.alert('Notifications Enabled', 'You will receive productivity reminders');
    } else {
      // Cancel all notifications
      await notificationService.cancelAllNotifications();
      Alert.alert('Notifications Disabled', 'All notifications have been cancelled');
    }
  };

  const handleSyncNow = async () => {
    if (!networkStatus.isOnline) {
      Alert.alert('Offline', 'You need an internet connection to sync data');
      return;
    }

    try {
      Alert.alert('Syncing', 'Synchronizing your data...');
      await offlineService.syncData();
      Alert.alert('Success', 'Data synchronized successfully');
    } catch (error) {
      console.error('Sync error:', error);
      Alert.alert('Error', 'Failed to sync data');
    }
  };

  const handleClearCache = async () => {
    Alert.alert(
      'Clear Cache',
      'This will remove all cached data. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await offlineService.clearCache();
              Alert.alert('Success', 'Cache cleared successfully');
            } catch (error) {
              console.error('Clear cache error:', error);
              Alert.alert('Error', 'Failed to clear cache');
            }
          },
        },
      ]
    );
  };

  const getBiometricTypeString = () => {
    return biometricService.getBiometricTypeString();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading settings...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        
        {/* Security Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          
          {biometricAvailable && (
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Ionicons name="finger-print" size={24} color="#007AFF" />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>{getBiometricTypeString()} Login</Text>
                  <Text style={styles.settingDescription}>
                    Use {getBiometricTypeString().toLowerCase()} to sign in quickly and securely
                  </Text>
                </View>
              </View>
              <Switch
                value={biometricEnabled}
                onValueChange={handleBiometricToggle}
                trackColor={{ false: '#767577', true: '#007AFF' }}
                thumbColor={biometricEnabled ? '#fff' : '#f4f3f4'}
              />
            </View>
          )}
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="notifications" size={24} color="#007AFF" />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Productivity Reminders</Text>
                <Text style={styles.settingDescription}>
                  Receive daily reminders to check your progress
                </Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleNotificationToggle}
              trackColor={{ false: '#767577', true: '#007AFF' }}
              thumbColor={notificationsEnabled ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Data & Sync Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data & Sync</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons 
                name={networkStatus.isOnline ? "cloud-done" : "cloud-offline"} 
                size={24} 
                color={networkStatus.isOnline ? "#34C759" : "#FF3B30"} 
              />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>
                  {networkStatus.isOnline ? "Online" : "Offline"}
                </Text>
                <Text style={styles.settingDescription}>
                  {networkStatus.isOnline 
                    ? "Data is syncing automatically" 
                    : `${networkStatus.syncQueueLength} items waiting to sync`
                  }
                </Text>
              </View>
            </View>
            {networkStatus.isOnline && (
              <TouchableOpacity style={styles.actionButton} onPress={handleSyncNow}>
                <Text style={styles.actionButtonText}>Sync Now</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity style={styles.settingItem} onPress={handleClearCache}>
            <View style={styles.settingInfo}>
              <Ionicons name="trash-outline" size={24} color="#FF3B30" />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Clear Cache</Text>
                <Text style={styles.settingDescription}>
                  Remove all cached data to free up space
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="information-circle" size={24} color="#007AFF" />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Version</Text>
                <Text style={styles.settingDescription}>Digame Mobile v1.0.0</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
    marginLeft: 5,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
  },
  actionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});