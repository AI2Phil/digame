import React, { useState } from 'react';
import Head from 'next/head';
import { Users, MessageSquare, Calendar, FileText, Video, Bell, Settings, Plus, Crown } from 'lucide-react';
import PageHeader from '../../src/components/navigation/PageHeader';

export default function TeamCollaboration() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTeam, setSelectedTeam] = useState('all');

  const teams = [
    { id: 'all', name: 'All Teams', members: 24, color: 'blue' },
    { id: 'engineering', name: 'Engineering', members: 8, color: 'green' },
    { id: 'design', name: 'Design', members: 4, color: 'purple' },
    { id: 'marketing', name: 'Marketing', members: 6, color: 'orange' },
    { id: 'sales', name: 'Sales', members: 6, color: 'red' }
  ];

  const teamMembers = [
    {
      id: 1,
      name: 'Sarah Chen',
      role: 'Engineering Lead',
      team: 'engineering',
      avatar: '👩‍💻',
      status: 'online',
      last_active: 'now',
      skills: ['React', 'Node.js', 'Python'],
      current_project: 'Platform Architecture',
      subscription: 'platform_owner'
    },
    {
      id: 2,
      name: 'Marcus Johnson',
      role: 'Senior Designer',
      team: 'design',
      avatar: '👨‍🎨',
      status: 'away',
      last_active: '15 min ago',
      skills: ['UI/UX', 'Figma', 'Prototyping'],
      current_project: 'Mobile App Redesign',
      subscription: 'professional'
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      role: 'Marketing Manager',
      team: 'marketing',
      avatar: '👩‍💼',
      status: 'online',
      last_active: 'now',
      skills: ['Content Strategy', 'SEO', 'Analytics'],
      current_project: 'Q1 Campaign',
      subscription: 'professional'
    },
    {
      id: 4,
      name: 'David Kim',
      role: 'Sales Director',
      team: 'sales',
      avatar: '👨‍💼',
      status: 'busy',
      last_active: '5 min ago',
      skills: ['Enterprise Sales', 'CRM', 'Negotiation'],
      current_project: 'Enterprise Deals',
      subscription: 'platform_owner'
    },
    {
      id: 5,
      name: 'Lisa Wang',
      role: 'Product Designer',
      team: 'design',
      avatar: '👩‍🎨',
      status: 'offline',
      last_active: '2 hours ago',
      skills: ['Product Design', 'User Research', 'Wireframing'],
      current_project: 'User Experience Audit',
      subscription: 'basic'
    },
    {
      id: 6,
      name: 'Alex Thompson',
      role: 'Full Stack Developer',
      team: 'engineering',
      avatar: '👨‍💻',
      status: 'online',
      last_active: 'now',
      skills: ['JavaScript', 'Python', 'AWS'],
      current_project: 'API Development',
      subscription: 'professional'
    }
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'message',
      user: 'Sarah Chen',
      action: 'shared a document',
      target: 'Architecture Review.pdf',
      time: '2 minutes ago',
      team: 'engineering'
    },
    {
      id: 2,
      type: 'meeting',
      user: 'Emily Rodriguez',
      action: 'scheduled a meeting',
      target: 'Q1 Planning Session',
      time: '15 minutes ago',
      team: 'marketing'
    },
    {
      id: 3,
      type: 'project',
      user: 'Marcus Johnson',
      action: 'updated project status',
      target: 'Mobile App Redesign',
      time: '1 hour ago',
      team: 'design'
    },
    {
      id: 4,
      type: 'comment',
      user: 'David Kim',
      action: 'commented on',
      target: 'Enterprise Sales Strategy',
      time: '2 hours ago',
      team: 'sales'
    }
  ];

  const upcomingMeetings = [
    {
      id: 1,
      title: 'Daily Standup',
      time: '9:00 AM',
      duration: '15 min',
      attendees: 8,
      type: 'recurring',
      team: 'engineering'
    },
    {
      id: 2,
      title: 'Design Review',
      time: '2:00 PM',
      duration: '1 hour',
      attendees: 6,
      type: 'scheduled',
      team: 'design'
    },
    {
      id: 3,
      title: 'Sales Pipeline Review',
      time: '4:00 PM',
      duration: '45 min',
      attendees: 4,
      type: 'scheduled',
      team: 'sales'
    }
  ];

  const projects = [
    {
      id: 1,
      name: 'Platform Architecture',
      team: 'engineering',
      progress: 75,
      members: 4,
      deadline: '2024-02-15',
      status: 'on_track',
      priority: 'high'
    },
    {
      id: 2,
      name: 'Mobile App Redesign',
      team: 'design',
      progress: 60,
      members: 3,
      deadline: '2024-02-28',
      status: 'on_track',
      priority: 'medium'
    },
    {
      id: 3,
      name: 'Q1 Marketing Campaign',
      team: 'marketing',
      progress: 40,
      members: 5,
      deadline: '2024-03-01',
      status: 'at_risk',
      priority: 'high'
    },
    {
      id: 4,
      name: 'Enterprise Sales Push',
      team: 'sales',
      progress: 85,
      members: 6,
      deadline: '2024-01-31',
      status: 'ahead',
      priority: 'high'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getTeamColor = (team) => {
    const teamData = teams.find(t => t.id === team);
    return teamData ? teamData.color : 'gray';
  };

  const getProjectStatusColor = (status) => {
    switch (status) {
      case 'on_track': return 'text-green-600 bg-green-100';
      case 'at_risk': return 'text-yellow-600 bg-yellow-100';
      case 'ahead': return 'text-blue-600 bg-blue-100';
      case 'delayed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredMembers = selectedTeam === 'all' 
    ? teamMembers 
    : teamMembers.filter(member => member.team === selectedTeam);

  const filteredProjects = selectedTeam === 'all'
    ? projects
    : projects.filter(project => project.team === selectedTeam);

  return (
    <>
      <Head>
        <title>Team Collaboration - Digame</title>
        <meta name="description" content="Collaborate effectively with your team" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <PageHeader 
          title="Team Collaboration"
          subtitle="Connect, communicate, and collaborate with your team"
          icon={<Users className="w-6 h-6 text-blue-600" />}
          badge="COLLABORATION"
        />

        <div className="container mx-auto px-4 py-8">
          {/* Team Selector */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Team</h3>
            <div className="flex flex-wrap gap-3">
              {teams.map((team) => (
                <button
                  key={team.id}
                  onClick={() => setSelectedTeam(team.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 transition-all ${
                    selectedTeam === team.id
                      ? `border-${team.color}-500 bg-${team.color}-50 text-${team.color}-700`
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <span>{team.name}</span>
                  <span className="text-sm text-gray-500">({team.members})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-white rounded-lg shadow-sm mb-8">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: 'overview', label: 'Overview', icon: <Users className="w-4 h-4" /> },
                  { id: 'members', label: 'Team Members', icon: <Users className="w-4 h-4" /> },
                  { id: 'projects', label: 'Projects', icon: <FileText className="w-4 h-4" /> },
                  { id: 'meetings', label: 'Meetings', icon: <Calendar className="w-4 h-4" /> }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-blue-600">{filteredMembers.length}</div>
                      <div className="text-sm text-blue-700">Team Members</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-green-600">{filteredProjects.length}</div>
                      <div className="text-sm text-green-700">Active Projects</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-purple-600">{upcomingMeetings.length}</div>
                      <div className="text-sm text-purple-700">Today's Meetings</div>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-orange-600">
                        {filteredMembers.filter(m => m.status === 'online').length}
                      </div>
                      <div className="text-sm text-orange-700">Online Now</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent Activity */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-4">Recent Activity</h4>
                      <div className="space-y-3">
                        {recentActivity.map((activity) => (
                          <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                            <div className={`p-2 rounded-full bg-${getTeamColor(activity.team)}-100`}>
                              {activity.type === 'message' && <MessageSquare className={`w-4 h-4 text-${getTeamColor(activity.team)}-600`} />}
                              {activity.type === 'meeting' && <Calendar className={`w-4 h-4 text-${getTeamColor(activity.team)}-600`} />}
                              {activity.type === 'project' && <FileText className={`w-4 h-4 text-${getTeamColor(activity.team)}-600`} />}
                              {activity.type === 'comment' && <MessageSquare className={`w-4 h-4 text-${getTeamColor(activity.team)}-600`} />}
                            </div>
                            <div className="flex-1">
                              <div className="text-sm">
                                <span className="font-medium text-gray-900">{activity.user}</span>
                                <span className="text-gray-600"> {activity.action} </span>
                                <span className="font-medium text-gray-900">{activity.target}</span>
                              </div>
                              <div className="text-xs text-gray-500">{activity.time}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Upcoming Meetings */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-4">Today's Meetings</h4>
                      <div className="space-y-3">
                        {upcomingMeetings.map((meeting) => (
                          <div key={meeting.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className={`p-2 rounded-full bg-${getTeamColor(meeting.team)}-100`}>
                                <Calendar className={`w-4 h-4 text-${getTeamColor(meeting.team)}-600`} />
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{meeting.title}</div>
                                <div className="text-sm text-gray-600">
                                  {meeting.time} • {meeting.duration} • {meeting.attendees} attendees
                                </div>
                              </div>
                            </div>
                            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                              <Video className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Team Members Tab */}
              {activeTab === 'members' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
                    <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      <Plus className="w-4 h-4" />
                      <span>Invite Member</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMembers.map((member) => (
                      <div key={member.id} className="bg-white border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="relative">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl">
                              {member.avatar}
                            </div>
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(member.status)}`}></div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-semibold text-gray-900">{member.name}</h4>
                              {member.subscription === 'platform_owner' && (
                                <Crown className="w-4 h-4 text-yellow-500" />
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{member.role}</p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Skills</div>
                            <div className="flex flex-wrap gap-1">
                              {member.skills.map((skill, index) => (
                                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div>
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Current Project</div>
                            <div className="text-sm text-gray-900">{member.current_project}</div>
                          </div>

                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>Last active: {member.last_active}</span>
                            <span className={`px-2 py-1 rounded-full ${getStatusColor(member.status)} text-white`}>
                              {member.status}
                            </span>
                          </div>
                        </div>

                        <div className="flex space-x-2 mt-4">
                          <button className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                            <MessageSquare className="w-4 h-4 inline mr-1" />
                            Message
                          </button>
                          <button className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">
                            <Video className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects Tab */}
              {activeTab === 'projects' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Active Projects</h3>
                    <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      <Plus className="w-4 h-4" />
                      <span>New Project</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredProjects.map((project) => (
                      <div key={project.id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-1">{project.name}</h4>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getProjectStatusColor(project.status)}`}>
                                {project.status.replace('_', ' ')}
                              </span>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(project.priority)}`}>
                                {project.priority} priority
                              </span>
                            </div>
                          </div>
                          <button className="p-2 text-gray-400 hover:text-gray-600">
                            <Settings className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-gray-600">Progress</span>
                              <span className="text-sm font-medium text-gray-900">{project.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${project.progress}%` }}
                              ></div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-2">
                              <Users className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">{project.members} members</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">Due {new Date(project.deadline).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Meetings Tab */}
              {activeTab === 'meetings' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Meetings</h3>
                    <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      <Plus className="w-4 h-4" />
                      <span>Schedule Meeting</span>
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Today's Meetings</h4>
                      <div className="space-y-3">
                        {upcomingMeetings.map((meeting) => (
                          <div key={meeting.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                            <div className="flex items-center space-x-4">
                              <div className={`p-3 rounded-full bg-${getTeamColor(meeting.team)}-100`}>
                                <Calendar className={`w-5 h-5 text-${getTeamColor(meeting.team)}-600`} />
                              </div>
                              <div>
                                <h5 className="font-medium text-gray-900">{meeting.title}</h5>
                                <div className="text-sm text-gray-600">
                                  {meeting.time} • {meeting.duration} • {meeting.attendees} attendees
                                </div>
                                <div className="text-xs text-gray-500 capitalize">{meeting.team} team</div>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <button className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                                <Video className="w-4 h-4 inline mr-1" />
                                Join
                              </button>
                              <button className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">
                                <Settings className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}