import React, { useState } from 'react';
import { 
  Users, UserPlus, Mail, MoreHorizontal, Crown, 
  Shield, Eye, Edit, Trash2, Search, Filter,
  Calendar, Clock, Target, TrendingUp, Award,
  Settings, Download, Share2, MessageSquare,
  Activity, BarChart3, Zap, CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/Avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/DropdownMenu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/Dialog';
import { Separator } from '../components/ui/Separator';
import { Progress } from '../components/ui/Progress';
import { Chart } from '../components/ui/Chart';
import { Textarea } from '../components/ui/Textarea'; // Added
import { Switch } from '../components/ui/Switch';   // Added

const TeamsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // State for Invite Dialog
  const [inviteData, setInviteData] = useState({
    email: '',
    role: 'member', // Default role
    message: ''
  });

  const handleInviteChange = (e) => {
    const { name, value } = e.target;
    setInviteData(prev => ({ ...prev, [name]: value }));
  };

  const handleInviteRoleChange = (value) => {
    setInviteData(prev => ({ ...prev, role: value }));
  };


  // State for Team Settings
  const [teamSettings, setTeamSettings] = useState({
    teamName: "Product Development Team",
    teamDescription: "A collaborative team focused on building innovative productivity solutions.",
    defaultRole: "member",
    publicProfile: false,
    shareAnalytics: true
  });

  const handleTeamSettingsChange = (key, value) => {
    setTeamSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleTeamDescriptionChange = (e) => {
     setTeamSettings(prev => ({ ...prev, teamDescription: e.target.value }));
  };

  // Sample team data
  const teamMembers = [
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@company.com',
      role: 'Team Lead',
      status: 'active',
      avatar: '/api/placeholder/40/40',
      joinDate: '2023-01-15',
      lastActive: '2 hours ago',
      productivity: 92,
      goalsCompleted: 15,
      hoursTracked: 168,
      permissions: ['admin', 'reports', 'team_management']
    },
    {
      id: '2',
      name: 'Michael Chen',
      email: 'michael.chen@company.com',
      role: 'Senior Developer',
      status: 'active',
      avatar: '/api/placeholder/40/40',
      joinDate: '2023-02-20',
      lastActive: '1 hour ago',
      productivity: 88,
      goalsCompleted: 12,
      hoursTracked: 152,
      permissions: ['reports', 'goals']
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      email: 'emily.rodriguez@company.com',
      role: 'Product Manager',
      status: 'active',
      avatar: '/api/placeholder/40/40',
      joinDate: '2023-03-10',
      lastActive: '30 minutes ago',
      productivity: 95,
      goalsCompleted: 18,
      hoursTracked: 175,
      permissions: ['reports', 'goals', 'analytics']
    },
    {
      id: '4',
      name: 'David Kim',
      email: 'david.kim@company.com',
      role: 'Designer',
      status: 'inactive',
      avatar: '/api/placeholder/40/40',
      joinDate: '2023-04-05',
      lastActive: '2 days ago',
      productivity: 76,
      goalsCompleted: 8,
      hoursTracked: 98,
      permissions: ['goals']
    },
    {
      id: '5',
      name: 'Lisa Wang',
      email: 'lisa.wang@company.com',
      role: 'Developer',
      status: 'active',
      avatar: '/api/placeholder/40/40',
      joinDate: '2023-05-12',
      lastActive: '15 minutes ago',
      productivity: 85,
      goalsCompleted: 11,
      hoursTracked: 134,
      permissions: ['reports', 'goals']
    }
  ];

  // Team analytics data
  const teamAnalytics = {
    totalMembers: teamMembers.length,
    activeMembers: teamMembers.filter(m => m.status === 'active').length,
    avgProductivity: Math.round(teamMembers.reduce((sum, m) => sum + m.productivity, 0) / teamMembers.length),
    totalGoalsCompleted: teamMembers.reduce((sum, m) => sum + m.goalsCompleted, 0),
    totalHoursTracked: teamMembers.reduce((sum, m) => sum + m.hoursTracked, 0)
  };

  // Chart data for team productivity
  const productivityData = [
    { name: 'Mon', team: 85, individual: 82 },
    { name: 'Tue', team: 88, individual: 85 },
    { name: 'Wed', team: 92, individual: 89 },
    { name: 'Thu', team: 87, individual: 84 },
    { name: 'Fri', team: 90, individual: 88 },
    { name: 'Sat', team: 78, individual: 75 },
    { name: 'Sun', team: 72, individual: 70 }
  ];

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || member.role.toLowerCase().includes(roleFilter.toLowerCase());
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadge = (role) => {
    switch (role) {
      case 'Team Lead':
        return <Badge variant="default" className="bg-purple-100 text-purple-800"><Crown className="mr-1 h-3 w-3" />{role}</Badge>;
      case 'Senior Developer':
        return <Badge variant="secondary"><Shield className="mr-1 h-3 w-3" />{role}</Badge>;
      case 'Product Manager':
        return <Badge variant="outline"><Target className="mr-1 h-3 w-3" />{role}</Badge>;
      default:
        return <Badge variant="secondary">{role}</Badge>;
    }
  };

  const getStatusBadge = (status) => {
    return status === 'active' 
      ? <Badge variant="success">Active</Badge>
      : <Badge variant="secondary">Inactive</Badge>;
  };

  const handleInviteMember = () => {
    alert('Invite member functionality would be implemented here');
  };

  const handleEditMember = (memberId) => {
    alert(`Edit member ${memberId} functionality would be implemented here`);
  };

  const handleRemoveMember = (memberId) => {
    alert(`Remove member ${memberId} functionality would be implemented here`);
  };

  const handleExportTeamData = () => {
    alert('Export team data functionality would be implemented here');
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Team Management</h1>
          <p className="text-muted-foreground">Manage your team members and track collaborative productivity</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleExportTeamData}>
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogDescription>
                  Send an invitation to join your team workspace
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="inviteEmail">Email Address</Label>
                  <Input
                    id="inviteEmail"
                    name="email"
                    placeholder="colleague@company.com"
                    type="email"
                    value={inviteData.email}
                    onChange={handleInviteChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="inviteRole">Role</Label>
                  <Select
                    id="inviteRole"
                    value={inviteData.role}
                    onChange={handleInviteRoleChange}
                    options={[
                      { value: 'admin', label: 'Admin' },
                      { value: 'team_lead', label: 'Team Lead' },
                      { value: 'senior', label: 'Senior Member' },
                      { value: 'member', label: 'Member' },
                    ]}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="inviteMessage">Personal Message (Optional)</Label>
                  <Textarea
                    id="inviteMessage"
                    name="message"
                    className="w-full min-h-[80px]"
                    placeholder="Welcome to our team! Looking forward to collaborating with you."
                    value={inviteData.message}
                    onChange={handleInviteChange}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline">Cancel</Button>
                <Button onClick={handleInviteMember}>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Invitation
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Team Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Members</p>
                <p className="text-2xl font-bold">{teamAnalytics.totalMembers}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Members</p>
                <p className="text-2xl font-bold">{teamAnalytics.activeMembers}</p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Productivity</p>
                <p className="text-2xl font-bold">{teamAnalytics.avgProductivity}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Goals Completed</p>
                <p className="text-2xl font-bold">{teamAnalytics.totalGoalsCompleted}</p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Hours Tracked</p>
                <p className="text-2xl font-bold">{teamAnalytics.totalHoursTracked}h</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="members" className="space-y-6">
        <TabsList>
          <TabsTrigger value="members">Team Members</TabsTrigger>
          <TabsTrigger value="analytics">Team Analytics</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="settings">Team Settings</TabsTrigger>
        </TabsList>

        {/* Team Members */}
        <TabsContent value="members" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search team members..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="w-full md:w-48">
                  <Select
                    value={roleFilter}
                    onChange={setRoleFilter}
                    options={[
                      { value: 'all', label: 'All Roles' },
                      { value: 'lead', label: 'Team Lead' },
                      { value: 'senior', label: 'Senior' }, // Assuming 'senior developer' based on data
                      { value: 'developer', label: 'Developer' },
                      { value: 'designer', label: 'Designer' },
                      { value: 'manager', label: 'Product Manager' }, // Assuming 'product manager'
                    ]}
                  />
                </div>
                
                <div className="w-full md:w-48">
                  <Select
                    value={statusFilter}
                    onChange={setStatusFilter}
                    options={[
                      { value: 'all', label: 'All Statuses' },
                      { value: 'active', label: 'Active' },
                      { value: 'inactive', label: 'Inactive' },
                    ]}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Team Members List */}
          <Card>
            <CardHeader>
              <CardTitle>Team Members ({filteredMembers.length})</CardTitle>
              <CardDescription>
                Manage your team members, roles, and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Productivity</TableHead>
                    <TableHead>Goals</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback>
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{member.name}</div>
                            <div className="text-sm text-muted-foreground">{member.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(member.role)}</TableCell>
                      <TableCell>{getStatusBadge(member.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Progress value={member.productivity} className="w-16" />
                          <span className="text-sm font-medium">{member.productivity}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>{member.goalsCompleted}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {member.lastActive}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => alert(`View ${member.name}'s profile`)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditMember(member.id)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Member
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => alert(`Message ${member.name}`)}>
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Send Message
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleRemoveMember(member.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Remove Member
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Analytics */}
        <TabsContent value="analytics" className="space-y-6">
          {/* Productivity Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Team Productivity Trends</CardTitle>
              <CardDescription>
                Compare team performance against individual averages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Chart
                type="line"
                data={productivityData}
                config={{
                  team: { label: 'Team Average', color: '#3b82f6' },
                  individual: { label: 'Individual Average', color: '#10b981' }
                }}
                className="h-80"
              />
            </CardContent>
          </Card>

          {/* Member Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Member Performance Overview</CardTitle>
              <CardDescription>
                Individual productivity metrics and achievements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-muted-foreground">{member.role}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Productivity</div>
                        <div className="font-semibold">{member.productivity}%</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Goals</div>
                        <div className="font-semibold">{member.goalsCompleted}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Hours</div>
                        <div className="font-semibold">{member.hoursTracked}h</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Permissions */}
        <TabsContent value="permissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Permissions</CardTitle>
              <CardDescription>
                Manage access levels and permissions for team members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {teamMembers.map((member) => (
                  <div key={member.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback>
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{member.name}</div>
                          <div className="text-sm text-muted-foreground">{member.role}</div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Settings className="mr-2 h-4 w-4" />
                        Edit Permissions
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {['admin', 'reports', 'team_management', 'analytics', 'goals', 'settings'].map((permission) => (
                        <Badge
                          key={permission}
                          variant={member.permissions.includes(permission) ? 'default' : 'secondary'}
                          className="justify-center"
                        >
                          {permission.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Settings */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Settings</CardTitle>
              <CardDescription>
                Configure team-wide settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="teamName" className="text-base font-medium">Team Name</Label>
                  <Input
                    id="teamName"
                    value={teamSettings.teamName}
                    onChange={(e) => handleTeamSettingsChange('teamName', e.target.value)}
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <Label htmlFor="teamDescription" className="text-base font-medium">Team Description</Label>
                  <Textarea
                    id="teamDescription"
                    className="w-full min-h-[80px] mt-2"
                    value={teamSettings.teamDescription}
                    onChange={handleTeamDescriptionChange} // Corrected to use specific handler if Textarea provides event
                  />
                </div>
                
                <div>
                  <Label htmlFor="defaultRoleSettings" className="text-base font-medium">Default Role for New Members</Label>
                  <Select
                    id="defaultRoleSettings"
                    value={teamSettings.defaultRole}
                    onChange={(value) => handleTeamSettingsChange('defaultRole', value)}
                    className="mt-2"
                    options={[
                      { value: 'admin', label: 'Admin' },
                      { value: 'team_lead', label: 'Team Lead' },
                      { value: 'senior', label: 'Senior Member' },
                      { value: 'member', label: 'Member' },
                    ]}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Team Visibility</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="publicProfileSwitch">Public Team Profile</Label>
                      <p className="text-sm text-muted-foreground">Allow others to discover your team</p>
                    </div>
                    <Switch
                      id="publicProfileSwitch"
                      checked={teamSettings.publicProfile}
                      onCheckedChange={(isChecked) => handleTeamSettingsChange('publicProfile', isChecked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="shareAnalyticsSwitch">Share Team Analytics</Label>
                      <p className="text-sm text-muted-foreground">Share productivity insights with team members</p>
                    </div>
                    <Switch
                      id="shareAnalyticsSwitch"
                      checked={teamSettings.shareAnalytics}
                      onCheckedChange={(isChecked) => handleTeamSettingsChange('shareAnalytics', isChecked)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex justify-end space-x-2">
                <Button variant="outline">Reset to Defaults</Button>
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TeamsPage;