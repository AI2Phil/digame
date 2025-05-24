import React, { useState, useEffect } from 'react';
import { 
  Brain, Target, Users, TrendingUp, Zap, Star,
  Filter, Search, ArrowRight, CheckCircle, Clock
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

const SkillMatchingAlgorithm = ({ userSkills, onMatchFound, onFilterChange }) => {
  const [matchingCriteria, setMatchingCriteria] = useState({
    skillLevel: 'all',
    experience: 'all',
    availability: 'all',
    learningGoals: 'all',
    collaborationType: 'all'
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [algorithmInsights, setAlgorithmInsights] = useState({
    totalCandidates: 1247,
    compatibleMatches: 89,
    highQualityMatches: 23,
    averageCompatibility: 87,
    processingTime: '0.3s'
  });

  const [matchingFactors, setMatchingFactors] = useState([
    {
      factor: 'Skill Complementarity',
      weight: 30,
      description: 'How well skills complement each other',
      impact: 'high',
      score: 92
    },
    {
      factor: 'Learning Goal Alignment',
      weight: 25,
      description: 'Shared learning objectives and career goals',
      impact: 'high',
      score: 88
    },
    {
      factor: 'Experience Level Match',
      weight: 20,
      description: 'Compatible experience levels for effective collaboration',
      impact: 'medium',
      score: 85
    },
    {
      factor: 'Availability Overlap',
      weight: 15,
      description: 'Matching schedules and time zones',
      impact: 'medium',
      score: 78
    },
    {
      factor: 'Communication Style',
      weight: 10,
      description: 'Compatible communication preferences',
      impact: 'low',
      score: 91
    }
  ]);

  const handleCriteriaChange = (key, value) => {
    const newCriteria = { ...matchingCriteria, [key]: value };
    setMatchingCriteria(newCriteria);
    onFilterChange && onFilterChange(newCriteria);
  };

  const runMatchingAlgorithm = () => {
    // Simulate algorithm processing
    setAlgorithmInsights(prev => ({
      ...prev,
      processingTime: '0.2s',
      compatibleMatches: Math.floor(Math.random() * 20) + 80,
      highQualityMatches: Math.floor(Math.random() * 10) + 20
    }));
  };

  return (
    <div className="space-y-6">
      {/* Algorithm Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI-Powered Skill Matching Algorithm
          </CardTitle>
          <CardDescription>
            Advanced machine learning algorithm that analyzes skills, goals, and behavior patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Algorithm Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <Users className="w-6 h-6 mx-auto mb-1 text-blue-600" />
              <p className="text-sm font-medium">Total Pool</p>
              <p className="text-lg font-bold text-blue-600">{algorithmInsights.totalCandidates}</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <Target className="w-6 h-6 mx-auto mb-1 text-green-600" />
              <p className="text-sm font-medium">Compatible</p>
              <p className="text-lg font-bold text-green-600">{algorithmInsights.compatibleMatches}</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <Star className="w-6 h-6 mx-auto mb-1 text-purple-600" />
              <p className="text-sm font-medium">High Quality</p>
              <p className="text-lg font-bold text-purple-600">{algorithmInsights.highQualityMatches}</p>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <TrendingUp className="w-6 h-6 mx-auto mb-1 text-orange-600" />
              <p className="text-sm font-medium">Avg Score</p>
              <p className="text-lg font-bold text-orange-600">{algorithmInsights.averageCompatibility}%</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Zap className="w-6 h-6 mx-auto mb-1 text-gray-600" />
              <p className="text-sm font-medium">Speed</p>
              <p className="text-lg font-bold text-gray-600">{algorithmInsights.processingTime}</p>
            </div>
          </div>

          {/* Matching Criteria Controls */}
          <div className="space-y-4">
            <h4 className="font-medium">Matching Criteria</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Skill Level</label>
                <select 
                  className="w-full border rounded px-3 py-2"
                  value={matchingCriteria.skillLevel}
                  onChange={(e) => handleCriteriaChange('skillLevel', e.target.value)}
                >
                  <option value="all">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Experience Range</label>
                <select 
                  className="w-full border rounded px-3 py-2"
                  value={matchingCriteria.experience}
                  onChange={(e) => handleCriteriaChange('experience', e.target.value)}
                >
                  <option value="all">Any Experience</option>
                  <option value="0-2">0-2 years</option>
                  <option value="3-5">3-5 years</option>
                  <option value="6-10">6-10 years</option>
                  <option value="10+">10+ years</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Collaboration Type</label>
                <select 
                  className="w-full border rounded px-3 py-2"
                  value={matchingCriteria.collaborationType}
                  onChange={(e) => handleCriteriaChange('collaborationType', e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="mentoring">Mentoring</option>
                  <option value="peer-learning">Peer Learning</option>
                  <option value="project-based">Project-Based</option>
                  <option value="skill-exchange">Skill Exchange</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by skills, interests, or goals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button onClick={runMatchingAlgorithm} className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                Find Matches
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Algorithm Factors */}
      <Card>
        <CardHeader>
          <CardTitle>Matching Algorithm Factors</CardTitle>
          <CardDescription>
            How the algorithm weighs different factors to find the best matches
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {matchingFactors.map((factor, index) => (
              <MatchingFactorRow key={index} factor={factor} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Real-time Matching Process */}
      <Card>
        <CardHeader>
          <CardTitle>Real-time Matching Process</CardTitle>
          <CardDescription>
            Live view of how matches are being processed and scored
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MatchingProcessVisualization />
        </CardContent>
      </Card>
    </div>
  );
};

const MatchingFactorRow = ({ factor }) => (
  <div className="p-4 border rounded-lg">
    <div className="flex justify-between items-start mb-2">
      <div>
        <h5 className="font-medium">{factor.factor}</h5>
        <p className="text-sm text-gray-600">{factor.description}</p>
      </div>
      <div className="text-right">
        <Badge variant={factor.impact === 'high' ? 'destructive' : factor.impact === 'medium' ? 'warning' : 'secondary'}>
          {factor.impact} impact
        </Badge>
        <p className="text-sm font-medium mt-1">{factor.weight}% weight</p>
      </div>
    </div>
    <div className="flex items-center gap-3">
      <div className="flex-1">
        <Progress value={factor.score} className="h-2" />
      </div>
      <span className="text-sm font-medium">{factor.score}%</span>
    </div>
  </div>
);

const MatchingProcessVisualization = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const steps = [
    { name: 'Skill Analysis', status: 'completed', time: '0.1s' },
    { name: 'Goal Alignment', status: 'completed', time: '0.05s' },
    { name: 'Behavior Matching', status: 'processing', time: '0.08s' },
    { name: 'Compatibility Scoring', status: 'pending', time: '0.07s' },
    { name: 'Result Ranking', status: 'pending', time: '0.03s' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % steps.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium">Processing Pipeline</h4>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-green-600">Live Processing</span>
        </div>
      </div>
      
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step.status === 'completed' ? 'bg-green-100 text-green-600' :
              step.status === 'processing' ? 'bg-blue-100 text-blue-600' :
              'bg-gray-100 text-gray-400'
            }`}>
              {step.status === 'completed' ? (
                <CheckCircle className="w-4 h-4" />
              ) : step.status === 'processing' ? (
                <Clock className="w-4 h-4 animate-spin" />
              ) : (
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium">{step.name}</p>
              <p className="text-sm text-gray-500">Processing time: {step.time}</p>
            </div>
            <Badge variant={
              step.status === 'completed' ? 'success' :
              step.status === 'processing' ? 'warning' : 'secondary'
            }>
              {step.status}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkillMatchingAlgorithm;