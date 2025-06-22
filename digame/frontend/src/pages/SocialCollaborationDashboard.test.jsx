import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SocialCollaborationDashboard from './SocialCollaborationDashboard';
import socialService from '../services/socialService';
import apiService from '../services/apiService';

// Mock services
jest.mock('../services/socialService');
jest.mock('../services/apiService');

// Mock lucide-react icons
jest.mock('lucide-react', () => {
  const originalModule = jest.requireActual('lucide-react');
  return {
    ...originalModule,
    Users: () => <svg data-testid="users-icon" />,
    UserPlus: () => <svg data-testid="user-plus-icon" />,
    MessageCircle: () => <svg data-testid="message-circle-icon" />,
    Target: () => <svg data-testid="target-icon" />,
    Award: () => <svg data-testid="award-icon" />,
    Handshake: () => <svg data-testid="handshake-icon" />,
    Globe: () => <svg data-testid="globe-icon" />,
    TrendingUp: () => <svg data-testid="trending-up-icon" />,
    Star: () => <svg data-testid="star-icon" />,
    Clock: () => <svg data-testid="clock-icon" />,
    MapPin: () => <svg data-testid="map-pin-icon" />,
    Zap: () => <svg data-testid="zap-icon" />,
    Heart: () => <svg data-testid="heart-icon" />,
    BookOpen: () => <svg data-testid="book-open-icon" />,
    Coffee: () => <svg data-testid="coffee-icon" />,
    Lightbulb: () => <svg data-testid="lightbulb-icon" />,
    Network: () => <svg data-testid="network-icon" />,
  };
});

// Mock UI components that might interfere with tests if not minimally mocked
jest.mock('../components/ui/Toast', () => ({
  Toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockPeerMatches = {
  peerMatches: [
    { id: 'peer1', name: 'John Doe', role: 'Developer', company: 'Tech Inc.', overallScore: 0.8, matchReason: 'Similar skills', avatar: 'avatar1.png', location: 'New York', timezone: 'EST', sharedSkills: ['React', 'Node.js'] },
    { id: 'peer2', name: 'Jane Smith', role: 'Designer', company: 'Design Co.', overallScore: 0.75, matchReason: 'Complementary skills', avatar: 'avatar2.png', location: 'San Francisco', timezone: 'PST', sharedSkills: ['UI', 'UX'] },
  ]
};

const mockMentorshipMatches = {
  mentorMatches: [
    { id: 'mentor1', name: 'Alice Brown', expertise: 'Frontend Development', avatar: 'mentor_avatar1.png' },
  ],
  menteeMatches: [
    { id: 'mentee1', name: 'Bob Green', learningArea: 'Backend Development', avatar: 'mentee_avatar1.png' },
  ],
  mentorshipPrograms: [
    { title: 'Frontend Masters', description: 'Become a frontend expert', duration: '3 months' }
  ]
};

const mockCollaborationProjects = {
  projectMatches: [
    { id: 'proj1', title: 'Eco App', description: 'App for environment', urgency: 'medium', teamSize: 5, duration: '2 months', requiredSkills: ['React Native', 'Firebase'], matchScore: 0.9 },
  ]
};

const mockNetworkData = {
  industryConnections: [{ id: 'conn1', name: 'Connection 1'}],
  skillBasedGroups: [],
  interestBasedGroups: [],
};

const mockCommunityData = {
  relevantCommunities: [{ id: 'comm1', name: 'React Developers', memberCount: 1000, description: 'A community for React devs', activity: 'high' }],
  trendingTopics: [],
};

describe('SocialCollaborationDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem('userId', 'testUser');

    // Default mocks for successful data loading
    socialService.initialize.mockResolvedValue(undefined);
    socialService.generatePeerMatches.mockResolvedValue(mockPeerMatches);
    socialService.generateMentorshipMatches.mockResolvedValue(mockMentorshipMatches);
    socialService.matchCollaborationProjects.mockResolvedValue(mockCollaborationProjects);
    socialService.buildProfessionalNetwork.mockResolvedValue(mockNetworkData);
    socialService.buildIndustryCommunities.mockResolvedValue(mockCommunityData);

    apiService.sendConnectionRequest.mockResolvedValue({ message: 'Request sent' });
    apiService.requestMentorship.mockResolvedValue({ message: 'Mentorship requested' });
    apiService.joinCollaborationProject.mockResolvedValue({ message: 'Project joined' });
  });

  test('renders loading state initially', () => {
    socialService.initialize.mockReturnValue(new Promise(() => {})); // Keep it pending
    render(<SocialCollaborationDashboard />);
    expect(screen.getByText('Building your social collaboration network...')).toBeInTheDocument();
  });

  test('displays peer matches correctly when data is loaded', async () => {
    render(<SocialCollaborationDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Peer Matching')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Peer Matching'));

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    expect(socialService.generatePeerMatches).toHaveBeenCalled();
    // Check for PeerMatchCard specific elements
    expect(screen.getAllByText('Connect').length).toBeGreaterThanOrEqual(mockPeerMatches.peerMatches.length);
  });

  test('displays mentorship recommendations correctly when data is loaded', async () => {
    render(<SocialCollaborationDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Mentorship')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Mentorship'));

    await waitFor(() => {
      expect(screen.getByText('Alice Brown')).toBeInTheDocument(); // Mentor
      expect(screen.getByText('Bob Green')).toBeInTheDocument(); // Mentee
    });
    expect(socialService.generateMentorshipMatches).toHaveBeenCalled();
    // Check for MentorCard/MenteeCard specific elements
    expect(screen.getByText('Request')).toBeInTheDocument(); // For MentorCard
    expect(screen.getByText('Mentor')).toBeInTheDocument(); // For MenteeCard
  });

  test('calls handleConnectWithPeer when "Connect" button is clicked for a peer', async () => {
    render(<SocialCollaborationDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Peer Matching')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Peer Matching'));

    let connectButtons;
    await waitFor(() => {
      connectButtons = screen.getAllByRole('button', { name: /Connect/i });
      expect(connectButtons[0]).toBeInTheDocument();
    });

    fireEvent.click(connectButtons[0]);

    await waitFor(() => {
      expect(apiService.sendConnectionRequest).toHaveBeenCalledWith(mockPeerMatches.peerMatches[0].id);
    });
    expect(Toast.success).toHaveBeenCalledWith('Connection request sent!');
  });

  test('calls handleStartMentorship when "Request" button on MentorCard is clicked', async () => {
    render(<SocialCollaborationDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Mentorship')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Mentorship'));

    let requestButton;
    await waitFor(() => {
      requestButton = screen.getByRole('button', { name: /Request/i });
      expect(requestButton).toBeInTheDocument();
    });

    fireEvent.click(requestButton);

    await waitFor(() => {
      expect(apiService.requestMentorship).toHaveBeenCalledWith(mockMentorshipMatches.mentorMatches[0].id, 'mentee');
    });
    expect(Toast.success).toHaveBeenCalledWith('Mentorship request sent!');
  });

  test('calls handleStartMentorship when "Mentor" button on MenteeCard is clicked', async () => {
    render(<SocialCollaborationDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Mentorship')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Mentorship'));

    let mentorButton;
    await waitFor(() => {
      mentorButton = screen.getByRole('button', { name: /Mentor/i });
      expect(mentorButton).toBeInTheDocument();
    });

    fireEvent.click(mentorButton);

    await waitFor(() => {
      expect(apiService.requestMentorship).toHaveBeenCalledWith(mockMentorshipMatches.menteeMatches[0].id, 'mentor');
    });
    expect(Toast.success).toHaveBeenCalledWith('Mentorship request sent!');
  });

  test('displays error toast if loading social data fails', async () => {
    socialService.initialize.mockRejectedValue(new Error('Network error'));
    render(<SocialCollaborationDashboard />);

    await waitFor(() => {
      expect(Toast.error).toHaveBeenCalledWith('Failed to load social collaboration data');
    });
  });

  test('displays error toast if sendConnectionRequest fails', async () => {
    apiService.sendConnectionRequest.mockRejectedValue(new Error('API Error'));
    render(<SocialCollaborationDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Peer Matching')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Peer Matching'));

    let connectButtons;
    await waitFor(() => {
      connectButtons = screen.getAllByRole('button', { name: /Connect/i });
      expect(connectButtons[0]).toBeInTheDocument();
    });

    fireEvent.click(connectButtons[0]);

    await waitFor(() => {
      expect(apiService.sendConnectionRequest).toHaveBeenCalled();
      expect(Toast.error).toHaveBeenCalledWith('Failed to send connection request');
    });
  });

  test('displays error toast if requestMentorship fails', async () => {
    apiService.requestMentorship.mockRejectedValue(new Error('API Error'));
    render(<SocialCollaborationDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Mentorship')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Mentorship'));

    let requestButton;
    await waitFor(() => {
      requestButton = screen.getByRole('button', { name: /Request/i });
      expect(requestButton).toBeInTheDocument();
    });

    fireEvent.click(requestButton);

    await waitFor(() => {
      expect(apiService.requestMentorship).toHaveBeenCalled();
      expect(Toast.error).toHaveBeenCalledWith('Failed to send mentorship request');
    });
  });
});
