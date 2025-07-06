import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import { Textarea } from '../ui/Textarea';
import {
  ChevronLeft,
  ChevronRight,
  User,
  Brain,
  Target,
  Users,
  Settings,
  Sparkles,
  CheckCircle,
  Star,
  Clock,
  TrendingUp,
  Home,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const OnboardingWizard = ({ onComplete, user }) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Profile Setup
    professional_title: '',
    industry: '',
    experience_level: '',
    
    // Step 2: Skills Assessment
    technical_skills: [],
    soft_skills: [],
    skill_confidence_scores: {},
    
    // Step 3: Personality Profile
    personality_type: '',
    communication_style: '',
    work_style_preferences: {},
    
    // Step 4: Work Style
    collaboration_preference: '',
    meeting_preferences: '',
    
    // Step 5: Goals Setup
    short_term_goals: [],
    long_term_goals: [],
    learning_interests: [],
    career_aspirations: '',
    
    // Step 6: Preview (generated)
    ai_generated_summary: ''
  });

  const [loading, setLoading] = useState(false);
  const [stepData, setStepData] = useState({});
  const [onboardingOptions, setOnboardingOptions] = useState({});
  const [error, setError] = useState(null);

  const steps = [
    { 
      number: 1, 
      title: 'Profile Setup', 
      icon: User, 
      description: 'Tell us about your professional background',
      estimatedTime: '3 min'
    },
    { 
      number: 2, 
      title: 'Skills Assessment', 
      icon: Brain, 
      description: 'Assess your technical and soft skills',
      estimatedTime: '5 min'
    },
    { 
      number: 3, 
      title: 'Personality Profile', 
      icon: Sparkles, 
      description: 'Discover your work personality type',
      estimatedTime: '4 min'
    },
    { 
      number: 4, 
      title: 'Work Style', 
      icon: Users, 
      description: 'Define your collaboration preferences',
      estimatedTime: '3 min'
    },
    { 
      number: 5, 
      title: 'Goals Setup', 
      icon: Target, 
      description: 'Set your learning and career goals',
      estimatedTime: '4 min'
    },
    { 
      number: 6, 
      title: 'Twin Preview', 
      icon: Settings, 
      description: 'Review your digital twin profile',
      estimatedTime: '2 min'
    }
  ];

  useEffect(() => {
    fetchOnboardingOptions();
  }, []);

  useEffect(() => {
    if (currentStep <= 5) {
      fetchStepData(currentStep);
    }
  }, [currentStep]);

  const fetchOnboardingOptions = async () => {
    try {
      const response = await fetch('/api/onboarding/digital-twin/options');
      if (response.ok) {
        const result = await response.json();
        setOnboardingOptions(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch onboarding options:', error);
    }
  };

  const fetchStepData = async (stepNumber) => {
    try {
      const response = await fetch(`/api/onboarding/digital-twin/step/${stepNumber}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const result = await response.json();
        setStepData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch step data:', error);
    }
  };

  const saveStepData = async (stepNumber, data) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/onboarding/digital-twin/step/${stepNumber}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          step_number: stepNumber,
          data: data
        })
      });

      if (response.ok) {
        const result = await response.json();
        return result;
      } else {
        throw new Error('Failed to save step data');
      }
    } catch (error) {
      console.error('Failed to save step data:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const generateTwinSummary = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/onboarding/digital-twin/generate-summary', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setFormData(prev => ({
          ...prev,
          ai_generated_summary: result.data.summary
        }));
        return result.data;
      } else {
        throw new Error('Failed to generate summary');
      }
    } catch (error) {
      console.error('Failed to generate summary:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    try {
      setError(null);
      
      if (currentStep <= 5) {
        const stepData = getStepData(currentStep);
        await saveStepData(currentStep, stepData);
      }

      if (currentStep === 5) {
        // Generate AI summary before moving to step 6
        await generateTwinSummary();
      }

      if (currentStep < 6) {
        setCurrentStep(currentStep + 1);
      } else {
        // Complete onboarding
        console.log('Completing onboarding with data:', formData);
        if (onComplete) {
          try {
            setLoading(true);
            await onComplete(formData);
            console.log('Onboarding completion successful');
            // Don't set loading to false here as the parent will handle navigation
          } catch (completionError) {
            console.error('Onboarding completion failed:', completionError);
            setError('Setup completion in progress. Please wait...');
            setLoading(false);
            // Don't throw the error, let the parent handle it
          }
        } else {
          console.error('No onComplete function provided');
          setError('Setup completion handler not found. Redirecting to dashboard...');
          // Fallback navigation
          setTimeout(() => navigate('/dashboard'), 2000);
        }
      }
    } catch (error) {
      console.error('Error in handleNext:', error);
      setError(error.message || 'Failed to save progress. Please try again.');
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getStepData = (step) => {
    switch (step) {
      case 1:
        return {
          professional_title: formData.professional_title,
          industry: formData.industry,
          experience_level: formData.experience_level
        };
      case 2:
        return {
          technical_skills: formData.technical_skills,
          soft_skills: formData.soft_skills,
          skill_confidence_scores: formData.skill_confidence_scores
        };
      case 3:
        return {
          personality_type: formData.personality_type,
          communication_style: formData.communication_style,
          work_style_preferences: formData.work_style_preferences
        };
      case 4:
        return {
          collaboration_preference: formData.collaboration_preference,
          meeting_preferences: formData.meeting_preferences
        };
      case 5:
        return {
          short_term_goals: formData.short_term_goals,
          long_term_goals: formData.long_term_goals,
          learning_interests: formData.learning_interests,
          career_aspirations: formData.career_aspirations
        };
      default:
        return {};
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleArrayItem = (field, item) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(item) 
        ? prev[field].filter(i => i !== item)
        : [...prev[field], item]
    }));
  };

  const updateConfidenceScore = (skill, score) => {
    setFormData(prev => ({
      ...prev,
      skill_confidence_scores: {
        ...prev.skill_confidence_scores,
        [skill]: score
      }
    }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="professional_title">Professional Title</Label>
              <Input
                id="professional_title"
                value={formData.professional_title}
                onChange={(e) => updateFormData('professional_title', e.target.value)}
                placeholder="e.g., Software Engineer, Product Manager"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="industry">Industry</Label>
              <select
                id="industry"
                value={formData.industry}
                onChange={(e) => updateFormData('industry', e.target.value)}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
              >
                <option value="">Select your industry</option>
                {onboardingOptions.industries?.map(industry => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="experience_level">Experience Level</Label>
              <select
                id="experience_level"
                value={formData.experience_level}
                onChange={(e) => updateFormData('experience_level', e.target.value)}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
              >
                <option value="">Select your experience level</option>
                {onboardingOptions.experience_levels?.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Label>Technical Skills</Label>
              <p className="text-sm text-gray-600 mb-3">Select your technical skills</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {Object.entries(onboardingOptions.skill_categories || {}).map(([category, skills]) => (
                  <div key={category} className="space-y-2">
                    <h4 className="font-medium text-sm text-gray-700">{category}</h4>
                    {skills.map(skill => (
                      <div key={skill} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`tech-${skill}`}
                          checked={formData.technical_skills.includes(skill)}
                          onChange={() => toggleArrayItem('technical_skills', skill)}
                          className="rounded"
                        />
                        <label htmlFor={`tech-${skill}`} className="text-sm">{skill}</label>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {formData.technical_skills.length > 0 && (
              <div>
                <Label>Confidence Levels</Label>
                <p className="text-sm text-gray-600 mb-3">Rate your confidence (1-5)</p>
                <div className="space-y-3">
                  {formData.technical_skills.map(skill => (
                    <div key={skill} className="flex items-center justify-between">
                      <span className="text-sm">{skill}</span>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map(score => (
                          <button
                            key={score}
                            type="button"
                            onClick={() => updateConfidenceScore(skill, score)}
                            className={`w-8 h-8 rounded-full text-xs ${
                              formData.skill_confidence_scores[skill] >= score
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-600'
                            }`}
                          >
                            {score}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <Label>Personality Type</Label>
              <p className="text-sm text-gray-600 mb-3">Choose the type that best describes you</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {onboardingOptions.personality_types?.map(type => (
                  <div
                    key={type}
                    onClick={() => updateFormData('personality_type', type)}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      formData.personality_type === type
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-sm">{type}</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="communication_style">Communication Style</Label>
              <select
                id="communication_style"
                value={formData.communication_style}
                onChange={(e) => updateFormData('communication_style', e.target.value)}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
              >
                <option value="">Select your communication style</option>
                <option value="Direct">Direct</option>
                <option value="Collaborative">Collaborative</option>
                <option value="Analytical">Analytical</option>
                <option value="Visual">Visual</option>
                <option value="Hands-on">Hands-on</option>
              </select>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <Label>Collaboration Preference</Label>
              <div className="grid grid-cols-1 gap-3 mt-3">
                {['Team-based', 'Independent', 'Hybrid', 'Mentoring others', 'Being mentored'].map(pref => (
                  <div
                    key={pref}
                    onClick={() => updateFormData('collaboration_preference', pref)}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      formData.collaboration_preference === pref
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-sm">{pref}</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>Meeting Preferences</Label>
              <div className="grid grid-cols-1 gap-3 mt-3">
                {['Video calls', 'In-person', 'Async communication', 'Quick standups', 'Detailed discussions'].map(pref => (
                  <div
                    key={pref}
                    onClick={() => updateFormData('meeting_preferences', pref)}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      formData.meeting_preferences === pref
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-sm">{pref}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <Label>Short-term Goals (next 6 months)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
                {['Learn new programming language', 'Get promoted', 'Complete certification', 'Build portfolio', 'Network more', 'Improve skills'].map(goal => (
                  <div key={goal} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`short-${goal}`}
                      checked={formData.short_term_goals.includes(goal)}
                      onChange={() => toggleArrayItem('short_term_goals', goal)}
                      className="rounded"
                    />
                    <label htmlFor={`short-${goal}`} className="text-sm">{goal}</label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>Learning Interests</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-3">
                {['Artificial Intelligence', 'Web Development', 'Data Science', 'Mobile Development', 'Cloud Computing', 'Cybersecurity', 'DevOps', 'UI/UX Design', 'Project Management', 'Leadership', 'Entrepreneurship', 'Digital Marketing'].map(interest => (
                  <div key={interest} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`interest-${interest}`}
                      checked={formData.learning_interests.includes(interest)}
                      onChange={() => toggleArrayItem('learning_interests', interest)}
                      className="rounded"
                    />
                    <label htmlFor={`interest-${interest}`} className="text-sm">{interest}</label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="career_aspirations">Career Aspirations</Label>
              <Textarea
                id="career_aspirations"
                value={formData.career_aspirations}
                onChange={(e) => updateFormData('career_aspirations', e.target.value)}
                placeholder="Describe your long-term career goals..."
                className="mt-1"
                rows={3}
              />
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Your Digital Twin is Ready!</h3>
              <p className="text-gray-600">
                We've analyzed your profile and created a personalized experience just for you.
              </p>
            </div>

            {formData.ai_generated_summary && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium mb-2 flex items-center">
                  <Sparkles className="h-4 w-4 mr-2 text-blue-600" />
                  AI-Generated Profile Summary
                </h4>
                <p className="text-sm text-gray-700">{formData.ai_generated_summary}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="font-medium">Profile Complete</div>
                <div className="text-sm text-gray-600">100% ready for personalization</div>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Star className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="font-medium">Skills Assessed</div>
                <div className="text-sm text-gray-600">{formData.technical_skills.length} skills identified</div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="font-medium">Goals Set</div>
                <div className="text-sm text-gray-600">{formData.short_term_goals.length} goals defined</div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium mb-2">What's Next?</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Get personalized learning recommendations</li>
                <li>• Connect with like-minded professionals</li>
                <li>• Track your progress with AI insights</li>
                <li>• Unlock achievements and milestones</li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const currentStepInfo = steps[currentStep - 1];
  const progressPercentage = (currentStep / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold">Digital Twin Onboarding</h1>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-900"
                title="Return to Home"
              >
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Home</span>
              </Button>
            </div>
            <Badge variant="outline">
              Step {currentStep} of {steps.length}
            </Badge>
          </div>
          
          <Progress value={progressPercentage} className="mb-4" />
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>Estimated time: {currentStepInfo?.estimatedTime}</span>
          </div>
        </div>

        {/* Step Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-4">
            {steps.map((step) => {
              const Icon = step.icon;
              const isActive = step.number === currentStep;
              const isCompleted = step.number < currentStep;
              
              return (
                <div
                  key={step.number}
                  className={`flex flex-col items-center space-y-2 ${
                    isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : isCompleted
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <div className="text-xs text-center max-w-20">
                    {step.title}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <currentStepInfo.icon className="h-5 w-5" />
              <span>{currentStepInfo.title}</span>
            </CardTitle>
            <p className="text-gray-600">{currentStepInfo.description}</p>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-red-800 font-medium">Setup Error</p>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            )}
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center space-x-2"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Previous</span>
          </Button>

          <Button
            onClick={handleNext}
            disabled={loading}
            className="flex items-center space-x-2"
          >
            <span>
              {loading 
                ? 'Saving...' 
                : currentStep === 6 
                ? 'Complete Onboarding' 
                : 'Next'
              }
            </span>
            {!loading && currentStep < 6 && <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;