import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeft, MessageSquare, Plus, Search, Filter, Pin, Heart, MessageCircle, Eye, Clock, Users, TrendingUp } from 'lucide-react';

export default function CommunityForums() {
  const [forums, setForums] = useState([]);
  const [posts, setPosts] = useState([]);
  const [selectedForum, setSelectedForum] = useState('all');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');

  useEffect(() => {
    fetchForumsData();
  }, [selectedForum, sortBy]);

  const fetchForumsData = async () => {
    try {
      const response = await fetch('/api/social/forums', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || 'demo-token'}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setForums(result.data.forums);
        setPosts(result.data.posts);
      } else {
        const mockData = getMockForumsData();
        setForums(mockData.forums);
        setPosts(mockData.posts);
      }
    } catch (error) {
      console.error('Error fetching forums data:', error);
      const mockData = getMockForumsData();
      setForums(mockData.forums);
      setPosts(mockData.posts);
    } finally {
      setLoading(false);
    }
  };

  const getMockForumsData = () => ({
    forums: [
      {
        id: 1,
        name: 'General Discussion',
        description: 'Open discussions about anything and everything',
        category: 'general',
        members: 1247,
        posts: 3456,
        lastActivity: '2024-01-05T10:30:00Z',
        color: 'blue'
      },
      {
        id: 2,
        name: 'Career Development',
        description: 'Share career advice, job opportunities, and professional growth tips',
        category: 'career',
        members: 892,
        posts: 2134,
        lastActivity: '2024-01-05T09:15:00Z',
        color: 'green'
      },
      {
        id: 3,
        name: 'Technology & Innovation',
        description: 'Discuss the latest in tech, AI, and digital transformation',
        category: 'technology',
        members: 1567,
        posts: 4789,
        lastActivity: '2024-01-05T08:45:00Z',
        color: 'purple'
      },
      {
        id: 4,
        name: 'Industry Insights',
        description: 'Share market trends, industry news, and business insights',
        category: 'business',
        members: 634,
        posts: 1823,
        lastActivity: '2024-01-05T07:20:00Z',
        color: 'orange'
      },
      {
        id: 5,
        name: 'Learning & Development',
        description: 'Educational resources, courses, and skill development discussions',
        category: 'education',
        members: 756,
        posts: 2567,
        lastActivity: '2024-01-04T16:30:00Z',
        color: 'red'
      }
    ],
    posts: [
      {
        id: 1,
        title: 'Best practices for remote team collaboration',
        content: 'What are your favorite tools and strategies for keeping remote teams engaged and productive?',
        author: 'Sarah Chen',
        authorAvatar: '/avatars/sarah.jpg',
        forumId: 1,
        forumName: 'General Discussion',
        createdAt: '2024-01-05T10:30:00Z',
        replies: 23,
        likes: 45,
        views: 234,
        isPinned: true,
        tags: ['remote-work', 'collaboration', 'productivity']
      },
      {
        id: 2,
        title: 'Transitioning from developer to tech lead - advice needed',
        content: 'I\'ve been offered a tech lead position but I\'m nervous about the transition. Any tips from experienced leaders?',
        author: 'Marcus Johnson',
        authorAvatar: '/avatars/marcus.jpg',
        forumId: 2,
        forumName: 'Career Development',
        createdAt: '2024-01-05T09:15:00Z',
        replies: 18,
        likes: 32,
        views: 156,
        isPinned: false,
        tags: ['career-growth', 'leadership', 'tech-lead']
      },
      {
        id: 3,
        title: 'AI in product development: game changer or overhyped?',
        content: 'Curious about everyone\'s experience integrating AI tools into their product development workflow.',
        author: 'Elena Rodriguez',
        authorAvatar: '/avatars/elena.jpg',
        forumId: 3,
        forumName: 'Technology & Innovation',
        createdAt: '2024-01-05T08:45:00Z',
        replies: 41,
        likes: 67,
        views: 389,
        isPinned: false,
        tags: ['ai', 'product-development', 'innovation']
      },
      {
        id: 4,
        title: 'Market trends to watch in 2024',
        content: 'What industry trends do you think will have the biggest impact this year?',
        author: 'David Kim',
        authorAvatar: '/avatars/david.jpg',
        forumId: 4,
        forumName: 'Industry Insights',
        createdAt: '2024-01-05T07:20:00Z',
        replies: 15,
        likes: 28,
        views: 198,
        isPinned: false,
        tags: ['market-trends', '2024', 'business-strategy']
      },
      {
        id: 5,
        title: 'Free online courses that actually add value',
        content: 'Share your recommendations for high-quality free courses that have helped your career.',
        author: 'Priya Patel',
        authorAvatar: '/avatars/priya.jpg',
        forumId: 5,
        forumName: 'Learning & Development',
        createdAt: '2024-01-04T16:30:00Z',
        replies: 29,
        likes: 52,
        views: 267,
        isPinned: true,
        tags: ['education', 'free-courses', 'career-development']
      },
      {
        id: 6,
        title: 'Networking events worth attending',
        content: 'What are the best networking events you\'ve attended? Both virtual and in-person recommendations welcome.',
        author: 'Alex Thompson',
        authorAvatar: '/avatars/alex.jpg',
        forumId: 1,
        forumName: 'General Discussion',
        createdAt: '2024-01-04T15:45:00Z',
        replies: 12,
        likes: 19,
        views: 143,
        isPinned: false,
        tags: ['networking', 'events', 'professional-development']
      }
    ]
  });

  const getForumColor = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      orange: 'bg-orange-100 text-orange-600',
      red: 'bg-red-100 text-red-600'
    };
    return colors[color] || colors.blue;
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const likePost = (postId) => {
    console.log(`Liking post ${postId}`);
    // Update post likes in state
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, likes: post.likes + 1 }
        : post
    ));
  };

  const filteredPosts = posts.filter(post => {
    if (selectedForum !== 'all' && post.forumId !== parseInt(selectedForum)) return false;
    if (searchQuery && !post.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Community Forums - Social - Digame</title>
        <meta name="description" content="Engage in discussions with the community" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-3">
            <Link href="/social" className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Back to Social Hub</span>
            </Link>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Community Forums</h1>
                <p className="text-gray-600">Engage in discussions with the community</p>
              </div>
            </div>
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus className="w-4 h-4" />
              <span>New Post</span>
            </button>
          </div>

          {/* Forum Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Forums</p>
                  <p className="text-2xl font-bold text-gray-900">{forums.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <MessageSquare className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Posts</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {forums.reduce((sum, forum) => sum + forum.posts, 0).toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <MessageCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Members</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {forums.reduce((sum, forum) => sum + forum.members, 0).toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Today's Posts</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {posts.filter(post => {
                      const today = new Date();
                      const postDate = new Date(post.createdAt);
                      return postDate.toDateString() === today.toDateString();
                    }).length}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Forums Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Forums</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedForum('all')}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedForum === 'all' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    All Forums
                  </button>
                  {forums.map((forum) => (
                    <button
                      key={forum.id}
                      onClick={() => setSelectedForum(forum.id.toString())}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        selectedForum === forum.id.toString() 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${getForumColor(forum.color).replace('text-', 'bg-').replace('100', '500')}`}></div>
                        <span className="text-sm font-medium">{forum.name}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {forum.posts} posts • {forum.members} members
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Search and Filters */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search posts..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="recent">Most Recent</option>
                      <option value="popular">Most Popular</option>
                      <option value="replies">Most Replies</option>
                      <option value="views">Most Views</option>
                    </select>
                    <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                      <Filter className="w-4 h-4" />
                      <span>Filter</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Posts List */}
              <div className="space-y-4">
                {filteredPosts.map((post) => (
                  <div key={post.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <div className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          <Users className="w-6 h-6 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                {post.isPinned && (
                                  <Pin className="w-4 h-4 text-blue-600" />
                                )}
                                <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 cursor-pointer">
                                  {post.title}
                                </h3>
                              </div>
                              <p className="text-gray-600 text-sm mb-3">{post.content}</p>
                              <div className="flex flex-wrap gap-1 mb-3">
                                {post.tags.map((tag, index) => (
                                  <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span>by {post.author}</span>
                                <span>in {post.forumName}</span>
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{formatTimeAgo(post.createdAt)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <MessageCircle className="w-4 h-4" />
                            <span>{post.replies} replies</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Eye className="w-4 h-4" />
                            <span>{post.views} views</span>
                          </div>
                        </div>
                        <button
                          onClick={() => likePost(post.id)}
                          className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-red-600 transition-colors"
                        >
                          <Heart className="w-4 h-4" />
                          <span>{post.likes}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}