import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/Dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
  Plus, Save, Play, Pause, Trash2, Settings, 
  Clock, Zap, AlertCircle, CheckCircle, Edit3,
  Calendar, Webhook, Database, Mail, Bell
} from 'lucide-react';
import { 
  workflowAutomationApi, 
  AutomationRule, 
  WorkflowTemplate, 
  CreateAutomationRuleRequest,
  WorkflowCondition 
} from '../../services/api/workflowAutomation';

interface RuleConfigurationProps {
  onRuleCreated?: (rule: AutomationRule) => void;
  onRuleUpdated?: (rule: AutomationRule) => void;
  editingRule?: AutomationRule | null;
}

const TRIGGER_TYPES = [
  { 
    value: 'event_based', 
    label: 'Event Based', 
    icon: <Zap className="h-4 w-4" />, 
    description: 'Trigger when specific events occur',
    configFields: ['event_type', 'event_source']
  },
  { 
    value: 'scheduled', 
    label: 'Scheduled', 
    icon: <Clock className="h-4 w-4" />, 
    description: 'Trigger at specific times or intervals',
    configFields: ['cron_expression', 'timezone']
  },
  { 
    value: 'conditional', 
    label: 'Conditional', 
    icon: <AlertCircle className="h-4 w-4" />, 
    description: 'Trigger when conditions are met',
    configFields: ['condition_expression', 'check_interval']
  },
  { 
    value: 'webhook', 
    label: 'Webhook', 
    icon: <Webhook className="h-4 w-4" />, 
    description: 'Trigger via HTTP webhook',
    configFields: ['webhook_url', 'secret_key', 'allowed_ips']
  },
  { 
    value: 'api_call', 
    label: 'API Call', 
    icon: <Database className="h-4 w-4" />, 
    description: 'Trigger via API endpoint',
    configFields: ['api_endpoint', 'method', 'headers']
  },
  { 
    value: 'manual', 
    label: 'Manual', 
    icon: <Play className="h-4 w-4" />, 
    description: 'Trigger manually by users',
    configFields: ['allowed_users', 'require_confirmation']
  }
];

const CONDITION_OPERATORS = [
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Not Equals' },
  { value: 'greater_than', label: 'Greater Than' },
  { value: 'less_than', label: 'Less Than' },
  { value: 'contains', label: 'Contains' },
  { value: 'not_contains', label: 'Does Not Contain' }
];

export const RuleConfiguration: React.FC<RuleConfigurationProps> = ({
  onRuleCreated,
  onRuleUpdated,
  editingRule
}) => {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [selectedRule, setSelectedRule] = useState<AutomationRule | null>(editingRule || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Form states
  const [ruleForm, setRuleForm] = useState({
    name: '',
    description: '',
    trigger_type: 'event_based',
    workflow_template_id: 0,
    priority: 5,
    rate_limit: 100,
    is_active: true
  });

  const [triggerConfig, setTriggerConfig] = useState<Record<string, any>>({});
  const [conditions, setConditions] = useState<WorkflowCondition[]>([]);
  const [actionConfig, setActionConfig] = useState<Record<string, any>>({});

  useEffect(() => {
    loadRules();
    loadTemplates();
  }, []);

  useEffect(() => {
    if (editingRule) {
      setSelectedRule(editingRule);
      populateFormFromRule(editingRule);
    }
  }, [editingRule]);

  const loadRules = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await workflowAutomationApi.getAutomationRules();
      setRules(data);
    } catch (err) {
      setError('Failed to load automation rules');
      console.error('Error loading rules:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const data = await workflowAutomationApi.getWorkflowTemplates({ is_active: true });
      setTemplates(data);
    } catch (err) {
      console.error('Error loading templates:', err);
    }
  };

  const populateFormFromRule = (rule: AutomationRule) => {
    setRuleForm({
      name: rule.name,
      description: rule.description || '',
      trigger_type: rule.trigger_type,
      workflow_template_id: rule.workflow_template_id,
      priority: rule.priority,
      rate_limit: rule.rate_limit,
      is_active: rule.is_active
    });
    setTriggerConfig(rule.trigger_config);
    setConditions(rule.conditions);
    setActionConfig(rule.action_config);
  };

  const resetForm = () => {
    setRuleForm({
      name: '',
      description: '',
      trigger_type: 'event_based',
      workflow_template_id: 0,
      priority: 5,
      rate_limit: 100,
      is_active: true
    });
    setTriggerConfig({});
    setConditions([]);
    setActionConfig({});
    setSelectedRule(null);
  };

  const handleCreateRule = async () => {
    if (!ruleForm.name.trim()) {
      setError('Rule name is required');
      return;
    }

    if (!ruleForm.workflow_template_id) {
      setError('Workflow template is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const ruleData: CreateAutomationRuleRequest = {
        ...ruleForm,
        trigger_config: triggerConfig,
        conditions,
        action_config: actionConfig
      };

      let result: AutomationRule;
      if (selectedRule) {
        result = await workflowAutomationApi.updateAutomationRule(selectedRule.id, ruleData);
        onRuleUpdated?.(result);
      } else {
        result = await workflowAutomationApi.createAutomationRule(ruleData);
        onRuleCreated?.(result);
      }

      setSelectedRule(result);
      setShowCreateDialog(false);
      await loadRules();
    } catch (err) {
      setError(`Failed to ${selectedRule ? 'update' : 'create'} rule: ${err}`);
      console.error('Error saving rule:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRule = async (ruleId: number) => {
    if (!confirm('Are you sure you want to delete this automation rule?')) return;

    try {
      await workflowAutomationApi.deleteAutomationRule(ruleId);
      await loadRules();
      if (selectedRule?.id === ruleId) {
        setSelectedRule(null);
      }
    } catch (err) {
      setError('Failed to delete rule');
      console.error('Error deleting rule:', err);
    }
  };

  const handleToggleRule = async (rule: AutomationRule) => {
    try {
      const updatedRule = await workflowAutomationApi.updateAutomationRule(rule.id, {
        is_active: !rule.is_active
      });
      await loadRules();
    } catch (err) {
      setError('Failed to toggle rule status');
      console.error('Error toggling rule:', err);
    }
  };

  const handleTestRule = async (ruleId: number) => {
    try {
      const result = await workflowAutomationApi.triggerAutomationRule(ruleId, {
        test_mode: true,
        test_data: {}
      });
      alert(`Rule test triggered successfully: ${result.message}`);
    } catch (err) {
      setError('Failed to test rule');
      console.error('Error testing rule:', err);
    }
  };

  const addCondition = () => {
    setConditions(prev => [...prev, {
      field: '',
      operator: 'equals',
      value: ''
    }]);
  };

  const updateCondition = (index: number, field: keyof WorkflowCondition, value: any) => {
    setConditions(prev => prev.map((condition, i) => 
      i === index ? { ...condition, [field]: value } : condition
    ));
  };

  const removeCondition = (index: number) => {
    setConditions(prev => prev.filter((_, i) => i !== index));
  };

  const getTriggerTypeInfo = (type: string) => {
    return TRIGGER_TYPES.find(t => t.value === type) || TRIGGER_TYPES[0];
  };

  const renderTriggerConfig = () => {
    const triggerType = getTriggerTypeInfo(ruleForm.trigger_type);
    
    return (
      <div className="space-y-4">
        <h4 className="font-medium">Trigger Configuration</h4>
        {triggerType.configFields.map(field => (
          <div key={field}>
            <label className="block text-sm font-medium mb-2">
              {field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </label>
            <Input
              value={triggerConfig[field] || ''}
              onChange={(e) => setTriggerConfig(prev => ({ ...prev, [field]: e.target.value }))}
              placeholder={`Enter ${field.replace('_', ' ')}`}
            />
          </div>
        ))}
      </div>
    );
  };

  const renderConditions = () => {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="font-medium">Conditions</h4>
          <Button variant="outline" size="sm" onClick={addCondition}>
            <Plus className="mr-2 h-4 w-4" />
            Add Condition
          </Button>
        </div>
        
        {conditions.map((condition, index) => (
          <div key={index} className="border rounded-lg p-4">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Field</label>
                <Input
                  value={condition.field}
                  onChange={(e) => updateCondition(index, 'field', e.target.value)}
                  placeholder="Field name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Operator</label>
                <select
                  value={condition.operator}
                  onChange={(e) => updateCondition(index, 'operator', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {CONDITION_OPERATORS.map(op => (
                    <option key={op.value} value={op.value}>
                      {op.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Value</label>
                <Input
                  value={condition.value}
                  onChange={(e) => updateCondition(index, 'value', e.target.value)}
                  placeholder="Comparison value"
                />
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeCondition(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
        
        {conditions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No conditions added. Click "Add Condition" to create conditional logic.
          </div>
        )}
      </div>
    );
  };

  if (isLoading && rules.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading automation rules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Automation Rules</h1>
          <p className="text-gray-600">Configure triggers and conditions for automated workflows</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => loadRules()}>
            <Settings className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="mr-2 h-4 w-4" />
                New Rule
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {selectedRule ? 'Edit Automation Rule' : 'Create New Automation Rule'}
                </DialogTitle>
              </DialogHeader>
              
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="trigger">Trigger</TabsTrigger>
                  <TabsTrigger value="conditions">Conditions</TabsTrigger>
                  <TabsTrigger value="action">Action</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Rule Name *</label>
                      <Input
                        value={ruleForm.name}
                        onChange={(e) => setRuleForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Auto-assign urgent tickets"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Workflow Template *</label>
                      <select
                        value={ruleForm.workflow_template_id}
                        onChange={(e) => setRuleForm(prev => ({ ...prev, workflow_template_id: parseInt(e.target.value) }))}
                        className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        <option value={0}>Select a template</option>
                        {templates.map(template => (
                          <option key={template.id} value={template.id}>
                            {template.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                      value={ruleForm.description}
                      onChange={(e) => setRuleForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe when and how this rule should trigger..."
                      rows={3}
                      className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Priority (1-10)</label>
                      <Input
                        type="number"
                        value={ruleForm.priority}
                        onChange={(e) => setRuleForm(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                        min="1"
                        max="10"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Rate Limit (per hour)</label>
                      <Input
                        type="number"
                        value={ruleForm.rate_limit}
                        onChange={(e) => setRuleForm(prev => ({ ...prev, rate_limit: parseInt(e.target.value) }))}
                        min="1"
                      />
                    </div>
                    <div className="flex items-center space-x-2 pt-6">
                      <input
                        type="checkbox"
                        checked={ruleForm.is_active}
                        onChange={(e) => setRuleForm(prev => ({ ...prev, is_active: e.target.checked }))}
                      />
                      <span className="text-sm">Active Rule</span>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="trigger" className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Trigger Type</label>
                    <div className="grid grid-cols-2 gap-4">
                      {TRIGGER_TYPES.map(type => (
                        <div
                          key={type.value}
                          className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                            ruleForm.trigger_type === type.value
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setRuleForm(prev => ({ ...prev, trigger_type: type.value }))}
                        >
                          <div className="flex items-center space-x-3">
                            {type.icon}
                            <div>
                              <h4 className="font-medium">{type.label}</h4>
                              <p className="text-sm text-gray-600">{type.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {renderTriggerConfig()}
                </TabsContent>

                <TabsContent value="conditions">
                  {renderConditions()}
                </TabsContent>

                <TabsContent value="action" className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-4">Action Configuration</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Input Parameters</label>
                        <textarea
                          value={JSON.stringify(actionConfig, null, 2)}
                          onChange={(e) => {
                            try {
                              const config = JSON.parse(e.target.value);
                              setActionConfig(config);
                            } catch {
                              // Invalid JSON, ignore
                            }
                          }}
                          placeholder='{"parameter_name": "value"}'
                          rows={6}
                          className="flex min-h-[150px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-mono placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span className="text-red-800">{error}</span>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateRule} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {selectedRule ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {selectedRule ? 'Update Rule' : 'Create Rule'}
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {error && !showCreateDialog && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rules.map(rule => {
          const triggerType = getTriggerTypeInfo(rule.trigger_type);
          return (
            <Card key={rule.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{rule.name}</CardTitle>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="outline" icon={triggerType.icon} onRemove={() => {}}>
                        {triggerType.label}
                      </Badge>
                      <Badge 
                        variant={rule.is_active ? 'success' : 'secondary'}
                        icon={rule.is_active ? <CheckCircle className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
                        onRemove={() => {}}
                      >
                        {rule.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleRule(rule)}
                    >
                      {rule.is_active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedRule(rule);
                        populateFormFromRule(rule);
                        setShowCreateDialog(true);
                      }}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {rule.description || 'No description provided'}
                </p>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Priority:</span>
                    <span className="font-medium">{rule.priority}/10</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Rate Limit:</span>
                    <span className="font-medium">{rule.rate_limit}/hour</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Success Rate:</span>
                    <span className="font-medium">{rule.success_rate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Executions:</span>
                    <span className="font-medium">{rule.total_executions}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTestRule(rule.id)}
                    disabled={!rule.is_active}
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Test
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteRule(rule.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {rules.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Automation Rules</h3>
          <p className="text-gray-600 mb-4">Create your first automation rule to get started.</p>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Rule
          </Button>
        </div>
      )}
    </div>
  );
};

export default RuleConfiguration;