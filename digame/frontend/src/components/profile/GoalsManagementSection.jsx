import React, { useState } from 'react';
import { 
  Target, Plus, Edit, Trash2, CheckCircle, 
  Calendar, TrendingUp, Award, Clock,
  BarChart3, Flag, Star
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/Dialog';
import { Toast } from '../ui/Toast';
import apiService from '../../services/apiService';

const GoalsManagementSection = ({ goals, setGoals }) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    category: 'productivity',
    target_value: 100,
    current_value: 0,
    target_date: '',
    priority: 'medium'
  });

  const handleCreateGoal = async () => {
    try {
      const createdGoal = await apiService.createGoal(newGoal);
      setGoals([...goals, createdGoal]);
      setNewGoal({
        title: '',
        description: '',
        category: 'productivity',
        target_value: 100,
        current_value: 0,
        target_date: '',
        priority: 'medium'
      });
      setShowCreateDialog(false);
      Toast.success('Goal created successfully');
    } catch (error) {
      Toast.error('Failed to create goal');
    }
  };

  const handleUpdateGoal = async (goalId, updates) => {
    try {
      const updatedGoal = await apiService.updateGoal(goalId, updates);
      setGoals(goals.map(goal => goal.id === goalId ? updatedGoal : goal));
      Toast.success('Goal updated successfully');
    } catch (error) {
      Toast.error('Failed to update goal');
    }
  };

  const handleDeleteGoal = async (goalId) => {
    try {
      await apiService.deleteGoal(goalId);
      setGoals(goals.filter(goal => goal.id !== goalId));
      Toast.success('Goal deleted successfully');
    } catch (error) {
      Toast.error('Failed to delete goal');
    }
  };

  const handleProgressUpdate = async (goalId, newProgress) => {
    try {
      await handleUpdateGoal(goalId, { current_value: newProgress });
    } catch (error) {
      Toast.error('Failed to update progress');
    }
  };

  const getProgressPercentage = (goal) => {
    return Math.min((goal.current_value / goal.target_value) * 100, 100);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'productivity': return TrendingUp;
      case 'learning': return Award;
      case 'health': return Target;
      case 'career': return Flag;
      default: return Target;
    }
  };

  const getStatusBadge = (goal) => {
    const progress = getProgressPercentage(goal);
    if (progress >= 100) return <Badge variant="success">Completed</Badge>;
    if (progress >= 75) return <Badge variant="warning">Almost There</Badge>;
    if (progress >= 25) return <Badge variant="default">In Progress</Badge>;
    return <Badge variant="secondary">Just Started</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Goals Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Goals & Progress Tracking
              </CardTitle>
              <CardDescription>
                Set, track, and achieve your professional development goals
              </CardDescription>
            </div>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Goal
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <GoalsOverviewStats goals={goals} />
        </CardContent>
      </Card>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {goals.map((goal) => (
          <GoalCard
            key={goal.id}
            goal={goal}
            onUpdate={handleUpdateGoal}
            onDelete={handleDeleteGoal}
            onProgressUpdate={handleProgressUpdate}
            getProgressPercentage={getProgressPercentage}
            getPriorityColor={getPriorityColor}
            getCategoryIcon={getCategoryIcon}
            getStatusBadge={getStatusBadge}
          />
        ))}
      </div>

      {goals.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No goals yet</h3>
            <p className="text-gray-600 mb-4">
              Start by creating your first goal to track your progress
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Goal
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Goal Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Goal</DialogTitle>
            <DialogDescription>
              Set a new goal to track your progress and achievements
            </DialogDescription>
          </DialogHeader>
          <CreateGoalForm
            goal={newGoal}
            setGoal={setNewGoal}
            onSave={handleCreateGoal}
            onCancel={() => setShowCreateDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Goals Overview Stats Component
const GoalsOverviewStats = ({ goals }) => {
  const totalGoals = goals.length;
  const completedGoals = goals.filter(goal => 
    (goal.current_value / goal.target_value) >= 1
  ).length;
  const inProgressGoals = goals.filter(goal => 
    goal.current_value > 0 && (goal.current_value / goal.target_value) < 1
  ).length;
  const overallProgress = totalGoals > 0 
    ? goals.reduce((sum, goal) => sum + Math.min((goal.current_value / goal.target_value) * 100, 100), 0) / totalGoals
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="text-center">
        <div className="text-2xl font-bold text-blue-600">{totalGoals}</div>
        <p className="text-sm text-gray-600">Total Goals</p>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-green-600">{completedGoals}</div>
        <p className="text-sm text-gray-600">Completed</p>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-orange-600">{inProgressGoals}</div>
        <p className="text-sm text-gray-600">In Progress</p>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-purple-600">{Math.round(overallProgress)}%</div>
        <p className="text-sm text-gray-600">Overall Progress</p>
      </div>
    </div>
  );
};

// Goal Card Component
const GoalCard = ({ 
  goal, 
  onUpdate, 
  onDelete, 
  onProgressUpdate,
  getProgressPercentage,
  getPriorityColor,
  getCategoryIcon,
  getStatusBadge
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(goal);
  const [progressInput, setProgressInput] = useState(goal.current_value);

  const CategoryIcon = getCategoryIcon(goal.category);
  const progress = getProgressPercentage(goal);
  const isOverdue = new Date(goal.target_date) < new Date() && progress < 100;

  const handleSave = async () => {
    await onUpdate(goal.id, editData);
    setIsEditing(false);
  };

  const handleProgressSubmit = async () => {
    await onProgressUpdate(goal.id, progressInput);
  };

  return (
    <Card className={`transition-all ${isOverdue ? 'border-red-300 bg-red-50' : ''}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CategoryIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              {isEditing ? (
                <Input
                  value={editData.title}
                  onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                  className="font-medium"
                />
              ) : (
                <h3 className="font-medium text-gray-900">{goal.title}</h3>
              )}
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={getPriorityColor(goal.priority)}>
                  {goal.priority}
                </Badge>
                {getStatusBadge(goal)}
                {isOverdue && <Badge variant="destructive">Overdue</Badge>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDelete(goal.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <div className="space-y-3">
            <Input
              value={editData.description}
              onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Description"
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="number"
                value={editData.target_value}
                onChange={(e) => setEditData(prev => ({ ...prev, target_value: parseInt(e.target.value) }))}
                placeholder="Target"
              />
              <Input
                type="date"
                value={editData.target_date}
                onChange={(e) => setEditData(prev => ({ ...prev, target_date: e.target.value }))}
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave}>Save</Button>
              <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-gray-600 text-sm">{goal.description}</p>
            
            {/* Progress Section */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{goal.current_value} / {goal.target_value}</span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-gray-500">{Math.round(progress)}% complete</p>
            </div>

            {/* Quick Progress Update */}
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={progressInput}
                onChange={(e) => setProgressInput(parseInt(e.target.value))}
                className="flex-1"
                placeholder="Update progress"
              />
              <Button size="sm" onClick={handleProgressSubmit}>
                Update
              </Button>
            </div>

            {/* Goal Details */}
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Due: {new Date(goal.target_date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>
                  {Math.ceil((new Date(goal.target_date) - new Date()) / (1000 * 60 * 60 * 24))} days left
                </span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

// Create Goal Form Component
const CreateGoalForm = ({ goal, setGoal, onSave, onCancel }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <Input
          value={goal.title}
          onChange={(e) => setGoal(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Goal title"
        />
        <Input
          value={goal.description}
          onChange={(e) => setGoal(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Goal description"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <select
          value={goal.category}
          onChange={(e) => setGoal(prev => ({ ...prev, category: e.target.value }))}
          className="px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="productivity">Productivity</option>
          <option value="learning">Learning</option>
          <option value="health">Health</option>
          <option value="career">Career</option>
        </select>
        <select
          value={goal.priority}
          onChange={(e) => setGoal(prev => ({ ...prev, priority: e.target.value }))}
          className="px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="low">Low Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="high">High Priority</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          type="number"
          value={goal.target_value}
          onChange={(e) => setGoal(prev => ({ ...prev, target_value: parseInt(e.target.value) }))}
          placeholder="Target value"
        />
        <Input
          type="date"
          value={goal.target_date}
          onChange={(e) => setGoal(prev => ({ ...prev, target_date: e.target.value }))}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onSave}>
          Create Goal
        </Button>
      </div>
    </div>
  );
};

export default GoalsManagementSection;