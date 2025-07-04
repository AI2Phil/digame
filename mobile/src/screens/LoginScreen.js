import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthService } from '../services/AuthService';

export default function LoginScreen({ navigation, onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showMfaModal, setShowMfaModal] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [pendingCredentials, setPendingCredentials] = useState(null);

  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    try {
      const mfaStatus = await AuthService.getMFAStatus();
      setBiometricAvailable(mfaStatus.biometric_enabled || false);
    } catch (error) {
      console.error('Failed to check biometric availability:', error);
    }
  };

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both username and password');
      return;
    }

    setIsLoading(true);
    try {
      const result = await AuthService.login(username.trim(), password);
      
      if (result.mfa_required) {
        // Store credentials for MFA step
        setPendingCredentials({ username: username.trim(), password });
        setShowMfaModal(true);
      } else {
        await onLogin(result.token, result.user);
      }
    } catch (error) {
      if (error.message === 'MFA_REQUIRED') {
        setPendingCredentials({ username: username.trim(), password });
        setShowMfaModal(true);
      } else {
        Alert.alert('Login Failed', error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleMfaLogin = async () => {
    if (!mfaCode.trim()) {
      Alert.alert('Error', 'Please enter the MFA code');
      return;
    }

    setIsLoading(true);
    try {
      const result = await AuthService.loginWithMFA(
        pendingCredentials.username,
        pendingCredentials.password,
        mfaCode.trim()
      );
      
      setShowMfaModal(false);
      setPendingCredentials(null);
      setMfaCode('');
      await onLogin(result.token, result.user);
    } catch (error) {
      Alert.alert('MFA Verification Failed', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    try {
      const success = await AuthService.authenticateWithBiometric(
        'Use your biometric to sign in'
      );
      
      if (success) {
        // For demo purposes, auto-fill credentials
        // In production, you'd retrieve stored credentials securely
        Alert.alert('Success', 'Biometric authentication successful');
      }
    } catch (error) {
      Alert.alert('Biometric Authentication Failed', error.message);
    }
  };

  const closeMfaModal = () => {
    setShowMfaModal(false);
    setPendingCredentials(null);
    setMfaCode('');
  };

  const navigateToRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Ionicons name="analytics" size={80} color="#007AFF" />
          <Text style={styles.title}>Digame</Text>
          <Text style={styles.subtitle}>Digital Activity Intelligence</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Username or Email"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color="#666"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.disabledButton]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {biometricAvailable && (
            <TouchableOpacity
              style={styles.biometricButton}
              onPress={handleBiometricLogin}
              disabled={isLoading}
            >
              <Ionicons name="finger-print" size={24} color="#007AFF" />
              <Text style={styles.biometricButtonText}>Use Biometric</Text>
            </TouchableOpacity>
          )}

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={navigateToRegister}
            disabled={isLoading}
          >
            <Text style={styles.registerButtonText}>Create New Account</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By signing in, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </ScrollView>

      {/* MFA Modal */}
      <Modal
        visible={showMfaModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.mfaContainer}>
          <View style={styles.mfaHeader}>
            <Text style={styles.mfaTitle}>Two-Factor Authentication</Text>
            <TouchableOpacity onPress={closeMfaModal}>
              <Ionicons name="close" size={24} color="#007AFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.mfaContent}>
            <View style={styles.mfaIcon}>
              <Ionicons name="shield-checkmark" size={48} color="#007AFF" />
            </View>
            
            <Text style={styles.mfaDescription}>
              Enter the 6-digit code from your authenticator app
            </Text>

            <View style={styles.mfaInputContainer}>
              <TextInput
                style={styles.mfaInput}
                placeholder="000000"
                value={mfaCode}
                onChangeText={setMfaCode}
                keyboardType="number-pad"
                maxLength={6}
                textAlign="center"
                autoFocus
              />
            </View>

            <TouchableOpacity
              style={[styles.mfaButton, isLoading && styles.disabledButton]}
              onPress={handleMfaLogin}
              disabled={isLoading || mfaCode.length !== 6}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.mfaButtonText}>Verify</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.mfaCancelButton}
              onPress={closeMfaModal}
              disabled={isLoading}
            >
              <Text style={styles.mfaCancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  form: {
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: {
    padding: 4,
  },
  loginButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 30,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#666',
    fontSize: 14,
  },
  registerButton: {
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 18,
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F8FF',
    borderRadius: 12,
    height: 50,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  biometricButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  mfaContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mfaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  mfaTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  mfaContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mfaIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  mfaDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  mfaInputContainer: {
    width: '100%',
    marginBottom: 24,
  },
  mfaInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 20,
    fontSize: 24,
    fontWeight: 'bold',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    letterSpacing: 8,
  },
  mfaButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    height: 50,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  mfaButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  mfaCancelButton: {
    padding: 12,
  },
  mfaCancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
});