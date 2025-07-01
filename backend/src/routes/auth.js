const express = require('express');
const bcrypt = require('bcryptjs');
const jwtService = require('../auth/jwt');
const { UserRepository } = require('../models/User');
const { authenticate, optionalAuth, rateLimit } = require('../middleware/auth');

const router = express.Router();
const userRepository = new UserRepository();

// Apply rate limiting to auth routes
router.use(rateLimit(10, 5 * 60 * 1000)); // 10 requests per 5 minutes

/**
 * POST /auth/login
 * User login with credentials
 */
router.post('/login', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!password) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Password is required'
      });
    }

    if (!username && !email) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Username or email is required'
      });
    }

    // Authenticate user
    const identifier = username || email;
    const user = userRepository.authenticate(identifier, password);

    if (!user) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid credentials'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        error: 'Account disabled',
        message: 'Your account has been disabled. Please contact support.'
      });
    }

    // Generate tokens
    const tokens = jwtService.generateTokenPair(user);

    // Log successful login
    console.log(`Login successful: ${user.email} (${user.role})`);

    res.json({
      success: true,
      message: 'Login successful',
      user: user.toJSON(),
      tokens,
      // Legacy compatibility
      token: tokens.accessToken
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred during login'
    });
  }
});

/**
 * POST /auth/refresh
 * Refresh access token using refresh token
 */
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Refresh token is required'
      });
    }

    // Verify refresh token
    const decoded = jwtService.verifyRefreshToken(refreshToken);
    const user = userRepository.findById(decoded.userId);

    if (!user || !user.isActive) {
      return res.status(401).json({
        error: 'Invalid refresh token',
        message: 'User not found or inactive'
      });
    }

    // Generate new token pair
    const tokens = jwtService.generateTokenPair(user);

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      tokens,
      // Legacy compatibility
      token: tokens.accessToken
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      error: 'Invalid refresh token',
      message: error.message
    });
  }
});

/**
 * GET /auth/profile
 * Get current user profile
 */
router.get('/profile', authenticate, (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user.toJSON()
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch user profile'
    });
  }
});

/**
 * PUT /auth/profile
 * Update current user profile
 */
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { firstName, lastName, profile, preferences } = req.body;
    
    const updates = {};
    if (firstName !== undefined) updates.firstName = firstName;
    if (lastName !== undefined) updates.lastName = lastName;
    if (profile !== undefined) updates.profile = { ...req.user.profile, ...profile };
    if (preferences !== undefined) updates.preferences = { ...req.user.preferences, ...preferences };

    const updatedUser = userRepository.update(req.user.id, updates);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser.toJSON()
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update profile'
    });
  }
});

/**
 * POST /auth/logout
 * User logout (invalidate token)
 */
router.post('/logout', optionalAuth, (req, res) => {
  try {
    // In a real implementation, you would add the token to a blacklist
    // For now, we'll just log the logout
    if (req.user) {
      console.log(`Logout: ${req.user.email}`);
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred during logout'
    });
  }
});

/**
 * POST /auth/demo
 * Enter demo mode
 */
router.post('/demo', (req, res) => {
  try {
    const demoUser = userRepository.findByUsername('demo');
    
    if (!demoUser) {
      return res.status(500).json({
        error: 'Demo unavailable',
        message: 'Demo user not found'
      });
    }

    // Generate demo tokens
    const tokens = jwtService.generateTokenPair(demoUser);

    console.log('Demo mode activated');

    res.json({
      success: true,
      message: 'Demo mode activated',
      user: demoUser.toJSON(),
      tokens,
      isDemoMode: true,
      // Legacy compatibility
      token: tokens.accessToken
    });

  } catch (error) {
    console.error('Demo mode error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to activate demo mode'
    });
  }
});

/**
 * GET /auth/verify-token
 * Verify if current token is valid
 */
router.get('/verify-token', authenticate, (req, res) => {
  try {
    res.json({
      success: true,
      valid: true,
      user: req.user.toSafeJSON(),
      tokenInfo: {
        expiresAt: req.tokenPayload.exp * 1000,
        issuedAt: req.tokenPayload.iat * 1000,
        issuer: req.tokenPayload.iss
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to verify token'
    });
  }
});

/**
 * GET /auth/permissions
 * Get current user's permissions and accessible features
 */
router.get('/permissions', authenticate, (req, res) => {
  try {
    res.json({
      success: true,
      permissions: req.user.permissions,
      accessibleFeatures: req.user.getAccessibleFeatures(),
      subscriptionTier: req.user.subscriptionTier,
      isPlatformOwner: req.user.isPlatformOwner,
      teamId: req.user.teamId
    });
  } catch (error) {
    console.error('Permissions fetch error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch permissions'
    });
  }
});

/**
 * POST /auth/register
 * User registration with enhanced validation and security
 */
router.post('/register', async (req, res) => {
  try {
    const { email, username, password, firstName, lastName, subscriptionTier = 'free' } = req.body;

    // Debug logging
    console.log('Registration request body:', JSON.stringify(req.body, null, 2));
    console.log('Extracted fields:', { email, username, password: password ? '[REDACTED]' : undefined, firstName, lastName, subscriptionTier });

    // Enhanced validation
    if (!email || !username || !password || !firstName || !lastName) {
      console.log('Validation failed - missing fields:', {
        email: !email,
        username: !username,
        password: !password,
        firstName: !firstName,
        lastName: !lastName
      });
      return res.status(400).json({
        error: 'Validation error',
        message: 'All fields are required: email, username, password, firstName, lastName'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Please provide a valid email address'
      });
    }

    // Username validation
    if (username.length < 3) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Username must be at least 3 characters long'
      });
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Username can only contain letters, numbers, and underscores'
      });
    }

    // Password validation
    if (password.length < 8) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Password must be at least 8 characters long'
      });
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      });
    }

    // Check if user already exists
    if (userRepository.findByEmail(email)) {
      return res.status(409).json({
        error: 'User exists',
        message: 'A user with this email already exists'
      });
    }

    if (userRepository.findByUsername(username)) {
      return res.status(409).json({
        error: 'User exists',
        message: 'A user with this username already exists'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Determine permissions based on subscription tier
    const getPermissionsByTier = (tier) => {
      switch (tier) {
        case 'free':
          return ['analytics.basic', 'social.basic'];
        case 'individual_pro':
          return ['analytics.basic', 'analytics.advanced', 'ai.basic', 'ai.coaching', 'social.networking'];
        case 'team':
          return ['analytics.advanced', 'ai.basic', 'social.*', 'team.create', 'team.manage'];
        case 'enterprise':
          return ['analytics.*', 'ai.*', 'social.*', 'team.*', 'enterprise.sso'];
        default:
          return ['analytics.basic', 'social.basic'];
      }
    };

    // Create new user
    const newUser = userRepository.create({
      email: email.toLowerCase(),
      username,
      firstName,
      lastName,
      passwordHash: hashedPassword, // Store hashed password
      role: 'user',
      subscriptionTier,
      permissions: getPermissionsByTier(subscriptionTier),
      isVerified: false, // In production, would require email verification
      profile: {
        bio: '',
        avatar: '',
        preferences: {
          emailNotifications: true,
          pushNotifications: true,
          marketingEmails: false
        }
      },
      metadata: {
        registrationDate: new Date(),
        lastPasswordChange: new Date(),
        loginAttempts: 0,
        accountLocked: false
      }
    });

    // Generate tokens
    const tokens = jwtService.generateTokenPair(newUser);

    console.log(`New user registered: ${newUser.email} (${subscriptionTier})`);

    // Send welcome email (in production)
    // await sendWelcomeEmail(newUser.email, newUser.firstName);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to Digame Platform.',
      user: newUser.toJSON(),
      tokens,
      onboarding: {
        nextStep: 'email_verification',
        completedSteps: ['account_creation'],
        totalSteps: 4
      },
      // Legacy compatibility
      token: tokens.accessToken
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred during registration'
    });
  }
});

/**
 * PUT /auth/onboarding
 * Update user onboarding data
 */
router.put('/onboarding', authenticate, async (req, res) => {
  try {
    const { interests, goals, experience, teamPreference, onboardingCompleted } = req.body;
    
    const user = userRepository.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User not found'
      });
    }

    // Update onboarding data
    const updates = {
      onboardingData: {
        interests: interests || user.onboardingData.interests,
        goals: goals || user.onboardingData.goals,
        experience: experience || user.onboardingData.experience,
        teamPreference: teamPreference || user.onboardingData.teamPreference,
        completedSteps: req.body.completedSteps || user.onboardingData.completedSteps
      }
    };

    if (onboardingCompleted !== undefined) {
      updates.onboardingCompleted = onboardingCompleted;
    }

    const updatedUser = userRepository.update(user.id, updates);

    console.log(`Onboarding updated for user: ${updatedUser.email}`);

    res.json({
      success: true,
      message: 'Onboarding data updated successfully',
      user: updatedUser.toJSON()
    });
  } catch (error) {
    console.error('Onboarding update error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update onboarding data'
    });
  }
});

/**
 * GET /auth/stats
 * Get user statistics for dashboard
 */
router.get('/stats', authenticate, async (req, res) => {
  try {
    const user = req.user;
    
    // Mock statistics - in production, these would come from actual data
    const stats = {
      totalProjects: user.subscriptionTier === 'free' ? 0 : Math.floor(Math.random() * 5) + 1,
      activeTeams: user.canAccessFeature('team.view') ? Math.floor(Math.random() * 3) + 1 : 0,
      completedTasks: Math.floor(Math.random() * 20) + 5,
      recentActivity: [
        {
          id: 1,
          title: 'Welcome to Digame Platform!',
          icon: '🎉',
          timestamp: new Date().toISOString(),
          type: 'welcome'
        },
        {
          id: 2,
          title: 'Profile setup completed',
          icon: '✅',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
          type: 'profile'
        }
      ]
    };

    // Add onboarding activity if not completed
    if (!user.onboardingCompleted) {
      stats.recentActivity.unshift({
        id: 0,
        title: 'Complete your onboarding to unlock features',
        icon: '🚀',
        timestamp: new Date().toISOString(),
        type: 'onboarding'
      });
    }

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch user statistics'
    });
  }
});

module.exports = router;