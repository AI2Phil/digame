import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface DashboardWidget {
  id: string;
  title: string;
  type: 'analytics' | 'ai' | 'team' | 'productivity' | 'networking' | 'learning';
  priority: number;
  content: React.ReactNode;
}

interface PersonalizedDashboardProps {
  className?: string;
}

const PersonalizedDashboard: React.FC<PersonalizedDashboardProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      generatePersonalizedWidgets();
    }
  }, [user]);

  const generatePersonalizedWidgets = () => {
    if (!user?.onboardingData) {
      setIsLoading(false);
      return;
    }

    const { interests = [], goals = [], experienceLevel = 'beginner', teamChoice = 'individual' } = user.onboardingData;
    const generatedWidgets: DashboardWidget[] = [];

    // Analytics Widgets (if user selected analytics interest)
    if (interests.includes('analytics') || interests.includes('data_analytics')) {
      generatedWidgets.push({
        id: 'analytics-overview',
        title: 'Analytics Overview',
        type: 'analytics',
        priority: goals.includes('data_insights') ? 1 : 3,
        content: (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">847</div>
                <div className="text-sm text-gray-600">Data Points</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">23%</div>
                <div className="text-sm text-gray-600">Growth Rate</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">12</div>
                <div className="text-sm text-gray-600">Active Reports</div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-32 rounded-lg flex items-center justify-center text-white">
              <div className="text-center">
                <div className="text-lg font-semibold">Advanced Analytics Ready</div>
                <div className="text-sm opacity-90">Click to explore your data insights</div>
              </div>
            </div>
          </div>
        )
      });
    }

    // AI Tools Widgets (if user selected AI interest)
    if (interests.includes('ai') || interests.includes('artificial_intelligence')) {
      generatedWidgets.push({
        id: 'ai-recommendations',
        title: 'AI Recommendations',
        type: 'ai',
        priority: experienceLevel === 'expert' ? 1 : 2,
        content: (
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
              <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">🤖</span>
              </div>
              <div>
                <div className="font-medium text-gray-900">Optimize your workflow</div>
                <div className="text-sm text-gray-600">AI suggests 3 automation opportunities</div>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">💡</span>
              </div>
              <div>
                <div className="font-medium text-gray-900">Content suggestions</div>
                <div className="text-sm text-gray-600">Based on your productivity goals</div>
              </div>
            </div>
            <button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-colors">
              View All AI Insights
            </button>
          </div>
        )
      });
    }

    // Team Collaboration Widgets (if user selected team management or created a team)
    if (interests.includes('team_management') || teamChoice === 'create_team') {
      generatedWidgets.push({
        id: 'team-collaboration',
        title: 'Team Collaboration',
        type: 'team',
        priority: teamChoice === 'create_team' ? 1 : 3,
        content: (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-gray-900">Digame Platform Team</div>
                <div className="text-sm text-gray-600">1 member • Just created</div>
              </div>
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">P</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-orange-50 p-3 rounded-lg text-center">
                <div className="text-lg font-bold text-orange-600">0</div>
                <div className="text-xs text-gray-600">Pending Invites</div>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg text-center">
                <div className="text-lg font-bold text-blue-600">3</div>
                <div className="text-xs text-gray-600">Shared Projects</div>
              </div>
            </div>
            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
              Invite Team Members
            </button>
          </div>
        )
      });
    }

    // Productivity Widgets (if user selected productivity interest or goals)
    if (interests.includes('productivity') || goals.includes('productivity')) {
      generatedWidgets.push({
        id: 'productivity-tracker',
        title: 'Productivity Tracker',
        type: 'productivity',
        priority: goals.includes('productivity') ? 1 : 2,
        content: (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">85%</div>
                <div className="text-sm text-gray-600">Weekly Goal Progress</div>
              </div>
              <div className="w-16 h-16 relative">
                <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="2"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2"
                    strokeDasharray="85, 100"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-semibold text-gray-700">85%</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tasks Completed</span>
                <span className="font-medium">17/20</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Focus Time</span>
                <span className="font-medium">6.5h</span>
              </div>
            </div>
          </div>
        )
      });
    }

    // Professional Networking Widgets
    if (interests.includes('professional_networking') || goals.includes('networking')) {
      generatedWidgets.push({
        id: 'networking-hub',
        title: 'Professional Network',
        type: 'networking',
        priority: goals.includes('networking') ? 1 : 3,
        content: (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-linkedin-blue/10 p-3 rounded-lg text-center">
                <div className="text-lg font-bold text-blue-600">24</div>
                <div className="text-xs text-gray-600">Connections</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg text-center">
                <div className="text-lg font-bold text-green-600">5</div>
                <div className="text-xs text-gray-600">New Opportunities</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">JD</span>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">John Doe</div>
                  <div className="text-xs text-gray-600">Senior Developer</div>
                </div>
              </div>
            </div>
            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
              Expand Network
            </button>
          </div>
        )
      });
    }

    // Learning & Development Widgets
    if (interests.includes('continuous_learning') || goals.includes('skill_development')) {
      generatedWidgets.push({
        id: 'learning-path',
        title: 'Learning Path',
        type: 'learning',
        priority: goals.includes('skill_development') ? 1 : 3,
        content: (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-gray-900">Advanced Analytics</div>
                <div className="text-sm text-gray-600">3 of 8 modules completed</div>
              </div>
              <div className="text-sm font-medium text-blue-600">38%</div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '38%' }}></div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="text-sm text-gray-700">Data Visualization Basics</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Statistical Analysis</span>
              </div>
            </div>
          </div>
        )
      });
    }

    // Sort widgets by priority and set them
    generatedWidgets.sort((a, b) => a.priority - b.priority);
    setWidgets(generatedWidgets);
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-gray-200 h-64 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (widgets.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-gray-500">
          <div className="text-lg font-medium mb-2">Welcome to your personalized dashboard!</div>
          <div className="text-sm">Complete your onboarding to see customized widgets based on your interests and goals.</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Personalized Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {widgets.map((widget) => (
          <div
            key={widget.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{widget.title}</h3>
              <div className={`w-3 h-3 rounded-full ${
                widget.type === 'analytics' ? 'bg-blue-500' :
                widget.type === 'ai' ? 'bg-purple-500' :
                widget.type === 'team' ? 'bg-green-500' :
                widget.type === 'productivity' ? 'bg-orange-500' :
                widget.type === 'networking' ? 'bg-blue-600' :
                'bg-indigo-500'
              }`}></div>
            </div>
            {widget.content}
          </div>
        ))}
      </div>

      {/* Quick Actions based on user preferences */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {user?.onboardingData?.interests?.includes('analytics') && (
            <button className="flex items-center space-x-3 p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">📊</span>
              </div>
              <span className="text-sm font-medium">View Analytics</span>
            </button>
          )}
          {user?.onboardingData?.teamChoice === 'create_team' && (
            <button className="flex items-center space-x-3 p-3 bg-white rounded-lg hover:bg-green-50 transition-colors">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">👥</span>
              </div>
              <span className="text-sm font-medium">Invite Members</span>
            </button>
          )}
          {user?.onboardingData?.interests?.includes('ai') && (
            <button className="flex items-center space-x-3 p-3 bg-white rounded-lg hover:bg-purple-50 transition-colors">
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">🤖</span>
              </div>
              <span className="text-sm font-medium">AI Tools</span>
            </button>
          )}
          <button className="flex items-center space-x-3 p-3 bg-white rounded-lg hover:bg-gray-100 transition-colors">
            <div className="w-8 h-8 bg-gray-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">⚙️</span>
            </div>
            <span className="text-sm font-medium">Settings</span>
          </button>
        </div>
      </div>

    </div>
  );
};

export default PersonalizedDashboard;