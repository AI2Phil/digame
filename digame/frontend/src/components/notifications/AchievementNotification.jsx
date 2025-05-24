import React, { useState, useEffect } from 'react';
import { Trophy, Star, X, Share2, Eye } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';

const AchievementNotification = ({ 
  achievement, 
  isVisible, 
  onClose, 
  onView, 
  onShare,
  autoHide = true,
  duration = 8000 
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      
      if (autoHide) {
        // Start progress animation
        const progressInterval = setInterval(() => {
          setProgress(prev => {
            if (prev >= 100) {
              clearInterval(progressInterval);
              handleAutoClose();
              return 100;
            }
            return prev + (100 / (duration / 100));
          });
        }, 100);

        return () => clearInterval(progressInterval);
      }
    } else {
      setIsAnimating(false);
      setProgress(0);
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
    onView?.(achievement);
    handleManualClose();
  };

  const handleShare = () => {
    onShare?.(achievement);
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common': return 'from-gray-400 to-gray-600';
      case 'uncommon': return 'from-green-400 to-green-600';
      case 'rare': return 'from-blue-400 to-blue-600';
      case 'epic': return 'from-purple-400 to-purple-600';
      case 'legendary': return 'from-yellow-400 to-yellow-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getRarityBadgeColor = (rarity) => {
    switch (rarity) {
      case 'common': return 'secondary';
      case 'uncommon': return 'success';
      case 'rare': return 'default';
      case 'epic': return 'warning';
      case 'legendary': return 'destructive';
      default: return 'secondary';
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div
        className={`transform transition-all duration-500 ease-out ${
          isAnimating 
            ? 'translate-x-0 opacity-100 scale-100' 
            : 'translate-x-full opacity-0 scale-95'
        }`}
      >
        <Card className="w-80 shadow-2xl border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50">
          <CardContent className="p-0">
            {/* Header with gradient background */}
            <div className={`bg-gradient-to-r ${getRarityColor(achievement.rarity)} p-4 text-white relative overflow-hidden`}>
              {/* Animated sparkles background */}
              <div className="absolute inset-0 opacity-20">
                {[...Array(12)].map((_, i) => (
                  <Star
                    key={i}
                    className={`absolute w-3 h-3 animate-pulse`}
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 2}s`,
                      animationDuration: `${2 + Math.random() * 2}s`
                    }}
                  />
                ))}
              </div>
              
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white bg-opacity-20 rounded-full">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Achievement Unlocked!</h3>
                    <Badge variant={getRarityBadgeColor(achievement.rarity)} className="mt-1">
                      {achievement.rarity}
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

            {/* Achievement Details */}
            <div className="p-4">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-lg text-gray-900 mb-1">
                    {achievement.title}
                  </h4>
                  <p className="text-gray-600 text-sm mb-2">
                    {achievement.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant="success" className="text-xs">
                      +{achievement.points} points
                    </Badge>
                    {achievement.category && (
                      <Badge variant="secondary" className="text-xs">
                        {achievement.category}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Progress indicator for related achievements */}
              {achievement.nextAchievement && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">Next: {achievement.nextAchievement.title}</span>
                    <span>{achievement.nextAchievement.progress}%</span>
                  </div>
                  <Progress value={achievement.nextAchievement.progress} className="h-2" />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleView}
                  className="flex-1"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleShare}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>

              {/* Auto-hide progress bar */}
              {autoHide && (
                <div className="mt-3">
                  <Progress 
                    value={progress} 
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

// Achievement Notification Manager Component
export const AchievementNotificationManager = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Subscribe to achievement notifications
    const unsubscribe = notificationService.on('notificationAdded', (notification) => {
      if (notification.type === 'achievement') {
        showAchievementNotification(notification.data);
      }
    });

    return unsubscribe;
  }, []);

  const showAchievementNotification = (achievement) => {
    const id = `achievement_${Date.now()}`;
    const newNotification = {
      id,
      achievement,
      isVisible: true
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove after animation completes
    setTimeout(() => {
      removeNotification(id);
    }, 10000);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleClose = (id) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === id ? { ...n, isVisible: false } : n
      )
    );
    
    setTimeout(() => {
      removeNotification(id);
    }, 500);
  };

  const handleView = (achievement) => {
    // Navigate to achievements page
    window.location.href = `/profile?tab=achievements&highlight=${achievement.id}`;
  };

  const handleShare = async (achievement) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Achievement Unlocked: ${achievement.title}`,
          text: `I just unlocked the "${achievement.title}" achievement! ${achievement.description}`,
          url: window.location.origin
        });
      } else {
        // Fallback to clipboard
        const shareText = `🏆 Achievement Unlocked: ${achievement.title}\n${achievement.description}\n\nCheck out Digame: ${window.location.origin}`;
        await navigator.clipboard.writeText(shareText);
        Toast.success('Achievement details copied to clipboard!');
      }
    } catch (error) {
      console.error('Failed to share achievement:', error);
    }
  };

  return (
    <div className="fixed top-0 right-0 z-50 pointer-events-none">
      <div className="space-y-4 p-4 pointer-events-auto">
        {notifications.map((notification) => (
          <AchievementNotification
            key={notification.id}
            achievement={notification.achievement}
            isVisible={notification.isVisible}
            onClose={() => handleClose(notification.id)}
            onView={handleView}
            onShare={handleShare}
          />
        ))}
      </div>
    </div>
  );
};

export default AchievementNotification;