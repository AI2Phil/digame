import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import {
  DollarSign, Clock, TrendingUp, Users, Zap, Brain,
  Target, Star, Calculator, ArrowRight, CheckCircle,
  BarChart3, Rocket, Award, Heart, Crown
} from 'lucide-react';

const ValueDemonstration = ({ selectedRole, exploredFeatures, onConversion }) => {
  const [calculatedROI, setCalculatedROI] = useState(null);
  const [showCalculator, setShowCalculator] = useState(false);
  const [userInputs, setUserInputs] = useState({
    currentSalary: '',
    hoursPerWeek: 40,
    teamSize: 1
  });

  // Role-specific value propositions
  const roleValues = {
    developer: {
      title: "Accelerate Your Development Career",
      primaryMetric: "Code Quality & Productivity",
      improvements: [
        { metric: "Debugging Time", reduction: "60%", icon: <Clock className="w-5 h-5" /> },
        { metric: "Code Review Efficiency", increase: "45%", icon: <CheckCircle className="w-5 h-5" /> },
        { metric: "Feature Delivery Speed", increase: "35%", icon: <Rocket className="w-5 h-5" /> },
        { metric: "Technical Debt", reduction: "50%", icon: <Target className="w-5 h-5" /> }
      ],
      annualValue: 25000,
      timeToValue: "2 weeks",
      careerImpact: "Promotion readiness 3x faster"
    },
    manager: {
      title: "Transform Your Team's Performance",
      primaryMetric: "Team Productivity & Efficiency",
      improvements: [
        { metric: "Team Productivity", increase: "40%", icon: <TrendingUp className="w-5 h-5" /> },
        { metric: "Meeting Efficiency", increase: "55%", icon: <Users className="w-5 h-5" /> },
        { metric: "Project Delivery", improvement: "30% faster", icon: <Rocket className="w-5 h-5" /> },
        { metric: "Team Satisfaction", increase: "65%", icon: <Heart className="w-5 h-5" /> }
      ],
      annualValue: 75000,
      timeToValue: "1 month",
      careerImpact: "Executive promotion track"
    },
    executive: {
      title: "Drive Strategic Business Outcomes",
      primaryMetric: "Business Impact & ROI",
      improvements: [
        { metric: "Decision Speed", increase: "70%", icon: <Brain className="w-5 h-5" /> },
        { metric: "Revenue Growth", increase: "25%", icon: <DollarSign className="w-5 h-5" /> },
        { metric: "Operational Efficiency", increase: "45%", icon: <Zap className="w-5 h-5" /> },
        { metric: "Market Responsiveness", increase: "60%", icon: <TrendingUp className="w-5 h-5" /> }
      ],
      annualValue: 250000,
      timeToValue: "6 weeks",
      careerImpact: "Industry leadership recognition"
    },
    analyst: {
      title: "Unlock Data-Driven Excellence",
      primaryMetric: "Analytics & Insights Quality",
      improvements: [
        { metric: "Report Generation", speed: "80% faster", icon: <BarChart3 className="w-5 h-5" /> },
        { metric: "Data Accuracy", increase: "95%", icon: <Target className="w-5 h-5" /> },
        { metric: "Insight Discovery", increase: "3x more", icon: <Brain className="w-5 h-5" /> },
        { metric: "Stakeholder Satisfaction", increase: "85%", icon: <Star className="w-5 h-5" /> }
      ],
      annualValue: 40000,
      timeToValue: "1 week",
      careerImpact: "Senior analyst promotion"
    }
  };

  // Industry benchmarks and success stories
  const industryData = {
    developer: {
      averageSalary: 95000,
      productivityGain: 0.35,
      careerAcceleration: 3,
      successStories: [
        "Reduced bug resolution time from 4 hours to 1.5 hours",
        "Automated 70% of repetitive coding tasks",
        "Achieved senior developer promotion 18 months early"
      ]
    },
    manager: {
      averageSalary: 125000,
      productivityGain: 0.40,
      careerAcceleration: 2.5,
      successStories: [
        "Improved team velocity by 45% in first quarter",
        "Reduced project delays by 60%",
        "Promoted to director level 2 years ahead of schedule"
      ]
    },
    executive: {
      averageSalary: 200000,
      productivityGain: 0.25,
      careerAcceleration: 2,
      successStories: [
        "Increased company revenue by 25% through data-driven decisions",
        "Reduced operational costs by $2M annually",
        "Recognized as industry thought leader"
      ]
    },
    analyst: {
      averageSalary: 75000,
      productivityGain: 0.50,
      careerAcceleration: 3.5,
      successStories: [
        "Reduced report generation time from days to hours",
        "Discovered insights that saved company $500K",
        "Became go-to analyst for C-suite presentations"
      ]
    }
  };

  const currentRoleValue = roleValues[selectedRole] || roleValues.developer;
  const currentIndustryData = industryData[selectedRole] || industryData.developer;

  useEffect(() => {
    // Calculate ROI based on role and explored features
    const baseValue = currentRoleValue.annualValue;
    const explorationBonus = Math.min(exploredFeatures * 0.1, 0.5); // Up to 50% bonus
    const totalValue = baseValue * (1 + explorationBonus);
    
    setCalculatedROI({
      annualValue: totalValue,
      monthlyValue: totalValue / 12,
      weeklyValue: totalValue / 52,
      paybackPeriod: "2 weeks",
      roi: Math.round((totalValue / 2000) * 100) // Assuming $2000 annual cost
    });
  }, [selectedRole, exploredFeatures]);

  const calculatePersonalizedROI = () => {
    const salary = parseFloat(userInputs.currentSalary) || currentIndustryData.averageSalary;
    const hours = parseFloat(userInputs.hoursPerWeek) || 40;
    const team = parseFloat(userInputs.teamSize) || 1;
    
    const hourlyRate = salary / (52 * hours);
    const productivityGain = currentIndustryData.productivityGain;
    const timeSaved = hours * productivityGain;
    const weeklySavings = timeSaved * hourlyRate;
    const annualSavings = weeklySavings * 52;
    const teamMultiplier = selectedRole === 'manager' || selectedRole === 'executive' ? team : 1;
    const totalAnnualValue = annualSavings * teamMultiplier;
    
    return {
      timeSavedPerWeek: timeSaved,
      weeklySavings,
      annualSavings: totalAnnualValue,
      roi: Math.round((totalAnnualValue / 2000) * 100),
      paybackDays: Math.ceil((2000 / totalAnnualValue) * 365)
    };
  };

  const personalizedROI = showCalculator ? calculatePersonalizedROI() : null;

  return (
    <div className="space-y-8">
      {/* Value Proposition Header */}
      <div className="text-center space-y-4">
        <h3 className="text-2xl font-bold text-gray-900">{currentRoleValue.title}</h3>
        <p className="text-lg text-gray-600">
          Based on your exploration of {exploredFeatures} features, here's your personalized value projection
        </p>
        <div className="flex justify-center space-x-4">
          <Badge variant="outline" className="bg-green-50 text-green-700">
            <DollarSign className="w-3 h-3 mr-1" />
            ${calculatedROI?.annualValue.toLocaleString()} Annual Value
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            <Clock className="w-3 h-3 mr-1" />
            {currentRoleValue.timeToValue} to Value
          </Badge>
        </div>
      </div>

      {/* Key Improvements Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {currentRoleValue.improvements.map((improvement, index) => (
          <Card key={index} className="border-2 border-gray-100 hover:border-blue-200 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  {improvement.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{improvement.metric}</h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-2xl font-bold text-green-600">
                      {improvement.reduction && `-${improvement.reduction}`}
                      {improvement.increase && `+${improvement.increase}`}
                      {improvement.improvement && improvement.improvement}
                      {improvement.speed && improvement.speed}
                    </span>
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ROI Calculator */}
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calculator className="w-5 h-5" />
            <span>Personal ROI Calculator</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!showCalculator ? (
            <div className="text-center space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    ${calculatedROI?.monthlyValue.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Monthly Value</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {calculatedROI?.roi}%
                  </div>
                  <div className="text-sm text-gray-600">Annual ROI</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {calculatedROI?.paybackPeriod}
                  </div>
                  <div className="text-sm text-gray-600">Payback Period</div>
                </div>
              </div>
              
              <Button 
                onClick={() => setShowCalculator(true)}
                variant="outline"
                className="border-purple-200 text-purple-700 hover:bg-purple-50"
              >
                Calculate My Personal ROI
                <Calculator className="w-4 h-4 ml-2" />
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Salary ($)
                  </label>
                  <input
                    type="number"
                    value={userInputs.currentSalary}
                    onChange={(e) => setUserInputs(prev => ({ ...prev, currentSalary: e.target.value }))}
                    placeholder={currentIndustryData.averageSalary.toString()}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hours per Week
                  </label>
                  <input
                    type="number"
                    value={userInputs.hoursPerWeek}
                    onChange={(e) => setUserInputs(prev => ({ ...prev, hoursPerWeek: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                {(selectedRole === 'manager' || selectedRole === 'executive') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Team Size
                    </label>
                    <input
                      type="number"
                      value={userInputs.teamSize}
                      onChange={(e) => setUserInputs(prev => ({ ...prev, teamSize: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                )}
              </div>
              
              {personalizedROI && (
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-4">Your Personalized Results</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Time Saved per Week:</span>
                        <span className="font-semibold">{personalizedROI.timeSavedPerWeek.toFixed(1)} hours</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Weekly Value:</span>
                        <span className="font-semibold text-green-600">${personalizedROI.weeklySavings.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Annual Value:</span>
                        <span className="font-semibold text-green-600">${personalizedROI.annualSavings.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">ROI:</span>
                        <span className="font-semibold text-blue-600">{personalizedROI.roi}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payback Period:</span>
                        <span className="font-semibold text-purple-600">{personalizedROI.paybackDays} days</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Success Stories */}
      <Card className="border border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-green-800">
            <Award className="w-5 h-5" />
            <span>Success Stories from {currentRoleValue.title}s</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {currentIndustryData.successStories.map((story, index) => (
              <div key={index} className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <span className="text-gray-700">{story}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Career Impact Projection */}
      <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <Crown className="w-12 h-12 text-yellow-600" />
            </div>
            <h4 className="text-xl font-semibold text-gray-900">Career Impact Projection</h4>
            <p className="text-lg text-gray-700">{currentRoleValue.careerImpact}</p>
            <div className="flex justify-center space-x-6 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {currentIndustryData.careerAcceleration}x
                </div>
                <div className="text-gray-600">Faster Advancement</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {Math.round(currentIndustryData.productivityGain * 100)}%
                </div>
                <div className="text-gray-600">Productivity Gain</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Final CTA */}
      <div className="text-center space-y-4">
        <p className="text-lg text-gray-600">
          Ready to unlock this value for your career?
        </p>
        <div className="space-y-3">
          <Button 
            onClick={() => onConversion('signup')}
            size="lg"
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 px-8"
          >
            Start Achieving These Results
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          
          <div className="text-sm text-gray-500">
            <p>✨ 30-day money-back guarantee • 🚀 Setup in under 5 minutes</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ValueDemonstration;