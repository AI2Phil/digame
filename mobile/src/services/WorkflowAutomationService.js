/**
 * Workflow Automation Service
 * Mobile workflow management with AI-powered task prioritization
 * Supports workflow creation, execution monitoring, and intelligent automation
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const API_BASE_URL = 'http://localhost:8000';

class WorkflowAutomationService {
  constructor() {
    this.workflowCache = new Map();
    this.executionMonitor = new WorkflowExecutionMonitor();
    this.taskPrioritizer = new AITaskPrioritizer();
    this.workflowBuilder = new MobileWorkflowBuilder();
    
    // Workflow execution states
    this.executionStates = {
      PENDING: 'pending',
      RUNNING: 'running',
      COMPLETED: 'completed',
      FAILED: 'failed',
      PAUSED: 'paused',
      CANCELLED: 'cancelled'
    };

    // Task priorities
    this.taskPriorities = {
      CRITICAL: { level: 1, color: '#F44336', label: 'Critical' },
      HIGH: { level: 2, color: '#FF9800', label: 'High' },
      MEDIUM: { level: 3, color: '#FFC107', label: 'Medium' },
      LOW: { level: 4, color: '#4CAF50', label: 'Low' }
    };
  }

  // ==================== WORKFLOW MANAGEMENT ====================

  /**
   * Get all workflows for the user
   */
  async getWorkflows(filters = {}) {
    try {
      const token = await this.getAuthToken();
      const queryParams = new URLSearchParams(filters).toString();
      
      const response = await fetch(`${API_BASE_URL}/workflows?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch workflows');
      }

      const workflows = await response.json();
      
      // Cache workflows locally
      workflows.forEach(workflow => {
        this.workflowCache.set(workflow.id, workflow);
      });

      return workflows;
    } catch (error) {
      console.error('Failed to get workflows:', error);
      // Return cached workflows if available
      return Array.from(this.workflowCache.values());
    }
  }

  /**
   * Create a new workflow
   */
  async createWorkflow(workflowData) {
    try {
      const token = await this.getAuthToken();
      
      const response = await fetch(`${API_BASE_URL}/workflows`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...workflowData,
          created_via: 'mobile',
          device_info: await this.getDeviceInfo()
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create workflow');
      }

      const workflow = await response.json();
      this.workflowCache.set(workflow.id, workflow);

      await this.logWorkflowEvent('workflow_created', workflow.id, {
        name: workflow.name,
        steps: workflow.steps.length
      });

      return workflow;
    } catch (error) {
      console.error('Failed to create workflow:', error);
      throw error;
    }
  }

  /**
   * Update an existing workflow
   */
  async updateWorkflow(workflowId, updates) {
    try {
      const token = await this.getAuthToken();
      
      const response = await fetch(`${API_BASE_URL}/workflows/${workflowId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...updates,
          updated_via: 'mobile'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update workflow');
      }

      const workflow = await response.json();
      this.workflowCache.set(workflow.id, workflow);

      await this.logWorkflowEvent('workflow_updated', workflow.id, updates);

      return workflow;
    } catch (error) {
      console.error('Failed to update workflow:', error);
      throw error;
    }
  }

  /**
   * Delete a workflow
   */
  async deleteWorkflow(workflowId) {
    try {
      const token = await this.getAuthToken();
      
      const response = await fetch(`${API_BASE_URL}/workflows/${workflowId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete workflow');
      }

      this.workflowCache.delete(workflowId);
      await this.logWorkflowEvent('workflow_deleted', workflowId);

      return true;
    } catch (error) {
      console.error('Failed to delete workflow:', error);
      throw error;
    }
  }

  // ==================== WORKFLOW EXECUTION ====================

  /**
   * Execute a workflow
   */
  async executeWorkflow(workflowId, parameters = {}) {
    try {
      const token = await this.getAuthToken();
      
      const response = await fetch(`${API_BASE_URL}/workflows/${workflowId}/execute`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          parameters,
          execution_context: {
            platform: 'mobile',
            device_info: await this.getDeviceInfo(),
            timestamp: new Date().toISOString()
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to execute workflow');
      }

      const execution = await response.json();
      
      // Start monitoring execution
      this.executionMonitor.startMonitoring(execution.id);

      await this.logWorkflowEvent('workflow_executed', workflowId, {
        execution_id: execution.id,
        parameters
      });

      return execution;
    } catch (error) {
      console.error('Failed to execute workflow:', error);
      throw error;
    }
  }

  /**
   * Get workflow execution status
   */
  async getExecutionStatus(executionId) {
    try {
      const token = await this.getAuthToken();
      
      const response = await fetch(`${API_BASE_URL}/workflows/executions/${executionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get execution status');
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get execution status:', error);
      throw error;
    }
  }

  /**
   * Cancel workflow execution
   */
  async cancelExecution(executionId) {
    try {
      const token = await this.getAuthToken();
      
      const response = await fetch(`${API_BASE_URL}/workflows/executions/${executionId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to cancel execution');
      }

      this.executionMonitor.stopMonitoring(executionId);
      await this.logWorkflowEvent('execution_cancelled', null, { execution_id: executionId });

      return await response.json();
    } catch (error) {
      console.error('Failed to cancel execution:', error);
      throw error;
    }
  }

  // ==================== AI TASK PRIORITIZATION ====================

  /**
   * Get AI-powered task recommendations
   */
  async getTaskRecommendations(context = {}) {
    try {
      const token = await this.getAuthToken();
      
      const response = await fetch(`${API_BASE_URL}/ai/task-recommendations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          context: {
            ...context,
            platform: 'mobile',
            user_activity: await this.getUserActivityContext(),
            current_workflows: Array.from(this.workflowCache.values())
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get task recommendations');
      }

      const recommendations = await response.json();
      return this.taskPrioritizer.processRecommendations(recommendations);
    } catch (error) {
      console.error('Failed to get task recommendations:', error);
      return this.taskPrioritizer.getFallbackRecommendations();
    }
  }

  /**
   * Prioritize tasks using AI
   */
  async prioritizeTasks(tasks) {
    try {
      const token = await this.getAuthToken();
      
      const response = await fetch(`${API_BASE_URL}/ai/prioritize-tasks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tasks,
          context: {
            user_preferences: await this.getUserPreferences(),
            current_workload: await this.getCurrentWorkload(),
            deadlines: await this.getUpcomingDeadlines()
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to prioritize tasks');
      }

      const prioritizedTasks = await response.json();
      return this.taskPrioritizer.enhancePriorities(prioritizedTasks);
    } catch (error) {
      console.error('Failed to prioritize tasks:', error);
      return this.taskPrioritizer.fallbackPrioritization(tasks);
    }
  }

  // ==================== WORKFLOW TEMPLATES ====================

  /**
   * Get workflow templates
   */
  async getWorkflowTemplates(category = null) {
    try {
      const token = await this.getAuthToken();
      const queryParams = category ? `?category=${category}` : '';
      
      const response = await fetch(`${API_BASE_URL}/workflows/templates${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get workflow templates');
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get workflow templates:', error);
      return this.getBuiltInTemplates();
    }
  }

  /**
   * Create workflow from template
   */
  async createFromTemplate(templateId, customizations = {}) {
    try {
      const token = await this.getAuthToken();
      
      const response = await fetch(`${API_BASE_URL}/workflows/templates/${templateId}/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customizations,
          created_via: 'mobile_template'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create workflow from template');
      }

      const workflow = await response.json();
      this.workflowCache.set(workflow.id, workflow);

      await this.logWorkflowEvent('workflow_created_from_template', workflow.id, {
        template_id: templateId,
        customizations
      });

      return workflow;
    } catch (error) {
      console.error('Failed to create workflow from template:', error);
      throw error;
    }
  }

  // ==================== WORKFLOW ANALYTICS ====================

  /**
   * Get workflow analytics
   */
  async getWorkflowAnalytics(timeRange = '30d') {
    try {
      const token = await this.getAuthToken();
      
      const response = await fetch(`${API_BASE_URL}/workflows/analytics?range=${timeRange}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get workflow analytics');
      }

      const analytics = await response.json();
      return this.enhanceAnalyticsForMobile(analytics);
    } catch (error) {
      console.error('Failed to get workflow analytics:', error);
      return this.getDefaultAnalytics();
    }
  }

  /**
   * Get execution metrics
   */
  async getExecutionMetrics(workflowId = null) {
    try {
      const token = await this.getAuthToken();
      const queryParams = workflowId ? `?workflow_id=${workflowId}` : '';
      
      const response = await fetch(`${API_BASE_URL}/workflows/metrics${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get execution metrics');
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get execution metrics:', error);
      return this.getDefaultMetrics();
    }
  }

  // ==================== UTILITY METHODS ====================

  async getAuthToken() {
    return await AsyncStorage.getItem('authToken');
  }

  async getDeviceInfo() {
    // Would use expo-device in production
    return {
      platform: 'mobile',
      os: 'ios', // or android
      version: '1.0.0'
    };
  }

  async getUserActivityContext() {
    try {
      const recentActivity = await AsyncStorage.getItem('recent_activity');
      return recentActivity ? JSON.parse(recentActivity) : {};
    } catch (error) {
      return {};
    }
  }

  async getUserPreferences() {
    try {
      const preferences = await AsyncStorage.getItem('user_preferences');
      return preferences ? JSON.parse(preferences) : {};
    } catch (error) {
      return {};
    }
  }

  async getCurrentWorkload() {
    const activeWorkflows = Array.from(this.workflowCache.values())
      .filter(w => w.status === 'active');
    
    return {
      active_workflows: activeWorkflows.length,
      pending_tasks: activeWorkflows.reduce((sum, w) => sum + (w.pending_tasks || 0), 0)
    };
  }

  async getUpcomingDeadlines() {
    const workflows = Array.from(this.workflowCache.values());
    const deadlines = workflows
      .filter(w => w.deadline)
      .map(w => ({
        workflow_id: w.id,
        deadline: w.deadline,
        priority: w.priority
      }))
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    
    return deadlines.slice(0, 10); // Next 10 deadlines
  }

  getBuiltInTemplates() {
    return [
      {
        id: 'data_processing',
        name: 'Data Processing Pipeline',
        description: 'Automated data collection and processing',
        category: 'data',
        steps: 3
      },
      {
        id: 'report_generation',
        name: 'Report Generation',
        description: 'Automated report creation and distribution',
        category: 'reporting',
        steps: 4
      },
      {
        id: 'notification_workflow',
        name: 'Notification System',
        description: 'Automated notification and alert system',
        category: 'communication',
        steps: 2
      }
    ];
  }

  enhanceAnalyticsForMobile(analytics) {
    return {
      ...analytics,
      mobile_optimized: true,
      summary_cards: this.generateSummaryCards(analytics),
      quick_actions: this.generateQuickActions(analytics)
    };
  }

  generateSummaryCards(analytics) {
    return [
      {
        title: 'Total Workflows',
        value: analytics.total_workflows || 0,
        icon: 'git-branch',
        color: '#007AFF'
      },
      {
        title: 'Active Executions',
        value: analytics.active_executions || 0,
        icon: 'play-circle',
        color: '#4CAF50'
      },
      {
        title: 'Success Rate',
        value: `${analytics.success_rate || 0}%`,
        icon: 'checkmark-circle',
        color: '#FF9800'
      },
      {
        title: 'Time Saved',
        value: `${analytics.time_saved || 0}h`,
        icon: 'time',
        color: '#9C27B0'
      }
    ];
  }

  generateQuickActions(analytics) {
    return [
      { id: 'create_workflow', title: 'Create Workflow', icon: 'add-circle' },
      { id: 'view_templates', title: 'Browse Templates', icon: 'library' },
      { id: 'monitor_executions', title: 'Monitor Executions', icon: 'pulse' },
      { id: 'view_analytics', title: 'View Analytics', icon: 'analytics' }
    ];
  }

  getDefaultAnalytics() {
    return {
      total_workflows: 0,
      active_executions: 0,
      success_rate: 0,
      time_saved: 0,
      mobile_optimized: true,
      summary_cards: this.generateSummaryCards({}),
      quick_actions: this.generateQuickActions({})
    };
  }

  getDefaultMetrics() {
    return {
      execution_count: 0,
      average_duration: 0,
      success_rate: 0,
      error_rate: 0
    };
  }

  async logWorkflowEvent(event_type, workflow_id, details = {}) {
    try {
      const logEntry = {
        event_type,
        workflow_id,
        details,
        timestamp: new Date().toISOString(),
        platform: 'mobile'
      };

      // Store locally
      const existingLogs = await AsyncStorage.getItem('workflow_logs');
      const logs = existingLogs ? JSON.parse(existingLogs) : [];
      logs.push(logEntry);
      
      // Keep only last 100 logs
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
      }
      
      await AsyncStorage.setItem('workflow_logs', JSON.stringify(logs));

      // Send to server
      try {
        const token = await this.getAuthToken();
        if (token) {
          await fetch(`${API_BASE_URL}/workflows/logs`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(logEntry),
          });
        }
      } catch (serverError) {
        console.warn('Failed to send workflow log to server:', serverError);
      }
    } catch (error) {
      console.error('Failed to log workflow event:', error);
    }
  }
}

// ==================== WORKFLOW EXECUTION MONITOR ====================

class WorkflowExecutionMonitor {
  constructor() {
    this.activeMonitors = new Map();
    this.updateInterval = 5000; // 5 seconds
  }

  startMonitoring(executionId) {
    if (this.activeMonitors.has(executionId)) {
      return; // Already monitoring
    }

    const interval = setInterval(async () => {
      try {
        const status = await this.checkExecutionStatus(executionId);
        this.handleStatusUpdate(executionId, status);
        
        if (this.isTerminalState(status.state)) {
          this.stopMonitoring(executionId);
        }
      } catch (error) {
        console.error(`Failed to monitor execution ${executionId}:`, error);
      }
    }, this.updateInterval);

    this.activeMonitors.set(executionId, interval);
  }

  stopMonitoring(executionId) {
    const interval = this.activeMonitors.get(executionId);
    if (interval) {
      clearInterval(interval);
      this.activeMonitors.delete(executionId);
    }
  }

  async checkExecutionStatus(executionId) {
    // This would call the actual API
    return {
      id: executionId,
      state: 'running',
      progress: 50,
      current_step: 'processing_data',
      estimated_completion: new Date(Date.now() + 300000).toISOString()
    };
  }

  handleStatusUpdate(executionId, status) {
    // Emit status update event
    // In a real app, this would use EventEmitter or similar
    console.log(`Execution ${executionId} status:`, status);
  }

  isTerminalState(state) {
    return ['completed', 'failed', 'cancelled'].includes(state);
  }

  stopAllMonitoring() {
    this.activeMonitors.forEach((interval, executionId) => {
      clearInterval(interval);
    });
    this.activeMonitors.clear();
  }
}

// ==================== AI TASK PRIORITIZER ====================

class AITaskPrioritizer {
  constructor() {
    this.priorityWeights = {
      deadline: 0.3,
      importance: 0.25,
      effort: 0.2,
      dependencies: 0.15,
      user_preference: 0.1
    };
  }

  processRecommendations(recommendations) {
    return recommendations.map(rec => ({
      ...rec,
      priority_score: this.calculatePriorityScore(rec),
      mobile_optimized: true,
      quick_actions: this.generateTaskActions(rec)
    }));
  }

  enhancePriorities(tasks) {
    return tasks
      .map(task => ({
        ...task,
        priority_level: this.determinePriorityLevel(task.priority_score),
        estimated_completion: this.estimateCompletion(task),
        mobile_friendly: this.isMobileFriendly(task)
      }))
      .sort((a, b) => b.priority_score - a.priority_score);
  }

  calculatePriorityScore(task) {
    let score = 0;
    
    // Deadline urgency
    if (task.deadline) {
      const daysUntilDeadline = this.getDaysUntilDeadline(task.deadline);
      score += this.priorityWeights.deadline * (10 - Math.min(daysUntilDeadline, 10)) / 10;
    }
    
    // Importance level
    score += this.priorityWeights.importance * (task.importance || 5) / 10;
    
    // Effort required (inverse - less effort = higher priority)
    score += this.priorityWeights.effort * (10 - (task.effort || 5)) / 10;
    
    // Dependencies
    score += this.priorityWeights.dependencies * (task.blocking_others ? 1 : 0.5);
    
    // User preference
    score += this.priorityWeights.user_preference * (task.user_rating || 5) / 10;
    
    return Math.round(score * 100) / 100;
  }

  determinePriorityLevel(score) {
    if (score >= 0.8) return 'CRITICAL';
    if (score >= 0.6) return 'HIGH';
    if (score >= 0.4) return 'MEDIUM';
    return 'LOW';
  }

  getDaysUntilDeadline(deadline) {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  estimateCompletion(task) {
    const baseTime = task.estimated_duration || 60; // minutes
    const complexity = task.complexity || 1;
    return Math.round(baseTime * complexity);
  }

  isMobileFriendly(task) {
    const mobileFriendlyTypes = ['review', 'approve', 'notify', 'simple_data_entry'];
    return mobileFriendlyTypes.includes(task.type);
  }

  generateTaskActions(task) {
    const actions = ['view_details'];
    
    if (task.can_execute) actions.push('execute');
    if (task.can_edit) actions.push('edit');
    if (task.can_delegate) actions.push('delegate');
    
    return actions;
  }

  getFallbackRecommendations() {
    return [
      {
        id: 'create_first_workflow',
        title: 'Create Your First Workflow',
        description: 'Get started with workflow automation',
        priority_score: 0.8,
        type: 'onboarding'
      },
      {
        id: 'explore_templates',
        title: 'Explore Workflow Templates',
        description: 'Browse pre-built workflow templates',
        priority_score: 0.6,
        type: 'discovery'
      }
    ];
  }

  fallbackPrioritization(tasks) {
    return tasks
      .map(task => ({
        ...task,
        priority_score: 0.5,
        priority_level: 'MEDIUM'
      }))
      .sort((a, b) => (a.created_at || 0) - (b.created_at || 0));
  }
}

// ==================== MOBILE WORKFLOW BUILDER ====================

class MobileWorkflowBuilder {
  constructor() {
    this.stepTypes = {
      TRIGGER: 'trigger',
      ACTION: 'action',
      CONDITION: 'condition',
      DELAY: 'delay',
      NOTIFICATION: 'notification'
    };

    this.mobileOptimizedSteps = [
      'data_collection',
      'simple_processing',
      'notification',
      'approval_request',
      'status_update'
    ];
  }

  createWorkflowTemplate(type) {
    const templates = {
      simple: {
        name: 'Simple Workflow',
        steps: [
          { type: this.stepTypes.TRIGGER, name: 'Start' },
          { type: this.stepTypes.ACTION, name: 'Process' },
          { type: this.stepTypes.NOTIFICATION, name: 'Notify' }
        ]
      },
      approval: {
        name: 'Approval Workflow',
        steps: [
          { type: this.stepTypes.TRIGGER, name: 'Request' },
          { type: this.stepTypes.CONDITION, name: 'Check Criteria' },
          { type: this.stepTypes.ACTION, name: 'Approve/Reject' },
          { type: this.stepTypes.NOTIFICATION, name: 'Notify Result' }
        ]
      }
    };

    return templates[type] || templates.simple;
  }

  validateWorkflow(workflow) {
    const errors = [];

    if (!workflow.name || workflow.name.trim().length === 0) {
      errors.push('Workflow name is required');
    }

    if (!workflow.steps || workflow.steps.length === 0) {
      errors.push('Workflow must have at least one step');
    }

    if (workflow.steps && workflow.steps.length > 10) {
      errors.push('Mobile workflows are limited to 10 steps for optimal performance');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  optimizeForMobile(workflow) {
    return {
      ...workflow,
      mobile_optimized: true,
      max_execution_time: Math.min(workflow.max_execution_time || 300, 300), // 5 minutes max
      simplified_ui: true,
      touch_friendly: true
    };
  }
}

export default WorkflowAutomationService;