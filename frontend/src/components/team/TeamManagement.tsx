import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/router';
import { useToastActions } from '../ui/Toast';
import { teamApi, Team as ApiTeam, TeamCreate, TeamMember as ApiTeamMember, InviteRequest } from '../../services/api/teamApi';

interface TeamMember {
  userId: number;
  role: string;
  joinedAt: string;
  isActive: boolean;
  permissions: string[];
  user: {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    isVerified: boolean;
  };
}

interface Team {
  id: string;
  name: string;
  description: string;
  ownerId: number;
  subscriptionTier: string;
  members: TeamMember[];
  projects: any[];
  invitations: any[];
  statistics: {
    totalMembers: number;
    pendingInvitations: number;
    activeProjects: number;
  };
}

interface TeamManagementProps {
  onTeamCreated?: (team: Team) => void;
}

const TeamManagement: React.FC<TeamManagementProps> = ({ onTeamCreated }) => {
  const { user, hasFeatureAccess } = useAuth();
  const router = useRouter();
  const toast = useToastActions();
  const [currentView, setCurrentView] = useState<'overview' | 'create' | 'join' | 'manage'>('overview');
  const [userTeams, setUserTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Team creation form
  const [teamForm, setTeamForm] = useState({
    name: '',
    description: '',
    subscriptionTier: user?.subscriptionTier || 'team'
  });

  // Invitation form
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'member'
  });

  useEffect(() => {
    loadUserTeams();
  }, []);

  const loadUserTeams = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const teams = await teamApi.getTeams();
      setUserTeams(teams);
      
      if (teams.length > 0) {
        setSelectedTeam(teams[0]);
      }
      
      if (teams.length === 0) {
        toast.info('No Teams Found', 'Create your first team to start collaborating with others.');
      }
      
      toast.success('Teams Loaded', `Loaded ${teams.length} teams from database.`);
    } catch (error) {
      console.error('Failed to load teams:', error);
      const errorMessage = error instanceof Error ? error.message : 'Network error while loading teams';
      setError(errorMessage);
      toast.error('Failed to Load Teams', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const createTeam = async () => {
    try {
      setIsLoading(true);
      setError('');

      if (!teamForm.name.trim()) {
        setError('Team name is required');
        return;
      }

      const teamData: TeamCreate = {
        name: teamForm.name,
        description: teamForm.description,
        subscriptionTier: teamForm.subscriptionTier
      };

      const newTeam = await teamApi.createTeam(teamData);
      setUserTeams(prev => [...prev, newTeam]);
      setSelectedTeam(newTeam);
      setCurrentView('manage');
      setTeamForm({ name: '', description: '', subscriptionTier: 'team' });
      
      toast.success('Team Created Successfully', `${newTeam.name} has been created and you can now invite members.`);
      
      if (onTeamCreated) {
        onTeamCreated(newTeam);
      }
    } catch (error) {
      console.error('Team creation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Network error while creating team';
      setError(errorMessage);
      toast.error('Team Creation Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const inviteMember = async () => {
    if (!selectedTeam || !inviteForm.email.trim()) return;

    try {
      setIsLoading(true);
      
      const inviteData: InviteRequest = {
        email: inviteForm.email,
        role: inviteForm.role
      };

      await teamApi.inviteMember(selectedTeam.id, inviteData);
      setInviteForm({ email: '', role: 'member' });
      await loadUserTeams(); // Refresh team data
      toast.success('Invitation Sent', `Invitation sent to ${inviteForm.email} successfully.`);
    } catch (error) {
      console.error('Invitation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Network error while sending invitation';
      setError(errorMessage);
      toast.error('Invitation Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const removeMember = async (userId: number) => {
    if (!selectedTeam) return;

    try {
      await teamApi.removeTeamMember(selectedTeam.id, userId);
      await loadUserTeams(); // Refresh team data
      toast.success('Member Removed', 'Team member has been removed successfully.');
    } catch (error) {
      console.error('Remove member error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Network error while removing member';
      setError(errorMessage);
      toast.error('Remove Member Failed', errorMessage);
    }
  };

  const updateMemberRole = async (userId: number, newRole: string) => {
    if (!selectedTeam) return;

    try {
      await teamApi.updateTeamMember(selectedTeam.id, userId, { role: newRole });
      await loadUserTeams(); // Refresh team data
      toast.success('Role Updated', `Member role has been updated to ${newRole} successfully.`);
    } catch (error) {
      console.error('Update role error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Network error while updating member role';
      setError(errorMessage);
      toast.error('Role Update Failed', errorMessage);
    }
  };

  // Check if user can create teams
  const canCreateTeam = hasFeatureAccess && hasFeatureAccess('team.create');

  if (!canCreateTeam && userTeams.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Team Features Locked
        </h2>
        <p className="text-gray-600 mb-6">
          Upgrade to Team or Enterprise subscription to create and manage teams.
        </p>
        <button
          onClick={() => router.push('/pricing')}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700"
        >
          View Pricing Plans
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
            <p className="text-gray-600">
              Create teams, invite members, and collaborate effectively
            </p>
          </div>
          <div className="flex space-x-3">
            {canCreateTeam && (
              <button
                onClick={() => setCurrentView('create')}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700"
              >
                Create Team
              </button>
            )}
            <button
              onClick={() => setCurrentView('join')}
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50"
            >
              Join Team
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Navigation */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {['overview', 'create', 'join', 'manage'].map((view) => (
              <button
                key={view}
                onClick={() => setCurrentView(view as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  currentView === view
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        {currentView === 'overview' && (
          <TeamOverview 
            teams={userTeams} 
            onSelectTeam={setSelectedTeam}
            onManageTeam={() => setCurrentView('manage')}
          />
        )}

        {currentView === 'create' && (
          <TeamCreation
            form={teamForm}
            setForm={setTeamForm}
            onSubmit={createTeam}
            isLoading={isLoading}
            canCreate={canCreateTeam}
          />
        )}

        {currentView === 'join' && (
          <TeamJoin />
        )}

        {currentView === 'manage' && selectedTeam && (
          <TeamManagementView
            team={selectedTeam}
            inviteForm={inviteForm}
            setInviteForm={setInviteForm}
            onInvite={inviteMember}
            onRemoveMember={removeMember}
            onUpdateRole={updateMemberRole}
            isLoading={isLoading}
            currentUser={user}
          />
        )}
      </div>
    </div>
  );
};

// Sub-components
const TeamOverview: React.FC<any> = ({ teams, onSelectTeam, onManageTeam }) => {
  if (teams.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">👥</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No teams yet
        </h3>
        <p className="text-gray-600 mb-6">
          Create your first team to start collaborating with others.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Teams</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team: Team) => (
          <div key={team.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{team.name}</h3>
              <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
                {team.subscriptionTier}
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-4">{team.description}</p>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Members:</span>
                <span className="font-medium">{team.statistics.totalMembers}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Projects:</span>
                <span className="font-medium">{team.statistics.activeProjects}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Pending Invites:</span>
                <span className="font-medium">{team.statistics.pendingInvitations}</span>
              </div>
            </div>

            <button
              onClick={() => {
                onSelectTeam(team);
                onManageTeam();
              }}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700"
            >
              Manage Team
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const TeamCreation: React.FC<any> = ({ form, setForm, onSubmit, isLoading, canCreate }) => {
  if (!canCreate) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔒</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Upgrade Required
        </h3>
        <p className="text-gray-600">
          Team creation requires a Team or Enterprise subscription.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Create New Team</h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Team Name *
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter team name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe your team's purpose and goals"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subscription Tier
          </label>
          <select
            value={form.subscriptionTier}
            onChange={(e) => setForm(prev => ({ ...prev, subscriptionTier: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="team">Team ($99/month)</option>
            <option value="enterprise">Enterprise (Contact Sales)</option>
          </select>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Team Features Include:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Unlimited team members</li>
            <li>• Project collaboration tools</li>
            <li>• Team analytics and insights</li>
            <li>• Advanced permission management</li>
            <li>• Priority support</li>
          </ul>
        </div>

        <button
          onClick={onSubmit}
          disabled={isLoading || !form.name.trim()}
          className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Creating Team...' : 'Create Team'}
        </button>
      </div>
    </div>
  );
};

const TeamJoin: React.FC = () => {
  const [inviteCode, setInviteCode] = useState('');

  return (
    <div className="max-w-2xl mx-auto text-center">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Join a Team</h2>
      
      <div className="text-6xl mb-6">🤝</div>
      
      <p className="text-gray-600 mb-8">
        Enter an invitation code or link to join an existing team.
      </p>

      <div className="space-y-4">
        <input
          type="text"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value)}
          placeholder="Enter invitation code or paste invitation link"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
        
        <button
          disabled={!inviteCode.trim()}
          className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Join Team
        </button>
      </div>

      <div className="mt-8 text-sm text-gray-500">
        Don't have an invitation? Ask your team leader to send you one.
      </div>
    </div>
  );
};

const TeamManagementView: React.FC<any> = ({ 
  team, 
  inviteForm, 
  setInviteForm, 
  onInvite, 
  onRemoveMember, 
  onUpdateRole, 
  isLoading,
  currentUser 
}) => {
  const [activeTab, setActiveTab] = useState('members');

  const isOwner = team.ownerId === currentUser?.id;
  const canManage = isOwner || team.members.find(m => m.userId === currentUser?.id)?.role === 'admin';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{team.name}</h2>
          <p className="text-gray-600">{team.description}</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Team ID: {team.id}</div>
          <div className="text-sm font-medium text-indigo-600">{team.subscriptionTier}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {['members', 'projects', 'settings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'members' && (
        <div>
          {/* Invite Section */}
          {canManage && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Invite New Member</h3>
              <div className="flex space-x-4">
                <input
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email address"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                <select
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm(prev => ({ ...prev, role: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="member">Member</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
                <button
                  onClick={onInvite}
                  disabled={isLoading || !inviteForm.email.trim()}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md font-medium hover:bg-indigo-700 disabled:opacity-50"
                >
                  Invite
                </button>
              </div>
            </div>
          )}

          {/* Members List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Team Members ({team.statistics.totalMembers})</h3>
            {team.memberDetails?.map((member: any) => (
              <div key={member.userId} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 bg-indigo-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">
                      {member.user.firstName?.[0] || member.user.username[0]}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {member.user.firstName} {member.user.lastName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {member.user.email} • {member.role}
                    </div>
                  </div>
                  {member.user.isVerified && (
                    <span className="text-green-600 text-sm">✓ Verified</span>
                  )}
                  {team.ownerId === member.userId && (
                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">Owner</span>
                  )}
                </div>

                {canManage && member.userId !== team.ownerId && member.userId !== currentUser?.id && (
                  <div className="flex items-center space-x-2">
                    <select
                      value={member.role}
                      onChange={(e) => onUpdateRole(member.userId, e.target.value)}
                      className="text-sm border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="member">Member</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button
                      onClick={() => onRemoveMember(member.userId)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pending Invitations */}
          {team.invitations?.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Pending Invitations ({team.statistics.pendingInvitations})
              </h3>
              <div className="space-y-2">
                {team.invitations
                  .filter((inv: any) => inv.status === 'pending')
                  .map((invitation: any) => (
                    <div key={invitation.id} className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div>
                        <span className="font-medium">{invitation.email}</span>
                        <span className="text-sm text-gray-500 ml-2">• {invitation.role}</span>
                      </div>
                      <span className="text-sm text-yellow-600">Pending</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'projects' && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🚧</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Project Management
          </h3>
          <p className="text-gray-600">
            Project collaboration features coming soon!
          </p>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⚙️</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Team Settings
          </h3>
          <p className="text-gray-600">
            Advanced team settings coming soon!
          </p>
        </div>
      )}
    </div>
  );
};

export default TeamManagement;