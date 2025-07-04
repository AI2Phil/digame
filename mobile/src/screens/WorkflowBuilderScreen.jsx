/**
 * Workflow Builder Screen
 * Simplified mobile workflow designer with drag-and-drop interface
 * Features: Step-by-step workflow creation, templates, and mobile optimization
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
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import WorkflowAutomationService from '../services/WorkflowAutomationService';

export default function WorkflowBuilderScreen({ navigation, route }) {
  const [workflow, setWorkflow] = useState({
    name: '',
    description: '',
    steps: [],
    triggers: [],
    settings: {
      enabled: true,
      max_execution_time: 300,
      retry_count: 3,
      notification_enabled: true
    }
  });
  
  const [currentStep, setCurrentStep] = useState(1);
  const [stepModalVisible, setStepModalVisible] = useState(false);
  const [selectedStepType, setSelectedStepType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [workflowService] = useState(new WorkflowAutomationService());
  const [templates, setTemplates] = useState([]);
  const [showTemplates, setShowTemplates] = useState(false);

  const workflowId = route?.params?.workflowId;
  const isEditing = !!workflowId;

  const stepTypes = [
    {
      id: 'trigger',
      name: 'Trigger',
      description: 'Start the workflow',
      icon: 'play-circle',
      color: '#4CAF50',
      mobileOptimized: true
    },
    {
      id: 'action',
      name: 'Action',
      description: 'Perform an operation',
      icon: 'flash',
      color: '#2196F3',
      mobileOptimized: true
    },
    {
      id: 'condition',
      name: 'Condition',
      description: 'Make a decision',
      icon: 'git-branch',
      color: '#FF9800',
      mobileOptimized: true
    },
    {
      id: 'notification',
      name: 'Notification',
      description: 'Send alerts or messages',
      icon: 'notifications',
      color: '#9C27B0',
      mobileOptimized: true
    },
    {
      id: 'delay',
      name: 'Delay',
      description: 'Wait for a specified time',
      icon: 'time',
      color: '#607D8B',
      mobileOptimized: true
    },
    {
      id: 'data_processing',
      name: 'Data Processing',
      description: 'Transform or analyze data',
      icon: 'analytics',
      color: '#795548',
      mobileOptimized: false
    }
  ];

  useEffect(() => {
    if (isEditing) {
      loadWorkflow();
    } else {
      loadTemplates();
    }
  }, []);

  const loadWorkflow = async () => {
    try {
      setLoading(true);
      const workflows = await workflowService.getWorkflows({ id: workflowId });
      if (workflows.length > 0) {
        setWorkflow(workflows[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load workflow');
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const templatesData = await workflowService.getWorkflowTemplates();
      setTemplates(templatesData);
      if (templatesData.length > 0 && !workflow.name) {
        setShowTemplates(true);
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  const handleSaveWorkflow = async () => {
    try {
      const validation = workflowService.workflowBuilder.validateWorkflow(workflow);
      if (!validation.isValid) {
        Alert.alert('Validation Error', validation.errors.join('\n'));
        return;
      }

      setLoading(true);
      
      const optimizedWorkflow = workflowService.workflowBuilder.optimizeForMobile(workflow);
      
      let savedWorkflow;
      if (isEditing) {
        savedWorkflow = await workflowService.updateWorkflow(workflowId, optimizedWorkflow);
      } else {
        savedWorkflow = await workflowService.createWorkflow(optimizedWorkflow);
      }

      Alert.alert(
        'Success',
        `Workflow ${isEditing ? 'updated' : 'created'} successfully!`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStep = (stepType) => {
    const newStep = {
      id: Date.now().toString(),
      type: stepType.id,
      name: stepType.name,
      description: '',
      configuration: {},
      position: workflow.steps.length
    };

    setWorkflow(prev => ({
      ...prev,
      steps: [...prev.steps, newStep]
    }));

    setStepModalVisible(false);
    setSelectedStepType(null);
  };

  const handleRemoveStep = (stepId) => {
    Alert.alert(
      'Remove Step',
      'Are you sure you want to remove this step?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setWorkflow(prev => ({
              ...prev,
              steps: prev.steps.filter(step => step.id !== stepId)
            }));
          }
        }
      ]
    );
  };

  const handleEditStep = (stepId) => {
    navigation.navigate('StepEditor', { 
      stepId, 
      workflow,
      onStepUpdate: (updatedStep) => {
        setWorkflow(prev => ({
          ...prev,
          steps: prev.steps.map(step => 
            step.id === stepId ? updatedStep : step
          )
        }));
      }
    });
  };

  const handleUseTemplate = async (template) => {
    try {
      setLoading(true);
      const workflowFromTemplate = await workflowService.createFromTemplate(template.id);
      setWorkflow(workflowFromTemplate);
      setShowTemplates(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to load template');
    } finally {
      setLoading(false);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#007AFF" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>
        {isEditing ? 'Edit Workflow' : 'Create Workflow'}
      </Text>
      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSaveWorkflow}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#007AFF" />
        ) : (
          <Text style={styles.saveButtonText}>Save</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderBasicInfo = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Basic Information</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Workflow Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter workflow name"
          value={workflow.name}
          onChangeText={(text) => setWorkflow(prev => ({ ...prev, name: text }))}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Describe what this workflow does"
          value={workflow.description}
          onChangeText={(text) => setWorkflow(prev => ({ ...prev, description: text }))}
          multiline
          numberOfLines={3}
        />
      </View>
    </View>
  );

  const renderWorkflowSteps = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Workflow Steps</Text>
        <TouchableOpacity
          style={styles.addStepButton}
          onPress={() => setStepModalVisible(true)}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addStepText}>Add Step</Text>
        </TouchableOpacity>
      </View>

      {workflow.steps.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="git-branch" size={48} color="#BDBDBD" />
          <Text style={styles.emptyStateText}>No steps added yet</Text>
          <Text style={styles.emptyStateSubtext}>
            Add steps to build your workflow
          </Text>
        </View>
      ) : (
        <View style={styles.stepsContainer}>
          {workflow.steps.map((step, index) => (
            <View key={step.id} style={styles.stepContainer}>
              <View style={styles.stepCard}>
                <View style={styles.stepIcon}>
                  <Ionicons 
                    name={getStepIcon(step.type)} 
                    size={24} 
                    color={getStepColor(step.type)} 
                  />
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepName}>{step.name}</Text>
                  <Text style={styles.stepType}>{step.type}</Text>
                  {step.description && (
                    <Text style={styles.stepDescription}>{step.description}</Text>
                  )}
                </View>
                <View style={styles.stepActions}>
                  <TouchableOpacity
                    style={styles.stepActionButton}
                    onPress={() => handleEditStep(step.id)}
                  >
                    <Ionicons name="create" size={16} color="#007AFF" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.stepActionButton}
                    onPress={() => handleRemoveStep(step.id)}
                  >
                    <Ionicons name="trash" size={16} color="#F44336" />
                  </TouchableOpacity>
                </View>
              </View>
              
              {index < workflow.steps.length - 1 && (
                <View style={styles.stepConnector}>
                  <Ionicons name="arrow-down" size={16} color="#BDBDBD" />
                </View>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const renderSettings = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Workflow Settings</Text>
      
      <View style={styles.settingItem}>
        <View style={styles.settingContent}>
          <Text style={styles.settingLabel}>Enable Workflow</Text>
          <Text style={styles.settingDescription}>
            Allow this workflow to be executed
          </Text>
        </View>
        <Switch
          value={workflow.settings.enabled}
          onValueChange={(value) => 
            setWorkflow(prev => ({
              ...prev,
              settings: { ...prev.settings, enabled: value }
            }))
          }
        />
      </View>

      <View style={styles.settingItem}>
        <View style={styles.settingContent}>
          <Text style={styles.settingLabel}>Notifications</Text>
          <Text style={styles.settingDescription}>
            Send notifications on workflow completion
          </Text>
        </View>
        <Switch
          value={workflow.settings.notification_enabled}
          onValueChange={(value) => 
            setWorkflow(prev => ({
              ...prev,
              settings: { ...prev.settings, notification_enabled: value }
            }))
          }
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Max Execution Time (seconds)</Text>
        <TextInput
          style={styles.input}
          placeholder="300"
          value={workflow.settings.max_execution_time?.toString()}
          onChangeText={(text) => 
            setWorkflow(prev => ({
              ...prev,
              settings: { 
                ...prev.settings, 
                max_execution_time: parseInt(text) || 300 
              }
            }))
          }
          keyboardType="numeric"
        />
      </View>
    </View>
  );

  const renderStepTypeModal = () => (
    <Modal
      visible={stepModalVisible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Add Workflow Step</Text>
          <TouchableOpacity onPress={() => setStepModalVisible(false)}>
            <Ionicons name="close" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <Text style={styles.modalSubtitle}>
            Choose the type of step to add to your workflow
          </Text>
          
          {stepTypes
            .filter(type => type.mobileOptimized)
            .map((stepType) => (
              <TouchableOpacity
                key={stepType.id}
                style={styles.stepTypeCard}
                onPress={() => handleAddStep(stepType)}
              >
                <View style={[styles.stepTypeIcon, { backgroundColor: stepType.color + '20' }]}>
                  <Ionicons name={stepType.icon} size={24} color={stepType.color} />
                </View>
                <View style={styles.stepTypeContent}>
                  <Text style={styles.stepTypeName}>{stepType.name}</Text>
                  <Text style={styles.stepTypeDescription}>{stepType.description}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#BDBDBD" />
              </TouchableOpacity>
            ))}
        </ScrollView>
      </View>
    </Modal>
  );

  const renderTemplateModal = () => (
    <Modal
      visible={showTemplates}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Choose Template</Text>
          <TouchableOpacity onPress={() => setShowTemplates(false)}>
            <Ionicons name="close" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <Text style={styles.modalSubtitle}>
            Start with a pre-built template or create from scratch
          </Text>
          
          <TouchableOpacity
            style={styles.templateCard}
            onPress={() => setShowTemplates(false)}
          >
            <View style={styles.templateIcon}>
              <Ionicons name="create" size={24} color="#007AFF" />
            </View>
            <View style={styles.templateContent}>
              <Text style={styles.templateName}>Start from Scratch</Text>
              <Text style={styles.templateDescription}>
                Create a custom workflow from the beginning
              </Text>
            </View>
          </TouchableOpacity>

          {templates.map((template) => (
            <TouchableOpacity
              key={template.id}
              style={styles.templateCard}
              onPress={() => handleUseTemplate(template)}
            >
              <View style={styles.templateIcon}>
                <Ionicons name="library" size={24} color="#4CAF50" />
              </View>
              <View style={styles.templateContent}>
                <Text style={styles.templateName}>{template.name}</Text>
                <Text style={styles.templateDescription}>{template.description}</Text>
                <Text style={styles.templateMeta}>
                  {template.steps} steps • {template.category}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );

  const getStepIcon = (stepType) => {
    const icons = {
      trigger: 'play-circle',
      action: 'flash',
      condition: 'git-branch',
      notification: 'notifications',
      delay: 'time',
      data_processing: 'analytics'
    };
    return icons[stepType] || 'help-circle';
  };

  const getStepColor = (stepType) => {
    const colors = {
      trigger: '#4CAF50',
      action: '#2196F3',
      condition: '#FF9800',
      notification: '#9C27B0',
      delay: '#607D8B',
      data_processing: '#795548'
    };
    return colors[stepType] || '#666';
  };

  if (loading && isEditing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading workflow...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderBasicInfo()}
        {renderWorkflowSteps()}
        {renderSettings()}
      </ScrollView>

      {renderStepTypeModal()}
      {renderTemplateModal()}
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
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  saveButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 12,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  addStepButton: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
  },
  addStepText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#666',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  stepsContainer: {
    paddingVertical: 8,
  },
  stepContainer: {
    marginBottom: 8,
  },
  stepCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  stepIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
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
  stepType: {
    fontSize: 12,
    color: '#666',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: '#666',
  },
  stepActions: {
    flexDirection: 'row',
  },
  stepActionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  stepConnector: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    lineHeight: 22,
  },
  stepTypeCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  stepTypeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepTypeContent: {
    flex: 1,
  },
  stepTypeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  stepTypeDescription: {
    fontSize: 14,
    color: '#666',
  },
  templateCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  templateIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  templateContent: {
    flex: 1,
  },
  templateName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  templateDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  templateMeta: {
    fontSize: 12,
    color: '#999',
  },
});