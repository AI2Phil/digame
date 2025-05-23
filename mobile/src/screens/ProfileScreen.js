import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthService } from '../services/AuthService';
import { ApiService } from '../services/ApiService';

export default function ProfileScreen({ onLogout }) {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({});
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    autoSync: true,
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setEditedUser(parsedUser);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const updatedUser = await ApiService.updateProfile(editedUser);
      setUser(updatedUser);
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await AuthService.logout();
            onLogout();
          },
        },
      ]
    );
  };

  const renderProfileSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Profile Information</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => setIsEditing(!isEditing)}
        >
          <Ionicons
            name={isEditing ? 'close' : 'pencil'}
            size={20}
            color="#007AFF"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </Text>
          </View>
        </View>

        <View style={styles.profileInfo}>
          {isEditing ? (
            <>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  value={editedUser.first_name || ''}
                  onChangeText={(text) => setEditedUser(prev => ({ ...prev, first_name: text }))}
                  placeholder="First Name"
                />
                <TextInput
                  style={styles.input}
                  value={editedUser.last_name || ''}
                  onChangeText={(text) => setEditedUser(prev => ({ ...prev, last_name: text }))}
                  placeholder="Last Name"
                />
              </View>
              <TextInput
                style={styles.input}
                value={editedUser.email || ''}
                onChangeText={(text) => setEditedUser(prev => ({ ...prev, email: text }))}
                placeholder="Email"
                keyboardType="email-address"
              />
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSaveProfile}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setEditedUser(user);
                    setIsEditing(false);
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.userName}>
                {user?.first_name} {user?.last_name}
              </Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
              <Text style={styles.userUsername}>@{user?.username}</Text>
            </>
          )}
        </View>
      </View>
    </View>
  );

  const renderSettingsSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Settings</Text>
      
      <View style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <Ionicons name="notifications-outline" size={24} color="#007AFF" />
          <View style={styles.settingText}>
            <Text style={styles.settingTitle}>Push Notifications</Text>
            <Text style={styles.settingDescription}>Receive alerts and updates</Text>
          </View>
        </View>
        <Switch
          value={settings.notifications}
          onValueChange={(value) => setSettings(prev => ({ ...prev, notifications: value }))}
        />
      </View>

      <View style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <Ionicons name="moon-outline" size={24} color="#007AFF" />
          <View style={styles.settingText}>
            <Text style={styles.settingTitle}>Dark Mode</Text>
            <Text style={styles.settingDescription}>Use dark theme</Text>
          </View>
        </View>
        <Switch
          value={settings.darkMode}
          onValueChange={(value) => setSettings(prev => ({ ...prev, darkMode: value }))}
        />
      </View>

      <View style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <Ionicons name="sync-outline" size={24} color="#007AFF" />
          <View style={styles.settingText}>
            <Text style={styles.settingTitle}>Auto Sync</Text>
            <Text style={styles.settingDescription}>Automatically sync data</Text>
          </View>
        </View>
        <Switch
          value={settings.autoSync}
          onValueChange={(value) => setSettings(prev => ({ ...prev, autoSync: value }))}
        />
      </View>
    </View>
  );

  const renderStatsSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Account Stats</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>127</Text>
          <Text style={styles.statLabel}>Days Active</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>2.4k</Text>
          <Text style={styles.statLabel}>Activities Tracked</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>85%</Text>
          <Text style={styles.statLabel}>Avg Productivity</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>12</Text>
          <Text style={styles.statLabel}>Patterns Found</Text>
        </View>
      </View>
    </View>
  );

  const renderActionsSection = () => (
    <View style={styles.section}>
      <TouchableOpacity style={styles.actionItem}>
        <Ionicons name="help-circle-outline" size={24} color="#007AFF" />
        <Text style={styles.actionText}>Help & Support</Text>
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionItem}>
        <Ionicons name="document-text-outline" size={24} color="#007AFF" />
        <Text style={styles.actionText}>Privacy Policy</Text>
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionItem}>
        <Ionicons name="information-circle-outline" size={24} color="#007AFF" />
        <Text style={styles.actionText}>About</Text>
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      </TouchableOpacity>

      <TouchableOpacity style={[styles.actionItem, styles.logoutItem]} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
        <Text style={[styles.actionText, styles.logoutText]}>Logout</Text>
      </TouchableOpacity>
    </View>
  );

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="person" size={50} color="#007AFF" />
        <Text style={styles.loadingText}>Loading Profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {renderProfileSection()}
      {renderStatsSection()}
      {renderSettingsSection()}
      {renderActionsSection()}
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
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  editButton: {
    padding: 8,
  },
  profileCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 2,
  },
  userUsername: {
    fontSize: 14,
    color: '#999',
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 12,
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 16,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: 4,
    flex: 1,
    minWidth: '45%',
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
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  settingItem: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 12,
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
    fontWeight: '600',
    color: '#333',
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  actionItem: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  actionText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  logoutItem: {
    marginTop: 16,
  },
  logoutText: {
    color: '#FF3B30',
  },
});