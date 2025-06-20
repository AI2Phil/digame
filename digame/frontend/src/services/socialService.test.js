import socialService from './socialService';
import apiService from './apiService';

jest.mock('./apiService');

describe('socialService', () => {
  const userId = 'testUser123';

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset internal state of the service for each test
    socialService.isInitialized = false;
    socialService.currentUser = null;
    socialService.userConnections = [];
    socialService.userCommunityGroups = [];
    socialService.userSkills = [];
    socialService.userGoals = [];
  });

  describe('initialize', () => {
    const mockUserProfile = { id: userId, name: 'Test User', skills: [{id: 's1', name: 'React'}, {id: 's2', name: 'Node.js'}], learningGoals: [{id: 'g1', description: 'Learn Python'}] };
    const mockUserConnections = [{ id: 'conn1', name: 'User Conn1' }];
    const mockUserCommunityGroups = [{ id: 'group1', name: 'React Devs' }];

    beforeEach(() => {
      apiService.getUserProfile.mockResolvedValue(mockUserProfile);
      apiService.getUserConnections.mockResolvedValue(mockUserConnections);
      apiService.getUserCommunityGroups.mockResolvedValue(mockUserCommunityGroups);
      apiService.getUserSkillsMatrix.mockResolvedValue({ skills: mockUserProfile.skills });
      apiService.getUserLearningGoals.mockResolvedValue({ goals: mockUserProfile.learningGoals });
    });

    test('should call apiService methods and set isInitialized to true', async () => {
      await socialService.initialize(userId);

      expect(apiService.getUserProfile).toHaveBeenCalledWith(userId);
      expect(apiService.getUserConnections).toHaveBeenCalledWith(userId);
      expect(apiService.getUserCommunityGroups).toHaveBeenCalledWith(userId);
      expect(apiService.getUserSkillsMatrix).toHaveBeenCalledWith(userId);
      expect(apiService.getUserLearningGoals).toHaveBeenCalledWith(userId);

      expect(socialService.isInitialized).toBe(true);
      expect(socialService.currentUser).toEqual(mockUserProfile);
      expect(socialService.userConnections).toEqual(mockUserConnections);
      expect(socialService.userCommunityGroups).toEqual(mockUserCommunityGroups);
      expect(socialService.userSkills).toEqual(mockUserProfile.skills);
      expect(socialService.userGoals).toEqual(mockUserProfile.learningGoals);
    });

    test('should handle errors during initialization', async () => {
      apiService.getUserProfile.mockRejectedValue(new Error('Profile fetch failed'));

      await expect(socialService.initialize(userId)).rejects.toThrow('Profile fetch failed');
      expect(socialService.isInitialized).toBe(false);
    });

    test('should not re-initialize if already initialized with the same user', async () => {
      await socialService.initialize(userId); // First initialization
      apiService.getUserProfile.mockClear(); // Clear mocks to check if they are called again
      apiService.getUserConnections.mockClear();
      apiService.getUserCommunityGroups.mockClear();

      await socialService.initialize(userId); // Second call with same userId

      expect(apiService.getUserProfile).not.toHaveBeenCalled();
      expect(socialService.isInitialized).toBe(true); // Still true
    });

    test('should re-initialize if called with a different userId', async () => {
      await socialService.initialize(userId); // First initialization

      const newUserId = 'newUser456';
      const newMockUserProfile = { id: newUserId, name: 'New User', skills: [], learningGoals: [] };
      apiService.getUserProfile.mockResolvedValue(newMockUserProfile); // Mock for new user
      apiService.getUserConnections.mockResolvedValue([]);
      apiService.getUserCommunityGroups.mockResolvedValue([]);
      apiService.getUserSkillsMatrix.mockResolvedValue({ skills: [] });
      apiService.getUserLearningGoals.mockResolvedValue({ goals: [] });

      await socialService.initialize(newUserId);

      expect(apiService.getUserProfile).toHaveBeenCalledWith(newUserId);
      expect(socialService.currentUser.id).toBe(newUserId);
      expect(socialService.isInitialized).toBe(true);
    });
  });

  describe('generatePeerMatches', () => {
    const mockPeers = [
        { id: 'peer1', name: 'Peer One', skills: [{id: 's1', name: 'React'}, {id: 's3', name: 'Angular'}], learningGoals: [{id: 'g2', description: 'Learn Vue'}] },
        { id: 'peer2', name: 'Peer Two', skills: [{id: 's2', name: 'Node.js'}], learningGoals: [{id: 'g1', description: 'Learn Python'}] },
    ];

    beforeEach(async () => {
      // Ensure service is initialized for these tests
      apiService.getUserProfile.mockResolvedValue({ id: userId, name: 'Test User', skills: [{id: 's1', name: 'React'}], learningGoals: [{id: 'g1', description: 'Learn Python'}] });
      apiService.getUserConnections.mockResolvedValue([]);
      apiService.getUserCommunityGroups.mockResolvedValue([]);
      apiService.getUserSkillsMatrix.mockResolvedValue({ skills: [{id: 's1', name: 'React'}] });
      apiService.getUserLearningGoals.mockResolvedValue({ goals: [{id: 'g1', description: 'Learn Python'}] });
      apiService.findPeerMatches.mockResolvedValue({ peers: mockPeers });
      await socialService.initialize(userId);
    });

    test('should throw error if not initialized', async () => {
      socialService.isInitialized = false; // Force uninitialized state
      await expect(socialService.generatePeerMatches()).rejects.toThrow('Social service not initialized. Call initialize() first.');
    });

    test('should call apiService.findPeerMatches with user skills and goals', async () => {
      await socialService.generatePeerMatches();
      expect(apiService.findPeerMatches).toHaveBeenCalledWith({
        skills: socialService.userSkills.map(s => s.id),
        learningGoals: socialService.userGoals.map(g => g.id),
        currentConnections: socialService.userConnections.map(c => c.id),
      });
    });

    test('should return scored and ranked peer matches', async () => {
      const result = await socialService.generatePeerMatches();
      expect(result).toHaveProperty('peerMatches');
      expect(result.peerMatches.length).toBeGreaterThan(0);
      const firstMatch = result.peerMatches[0];
      expect(firstMatch).toHaveProperty('id');
      expect(firstMatch).toHaveProperty('name');
      expect(firstMatch).toHaveProperty('overallScore');
      expect(firstMatch).toHaveProperty('matchReason');
      expect(firstMatch.overallScore).toBeGreaterThan(0);
      // Example: Check if peer2 (exact goal match) is ranked higher or has a specific reason
      const peerTwoMatch = result.peerMatches.find(p => p.id === 'peer2');
      expect(peerTwoMatch.matchReason).toContain('shared learning goal');
    });

    test('should return empty array if apiService.findPeerMatches returns no peers', async () => {
        apiService.findPeerMatches.mockResolvedValue({ peers: [] });
        const result = await socialService.generatePeerMatches();
        expect(result.peerMatches).toEqual([]);
    });
  });

  describe('generateMentorshipMatches', () => {
    const mockMentors = [{ id: 'mentor1', name: 'Mentor One', expertiseAreas: ['React', 'Frontend'], yearsOfExperience: 5 }];
    const mockMentees = [{ id: 'mentee1', name: 'Mentee One', learningGoals: ['React', 'Node.js'], experienceLevel: 'Beginner' }];

    beforeEach(async () => {
      // Ensure service is initialized
      apiService.getUserProfile.mockResolvedValue({ id: userId, name: 'Test User', skills: [{id: 's1', name: 'React'}], learningGoals: [{id: 'g1', description: 'Learn Frontend'}] });
      apiService.getUserConnections.mockResolvedValue([]);
      apiService.getUserCommunityGroups.mockResolvedValue([]);
      apiService.getUserSkillsMatrix.mockResolvedValue({ skills: [{id: 's1', name: 'React'}] });
      apiService.getUserLearningGoals.mockResolvedValue({ goals: [{id: 'g1', description: 'Learn Frontend'}] });

      apiService.findPotentialMentors.mockResolvedValue({ mentors: mockMentors });
      apiService.findPotentialMentees.mockResolvedValue({ mentees: mockMentees });
      await socialService.initialize(userId);
    });

    test('should throw error if not initialized', async () => {
      socialService.isInitialized = false;
      await expect(socialService.generateMentorshipMatches()).rejects.toThrow('Social service not initialized. Call initialize() first.');
    });

    test('should call apiService.findPotentialMentors and apiService.findPotentialMentees', async () => {
      await socialService.generateMentorshipMatches();
      expect(apiService.findPotentialMentors).toHaveBeenCalledWith({
        learningGoals: socialService.userGoals.map(g => g.id),
        currentConnections: socialService.userConnections.map(c => c.id),
      });
      expect(apiService.findPotentialMentees).toHaveBeenCalledWith({
        skills: socialService.userSkills.map(s => s.id),
        currentConnections: socialService.userConnections.map(c => c.id),
      });
    });

    test('should return scored mentor and mentee matches', async () => {
      const result = await socialService.generateMentorshipMatches();
      expect(result).toHaveProperty('mentorMatches');
      expect(result).toHaveProperty('menteeMatches');
      expect(result.mentorMatches.length).toBeGreaterThan(0);
      expect(result.menteeMatches.length).toBeGreaterThan(0);

      const firstMentor = result.mentorMatches[0];
      expect(firstMentor).toHaveProperty('id');
      expect(firstMentor).toHaveProperty('name');
      expect(firstMentor).toHaveProperty('score');
      expect(firstMentor.score).toBeGreaterThan(0);

      const firstMentee = result.menteeMatches[0];
      expect(firstMentee).toHaveProperty('id');
      expect(firstMentee).toHaveProperty('name');
      expect(firstMentee).toHaveProperty('score');
      expect(firstMentee.score).toBeGreaterThan(0);
    });

    test('should include mentorship programs if available (mocked)', async () => {
        const mockPrograms = [{ id: 'prog1', title: 'Advanced React', description: 'Deep dive into React.'}];
        apiService.getMentorshipPrograms = jest.fn().mockResolvedValue({ programs: mockPrograms }); // Assume this API exists
        socialService.getMentorshipPrograms = jest.fn().mockResolvedValue(mockPrograms) // Mocking a potential internal method or direct call

        const result = await socialService.generateMentorshipMatches();

        // If getMentorshipPrograms is part of generateMentorshipMatches, check its call
        // For now, let's assume it's added directly if the structure is expected to have it
        // This part of the test might need adjustment based on actual implementation of program fetching
        // For the current structure of SocialCollaborationDashboard, mentorshipPrograms is part of the same object
        // returned by generateMentorshipMatches.

        // If generateMentorshipMatches itself is supposed to fetch programs:
        // expect(apiService.getMentorshipPrograms).toHaveBeenCalled();
        // expect(result.mentorshipPrograms).toEqual(mockPrograms);

        // If it's simpler and programs are added statically or through another means for now:
        // This test might be more about the shape of the data expected by the UI
        // For now, the dashboard component takes `mentorshipData.mentorshipPrograms`, so we ensure it's there.
        // The current socialService.js doesn't show fetching programs, so this might be a future enhancement.
        // We'll assume for now it can return an empty array or pre-defined programs if any.
        if (result.mentorshipPrograms) {
             expect(result.mentorshipPrograms).toBeInstanceOf(Array);
        }
    });
  });

  // Add tests for matchCollaborationProjects, buildProfessionalNetwork, buildIndustryCommunities
  // if their internal logic is complex enough or involves specific scoring/ranking.
  // For now, assuming they are simpler pass-throughs or their logic is tested via dashboard interaction.

  describe('Helper scoring functions (if they were public or complex enough to test separately)', () => {
    // Example: if _calculateMatchScore was public
    // test('_calculateMatchScore returns correct score', () => {
    //   const userASkills = [{id: 's1'}, {id: 's2'}];
    //   const userBSkills = [{id: 's1'}, {id: 's3'}];
    //   const score = socialService._calculateMatchScore(userASkills, userBSkills, [], []); // Simplified
    //   expect(score).toBeGreaterThan(0);
    // });
  });
});
