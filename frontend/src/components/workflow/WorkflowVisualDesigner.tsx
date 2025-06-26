import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/Dialog';
import { 
  Plus, Trash2, Edit3, Play, Square, Circle, 
  ArrowRight, Settings, ZoomIn, ZoomOut, RotateCcw,
  Move, MousePointer, Hand, Save
} from 'lucide-react';
import { WorkflowDefinition, WorkflowStep } from '../../services/api/workflowAutomation';

interface WorkflowVisualDesignerProps {
  workflowDefinition: WorkflowDefinition;
  onWorkflowChange: (definition: WorkflowDefinition) => void;
  readOnly?: boolean;
  className?: string;
}

interface DragState {
  isDragging: boolean;
  draggedStep: WorkflowStep | null;
  dragOffset: { x: number; y: number };
  startPosition: { x: number; y: number };
}

interface ViewState {
  zoom: number;
  pan: { x: number; y: number };
  selectedStepId: string | null;
}

const STEP_TYPES = [
  { value: 'action', label: 'Action', icon: '⚡', color: '#3b82f6' },
  { value: 'condition', label: 'Condition', icon: '🔀', color: '#f59e0b' },
  { value: 'human_task', label: 'Human Task', icon: '👤', color: '#10b981' },
  { value: 'approval', label: 'Approval', icon: '✅', color: '#8b5cf6' },
  { value: 'notification', label: 'Notification', icon: '📧', color: '#ef4444' },
  { value: 'integration', label: 'Integration', icon: '🔗', color: '#06b6d4' },
  { value: 'loop', label: 'Loop', icon: '🔄', color: '#f97316' },
  { value: 'parallel', label: 'Parallel', icon: '⚡', color: '#84cc16' }
];

const GRID_SIZE = 20;
const STEP_WIDTH = 160;
const STEP_HEIGHT = 80;

export const WorkflowVisualDesigner: React.FC<WorkflowVisualDesignerProps> = ({
  workflowDefinition,
  onWorkflowChange,
  readOnly = false,
  className = ''
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedStep: null,
    dragOffset: { x: 0, y: 0 },
    startPosition: { x: 0, y: 0 }
  });
  
  const [viewState, setViewState] = useState<ViewState>({
    zoom: 1,
    pan: { x: 0, y: 0 },
    selectedStepId: null
  });

  const [showStepEditor, setShowStepEditor] = useState(false);
  const [editingStep, setEditingStep] = useState<WorkflowStep | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStart, setConnectionStart] = useState<string | null>(null);

  const getStepTypeInfo = (type: string) => {
    return STEP_TYPES.find(t => t.value === type) || STEP_TYPES[0];
  };

  const snapToGrid = (value: number) => {
    return Math.round(value / GRID_SIZE) * GRID_SIZE;
  };

  const getStepPosition = (step: WorkflowStep) => {
    return step.position || { x: 100, y: 100 };
  };

  const updateStepPosition = (stepId: string, position: { x: number; y: number }) => {
    if (readOnly) return;

    const updatedSteps = workflowDefinition.steps.map(step =>
      step.id === stepId
        ? { ...step, position: { x: snapToGrid(position.x), y: snapToGrid(position.y) } }
        : step
    );

    onWorkflowChange({
      ...workflowDefinition,
      steps: updatedSteps
    });
  };

  const handleStepMouseDown = (e: React.MouseEvent, step: WorkflowStep) => {
    if (readOnly) return;

    e.preventDefault();
    e.stopPropagation();

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const position = getStepPosition(step);
    const mouseX = (e.clientX - rect.left) / viewState.zoom - viewState.pan.x;
    const mouseY = (e.clientY - rect.top) / viewState.zoom - viewState.pan.y;

    setDragState({
      isDragging: true,
      draggedStep: step,
      dragOffset: {
        x: mouseX - position.x,
        y: mouseY - position.y
      },
      startPosition: position
    });

    setViewState(prev => ({ ...prev, selectedStepId: step.id }));
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragState.isDragging || !dragState.draggedStep || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) / viewState.zoom - viewState.pan.x;
    const mouseY = (e.clientY - rect.top) / viewState.zoom - viewState.pan.y;

    const newPosition = {
      x: mouseX - dragState.dragOffset.x,
      y: mouseY - dragState.dragOffset.y
    };

    updateStepPosition(dragState.draggedStep.id, newPosition);
  }, [dragState, viewState, updateStepPosition]);

  const handleMouseUp = useCallback(() => {
    setDragState({
      isDragging: false,
      draggedStep: null,
      dragOffset: { x: 0, y: 0 },
      startPosition: { x: 0, y: 0 }
    });
  }, []);

  useEffect(() => {
    if (dragState.isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragState.isDragging, handleMouseMove, handleMouseUp]);

  const handleStepDoubleClick = (step: WorkflowStep) => {
    if (readOnly) return;
    setEditingStep(step);
    setShowStepEditor(true);
  };

  const handleDeleteStep = (stepId: string) => {
    if (readOnly) return;

    const updatedSteps = workflowDefinition.steps.filter(step => step.id !== stepId);
    const updatedDefinition = {
      ...workflowDefinition,
      steps: updatedSteps,
      start_step: workflowDefinition.start_step === stepId 
        ? (updatedSteps[0]?.id || '') 
        : workflowDefinition.start_step
    };

    onWorkflowChange(updatedDefinition);
    setViewState(prev => ({ ...prev, selectedStepId: null }));
  };

  const handleConnectionStart = (stepId: string) => {
    if (readOnly) return;
    setIsConnecting(true);
    setConnectionStart(stepId);
  };

  const handleConnectionEnd = (targetStepId: string) => {
    if (readOnly || !connectionStart || connectionStart === targetStepId) {
      setIsConnecting(false);
      setConnectionStart(null);
      return;
    }

    const updatedSteps = workflowDefinition.steps.map(step => {
      if (step.id === connectionStart) {
        const connections = step.connections || [];
        if (!connections.includes(targetStepId)) {
          return { ...step, connections: [...connections, targetStepId] };
        }
      }
      return step;
    });

    onWorkflowChange({
      ...workflowDefinition,
      steps: updatedSteps
    });

    setIsConnecting(false);
    setConnectionStart(null);
  };

  const handleZoom = (delta: number) => {
    setViewState(prev => ({
      ...prev,
      zoom: Math.max(0.25, Math.min(2, prev.zoom + delta))
    }));
  };

  const handleResetView = () => {
    setViewState({
      zoom: 1,
      pan: { x: 0, y: 0 },
      selectedStepId: null
    });
  };

  const renderConnections = () => {
    return workflowDefinition.steps.map(step => {
      const connections = step.connections || [];
      const startPos = getStepPosition(step);
      
      return connections.map(targetId => {
        const targetStep = workflowDefinition.steps.find(s => s.id === targetId);
        if (!targetStep) return null;

        const endPos = getStepPosition(targetStep);
        const startX = startPos.x + STEP_WIDTH / 2;
        const startY = startPos.y + STEP_HEIGHT;
        const endX = endPos.x + STEP_WIDTH / 2;
        const endY = endPos.y;

        // Calculate control points for curved line
        const controlY = startY + (endY - startY) / 2;

        return (
          <g key={`${step.id}-${targetId}`}>
            <path
              d={`M ${startX} ${startY} Q ${startX} ${controlY} ${endX} ${endY}`}
              stroke="#6b7280"
              strokeWidth="2"
              fill="none"
              markerEnd="url(#arrowhead)"
            />
          </g>
        );
      });
    });
  };

  const renderStep = (step: WorkflowStep) => {
    const position = getStepPosition(step);
    const typeInfo = getStepTypeInfo(step.type);
    const isSelected = viewState.selectedStepId === step.id;
    const isStartStep = workflowDefinition.start_step === step.id;

    return (
      <div
        key={step.id}
        className={`absolute cursor-pointer transition-all duration-200 ${
          isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''
        }`}
        style={{
          left: position.x,
          top: position.y,
          width: STEP_WIDTH,
          height: STEP_HEIGHT,
          transform: `scale(${dragState.draggedStep?.id === step.id ? 1.05 : 1})`
        }}
        onMouseDown={(e) => handleStepMouseDown(e, step)}
        onDoubleClick={() => handleStepDoubleClick(step)}
        onClick={(e) => {
          e.stopPropagation();
          if (isConnecting && connectionStart) {
            handleConnectionEnd(step.id);
          } else {
            setViewState(prev => ({ ...prev, selectedStepId: step.id }));
          }
        }}
      >
        <Card className={`h-full border-2 ${isStartStep ? 'border-green-500' : 'border-gray-200'} hover:shadow-lg`}>
          <CardContent className="p-3 h-full flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs"
                  style={{ backgroundColor: typeInfo.color }}
                >
                  {typeInfo.icon}
                </div>
                <Badge variant="outline" size="xs" icon={null} onRemove={() => {}}>
                  {typeInfo.label}
                </Badge>
              </div>
              {isStartStep && (
                <Badge variant="success" size="xs" icon={null} onRemove={() => {}}>
                  Start
                </Badge>
              )}
            </div>
            
            <div className="flex-1 min-h-0">
              <h4 className="font-medium text-sm truncate mb-1">{step.name}</h4>
              <p className="text-xs text-gray-600 line-clamp-2">{step.description}</p>
            </div>

            {!readOnly && isSelected && (
              <div className="flex justify-between items-center mt-2 pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleConnectionStart(step.id);
                  }}
                  className="text-xs px-2 py-1"
                >
                  <ArrowRight className="h-3 w-3" />
                </Button>
                <div className="flex space-x-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStepDoubleClick(step);
                    }}
                    className="text-xs px-2 py-1"
                  >
                    <Edit3 className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteStep(step.id);
                    }}
                    className="text-xs px-2 py-1 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderGrid = () => {
    const gridLines: React.ReactElement[] = [];
    const canvasWidth = 2000;
    const canvasHeight = 1500;

    // Vertical lines
    for (let x = 0; x <= canvasWidth; x += GRID_SIZE) {
      gridLines.push(
        <line
          key={`v-${x}`}
          x1={x}
          y1={0}
          x2={x}
          y2={canvasHeight}
          stroke="#f3f4f6"
          strokeWidth="1"
        />
      );
    }

    // Horizontal lines
    for (let y = 0; y <= canvasHeight; y += GRID_SIZE) {
      gridLines.push(
        <line
          key={`h-${y}`}
          x1={0}
          y1={y}
          x2={canvasWidth}
          y2={y}
          stroke="#f3f4f6"
          strokeWidth="1"
        />
      );
    }

    return (
      <svg
        className="absolute inset-0 pointer-events-none"
        width={canvasWidth}
        height={canvasHeight}
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3.5, 0 7"
              fill="#6b7280"
            />
          </marker>
        </defs>
        {gridLines}
        {renderConnections()}
      </svg>
    );
  };

  return (
    <div className={`relative h-96 border rounded-lg overflow-hidden bg-gray-50 ${className}`}>
      {/* Toolbar */}
      <div className="absolute top-4 left-4 z-10 flex space-x-2">
        <div className="bg-white rounded-lg shadow-sm border p-2 flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleZoom(0.25)}
            disabled={viewState.zoom >= 2}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleZoom(-0.25)}
            disabled={viewState.zoom <= 0.25}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetView}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <div className="flex items-center px-2 text-sm text-gray-600">
            {Math.round(viewState.zoom * 100)}%
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="absolute top-4 right-4 z-10">
        <div className="bg-white rounded-lg shadow-sm border p-2 flex items-center space-x-2">
          <Badge variant="outline" size="sm" icon={null} onRemove={() => {}}>
            {workflowDefinition.steps.length} Steps
          </Badge>
          {isConnecting && (
            <Badge variant="warning" size="sm" icon={null} onRemove={() => {}}>
              Connecting...
            </Badge>
          )}
          {readOnly && (
            <Badge variant="secondary" size="sm" icon={null} onRemove={() => {}}>
              Read Only
            </Badge>
          )}
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="w-full h-full relative overflow-auto cursor-grab active:cursor-grabbing"
        style={{
          transform: `scale(${viewState.zoom}) translate(${viewState.pan.x}px, ${viewState.pan.y}px)`
        }}
        onClick={() => {
          setViewState(prev => ({ ...prev, selectedStepId: null }));
          if (isConnecting) {
            setIsConnecting(false);
            setConnectionStart(null);
          }
        }}
      >
        {renderGrid()}
        
        {/* Steps */}
        {workflowDefinition.steps.map(renderStep)}

        {/* Empty state */}
        {workflowDefinition.steps.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <Circle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No Workflow Steps</h3>
              <p className="text-sm">Add steps to start building your workflow</p>
            </div>
          </div>
        )}
      </div>

      {/* Step Editor Dialog */}
      <Dialog open={showStepEditor} onOpenChange={setShowStepEditor}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Workflow Step</DialogTitle>
          </DialogHeader>
          {editingStep && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Step Name</label>
                <Input
                  value={editingStep.name}
                  onChange={(e) => setEditingStep(prev => prev ? { ...prev, name: e.target.value } : null)}
                  placeholder="Step name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Step Type</label>
                <select
                  value={editingStep.type}
                  onChange={(e) => setEditingStep(prev => prev ? { ...prev, type: e.target.value as WorkflowStep['type'] } : null)}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {STEP_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Input
                  value={editingStep.description || ''}
                  onChange={(e) => setEditingStep(prev => prev ? { ...prev, description: e.target.value } : null)}
                  placeholder="Step description"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowStepEditor(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  if (editingStep) {
                    const updatedSteps = workflowDefinition.steps.map(step =>
                      step.id === editingStep.id ? editingStep : step
                    );
                    onWorkflowChange({
                      ...workflowDefinition,
                      steps: updatedSteps
                    });
                  }
                  setShowStepEditor(false);
                  setEditingStep(null);
                }}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkflowVisualDesigner;