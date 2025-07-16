import React, { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useAuth } from '../../contexts/AuthContext';
import { ToastProvider, useToastActions } from '../../components/ui/Toast';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import Avatar, { AvatarFallback } from '../../components/ui/Avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import {
  MessageCircle,
  Users,
  TrendingUp,
  Clock,
  Star,
  Search,
  Filter,
  Plus,
  ArrowUp,
  ArrowDown,
  Eye,
  MessageSquare,
  BookOpen,
  Lightbulb,
  HelpCircle,
  Briefcase,
  Code,
  Zap
} from 'lucide-react';

interface ForumPost {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    avatar?: string;
    role: string;
    reputation: number;
  };
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  views: number;
  replies: number;
  likes: number;
  isSticky?: boolean;
  isSolved?: boolean;
}

interface ForumCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  postCount: number;
  color: string;
}

const SocialForumsPage: React.FC = () => {
  const { user, isLoading } = useAuth();
  const toast = useToastActions();
  const [activeTab, setActiveTab] = useState('recent');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration
  const mockCategories: ForumCategory[] = [
    {
      id: 'general',
      name: 'General Discussion',
      description: 'General topics and community discussions',
      icon: <MessageCircle className="w-5 h-5" />,
      postCount: 245,
      color: 'blue'
    },
    {
      id: 'career',
      name: 'Career Development',
      description: 'Career advice, job opportunities, and professional growth',
      icon: <Briefcase className="w-5 h-5" />,
      postCount: 189,
      color: 'green'
    },
    {
      id: 'technical',
      name: 'Technical Help',
      description: 'Technical questions and troubleshooting',
      icon: <Code className="w-5 h-5" />,
      postCount: 156,
      color: 'purple'
    },
    {
      id: 'learning',
      name: 'Learning & Education',
      description: 'Learning resources, courses, and educational content',
      icon: <BookOpen className="w-5 h-5" />,
      postCount: 134,
      color: 'orange'
    },
    {
      id: 'innovation',
      name: 'Innovation & Ideas',
      description: 'Share innovative ideas and creative solutions',
      icon: <Lightbulb className="w-5 h-5" />,
      postCount: 98,
      color: 'yellow'
    },
    {
      id: 'qa',
      name: 'Q&A',
      description: 'Questions and answers from the community',
      icon: <HelpCircle className="w-5 h-5" />,
      postCount: 267,
      color: 'red'
    }
  ];

  const mockPosts: ForumPost[] = [
    {
      id: '1',
      title: 'Best practices for AI-powered workflow automation',
      content: 'I\'ve been experimenting with AI-powered workflow automation and wanted to share some insights...',
      author: {
        name: 'Sarah Chen',
        role: 'Senior Developer',
        reputation: 1250
      },
      category: 'technical',
      tags: ['AI', 'Automation', 'Workflow'],
      createdAt: '2025-01-15T10:30:00Z',
      updatedAt: '2025-01-15T14:20:00Z',
      views: 342,
      replies: 23,
      likes: 45,
      isSticky: true
    },
    {
      id: '2',
      title: 'Career transition from traditional roles to AI-focused positions',
      content: 'Looking for advice on transitioning from a traditional business analyst role to AI/ML...',
      author: {
        name: 'Michael Rodriguez',
        role: 'Business Analyst',
        reputation: 890
      },
      category: 'career',
      tags: ['Career', 'AI', 'Transition'],
      createdAt: '2025-01-15T09:15:00Z',
      updatedAt: '2025-01-15T13:45:00Z',
      views: 156,
      replies: 12,
      likes: 28
    },
    {
      id: '3',
      title: 'How to effectively use digital twins for process optimization?',
      content: 'I\'m new to digital twin technology and would love to learn from experienced users...',
      author: {
        name: 'Emma Thompson',
        role: 'Process Engineer',
        reputation: 675
      },
      category: 'learning',
      tags: ['Digital Twin', 'Process Optimization', 'Learning'],
      createdAt: '2025-01-15T08:45:00Z',
      updatedAt: '2025-01-15T12:30:00Z',
      views: 89,
      replies: 8,
      likes: 15,
      isSolved: true
    }
  ];

  useEffect(() => {
    // Simulate loading data
    const loadForumData = async () => {
      setLoading(true);
      try {
        // In a real app, this would be API calls
        await new Promise(resolve => setTimeout(resolve, 1000));
        setCategories(mockCategories);
        setPosts(mockPosts);
      } catch (error) {
        toast.error('Failed to load forum data');
      } finally {
        setLoading(false);
      }
    };

    loadForumData();
  }, [toast]);

  const handleCreatePost = () => {
    toast.info('Post creation feature coming soon!');
  };

  const handleLikePost = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, likes: post.likes + 1 }
        : post
    ));
    toast.success('Post liked!');
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = searchTerm === '' || 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.color || 'gray';
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <MessageCircle className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Join the Community</h2>
          <p className="text-gray-600 mb-6">Please log in to access community forums and participate in discussions.</p>
          <a
            href="/auth/login"
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-50">
        <Head>
          <title>Community Forums - Digame</title>
          <meta name="description" content="Join the Digame community forums to discuss AI, automation, career development, and more." />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>

        <main className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <MessageCircle className="w-8 h-8 text-indigo-600" />
                    Community Forums
                  </h1>
                  <p className="text-lg text-gray-600 mt-2">
                    Connect, learn, and share knowledge with the Digame community
                  </p>
                </div>
                <Button onClick={handleCreatePost} className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  New Post
                </Button>
              </div>
            </div>

            {/* Categories Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {categories.map((category) => (
                <Card 
                  key={category.id} 
                  className={`cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-l-${category.color}-500`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-${category.color}-100 text-${category.color}-600`}>
                          {category.icon}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{category.name}</CardTitle>
                          <p className="text-sm text-gray-600">{category.description}</p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">{category.postCount} posts</span>
                      <Badge variant="outline" className="text-xs">
                        Active
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search posts, topics, or tags..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Forum Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="recent" className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Recent
                </TabsTrigger>
                <TabsTrigger value="trending" className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Trending
                </TabsTrigger>
                <TabsTrigger value="popular" className="flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Popular
                </TabsTrigger>
                <TabsTrigger value="unanswered" className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" />
                  Unanswered
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-6">
                <div className="space-y-4">
                  {filteredPosts.map((post) => (
                    <Card key={post.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <Avatar
                            className="w-12 h-12"
                            name={post.author.name}
                            size="lg"
                          />
                          
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                  {post.isSticky && <Zap className="w-4 h-4 text-yellow-500" />}
                                  {post.title}
                                  {post.isSolved && <Badge variant="outline" className="text-green-600 border-green-600">Solved</Badge>}
                                </h3>
                                <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                  <span className="font-medium">{post.author.name}</span>
                                  <span>•</span>
                                  <span>{post.author.role}</span>
                                  <span>•</span>
                                  <span>{formatTimeAgo(post.createdAt)}</span>
                                </div>
                              </div>
                              <Badge 
                                variant="outline" 
                                className={`text-${getCategoryColor(post.category)}-600 border-${getCategoryColor(post.category)}-600`}
                              >
                                {categories.find(cat => cat.id === post.category)?.name}
                              </Badge>
                            </div>
                            
                            <p className="text-gray-700 mb-3 line-clamp-2">{post.content}</p>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Eye className="w-4 h-4" />
                                  {post.views}
                                </div>
                                <div className="flex items-center gap-1">
                                  <MessageSquare className="w-4 h-4" />
                                  {post.replies}
                                </div>
                                <button 
                                  onClick={() => handleLikePost(post.id)}
                                  className="flex items-center gap-1 hover:text-red-500 transition-colors"
                                >
                                  <ArrowUp className="w-4 h-4" />
                                  {post.likes}
                                </button>
                              </div>
                              
                              <div className="flex flex-wrap gap-1">
                                {post.tags.map((tag, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    #{tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {filteredPosts.length === 0 && (
                    <Card>
                      <CardContent className="text-center py-12">
                        <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No posts found</h3>
                        <p className="text-gray-600 mb-4">
                          {searchTerm || selectedCategory !== 'all' 
                            ? "Try adjusting your search or filter criteria."
                            : "Be the first to start a discussion in this community!"
                          }
                        </p>
                        <Button onClick={handleCreatePost}>
                          <Plus className="w-4 h-4 mr-2" />
                          Create First Post
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </ToastProvider>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  // You can fetch initial forum data here if needed
  // For now, we'll let the component handle data fetching
  
  return {
    props: {}
  };
};

export default SocialForumsPage;