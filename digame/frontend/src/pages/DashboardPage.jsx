import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProductivityChart from '../components/dashboard/ProductivityChart';
import ActivityBreakdown from '../components/dashboard/ActivityBreakdown';
import RecentActivity from '../components/dashboard/RecentActivity'; // Import RecentActivity
import { EnhancedProductivityMetricCard } from '../components/dashboard/ProductivityMetricCard';
import { Button } from '../components/ui/Button'; // Ensure Button is imported if not already default
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel } from '../components/ui/DropdownMenu';
import { Badge } from '../components/ui/Badge';
import { Avatar, AvatarFallback } from '../components/ui/Avatar';
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetClose, SheetFooter, SheetDescription } from '../components/ui/Sheet';
import { Separator } from '../components/ui/Separator'; // For visual separation in the sheet

export default function DashboardPage({ isDemoMode, onLogout }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="digame-logo">
                  <span className="text-white font-bold text-sm">D</span>
                </div>
                <span className="text-xl font-bold text-gray-900">Digame</span>
              </div>
              {isDemoMode && (
                <Badge variant="info" className="text-xs">Demo Mode</Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-6">
              <nav className="hidden md:flex space-x-6">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="text-blue-600 font-medium text-sm hover:text-blue-700 transition-colors flex items-center gap-1"
                >
                  <span>🏠</span> Dashboard
                </button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="text-gray-600 hover:text-gray-900 text-sm transition-colors flex items-center gap-1">
                      <span>📊</span> Analytics ▼
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuItem onClick={() => navigate('/analytics/web')} className="flex items-center gap-2">
                      <span>🌐</span> Web Analytics
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/analytics/mobile')} className="flex items-center gap-2">
                      <span>📱</span> Mobile Analytics
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel className="px-2 py-1.5 text-xs font-medium text-gray-500">
                      AI-POWERED INSIGHTS
                    </DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => navigate('/analytics/behavioral')} className="flex items-center gap-2">
                      <span>🧠</span> Behavioral Analytics
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/analytics/predictive')} className="flex items-center gap-2">
                      <span>🔮</span> Predictive Analytics
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="text-gray-600 hover:text-gray-900 text-sm transition-colors flex items-center gap-1">
                      <span>🤖</span> AI Tools ▼
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64">
                    <DropdownMenuItem onClick={() => navigate('/ai-tools')} className="flex items-center gap-2">
                      <span>🛠️</span> AI Tools Hub
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel className="px-2 py-1.5 text-xs font-medium text-gray-500">WRITING & CONTENT</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => navigate('/ai-tools?tab=writing')} className="flex items-center gap-2">
                      <span>✍️</span> Writing Assistance
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel className="px-2 py-1.5 text-xs font-medium text-gray-500">TASK MANAGEMENT</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => navigate('/tasks')} className="flex items-center gap-2">
                      <span>📋</span> AI Task Suggestions
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel className="px-2 py-1.5 text-xs font-medium text-gray-500">INSIGHTS & ANALYTICS</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => navigate('/ai-tools?tab=insights')} className="flex items-center gap-2">
                      <span>🧠</span> AI Insights
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/ai-tools?tab=coaching')} className="flex items-center gap-2">
                      <span>🎯</span> AI Coaching
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="text-gray-600 hover:text-gray-900 text-sm transition-colors flex items-center gap-1">
                      <span>🤝</span> Social ▼ {/* Corrected Icon */}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64">
                    <DropdownMenuItem onClick={() => navigate('/social')} className="flex items-center gap-2">
                      <span>👥</span> Social Collaboration
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel className="px-2 py-1.5 text-xs font-medium text-gray-500">COLLABORATION FEATURES</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => navigate('/social?tab=peer-matching')} className="flex items-center gap-2">
                      <span>🧠</span> AI Peer Matching
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/social?tab=mentorship')} className="flex items-center gap-2">
                      <span>🎓</span> Mentorship Programs
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/social?tab=projects')} className="flex items-center gap-2">
                      <span>🎯</span> Project Collaboration
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/social?tab=teams')} className="flex items-center gap-2">
                      <span>📈</span> Team Analytics
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/social?tab=industry')} className="flex items-center gap-2">
                      <span>🏢</span> Industry Networking
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="text-gray-600 hover:text-gray-900 text-sm transition-colors flex items-center gap-1">
                      <span>📋</span> Tasks ▼
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64">
                    <DropdownMenuItem onClick={() => navigate('/tasks')} className="flex items-center gap-2">
                      <span>📋</span> Task Management
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel className="px-2 py-1.5 text-xs font-medium text-gray-500">AI-POWERED FEATURES</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => navigate('/tasks?tab=suggestions')} className="flex items-center gap-2">
                      <span>🤖</span> AI Task Suggestions
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/tasks?tab=automation')} className="flex items-center gap-2">
                      <span>⚡</span> Process Automation
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/tasks?tab=insights')} className="flex items-center gap-2">
                      <span>📊</span> Task Analytics
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="text-gray-600 hover:text-gray-900 text-sm transition-colors flex items-center gap-1">
                      <span>🏢</span> Enterprise ▼
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64">
                    <DropdownMenuItem onClick={() => navigate('/enterprise')} className="flex items-center gap-2">
                      <span>🏢</span> Enterprise Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel className="px-2 py-1.5 text-xs font-medium text-gray-500">AI ENTERPRISE FEATURES</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => navigate('/enterprise?tab=ai-features')} className="flex items-center gap-2">
                      <span>🤖</span> AI Feature Management
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/enterprise?tab=tenants')} className="flex items-center gap-2">
                      <span>🏢</span> Tenant Management
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/enterprise?tab=security')} className="flex items-center gap-2">
                      <span>🔒</span> Security & Compliance
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel className="px-2 py-1.5 text-xs font-medium text-gray-500">ANALYTICS & INSIGHTS</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => navigate('/enterprise?tab=overview')} className="flex items-center gap-2">
                      <span>📊</span> Enterprise Analytics
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <button
                  onClick={() => navigate('/reports')}
                  className="text-gray-600 hover:text-gray-900 text-sm transition-colors flex items-center gap-1"
                >
                  <span>📋</span> Reports
                </button>
              </nav>
              
              {/* Mobile menu button */}
              <div className="md:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-900 p-2">
                      <span className="text-lg">☰</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[300px] sm:w-[400px] p-0 flex flex-col">
                    <SheetHeader className="p-6 pb-4">
                      <SheetTitle>
                        <div className="flex items-center space-x-2">
                          <div className="digame-logo w-7 h-7">
                            <span className="text-white font-bold text-xs">D</span>
                          </div>
                          <span className="text-lg font-bold text-gray-900">Digame Menu</span>
                        </div>
                      </SheetTitle>
                    </SheetHeader>
                    <Separator />
                    <div className="flex-grow overflow-y-auto p-6 space-y-2">
                      <SheetClose asChild>
                        <Button variant="ghost" className="w-full justify-start text-base py-3" onClick={() => navigate('/dashboard')}>
                          <span className="mr-3 text-lg">🏠</span> Dashboard
                        </Button>
                      </SheetClose>

                      {/* Analytics Section */}
                      <div className="pt-2">
                        <h4 className="px-3 py-2 text-sm font-semibold text-gray-500">Analytics</h4>
                        <SheetClose asChild><Button variant="ghost" className="w-full justify-start" onClick={() => navigate('/analytics/web')}><span className="mr-2">🌐</span> Web Analytics</Button></SheetClose>
                        <SheetClose asChild><Button variant="ghost" className="w-full justify-start" onClick={() => navigate('/analytics/mobile')}><span className="mr-2">📱</span> Mobile Analytics</Button></SheetClose>
                        <div className="px-3 py-2 text-xs font-medium text-gray-400">AI-POWERED INSIGHTS</div>
                        <SheetClose asChild><Button variant="ghost" className="w-full justify-start" onClick={() => navigate('/analytics/behavioral')}><span className="mr-2">🧠</span> Behavioral Analytics</Button></SheetClose>
                        <SheetClose asChild><Button variant="ghost" className="w-full justify-start" onClick={() => navigate('/analytics/predictive')}><span className="mr-2">🔮</span> Predictive Analytics</Button></SheetClose>
                      </div>
                      <Separator />

                      {/* AI Tools Section */}
                      <div className="pt-2">
                        <h4 className="px-3 py-2 text-sm font-semibold text-gray-500">AI Tools</h4>
                        <SheetClose asChild><Button variant="ghost" className="w-full justify-start" onClick={() => navigate('/ai-tools')}><span className="mr-2">🛠️</span> AI Tools Hub</Button></SheetClose>
                        <div className="px-3 py-2 text-xs font-medium text-gray-400">WRITING & CONTENT</div>
                        <SheetClose asChild><Button variant="ghost" className="w-full justify-start" onClick={() => navigate('/ai-tools?tab=writing')}><span className="mr-2">✍️</span> Writing Assistance</Button></SheetClose>
                        <div className="px-3 py-2 text-xs font-medium text-gray-400">TASK MANAGEMENT</div>
                        <SheetClose asChild><Button variant="ghost" className="w-full justify-start" onClick={() => navigate('/tasks')}><span className="mr-2">📋</span> AI Task Suggestions</Button></SheetClose>
                        <div className="px-3 py-2 text-xs font-medium text-gray-400">INSIGHTS & ANALYTICS</div>
                        <SheetClose asChild><Button variant="ghost" className="w-full justify-start" onClick={() => navigate('/ai-tools?tab=insights')}><span className="mr-2">🧠</span> AI Insights</Button></SheetClose>
                        <SheetClose asChild><Button variant="ghost" className="w-full justify-start" onClick={() => navigate('/ai-tools?tab=coaching')}><span className="mr-2">🎯</span> AI Coaching</Button></SheetClose>
                      </div>
                      <Separator />

                      {/* Social Section */}
                      <div className="pt-2">
                        <h4 className="px-3 py-2 text-sm font-semibold text-gray-500">Social</h4>
                        <SheetClose asChild><Button variant="ghost" className="w-full justify-start" onClick={() => navigate('/social')}><span className="mr-2">👥</span> Social Collaboration</Button></SheetClose>
                        <div className="px-3 py-2 text-xs font-medium text-gray-400">COLLABORATION FEATURES</div>
                        <SheetClose asChild><Button variant="ghost" className="w-full justify-start" onClick={() => navigate('/social?tab=peer-matching')}><span className="mr-2">🧠</span> AI Peer Matching</Button></SheetClose>
                        <SheetClose asChild><Button variant="ghost" className="w-full justify-start" onClick={() => navigate('/social?tab=mentorship')}><span className="mr-2">🎓</span> Mentorship Programs</Button></SheetClose>
                        <SheetClose asChild><Button variant="ghost" className="w-full justify-start" onClick={() => navigate('/social?tab=projects')}><span className="mr-2">🎯</span> Project Collaboration</Button></SheetClose>
                        <SheetClose asChild><Button variant="ghost" className="w-full justify-start" onClick={() => navigate('/social?tab=teams')}><span className="mr-2">📈</span> Team Analytics</Button></SheetClose>
                        <SheetClose asChild><Button variant="ghost" className="w-full justify-start" onClick={() => navigate('/social?tab=industry')}><span className="mr-2">🏢</span> Industry Networking</Button></SheetClose>
                      </div>
                      <Separator />

                      {/* Tasks Section */}
                      <div className="pt-2">
                        <h4 className="px-3 py-2 text-sm font-semibold text-gray-500">Tasks</h4>
                        <SheetClose asChild><Button variant="ghost" className="w-full justify-start" onClick={() => navigate('/tasks')}><span className="mr-2">📋</span> Task Management</Button></SheetClose>
                        <div className="px-3 py-2 text-xs font-medium text-gray-400">AI-POWERED FEATURES</div>
                        <SheetClose asChild><Button variant="ghost" className="w-full justify-start" onClick={() => navigate('/tasks?tab=suggestions')}><span className="mr-2">🤖</span> AI Task Suggestions</Button></SheetClose>
                        <SheetClose asChild><Button variant="ghost" className="w-full justify-start" onClick={() => navigate('/tasks?tab=automation')}><span className="mr-2">⚡</span> Process Automation</Button></SheetClose>
                        <SheetClose asChild><Button variant="ghost" className="w-full justify-start" onClick={() => navigate('/tasks?tab=insights')}><span className="mr-2">📊</span> Task Analytics</Button></SheetClose>
                      </div>
                      <Separator />

                      {/* Enterprise Section */}
                      <div className="pt-2">
                        <h4 className="px-3 py-2 text-sm font-semibold text-gray-500">Enterprise</h4>
                        <SheetClose asChild><Button variant="ghost" className="w-full justify-start" onClick={() => navigate('/enterprise')}><span className="mr-2">🏢</span> Enterprise Dashboard</Button></SheetClose>
                        <div className="px-3 py-2 text-xs font-medium text-gray-400">AI ENTERPRISE FEATURES</div>
                        <SheetClose asChild><Button variant="ghost" className="w-full justify-start" onClick={() => navigate('/enterprise?tab=ai-features')}><span className="mr-2">🤖</span> AI Feature Management</Button></SheetClose>
                        <SheetClose asChild><Button variant="ghost" className="w-full justify-start" onClick={() => navigate('/enterprise?tab=tenants')}><span className="mr-2">🏢</span> Tenant Management</Button></SheetClose>
                        <SheetClose asChild><Button variant="ghost" className="w-full justify-start" onClick={() => navigate('/enterprise?tab=security')}><span className="mr-2">🔒</span> Security & Compliance</Button></SheetClose>
                        <div className="px-3 py-2 text-xs font-medium text-gray-400">ANALYTICS & INSIGHTS</div>
                        <SheetClose asChild><Button variant="ghost" className="w-full justify-start" onClick={() => navigate('/enterprise?tab=overview')}><span className="mr-2">📊</span> Enterprise Analytics</Button></SheetClose>
                      </div>
                      <Separator />

                      <SheetClose asChild>
                        <Button variant="ghost" className="w-full justify-start text-base py-3" onClick={() => navigate('/reports')}>
                          <span className="mr-3 text-lg">📋</span> Reports
                        </Button>
                      </SheetClose>
                    </div>
                    <SheetFooter className="p-6 pt-4 border-t border-gray-200">
                      <div className="flex items-center mb-4">
                        <Avatar className="w-10 h-10 mr-3">
                          <AvatarFallback className="text-base">👤</AvatarFallback>
                        </Avatar>
                        <div>
                           <p className="text-sm font-medium text-gray-900">{isDemoMode ? "Demo User" : "User Name"}</p> {/* Replace with actual user name if available */}
                           {isDemoMode && <Badge variant="outline">Demo Account</Badge>}
                        </div>
                      </div>
                      <SheetClose asChild>
                        <Button variant="outline" className="w-full" onClick={onLogout}>
                          {isDemoMode ? 'Exit Demo' : 'Logout'}
                        </Button>
                      </SheetClose>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
              </div>
              
              <div className="flex items-center space-x-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="text-sm">👤</AvatarFallback>
                </Avatar>
                <button
                  onClick={onLogout}
                  className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
                >
                  {isDemoMode ? 'Exit Demo' : 'Logout'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Your Digital Twin
          </h1>
          <p className="text-gray-600 text-lg">
            {isDemoMode 
              ? 'Exploring with sample data - see how your professional insights would look!'
              : 'Here\'s your personalized professional development dashboard'
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
          <EnhancedProductivityMetricCard
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

          <EnhancedProductivityMetricCard
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

          <EnhancedProductivityMetricCard
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

          <EnhancedProductivityMetricCard
            title="Growth Rate"
            value="+12%"
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
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Productivity Trends
                </h3>
                <span className="text-sm text-gray-500">Last 7 days</span>
              </div>
              <ProductivityChart userId={1} />
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
          <ActivityBreakdown userId={1} />
          
          {/* Recent Activities - Replaced with component */}
          <RecentActivity userId={1} />
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
      </main>
    </div>
  );
}