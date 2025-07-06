import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  Sparkles, TrendingUp, Users, Clock, Star, ArrowRight,
  CheckCircle, Zap, Target, Heart, Crown, Gift
} from 'lucide-react';

const ConversionPrompt = ({ 
  step, 
  roleContext, 
  exploredFeatures = 0, 
  onConversion 
}) => {
  const [currentPrompt, setCurrentPrompt] = useState(null);
  const [showUrgency, setShowUrgency] = useState(false);

  // Conversion prompts based on journey step and context
  const conversionPrompts = {
    feature_discovery: {
      low_engagement: {
        title: "Discover What You're Missing",
        subtitle: "Join thousands of professionals already transforming their careers",
        benefits: [
          "Instant access to all AI-powered features",
          "Personalized insights from day one",
          "Complete workflow automation suite"
        ],
        cta: "Start Free Trial",
        urgency: "Limited time: Full platform access for 30 days",
        socialProof: "12,000+ professionals already using Digame"
      },
      medium_engagement: {
        title: "You're Seeing the Power - Now Experience It",
        subtitle: `Perfect for ${roleContext}s who want to excel`,
        benefits: [
          "All features you've explored, fully unlocked",
          "AI recommendations tailored to your role",
          "Advanced analytics and automation"
        ],
        cta: "Get Full Access",
        urgency: "Join now and get priority onboarding support",
        socialProof: "95% of users see productivity gains in first week"
      },
      high_engagement: {
        title: "Ready to Transform Your Professional Life?",
        subtitle: "You've explored the possibilities - now make them reality",
        benefits: [
          "Everything you've seen, plus exclusive features",
          "Personal AI coach and insights engine",
          "Priority support and community access"
        ],
        cta: "Join the Platform",
        urgency: "Early adopter bonus: 50% off first 3 months",
        socialProof: "Top 1% of engaged prospects - you're ready!"
      }
    },
    value_demonstration: {
      roi_focused: {
        title: "See Your ROI in Real Numbers",
        subtitle: "Based on your role and interests, here's your potential impact",
        benefits: [
          "Average 40% productivity increase",
          "Save 10+ hours per week on automation",
          "Career advancement 3x faster"
        ],
        cta: "Calculate My ROI",
        urgency: "Limited spots for personalized ROI analysis",
        socialProof: "Average user saves $50,000 annually in productivity gains"
      }
    },
    final_conversion: {
      comprehensive: {
        title: "Everything You Need to Succeed",
        subtitle: "Complete platform access with no limitations",
        benefits: [
          "100% of features unlocked immediately",
          "Personal onboarding specialist",
          "30-day money-back guarantee"
        ],
        cta: "Start Your Journey",
        urgency: "Join today and get exclusive founder's pricing",
        socialProof: "4.9/5 stars from 10,000+ professionals"
      }
    }
  };

  // Success stories based on role
  const successStories = {
    developer: {
      name: "Sarah Chen",
      role: "Senior Developer",
      company: "TechCorp",
      result: "Reduced debugging time by 60% with AI insights",
      timeframe: "within 2 weeks"
    },
    manager: {
      name: "Mike Rodriguez",
      role: "Engineering Manager",
      company: "StartupXYZ",
      result: "Improved team productivity by 45%",
      timeframe: "in first month"
    },
    executive: {
      name: "Lisa Wang",
      role: "VP of Engineering",
      company: "Enterprise Inc",
      result: "Achieved 25% faster product delivery",
      timeframe: "within quarter"
    },
    analyst: {
      name: "David Kim",
      role: "Data Analyst",
      company: "Analytics Pro",
      result: "Created insights 3x faster with AI tools",
      timeframe: "immediately"
    }
  };

  useEffect(() => {
    // Determine engagement level and appropriate prompt
    let engagementLevel = 'low_engagement';
    
    if (exploredFeatures >= 5) {
      engagementLevel = 'high_engagement';
    } else if (exploredFeatures >= 3) {
      engagementLevel = 'medium_engagement';
    }

    // Get appropriate prompt based on step and engagement
    const stepPrompts = conversionPrompts[step];
    if (stepPrompts) {
      const prompt = stepPrompts[engagementLevel] || stepPrompts[Object.keys(stepPrompts)[0]];
      setCurrentPrompt(prompt);
    }

    // Show urgency after some time
    const urgencyTimer = setTimeout(() => setShowUrgency(true), 10000);
    return () => clearTimeout(urgencyTimer);
  }, [step, exploredFeatures]);

  if (!currentPrompt) return null;

  const successStory = successStories[roleContext] || successStories.developer;

  return (
    <div className="space-y-6">
      {/* Main Conversion Card */}
      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            {/* Header */}
            <div className="space-y-2">
              <div className="flex justify-center">
                <Badge variant="outline" className="bg-white text-blue-700 border-blue-200">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Special Offer
                </Badge>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{currentPrompt.title}</h3>
              <p className="text-lg text-gray-600">{currentPrompt.subtitle}</p>
            </div>

            {/* Benefits */}
            <div className="space-y-3">
              {currentPrompt.benefits.map((benefit, index) => (
                <div key={index} className="flex items-center justify-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <div className="space-y-3">
              <Button 
                onClick={() => onConversion('signup')}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3"
              >
                {currentPrompt.cta}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              
              {showUrgency && (
                <div className="animate-pulse">
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                    <Clock className="w-3 h-3 mr-1" />
                    {currentPrompt.urgency}
                  </Badge>
                </div>
              )}
            </div>

            {/* Social Proof */}
            <div className="text-sm text-gray-600">
              <div className="flex items-center justify-center space-x-2">
                <Users className="w-4 h-4" />
                <span>{currentPrompt.socialProof}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Success Story */}
      <Card className="border border-green-200 bg-green-50">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Star className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h4 className="font-semibold text-gray-900">{successStory.name}</h4>
                <Badge variant="outline" className="text-xs">
                  {successStory.role}
                </Badge>
              </div>
              <p className="text-gray-700 mb-2">
                "{successStory.result} {successStory.timeframe} using Digame's AI-powered platform."
              </p>
              <p className="text-sm text-gray-600">{successStory.company}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Comparison Teaser */}
      <Card className="border border-gray-200">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <h4 className="text-lg font-semibold text-gray-900">
              What You Get vs. Other Platforms
            </h4>
            
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="space-y-2">
                <div className="font-medium text-gray-900">Other Platforms</div>
                <div className="space-y-1 text-gray-600">
                  <div>❌ Basic analytics</div>
                  <div>❌ Limited automation</div>
                  <div>❌ No AI insights</div>
                  <div>❌ Separate tools</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="font-medium text-blue-600">Digame Free</div>
                <div className="space-y-1 text-gray-600">
                  <div>✅ Advanced analytics</div>
                  <div>✅ Basic automation</div>
                  <div>✅ AI recommendations</div>
                  <div>✅ Integrated platform</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="font-medium text-purple-600">Digame Pro</div>
                <div className="space-y-1 text-gray-600">
                  <div>✅ Everything in Free</div>
                  <div>✅ Advanced AI insights</div>
                  <div>✅ Complete automation</div>
                  <div>✅ Team collaboration</div>
                </div>
              </div>
            </div>
            
            <Button 
              variant="outline"
              onClick={() => onConversion('signup')}
              className="border-purple-200 text-purple-700 hover:bg-purple-50"
            >
              See Full Comparison
              <Target className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Trust Indicators */}
      <div className="flex justify-center space-x-8 text-sm text-gray-600">
        <div className="flex items-center space-x-2">
          <Shield className="w-4 h-4 text-green-600" />
          <span>Enterprise Security</span>
        </div>
        <div className="flex items-center space-x-2">
          <Heart className="w-4 h-4 text-red-500" />
          <span>30-Day Guarantee</span>
        </div>
        <div className="flex items-center space-x-2">
          <Zap className="w-4 h-4 text-yellow-500" />
          <span>Instant Setup</span>
        </div>
      </div>
    </div>
  );
};

export default ConversionPrompt;