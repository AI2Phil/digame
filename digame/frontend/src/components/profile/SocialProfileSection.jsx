import React, { useState, useEffect, useCallback } from 'react'; // Added useEffect, useCallback
import { 
  Users, UserPlus, MessageCircle, Share2, CheckCircle, XCircle, // Added CheckCircle, XCircle
  Heart, Eye, Link, Github,
  Linkedin, Twitter, Globe, AlertTriangle, // Added AlertTriangle
  Award, Target, TrendingUp, MailQuestion // Added MailQuestion
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../ui/Card'; // Added CardFooter
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/Avatar'; // Added AvatarFallback, AvatarImage
import { Badge } from '../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
// Assuming apiService is correctly set up from previous tasks
import apiService from '../../services/apiService';
// Using alert as a placeholder for Toast notifications for now
// import { useToast } from '../ui/use-toast'; // Or your actual toast implementation

const SocialProfileSection = ({ user }) => {
  // const { toast } = useToast(); // Example for toast
  const showToast = (title, description, variant = "default") => {
    alert(`${title}: ${description} (Variant: ${variant})`); // Placeholder
  };

  // Part 2: Existing Connections
  const [connections, setConnections] = useState([]);
  const [loadingConnections, setLoadingConnections] = useState(false);
  const [connectionsError, setConnectionsError] = useState(null);

  // Part 1: Pending Connection Requests
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [requestError, setRequestError] = useState(null);

  const [socialLinks, setSocialLinks] = useState({
    linkedin: user?.socialLinks?.linkedin || '', // Assuming user prop might have this
    twitter: user?.socialLinks?.twitter || '',
    github: user?.socialLinks?.github || '',
    website: user?.socialLinks?.website || ''
  });
  const [isEditingLinks, setIsEditingLinks] = useState(false);

  // Mock data for suggested connections - this might come from another API or be static
  // For now, keeping it as is, but it's separate from actual connections
  const mockSuggestedConnections = [
    { // This data structure is different from actual connections (UserBasicOut)
      id: 4,
      username: 'emma_data',
      name: 'Emma Rodriguez',
      avatar: null,
      role: 'Data Scientist',
      company: 'DataCorp',
      mutual_connections: 12,
      reason: 'Works in similar field'
    },
    {
      id: 5,
      username: 'john_lead',
      name: 'John Smith',
      avatar: null,
      role: 'Tech Lead',
      company: 'BigTech',
      mutual_connections: 7,
      reason: 'Mutual connections'
    }
  ];

  // Activity feed mock data - keeping as is for now
  const mockActivity = [
    {
      id: 1,
      type: 'achievement',
      user: 'sarah_dev',
      content: 'earned the "Goal Crusher" achievement',
      timestamp: '2025-05-23T10:30:00Z',
      likes: 5,
      comments: 2
    },
    {
      id: 2,
      type: 'goal_completed',
      user: 'mike_pm',
      content: 'completed their "Learn React" goal',
      timestamp: '2025-05-23T09:15:00Z',
      likes: 8,
      comments: 3
    },
    {
      id: 3,
      type: 'milestone',
      user: 'alex_designer',
      content: 'reached a 30-day streak!',
      timestamp: '2025-05-23T08:45:00Z',
      likes: 12,
      comments: 5
    }
  ];

  // Fetch Connections (Part 2)
  const fetchConnections = useCallback(async () => {
    setLoadingConnections(true);
    setConnectionsError(null);
    try {
      const data = await apiService.get('/api/social/connections'); // Added /api prefix
      setConnections(data || []);
    } catch (err) {
      setConnectionsError(err.message || 'Failed to fetch connections.');
      showToast("Error Fetching Connections", err.message, "destructive");
    } finally {
      setLoadingConnections(false);
    }
  }, []);

  // Fetch Pending Connection Requests (Part 1)
  const fetchPendingRequests = useCallback(async () => {
    setLoadingRequests(true);
    setRequestError(null);
    try {
      const data = await apiService.get('/api/social/connections/requests'); // Added /api prefix
      setPendingRequests(data || []);
    } catch (err) {
      setRequestError(err.message || 'Failed to fetch pending requests.');
      showToast("Error Fetching Requests", err.message, "destructive");
    } finally {
      setLoadingRequests(false);
    }
  }, []);

  useEffect(() => {
    if (user?.id) { // Assuming 'user' prop contains current user info including id
      fetchConnections();
      fetchPendingRequests();
    }
  }, [user?.id, fetchConnections, fetchPendingRequests]);


  const handleSaveSocialLinks = async () => {
    try {
      await apiService.put('/api/social/links', socialLinks); // Added /api prefix
      setIsEditingLinks(false);
      showToast('Success', 'Social links updated successfully.', "success");
    } catch (error) {
      showToast('Error', error.message || 'Failed to update social links.', "destructive");
    }
  };

  // Part 3: Connect Button (for Suggested Connections)
  const handleConnect = async (receiverUserId) => {
    try {
      const response = await apiService.sendConnectionRequest(receiverUserId);
      if (response && response.id) {
        showToast('Success', `Connection request sent to user ${receiverUserId}.`, "success");
        // Optionally, update UI for suggested connections (e.g., mark as pending)
      } else {
        showToast('Info', 'Connection request may have been sent or already exists.', "default");
      }
    } catch (error) {
      showToast('Error', error.message || 'Failed to send connection request.', "destructive");
    }
  };

  // Part 1: Accept Request
  const handleAcceptRequest = async (requestId) => {
    try {
      const updatedRequest = await apiService.post(`/api/social/connections/requests/${requestId}/accept`, {}); // Added /api prefix
      if (updatedRequest && updatedRequest.status === 'accepted') {
        setPendingRequests(prev => prev.filter(req => req.id !== requestId));
        fetchConnections(); // Refresh connections list
        showToast('Success', 'Connection request accepted.', "success");
      } else {
         showToast('Error', 'Failed to accept request: Unexpected response', "destructive");
      }
    } catch (error) {
      showToast('Error', error.message || 'Failed to accept connection request.', "destructive");
    }
  };

  // Part 1: Reject Request
  const handleRejectRequest = async (requestId) => {
    try {
      const updatedRequest = await apiService.post(`/api/social/connections/requests/${requestId}/reject`, {}); // Added /api prefix
       if (updatedRequest && updatedRequest.status === 'rejected') {
        setPendingRequests(prev => prev.filter(req => req.id !== requestId));
        showToast('Success', 'Connection request rejected.', "success");
      } else {
        showToast('Error', 'Failed to reject request: Unexpected response', "destructive");
      }
    } catch (error) {
      showToast('Error', error.message || 'Failed to reject connection request.', "destructive");
    }
  };


  const handleLike = async (activityId) => { // Keeping mock activity logic for now
    try {
      // await apiService.likeActivity(activityId); // Assuming such method exists
      showToast('Success', 'Liked!', "success");
    } catch (error) {
      showToast('Error', 'Failed to like activity.', "destructive");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Social Profile & Networking
          </CardTitle>
          <CardDescription>
            Connect with other professionals and share your achievements. User ID: {user?.id}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Pass fetched connections to SocialStats */}
          <SocialStats connections={connections} loading={loadingConnections} />
        </CardContent>
      </Card>

      <Tabs defaultValue="connections" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4"> {/* Consider adding Requests tab or integrating */}
          <TabsTrigger value="connections">Connections</TabsTrigger>
          <TabsTrigger value="requests">Pending Requests ({pendingRequests.length})</TabsTrigger>
          <TabsTrigger value="activity">Activity Feed</TabsTrigger>
          <TabsTrigger value="social-links">Social Links</TabsTrigger>
          {/* <TabsTrigger value="sharing">Sharing</TabsTrigger> */}
        </TabsList>

        <TabsContent value="connections" className="space-y-6">
          <ConnectionsSection
            connections={connections} // Use fetched connections
            loading={loadingConnections}
            error={connectionsError}
            suggestedConnections={mockSuggestedConnections} // Keep mock suggestions for now
            onConnect={handleConnect} // For suggested connections
          />
        </TabsContent>

        <TabsContent value="requests" className="space-y-6">
          <PendingConnectionRequests
            requests={pendingRequests}
            loading={loadingRequests}
            error={requestError}
            onAccept={handleAcceptRequest}
            onReject={handleRejectRequest}
          />
        </TabsContent>

        <TabsContent value="activity" className="space-y-6"> {/* Activity feed - uses mock data */}
          <ActivityFeedSection
            activities={mockActivity}
            onLike={handleLike}
          />
        </TabsContent>

        <TabsContent value="social-links" className="space-y-6"> {/* Social links - uses state, placeholder save */}
          <SocialLinksSection
            socialLinks={socialLinks}
            setSocialLinks={setSocialLinks}
            isEditing={isEditingLinks}
            setIsEditing={setIsEditingLinks}
            onSave={handleSaveSocialLinks}
          />
        </TabsContent>

        {/* Sharing Tab - kept as is, uses user prop */}
        {/* <TabsContent value="sharing" className="space-y-6">
          <SharingSection user={user} />
        </TabsContent> */}
      </Tabs>
    </div>
  );
};

// Social Stats Component
const SocialStats = ({ connections, loading }) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
    <div className="text-center">
      <div className="text-2xl font-bold text-blue-600">
        {loading ? "..." : connections.length}
      </div>
      <p className="text-sm text-gray-600">Connections</p>
    </div>
    <div className="text-center"> {/* These are static for now */}
      <div className="text-2xl font-bold text-green-600">156</div>
      <p className="text-sm text-gray-600">Profile Views</p>
    </div>
    <div className="text-center">
      <div className="text-2xl font-bold text-purple-600">23</div>
      <p className="text-sm text-gray-600">Shared Achievements</p>
    </div>
    <div className="text-center">
      <div className="text-2xl font-bold text-orange-600">89</div>
      <p className="text-sm text-gray-600">Engagement Score</p>
    </div>
  </div>
);


// Part 1: PendingConnectionRequests Component
const PendingConnectionRequests = ({ requests, loading, error, onAccept, onReject }) => {
  if (loading) return <p>Loading pending requests...</p>;
  if (error) return <p className="text-red-500">Error loading requests: {error}</p>;
  if (!requests || requests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MailQuestion className="w-5 h-5" />
            Pending Connection Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>No pending connection requests.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MailQuestion className="w-5 h-5" />
          Pending Connection Requests ({requests.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {requests.map((req) => (
          <Card key={req.id} className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Avatar>
                    <AvatarImage src={req.requester.avatarUrl /* if available in UserBasicOut */} />
                    <AvatarFallback>{req.requester.full_name ? req.requester.full_name.charAt(0) : 'U'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold">{req.requester.full_name || `User ID: ${req.requester.id}`}</h4>
                    {/* Assuming API provides more details for requester if needed, or UserBasicOut is enhanced */}
                    <p className="text-sm text-gray-600">{req.requester.email}</p>
                    {/* Add title/company if available in req.requester which is UserBasicOut */}
                  </div>
                </div>
                {/* Display message if available from API (not in current ConnectionRequestOut) */}
                {/* <p className="text-sm text-gray-500 mb-3">Message: {req.message || "No message."}</p> */}
              </div>
              <div className="flex space-x-2">
                <Button onClick={() => onAccept(req.id)} size="sm" variant="outline" className="text-green-600 hover:text-green-700 border-green-600 hover:border-green-700">
                  <CheckCircle className="w-4 h-4 mr-1" /> Accept
                </Button>
                <Button onClick={() => onReject(req.id)} size="sm" variant="outline" className="text-red-600 hover:text-red-700 border-red-600 hover:border-red-700">
                  <XCircle className="w-4 h-4 mr-1" /> Reject
                </Button>
              </div>
            </div>
             <p className="text-xs text-gray-400 mt-2">Received: {new Date(req.created_at).toLocaleDateString()}</p>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
};


// Connections Section Component (Part 2 update)
const ConnectionsSection = ({ connections, loading, error, suggestedConnections, onConnect }) => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Your Connections ({loading ? "..." : connections.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading && <p>Loading connections...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}
        {!loading && !error && connections.length === 0 && <p>No connections yet. Why not connect with some suggestions?</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {connections.map(connection => (
            // ConnectionCard now receives data structured as UserBasicOut
            <ConnectionCard key={connection.id} connection={connection} />
          ))}
        </div>
      </CardContent>
    </Card>

    {/* Suggested Connections - Kept as is, uses mock data */}
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="w-5 h-5" />
          Suggested Connections
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suggestedConnections.map(suggestion => (
            <SuggestedConnectionCard 
              key={suggestion.id} 
              suggestion={suggestion}
              onConnect={onConnect}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

// Connection Card Component (Part 2 update - to use UserBasicOut structure)
const ConnectionCard = ({ connection }) => ( // connection is UserBasicOut: { id, full_name, email }
  <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
    <div className="flex items-center gap-3 mb-3">
      <Avatar> {/* Removed src, alt from UserBasicOut */}
        <AvatarFallback>{connection.full_name ? connection.full_name.charAt(0) : 'U'}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <h4 className="font-medium text-gray-900">{connection.full_name || `User ID: ${connection.id}`}</h4>
        <p className="text-sm text-gray-600">{connection.email}</p>
      </div>
    </div>
    {/* Information like role, company, mutual_connections is NOT in UserBasicOut */}
    {/* To display these, UserBasicOut needs to be expanded or another schema used */}
    <div className="space-y-1 text-sm">
      {/* <p className="text-gray-700">{connection.role || 'Role not specified'}</p> */}
      {/* <p className="text-gray-600">{connection.company || 'Company not specified'}</p> */}
      <p className="text-xs text-gray-500">Connected</p> {/* Placeholder */}
    </div>
    <div className="flex gap-2 mt-3">
      <Button size="sm" variant="outline">
        <MessageCircle className="w-4 h-4 mr-1" />
        Message
      </Button>
      <Button size="sm" variant="outline">
        <Eye className="w-4 h-4 mr-1" />
        View Profile
      </Button>
    </div>
  </div>
);

// Suggested Connection Card Component (Part 3 - onConnect is now correctly wired up)
// Data structure for 'suggestion' remains from mock data for now.
const SuggestedConnectionCard = ({ suggestion, onConnect }) => (
  <div className="p-4 border rounded-lg">
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center gap-3">
        <Avatar> {/* Assuming suggestion might not have avatar src */}
           <AvatarImage src={suggestion.avatar} alt={suggestion.name} />
           <AvatarFallback>{suggestion.name ? suggestion.name.charAt(0) : 'S'}</AvatarFallback>
        </Avatar>
        <div>
          <h4 className="font-medium text-gray-900">{suggestion.name}</h4>
          <p className="text-sm text-gray-600">@{suggestion.username}</p>
        </div>
      </div>
      <Button size="sm" onClick={() => onConnect(suggestion.id)}>
        <UserPlus className="w-4 h-4 mr-1" />
        Connect
      </Button>
    </div>
    <div className="space-y-1 text-sm">
      <p className="text-gray-700">{suggestion.role}</p>
      <p className="text-gray-600">{suggestion.company}</p>
      <p className="text-blue-600">{suggestion.reason}</p> {/* This is specific to mock data */}
      <p className="text-gray-500">{suggestion.mutual_connections} mutual connections</p> {/* Specific to mock data */}
    </div>
  </div>
);

// Activity Feed Section Component - Unchanged for this task
const ActivityFeedSection = ({ activities, onLike }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <TrendingUp className="w-5 h-5" />
        Activity Feed
      </CardTitle>
      <CardDescription>
        See what your connections are achieving
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {activities.map(activity => (
          <ActivityCard key={activity.id} activity={activity} onLike={onLike} />
        ))}
      </div>
    </CardContent>
  </Card>
);

// Activity Card Component - Unchanged
const ActivityCard = ({ activity, onLike }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'achievement': return Award;
      case 'goal_completed': return Target;
      case 'milestone': return TrendingUp;
      default: return Award;
    }
  };

  const Icon = getActivityIcon(activity.type);

  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-blue-100 rounded-full">
          <Icon className="w-4 h-4 text-blue-600" />
        </div>
        <div className="flex-1">
          <p className="text-gray-900">
            <span className="font-medium">@{activity.user}</span> {activity.content}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {new Date(activity.timestamp).toLocaleString()}
          </p>
          <div className="flex items-center gap-4 mt-3">
            <button
              onClick={() => onLike(activity.id)}
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-600"
            >
              <Heart className="w-4 h-4" />
              {activity.likes}
            </button>
            <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600">
              <MessageCircle className="w-4 h-4" />
              {activity.comments}
            </button>
            <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-green-600">
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Social Links Section Component - Unchanged
const SocialLinksSection = ({ 
  socialLinks, 
  setSocialLinks, 
  isEditing, 
  setIsEditing, 
  onSave 
}) => (
  <Card>
    <CardHeader>
      <div className="flex items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Link className="w-5 h-5" />
            Social Links
          </CardTitle>
          <CardDescription>
            Connect your social media profiles
          </CardDescription>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>
            Edit Links
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={onSave}>Save</Button>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          </div>
        )}
      </div>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SocialLinkInput
          icon={Linkedin}
          label="LinkedIn"
          placeholder="https://linkedin.com/in/username"
          value={socialLinks.linkedin}
          onChange={(value) => setSocialLinks(prev => ({ ...prev, linkedin: value }))}
          isEditing={isEditing}
        />
        <SocialLinkInput
          icon={Twitter}
          label="Twitter"
          placeholder="https://twitter.com/username"
          value={socialLinks.twitter}
          onChange={(value) => setSocialLinks(prev => ({ ...prev, twitter: value }))}
          isEditing={isEditing}
        />
        <SocialLinkInput
          icon={Github}
          label="GitHub"
          placeholder="https://github.com/username"
          value={socialLinks.github}
          onChange={(value) => setSocialLinks(prev => ({ ...prev, github: value }))}
          isEditing={isEditing}
        />
        <SocialLinkInput
          icon={Globe}
          label="Website"
          placeholder="https://yourwebsite.com"
          value={socialLinks.website}
          onChange={(value) => setSocialLinks(prev => ({ ...prev, website: value }))}
          isEditing={isEditing}
        />
      </div>
    </CardContent>
  </Card>
);

// Social Link Input Component - Unchanged
const SocialLinkInput = ({ icon: Icon, label, placeholder, value, onChange, isEditing }) => (
  <div className="flex items-center gap-3 p-3 border rounded-lg">
    <Icon className="w-5 h-5 text-gray-500" />
    <div className="flex-1">
      <p className="text-sm font-medium text-gray-700">{label}</p>
      {isEditing ? (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="mt-1"
        />
      ) : (
        <p className="text-sm text-gray-600 mt-1">
          {value || 'Not connected'}
        </p>
      )}
    </div>
  </div>
);

// Sharing Section Component - Unchanged
const SharingSection = ({ user }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Share2 className="w-5 h-5" />
        Share Your Progress
      </CardTitle>
      <CardDescription>
        Share your achievements and goals with your network
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Share Your Profile</h4>
        <p className="text-sm text-blue-700 mb-3">
          Let others see your professional development journey
        </p>
        <div className="flex items-center gap-2">
          <Input
            value={`https://digame.app/profile/${user.username}`}
            readOnly
            className="flex-1"
          />
          <Button size="sm">
            <Share2 className="w-4 h-4 mr-1" />
            Share
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="font-medium">Quick Share Options</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button variant="outline" className="justify-start">
            <Award className="w-4 h-4 mr-2" />
            Share Latest Achievement
          </Button>
          <Button variant="outline" className="justify-start">
            <Target className="w-4 h-4 mr-2" />
            Share Goal Progress
          </Button>
          <Button variant="outline" className="justify-start">
            <TrendingUp className="w-4 h-4 mr-2" />
            Share Monthly Report
          </Button>
          <Button variant="outline" className="justify-start">
            <Users className="w-4 h-4 mr-2" />
            Invite Connections
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default SocialProfileSection;