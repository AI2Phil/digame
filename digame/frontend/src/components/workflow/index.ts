// Workflow Automation Components
export { default as TemplateBuilder } from './TemplateBuilder';
export { default as WorkflowVisualDesigner } from './WorkflowVisualDesigner';
export { default as RuleConfiguration } from './RuleConfiguration';
export { default as MonitoringDashboard } from './MonitoringDashboard';

// Re-export types from API service
export type {
  WorkflowTemplate,
  WorkflowDefinition,
  WorkflowStep,
  WorkflowCondition,
  WorkflowInstance,
  WorkflowStepExecution,
  AutomationRule,
  WorkflowAction,
  WorkflowIntegration,
  WorkflowAnalytics,
  CreateWorkflowTemplateRequest,
  CreateWorkflowInstanceRequest,
  CreateAutomationRuleRequest,
  CreateWorkflowActionRequest
} from '../../services/api/workflowAutomation';