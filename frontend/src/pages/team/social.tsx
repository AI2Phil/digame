import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import PageHeader from '../../../components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/Avatar';
import {
  Users,
  MessageSquare,
  Heart,
  Share2,
  Calendar,
  Coffee,
  Trophy,
  Star,
  ThumbsUp,
  MessageCircle,
  Send,
  Image,
  Paperclip,
  Smile,
  Hash,
  AtSign,
  Bell,
  Settings,
  Filter,
  Search,
  Plus,
  MoreHorizontal,
  Bookmark,
  Flag,
  Eye,
  Clock,
  MapPin,
  Gift,
  Zap,
  Target,
  Award,
} from 'lucide-react';

const TeamSocial: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('feed');
  const [socialData, setSocialData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [newPost, setNewPost] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('general');

  useEffect(() => {
    fetchSocialData();
  }, []);

  const fetchSocialData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/team/social', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSocialData(data);
      }
    } catch (error) {
      console.error('Error fetching social data:', error);
    } finally {
      setLoading(false);
    }
  };

  const mockSocialData = {
    feed: [
      {
        id: 1,
        type: 'achievement',
        user: {
          name: 'Sarah Johnson',
          avatar: 'SJ',
          role: 'Team Lead',
          status: 'online',
        },
        content:
          'Just completed the Q1 project milestone! 🎉 Thanks to everyone for the amazing teamwork.',
        timestamp: '2 hours ago',
        likes: 12,
        comments: 5,
        shares: 2,
        tags: ['milestone', 'teamwork'],
        attachments: [],
        reactions: {
          like: 8,
          celebrate: 3,
          heart: 1,
        },
      },
      {
        id: 2,
        type: 'announcement',
        user: {
          name: 'Mike Chen',
          avatar: 'MC',
          role: 'Senior Developer',
          status: 'online',
        },
        content:
          'New code review guidelines are now available in the wiki. Please take a look and let me know if you have any questions!',
        timestamp: '4 hours ago',
        likes: 8,
        comments: 3,
        shares: 1,
        tags: ['guidelines', 'development'],
        attachments: [{ type: 'link', title: 'Code Review Guidelines', url: '#' }],
        reactions: {
          like: 6,
          thumbsup: 2,
        },
      },
      {
        id: 3,
        type: 'social',
        user: {
          name: 'Lisa Brown',
          avatar: 'LB',
          role: 'UX Designer',
          status: 'away',
        },
        content: "Coffee break anyone? ☕ I'm heading to the kitchen in 5 minutes!",
        timestamp: '6 hours ago',
        likes: 15,
        comments: 8,
        shares: 0,
        tags: ['coffee', 'break'],
        attachments: [],
        reactions: {
          like: 10,
          coffee: 5,
        },
      },
      {
        id: 4,
        type: 'help',
        user: {
          name: 'David Wilson',
          avatar: 'DW',
          role: 'QA Engineer',
          status: 'offline',
        },
        content:
          'Has anyone worked with the new testing framework? I could use some guidance on setting up automated tests.',
        timestamp: '1 day ago',
        likes: 6,
        comments: 12,
        shares: 1,
        tags: ['help', 'testing', 'automation'],
        attachments: [],
        reactions: {
          like: 4,
          help: 2,
        },
      },
      {
        id: 5,
        type: 'celebration',
        user: {
          name: 'Emma Garcia',
          avatar: 'EG',
          role: 'Marketing Specialist',
          status: 'online',
        },
        content: 'Happy birthday to our amazing designer Lisa! 🎂🎉 Hope you have a wonderful day!',
        timestamp: '2 days ago',
        likes: 23,
        comments: 15,
        shares: 3,
        tags: ['birthday', 'celebration'],
        attachments: [{ type: 'image', title: 'Birthday Card', url: '#' }],
        reactions: {
          heart: 15,
          celebrate: 8,
        },
      },
    ],
    channels: [
      {
        id: 'general',
        name: 'General',
        description: 'Team-wide discussions',
        members: 12,
        unread: 3,
        lastActivity: '5 min ago',
        type: 'public',
      },
      {
        id: 'development',
        name: 'Development',
        description: 'Technical discussions',
        members: 8,
        unread: 1,
        lastActivity: '1 hour ago',
        type: 'public',
      },
      {
        id: 'design',
        name: 'Design',
        description: 'Design reviews and feedback',
        members: 5,
        unread: 0,
        lastActivity: '3 hours ago',
        type: 'public',
      },
      {
        id: 'random',
        name: 'Random',
        description: 'Off-topic conversations',
        members: 12,
        unread: 7,
        lastActivity: '10 min ago',
        type: 'public',
      },
      {
        id: 'leadership',
        name: 'Leadership',
        description: 'Management discussions',
        members: 3,
        unread: 0,
        lastActivity: '1 day ago',
        type: 'private',
      },
    ],
    events: [
      {
        id: 1,
        title: 'Team Lunch',
        date: '2024-01-15',
        time: '12:00 PM',
        location: 'Conference Room A',
        attendees: 8,
        type: 'social',
        organizer: 'Sarah Johnson',
      },
      {
        id: 2,
        title: 'Code Review Session',
        date: '2024-01-16',
        time: '2:00 PM',
        location: 'Virtual',
        attendees: 6,
        type: 'work',
        organizer: 'Mike Chen',
      },
      {
        id: 3,
        title: 'Design Workshop',
        date: '2024-01-18',
        time: '10:00 AM',
        location: 'Design Studio',
        attendees: 4,
        type: 'work',
        organizer: 'Lisa Brown',
      },
    ],
    leaderboard: [
      {
        id: 1,
        user: 'Sarah Johnson',
        avatar: 'SJ',
        points: 1250,
        badges: ['Team Player', 'Mentor', 'Leader'],
        level: 'Gold',
        achievements: 15,
      },
      {
        id: 2,
        user: 'Mike Chen',
        avatar: 'MC',
        points: 1180,
        badges: ['Code Master', 'Helper', 'Innovator'],
        level: 'Gold',
        achievements: 12,
      },
      {
        id: 3,
        user: 'Emma Garcia',
        avatar: 'EG',
        points: 980,
        badges: ['Creative', 'Collaborator'],
        level: 'Silver',
        achievements: 9,
      },
      {
        id: 4,
        user: 'Lisa Brown',
        avatar: 'LB',
        points: 920,
        badges: ['Designer', 'Problem Solver'],
        level: 'Silver',
        achievements: 8,
      },
      {
        id: 5,
        user: 'David Wilson',
        avatar: 'DW',
        points: 850,
        badges: ['Quality Guardian', 'Detail Oriented'],
        level: 'Bronze',
        achievements: 7,
      },
    ],
    stats: {
      totalPosts: 156,
      totalLikes: 892,
      totalComments: 234,
      activeUsers: 10,
      topHashtags: ['teamwork', 'development', 'coffee', 'milestone', 'help'],
    },
  };

  const currentData = socialData || mockSocialData;

  const handlePostSubmit = async () => {
    if (!newPost.trim()) return;

    try {
      const response = await fetch('/api/team/social/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          content: newPost,
          channel: selectedChannel,
        }),
      });

      if (response.ok) {
        setNewPost('');
        fetchSocialData();
      }
    } catch (error) {
      console.error('Error posting:', error);
    }
  };

  const handleLike = async postId => {
    try {
      await fetch(`/api/team/social/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      fetchSocialData();
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const getPostTypeIcon = type => {
    switch (type) {
      case 'achievement':
        return <Trophy className="h-4 w-4 text-yellow-600" />;
      case 'announcement':
        return <Bell className="h-4 w-4 text-blue-600" />;
      case 'social':
        return <Coffee className="h-4 w-4 text-green-600" />;
      case 'help':
        return <MessageCircle className="h-4 w-4 text-purple-600" />;
      case 'celebration':
        return <Gift className="h-4 w-4 text-pink-600" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPostTypeColor = type => {
    switch (type) {
      case 'achievement':
        return 'bg-yellow-50 border-yellow-200';
      case 'announcement':
        return 'bg-blue-50 border-blue-200';
      case 'social':
        return 'bg-green-50 border-green-200';
      case 'help':
        return 'bg-purple-50 border-purple-200';
      case 'celebration':
        return 'bg-pink-50 border-pink-200';
      default:
        return 'bg-white border-gray-200';
    }
  };

  const getLevelColor = level => {
    switch (level) {
      case 'Gold':
        return 'text-yellow-600 bg-yellow-100';
      case 'Silver':
        return 'text-gray-600 bg-gray-100';
      case 'Bronze':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Team Social"
        subtitle="Connect, collaborate, and celebrate with your team"
      />

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('feed')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'feed'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <MessageSquare className="h-4 w-4 inline mr-2" />
          Feed
        </button>
        <button
          onClick={() => setActiveTab('channels')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'channels'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Hash className="h-4 w-4 inline mr-2" />
          Channels
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'events'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Calendar className="h-4 w-4 inline mr-2" />
          Events
        </button>
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'leaderboard'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Trophy className="h-4 w-4 inline mr-2" />
          Leaderboard
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3">
          {activeTab === 'feed' && (
            <div className="space-y-6">
              {/* New Post */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <Avatar fallback="YU" />
                    <div className="flex-1 space-y-3">
                      <textarea
                        value={newPost}
                        onChange={e => setNewPost(e.target.value)}
                        placeholder="Share something with your team..."
                        className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                      />
                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => {}} disabled={false}>
                            <Image className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => {}} disabled={false}>
                            <Paperclip className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => {}} disabled={false}>
                            <Smile className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button onClick={handlePostSubmit} disabled={!newPost.trim()}>
                          <Send className="h-4 w-4 mr-2" />
                          Post
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Posts Feed */}
              <div className="space-y-4">
                {currentData.feed.map(post => (
                  <Card key={post.id} className={`${getPostTypeColor(post.type)} border`}>
                    <CardContent className="p-4">
                      {/* Post Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Avatar fallback={post.user.avatar} />
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{post.user.name}</h4>
                              {getPostTypeIcon(post.type)}
                            </div>
                            <p className="text-sm text-gray-600">
                              {post.user.role} • {post.timestamp}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => {}} disabled={false}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Post Content */}
                      <div className="mb-4">
                        <p className="text-gray-800 mb-2">{post.content}</p>

                        {/* Tags */}
                        {post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {post.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Attachments */}
                        {post.attachments.length > 0 && (
                          <div className="space-y-2">
                            {post.attachments.map((attachment, index) => (
                              <div key={index} className="p-2 bg-gray-100 rounded border">
                                <div className="flex items-center gap-2">
                                  {attachment.type === 'link' && <Paperclip className="h-4 w-4" />}
                                  {attachment.type === 'image' && <Image className="h-4 w-4" />}
                                  <span className="text-sm font-medium">{attachment.title}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Post Actions */}
                      <div className="flex items-center justify-between pt-3 border-t">
                        <div className="flex items-center gap-4">
                          <Button variant="ghost"
                            size="sm"
                            onClick={() => handleLike(post.id)} disabled={false}
                            className="text-gray-600 hover:text-blue-600"
                          >
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            {post.likes}
                          </Button>
                          <Button variant="ghost"
                            size="sm"
                            className="text-gray-600 hover:text-green-600"
                           onClick={() => {}} disabled={false}>
                            <MessageCircle className="h-4 w-4 mr-1" />
                            {post.comments}
                          </Button>
                          <Button variant="ghost"
                            size="sm"
                            className="text-gray-600 hover:text-purple-600"
                           onClick={() => {}} disabled={false}>
                            <Share2 className="h-4 w-4 mr-1" />
                            {post.shares}
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => {}} disabled={false}>
                            <Bookmark className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => {}} disabled={false}>
                            <Flag className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'channels' && (
            <div className="space-y-4">
              {currentData.channels.map(channel => (
                <Card key={channel.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded">
                          <Hash className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium flex items-center gap-2">
                            {channel.name}
                            {channel.unread > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {channel.unread}
                              </Badge>
                            )}
                          </h4>
                          <p className="text-sm text-gray-600">{channel.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Users className="h-4 w-4" />
                          {channel.members}
                        </div>
                        <p className="text-xs text-gray-500">{channel.lastActivity}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {activeTab === 'events' && (
            <div className="space-y-4">
              {currentData.events.map(event => (
                <Card key={event.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-2 rounded ${
                            event.type === 'social' ? 'bg-green-100' : 'bg-blue-100'
                          }`}
                        >
                          {event.type === 'social' ? (
                            <Coffee className="h-4 w-4 text-green-600" />
                          ) : (
                            <Target className="h-4 w-4 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium">{event.title}</h4>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3 w-3" />
                              {new Date(event.date).toLocaleDateString()} at {event.time}
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-3 w-3" />
                              {event.location}
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="h-3 w-3" />
                              {event.attendees} attendees
                            </div>
                          </div>
                        </div>
                      </div>
                      <Badge variant={event.type === 'social' ? 'secondary' : 'default'}>
                        {event.type}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {activeTab === 'leaderboard' && (
            <div className="space-y-4">
              {currentData.leaderboard.map((user, index) => (
                <Card key={user.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-2xl font-bold text-gray-400">#{index + 1}</div>
                        <Avatar fallback={user.avatar} />
                        <div>
                          <h4 className="font-medium">{user.user}</h4>
                          <div className="flex items-center gap-2">
                            <Badge className={getLevelColor(user.level)}>{user.level}</Badge>
                            <span className="text-sm text-gray-600">
                              {user.achievements} achievements
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-blue-600">{user.points}</div>
                        <div className="text-sm text-gray-600">points</div>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {user.badges.map((badge, badgeIndex) => (
                        <Badge key={badgeIndex} variant="outline" className="text-xs">
                          <Award className="h-3 w-3 mr-1" />
                          {badge}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Team Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Team Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Posts</span>
                <span className="font-medium">{currentData.stats.totalPosts}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Likes</span>
                <span className="font-medium">{currentData.stats.totalLikes}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Comments</span>
                <span className="font-medium">{currentData.stats.totalComments}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Active Users</span>
                <span className="font-medium text-green-600">{currentData.stats.activeUsers}</span>
              </div>
            </CardContent>
          </Card>

          {/* Trending Hashtags */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Trending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {currentData.stats.topHashtags.map((tag, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Hash className="h-3 w-3 text-gray-400" />
                    <span className="text-sm text-blue-600 hover:underline cursor-pointer">
                      {tag}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" onClick={() => {}} disabled={false}>
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => {}} disabled={false}>
                <Users className="h-4 w-4 mr-2" />
                Invite Members
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => {}} disabled={false}>
                <Hash className="h-4 w-4 mr-2" />
                Create Channel
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TeamSocial;
