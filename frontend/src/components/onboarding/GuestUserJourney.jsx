import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import {
  Sparkles, Brain, Users, Zap, BarChart3, Smartphone, Crown,
  ChevronRight, Play, Star, TrendingUp, Shield, Globe,
  CheckCircle, ArrowRight, Eye, Heart, Target, Rocket
} from 'lucide-react';
import FeatureHubShowcase from './FeatureHubShowcase';
import ConversionPrompt from './ConversionPrompt';
import ValueDemonstration from './ValueDemonstration';
import { conversionTrackingService } from '../../services/conversionTrackingService';
import { featureHubService } from '../../services/featureHubService';

const GuestUserJourney = ({ onSignUp, onLogin }) => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState('');
  const [exploredFeatures, setExploredFeatures] = useState([]);
  const [journeyData, setJourneyData] = useState({});
  const [showFeatureHub, setShowFeatureHub] = useState(false);
  const [conversionScore, setConversionScore] = useState(0);

  useEffect(() => {
    // Track journey start
    conversionTrackingService.trackEvent('GUEST_JOURNEY_START', {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    });
  }, []);

  const roles = [
    {
      id: 'developer',
      title: 'Software Developer',
      icon: <Brain className="w-8 h-8" />,
      description: 'Build better code with AI insights',
      features: ['AI Code Analysis', 'Performance Optimization', 'Team Collaboration'],
      color: 'bg-blue-50 border-blue-200 text-blue-700'
    },
    {
      id: 'manager',
      title: 'Team Manager',
      icon: <Users className="w-8 h-8" />,
      description: 'Optimize team performance and workflows',
      features: ['Team Analytics', 'Workflow Automation', 'Performance Insights'],
      color: 'bg-green-50 border-green-200 text-green-700'
    },
    {
      id: 'executive',
      title: 'Executive',
      icon: <Crown className="w-8 h-8" />,
      description: 'Strategic insights and business intelligence',
      features: ['Business Intelligence', 'Predictive Analytics', 'Enterprise Features'],
      color: 'bg-purple-50 border-purple-200 text-purple-700'
    },
    {
      id: 'analyst',
      title: 'Data Analyst',
      icon: <BarChart3 className="w-8 h-8" />,
      description: 'Advanced analytics and data visualization',
      features: ['Data Visualization', 'Custom Reports', 'Predictive Modeling'],
      color: 'bg-orange-50 border-orange-200 text-orange-700'
    }
  ];

  const journeySteps = [
    { id: 1, title: 'Welcome', description: 'Discover your potential' },
    { id: 2, title: 'Role Selection', description: 'Personalize your experience' },
    { id: 3, title: 'Feature Discovery', description: 'Explore capabilities' },
    { id: 4, title: 'Value Demonstration', description: 'See the impact' },
    { id: 5, title: 'Join the Platform', description: 'Start your journey' }
  ];

  const handleRoleSelection = (role) => {
    setSelectedRole(role.id);
    setJourneyData(prev => ({ ...prev, role: role }));
    
    conversionTrackingService.trackEvent('ROLE_SELECTED', {
      roleId: role.id,
      roleTitle: role.title,
      step: currentStep
    });
    
    setConversionScore(prev => prev + 20);
    setTimeout(() => setCurrentStep(3), 500);
  };

  const handleFeatureExplored = (feature) => {
    if (!exploredFeatures.includes(feature.id)) {
      setExploredFeatures(prev => [...prev, feature.id]);
      setConversionScore(prev => prev + 10);
      
      conversionTrackingService.trackEvent('FEATURE_EXPLORED', {
        featureId: feature.id,
        featureName: feature.label,
        roleContext: selectedRole,
        exploredCount: exploredFeatures.length + 1
      });
    }
  };

  const handleHubPageNavigation = (path, featureName) => {
    conversionTrackingService.trackEvent('HUB_PAGE_VISITED', {
      path,
      featureName,
      roleContext: selectedRole,
      conversionScore
    });
    
    // Open in new tab to keep journey active
    window.open(path, '_blank');
  };

  const handleConversionPoint = (action) => {
    conversionTrackingService.trackEvent('CONVERSION_POINT_REACHED', {
      action,
      step: currentStep,
      roleContext: selectedRole,
      exploredFeatures: exploredFeatures.length,
      conversionScore
    });
    
    if (action === 'signup') {
      conversionTrackingService.trackEvent('SIGNUP_INITIATED', {
        journeyData,
        conversionScore,
        exploredFeatures
      });
      onSignUp && onSignUp();
    } else if (action === 'login') {
      onLogin && onLogin();
    }
  };

  const renderWelcomeStep = () => (
    <div className="text-center space-y-8">
      <div className="space-y-4">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900">
          Welcome to <span className="text-blue-600">Digame</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Your AI-powered professional development platform with <strong>100% complete features</strong> 
          ready to transform your career and team collaboration.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <Card className="border-2 border-blue-100 hover:border-blue-300 transition-colors">
          <CardContent className="p-6 text-center">
            <Brain className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">AI-Powered Insights</h3>
            <p className="text-gray-600 text-sm">Advanced behavioral analysis and predictive modeling</p>
          </CardContent>
        </Card>
        
        <Card className="border-2 border-green-100 hover:border-green-300 transition-colors">
          <CardContent className="p-6 text-center">
            <Zap className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Complete Automation</h3>
            <p className="text-gray-600 text-sm">Advanced workflow engine with marketplace</p>
          </CardContent>
        </Card>
        
        <Card className="border-2 border-purple-100 hover:border-purple-300 transition-colors">
          <CardContent className="p-6 text-center">
            <BarChart3 className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Enterprise Analytics</h3>
            <p className="text-gray-600 text-sm">Comprehensive business intelligence dashboards</p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
        <div className="flex items-center justify-center space-x-4 mb-4">
          <Badge variant="outline" className="bg-white">
            <Star className="w-3 h-3 mr-1" />
            100% Complete Platform
          </Badge>
          <Badge variant="outline" className="bg-white">
            <Shield className="w-3 h-3 mr-1" />
            Enterprise Ready
          </Badge>
          <Badge variant="outline" className="bg-white">
            <Globe className="w-3 h-3 mr-1" />
            40+ Integrations
          </Badge>
        </div>
        <p className="text-gray-700 text-center">
          Join thousands of professionals who have transformed their careers with our complete platform
        </p>
      </div>

      <Button 
        onClick={() => setCurrentStep(2)}
        size="lg"
        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
      >
        Start Your Journey
        <ArrowRight className="w-5 h-5 ml-2" />
      </Button>
    </div>
  );

  const renderRoleSelection = () => (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-gray-900">Choose Your Role</h2>
        <p className="text-lg text-gray-600">
          Let's personalize your experience based on your professional role
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {roles.map((role) => (
          <Card 
            key={role.id}
            className={`cursor-pointer border-2 hover:shadow-lg transition-all duration-300 ${
              selectedRole === role.id ? role.color : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => handleRoleSelection(role)}
          >
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-lg ${role.color.split(' ')[0]} ${role.color.split(' ')[1]}`}>
                  {role.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{role.title}</h3>
                  <p className="text-gray-600 mb-4">{role.description}</p>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Key Features:</p>
                    <div className="flex flex-wrap gap-2">
                      {role.features.map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-500">
          Don't see your role? No problem! You can explore all features regardless of your selection.
        </p>
      </div>
    </div>
  );

  const renderFeatureDiscovery = () => (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-gray-900">Explore Platform Features</h2>
        <p className="text-lg text-gray-600">
          Discover the complete feature set tailored for {roles.find(r => r.id === selectedRole)?.title}s
        </p>
        <div className="flex justify-center space-x-4">
          <Badge variant="outline" className="bg-blue-50">
            <Eye className="w-3 h-3 mr-1" />
            {exploredFeatures.length} Features Explored
          </Badge>
          <Badge variant="outline" className="bg-green-50">
            <TrendingUp className="w-3 h-3 mr-1" />
            {conversionScore}% Engagement Score
          </Badge>
        </div>
      </div>

      <FeatureHubShowcase
        selectedRole={selectedRole}
        onFeatureExplored={handleFeatureExplored}
        onHubPageNavigation={handleHubPageNavigation}
        exploredFeatures={exploredFeatures}
      />

      <ConversionPrompt
        step="feature_discovery"
        roleContext={selectedRole}
        exploredFeatures={exploredFeatures.length}
        onConversion={handleConversionPoint}
      />

      <div className="text-center">
        <Button 
          onClick={() => setCurrentStep(4)}
          size="lg"
          disabled={exploredFeatures.length < 3}
          className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
        >
          See the Value
          <Target className="w-5 h-5 ml-2" />
        </Button>
        {exploredFeatures.length < 3 && (
          <p className="text-sm text-gray-500 mt-2">
            Explore at least 3 features to continue
          </p>
        )}
      </div>
    </div>
  );

  const renderValueDemonstration = () => (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-gray-900">See Your Potential Impact</h2>
        <p className="text-lg text-gray-600">
          Based on your role and interests, here's what Digame can do for you
        </p>
      </div>

      <ValueDemonstration
        selectedRole={selectedRole}
        exploredFeatures={exploredFeatures}
        onConversion={handleConversionPoint}
      />

      <div className="text-center">
        <Button 
          onClick={() => setCurrentStep(5)}
          size="lg"
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          Join the Platform
          <Rocket className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );

  const renderJoinPlatform = () => (
    <div className="text-center space-y-8">
      <div className="space-y-4">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
            <Heart className="w-10 h-10 text-white" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-gray-900">Ready to Transform Your Career?</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          You've explored {exploredFeatures.length} features and achieved a {conversionScore}% engagement score. 
          Join thousands of professionals already using Digame.
        </p>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 max-w-2xl mx-auto">
        <h3 className="text-xl font-semibold mb-4">What happens next?</h3>
        <div className="grid md:grid-cols-2 gap-4 text-left">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium">Instant Access</p>
              <p className="text-sm text-gray-600">All features available immediately</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium">Personalized Setup</p>
              <p className="text-sm text-gray-600">Tailored to your role and goals</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium">AI Insights</p>
              <p className="text-sm text-gray-600">Immediate productivity recommendations</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium">Community Access</p>
              <p className="text-sm text-gray-600">Connect with like-minded professionals</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <Button 
          onClick={() => handleConversionPoint('signup')}
          size="lg"
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 w-full max-w-md"
        >
          Create Your Account
          <Sparkles className="w-5 h-5 ml-2" />
        </Button>
        
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <button 
              onClick={() => handleConversionPoint('login')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Sign in here
            </button>
          </p>
        </div>
      </div>

      <div className="text-xs text-gray-500">
        <p>✨ No credit card required • 🔒 Enterprise-grade security • 🚀 Instant setup</p>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderWelcomeStep();
      case 2: return renderRoleSelection();
      case 3: return renderFeatureDiscovery();
      case 4: return renderValueDemonstration();
      case 5: return renderJoinPlatform();
      default: return renderWelcomeStep();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Progress Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">D</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Digame</span>
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                Guest Journey
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline">
                Step {currentStep} of {journeySteps.length}
              </Badge>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleConversionPoint('login')}
              >
                Sign In
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>{journeySteps[currentStep - 1]?.title}</span>
              <span>{Math.round((currentStep / journeySteps.length) * 100)}% complete</span>
            </div>
            <Progress value={(currentStep / journeySteps.length) * 100} className="h-2" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {renderCurrentStep()}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2025 Digame. Transform your professional development with AI.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GuestUserJourney;