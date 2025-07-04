/**
 * MFA Setup Screen
 * Comprehensive Multi-Factor Authentication setup interface
 * Supports TOTP, SMS, Email, and Backup Codes
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  ActivityIndicator,
  Clipboard,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import MobileSecurityService from '../services/MobileSecurityService';

export default function MFASetupScreen({ navigation, route }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedMethod, setSelectedMethod] = useState('totp');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [qrCodeData, setQrCodeData] = useState(null);
  const [secretKey, setSecretKey] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [securityService] = useState(new MobileSecurityService());

  const mfaMethods = [
    {
      id: 'totp',
      title: 'Authenticator App',
      description: 'Use Google Authenticator, Authy, or similar apps',
      icon: 'phone-portrait',
      recommended: true
    },
    {
      id: 'sms',
      title: 'SMS Text Message',
      description: 'Receive codes via text message',
      icon: 'chatbubble',
      recommended: false
    },
    {
      id: 'email',
      title: 'Email',
      description: 'Receive codes via email',
      icon: 'mail',
      recommended: false
    }
  ];

  const handleMethodSelection = (method) => {
    setSelectedMethod(method);
    setCurrentStep(2);
  };

  const handleSetupMFA = async () => {
    try {
      setLoading(true);
      
      const setupData = {
        method: selectedMethod,
        phone_number: selectedMethod === 'sms' ? phoneNumber : null
      };

      const result = await securityService.setupMFA(selectedMethod, phoneNumber);
      
      if (result.success) {
        setQrCodeData(result.qr_code_url);
        setSecretKey(result.secret_key);
        setBackupCodes(result.backup_codes);
        setCurrentStep(3);
      }
    } catch (error) {
      Alert.alert('Setup Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySetup = async () => {
    if (!verificationCode.trim()) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }

    try {
      setLoading(true);
      const isValid = await securityService.verifyMFA(verificationCode, selectedMethod);
      
      if (isValid) {
        setCurrentStep(4);
      } else {
        Alert.alert('Invalid Code', 'Please check your code and try again');
      }
    } catch (error) {
      Alert.alert('Verification Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    Alert.alert(
      'MFA Setup Complete',
      'Your account is now protected with multi-factor authentication.',
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack()
        }
      ]
    );
  };

  const copySecretKey = () => {
    Clipboard.setString(secretKey);
    Alert.alert('Copied', 'Secret key copied to clipboard');
  };

  const shareBackupCodes = async () => {
    try {
      const codesText = backupCodes.join('\n');
      await Share.share({
        message: `Digame MFA Backup Codes:\n\n${codesText}\n\nKeep these codes safe and secure.`,
        title: 'MFA Backup Codes'
      });
    } catch (error) {
      console.error('Failed to share backup codes:', error);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3, 4].map((step) => (
        <View key={step} style={styles.stepContainer}>
          <View style={[
            styles.stepCircle,
            currentStep >= step ? styles.stepActive : styles.stepInactive
          ]}>
            <Text style={[
              styles.stepNumber,
              currentStep >= step ? styles.stepNumberActive : styles.stepNumberInactive
            ]}>
              {step}
            </Text>
          </View>
          {step < 4 && (
            <View style={[
              styles.stepLine,
              currentStep > step ? styles.stepLineActive : styles.stepLineInactive
            ]} />
          )}
        </View>
      ))}
    </View>
  );

  const renderMethodSelection = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Choose Authentication Method</Text>
      <Text style={styles.stepDescription}>
        Select how you'd like to receive your second factor authentication codes
      </Text>
      
      {mfaMethods.map((method) => (
        <TouchableOpacity
          key={method.id}
          style={[
            styles.methodCard,
            selectedMethod === method.id && styles.methodCardSelected
          ]}
          onPress={() => handleMethodSelection(method.id)}
        >
          <View style={styles.methodIcon}>
            <Ionicons name={method.icon} size={24} color="#007AFF" />
            {method.recommended && (
              <View style={styles.recommendedBadge}>
                <Text style={styles.recommendedText}>Recommended</Text>
              </View>
            )}
          </View>
          <View style={styles.methodContent}>
            <Text style={styles.methodTitle}>{method.title}</Text>
            <Text style={styles.methodDescription}>{method.description}</Text>
          </View>
          <Ionicons 
            name="chevron-forward" 
            size={20} 
            color="#BDBDBD" 
          />
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderSetupForm = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Setup {mfaMethods.find(m => m.id === selectedMethod)?.title}</Text>
      
      {selectedMethod === 'sms' && (
        <View style={styles.formGroup}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            placeholder="+1 (555) 123-4567"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            autoCapitalize="none"
          />
          <Text style={styles.helpText}>
            We'll send verification codes to this number
          </Text>
        </View>
      )}

      {selectedMethod === 'totp' && (
        <View style={styles.formGroup}>
          <Text style={styles.label}>Instructions</Text>
          <View style={styles.instructionCard}>
            <Text style={styles.instructionText}>
              1. Download an authenticator app like Google Authenticator or Authy
            </Text>
            <Text style={styles.instructionText}>
              2. Tap "Continue" to generate your QR code
            </Text>
            <Text style={styles.instructionText}>
              3. Scan the QR code with your authenticator app
            </Text>
            <Text style={styles.instructionText}>
              4. Enter the 6-digit code from your app to verify
            </Text>
          </View>
        </View>
      )}

      <TouchableOpacity
        style={[styles.continueButton, loading && styles.disabledButton]}
        onPress={handleSetupMFA}
        disabled={loading || (selectedMethod === 'sms' && !phoneNumber.trim())}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.continueButtonText}>Continue</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderQRCodeStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Scan QR Code</Text>
      <Text style={styles.stepDescription}>
        Use your authenticator app to scan this QR code
      </Text>

      {selectedMethod === 'totp' && qrCodeData && (
        <View style={styles.qrContainer}>
          <QRCode
            value={qrCodeData}
            size={200}
            backgroundColor="white"
            color="black"
          />
        </View>
      )}

      {secretKey && (
        <View style={styles.secretKeyContainer}>
          <Text style={styles.secretKeyLabel}>Manual Entry Key:</Text>
          <View style={styles.secretKeyBox}>
            <Text style={styles.secretKeyText}>{secretKey}</Text>
            <TouchableOpacity onPress={copySecretKey} style={styles.copyButton}>
              <Ionicons name="copy" size={20} color="#007AFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.helpText}>
            If you can't scan the QR code, enter this key manually
          </Text>
        </View>
      )}

      <View style={styles.verificationContainer}>
        <Text style={styles.label}>Enter Verification Code</Text>
        <TextInput
          style={styles.codeInput}
          placeholder="000000"
          value={verificationCode}
          onChangeText={setVerificationCode}
          keyboardType="number-pad"
          maxLength={6}
          textAlign="center"
        />
        <Text style={styles.helpText}>
          Enter the 6-digit code from your authenticator app
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.continueButton, loading && styles.disabledButton]}
        onPress={handleVerifySetup}
        disabled={loading || verificationCode.length !== 6}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.continueButtonText}>Verify & Continue</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderBackupCodes = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Save Backup Codes</Text>
      <Text style={styles.stepDescription}>
        These codes can be used if you lose access to your authenticator device
      </Text>

      <View style={styles.warningCard}>
        <Ionicons name="warning" size={24} color="#FF9800" />
        <Text style={styles.warningText}>
          Save these codes in a secure location. Each code can only be used once.
        </Text>
      </View>

      <View style={styles.backupCodesContainer}>
        {backupCodes.map((code, index) => (
          <View key={index} style={styles.backupCodeItem}>
            <Text style={styles.backupCodeText}>{code}</Text>
          </View>
        ))}
      </View>

      <View style={styles.backupActions}>
        <TouchableOpacity
          style={styles.shareButton}
          onPress={shareBackupCodes}
        >
          <Ionicons name="share" size={20} color="#007AFF" />
          <Text style={styles.shareButtonText}>Share Codes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleComplete}
        >
          <Text style={styles.continueButtonText}>Complete Setup</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderMethodSelection();
      case 2:
        return renderSetupForm();
      case 3:
        return renderQRCodeStep();
      case 4:
        return renderBackupCodes();
      default:
        return renderMethodSelection();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Setup MFA</Text>
        <View style={styles.placeholder} />
      </View>

      {renderStepIndicator()}

      <ScrollView style={styles.content}>
        {renderCurrentStep()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#fff',
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepActive: {
    backgroundColor: '#007AFF',
  },
  stepInactive: {
    backgroundColor: '#E0E0E0',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
  },
  stepNumberActive: {
    color: '#fff',
  },
  stepNumberInactive: {
    color: '#666',
  },
  stepLine: {
    width: 40,
    height: 2,
    marginHorizontal: 8,
  },
  stepLineActive: {
    backgroundColor: '#007AFF',
  },
  stepLineInactive: {
    backgroundColor: '#E0E0E0',
  },
  content: {
    flex: 1,
  },
  stepContent: {
    padding: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    lineHeight: 22,
  },
  methodCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  methodCardSelected: {
    borderColor: '#007AFF',
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    position: 'relative',
  },
  recommendedBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  recommendedText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  methodContent: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  methodDescription: {
    fontSize: 14,
    color: '#666',
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  helpText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  instructionCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 16,
  },
  instructionText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    lineHeight: 20,
  },
  continueButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  disabledButton: {
    opacity: 0.6,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  qrContainer: {
    alignItems: 'center',
    marginVertical: 24,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  secretKeyContainer: {
    marginVertical: 16,
  },
  secretKeyLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  secretKeyBox: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  secretKeyText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#333',
  },
  copyButton: {
    padding: 8,
  },
  verificationContainer: {
    marginTop: 24,
  },
  codeInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    fontSize: 24,
    fontWeight: 'bold',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    letterSpacing: 4,
  },
  warningCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: '#E65100',
    marginLeft: 12,
    lineHeight: 20,
  },
  backupCodesContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  backupCodeItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backupCodeText: {
    fontSize: 16,
    fontFamily: 'monospace',
    color: '#333',
    textAlign: 'center',
  },
  backupActions: {
    gap: 12,
  },
  shareButton: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  shareButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});