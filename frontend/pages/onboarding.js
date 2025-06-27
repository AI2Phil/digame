import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Button from '../src/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../src/components/ui/Card';
import { Input } from '../src/components/ui/Input';
import { Progress } from '../src/components/ui/Progress';
import { Badge } from '../src/components/ui/Badge';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [onboardingData, setOnboardingData] = useState({
    role: '',
    experience: '',
    goals: [],
    skills: [],
    workStyle: '',
    preferences: {
      notifications: true,
      analytics: true,
      coaching: true
    }
  });

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/auth');
    }
  }, [router]);

  const handleInputChange = (field, value) => {
    setOnboardingData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayToggle = (field, item) => {
    setOnboardingData(prev => ({
      ...prev,
      [field]: prev[field].includes(item)
        ? prev[field].filter(i => i !== item)
        : [...prev[field], item]
    }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:8000/api/auth/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(onboardingData),
      });

      if (response.ok) {
        router.push('/dashboard');
      } else {
        console.error('Onboarding failed');
        // For demo purposes, still redirect to dashboard
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Onboarding error:', error);
      // For demo purposes, still redirect to dashboard
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">What's your role?</h2>
              <p className="text-gray-600">Help us understand your professional background</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {[
                'Software Engineer', 'Product Manager', 'Designer', 'Data Scientist',
                'Marketing Manager', 'Sales Representative', 'Consultant', 'Other'
              ].map((role) => (
                <Button
                  key={role}
                  variant={onboardingData.role === role ? 'primary' : 'outline'}
                  onClick={() => handleInputChange('role', role)}
                  className="h-16 text-left justify-start"
                >
                  {role}
                </Button>
              ))}
            </div>
            
            {onboardingData.role === 'Other' && (
              <Input
                placeholder="Please specify your role"
                value={onboardingData.customRole || ''}
                onChange={(e) => handleInputChange('customRole', e.target.value)}
              />
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Experience Level</h2>
              <p className="text-gray-600">How many years of professional experience do you have?</p>
            </div>
            
            <div className="space-y-3">
              {[
                { value: 'entry', label: '0-2 years (Entry Level)', icon: '🌱' },
                { value: 'mid', label: '3-5 years (Mid Level)', icon: '🌿' },
                { value: 'senior', label: '6-10 years (Senior Level)', icon: '🌳' },
                { value: 'expert', label: '10+ years (Expert Level)', icon: '🏆' }
              ].map((exp) => (
                <Button
                  key={exp.value}
                  variant={onboardingData.experience === exp.value ? 'primary' : 'outline'}
                  onClick={() => handleInputChange('experience', exp.value)}
                  className="w-full h-16 text-left justify-start"
                >
                  <span className="mr-3 text-xl">{exp.icon}</span>
                  {exp.label}
                </Button>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Goals</h2>
              <p className="text-gray-600">What do you want to achieve? (Select all that apply)</p>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {[
                { value: 'productivity', label: 'Increase Productivity', icon: '📈' },
                { value: 'skills', label: 'Develop New Skills', icon: '🎯' },
                { value: 'career', label: 'Advance Career', icon: '🚀' },
                { value: 'leadership', label: 'Improve Leadership', icon: '👥' },
                { value: 'balance', label: 'Work-Life Balance', icon: '⚖️' },
                { value: 'networking', label: 'Build Network', icon: '🤝' }
              ].map((goal) => (
                <Button
                  key={goal.value}
                  variant={onboardingData.goals.includes(goal.value) ? 'primary' : 'outline'}
                  onClick={() => handleArrayToggle('goals', goal.value)}
                  className="w-full h-16 text-left justify-start"
                >
                  <span className="mr-3 text-xl">{goal.icon}</span>
                  {goal.label}
                  {onboardingData.goals.includes(goal.value) && (
                    <Check className="ml-auto h-5 w-5" />
                  )}
                </Button>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Preferences</h2>
              <p className="text-gray-600">Customize your Digame experience</p>
            </div>
            
            <div className="space-y-4">
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Smart Notifications</h3>
                    <p className="text-sm text-gray-600">Get AI-powered insights and reminders</p>
                  </div>
                  <Button
                    variant={onboardingData.preferences.notifications ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => handleInputChange('preferences', {
                      ...onboardingData.preferences,
                      notifications: !onboardingData.preferences.notifications
                    })}
                  >
                    {onboardingData.preferences.notifications ? 'On' : 'Off'}
                  </Button>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Advanced Analytics</h3>
                    <p className="text-sm text-gray-600">Detailed productivity and behavior analysis</p>
                  </div>
                  <Button
                    variant={onboardingData.preferences.analytics ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => handleInputChange('preferences', {
                      ...onboardingData.preferences,
                      analytics: !onboardingData.preferences.analytics
                    })}
                  >
                    {onboardingData.preferences.analytics ? 'On' : 'Off'}
                  </Button>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">AI Coaching</h3>
                    <p className="text-sm text-gray-600">Personalized recommendations and guidance</p>
                  </div>
                  <Button
                    variant={onboardingData.preferences.coaching ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => handleInputChange('preferences', {
                      ...onboardingData.preferences,
                      coaching: !onboardingData.preferences.coaching
                    })}
                  >
                    {onboardingData.preferences.coaching ? 'On' : 'Off'}
                  </Button>
                </div>
              </Card>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">🎉 You're all set!</h3>
              <p className="text-sm text-blue-700">
                Your digital twin is ready to start learning about your work patterns and providing personalized insights.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return onboardingData.role !== '';
      case 2:
        return onboardingData.experience !== '';
      case 3:
        return onboardingData.goals.length > 0;
      case 4:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      {/* Glassmorphic Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">D</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Digame Onboarding</span>
          </div>
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Step {currentStep} of {totalSteps}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {/* Onboarding Card */}
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-xl backdrop-blur-lg bg-white/90 border border-white/20">
            <CardContent className="p-8">
              {renderStep()}
              
              {/* Navigation */}
              <div className="flex justify-between mt-8">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                  className="flex items-center"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                
                <Button
                  onClick={handleNext}
                  disabled={!canProceed() || isLoading}
                  loading={isLoading && currentStep === totalSteps}
                  className="flex items-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {currentStep === totalSteps ? (
                    isLoading ? 'Completing...' : 'Complete Setup'
                  ) : (
                    <>
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Skip Option */}
        <div className="text-center mt-6">
          <Button
            variant="link"
            onClick={() => router.push('/dashboard')}
            className="text-gray-600 hover:text-gray-900"
            disabled={isLoading}
          >
            Skip for now
          </Button>
        </div>
      </div>
    </div>
  );
}