import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/Dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { 
  Plus, Save, Play, Copy, Trash2, Settings, 
  FileText, Tag, Clock, Users, AlertCircle,
  CheckCircle, ArrowRight, Edit3, Eye
} from 'lucide-react';
import { workflowAutomationApi, WorkflowTemplate, WorkflowDefinition, WorkflowStep, CreateWorkflowTemplateRequest } from '../../services/api/workflowAutomation';
import { WorkflowVisualDesigner } from './WorkflowVisualDesigner';

interface TemplateBuilderProps {
  onTemplateCreated?: (template: WorkflowTemplate) => void;
  onTemplateUpdated?: (template: WorkflowTemplate) => void;
  editingTemplate?: WorkflowTemplate | null;
}

const WORKFLOW_CATEGORIES = [
  'approval', 'data_processing', 'notification', 'integration',
  'hr', 'finance', 'support', 'development', 'marketing', 'operations'
];

const STEP_TYPES = [
  { value: 'action', label: 'Action', icon: '⚡', description: 'Execute an action or operation' },
  { value: 'condition', label: 'Condition', icon: '🔀', description: 'Make a decision based on conditions' },
  { value: 'human_task', label: 'Human Task', icon: '👤', description: 'Assign task to a person' },
  { value: 'approval', label: 'Approval', icon: '✅', description: 'Require approval from someone' },
  { value: 'notification', label: 'Notification', icon: '📧', description: 'Send notification or message' },
  { value: 'integration', label: 'Integration', icon: '🔗', description: 'Connect to external system' },
  { value: 'loop', label: 'Loop', icon: '🔄', description: 'Repeat steps multiple times' },
  { value: 'parallel', label: 'Parallel', icon: '⚡', description: 'Execute multiple steps simultaneously' }
];

export const TemplateBuilder: React.FC<TemplateBuilderProps> = ({
  onTemplateCreated,
  onTemplateUpdated,
  editingTemplate
}) => {
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(editingTemplate || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showStepDialog, setShowStepDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Form states
  const [templateForm, setTemplateForm] = useState({
    name: '',
    description: '',
    category: 'approval',
    tags: [] as string[],
    estimated_duration: 60,
    is_public: false,
    requires_approval: false
  });

  const [workflowDefinition, setWorkflowDefinition] = useState<WorkflowDefinition>({
    start_step: '',
    steps: [],
    variables: {},
    settings: {}
  });

  const [newStep, setNewStep] = useState({
    id: '',
    name: '',
    type: 'action' as WorkflowStep['type'],
    description: '',
    config: {}
  });

  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    if (editingTemplate) {
      setSelectedTemplate(editingTemplate);
      populateFormFromTemplate(editingTemplate);
    }
  }, [editingTemplate]);

  const loadTemplates = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await workflowAutomationApi.getWorkflowTemplates();
      setTemplates(data);
    } catch (err) {
      setError('Failed to load workflow templates');
      console.error('Error loading templates:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const populateFormFromTemplate = (template: WorkflowTemplate) => {
    setTemplateForm({
      name: template.name,
      description: template.description || '',
      category: template.category,
      tags: template.tags,
      estimated_duration: template.estimated_duration || 60,
      is_public: template.is_public,
      requires_approval: template.requires_approval
    });
    setWorkflowDefinition(template.workflow_definition);
  };

  const resetForm = () => {
    setTemplateForm({
      name: '',
      description: '',
      category: 'approval',
      tags: [],
      estimated_duration: 60,
      is_public: false,
      requires_approval: false
    });
    setWorkflowDefinition({
      start_step: '',
      steps: [],
      variables: {},
      settings: {}
    });
    setSelectedTemplate(null);
  };

  const handleCreateTemplate = async () => {
    if (!templateForm.name.trim()) {
      setError('Template name is required');
      return;
    }

    if (workflowDefinition.steps.length === 0) {
      setError('At least one workflow step is required');
      return;
    }

    if (!workflowDefinition.start_step) {
      setWorkflowDefinition(prev => ({
        ...prev,
        start_step: prev.steps[0]?.id || ''
      }));
    }

    setIsLoading(true);
    setError(null);

    try {
      const templateData: CreateWorkflowTemplateRequest = {
        ...templateForm,
        workflow_definition: workflowDefinition,
        input_schema: generateInputSchema(),
        output_schema: generateOutputSchema()
      };

      let result: WorkflowTemplate;
      if (selectedTemplate) {
        result = await workflowAutomationApi.updateWorkflowTemplate(selectedTemplate.id, templateData);
        onTemplateUpdated?.(result);
      } else {
        result = await workflowAutomationApi.createWorkflowTemplate(templateData);
        onTemplateCreated?.(result);
      }

      setSelectedTemplate(result);
      setShowCreateDialog(false);
      await loadTemplates();
    } catch (err) {
      setError(`Failed to ${selectedTemplate ? 'update' : 'create'} template: ${err}`);
      console.error('Error saving template:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const generateInputSchema = () => {
    const schema: any = {
      type: 'object',
      properties: {},
      required: []
    };

    workflowDefinition.steps.forEach(step => {
      if (step.config.input_fields) {
        Object.keys(step.config.input_fields).forEach(field => {
          schema.properties[field] = {
            type: 'string',
            description: `Input for ${step.name}`
          };
        });
      }
    });

    return schema;
  };

  const generateOutputSchema = () => {
    return {
      type: 'object',
      properties: {
        result: { type: 'string', description: 'Workflow execution result' },
        status: { type: 'string', description: 'Final workflow status' }
      }
    };
  };

  const handleAddStep = () => {
    if (!newStep.name.trim() || !newStep.id.trim()) {
      setError('Step name and ID are required');
      return;
    }

    const step: WorkflowStep = {
      id: newStep.id,
      name: newStep.name,
      type: newStep.type,
      description: newStep.description,
      config: newStep.config,
      position: { x: 100, y: 100 + workflowDefinition.steps.length * 150 },
      connections: []
    };

    setWorkflowDefinition(prev => ({
      ...prev,
      steps: [...prev.steps, step],
      start_step: prev.start_step || step.id
    }));

    setNewStep({
      id: '',
      name: '',
      type: 'action',
      description: '',
      config: {}
    });
    setShowStepDialog(false);
  };

  const handleDeleteStep = (stepId: string) => {
    setWorkflowDefinition(prev => ({
      ...prev,
      steps: prev.steps.filter(step => step.id !== stepId),
      start_step: prev.start_step === stepId ? (prev.steps[0]?.id || '') : prev.start_step
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !templateForm.tags.includes(tagInput.trim())) {
      setTemplateForm(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTemplateForm(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const getComplexityLevel = () => {
    const stepCount = workflowDefinition.steps.length;
    const complexTypes = ['condition', 'loop', 'parallel'];
    const complexSteps = workflowDefinition.steps.filter(step => complexTypes.includes(step.type)).length;

    if (stepCount <= 3 && complexSteps === 0) return 'simple';
    if (stepCount <= 10 && complexSteps <= 2) return 'medium';
    return 'complex';
  };

  const getStepTypeInfo = (type: string) => {
    return STEP_TYPES.find(t => t.value === type) || STEP_TYPES[0];
  };

  if (isLoading && templates.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading workflow templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Workflow Template Builder</h1>
          <p className="text-gray-600">Create and manage reusable workflow templates</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => loadTemplates()}>
            <FileText className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="mr-2 h-4 w-4" />
                New Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {selectedTemplate ? 'Edit Template' : 'Create New Template'}
                </DialogTitle>
              </DialogHeader>
              
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="steps">Steps</TabsTrigger>
                  <TabsTrigger value="visual">Visual Designer</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Template Name *</label>
                      <Input
                        value={templateForm.name}
                        onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Employee Onboarding"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Category</label>
                      <select
                        value={templateForm.category}
                        onChange={(e) => setTemplateForm(prev => ({ ...prev, category: e.target.value }))}
                        className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        {WORKFLOW_CATEGORIES.map(category => (
                          <option key={category} value={category}>
                            {category.replace('_', ' ').toUpperCase()}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                      value={templateForm.description}
                      onChange={(e) => setTemplateForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe what this workflow template does..."
                      rows={3}
                      className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Tags</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {templateForm.tags.map(tag => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="flex items-center gap-1"
                          icon={<Tag className="h-3 w-3" />}
                          removable={true}
                          onRemove={() => handleRemoveTag(tag)}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        placeholder="Add tag..."
                        onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                      />
                      <Button variant="outline" onClick={handleAddTag}>Add</Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Estimated Duration (minutes)</label>
                      <Input
                        type="number"
                        value={templateForm.estimated_duration}
                        onChange={(e) => setTemplateForm(prev => ({ ...prev, estimated_duration: parseInt(e.target.value) }))}
                        min="1"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={templateForm.is_public}
                          onChange={(e) => setTemplateForm(prev => ({ ...prev, is_public: e.target.checked }))}
                        />
                        <span className="text-sm">Public Template</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={templateForm.requires_approval}
                          onChange={(e) => setTemplateForm(prev => ({ ...prev, requires_approval: e.target.checked }))}
                        />
                        <span className="text-sm">Requires Approval</span>
                      </label>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Template Summary</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Steps:</span> {workflowDefinition.steps.length}
                      </div>
                      <div>
                        <span className="text-gray-600">Complexity:</span> 
                        <Badge variant="outline" className="ml-1" icon={null} onRemove={() => {}}>{getComplexityLevel()}</Badge>
                      </div>
                      <div>
                        <span className="text-gray-600">Start Step:</span> {workflowDefinition.start_step || 'None'}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="steps" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Workflow Steps</h3>
                    <Dialog open={showStepDialog} onOpenChange={setShowStepDialog}>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Plus className="mr-2 h-4 w-4" />
                          Add Step
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Workflow Step</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Step ID *</label>
                              <Input
                                value={newStep.id}
                                onChange={(e) => setNewStep(prev => ({ ...prev, id: e.target.value }))}
                                placeholder="e.g., send_welcome_email"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Step Name *</label>
                              <Input
                                value={newStep.name}
                                onChange={(e) => setNewStep(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="e.g., Send Welcome Email"
                              />
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-2">Step Type</label>
                            <select
                              value={newStep.type}
                              onChange={(e) => setNewStep(prev => ({ ...prev, type: e.target.value as WorkflowStep['type'] }))}
                              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                              {STEP_TYPES.map(type => (
                                <option key={type.value} value={type.value}>
                                  {type.icon} {type.label} - {type.description}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Description</label>
                            <textarea
                              value={newStep.description}
                              onChange={(e) => setNewStep(prev => ({ ...prev, description: e.target.value }))}
                              placeholder="Describe what this step does..."
                              rows={2}
                              className="flex min-h-[60px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            />
                          </div>

                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => setShowStepDialog(false)}>
                              Cancel
                            </Button>
                            <Button onClick={handleAddStep}>Add Step</Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="space-y-3">
                    {workflowDefinition.steps.map((step, index) => {
                      const typeInfo = getStepTypeInfo(step.type);
                      return (
                        <div key={step.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                                {index + 1}
                              </div>
                              <div>
                                <h4 className="font-medium">{step.name}</h4>
                                <p className="text-sm text-gray-600">{step.description}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" icon={null} onRemove={() => {}}>
                                {typeInfo.icon} {typeInfo.label}
                              </Badge>
                              {workflowDefinition.start_step === step.id && (
                                <Badge variant="success" icon={null} onRemove={() => {}}>Start</Badge>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteStep(step.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">ID:</span> {step.id}
                          </div>
                        </div>
                      );
                    })}
                    {workflowDefinition.steps.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No steps added yet. Click "Add Step" to get started.
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="visual">
                  <WorkflowVisualDesigner
                    workflowDefinition={workflowDefinition}
                    onWorkflowChange={setWorkflowDefinition}
                    readOnly={false}
                  />
                </TabsContent>

                <TabsContent value="settings" className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Advanced Settings</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Workflow Variables</label>
                        <textarea
                          value={JSON.stringify(workflowDefinition.variables, null, 2)}
                          onChange={(e) => {
                            try {
                              const variables = JSON.parse(e.target.value);
                              setWorkflowDefinition(prev => ({ ...prev, variables }));
                            } catch {
                              // Invalid JSON, ignore
                            }
                          }}
                          placeholder='{"variable_name": "default_value"}'
                          rows={4}
                          className="flex min-h-[100px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-mono placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Workflow Settings</label>
                        <textarea
                          value={JSON.stringify(workflowDefinition.settings, null, 2)}
                          onChange={(e) => {
                            try {
                              const settings = JSON.parse(e.target.value);
                              setWorkflowDefinition(prev => ({ ...prev, settings }));
                            } catch {
                              // Invalid JSON, ignore
                            }
                          }}
                          placeholder='{"timeout": 3600, "retry_count": 3}'
                          rows={4}
                          className="flex min-h-[100px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-mono placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
                <Button onClick={handleCreateTemplate} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {selectedTemplate ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {selectedTemplate ? 'Update Template' : 'Create Template'}
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

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map(template => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="outline" icon={null} onRemove={() => {}}>{template.category}</Badge>
                    <Badge
                      variant={template.complexity_level === 'simple' ? 'success' :
                                template.complexity_level === 'medium' ? 'warning' : 'error'}
                      icon={null}
                      onRemove={() => {}}
                    >
                      {template.complexity_level}
                    </Badge>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedTemplate(template);
                      populateFormFromTemplate(template);
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
                {template.description || 'No description provided'}
              </p>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Steps:</span>
                  <span className="font-medium">{template.workflow_definition.steps.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{template.estimated_duration || 'N/A'} min</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Success Rate:</span>
                  <span className="font-medium">{template.success_rate.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Usage:</span>
                  <span className="font-medium">{template.usage_count} times</span>
                </div>
              </div>

              {template.tags.length > 0 && (
                <div className="mt-4">
                  <div className="flex flex-wrap gap-1">
                    {template.tags.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs" icon={null} onRemove={() => {}}>
                        {tag}
                      </Badge>
                    ))}
                    {template.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs" icon={null} onRemove={() => {}}>
                        +{template.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center mt-4 pt-4 border-t">
                <div className="flex items-center space-x-2">
                  {template.is_active ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-gray-400" />
                  )}
                  <span className="text-xs text-gray-600">
                    {template.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <Button variant="outline" size="sm">
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {templates.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Templates Found</h3>
          <p className="text-gray-600 mb-4">Get started by creating your first workflow template.</p>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Template
          </Button>
        </div>
      )}
    </div>
  );
};

export default TemplateBuilder;