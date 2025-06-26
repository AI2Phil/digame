import React, { useState, useEffect } from 'react';
import {
  Trophy, Award, Star, Medal, Crown,
  Target, TrendingUp, Calendar, CheckCircle,
  Lock, Unlock, Gift, Zap, Flame, BookOpen, Users,
  Sparkles, Gem, Shield, Sword
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';

const AchievementsSection = ({ achievements }) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Detect dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    
    checkDarkMode();
    
    // Watch for dark mode changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);

  // Mock achievements data structure
  const mockAchievements = [
    {
      id: 1,
      title: "First Steps",
      description: "Complete your first goal",
      category: "goals",
      icon: "target",
      rarity: "common",
      earned: true,
      earned_date: "2025-05-20",
      progress: 100,
      max_progress: 100,
      points: 10
    },
    {
      id: 2,
      title: "Goal Crusher",
      description: "Complete 10 goals",
      category: "goals",
      icon: "trophy",
      rarity: "rare",
      earned: true,
      earned_date: "2025-05-22",
      progress: 100,
      max_progress: 100,
      points: 50
    },
    {
      id: 3,
      title: "Streak Master",
      description: "Maintain a 30-day activity streak",
      category: "activity",
      icon: "fire",
      rarity: "epic",
      earned: false,
      progress: 15,
      max_progress: 30,
      points: 100
    },
    {
      id: 4,
      title: "Profile Perfectionist",
      description: "Complete 100% of your profile",
      category: "profile",
      icon: "star",
      rarity: "uncommon",
      earned: true,
      earned_date: "2025-05-21",
      progress: 100,
      max_progress: 100,
      points: 25
    },
    {
      id: 5,
      title: "Learning Legend",
      description: "Complete 50 learning goals",
      category: "learning",
      icon: "crown",
      rarity: "legendary",
      earned: false,
      progress: 12,
      max_progress: 50,
      points: 200
    }
  ];

  const allAchievements = achievements.length > 0 ? achievements : mockAchievements;

  const categories = [
    { id: 'all', name: 'All', icon: Trophy },
    { id: 'goals', name: 'Goals', icon: Target },
    { id: 'learning', name: 'Learning', icon: BookOpen },
    { id: 'social', name: 'Social', icon: Users },
    { id: 'activity', name: 'Activity', icon: TrendingUp },
    { id: 'profile', name: 'Profile', icon: Star }
  ];

  const filteredAchievements = activeCategory === 'all' 
    ? allAchievements 
    : allAchievements.filter(achievement => achievement.category === activeCategory);

  const earnedAchievements = allAchievements.filter(a => a.earned);
  const totalPoints = earnedAchievements.reduce((sum, a) => sum + a.points, 0);

  const getRarityStyles = (rarity) => {
    const baseStyles = "text-xs font-semibold px-2 py-1 rounded-full border transition-all duration-200";
    
    switch (rarity?.toLowerCase()) {
      case 'legendary':
        return isDarkMode
          ? `${baseStyles} border-yellow-400 bg-yellow-900/30 text-yellow-300 shadow-lg shadow-yellow-500/20`
          : `${baseStyles} border-yellow-400 bg-yellow-100 text-yellow-700 shadow-lg shadow-yellow-500/20`;
      case 'epic':
        return isDarkMode
          ? `${baseStyles} border-purple-400 bg-purple-900/30 text-purple-300 shadow-lg shadow-purple-500/20`
          : `${baseStyles} border-purple-300 bg-purple-100 text-purple-700 shadow-lg shadow-purple-500/20`;
      case 'rare':
        return isDarkMode
          ? `${baseStyles} border-blue-400 bg-blue-900/30 text-blue-300 shadow-md shadow-blue-500/20`
          : `${baseStyles} border-blue-300 bg-blue-100 text-blue-700 shadow-md shadow-blue-500/20`;
      case 'uncommon':
        return isDarkMode
          ? `${baseStyles} border-green-400 bg-green-900/30 text-green-300 shadow-md shadow-green-500/20`
          : `${baseStyles} border-green-300 bg-green-100 text-green-700 shadow-md shadow-green-500/20`;
      case 'common':
        return isDarkMode
          ? `${baseStyles} border-gray-500 bg-gray-800/30 text-gray-300`
          : `${baseStyles} border-gray-300 bg-gray-100 text-gray-700`;
      default:
        return isDarkMode
          ? `${baseStyles} border-gray-500 bg-gray-800/30 text-gray-300`
          : `${baseStyles} border-gray-300 bg-gray-100 text-gray-700`;
    }
  };

  const getRarityIcon = (rarity) => {
    switch (rarity?.toLowerCase()) {
      case 'legendary': return Crown;
      case 'epic': return Gem;
      case 'rare': return Shield;
      case 'uncommon': return Sword;
      case 'common': return Star;
      default: return Star;
    }
  };

  const getRarityGlow = (rarity) => {
    if (!rarity) return '';
    
    switch (rarity.toLowerCase()) {
      case 'legendary': return 'shadow-2xl shadow-yellow-500/30 ring-2 ring-yellow-400/50';
      case 'epic': return 'shadow-xl shadow-purple-500/30 ring-2 ring-purple-400/50';
      case 'rare': return 'shadow-lg shadow-blue-500/20 ring-1 ring-blue-400/30';
      case 'uncommon': return 'shadow-md shadow-green-500/20 ring-1 ring-green-400/30';
      default: return '';
    }
  };

  const getAchievementIcon = (iconName) => {
    switch (iconName) {
      case 'target': return Target;
      case 'trophy': return Trophy;
      case 'fire': return Flame;
      case 'star': return Star;
      case 'crown': return Crown;
      case 'medal': return Medal;
      case 'award': return Award;
      default: return Trophy;
    }
  };

  return (
    <div className="space-y-6">
      {/* Achievements Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Achievements & Rewards
          </CardTitle>
          <CardDescription>
            Track your accomplishments and unlock rewards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AchievementsOverview 
            totalAchievements={allAchievements.length}
            earnedAchievements={earnedAchievements.length}
            totalPoints={totalPoints}
          />
        </CardContent>
      </Card>

      {/* Category Tabs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Browse Achievements</h3>
            <Badge variant="secondary">
              {filteredAchievements.filter(a => a.earned).length} / {filteredAchievements.length} earned
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeCategory} onValueChange={setActiveCategory}>
            <TabsList className="grid w-full grid-cols-5">
              {categories.map(category => {
                const Icon = category.icon;
                return (
                  <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {category.name}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {categories.map(category => (
              <TabsContent key={category.id} value={category.id} className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredAchievements.map(achievement => (
                    <AchievementCard
                      key={achievement.id}
                      achievement={achievement}
                      getRarityStyles={getRarityStyles}
                      getRarityIcon={getRarityIcon}
                      getRarityGlow={getRarityGlow}
                      getAchievementIcon={getAchievementIcon}
                      isDarkMode={isDarkMode}
                    />
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Recent Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Recent Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RecentAchievements achievements={earnedAchievements} />
        </CardContent>
      </Card>
    </div>
  );
};

// Achievements Overview Component
const AchievementsOverview = ({ totalAchievements, earnedAchievements, totalPoints }) => {
  const completionRate = (earnedAchievements / totalAchievements) * 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="text-center">
        <div className="text-2xl font-bold text-yellow-600">{earnedAchievements}</div>
        <p className="text-sm text-gray-600">Achievements Earned</p>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-blue-600">{totalAchievements}</div>
        <p className="text-sm text-gray-600">Total Available</p>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-purple-600">{totalPoints}</div>
        <p className="text-sm text-gray-600">Points Earned</p>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-green-600">{Math.round(completionRate)}%</div>
        <p className="text-sm text-gray-600">Completion Rate</p>
      </div>
    </div>
  );
};

// Enhanced Achievement Card Component
const AchievementCard = ({
  achievement,
  getRarityStyles,
  getRarityIcon,
  getRarityGlow,
  getAchievementIcon,
  isDarkMode
}) => {
  const Icon = getAchievementIcon(achievement.icon);
  const RarityIcon = getRarityIcon(achievement.rarity);
  const isEarned = achievement.earned;
  const progressPercentage = (achievement.progress / achievement.max_progress) * 100;

  const getCardBackground = () => {
    if (!isEarned) {
      return isDarkMode
        ? 'bg-gray-800/50 border-gray-700 opacity-75'
        : 'bg-gray-50 border-gray-200 opacity-75';
    }

    switch (achievement.rarity?.toLowerCase()) {
      case 'legendary':
        return isDarkMode
          ? 'bg-gradient-to-br from-yellow-900/20 via-orange-900/20 to-red-900/20 border-yellow-500/30'
          : 'bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 border-yellow-300/50';
      case 'epic':
        return isDarkMode
          ? 'bg-gradient-to-br from-purple-900/20 via-pink-900/20 to-indigo-900/20 border-purple-500/30'
          : 'bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 border-purple-300/50';
      case 'rare':
        return isDarkMode
          ? 'bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border-blue-500/30'
          : 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-300/50';
      case 'uncommon':
        return isDarkMode
          ? 'bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-500/30'
          : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300/50';
      default:
        return isDarkMode
          ? 'bg-gradient-to-br from-gray-800/20 to-slate-800/20 border-gray-500/30'
          : 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-300/50';
    }
  };

  const getIconBackground = () => {
    if (!isEarned) {
      return isDarkMode ? 'bg-gray-700' : 'bg-gray-100';
    }

    switch (achievement.rarity?.toLowerCase()) {
      case 'legendary':
        return isDarkMode ? 'bg-yellow-900/50' : 'bg-yellow-100';
      case 'epic':
        return isDarkMode ? 'bg-purple-900/50' : 'bg-purple-100';
      case 'rare':
        return isDarkMode ? 'bg-blue-900/50' : 'bg-blue-100';
      case 'uncommon':
        return isDarkMode ? 'bg-green-900/50' : 'bg-green-100';
      default:
        return isDarkMode ? 'bg-gray-700' : 'bg-gray-100';
    }
  };

  const getIconColor = () => {
    if (!isEarned) {
      return isDarkMode ? 'text-gray-400' : 'text-gray-400';
    }

    switch (achievement.rarity?.toLowerCase()) {
      case 'legendary':
        return isDarkMode ? 'text-yellow-400' : 'text-yellow-600';
      case 'epic':
        return isDarkMode ? 'text-purple-400' : 'text-purple-600';
      case 'rare':
        return isDarkMode ? 'text-blue-400' : 'text-blue-600';
      case 'uncommon':
        return isDarkMode ? 'text-green-400' : 'text-green-600';
      default:
        return isDarkMode ? 'text-gray-400' : 'text-gray-600';
    }
  };

  const getProgressBarColor = () => {
    switch (achievement.rarity?.toLowerCase()) {
      case 'legendary': return 'bg-yellow-500';
      case 'epic': return 'bg-purple-500';
      case 'rare': return 'bg-blue-500';
      case 'uncommon': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className={`
      transition-all duration-300 hover:shadow-lg hover:scale-105
      ${getCardBackground()}
      ${isEarned ? getRarityGlow(achievement.rarity) : ''}
      border-2
    `}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-full ${getIconBackground()} relative`}>
            {isEarned ? (
              <>
                <Icon className={`w-6 h-6 ${getIconColor()}`} />
                {achievement.rarity !== 'common' && (
                  <div className="absolute -top-1 -right-1">
                    <RarityIcon className={`w-4 h-4 ${getIconColor()}`} />
                  </div>
                )}
              </>
            ) : (
              <Lock className="w-6 h-6 text-gray-400" />
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className={getRarityStyles(achievement.rarity)}>
              <RarityIcon className="w-3 h-3 mr-1 inline" />
              {achievement.rarity}
            </div>
            {isEarned && (
              <div className="relative">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <Sparkles className="w-3 h-3 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
              </div>
            )}
          </div>
        </div>

        <h3 className={`font-semibold mb-2 ${
          isEarned
            ? (isDarkMode ? 'text-white' : 'text-gray-900')
            : (isDarkMode ? 'text-gray-400' : 'text-gray-500')
        }`}>
          {achievement.title}
        </h3>
        <p className={`text-sm mb-4 ${
          isEarned
            ? (isDarkMode ? 'text-gray-300' : 'text-gray-600')
            : (isDarkMode ? 'text-gray-500' : 'text-gray-400')
        }`}>
          {achievement.description}
        </p>

        {!isEarned && (
          <div className="space-y-3 mb-4">
            <div className={`flex justify-between text-sm ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              <span className="font-medium">Progress</span>
              <span className="font-mono">{achievement.progress} / {achievement.max_progress}</span>
            </div>
            <div className="relative">
              <Progress
                value={progressPercentage}
                className={`h-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
              />
              <div
                className={`absolute top-0 left-0 h-3 rounded-full ${getProgressBarColor()} transition-all duration-500`}
                style={{ width: `${progressPercentage}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-white drop-shadow-sm">
                  {Math.round(progressPercentage)}%
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
              isDarkMode ? 'bg-purple-900/30' : 'bg-purple-100'
            }`}>
              <Gift className={`w-4 h-4 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
              <span className={`text-sm font-bold ${
                isDarkMode ? 'text-purple-300' : 'text-purple-700'
              }`}>
                {achievement.points} pts
              </span>
            </div>
          </div>
          {isEarned && (
            <div className={`flex items-center gap-1 text-xs ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <Calendar className="w-3 h-3" />
              <span>{new Date(achievement.earned_date).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Recent Achievements Component
const RecentAchievements = ({ achievements }) => {
  const recentAchievements = achievements
    .sort((a, b) => new Date(b.earned_date) - new Date(a.earned_date))
    .slice(0, 5);

  if (recentAchievements.length === 0) {
    return (
      <div className="text-center py-8">
        <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No achievements earned yet</p>
        <p className="text-sm text-gray-500">Complete goals and activities to earn your first achievement!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {recentAchievements.map(achievement => (
        <div key={achievement.id} className="flex items-center gap-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="p-2 bg-yellow-100 rounded-full">
            <Trophy className="w-5 h-5 text-yellow-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-gray-900">{achievement.title}</h4>
            <p className="text-sm text-gray-600">{achievement.description}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-purple-600">
              <Gift className="w-4 h-4" />
              <span className="font-medium">{achievement.points} pts</span>
            </div>
            <p className="text-xs text-gray-500">
              {new Date(achievement.earned_date).toLocaleDateString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AchievementsSection;