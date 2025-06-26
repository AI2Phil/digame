import { apiClient } from '../apiClient';

// ===== INTERFACES =====

export interface WorkflowTemplate {
  id: number;
  tenant_id: number;
  name: string;
  description?: string;
  category: string;
  version: string;
  workflow_definition: WorkflowDefinition;
  input_schema: Record<string, any>;
  output_schema: Record<string, any>;
  complexity_level: 'simple' | 'medium' | 'complex';
  estimated_duration?: number;
  tags: string[];
  is_public: boolean;
  is_active: boolean;
  requires_approval: boolean;
  usage_count: number;
  success_rate: number;
  avg_execution_time: number;
  created_at: string;
  updated_at?: string;
  created_by: number;
}

export interface WorkflowDefinition {
  start_step: string;
  steps: WorkflowStep[];
  variables?: Record<string, any>;
  settings?: Record<string, any>;
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'action' | 'condition' | 'loop' | 'parallel' | 'human_task' | 'integration' | 'approval' | 'notification';
  description?: string;
  config: Record<string, any>;
  position?: { x: number; y: number };
  connections?: string[];
  conditions?: WorkflowCondition[];
}

export interface WorkflowCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains';
  value: any;
  next_step?: string;
}

export interface WorkflowInstance {
  id: number;
  tenant_id: number;
  template_id: number;
  name: string;
  description?: string;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'failed' | 'cancelled';
  input_data: Record<string, any>;
  output_data: Record<string, any>;
  context_data: Record<string, any>;
  current_step_id?: string;
  progress_percentage: number;
  steps_completed: number;
  steps_total: number;
  execution_start_time?: string;
  execution_end_time?: string;
  execution_duration?: number;
  error_count: number;
  last_error?: string;
  retry_count: number;
  max_retries: number;
  triggered_by?: string;
  priority: number;
  created_at: string;
  updated_at?: string;
}

export interface WorkflowStepExecution {
  id: number;
  workflow_instance_id: number;
  step_id: string;
  step_name: string;
  step_type: string;
  step_config: Record<string, any>;
  input_data: Record<string, any>;
  output_data: Record<string, any>;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped' | 'waiting';
  execution_order: number;
  start_time?: string;
  end_time?: string;
  execution_duration?: number;
  error_message?: string;
  error_details?: Record<string, any>;
  retry_count: number;
  assigned_to?: number;
  due_date?: string;
  created_at: string;
  updated_at?: string;
}

export interface AutomationRule {
  id: number;
  tenant_id: number;
  name: string;
  description?: string;
  trigger_type: 'event_based' | 'scheduled' | 'conditional' | 'webhook' | 'api_call' | 'manual';
  trigger_config: Record<string, any>;
  conditions: WorkflowCondition[];
  workflow_template_id: number;
  action_config: Record<string, any>;
  is_active: boolean;
  priority: number;
  rate_limit: number;
  total_executions: number;
  successful_executions: number;
  failed_executions: number;
  last_execution?: string;
  avg_execution_time: number;
  success_rate: number;
  created_at: string;
  updated_at?: string;
  created_by: number;
}

export interface WorkflowAction {
  id: number;
  tenant_id: number;
  name: string;
  description?: string;
  category: string;
  action_type: string;
  config_schema: Record<string, any>;
  default_config: Record<string, any>;
  is_system_action: boolean;
  is_active: boolean;
  requires_auth: boolean;
  usage_count: number;
  success_rate: number;
  avg_execution_time: number;
  test_config: Record<string, any>;
  last_tested?: string;
  test_success: boolean;
  created_at: string;
  updated_at?: string;
  created_by?: number;
}

export interface WorkflowIntegration {
  id: number;
  tenant_id: number;
  name: string;
  description?: string;
  integration_type: string;
  connection_config: Record<string, any>;
  auth_config: Record<string, any>;
  is_active: boolean;
  timeout_seconds: number;
  retry_attempts: number;
  last_health_check?: string;
  health_status: 'healthy' | 'unhealthy' | 'unknown';
  health_details: Record<string, any>;
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  avg_response_time: number;
  created_at: string;
  updated_at?: string;
  created_by: number;
}

export interface WorkflowAnalytics {
  period: {
    start_date: string;
    end_date: string;
  };
  workflow_instances: {
    total: number;
    completed: number;
    failed: number;
    success_rate: number;
  };
  automation_rules: {
    total_executions: number;
    successful_executions: number;
    success_rate: number;
  };
  performance: {
    avg_execution_duration: number;
    avg_execution_duration_minutes: number;
  };
}

// ===== REQUEST/RESPONSE TYPES =====

export interface CreateWorkflowTemplateRequest {
  name: string;
  description?: string;
  category: string;
  version?: string;
  workflow_definition: WorkflowDefinition;
  input_schema?: Record<string, any>;
  output_schema?: Record<string, any>;
  estimated_duration?: number;
  tags?: string[];
  is_public?: boolean;
  requires_approval?: boolean;
}

export interface CreateWorkflowInstanceRequest {
  name: string;
  description?: string;
  input_data?: Record<string, any>;
  context_data?: Record<string, any>;
  priority?: number;
}

export interface CreateAutomationRuleRequest {
  name: string;
  description?: string;
  trigger_type: string;
  trigger_config: Record<string, any>;
  conditions?: WorkflowCondition[];
  workflow_template_id: number;
  action_config?: Record<string, any>;
  is_active?: boolean;
  priority?: number;
  rate_limit?: number;
}

export interface CreateWorkflowActionRequest {
  name: string;
  description?: string;
  category: string;
  action_type: string;
  config_schema: Record<string, any>;
  default_config?: Record<string, any>;
  is_system_action?: boolean;
  requires_auth?: boolean;
  test_config?: Record<string, any>;
}

// ===== API CLIENT =====

class WorkflowAutomationApi {
  private baseUrl = '/api/workflow-automation';

  // ===== WORKFLOW TEMPLATES =====
  
  async getWorkflowTemplates(params: {
    category?: string;
    is_active?: boolean;
    is_public?: boolean;
  } = {}): Promise<WorkflowTemplate[]> {
    const queryParams = new URLSearchParams();
    if (params.category) queryParams.append('category', params.category);
    if (params.is_active !== undefined) queryParams.append('is_active', params.is_active.toString());
    if (params.is_public !== undefined) queryParams.append('is_public', params.is_public.toString());
    
    const url = `${this.baseUrl}/templates${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return await apiClient.get<WorkflowTemplate[]>(url);
  }

  async getWorkflowTemplate(id: number): Promise<WorkflowTemplate> {
    return await apiClient.get<WorkflowTemplate>(`${this.baseUrl}/templates/${id}`);
  }

  async createWorkflowTemplate(template: CreateWorkflowTemplateRequest): Promise<WorkflowTemplate> {
    return await apiClient.post<WorkflowTemplate>(`${this.baseUrl}/templates`, template);
  }

  async updateWorkflowTemplate(id: number, template: Partial<CreateWorkflowTemplateRequest>): Promise<WorkflowTemplate> {
    return await apiClient.put<WorkflowTemplate>(`${this.baseUrl}/templates/${id}`, template);
  }

  async deleteWorkflowTemplate(id: number): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/templates/${id}`);
  }

  async initializeDefaultTemplates(): Promise<{ message: string }> {
    return await apiClient.post<{ message: string }>(`${this.baseUrl}/templates/1/initialize-defaults`);
  }

  // ===== WORKFLOW INSTANCES =====

  async getWorkflowInstances(params: {
    template_id?: number;
    status?: string;
  } = {}): Promise<WorkflowInstance[]> {
    const queryParams = new URLSearchParams();
    if (params.template_id) queryParams.append('template_id', params.template_id.toString());
    if (params.status) queryParams.append('status', params.status);
    
    const url = `${this.baseUrl}/instances${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return await apiClient.get<WorkflowInstance[]>(url);
  }

  async getWorkflowInstance(id: number): Promise<WorkflowInstance> {
    return await apiClient.get<WorkflowInstance>(`${this.baseUrl}/instances/${id}`);
  }

  async createWorkflowInstance(
    templateId: number,
    instance: CreateWorkflowInstanceRequest,
    triggeredBy: string = 'manual'
  ): Promise<WorkflowInstance> {
    const url = `${this.baseUrl}/templates/${templateId}/instances?triggered_by=${encodeURIComponent(triggeredBy)}`;
    return await apiClient.post<WorkflowInstance>(url, instance);
  }

  async executeWorkflowInstance(id: number): Promise<{ message: string; instance_id: number }> {
    return await apiClient.post<{ message: string; instance_id: number }>(`${this.baseUrl}/instances/${id}/execute`);
  }

  async getWorkflowInstanceSteps(id: number): Promise<WorkflowStepExecution[]> {
    return await apiClient.get<WorkflowStepExecution[]>(`${this.baseUrl}/instances/${id}/steps`);
  }

  // ===== AUTOMATION RULES =====

  async getAutomationRules(params: {
    trigger_type?: string;
    is_active?: boolean;
  } = {}): Promise<AutomationRule[]> {
    const queryParams = new URLSearchParams();
    if (params.trigger_type) queryParams.append('trigger_type', params.trigger_type);
    if (params.is_active !== undefined) queryParams.append('is_active', params.is_active.toString());
    
    const url = `${this.baseUrl}/automation-rules${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return await apiClient.get<AutomationRule[]>(url);
  }

  async getAutomationRule(id: number): Promise<AutomationRule> {
    return await apiClient.get<AutomationRule>(`${this.baseUrl}/automation-rules/${id}`);
  }

  async createAutomationRule(rule: CreateAutomationRuleRequest): Promise<AutomationRule> {
    return await apiClient.post<AutomationRule>(`${this.baseUrl}/automation-rules`, rule);
  }

  async updateAutomationRule(id: number, rule: Partial<CreateAutomationRuleRequest>): Promise<AutomationRule> {
    return await apiClient.put<AutomationRule>(`${this.baseUrl}/automation-rules/${id}`, rule);
  }

  async deleteAutomationRule(id: number): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/automation-rules/${id}`);
  }

  async triggerAutomationRule(id: number, triggerData: Record<string, any>): Promise<{ message: string; rule_id: number }> {
    return await apiClient.post<{ message: string; rule_id: number }>(`${this.baseUrl}/automation-rules/${id}/trigger`, triggerData);
  }

  // ===== WORKFLOW ACTIONS =====

  async getWorkflowActions(params: {
    category?: string;
    action_type?: string;
    is_active?: boolean;
  } = {}): Promise<WorkflowAction[]> {
    const queryParams = new URLSearchParams();
    if (params.category) queryParams.append('category', params.category);
    if (params.action_type) queryParams.append('action_type', params.action_type);
    if (params.is_active !== undefined) queryParams.append('is_active', params.is_active.toString());
    
    const url = `${this.baseUrl}/actions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return await apiClient.get<WorkflowAction[]>(url);
  }

  async getWorkflowAction(id: number): Promise<WorkflowAction> {
    return await apiClient.get<WorkflowAction>(`${this.baseUrl}/actions/${id}`);
  }

  async createWorkflowAction(action: CreateWorkflowActionRequest): Promise<WorkflowAction> {
    return await apiClient.post<WorkflowAction>(`${this.baseUrl}/actions`, action);
  }

  async updateWorkflowAction(id: number, action: Partial<CreateWorkflowActionRequest>): Promise<WorkflowAction> {
    return await apiClient.put<WorkflowAction>(`${this.baseUrl}/actions/${id}`, action);
  }

  async deleteWorkflowAction(id: number): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/actions/${id}`);
  }

  async testWorkflowAction(id: number, testConfig: Record<string, any>): Promise<{
    success: boolean;
    message: string;
    timestamp: string;
    [key: string]: any;
  }> {
    return await apiClient.post<{
      success: boolean;
      message: string;
      timestamp: string;
      [key: string]: any;
    }>(`${this.baseUrl}/actions/${id}/test`, testConfig);
  }

  // ===== ANALYTICS =====

  async getWorkflowAnalytics(params: {
    start_date?: string;
    end_date?: string;
  } = {}): Promise<WorkflowAnalytics> {
    const queryParams = new URLSearchParams();
    if (params.start_date) queryParams.append('start_date', params.start_date);
    if (params.end_date) queryParams.append('end_date', params.end_date);
    
    const url = `${this.baseUrl}/analytics${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return await apiClient.get<WorkflowAnalytics>(url);
  }

  // ===== HEALTH CHECK =====

  async getHealthStatus(): Promise<{
    status: string;
    service: string;
    timestamp: string;
    features: string[];
  }> {
    return await apiClient.get<{
      status: string;
      service: string;
      timestamp: string;
      features: string[];
    }>(`${this.baseUrl}/health`);
  }
}

export const workflowAutomationApi = new WorkflowAutomationApi();