import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Chip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Tooltip,
  Divider
} from '@mui/material';
import {
  Person as PersonIcon,
  Link as ConnectIcon,
  Close as CloseIcon,
  Star as StarIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  LocationOn as LocationIcon,
  Message as MessageIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

// API service functions
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const apiService = {
  async fetchPeerSuggestions(limit: number = 5) {
    const response = await fetch(`${API_BASE_URL}/api/social/peer-suggestions?limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch peer suggestions');
    }
    return response.json();
  },

  async sendConnectionRequest(userId: string, message: string) {
    const response = await fetch(`${API_BASE_URL}/api/social/connect`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: userId, message }),
    });
    if (!response.ok) {
      throw new Error('Failed to send connection request');
    }
    return response.json();
  },

  async respondToConnectionRequest(requestId: string, response: 'accept' | 'decline') {
    const apiResponse = await fetch(`${API_BASE_URL}/api/social/connection-response`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ request_id: requestId, response }),
    });
    if (!apiResponse.ok) {
      throw new Error('Failed to respond to connection request');
    }
    return apiResponse.json();
  }
};

// Types
interface PeerSuggestion {
  id: string;
  user_id: string;
  name: string;
  title: string;
  company: string;
  compatibility_score: number;
  shared_skills: string[];
  avatar?: string;
  location?: string;
  experience_years?: number;
  mutual_connections?: number;
}

interface ConnectionRequest {
  id: string;
  from_user_id: string;
  from_user_name: string;
  from_user_title: string;
  from_user_avatar?: string;
  message?: string;
  timestamp: string;
  status: 'pending' | 'accepted' | 'declined';
}

interface MatchFilters {
  skills: string[];
  experience_level: string;
  location: string;
  industry: string;
}

const PeerMatching: React.FC = () => {
  const [peerSuggestions, setPeerSuggestions] = useState<PeerSuggestion[]>([]);
  const [connectionRequests, setConnectionRequests] = useState<ConnectionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);
  const [selectedPeer, setSelectedPeer] = useState<PeerSuggestion | null>(null);
  const [connectionMessage, setConnectionMessage] = useState('');
  const [filters, setFilters] = useState<MatchFilters>({
    skills: [],
    experience_level: '',
    location: '',
    industry: ''
  });

  useEffect(() => {
    fetchPeerData();
  }, []);

  const fetchPeerData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use actual API call
      const suggestions = await apiService.fetchPeerSuggestions(5);
      setPeerSuggestions(suggestions);
      
      // For now, use mock data for connection requests until that API is implemented
      const mockRequests: ConnectionRequest[] = [
        {
          id: '1',
          from_user_id: '201',
          from_user_name: 'Alex Kim',
          from_user_title: 'Product Manager',
          message: 'Hi! I noticed we both work in the fintech space. Would love to connect and share experiences.',
          timestamp: new Date().toISOString(),
          status: 'pending'
        },
        {
          id: '2',
          from_user_id: '202',
          from_user_name: 'Jennifer Wu',
          from_user_title: 'UX Designer',
          message: 'Hello! I saw your work on design systems. Would be great to connect!',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          status: 'pending'
        }
      ];
      
      setConnectionRequests(mockRequests);
    } catch (err) {
      console.error('Error fetching peer data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load peer matching data');
      
      // Fallback to mock data in development
      if (process.env.NODE_ENV === 'development') {
        const mockSuggestions: PeerSuggestion[] = [
        {
          id: '1',
          user_id: '101',
          name: 'Sarah Chen',
          title: 'Senior Frontend Developer',
          company: 'TechCorp',
          compatibility_score: 92,
          shared_skills: ['React', 'TypeScript', 'Node.js'],
          location: 'San Francisco, CA',
          experience_years: 5,
          mutual_connections: 3
        },
        {
          id: '2',
          user_id: '102',
          name: 'Marcus Johnson',
          title: 'Full Stack Engineer',
          company: 'StartupXYZ',
          compatibility_score: 87,
          shared_skills: ['Python', 'React', 'AWS'],
          location: 'Austin, TX',
          experience_years: 4,
          mutual_connections: 1
        },
        {
          id: '3',
          user_id: '103',
          name: 'Elena Rodriguez',
          title: 'DevOps Engineer',
          company: 'CloudTech',
          compatibility_score: 84,
          shared_skills: ['Docker', 'Kubernetes', 'Python'],
          location: 'Remote',
          experience_years: 6,
          mutual_connections: 2
        }
      ];

        const mockRequests: ConnectionRequest[] = [
          {
            id: '1',
            from_user_id: '201',
            from_user_name: 'Alex Kim',
            from_user_title: 'Product Manager',
            message: 'Hi! I noticed we both work in the fintech space. Would love to connect and share experiences.',
            timestamp: new Date().toISOString(),
            status: 'pending'
          }
        ];

        setPeerSuggestions(mockSuggestions);
        setConnectionRequests(mockRequests);
        setError(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = (peer: PeerSuggestion) => {
    setSelectedPeer(peer);
    setConnectDialogOpen(true);
  };

  const handleSendConnectionRequest = async () => {
    if (!selectedPeer) return;

    try {
      await apiService.sendConnectionRequest(selectedPeer.user_id, connectionMessage);
      
      // Remove from suggestions after connecting
      setPeerSuggestions(prev => prev.filter(p => p.id !== selectedPeer.id));
      
      setConnectDialogOpen(false);
      setConnectionMessage('');
      setSelectedPeer(null);
    } catch (err) {
      console.error('Error sending connection request:', err);
      setError('Failed to send connection request');
    }
  };

  const handleConnectionResponse = async (requestId: string, response: 'accept' | 'decline') => {
    try {
      await apiService.respondToConnectionRequest(requestId, response);
      
      setConnectionRequests(prev =>
        prev.map(req =>
          req.id === requestId
            ? { ...req, status: response === 'accept' ? 'accepted' : 'declined' }
            : req
        )
      );
    } catch (err) {
      console.error('Error responding to connection request:', err);
      setError('Failed to respond to connection request');
    }
  };

  const getCompatibilityColor = (score: number) => {
    if (score >= 90) return 'success';
    if (score >= 80) return 'info';
    if (score >= 70) return 'warning';
    return 'error';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Peer Matching
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Discover and connect with professionals who share your interests and goals
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchPeerData}
          >
            Refresh Matches
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Connection Requests */}
        {connectionRequests.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Connection Requests ({connectionRequests.filter(r => r.status === 'pending').length})
                </Typography>
                <List>
                  {connectionRequests
                    .filter(request => request.status === 'pending')
                    .map((request, index) => (
                    <React.Fragment key={request.id}>
                      <ListItem alignItems="flex-start">
                        <ListItemAvatar>
                          <Avatar>
                            {request.from_user_avatar ? (
                              <img src={request.from_user_avatar} alt={request.from_user_name} />
                            ) : (
                              <PersonIcon />
                            )}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box>
                              <Typography variant="subtitle1" component="span">
                                {request.from_user_name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" component="span" sx={{ ml: 1 }}>
                                • {request.from_user_title}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <>
                              {request.message && (
                                <Typography variant="body2" sx={{ mt: 1, mb: 1 }}>
                                  "{request.message}"
                                </Typography>
                              )}
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(request.timestamp)}
                              </Typography>
                            </>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Box display="flex" gap={1}>
                            <Tooltip title="Accept">
                              <IconButton
                                color="success"
                                onClick={() => handleConnectionResponse(request.id, 'accept')}
                              >
                                <ThumbUpIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Decline">
                              <IconButton
                                color="error"
                                onClick={() => handleConnectionResponse(request.id, 'decline')}
                              >
                                <ThumbDownIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </ListItemSecondaryAction>
                      </ListItem>
                      {index < connectionRequests.filter(r => r.status === 'pending').length - 1 && (
                        <Divider variant="inset" component="li" />
                      )}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Peer Suggestions */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Suggested Connections
          </Typography>
          <Grid container spacing={3}>
            {peerSuggestions.map((peer) => (
              <Grid item xs={12} sm={6} md={4} key={peer.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    {/* Header */}
                    <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
                      <Avatar sx={{ mr: 2, width: 56, height: 56 }}>
                        {peer.avatar ? (
                          <img src={peer.avatar} alt={peer.name} />
                        ) : (
                          <PersonIcon />
                        )}
                      </Avatar>
                      <Box flexGrow={1}>
                        <Typography variant="h6" noWrap>
                          {peer.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {peer.title}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Compatibility Score */}
                    <Box sx={{ mb: 2 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                        <Typography variant="body2">
                          Compatibility
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {peer.compatibility_score}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={peer.compatibility_score}
                        color={getCompatibilityColor(peer.compatibility_score) as any}
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                    </Box>

                    {/* Details */}
                    <Box sx={{ mb: 2 }}>
                      <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                        <WorkIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {peer.company}
                        </Typography>
                      </Box>
                      {peer.location && (
                        <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                          <LocationIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {peer.location}
                          </Typography>
                        </Box>
                      )}
                      {peer.experience_years && (
                        <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                          <SchoolIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {peer.experience_years} years experience
                          </Typography>
                        </Box>
                      )}
                      {peer.mutual_connections && peer.mutual_connections > 0 && (
                        <Typography variant="body2" color="primary">
                          {peer.mutual_connections} mutual connection{peer.mutual_connections > 1 ? 's' : ''}
                        </Typography>
                      )}
                    </Box>

                    {/* Shared Skills */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Shared Skills:
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={0.5}>
                        {peer.shared_skills.slice(0, 3).map((skill) => (
                          <Chip
                            key={skill}
                            label={skill}
                            size="small"
                            variant="outlined"
                            color="primary"
                          />
                        ))}
                        {peer.shared_skills.length > 3 && (
                          <Chip
                            label={`+${peer.shared_skills.length - 3} more`}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </Box>
                  </CardContent>

                  {/* Actions */}
                  <Box sx={{ p: 2, pt: 0 }}>
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<ConnectIcon />}
                      onClick={() => handleConnect(peer)}
                    >
                      Connect
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>

      {/* Connect Dialog */}
      <Dialog
        open={connectDialogOpen}
        onClose={() => setConnectDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            Connect with {selectedPeer?.name}
            <IconButton onClick={() => setConnectDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Send a personalized message with your connection request
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Hi! I'd love to connect and learn more about your experience..."
            value={connectionMessage}
            onChange={(e) => setConnectionMessage(e.target.value)}
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConnectDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSendConnectionRequest}
            startIcon={<MessageIcon />}
          >
            Send Request
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PeerMatching;