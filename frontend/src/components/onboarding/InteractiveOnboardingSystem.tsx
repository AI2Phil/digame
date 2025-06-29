import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  ChevronRight, ChevronLeft, CheckCircle, Circle,
  Target, User, Briefcase, Settings, Zap, Star,
  Play, BookOpen, Users, TrendingUp, Award,
  Clock, MapPin, Lightbulb, ArrowRight, X,
  HelpCircle, MessageCircle, Video, FileText, Plus
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  type: 'welcome' | 'profile' | 'goals' | 'preferences' | 'tour' | 'quick_wins' | 'completion';
  required: boolean;
  estimated_time: number;
  completed: boolean;
  data?: Record<string, any>;
}

interface OnboardingProgress {
  current_step: number;
  total_steps: number;
  completion_percentage: number;
  time_spent: number;
  started_at: string;
  estimated_completion: string;
}

interface UserGoal {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  timeframe: string;
  measurable: boolean;
  specific: boolean;
  achievable: boolean;
  relevant: boolean;
  time_bound: boolean;
  smart_score: number;
}

interface QuickWin {
  id: string;
  title: string;
  description: string;
  category: string;
  estimated_time: number;
  difficulty: 'easy' | 'medium' | 'hard';
  value_score: number;
  completed: boolean;
  action_url?: string;
}

interface TourStep {
  id: string;
  target: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  action?: string;
}

export const InteractiveOnboardingSystem: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<OnboardingStep[]>([]);
  const [progress, setProgress] = useState<OnboardingProgress | null>(null);
  const [userGoals, setUserGoals] = useState<UserGoal[]>([]);
  const [quickWins, setQuickWins] = useState<QuickWin[]>([]);
  const [tourSteps, setTourSteps] = useState<TourStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTour, setShowTour] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    fetchOnboardingData();
  }, []);

  const fetchOnboardingData = async () => {
    try {
      setLoading(true);
      
      const [stepsRes, progressRes, goalsRes, winsRes, tourRes] = await Promise.all([
        fetch('/api/onboarding/steps', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/onboarding/progress', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/onboarding/goal-templates', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/onboarding/quick-wins', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/onboarding/tour-steps', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      if (stepsRes.ok) {
        const stepsData = await stepsRes.json();
        setSteps(stepsData.steps || []);
      }

      if (progressRes.ok) {
        const progressData = await progressRes.json();
        setProgress(progressData);
        setCurrentStep(progressData.current_step || 0);
      }

      if (goalsRes.ok) {
        const goalsData = await goalsRes.json();
        setUserGoals(goalsData.templates || []);
      }

      if (winsRes.ok) {
        const winsData = await winsRes.json();
        setQuickWins(winsData.quick_wins || []);
      }

      if (tourRes.ok) {
        const tourData = await tourRes.json();
        setTourSteps(tourData.steps || []);
      }

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load onboarding data');
    } finally {
      setLoading(false);
    }
  };

  const handleStepComplete = async (stepId: string, data?: Record<string, any>) => {
    try {
      const response = await fetch(`/api/onboarding/steps/${stepId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ data })
      });

      if (response.ok) {
        await fetchOnboardingData();
        if (currentStep < steps.length - 1) {
          setCurrentStep(currentStep + 1);
        }
      }
    } catch (err) {
      console.error('Failed to complete step:', err);
    }
  };

  const handleGoalCreate = async (goal: Partial<UserGoal>) => {
    try {
      const response = await fetch('/api/onboarding/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(goal)
      });

      if (response.ok) {
        await fetchOnboardingData();
      }
    } catch (err) {
      console.error('Failed to create goal:', err);
    }
  };

  const handleQuickWinComplete = async (winId: string) => {
    try {
      const response = await fetch(`/api/onboarding/quick-wins/${winId}/complete`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        await fetchOnboardingData();
      }
    } catch (err) {
      console.error('Failed to complete quick win:', err);
    }
  };

  const startTour = () => {
    setShowTour(true);
    setTourStep(0);
  };

  const nextTourStep = () => {
    if (tourStep < tourSteps.length - 1) {
      setTourStep(tourStep + 1);
    } else {
      setShowTour(false);
    }
  };

  const skipOnboarding = async () => {
    try {
      await fetch('/api/onboarding/skip', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      // Redirect to main dashboard
    } catch (err) {
      console.error('Failed to skip onboarding:', err);
    }
  };

  const renderWelcomeStep = () => (
    <div className="text-center space-y-6">
      <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto flex items-center justify-center">
        <Star className="h-12 w-12 text-white" />
      </div>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Digame!</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Let's get you set up for success. This quick setup will help you make the most of our platform.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
        {[
          { icon: User, title: 'Set Up Profile', description: 'Tell us about yourself' },
          { icon: Target, title: 'Define Goals', description: 'Set your objectives' },
          { icon: Zap, title: 'Quick Wins', description: 'Get immediate value' },
        ].map((feature, index) => (
          <Card key={index} className="text-center p-4">
            <CardContent className="p-4">
              <feature.icon className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-medium text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="flex items-center justify-center gap-4">
        <Button size="lg" onClick={() => handleStepComplete(steps[currentStep]?.id)}>
          Get Started
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        <Button variant="outline" size="lg" onClick={skipOnboarding}>
          Skip Setup
        </Button>
      </div>
    </div>
  );

  const renderProfileStep = () => (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Tell Us About Yourself</h2>
        <p className="text-gray-600">This helps us personalize your experience</p>
      </div>
      
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              <input
                type="text"
                value={formData.firstName || ''}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your first name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <input
                type="text"
                value={formData.lastName || ''}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your last name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Title
            </label>
            <input
              type="text"
              value={formData.jobTitle || ''}
              onChange={(e) => setFormData({...formData, jobTitle: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Software Engineer, Product Manager"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company
            </label>
            <input
              type="text"
              value={formData.company || ''}
              onChange={(e) => setFormData({...formData, company: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your company name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Experience Level
            </label>
            <select
              value={formData.experienceLevel || ''}
              onChange={(e) => setFormData({...formData, experienceLevel: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select experience level</option>
              <option value="entry">Entry Level (0-2 years)</option>
              <option value="mid">Mid Level (3-5 years)</option>
              <option value="senior">Senior Level (6-10 years)</option>
              <option value="lead">Lead/Principal (10+ years)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Skills (select up to 5)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {[
                'JavaScript', 'Python', 'React', 'Node.js', 'Leadership',
                'Project Management', 'Data Analysis', 'Design', 'Marketing'
              ].map((skill) => (
                <label key={skill} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.skills?.includes(skill) || false}
                    onChange={(e) => {
                      const skills = formData.skills || [];
                      if (e.target.checked) {
                        setFormData({...formData, skills: [...skills, skill]});
                      } else {
                        setFormData({...formData, skills: skills.filter((s: string) => s !== skill)});
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{skill}</span>
                </label>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderGoalsStep = () => (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Set Your Goals</h2>
        <p className="text-gray-600">Define what you want to achieve with SMART criteria</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Goal Templates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {userGoals.slice(0, 6).map((goal) => (
              <div key={goal.id} className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{goal.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" size="xs" icon={null} onRemove={() => {}}>
                        {goal.category}
                      </Badge>
                      <Badge 
                        variant={goal.priority === 'high' ? 'error' : goal.priority === 'medium' ? 'warning' : 'info'} 
                        size="xs"
                        icon={null}
                        onRemove={() => {}}
                      >
                        {goal.priority}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500" />
                        <span className="text-xs text-gray-600">SMART: {goal.smart_score}/5</span>
                      </div>
                    </div>
                  </div>
                  <Button size="sm" onClick={() => handleGoalCreate(goal)}>
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Create Custom Goal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Goal Title
              </label>
              <input
                type="text"
                value={formData.goalTitle || ''}
                onChange={(e) => setFormData({...formData, goalTitle: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Learn React in 3 months"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.goalDescription || ''}
                onChange={(e) => setFormData({...formData, goalDescription: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe your goal in detail..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.goalCategory || ''}
                  onChange={(e) => setFormData({...formData, goalCategory: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select category</option>
                  <option value="career">Career Development</option>
                  <option value="skills">Skill Building</option>
                  <option value="leadership">Leadership</option>
                  <option value="personal">Personal Growth</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timeframe
                </label>
                <select
                  value={formData.goalTimeframe || ''}
                  onChange={(e) => setFormData({...formData, goalTimeframe: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select timeframe</option>
                  <option value="1_month">1 Month</option>
                  <option value="3_months">3 Months</option>
                  <option value="6_months">6 Months</option>
                  <option value="1_year">1 Year</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SMART Criteria
              </label>
              <div className="space-y-2">
                {[
                  { key: 'specific', label: 'Specific - Clear and well-defined' },
                  { key: 'measurable', label: 'Measurable - Quantifiable progress' },
                  { key: 'achievable', label: 'Achievable - Realistic and attainable' },
                  { key: 'relevant', label: 'Relevant - Aligned with your objectives' },
                  { key: 'timeBound', label: 'Time-bound - Has a deadline' },
                ].map((criteria) => (
                  <label key={criteria.key} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData[criteria.key] || false}
                      onChange={(e) => setFormData({...formData, [criteria.key]: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{criteria.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <Button 
              className="w-full" 
              onClick={() => handleGoalCreate({
                title: formData.goalTitle,
                description: formData.goalDescription,
                category: formData.goalCategory,
                timeframe: formData.goalTimeframe,
                specific: formData.specific,
                measurable: formData.measurable,
                achievable: formData.achievable,
                relevant: formData.relevant,
                time_bound: formData.timeBound,
              })}
            >
              Create Goal
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderQuickWinsStep = () => (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Quick Wins</h2>
        <p className="text-gray-600">Complete these tasks to get immediate value from the platform</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickWins.map((win) => (
          <Card key={win.id} className={`hover:shadow-lg transition-shadow ${win.completed ? 'bg-green-50 border-green-200' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">{win.title}</h3>
                  <p className="text-sm text-gray-600">{win.description}</p>
                </div>
                {win.completed ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-400" />
                )}
              </div>

              <div className="flex items-center gap-2 mb-3">
                <Badge variant="outline" size="xs" icon={null} onRemove={() => {}}>
                  {win.category}
                </Badge>
                <Badge 
                  variant={win.difficulty === 'easy' ? 'success' : win.difficulty === 'medium' ? 'warning' : 'error'} 
                  size="xs"
                  icon={null}
                  onRemove={() => {}}
                >
                  {win.difficulty}
                </Badge>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{win.estimated_time} min</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-yellow-500" />
                  <span>Value: {win.value_score}/10</span>
                </div>
              </div>

              {!win.completed && (
                <Button 
                  size="sm" 
                  className="w-full"
                  onClick={() => handleQuickWinComplete(win.id)}
                >
                  <Play className="h-3 w-3 mr-1" />
                  Complete Task
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-600 mb-4">
          Completed {quickWins.filter(w => w.completed).length} of {quickWins.length} quick wins
        </p>
        <div className="w-full bg-gray-200 rounded-full h-2 max-w-md mx-auto">
          <div
            className="bg-green-600 h-2 rounded-full"
            style={{ width: `${(quickWins.filter(w => w.completed).length / quickWins.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );

  const renderTourStep = () => (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Platform Tour</h2>
        <p className="text-gray-600">Let us show you around the key features</p>
      </div>

      <Card>
        <CardContent className="p-6 text-center space-y-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto flex items-center justify-center">
            <Video className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Interactive Platform Tour</h3>
          <p className="text-gray-600">
            Take a guided tour of the platform to discover key features and learn how to navigate effectively.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button onClick={startTour}>
              <Play className="h-4 w-4 mr-2" />
              Start Tour
            </Button>
            <Button variant="outline" onClick={() => handleStepComplete(steps[currentStep]?.id)}>
              Skip Tour
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { icon: FileText, title: 'Documentation', description: 'Access help articles and guides' },
          { icon: MessageCircle, title: 'Support Chat', description: 'Get help from our team' },
          { icon: Users, title: 'Community', description: 'Connect with other users' },
          { icon: BookOpen, title: 'Learning Center', description: 'Tutorials and best practices' },
        ].map((resource, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 text-center">
              <resource.icon className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <h4 className="font-medium text-gray-900 mb-1">{resource.title}</h4>
              <p className="text-sm text-gray-600">{resource.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderCompletionStep = () => (
    <div className="text-center space-y-6">
      <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-blue-600 rounded-full mx-auto flex items-center justify-center">
        <CheckCircle className="h-12 w-12 text-white" />
      </div>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">You're All Set!</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Congratulations! You've completed the onboarding process. You're ready to start achieving your goals.
        </p>
      </div>

      {progress && (
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6">
            <h3 className="font-medium text-gray-900 mb-4">Onboarding Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Time Spent:</span>
                <span className="font-medium">{Math.round(progress.time_spent / 60)} minutes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Steps Completed:</span>
                <span className="font-medium">{progress.total_steps}/{progress.total_steps}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Goals Set:</span>
                <span className="font-medium">{userGoals.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Quick Wins:</span>
                <span className="font-medium">{quickWins.filter(w => w.completed).length}/{quickWins.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-center gap-4">
        <Button size="lg" onClick={() => window.location.href = '/dashboard'}>
          Go to Dashboard
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        <Button variant="outline" size="lg" onClick={startTour}>
          Take Platform Tour
        </Button>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    const step = steps[currentStep];
    if (!step) return null;

    switch (step.type) {
      case 'welcome':
        return renderWelcomeStep();
      case 'profile':
        return renderProfileStep();
      case 'goals':
        return renderGoalsStep();
      case 'quick_wins':
        return renderQuickWinsStep();
      case 'tour':
        return renderTourStep();
      case 'completion':
        return renderCompletionStep();
      default:
        return <div>Unknown step type</div>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading onboarding...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <X className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Onboarding</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchOnboardingData}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress Header */}
      {progress && (
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-medium text-gray-900">Setup Progress</h2>
              <span className="text-sm text-gray-600">
                Step {currentStep + 1} of {steps.length}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress.completion_percentage}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-gray-600">
              <span>{progress.completion_percentage}% complete</span>
              <span>Est. {Math.round((Date.parse(progress.estimated_completion) - Date.now()) / 60000)} min remaining</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {renderCurrentStep()}
        </div>
      </div>

      {/* Navigation Footer */}
      {steps.length > 0 && currentStep < steps.length - 1 && (
        <div className="bg-white border-t border-gray-200 px-6 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            <div className="flex items-center gap-2">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`w-2 h-2 rounded-full ${
                    index === currentStep
                      ? 'bg-blue-600'
                      : index < currentStep
                      ? 'bg-green-600'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            <Button
              onClick={() => {
                if (steps[currentStep]?.type === 'profile') {
                  handleStepComplete(steps[currentStep].id, formData);
                } else {
                  handleStepComplete(steps[currentStep]?.id);
                }
              }}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Tour Overlay */}
      {showTour && tourSteps.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <Card className="max-w-md mx-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{tourSteps[tourStep]?.title}</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTour(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{tourSteps[tourStep]?.content}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  {tourStep + 1} of {tourSteps.length}
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowTour(false)}>
                    Skip Tour
                  </Button>
                  <Button onClick={nextTourStep}>
                    {tourStep < tourSteps.length - 1 ? 'Next' : 'Finish'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};