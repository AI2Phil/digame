import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { Avatar } from '../../../components/ui/Avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../../components/ui/Dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/Tabs';
import { useTeamManagement } from '../hooks/useTeamManagement';

interface Team {
  id: number;
  name: string;
  description: string;
  created_by: number;
  created_at: string;
  member_count?: number;
  members?: TeamMember[];
}

interface TeamMember {
  id: number;
  user_id: number;
  role: string;
  joined_at: string;
  user?: {
    id: number;
    username: string;
    email: string;
  };
}

const TeamManagement: React.FC = () => {
  const {
    teams,
    selectedTeam,
    isLoading,
    error,
    fetchTeams,
    createTeam,
    updateTeam,
    deleteTeam,
    addTeamMember,
    removeTeamMember,
    updateMemberRole,
    setSelectedTeam
  } = useTeamManagement();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false);
  const [newTeam, setNewTeam] = useState({ name: '', description: '' });
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('member');

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const handleCreateTeam = async () => {
    if (newTeam.name.trim()) {
      try {
        await createTeam(newTeam);
        setNewTeam({ name: '', description: '' });
        setShowCreateDialog(false);
        fetchTeams();
      } catch (error) {
        console.error('Failed to create team:', error);
      }
    }
  };

  const handleAddMember = async () => {
    if (selectedTeam && newMemberEmail.trim()) {
      try {
        await addTeamMember(selectedTeam.id, {
          email: newMemberEmail,
          role: newMemberRole
        });
        setNewMemberEmail('');
        setNewMemberRole('member');
        setShowAddMemberDialog(false);
        // Refresh team data
        fetchTeams();
      } catch (error) {
        console.error('Failed to add team member:', error);
      }
    }
  };

  const handleRemoveMember = async (memberId: number) => {
    if (selectedTeam && window.confirm('Are you sure you want to remove this member?')) {
      try {
        await removeTeamMember(selectedTeam.id, memberId);
        fetchTeams();
      } catch (error) {
        console.error('Failed to remove team member:', error);
      }
    }
  };

  const handleRoleChange = async (memberId: number, newRole: string) => {
    if (selectedTeam) {
      try {
        await updateMemberRole(selectedTeam.id, memberId, newRole);
        fetchTeams();
      } catch (error) {
        console.error('Failed to update member role:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading teams...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-red-600">Error Loading Teams</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error.message}</p>
            <Button onClick={fetchTeams}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Team Management</h1>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>Create New Team</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Team</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Team Name</label>
                <Input
                  value={newTeam.name}
                  onChange={(e) => setNewTeam(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter team name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={newTeam.description}
                  onChange={(e) => setNewTeam(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter team description"
                  className="w-full p-2 border rounded-md"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTeam}>Create Team</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Teams List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Your Teams</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {teams.map((team) => (
                  <div
                    key={team.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedTeam?.id === team.id
                        ? 'bg-blue-50 border-blue-200'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedTeam(team)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{team.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{team.description}</p>
                      </div>
                      <Badge
                        variant="secondary"
                        icon={null}
                        onRemove={() => {}}
                      >
                        {team.member_count || 0} members
                      </Badge>
                    </div>
                  </div>
                ))}
                {teams.length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    No teams found. Create your first team to get started.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Team Details */}
        <div className="lg:col-span-2">
          {selectedTeam ? (
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="members">Members</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <Card>
                  <CardHeader>
                    <CardTitle>{selectedTeam.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Description</h4>
                        <p className="text-gray-600">{selectedTeam.description}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2">Created</h4>
                          <p className="text-gray-600">
                            {new Date(selectedTeam.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Members</h4>
                          <p className="text-gray-600">{selectedTeam.member_count || 0}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="members">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Team Members</CardTitle>
                      <Dialog open={showAddMemberDialog} onOpenChange={setShowAddMemberDialog}>
                        <DialogTrigger asChild>
                          <Button size="sm">Add Member</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add Team Member</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Email</label>
                              <Input
                                value={newMemberEmail}
                                onChange={(e) => setNewMemberEmail(e.target.value)}
                                placeholder="Enter member email"
                                type="email"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Role</label>
                              <select
                                value={newMemberRole}
                                onChange={(e) => setNewMemberRole(e.target.value)}
                                className="w-full p-2 border rounded-md"
                              >
                                <option value="member">Member</option>
                                <option value="admin">Admin</option>
                                <option value="lead">Lead</option>
                              </select>
                            </div>
                            <div className="flex justify-end space-x-2">
                              <Button variant="outline" onClick={() => setShowAddMemberDialog(false)}>
                                Cancel
                              </Button>
                              <Button onClick={handleAddMember}>Add Member</Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedTeam.members?.map((member) => (
                        <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Avatar
                              src={null}
                              name={member.user?.username || 'Unknown User'}
                              fallback={member.user?.username?.charAt(0).toUpperCase() || 'U'}
                              status={null}
                            />
                            <div>
                              <p className="font-medium">{member.user?.username || 'Unknown User'}</p>
                              <p className="text-sm text-gray-600">{member.user?.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <select
                              value={member.role}
                              onChange={(e) => handleRoleChange(member.id, e.target.value)}
                              className="text-sm border rounded px-2 py-1"
                            >
                              <option value="member">Member</option>
                              <option value="admin">Admin</option>
                              <option value="lead">Lead</option>
                            </select>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveMember(member.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                      {(!selectedTeam.members || selectedTeam.members.length === 0) && (
                        <p className="text-gray-500 text-center py-4">
                          No members found. Add members to get started.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="performance">
                <Card>
                  <CardHeader>
                    <CardTitle>Team Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <p className="text-gray-500">Performance metrics will be displayed here.</p>
                      <p className="text-sm text-gray-400 mt-2">
                        This feature will show team productivity, collaboration patterns, and skill gaps.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle>Team Settings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Team Name</label>
                        <Input defaultValue={selectedTeam.name} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Description</label>
                        <textarea
                          defaultValue={selectedTeam.description}
                          className="w-full p-2 border rounded-md"
                          rows={3}
                        />
                      </div>
                      <div className="flex justify-between">
                        <Button variant="outline" className="text-red-600">
                          Delete Team
                        </Button>
                        <Button>Save Changes</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-gray-500">Select a team to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamManagement;