import React, { useState } from 'react';
import { 
  Users, UserPlus, MessageCircle, Share2, 
  Heart, ThumbsUp, Eye, Link, Github,
  Linkedin, Twitter, Globe, MapPin,
  Calendar, Award, Target, TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom'; // Added Link import
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { Toast } from '../ui/Toast';

const SocialProfileSection = ({ user }) => {
  const [connections, setConnections] = useState([]);
  const [socialLinks, setSocialLinks] = useState({
    linkedin: '',
    twitter: '',
    github: '',
    website: ''
  });
  const [isEditingLinks, setIsEditingLinks] = useState(false);

  // Mock data for demonstration
  const mockConnections = [
    {
      id: 1,
      username: 'sarah_dev',
      name: 'Sarah Johnson',
      avatar: null,
      role: 'Senior Developer',
      company: 'TechCorp',
      mutual_connections: 5,
      connected_date: '2025-05-15',
      status: 'connected'
    },
    {
      id: 2,
      username: 'mike_pm',
      name: 'Mike Wilson',
      avatar: null,
      role: 'Product Manager',
      company: 'StartupXYZ',
      mutual_connections: 3,
      connected_date: '2025-05-10',
      status: 'connected'
    },
    {
      id: 3,
      username: 'alex_designer',
      name: 'Alex Chen',
      avatar: null,
      role: 'UX Designer',
      company: 'DesignStudio',
      mutual_connections: 8,
      connected_date: '2025-05-08',
      status: 'connected'
    }
  ];

  const mockSuggestedConnections = [
    {
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

  const handleSaveSocialLinks = async () => {
    try {
      // await apiService.updateSocialLinks(socialLinks);
      setIsEditingLinks(false);
      Toast.success('Social links updated successfully');
    } catch (error) {
      Toast.error('Failed to update social links');
    }
  };

  const handleConnect = async (userId) => {
    try {
      // await apiService.sendConnectionRequest(userId);
      Toast.success('Connection request sent');
    } catch (error) {
      Toast.error('Failed to send connection request');
    }
  };

  const handleLike = async (activityId) => {
    try {
      // await apiService.likeActivity(activityId);
      Toast.success('Liked!');
    } catch (error) {
      Toast.error('Failed to like activity');
    }
  };

  return (
    <div className="space-y-6">
      {/* Social Profile Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Social Profile & Networking
          </CardTitle>
          <CardDescription>
            Connect with other professionals and share your achievements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SocialStats connections={mockConnections} />
        </CardContent>
      </Card>

      <Tabs defaultValue="connections" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="connections">Connections</TabsTrigger>
          <TabsTrigger value="activity">Activity Feed</TabsTrigger>
          <TabsTrigger value="social-links">Social Links</TabsTrigger>
          <TabsTrigger value="sharing">Sharing</TabsTrigger>
        </TabsList>

        {/* Connections Tab */}
        <TabsContent value="connections" className="space-y-6">
          <ConnectionsSection
            connections={mockConnections}
            suggestedConnections={mockSuggestedConnections}
            onConnect={handleConnect}
          />
        </TabsContent>

        {/* Activity Feed Tab */}
        <TabsContent value="activity" className="space-y-6">
          <ActivityFeedSection
            activities={mockActivity}
            onLike={handleLike}
          />
        </TabsContent>

        {/* Social Links Tab */}
        <TabsContent value="social-links" className="space-y-6">
          <SocialLinksSection
            socialLinks={socialLinks}
            setSocialLinks={setSocialLinks}
            isEditing={isEditingLinks}
            setIsEditing={setIsEditingLinks}
            onSave={handleSaveSocialLinks}
          />
        </TabsContent>

        {/* Sharing Tab */}
        <TabsContent value="sharing" className="space-y-6">
          <SharingSection user={user} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Social Stats Component
const SocialStats = ({ connections }) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
    <div className="text-center">
      <div className="text-2xl font-bold text-blue-600">{connections.length}</div>
      <p className="text-sm text-gray-600">Connections</p>
    </div>
    <div className="text-center">
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

// Connections Section Component
const ConnectionsSection = ({ connections, suggestedConnections, onConnect }) => (
  <div className="space-y-6">
    {/* Current Connections */}
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Your Connections ({connections.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {connections.map(connection => (
            <ConnectionCard key={connection.id} connection={connection} />
          ))}
        </div>
      </CardContent>
    </Card>

    {/* Suggested Connections */}
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

// Connection Card Component
const ConnectionCard = ({ connection }) => (
  <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
    <div className="flex items-center gap-3 mb-3">
      <Avatar
        src={connection.avatar}
        alt={connection.name}
        fallback={connection.name.charAt(0)}
        size="md"
      />
      <div className="flex-1">
        <h4 className="font-medium text-gray-900">{connection.name}</h4>
        <p className="text-sm text-gray-600">@{connection.username}</p>
      </div>
    </div>
    <div className="space-y-1 text-sm">
      <p className="text-gray-700">{connection.role}</p>
      <p className="text-gray-600">{connection.company}</p>
      <p className="text-gray-500">{connection.mutual_connections} mutual connections</p>
    </div>
    <div className="flex gap-2 mt-3">
      <Button size="sm" variant="outline">
        <MessageCircle className="w-4 h-4 mr-1" />
        Message
      </Button>
      <Button size="sm" variant="outline" asChild>
        <Link to={`/profile/${connection.id}`}>
          <Eye className="w-4 h-4 mr-1" />
          View Profile
        </Link>
      </Button>
    </div>
  </div>
);

// Suggested Connection Card Component
const SuggestedConnectionCard = ({ suggestion, onConnect }) => (
  <div className="p-4 border rounded-lg">
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center gap-3">
        <Avatar
          src={suggestion.avatar}
          alt={suggestion.name}
          fallback={suggestion.name.charAt(0)}
          size="md"
        />
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
      <p className="text-blue-600">{suggestion.reason}</p>
      <p className="text-gray-500">{suggestion.mutual_connections} mutual connections</p>
    </div>
  </div>
);

// Activity Feed Section Component
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

// Activity Card Component
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

// Social Links Section Component
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

// Social Link Input Component
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

// Sharing Section Component
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
            value={`https://digame.app/profile/${user.id}`}
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