const express = require('express');
const { TeamRepository } = require('../models/Team');
const { UserRepository } = require('../models/User');
const { authenticate, requireFeature, requireTeamAccess } = require('../middleware/auth');

const router = express.Router();
const teamRepository = new TeamRepository();
const userRepository = new UserRepository();

/**
 * GET /teams
 * Get user's teams
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const userTeams = teamRepository.findByUserId(req.user.id);
    
    res.json({
      success: true,
      teams: userTeams.map(team => team.toJSON()),
      count: userTeams.length
    });

  } catch (error) {
    console.error('Get teams error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch teams'
    });
  }
});

/**
 * POST /teams
 * Create new team
 */
router.post('/', authenticate, requireFeature('team.create'), async (req, res) => {
  try {
    const { name, description, subscriptionTier = 'team' } = req.body;

    if (!name) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Team name is required'
      });
    }

    // Check subscription access
    if (!req.user.hasSubscriptionAccess(subscriptionTier)) {
      return res.status(403).json({
        error: 'Subscription required',
        message: `${subscriptionTier} subscription required to create this type of team`
      });
    }

    const team = teamRepository.create({
      name,
      description,
      ownerId: req.user.id,
      subscriptionTier
    });

    // Update user's team ID
    userRepository.update(req.user.id, { teamId: team.id });

    res.status(201).json({
      success: true,
      message: 'Team created successfully',
      team: team.toJSON()
    });

  } catch (error) {
    console.error('Create team error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create team'
    });
  }
});

/**
 * GET /teams/:teamId
 * Get team details
 */
router.get('/:teamId', authenticate, requireTeamAccess, async (req, res) => {
  try {
    const team = teamRepository.findById(req.params.teamId);
    
    if (!team) {
      return res.status(404).json({
        error: 'Team not found',
        message: 'The requested team does not exist'
      });
    }

    // Get member details
    const teamData = team.toJSON();
    teamData.memberDetails = [];

    for (const member of team.members) {
      const user = userRepository.findById(member.userId);
      if (user) {
        teamData.memberDetails.push({
          ...member,
          user: user.toSafeJSON()
        });
      }
    }

    res.json({
      success: true,
      team: teamData
    });

  } catch (error) {
    console.error('Get team error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch team details'
    });
  }
});

/**
 * PUT /teams/:teamId
 * Update team
 */
router.put('/:teamId', authenticate, requireTeamAccess, async (req, res) => {
  try {
    const team = teamRepository.findById(req.params.teamId);
    
    if (!team) {
      return res.status(404).json({
        error: 'Team not found',
        message: 'The requested team does not exist'
      });
    }

    // Check if user can manage team
    if (!team.userHasPermission(req.user.id, 'team.manage') && !req.user.isPlatformOwner) {
      return res.status(403).json({
        error: 'Permission denied',
        message: 'You do not have permission to manage this team'
      });
    }

    const { name, description, settings } = req.body;
    const updates = {};
    
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (settings !== undefined) updates.settings = { ...team.settings, ...settings };

    const updatedTeam = teamRepository.update(req.params.teamId, updates);

    res.json({
      success: true,
      message: 'Team updated successfully',
      team: updatedTeam.toJSON()
    });

  } catch (error) {
    console.error('Update team error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update team'
    });
  }
});

/**
 * POST /teams/:teamId/invite
 * Invite user to team
 */
router.post('/:teamId/invite', authenticate, requireTeamAccess, async (req, res) => {
  try {
    const team = teamRepository.findById(req.params.teamId);
    
    if (!team) {
      return res.status(404).json({
        error: 'Team not found',
        message: 'The requested team does not exist'
      });
    }

    // Check if user can invite
    if (!team.userHasPermission(req.user.id, 'team.invite') && !req.user.isPlatformOwner) {
      return res.status(403).json({
        error: 'Permission denied',
        message: 'You do not have permission to invite users to this team'
      });
    }

    const { email, role = 'member' } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Email is required'
      });
    }

    // Check if user already exists and is a member
    const existingUser = userRepository.findByEmail(email);
    if (existingUser && team.isMember(existingUser.id)) {
      return res.status(409).json({
        error: 'User already member',
        message: 'This user is already a member of the team'
      });
    }

    const invited = team.inviteUser(email, role, req.user.id);
    
    if (!invited) {
      return res.status(409).json({
        error: 'Invitation exists',
        message: 'An invitation for this email already exists'
      });
    }

    teamRepository.update(req.params.teamId, team);

    res.json({
      success: true,
      message: 'Invitation sent successfully',
      invitation: team.invitations[team.invitations.length - 1]
    });

  } catch (error) {
    console.error('Invite user error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to send invitation'
    });
  }
});

/**
 * POST /teams/:teamId/join/:invitationId
 * Accept team invitation
 */
router.post('/:teamId/join/:invitationId', authenticate, async (req, res) => {
  try {
    const team = teamRepository.findById(req.params.teamId);
    
    if (!team) {
      return res.status(404).json({
        error: 'Team not found',
        message: 'The requested team does not exist'
      });
    }

    const accepted = team.acceptInvitation(req.params.invitationId, req.user.id);
    
    if (!accepted) {
      return res.status(400).json({
        error: 'Invalid invitation',
        message: 'The invitation is invalid or has expired'
      });
    }

    teamRepository.update(req.params.teamId, team);

    // Update user's team ID
    userRepository.update(req.user.id, { teamId: team.id });

    res.json({
      success: true,
      message: 'Successfully joined team',
      team: team.toSafeJSON()
    });

  } catch (error) {
    console.error('Join team error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to join team'
    });
  }
});

/**
 * DELETE /teams/:teamId/members/:userId
 * Remove member from team
 */
router.delete('/:teamId/members/:userId', authenticate, requireTeamAccess, async (req, res) => {
  try {
    const team = teamRepository.findById(req.params.teamId);
    
    if (!team) {
      return res.status(404).json({
        error: 'Team not found',
        message: 'The requested team does not exist'
      });
    }

    // Check if user can manage team
    if (!team.userHasPermission(req.user.id, 'team.manage') && !req.user.isPlatformOwner) {
      return res.status(403).json({
        error: 'Permission denied',
        message: 'You do not have permission to remove members from this team'
      });
    }

    const targetUserId = parseInt(req.params.userId);
    
    // Prevent removing team owner
    if (team.ownerId === targetUserId) {
      return res.status(400).json({
        error: 'Cannot remove owner',
        message: 'Cannot remove team owner. Transfer ownership first.'
      });
    }

    const removed = team.removeMember(targetUserId);
    
    if (!removed) {
      return res.status(404).json({
        error: 'Member not found',
        message: 'The specified user is not a member of this team'
      });
    }

    teamRepository.update(req.params.teamId, team);

    // Update user's team ID
    userRepository.update(targetUserId, { teamId: null });

    res.json({
      success: true,
      message: 'Member removed successfully'
    });

  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to remove member'
    });
  }
});

/**
 * PUT /teams/:teamId/members/:userId/role
 * Update member role
 */
router.put('/:teamId/members/:userId/role', authenticate, requireTeamAccess, async (req, res) => {
  try {
    const team = teamRepository.findById(req.params.teamId);
    
    if (!team) {
      return res.status(404).json({
        error: 'Team not found',
        message: 'The requested team does not exist'
      });
    }

    // Check if user can manage team
    if (!team.userHasPermission(req.user.id, 'team.manage') && !req.user.isPlatformOwner) {
      return res.status(403).json({
        error: 'Permission denied',
        message: 'You do not have permission to update member roles'
      });
    }

    const { role } = req.body;
    const targetUserId = parseInt(req.params.userId);

    if (!role) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Role is required'
      });
    }

    // Prevent changing owner role
    if (team.ownerId === targetUserId && role !== 'owner') {
      return res.status(400).json({
        error: 'Cannot change owner role',
        message: 'Cannot change team owner role. Transfer ownership first.'
      });
    }

    const updated = team.updateMemberRole(targetUserId, role);
    
    if (!updated) {
      return res.status(404).json({
        error: 'Member not found',
        message: 'The specified user is not a member of this team'
      });
    }

    teamRepository.update(req.params.teamId, team);

    res.json({
      success: true,
      message: 'Member role updated successfully',
      member: team.getMember(targetUserId)
    });

  } catch (error) {
    console.error('Update member role error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update member role'
    });
  }
});

/**
 * POST /teams/:teamId/projects
 * Create team project
 */
router.post('/:teamId/projects', authenticate, requireTeamAccess, async (req, res) => {
  try {
    const team = teamRepository.findById(req.params.teamId);
    
    if (!team) {
      return res.status(404).json({
        error: 'Team not found',
        message: 'The requested team does not exist'
      });
    }

    // Check if user can create projects
    if (!team.userHasPermission(req.user.id, 'team.projects') && !req.user.isPlatformOwner) {
      return res.status(403).json({
        error: 'Permission denied',
        message: 'You do not have permission to create projects in this team'
      });
    }

    const { name, description, members = [] } = req.body;

    if (!name) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Project name is required'
      });
    }

    const project = team.createProject({
      name,
      description,
      ownerId: req.user.id,
      members: [req.user.id, ...members]
    });

    teamRepository.update(req.params.teamId, team);

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      project
    });

  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create project'
    });
  }
});

/**
 * GET /teams/:teamId/analytics
 * Get team analytics
 */
router.get('/:teamId/analytics', authenticate, requireTeamAccess, requireFeature('team.analytics'), async (req, res) => {
  try {
    const team = teamRepository.findById(req.params.teamId);
    
    if (!team) {
      return res.status(404).json({
        error: 'Team not found',
        message: 'The requested team does not exist'
      });
    }

    const analytics = {
      team: team.getStatistics(),
      members: {
        total: team.members.filter(m => m.isActive).length,
        byRole: team.members.reduce((acc, member) => {
          acc[member.role] = (acc[member.role] || 0) + 1;
          return acc;
        }, {}),
        recentJoins: team.members
          .filter(m => m.joinedAt > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
          .length
      },
      projects: {
        total: team.projects.length,
        active: team.projects.filter(p => p.status === 'active').length,
        completed: team.projects.filter(p => p.status === 'completed').length,
        recent: team.projects
          .filter(p => p.updatedAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
          .length
      },
      invitations: {
        pending: team.invitations.filter(i => i.status === 'pending').length,
        accepted: team.invitations.filter(i => i.status === 'accepted').length,
        expired: team.invitations.filter(i => i.status === 'expired').length
      }
    };

    res.json({
      success: true,
      analytics
    });

  } catch (error) {
    console.error('Get team analytics error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch team analytics'
    });
  }
});

module.exports = router;