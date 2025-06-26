import React, { useState, useEffect, useMemo } from 'react';
import {
  Target, Plus, Edit, Trash2, CheckCircle,
  Calendar, TrendingUp, Award, Clock,
  BarChart3, Flag, Star, AlertTriangle,
  BookOpen, Briefcase, Heart, Zap,
  ChevronDown, ChevronUp, Filter,
  PieChart, LineChart, Trophy, Bell
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/Dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { useToast } from '../ui/Toast';
import apiService from '../../services/apiService';

const GoalsManagementSection = ({ goals, setGoals }) => {
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('priority');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    category: 'career',
    target_value: 100,
    current_value: 0,
    target_date: '',
    priority: 'medium',
    milestones: [],
    tags: [],
    reminder_frequency: 'weekly'
  });

  // Detect dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    
    checkDarkMode();
    
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);

  // Enhanced goal categories with better organization
  const goalCategories = [
    { id: 'career', name: 'Career', icon: Briefcase, color: 'blue' },
    { id: 'learning', name: 'Learning', icon: BookOpen, color: 'green' },
    { id: 'personal', name: 'Personal', icon: Heart, color: 'pink' },
    { id: 'health', name: 'Health', icon: Heart, color: 'red' },
    { id: 'productivity', name: 'Productivity', icon: TrendingUp, color: 'purple' },
    { id: 'financial', name: 'Financial', icon: Target, color: 'yellow' }
  ];

  // Filter and sort goals
  const filteredAndSortedGoals = useMemo(() => {
    let filtered = goals;

    // Filter by category
    if (filterCategory !== 'all') {
      filtered = filtered.filter(goal => goal.category === filterCategory);
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(goal => {
        const progress = getProgressPercentage(goal);
        switch (filterStatus) {
          case 'completed': return progress >= 100;
          case 'in_progress': return progress > 0 && progress < 100;
          case 'not_started': return progress === 0;
          case 'overdue': return new Date(goal.target_date) < new Date() && progress < 100;
          default: return true;
        }
      });
    }

    // Sort goals
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'deadline':
          return new Date(a.target_date) - new Date(b.target_date);
        case 'progress':
          return getProgressPercentage(b) - getProgressPercentage(a);
        case 'created':
          return new Date(b.created_at || Date.now()) - new Date(a.created_at || Date.now());
        default:
          return 0;
      }
    });
  }, [goals, filterCategory, filterStatus, sortBy]);

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
      toast.success('Goal created successfully');
    } catch (error) {
      toast.error('Failed to create goal');
    }
  };

  const handleUpdateGoal = async (goalId, updates) => {
    try {
      const updatedGoal = await apiService.updateGoal(goalId, updates);
      setGoals(goals.map(goal => goal.id === goalId ? updatedGoal : goal));
      toast.success('Goal updated successfully');
    } catch (error) {
      toast.error('Failed to update goal');
    }
  };

  const handleDeleteGoal = async (goalId) => {
    try {
      await apiService.deleteGoal(goalId);
      setGoals(goals.filter(goal => goal.id !== goalId));
      toast.success('Goal deleted successfully');
    } catch (error) {
      toast.error('Failed to delete goal');
    }
  };

  const handleProgressUpdate = async (goalId, newProgress) => {
    try {
      await handleUpdateGoal(goalId, { current_value: newProgress });
    } catch (error) {
      toast.error('Failed to update progress');
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
    const categoryData = goalCategories.find(cat => cat.id === category);
    return categoryData ? categoryData.icon : Target;
  };

  const getCategoryColor = (category) => {
    const categoryData = goalCategories.find(cat => cat.id === category);
    return categoryData ? categoryData.color : 'gray';
  };

  // Enhanced deadline management
  const getDeadlineStatus = (goal) => {
    const now = new Date();
    const deadline = new Date(goal.target_date);
    const daysUntilDeadline = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
    const progress = getProgressPercentage(goal);

    if (progress >= 100) return { status: 'completed', color: 'green', message: 'Completed!' };
    if (daysUntilDeadline < 0) return { status: 'overdue', color: 'red', message: `${Math.abs(daysUntilDeadline)} days overdue` };
    if (daysUntilDeadline <= 3) return { status: 'urgent', color: 'red', message: `${daysUntilDeadline} days left` };
    if (daysUntilDeadline <= 7) return { status: 'warning', color: 'yellow', message: `${daysUntilDeadline} days left` };
    return { status: 'normal', color: 'gray', message: `${daysUntilDeadline} days left` };
  };

  // Achievement integration
  const checkForAchievements = (updatedGoal) => {
    const progress = getProgressPercentage(updatedGoal);
    
    if (progress >= 100) {
      toast.success('🎉 Goal completed! Achievement unlocked!');
      // Here you would trigger achievement logic
    } else if (progress >= 75 && progress < 100) {
      toast.info('🔥 Almost there! 75% complete!');
    } else if (progress >= 50 && progress < 75) {
      toast.info('💪 Halfway there! Keep going!');
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
      {/* Enhanced Header with Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Advanced Goals Management
              </CardTitle>
              <CardDescription>
                Set, track, and achieve your goals with advanced analytics and insights
              </CardDescription>
            </div>
            <Button onClick={() => setShowCreateDialog(true)} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              New Goal
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <EnhancedGoalsOverview goals={goals} goalCategories={goalCategories} isDarkMode={isDarkMode} />
        </CardContent>
      </Card>

      {/* Advanced Tabs Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="goals" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Goals
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <PieChart className="w-4 h-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="achievements" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Achievements
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <GoalsAnalyticsDashboard goals={goals} goalCategories={goalCategories} isDarkMode={isDarkMode} />
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          {/* Filters and Sorting */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  <span className="text-sm font-medium">Filters:</span>
                </div>
                
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className={`px-3 py-1 rounded-md border text-sm ${
                    isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                >
                  <option value="all">All Categories</option>
                  {goalCategories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className={`px-3 py-1 rounded-md border text-sm ${
                    isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="in_progress">In Progress</option>
                  <option value="not_started">Not Started</option>
                  <option value="overdue">Overdue</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={`px-3 py-1 rounded-md border text-sm ${
                    isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                >
                  <option value="priority">Sort by Priority</option>
                  <option value="deadline">Sort by Deadline</option>
                  <option value="progress">Sort by Progress</option>
                  <option value="created">Sort by Created</option>
                </select>

                <Badge variant="secondary">
                  {filteredAndSortedGoals.length} goal{filteredAndSortedGoals.length !== 1 ? 's' : ''}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Goals Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredAndSortedGoals.map((goal) => (
              <EnhancedGoalCard
                key={goal.id}
                goal={goal}
                onUpdate={handleUpdateGoal}
                onDelete={handleDeleteGoal}
                onProgressUpdate={handleProgressUpdate}
                getProgressPercentage={getProgressPercentage}
                getPriorityColor={getPriorityColor}
                getCategoryIcon={getCategoryIcon}
                getCategoryColor={getCategoryColor}
                getStatusBadge={getStatusBadge}
                getDeadlineStatus={getDeadlineStatus}
                checkForAchievements={checkForAchievements}
                isDarkMode={isDarkMode}
              />
            ))}
          </div>

          {filteredAndSortedGoals.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Target className={`w-12 h-12 mx-auto mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                <h3 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {goals.length === 0 ? 'No goals yet' : 'No goals match your filters'}
                </h3>
                <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {goals.length === 0
                    ? 'Start by creating your first goal to track your progress'
                    : 'Try adjusting your filters to see more goals'
                  }
                </p>
                {goals.length === 0 && (
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Goal
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <GoalsAnalyticsCharts goals={goals} goalCategories={goalCategories} isDarkMode={isDarkMode} />
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <GoalAchievements goals={goals} isDarkMode={isDarkMode} />
        </TabsContent>
      </Tabs>

      {/* Enhanced Create Goal Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Advanced Goal</DialogTitle>
            <DialogDescription>
              Set up a comprehensive goal with milestones, reminders, and achievement tracking
            </DialogDescription>
          </DialogHeader>
          <EnhancedCreateGoalForm
            goal={newGoal}
            setGoal={setNewGoal}
            onSave={handleCreateGoal}
            onCancel={() => setShowCreateDialog(false)}
            goalCategories={goalCategories}
            isDarkMode={isDarkMode}
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

// Enhanced Goals Overview Component
const EnhancedGoalsOverview = ({ goals, goalCategories, isDarkMode }) => {
  const totalGoals = goals.length;
  const completedGoals = goals.filter(goal => (goal.current_value / goal.target_value) >= 1).length;
  const inProgressGoals = goals.filter(goal => {
    const progress = (goal.current_value / goal.target_value) * 100;
    return progress > 0 && progress < 100;
  }).length;
  const overdueGoals = goals.filter(goal => {
    const progress = (goal.current_value / goal.target_value) * 100;
    return new Date(goal.target_date) < new Date() && progress < 100;
  }).length;

  const overallProgress = totalGoals > 0
    ? goals.reduce((sum, goal) => sum + Math.min((goal.current_value / goal.target_value) * 100, 100), 0) / totalGoals
    : 0;

  const stats = [
    { label: 'Total Goals', value: totalGoals, color: 'blue', icon: Target },
    { label: 'Completed', value: completedGoals, color: 'green', icon: CheckCircle },
    { label: 'In Progress', value: inProgressGoals, color: 'orange', icon: Clock },
    { label: 'Overdue', value: overdueGoals, color: 'red', icon: AlertTriangle }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className={`text-center p-4 rounded-lg ${
              isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'
            }`}>
              <div className="flex items-center justify-center mb-2">
                <Icon className={`w-6 h-6 text-${stat.color}-500`} />
              </div>
              <div className={`text-2xl font-bold text-${stat.color}-600`}>{stat.value}</div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{stat.label}</p>
            </div>
          );
        })}
      </div>
      
      <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
        <div className="flex items-center justify-between mb-2">
          <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Overall Progress</span>
          <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{Math.round(overallProgress)}%</span>
        </div>
        <Progress value={overallProgress} className="h-3" />
      </div>
    </div>
  );
};

// Enhanced Goal Card Component
const EnhancedGoalCard = ({
  goal,
  onUpdate,
  onDelete,
  onProgressUpdate,
  getProgressPercentage,
  getPriorityColor,
  getCategoryIcon,
  getCategoryColor,
  getStatusBadge,
  getDeadlineStatus,
  checkForAchievements,
  isDarkMode
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(goal);
  const [progressInput, setProgressInput] = useState(goal.current_value);
  const [showDetails, setShowDetails] = useState(false);

  const CategoryIcon = getCategoryIcon(goal.category);
  const progress = getProgressPercentage(goal);
  const deadlineStatus = getDeadlineStatus(goal);
  const categoryColor = getCategoryColor(goal.category);

  const handleSave = async () => {
    await onUpdate(goal.id, editData);
    setIsEditing(false);
  };

  const handleProgressSubmit = async () => {
    const oldProgress = getProgressPercentage(goal);
    await onProgressUpdate(goal.id, progressInput);
    
    // Check for achievements after progress update
    const updatedGoal = { ...goal, current_value: progressInput };
    const newProgress = getProgressPercentage(updatedGoal);
    
    if (newProgress > oldProgress) {
      checkForAchievements(updatedGoal);
    }
  };

  const getCardGradient = () => {
    if (progress >= 100) {
      return isDarkMode
        ? 'bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-500/30'
        : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300/50';
    }
    
    switch (deadlineStatus.status) {
      case 'urgent':
        return isDarkMode
          ? 'bg-gradient-to-br from-red-900/20 to-orange-900/20 border-red-500/30'
          : 'bg-gradient-to-br from-red-50 to-orange-50 border-red-300/50';
      case 'warning':
        return isDarkMode
          ? 'bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border-yellow-500/30'
          : 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300/50';
      default:
        return isDarkMode
          ? 'bg-gray-800/50 border-gray-700'
          : 'bg-white border-gray-200';
    }
  };

  return (
    <Card className={`transition-all duration-300 hover:shadow-lg ${getCardGradient()} border-2`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg bg-${categoryColor}-100 dark:bg-${categoryColor}-900/30`}>
              <CategoryIcon className={`w-5 h-5 text-${categoryColor}-600 dark:text-${categoryColor}-400`} />
            </div>
            <div className="flex-1">
              {isEditing ? (
                <Input
                  value={editData.title}
                  onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                  className="font-medium"
                />
              ) : (
                <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {goal.title}
                </h3>
              )}
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge variant={getPriorityColor(goal.priority)} className="text-xs">
                  {goal.priority}
                </Badge>
                {getStatusBadge(goal)}
                <Badge
                  variant={deadlineStatus.color === 'red' ? 'destructive' : deadlineStatus.color === 'yellow' ? 'warning' : 'secondary'}
                  className="text-xs"
                >
                  <Clock className="w-3 h-3 mr-1" />
                  {deadlineStatus.message}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
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
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {goal.description}
            </p>
            
            {/* Enhanced Progress Section */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Progress</span>
                <span className={`font-mono ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {goal.current_value} / {goal.target_value}
                </span>
              </div>
              <div className="relative">
                <Progress value={progress} className="h-3" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-white drop-shadow-sm">
                    {Math.round(progress)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Progress Update */}
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={progressInput}
                onChange={(e) => setProgressInput(parseInt(e.target.value) || 0)}
                className="flex-1"
                placeholder="Update progress"
                min="0"
                max={goal.target_value}
              />
              <Button size="sm" onClick={handleProgressSubmit} className="bg-gradient-to-r from-blue-500 to-purple-600">
                <Zap className="w-4 h-4 mr-1" />
                Update
              </Button>
            </div>

            {/* Goal Details */}
            <div className={`flex items-center justify-between text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Due: {new Date(goal.target_date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Flag className="w-4 h-4" />
                <span className="capitalize">{goal.category}</span>
              </div>
            </div>

            {/* Expanded Details */}
            {showDetails && (
              <div className={`mt-4 p-4 rounded-lg border ${
                isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
              }`}>
                <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Goal Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Created:</span>
                    <span>{new Date(goal.created_at || Date.now()).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Updated:</span>
                    <span>{new Date(goal.updated_at || Date.now()).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Days Active:</span>
                    <span>{Math.ceil((new Date() - new Date(goal.created_at || Date.now())) / (1000 * 60 * 60 * 24))}</span>
                  </div>
                  {goal.tags && goal.tags.length > 0 && (
                    <div>
                      <span>Tags:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {goal.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

// Goals Analytics Dashboard Component
const GoalsAnalyticsDashboard = ({ goals, goalCategories, isDarkMode }) => {
  const categoryStats = goalCategories.map(category => {
    const categoryGoals = goals.filter(goal => goal.category === category.id);
    const completed = categoryGoals.filter(goal => (goal.current_value / goal.target_value) >= 1).length;
    const avgProgress = categoryGoals.length > 0
      ? categoryGoals.reduce((sum, goal) => sum + Math.min((goal.current_value / goal.target_value) * 100, 100), 0) / categoryGoals.length
      : 0;
    
    return {
      ...category,
      total: categoryGoals.length,
      completed,
      avgProgress: Math.round(avgProgress)
    };
  }).filter(stat => stat.total > 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {categoryStats.map(stat => {
        const Icon = stat.icon;
        return (
          <Card key={stat.id} className={isDarkMode ? 'bg-gray-800/50' : 'bg-white'}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon className={`w-5 h-5 text-${stat.color}-500`} />
                {stat.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Total Goals:</span>
                  <span className="font-bold">{stat.total}</span>
                </div>
                <div className="flex justify-between">
                  <span>Completed:</span>
                  <span className="font-bold text-green-600">{stat.completed}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Avg Progress:</span>
                    <span className="font-bold">{stat.avgProgress}%</span>
                  </div>
                  <Progress value={stat.avgProgress} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

// Goals Analytics Charts Component
const GoalsAnalyticsCharts = ({ goals, goalCategories, isDarkMode }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className={isDarkMode ? 'bg-gray-800/50' : 'bg-white'}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            Goals by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {goalCategories.map(category => {
              const categoryGoals = goals.filter(goal => goal.category === category.id);
              const percentage = goals.length > 0 ? (categoryGoals.length / goals.length) * 100 : 0;
              const Icon = category.icon;
              
              if (categoryGoals.length === 0) return null;
              
              return (
                <div key={category.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 text-${category.color}-500`} />
                    <span>{category.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20">
                      <Progress value={percentage} className="h-2" />
                    </div>
                    <span className="text-sm font-medium w-12 text-right">
                      {categoryGoals.length}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className={isDarkMode ? 'bg-gray-800/50' : 'bg-white'}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="w-5 h-5" />
            Progress Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { range: '0-25%', min: 0, max: 25, color: 'red' },
              { range: '26-50%', min: 26, max: 50, color: 'orange' },
              { range: '51-75%', min: 51, max: 75, color: 'yellow' },
              { range: '76-99%', min: 76, max: 99, color: 'blue' },
              { range: '100%', min: 100, max: 100, color: 'green' }
            ].map(bucket => {
              const count = goals.filter(goal => {
                const progress = (goal.current_value / goal.target_value) * 100;
                return progress >= bucket.min && progress <= bucket.max;
              }).length;
              const percentage = goals.length > 0 ? (count / goals.length) * 100 : 0;
              
              return (
                <div key={bucket.range} className="flex items-center justify-between">
                  <span>{bucket.range}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20">
                      <Progress value={percentage} className="h-2" />
                    </div>
                    <span className="text-sm font-medium w-8 text-right">{count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Goal Achievements Component
const GoalAchievements = ({ goals, isDarkMode }) => {
  const achievements = [
    {
      title: 'First Goal',
      description: 'Create your first goal',
      earned: goals.length > 0,
      icon: Target,
      color: 'blue'
    },
    {
      title: 'Goal Achiever',
      description: 'Complete your first goal',
      earned: goals.some(goal => (goal.current_value / goal.target_value) >= 1),
      icon: CheckCircle,
      color: 'green'
    },
    {
      title: 'Consistent Tracker',
      description: 'Have 5 active goals',
      earned: goals.length >= 5,
      icon: TrendingUp,
      color: 'purple'
    },
    {
      title: 'Goal Master',
      description: 'Complete 10 goals',
      earned: goals.filter(goal => (goal.current_value / goal.target_value) >= 1).length >= 10,
      icon: Trophy,
      color: 'yellow'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {achievements.map((achievement, index) => {
        const Icon = achievement.icon;
        return (
          <Card key={index} className={`${
            achievement.earned
              ? (isDarkMode ? 'bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border-yellow-500/30' : 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300/50')
              : (isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200')
          } border-2`}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${
                  achievement.earned
                    ? `bg-${achievement.color}-100 dark:bg-${achievement.color}-900/30`
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}>
                  <Icon className={`w-6 h-6 ${
                    achievement.earned
                      ? `text-${achievement.color}-600 dark:text-${achievement.color}-400`
                      : 'text-gray-400'
                  }`} />
                </div>
                <div className="flex-1">
                  <h3 className={`font-semibold ${
                    achievement.earned
                      ? (isDarkMode ? 'text-white' : 'text-gray-900')
                      : (isDarkMode ? 'text-gray-400' : 'text-gray-500')
                  }`}>
                    {achievement.title}
                  </h3>
                  <p className={`text-sm ${
                    achievement.earned
                      ? (isDarkMode ? 'text-gray-300' : 'text-gray-600')
                      : (isDarkMode ? 'text-gray-500' : 'text-gray-400')
                  }`}>
                    {achievement.description}
                  </p>
                </div>
                {achievement.earned && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

// Enhanced Create Goal Form Component
const EnhancedCreateGoalForm = ({ goal, setGoal, onSave, onCancel, goalCategories, isDarkMode }) => {
  const [milestones, setMilestones] = useState([]);
  const [newMilestone, setNewMilestone] = useState('');
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');

  const addMilestone = () => {
    if (newMilestone.trim()) {
      setMilestones([...milestones, { title: newMilestone, completed: false }]);
      setNewMilestone('');
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleSave = () => {
    onSave({ ...goal, milestones, tags });
  };

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Basic Information</h3>
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
      </div>

      {/* Category and Priority */}
      <div className="space-y-4">
        <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Category & Priority</h3>
        <div className="grid grid-cols-2 gap-4">
          <select
            value={goal.category}
            onChange={(e) => setGoal(prev => ({ ...prev, category: e.target.value }))}
            className={`px-3 py-2 border rounded-md ${
              isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'
            }`}
          >
            {goalCategories.map(category => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
          <select
            value={goal.priority}
            onChange={(e) => setGoal(prev => ({ ...prev, priority: e.target.value }))}
            className={`px-3 py-2 border rounded-md ${
              isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'
            }`}
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
        </div>
      </div>

      {/* Target and Deadline */}
      <div className="space-y-4">
        <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Target & Deadline</h3>
        <div className="grid grid-cols-2 gap-4">
          <Input
            type="number"
            value={goal.target_value}
            onChange={(e) => setGoal(prev => ({ ...prev, target_value: parseInt(e.target.value) || 0 }))}
            placeholder="Target value"
          />
          <Input
            type="date"
            value={goal.target_date}
            onChange={(e) => setGoal(prev => ({ ...prev, target_date: e.target.value }))}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} className="bg-gradient-to-r from-blue-500 to-purple-600">
          Create Advanced Goal
        </Button>
      </div>
    </div>
  );
};

export default GoalsManagementSection;