/*
Comprehensive Mentorship Platform Component
React component for the complete mentorship system
*/

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { Progress } from '../ui/Progress';
import { 
  Users, 
  Star, 
  Calendar, 
  TrendingUp, 
  Award, 
  MessageCircle,
  Target,
  BookOpen,
  Clock,
  CheckCircle
} from 'lucide-react';

const MentorshipPlatform = ({ userId }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    fetchDashboardData();
  }, [userId]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/mentorship/dashboard/${userId}`);
      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching mentorship dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyAsMentor = async (applicationData) => {
    try {
      const response = await fetch('/api/mentorship/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(applicationData)
      });
      const result = await response.json();
      
      if (response.ok) {
        alert(`Application submitted! Qualification score: ${result.qualification_score}%`);
        fetchDashboardData(); // Refresh data
      } else {
        alert('Error submitting application');
      }
    } catch (error) {
      console.error('Error applying as mentor:', error);
    }
  };

  const createConnection = async (mentorId, programType) => {
    try {
      const response = await fetch('/api/mentorship/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mentor_id: mentorId,
          mentee_id: userId,
          program_type: programType,
          goals: `Professional development in ${programType}`
        })
      });
      
      if (response.ok) {
        alert('Mentorship connection created successfully!');
        fetchDashboardData();
      } else {
        alert('Error creating connection');
      }
    } catch (error) {
      console.error('Error creating connection:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Unable to load mentorship data</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Mentorship Platform</h1>
        <Badge variant="secondary" className="text-sm">
          {dashboardData.connections.length} Active Connections
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="find-mentors">Find Mentors</TabsTrigger>
          <TabsTrigger value="my-connections">My Connections</TabsTrigger>
          <TabsTrigger value="become-mentor">Become a Mentor</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <DashboardOverview data={dashboardData} />
        </TabsContent>

        <TabsContent value="find-mentors" className="space-y-6">
          <MentorMatches 
            matches={dashboardData.potential_matches} 
            onCreateConnection={createConnection}
          />
        </TabsContent>

        <TabsContent value="my-connections" className="space-y-6">
          <MyConnections connections={dashboardData.connections} />
        </TabsContent>

        <TabsContent value="become-mentor" className="space-y-6">
          <BecomeAMentor 
            qualifications={dashboardData.qualifications}
            onApply={applyAsMentor}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <AnalyticsDashboard analytics={dashboardData.analytics} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const DashboardOverview = ({ data }) => {
  const activeConnections = data.connections.filter(c => c.status === 'active');
  const mentorConnections = data.connections.filter(c => c.role === 'mentor');
  const menteeConnections = data.connections.filter(c => c.role === 'mentee');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Connections</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeConnections.length}</div>
          <p className="text-xs text-muted-foreground">
            {mentorConnections.length} as mentor, {menteeConnections.length} as mentee
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Qualification Score</CardTitle>
          <Star className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.qualifications.qualification_score}%</div>
          <Progress value={data.qualifications.qualification_score} className="mt-2" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.analytics.success_rate}%</div>
          <p className="text-xs text-muted-foreground">
            Platform average
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Available Programs</CardTitle>
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.available_programs.length}</div>
          <p className="text-xs text-muted-foreground">
            Program types available
          </p>
        </CardContent>
      </Card>

      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle>Available Programs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {data.available_programs.map((program) => (
              <div key={program.type} className="p-4 border rounded-lg hover:bg-gray-50">
                <h3 className="font-medium">{program.name}</h3>
                <p className="text-sm text-gray-500 capitalize">{program.type.replace('_', ' ')}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const MentorMatches = ({ matches, onCreateConnection }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Find Your Perfect Mentor</h2>
      <div className="grid gap-6">
        {matches.map((match) => (
          <Card key={match.mentor_id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{match.mentor_name}</h3>
                  <p className="text-gray-600 mt-2">{match.mentor_bio}</p>
                  
                  <div className="mt-4 space-y-2">
                    <div>
                      <span className="font-medium">Match Score: </span>
                      <Badge variant="secondary">{match.match_score}/10</Badge>
                    </div>
                    
                    <div>
                      <span className="font-medium">Skills: </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {match.mentor_skills.slice(0, 5).map((skill) => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="font-medium">Why this match: </span>
                      <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                        {match.match_reasons.map((reason, index) => (
                          <li key={index}>{reason}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <span className="font-medium">Available Programs: </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {match.available_programs.map((program) => (
                          <Badge key={program} variant="outline" className="text-xs">
                            {program.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="ml-6 space-y-2">
                  {match.available_programs.map((program) => (
                    <Button
                      key={program}
                      onClick={() => onCreateConnection(match.mentor_id, program)}
                      className="w-full"
                      size="sm"
                    >
                      Connect for {program.replace('_', ' ')}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

const MyConnections = ({ connections }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">My Mentorship Connections</h2>
      <div className="grid gap-4">
        {connections.map((connection) => (
          <Card key={connection.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">
                      Connection #{connection.id}
                    </h3>
                    <Badge variant={connection.status === 'active' ? 'default' : 'secondary'}>
                      {connection.status}
                    </Badge>
                    <Badge variant="outline">
                      {connection.role}
                    </Badge>
                  </div>
                  
                  <div className="mt-2 space-y-1">
                    <p><span className="font-medium">Focus Areas:</span> {connection.focus_areas?.join(', ')}</p>
                    <p><span className="font-medium">Started:</span> {new Date(connection.started_at).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="space-x-2">
                  <Button variant="outline" size="sm">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                  <Button variant="outline" size="sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

const BecomeAMentor = ({ qualifications, onApply }) => {
  const [applicationData, setApplicationData] = useState({
    program_types: [],
    experience_description: '',
    availability: { hours_per_week: 2 }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onApply(applicationData);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Become a Mentor</h2>
        <p className="text-gray-600">Share your expertise and help others grow professionally</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Qualification Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center">
                <span>Qualification Score</span>
                <span className="font-bold">{qualifications.qualification_score}%</span>
              </div>
              <Progress value={qualifications.qualification_score} className="mt-2" />
            </div>

            {qualifications.is_qualified ? (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span>You're qualified to be a mentor!</span>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-amber-600">Complete these steps to improve your qualification:</p>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {qualifications.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}

            {qualifications.strengths.length > 0 && (
              <div>
                <p className="font-medium">Your Strengths:</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {qualifications.strengths.map((strength) => (
                    <Badge key={strength} variant="secondary">
                      {strength}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Apply to Become a Mentor</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Program Types (select all that apply)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['career_development', 'skill_building', 'leadership', 'technical_expertise'].map((type) => (
                  <label key={type} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={applicationData.program_types.includes(type)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setApplicationData(prev => ({
                            ...prev,
                            program_types: [...prev.program_types, type]
                          }));
                        } else {
                          setApplicationData(prev => ({
                            ...prev,
                            program_types: prev.program_types.filter(t => t !== type)
                          }));
                        }
                      }}
                    />
                    <span className="text-sm capitalize">{type.replace('_', ' ')}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Experience Description
              </label>
              <textarea
                value={applicationData.experience_description}
                onChange={(e) => setApplicationData(prev => ({
                  ...prev,
                  experience_description: e.target.value
                }))}
                className="w-full p-3 border rounded-lg"
                rows={4}
                placeholder="Describe your relevant experience and why you want to be a mentor..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Hours per week you can commit
              </label>
              <select
                value={applicationData.availability.hours_per_week}
                onChange={(e) => setApplicationData(prev => ({
                  ...prev,
                  availability: { hours_per_week: parseInt(e.target.value) }
                }))}
                className="w-full p-3 border rounded-lg"
              >
                <option value={1}>1 hour</option>
                <option value={2}>2 hours</option>
                <option value={3}>3 hours</option>
                <option value={4}>4 hours</option>
                <option value={5}>5+ hours</option>
              </select>
            </div>

            <Button type="submit" className="w-full">
              Submit Mentor Application
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

const AnalyticsDashboard = ({ analytics }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Mentorship Analytics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Connections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.total_connections}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Active Connections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.active_connections}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.success_rate}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Avg Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.average_duration_days}</div>
            <p className="text-xs text-muted-foreground">days</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Program Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(analytics.program_type_distribution).map(([program, count]) => (
              <div key={program} className="flex justify-between items-center">
                <span className="capitalize">{program.replace('_', ' ')}</span>
                <Badge variant="secondary">{count}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

