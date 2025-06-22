import React, { useState, useEffect } from 'react'; // Added useState, useEffect
import enhancedApiService from '../services/enhancedApiService';
import { useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react'; // Import Menu icon for sidebar toggle
import NotificationBell from '../components/notifications/NotificationBell';
import Sidebar from '../components/navigation/Sidebar';
import ProductivityChart from '../components/dashboard/ProductivityChart';
import ActivityBreakdown from '../components/dashboard/ActivityBreakdown';
// Import EnhancedProductivityMetricCard instead of the base one
import { EnhancedProductivityMetricCard } from '../components/dashboard/ProductivityMetricCard';
import RecentActivity from '../components/dashboard/RecentActivity';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Avatar, AvatarFallback } from '../components/ui/Avatar';
import { TooltipProvider } from '../components/ui/Tooltip';
import {
  Skeleton,
  SkeletonText,
  SkeletonCard,
  SkeletonChart,
  SkeletonList,
  SkeletonAvatar
} from '../components/ui/Skeleton';
import { DatePicker } from '../components/ui/Calendar'; // Import DatePicker

export default function DashboardPage({ isDemoMode, onLogout }) {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [userError, setUserError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // State for DatePicker
  const [selectedDateRange, setSelectedDateRange] = useState({
    from: null, // new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Default to last 7 days
    to: null,   // new Date()
  });

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!isDemoMode) {
        setUserLoading(true);
        setUserError(null);
        try {
          const user = await enhancedApiService.getCurrentUser();
          setCurrentUser(user);
        } catch (error) {
          console.error("Failed to fetch current user:", error);
          setUserError(error.message || "Could not fetch user data");
        }
        setUserLoading(false);
      } else {
        setUserLoading(false); // Not loading if in demo mode
      }
    };
    fetchCurrentUser();
  }, [isDemoMode]);

  return (
    <TooltipProvider delayDuration={300}>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <Sidebar
          isDemoMode={isDemoMode}
          onLogout={onLogout}
          currentUser={currentUser}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Main Content Area */}
        <div className="flex-1 lg:ml-0">
          {/* Top Header */}
          <header className="bg-white shadow-sm border-b border-gray-200 lg:hidden">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSidebarOpen(true)}
                    className="text-gray-700 hover:text-gray-900"
                  >
                    <Menu className="w-6 h-6" />
                  </Button>
                  <div className="flex items-center space-x-3">
                    <div className="digame-logo">
                      <span className="text-white font-bold text-sm">D</span>
                    </div>
                    <span className="text-xl font-bold text-gray-900">Digame</span>
                    {isDemoMode && (
                      <Badge variant="info" className="text-xs">Demo</Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <NotificationBell />
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-sm">👤</AvatarFallback>
                  </Avatar>
                </div>
              </div>
            </div>
          </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {userError && !isDemoMode && (
          <div className="text-center p-8 text-red-500 bg-red-50 rounded-lg">
            <p className="font-semibold">Error loading user data:</p>
            <p>{userError}</p>
            <p className="mt-2 text-sm">Dashboard features requiring user ID may not function correctly.</p>
            <Button onClick={() => window.location.reload()} className="mt-4">Try Again</Button>
          </div>
        )}

        {userLoading && !isDemoMode && !userError && <DashboardPageSkeleton />}

        {!userLoading && !userError && (
          <>
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome to Your Digital Twin
              </h1>
              <p className="text-gray-600 text-lg">
                {isDemoMode
                  ? 'Exploring with sample data - see how your professional insights would look!'
                  : (currentUser ? `Here's your personalized dashboard, ${currentUser.username || 'User'}!` : 'Here\'s your personalized professional development dashboard')
                }
              </p>
            </div>

            {/* Demo Banner */}
            {isDemoMode && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6 mb-8 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">🚀</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        You're in Demo Mode!
                      </h3>
                      <p className="text-gray-600">
                        All data shown is sample data. Create an account to track your real professional metrics.
                      </p>
                    </div>
                  </div>
                  <button className="btn-primary">
                    Create Account
                  </button>
                </div>
              </div>
            )}

            {/* Enhanced Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <EnhancedProductivityMetricCard userId={currentUser?.id || 1}
                title="Productivity Score"
                value="87%"
            target={90}
            change="+5%"
            changeType="positive"
            icon="📊"
            color="blue"
            trend={[75, 78, 82, 85, 87, 89, 87]}
            insights={[
              "Peak performance between 9-11 AM",
              "Consistent improvement over 7 days",
              "3% above team average"
            ]}
            actions={[
              { label: "View Details", onClick: () => console.log('View productivity details') },
              { label: "Set Goal", onClick: () => console.log('Set productivity goal') }
            ]}
          />

          <EnhancedProductivityMetricCard userId={currentUser?.id || 1}
            title="Focus Time"
            value="6.2h"
            target={8}
            change="+0.8h"
            changeType="positive"
            icon="🎯"
            color="green"
            trend={[5.2, 5.8, 6.1, 5.9, 6.4, 6.0, 6.2]}
            insights={[
              "Longest focus session: 2.5h",
              "Best focus day: Tuesday",
              "Distraction rate decreased 15%"
            ]}
            actions={[
              { label: "Focus Timer", onClick: () => console.log('Start focus timer') },
              { label: "Block Distractions", onClick: () => console.log('Block distractions') }
            ]}
          />

          <EnhancedProductivityMetricCard userId={currentUser?.id || 1}
            title="Collaboration"
            value="8.4"
            target={10}
            change="Optimal"
            changeType="neutral"
            icon="🤝"
            color="purple"
            trend={[7.8, 8.1, 8.3, 8.0, 8.6, 8.2, 8.4]}
            insights={[
              "Strong team communication",
              "Balanced meeting schedule",
              "High engagement in discussions"
            ]}
            actions={[
              { label: "Schedule 1:1", onClick: () => console.log('Schedule 1:1') },
              { label: "Team Feedback", onClick: () => console.log('Team feedback') }
            ]}
          />

          <EnhancedProductivityMetricCard userId={currentUser?.id || 1}
            title="Growth Rate"
            value="+12%" // Note: target prop is missing for this card, so progress bar won't show unless added
            change="Above average"
            changeType="positive"
            icon="📈"
            color="orange"
            trend={[8, 9, 10, 11, 12, 11, 12]}
            insights={[
              "Skill development accelerating",
              "Learning goals on track",
              "Knowledge sharing increased"
            ]}
            actions={[
              { label: "Learning Path", onClick: () => console.log('View learning path') },
              { label: "Skill Assessment", onClick: () => console.log('Take assessment') }
            ]}
          />
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Productivity Chart - Full Width on Large Screens */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Productivity Trends
                  </h3>
                  <p className="text-sm text-gray-500">
                    {selectedDateRange.from && selectedDateRange.to
                      ? `${selectedDateRange.from.toLocaleDateString()} - ${selectedDateRange.to.toLocaleDateString()}`
                      : "Select a date range"}
                  </p>
                </div>
                <DatePicker
                  mode="range" // Enable range selection
                  value={selectedDateRange}
                  onChange={(range) => setSelectedDateRange(range || { from: null, to: null })}
                  placeholder="Select date range"
                  className="w-full sm:w-auto"
                  // You might need to adjust props for range selection if DatePicker API differs
                  // For example, if it expects `onRangeChange` or similar.
                  // Assuming `onChange` handles range object like { from: Date, to: Date }
                />
              </div>
              <ProductivityChart
                userId={currentUser?.id || 1}
                dateRange={selectedDateRange} // Pass the selected date range
              />
            </div>
          </div>
          
          {/* Side Panel */}
          <div className="space-y-6">
            {/* Recent Insights */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Recent Insights
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Peak productivity detected
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Your best work happens between 9-11 AM
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Collaboration improvement
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Team interactions up 15% this week
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Skill development opportunity
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Consider learning data visualization
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors focus-ring">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">📝</span>
                    <span className="text-sm font-medium text-gray-900">Log Activity</span>
                  </div>
                </button>
                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors focus-ring">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">🎯</span>
                    <span className="text-sm font-medium text-gray-900">Set Goal</span>
                  </div>
                </button>
                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors focus-ring">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">📊</span>
                    <span className="text-sm font-medium text-gray-900">View Report</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Components Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Activity Breakdown */}
          <ActivityBreakdown userId={currentUser?.id || 1} />
          
          {/* Recent Activities */}
          <RecentActivity userId={currentUser?.id || 1} />
        </div>

        {/* Platform Features Overview */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Explore Platform Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Analytics Features */}
            <div className="card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/analytics/web')}>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📊</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Advanced Analytics</h3>
                  <p className="text-sm text-gray-600">Web & Mobile Insights</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Comprehensive analytics dashboards with real-time data visualization, user behavior tracking, and performance metrics.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">Real-time Data</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">Performance Metrics</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">User Behavior</span>
              </div>
            </div>

            {/* Social Collaboration */}
            <div className="card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/social')}>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🤝</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Social Collaboration</h3>
                  <p className="text-sm text-gray-600">AI-Powered Networking</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Advanced peer matching, mentorship programs, team collaboration analytics, and professional networking tools.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">Peer Matching</span>
                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">Mentorship</span>
                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">Team Analytics</span>
              </div>
            </div>

            {/* AI Tools */}
            <div className="card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/ai/insights')}>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🤖</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">AI-Powered Tools</h3>
                  <p className="text-sm text-gray-600">Smart Insights & Automation</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Intelligent recommendations, predictive analytics, automated workflows, and personalized coaching powered by AI.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">AI Insights</span>
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">Automation</span>
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">Coaching</span>
              </div>
            </div>

            {/* Mobile Analytics */}
            <div className="card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/analytics/mobile')}>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📱</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Mobile Analytics</h3>
                  <p className="text-sm text-gray-600">Cross-Platform Insights</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Specialized mobile analytics with device performance, user engagement, and cross-platform behavior analysis.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded">Device Analytics</span>
                <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded">Performance</span>
                <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded">Cross-Platform</span>
              </div>
            </div>

            {/* Reports & Insights */}
            <div className="card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/reports')}>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📋</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Reports & Insights</h3>
                  <p className="text-sm text-gray-600">Comprehensive Reporting</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Detailed reports, custom dashboards, data exports, and comprehensive insights across all platform features.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">Custom Reports</span>
                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">Data Export</span>
                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">Insights</span>
              </div>
            </div>

            {/* Platform Status */}
            <div className="card bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🚀</span>
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900">Platform Status</h3>
                  <p className="text-sm text-blue-600">All Systems Operational</p>
                </div>
              </div>
              <p className="text-sm text-blue-700 mb-4">
                All features are fully integrated and operational.
                {isDemoMode
                  ? ' Demo mode active with sample data.'
                  : ' Connected to live data sources.'
                }
              </p>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-sm font-medium text-blue-700">Live & Ready</span>
              </div>
            </div>
          </div>
        </div>

        {/* Integration Status */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center space-x-4">
            <div className="text-blue-500">
              <span className="text-2xl">🚀</span>
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-blue-900">
                Complete Platform Integration
              </h4>
              <p className="text-blue-700">
                All dashboards and features are fully integrated with authentication, demo mode compatibility, and seamless navigation.
                {isDemoMode
                  ? ' Currently showing sample data for demonstration.'
                  : ' Connected to your behavioral analysis data.'
                }
              </p>
            </div>
            <div className="text-sm text-blue-600">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full status-online"></span>
                <span className="font-medium">All Features Live</span>
              </div>
            </div>
          </div>
        </div>
          </>
        )}
      </main>
        </div>
      </div>
    </TooltipProvider>
  );
}

// Skeleton component for the dashboard page
const DashboardPageSkeleton = () => (
  <div className="animate-pulse">
    {/* Welcome Section Skeleton */}
    <div className="mb-8">
      <SkeletonText className="h-9 w-3/5 mb-3" />
      <SkeletonText className="h-6 w-4/5" />
    </div>

    {/* Enhanced Stats Overview Skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-3">
            <SkeletonText className="h-5 w-2/4" />
            <SkeletonAvatar size="sm" className="w-8 h-8"/>
          </div>
          <SkeletonText className="h-8 w-1/3 mb-2" />
          <SkeletonText className="h-4 w-1/4" />
           <div className="mt-4 h-16"> {/* Placeholder for trend line */}
            <Skeleton className="w-full h-full"/>
          </div>
        </div>
      ))}
    </div>

    {/* Dashboard Grid Skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
      {/* Productivity Chart Skeleton */}
      <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-6">
          <SkeletonText className="h-6 w-1/3" />
          <SkeletonText className="h-5 w-1/4" />
        </div>
        <SkeletonChart className="h-64" /> {/* Assuming SkeletonChart has appropriate styling */}
      </div>

      {/* Side Panel Skeleton */}
      <div className="space-y-6">
        {/* Recent Insights Skeleton */}
        <div className="bg-white p-6 rounded-lg shadow">
          <SkeletonText className="h-6 w-1/2 mb-4" />
          <SkeletonList items={3} showAvatar={false} />
        </div>

        {/* Quick Actions Skeleton */}
        <div className="bg-white p-6 rounded-lg shadow">
          <SkeletonText className="h-6 w-1/3 mb-4" />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
               <div key={i} className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200">
                 <Skeleton className="w-6 h-6 rounded"/>
                 <SkeletonText className="h-5 flex-1"/>
               </div>
            ))}
          </div>
        </div>
      </div>
    </div>

    {/* Additional Components Row Skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      <SkeletonCard showAvatar={false} showImage={false} lines={5} />
      <SkeletonCard showAvatar={false} showImage={false} lines={5} />
    </div>

     {/* Platform Features Overview Skeleton */}
     <div className="mb-8">
      <SkeletonText className="h-8 w-1/3 mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => <SkeletonCard key={i} showImage={false} />)}
      </div>
    </div>

    {/* Integration Status Skeleton */}
    <div className="bg-white p-6 rounded-xl shadow">
       <div className="flex items-center space-x-4">
          <SkeletonAvatar size="lg" className="w-12 h-12"/>
          <div className="flex-1">
            <SkeletonText className="h-6 w-3/4 mb-2" />
            <SkeletonText className="h-5 w-full" />
          </div>
        </div>
    </div>
  </div>
);