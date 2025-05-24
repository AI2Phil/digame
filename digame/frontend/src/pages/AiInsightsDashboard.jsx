import React, { useState, useEffect } from 'react';
import { 
  Brain, TrendingUp, Target, Lightbulb, 
  BookOpen, Award, Clock, BarChart3,
  Zap, Users, Calendar, ArrowRight,
  CheckCircle, AlertTriangle, Star
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Progress } from '../components/ui/Progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { Toast } from '../components/ui/Toast';
import recommendationEngine from '../services/recommendationEngine';
import coachingService from '../services/coachingService';
import apiService from '../services/apiService';

const AiInsightsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [insights, setInsights] = useState({});
  const [recommendations, setRecommendations] = useState([]);
  const [coachingPlan, setCoachingPlan] = useState(null);
  const [skillGaps, setSkillGaps] = useState([]);
  const [learningPaths, setLearningPaths] = useState([]);

  useEffect(() => {
    loadAiInsights();
  }, []);

  const loadAiInsights = async () => {
    setLoading(true);
    try {
      const userId = localStorage.getItem('userId');
      
      // Initialize AI services
      await Promise.all([
        recommendationEngine.initialize(userId),
        coachingService.initialize(userId)
      ]);

      // Load all AI insights
      const [
        skillAnalysis,
        learningRecs,
        coachingInsights,
        performanceCoaching,
        behaviorAnalysis
      ] = await Promise.all([
        recommendationEngine.analyzeSkillGaps(),
        recommendationEngine.generateLearningRecommendations(),
        coachingService.generateCoachingInsights(),
        coachingService.generatePerformanceCoaching(),
        coachingService.analyzeBehavioralPatterns()
      ]);

      setSkillGaps(skillAnalysis.gaps);
      setRecommendations(learningRecs.recommendations);
      setLearningPaths(learningRecs.learningPaths);
      setCoachingPlan(performanceCoaching.coachingPlan);
      setInsights({
        skillAnalysis,
        learningRecommendations: learningRecs,
        coachingInsights,
        performanceCoaching,
        behaviorAnalysis
      });

    } catch (error) {
      console.error('Failed to load AI insights:', error);
      Toast.error('Failed to load AI insights');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRecommendation = async (recommendationId) => {
    try {
      await apiService.acceptRecommendation(recommendationId);
      Toast.success('Recommendation accepted and added to your learning plan');
      loadAiInsights(); // Refresh data
    } catch (error) {
      Toast.error('Failed to accept recommendation');
    }
  };

  const handleStartCoachingPlan = async () => {
    try {
      await apiService.startCoachingPlan(coachingPlan.id);
      Toast.success('Coaching plan started! You\'ll receive daily guidance.');
    } catch (error) {
      Toast.error('Failed to start coaching plan');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Analyzing your data and generating insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Insights Dashboard</h1>
              <p className="text-gray-600">Personalized recommendations and intelligent coaching</p>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <InsightCard
              title="Skill Gaps Identified"
              value={skillGaps.length}
              icon={Target}
              color="blue"
              trend="+2 from last analysis"
            />
            <InsightCard
              title="Learning Recommendations"
              value={recommendations.length}
              icon={BookOpen}
              color="green"
              trend="Personalized for you"
            />
            <InsightCard
              title="Coaching Insights"
              value={insights.coachingInsights?.insights?.length || 0}
              icon={Lightbulb}
              color="purple"
              trend="Updated daily"
            />
            <InsightCard
              title="Performance Score"
              value={`${Math.round((insights.performanceCoaching?.currentPerformance?.overallScore || 0) * 100)}%`}
              icon={TrendingUp}
              color="orange"
              trend={insights.performanceCoaching?.currentPerformance?.productivity?.trend || 'stable'}
            />
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="skills">Skill Analysis</TabsTrigger>
            <TabsTrigger value="learning">Learning Path</TabsTrigger>
            <TabsTrigger value="coaching">AI Coaching</TabsTrigger>
            <TabsTrigger value="insights">Behavioral Insights</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <OverviewSection 
              insights={insights}
              onStartCoaching={handleStartCoachingPlan}
            />
          </TabsContent>

          {/* Skills Analysis Tab */}
          <TabsContent value="skills" className="space-y-6">
            <SkillAnalysisSection 
              skillGaps={skillGaps}
              skillAnalysis={insights.skillAnalysis}
            />
          </TabsContent>

          {/* Learning Path Tab */}
          <TabsContent value="learning" className="space-y-6">
            <LearningPathSection 
              recommendations={recommendations}
              learningPaths={learningPaths}
              onAcceptRecommendation={handleAcceptRecommendation}
            />
          </TabsContent>

          {/* AI Coaching Tab */}
          <TabsContent value="coaching" className="space-y-6">
            <CoachingSection 
              coachingPlan={coachingPlan}
              performanceCoaching={insights.performanceCoaching}
              onStartPlan={handleStartCoachingPlan}
            />
          </TabsContent>

          {/* Behavioral Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <BehavioralInsightsSection 
              behaviorAnalysis={insights.behaviorAnalysis}
              coachingInsights={insights.coachingInsights}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Insight Card Component
const InsightCard = ({ title, value, icon: Icon, color, trend }) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    purple: 'text-purple-600 bg-purple-100',
    orange: 'text-orange-600 bg-orange-100'
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-1">{trend}</p>
          </div>
          <div className={`p-3 rounded-full ${colorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Overview Section Component
const OverviewSection = ({ insights, onStartCoaching }) => (
  <div className="space-y-6">
    {/* AI Summary */}
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          AI-Powered Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Key Insights</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium">Strong Performance Areas</p>
                  <p className="text-sm text-gray-600">Your goal completion rate is above average</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium">Improvement Opportunities</p>
                  <p className="text-sm text-gray-600">Time management could be optimized</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Star className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="font-medium">Growth Potential</p>
                  <p className="text-sm text-gray-600">High potential in technical skills development</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Recommended Actions</h4>
            <div className="space-y-2">
              <Button className="w-full justify-start" onClick={onStartCoaching}>
                <Zap className="w-4 h-4 mr-2" />
                Start AI Coaching Plan
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <BookOpen className="w-4 h-4 mr-2" />
                Explore Learning Recommendations
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Target className="w-4 h-4 mr-2" />
                Address Skill Gaps
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Quick Wins */}
    <Card>
      <CardHeader>
        <CardTitle>Quick Wins</CardTitle>
        <CardDescription>Easy improvements you can implement today</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickWinCard
            title="Time Blocking"
            description="Schedule focused work blocks"
            impact="High"
            effort="Low"
            time="15 min setup"
          />
          <QuickWinCard
            title="Distraction Removal"
            description="Eliminate 3 common distractions"
            impact="Medium"
            effort="Low"
            time="10 min"
          />
          <QuickWinCard
            title="Goal Review"
            description="Update and prioritize goals"
            impact="High"
            effort="Medium"
            time="30 min"
          />
        </div>
      </CardContent>
    </Card>
  </div>
);

// Quick Win Card Component
const QuickWinCard = ({ title, description, impact, effort, time }) => (
  <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
    <h4 className="font-medium text-gray-900 mb-2">{title}</h4>
    <p className="text-sm text-gray-600 mb-3">{description}</p>
    <div className="flex items-center justify-between text-xs">
      <div className="flex gap-2">
        <Badge variant={impact === 'High' ? 'success' : 'secondary'}>
          {impact} Impact
        </Badge>
        <Badge variant={effort === 'Low' ? 'success' : 'warning'}>
          {effort} Effort
        </Badge>
      </div>
      <span className="text-gray-500">{time}</span>
    </div>
  </div>
);

// Skill Analysis Section Component
const SkillAnalysisSection = ({ skillGaps, skillAnalysis }) => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5" />
          Skill Gap Analysis
        </CardTitle>
        <CardDescription>
          AI-powered analysis of your skill development opportunities
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {skillGaps.slice(0, 5).map((gap, index) => (
            <SkillGapCard key={index} gap={gap} />
          ))}
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Skill Development Roadmap</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Overall Skill Score</span>
            <span className="font-bold">{Math.round((skillAnalysis?.overallScore || 0) * 20)}/100</span>
          </div>
          <Progress value={(skillAnalysis?.overallScore || 0) * 20} className="h-3" />
          <p className="text-sm text-gray-600">
            Focus on the top 3 skill gaps for maximum impact on your career growth.
          </p>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Skill Gap Card Component
const SkillGapCard = ({ gap }) => (
  <div className="p-4 border rounded-lg">
    <div className="flex items-start justify-between mb-3">
      <div>
        <h4 className="font-medium text-gray-900">{gap.skill}</h4>
        <p className="text-sm text-gray-600">{gap.category}</p>
      </div>
      <Badge variant={gap.priority === 'high' ? 'destructive' : gap.priority === 'medium' ? 'warning' : 'secondary'}>
        {gap.priority} priority
      </Badge>
    </div>
    
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>Current Level</span>
        <span>{gap.currentLevel}/5</span>
      </div>
      <Progress value={(gap.currentLevel / 5) * 100} className="h-2" />
      
      <div className="flex justify-between text-sm">
        <span>Target Level</span>
        <span>{gap.requiredLevel}/5</span>
      </div>
      <Progress value={(gap.requiredLevel / 5) * 100} className="h-2" />
    </div>
    
    <div className="mt-3 flex items-center justify-between text-sm">
      <span className="text-gray-600">Est. Time: {gap.timeEstimate}h</span>
      <Button size="sm" variant="outline">
        <ArrowRight className="w-3 h-3 mr-1" />
        Learn More
      </Button>
    </div>
  </div>
);

// Learning Path Section Component
const LearningPathSection = ({ recommendations, learningPaths, onAcceptRecommendation }) => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Personalized Learning Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {recommendations.slice(0, 6).map((rec, index) => (
            <RecommendationCard 
              key={index} 
              recommendation={rec}
              onAccept={() => onAcceptRecommendation(rec.id)}
            />
          ))}
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Optimized Learning Paths</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {learningPaths.slice(0, 3).map((path, index) => (
            <LearningPathCard key={index} path={path} />
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

// Recommendation Card Component
const RecommendationCard = ({ recommendation, onAccept }) => (
  <div className="p-4 border rounded-lg">
    <div className="flex items-start justify-between mb-3">
      <div>
        <h4 className="font-medium text-gray-900">{recommendation.title}</h4>
        <p className="text-sm text-gray-600 mt-1">{recommendation.description}</p>
      </div>
      <Badge variant="success">
        {Math.round(recommendation.relevanceScore * 100)}% match
      </Badge>
    </div>
    
    <div className="space-y-2 mb-3">
      <div className="flex items-center gap-2 text-sm">
        <Clock className="w-4 h-4 text-gray-500" />
        <span>{recommendation.estimatedTime} minutes</span>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <BarChart3 className="w-4 h-4 text-gray-500" />
        <span>Difficulty: {recommendation.difficulty}/5</span>
      </div>
    </div>
    
    <p className="text-xs text-gray-600 mb-3">{recommendation.personalizedReason}</p>
    
    <Button size="sm" onClick={onAccept} className="w-full">
      Add to Learning Plan
    </Button>
  </div>
);

// Learning Path Card Component
const LearningPathCard = ({ path }) => (
  <div className="p-4 border rounded-lg">
    <div className="flex items-center justify-between mb-3">
      <h4 className="font-medium text-gray-900">{path.name}</h4>
      <Badge variant="secondary">{path.estimatedCompletion}</Badge>
    </div>
    <p className="text-sm text-gray-600 mb-3">{path.description}</p>
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-500">{path.modules?.length || 0} modules</span>
      <Button size="sm" variant="outline">
        Start Path
      </Button>
    </div>
  </div>
);

// Coaching Section Component
const CoachingSection = ({ coachingPlan, performanceCoaching, onStartPlan }) => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          AI Performance Coaching
        </CardTitle>
      </CardHeader>
      <CardContent>
        {coachingPlan ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {coachingPlan.phases?.map((phase, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <h4 className="font-medium">Phase {phase.phase}: {phase.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{phase.focus}</p>
                  <p className="text-xs text-gray-500 mt-2">{phase.duration}</p>
                </div>
              ))}
            </div>
            <Button onClick={onStartPlan} className="w-full">
              Start Coaching Plan
            </Button>
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Coaching Plan Ready</h3>
            <p className="text-gray-600 mb-4">Your personalized coaching plan is being generated</p>
            <Button onClick={onStartPlan}>Generate Coaching Plan</Button>
          </div>
        )}
      </CardContent>
    </Card>
  </div>
);

// Behavioral Insights Section Component
const BehavioralInsightsSection = ({ behaviorAnalysis, coachingInsights }) => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          Behavioral Pattern Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {behaviorAnalysis?.map((insight, index) => (
            <div key={index} className="p-4 border rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">{insight.title}</h4>
              <p className="text-sm text-gray-600 mb-3">{insight.insight}</p>
              <div className="space-y-2">
                {insight.recommendations?.slice(0, 3).map((rec, recIndex) => (
                  <div key={recIndex} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

export default AiInsightsDashboard;