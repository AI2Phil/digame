import React, { useState, useEffect } from 'react';
import { Target, TrendingUp, CheckCircle, X, Eye, Edit } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import notificationService from '../../services/notificationService';

const ProgressAlert = ({ 
  goal, 
  progress, 
  milestone, 
  isVisible, 
  onClose, 
  onView, 
  onUpdate,
  autoHide = true,
  duration = 6000 
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(100);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      
      if (autoHide) {
        const interval = setInterval(() => {
          setTimeRemaining(prev => {
            if (prev <= 0) {
              clearInterval(interval);
              handleAutoClose();
              return 0;
            }
            return prev - (100 / (duration / 100));
          });
        }, 100);

        return () => clearInterval(interval);
      }
    } else {
      setIsAnimating(false);
      setTimeRemaining(100);
    }
  }, [isVisible, autoHide, duration]);

  const handleAutoClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleManualClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleView = () => {
    onView?.(goal);
    handleManualClose();
  };

  const handleUpdate = () => {
    onUpdate?.(goal);
    handleManualClose();
  };

  const getProgressColor = (progress) => {
    if (progress >= 100) return 'from-green-400 to-green-600';
    if (progress >= 75) return 'from-blue-400 to-blue-600';
    if (progress >= 50) return 'from-yellow-400 to-yellow-600';
    return 'from-gray-400 to-gray-600';
  };

  const getAlertType = () => {
    if (milestone) {
      if (progress >= 100) return 'completion';
      return 'milestone';
    }
    return 'progress';
  };

  const getAlertIcon = () => {
    const alertType = getAlertType();
    switch (alertType) {
      case 'completion': return CheckCircle;
      case 'milestone': return Target;
      default: return TrendingUp;
    }
  };

  const getAlertTitle = () => {
    const alertType = getAlertType();
    switch (alertType) {
      case 'completion': return '🎉 Goal Completed!';
      case 'milestone': return '🎯 Milestone Reached!';
      default: return '📈 Progress Update';
    }
  };

  const getAlertMessage = () => {
    if (milestone) {
      return milestone.description || `You've reached ${progress}% of your goal!`;
    }
    return `Your goal "${goal.title}" is now ${progress}% complete`;
  };

  if (!isVisible) return null;

  const AlertIcon = getAlertIcon();
  const alertType = getAlertType();

  return (
    <div className="fixed top-20 right-4 z-40">
      <div
        className={`transform transition-all duration-500 ease-out ${
          isAnimating 
            ? 'translate-x-0 opacity-100 scale-100' 
            : 'translate-x-full opacity-0 scale-95'
        }`}
      >
        <Card className={`w-80 shadow-xl border-2 ${
          alertType === 'completion' ? 'border-green-300 bg-gradient-to-br from-green-50 to-emerald-50' :
          alertType === 'milestone' ? 'border-blue-300 bg-gradient-to-br from-blue-50 to-cyan-50' :
          'border-gray-300 bg-gradient-to-br from-gray-50 to-slate-50'
        }`}>
          <CardContent className="p-0">
            {/* Header */}
            <div className={`bg-gradient-to-r ${getProgressColor(progress)} p-4 text-white relative`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white bg-opacity-20 rounded-full">
                    <AlertIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{getAlertTitle()}</h3>
                    <Badge 
                      variant={alertType === 'completion' ? 'success' : 'secondary'} 
                      className="mt-1"
                    >
                      {goal.category || 'Goal'}
                    </Badge>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleManualClose}
                  className="text-white hover:bg-white hover:bg-opacity-20"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">
                  {goal.title}
                </h4>
                <p className="text-gray-600 text-sm mb-3">
                  {getAlertMessage()}
                </p>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Progress</span>
                    <span>{progress}% ({goal.current_value || 0} / {goal.target_value || 100})</span>
                  </div>
                  <Progress 
                    value={progress} 
                    className={`h-3 ${
                      progress >= 100 ? 'bg-green-100' : 
                      progress >= 75 ? 'bg-blue-100' : 'bg-gray-100'
                    }`}
                  />
                </div>

                {/* Milestone Details */}
                {milestone && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-blue-900">Milestone Achieved</span>
                    </div>
                    <p className="text-sm text-blue-700">{milestone.description}</p>
                    {milestone.reward && (
                      <div className="mt-2">
                        <Badge variant="success" className="text-xs">
                          +{milestone.reward} points
                        </Badge>
                      </div>
                    )}
                  </div>
                )}

                {/* Goal Details */}
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Priority:</span>
                    <Badge 
                      variant={
                        goal.priority === 'high' ? 'destructive' :
                        goal.priority === 'medium' ? 'warning' : 'secondary'
                      }
                      className="ml-2 text-xs"
                    >
                      {goal.priority || 'medium'}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-gray-500">Due:</span>
                    <span className="ml-2 font-medium">
                      {goal.target_date ? new Date(goal.target_date).toLocaleDateString() : 'No deadline'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleView}
                  className="flex-1"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Goal
                </Button>
                {progress < 100 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleUpdate}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Update
                  </Button>
                )}
              </div>

              {/* Auto-hide progress */}
              {autoHide && (
                <div className="mt-3">
                  <Progress 
                    value={timeRemaining} 
                    className="h-1 bg-gray-200"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Progress Alert Manager Component
export const ProgressAlertManager = () => {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    // Subscribe to goal progress notifications
    const unsubscribe = notificationService.on('notificationAdded', (notification) => {
      if (notification.type === 'goal_progress') {
        showProgressAlert(notification.data);
      }
    });

    return unsubscribe;
  }, []);

  const showProgressAlert = (data) => {
    const { goal, progress, milestone } = data;
    const id = `progress_${goal.id}_${Date.now()}`;
    
    const newAlert = {
      id,
      goal,
      progress,
      milestone,
      isVisible: true
    };

    setAlerts(prev => [...prev, newAlert]);

    // Auto-remove after duration
    setTimeout(() => {
      removeAlert(id);
    }, 8000);
  };

  const removeAlert = (id) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const handleClose = (id) => {
    setAlerts(prev => 
      prev.map(a => 
        a.id === id ? { ...a, isVisible: false } : a
      )
    );
    
    setTimeout(() => {
      removeAlert(id);
    }, 500);
  };

  const handleView = (goal) => {
    // Navigate to goals page with specific goal highlighted
    window.location.href = `/profile?tab=goals&highlight=${goal.id}`;
  };

  const handleUpdate = (goal) => {
    // Navigate to goal update form
    window.location.href = `/profile?tab=goals&edit=${goal.id}`;
  };

  return (
    <div className="fixed top-0 right-0 z-40 pointer-events-none">
      <div className="space-y-4 p-4 pointer-events-auto">
        {alerts.map((alert) => (
          <ProgressAlert
            key={alert.id}
            goal={alert.goal}
            progress={alert.progress}
            milestone={alert.milestone}
            isVisible={alert.isVisible}
            onClose={() => handleClose(alert.id)}
            onView={handleView}
            onUpdate={handleUpdate}
          />
        ))}
      </div>
    </div>
  );
};

export default ProgressAlert;