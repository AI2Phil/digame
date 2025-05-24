import React, { useState } from 'react';
import { 
  Trophy, Award, Star, Medal, Crown, 
  Target, TrendingUp, Calendar, CheckCircle,
  Lock, Unlock, Gift, Zap, Fire
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';

const AchievementsSection = ({ achievements }) => {
  const [activeCategory, setActiveCategory] = useState('all');

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
    { id: 'activity', name: 'Activity', icon: TrendingUp },
    { id: 'profile', name: 'Profile', icon: Star },
    { id: 'learning', name: 'Learning', icon: Award }
  ];

  const filteredAchievements = activeCategory === 'all' 
    ? allAchievements 
    : allAchievements.filter(achievement => achievement.category === activeCategory);

  const earnedAchievements = allAchievements.filter(a => a.earned);
  const totalPoints = earnedAchievements.reduce((sum, a) => sum + a.points, 0);

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'uncommon': return 'bg-green-100 text-green-800 border-green-300';
      case 'rare': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'epic': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'legendary': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getAchievementIcon = (iconName) => {
    switch (iconName) {
      case 'target': return Target;
      case 'trophy': return Trophy;
      case 'fire': return Fire;
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
                      getRarityColor={getRarityColor}
                      getAchievementIcon={getAchievementIcon}
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

// Achievement Card Component
const AchievementCard = ({ achievement, getRarityColor, getAchievementIcon }) => {
  const Icon = getAchievementIcon(achievement.icon);
  const isEarned = achievement.earned;
  const progressPercentage = (achievement.progress / achievement.max_progress) * 100;

  return (
    <Card className={`transition-all hover:shadow-md ${isEarned ? 'bg-gradient-to-br from-yellow-50 to-orange-50' : 'opacity-75'}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-full ${isEarned ? 'bg-yellow-100' : 'bg-gray-100'}`}>
            {isEarned ? (
              <Icon className="w-6 h-6 text-yellow-600" />
            ) : (
              <Lock className="w-6 h-6 text-gray-400" />
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`text-xs ${getRarityColor(achievement.rarity)}`}>
              {achievement.rarity}
            </Badge>
            {isEarned && <CheckCircle className="w-4 h-4 text-green-600" />}
          </div>
        </div>

        <h3 className={`font-medium mb-2 ${isEarned ? 'text-gray-900' : 'text-gray-500'}`}>
          {achievement.title}
        </h3>
        <p className={`text-sm mb-4 ${isEarned ? 'text-gray-600' : 'text-gray-400'}`}>
          {achievement.description}
        </p>

        {!isEarned && (
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{achievement.progress} / {achievement.max_progress}</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Gift className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-600">
              {achievement.points} pts
            </span>
          </div>
          {isEarned && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
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