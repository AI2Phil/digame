import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeft, Users, Search, Filter, Heart, MessageCircle, UserPlus, Star, MapPin, Briefcase, GraduationCap } from 'lucide-react';

export default function PeerMatching() {
  const [matches, setMatches] = useState([]);
  const [filters, setFilters] = useState({
    skills: '',
    location: '',
    industry: '',
    experience: 'all'
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchMatches();
  }, [filters]);

  const fetchMatches = async () => {
    try {
      const response = await fetch('/api/social/peer-matching', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || 'demo-token'}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setMatches(result.data);
      } else {
        setMatches(getMockMatches());
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
      setMatches(getMockMatches());
    } finally {
      setLoading(false);
    }
  };

  const getMockMatches = () => [
    {
      id: 1,
      name: 'Sarah Chen',
      title: 'Senior Product Manager',
      company: 'TechCorp',
      location: 'San Francisco, CA',
      avatar: '/avatars/sarah.jpg',
      matchScore: 94,
      skills: ['Product Strategy', 'User Research', 'Agile', 'Data Analysis'],
      interests: ['AI/ML', 'Sustainability', 'Remote Work'],
      experience: '8 years',
      connections: 247,
      mutualConnections: 12,
      lastActive: '2 hours ago',
      bio: 'Passionate about building products that make a difference. Love connecting with fellow product enthusiasts.',
      verified: true
    },
    {
      id: 2,
      name: 'Marcus Johnson',
      title: 'Full Stack Developer',
      company: 'StartupXYZ',
      location: 'Austin, TX',
      avatar: '/avatars/marcus.jpg',
      matchScore: 89,
      skills: ['React', 'Node.js', 'Python', 'AWS'],
      interests: ['Open Source', 'Blockchain', 'Gaming'],
      experience: '5 years',
      connections: 156,
      mutualConnections: 8,
      lastActive: '1 day ago',
      bio: 'Building the future one line of code at a time. Always excited to collaborate on innovative projects.',
      verified: false
    },
    {
      id: 3,
      name: 'Elena Rodriguez',
      title: 'UX Design Lead',
      company: 'DesignStudio',
      location: 'New York, NY',
      avatar: '/avatars/elena.jpg',
      matchScore: 87,
      skills: ['User Experience', 'Design Systems', 'Prototyping', 'Research'],
      interests: ['Accessibility', 'Design Thinking', 'Mentoring'],
      experience: '6 years',
      connections: 189,
      mutualConnections: 15,
      lastActive: '3 hours ago',
      bio: 'Creating inclusive and delightful user experiences. Passionate about design education and mentorship.',
      verified: true
    },
    {
      id: 4,
      name: 'David Kim',
      title: 'Data Scientist',
      company: 'Analytics Pro',
      location: 'Seattle, WA',
      avatar: '/avatars/david.jpg',
      matchScore: 85,
      skills: ['Machine Learning', 'Python', 'SQL', 'Statistics'],
      interests: ['AI Ethics', 'Data Visualization', 'Teaching'],
      experience: '4 years',
      connections: 134,
      mutualConnections: 6,
      lastActive: '5 hours ago',
      bio: 'Turning data into insights and insights into action. Love sharing knowledge about ML and statistics.',
      verified: false
    },
    {
      id: 5,
      name: 'Priya Patel',
      title: 'Marketing Director',
      company: 'GrowthCo',
      location: 'Chicago, IL',
      avatar: '/avatars/priya.jpg',
      matchScore: 82,
      skills: ['Digital Marketing', 'Growth Hacking', 'Analytics', 'Content Strategy'],
      interests: ['Entrepreneurship', 'Diversity & Inclusion', 'Fitness'],
      experience: '7 years',
      connections: 298,
      mutualConnections: 18,
      lastActive: '1 hour ago',
      bio: 'Growth-focused marketer with a passion for building authentic brand connections and diverse teams.',
      verified: true
    }
  ];

  const getMatchScoreColor = (score) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  const sendConnectionRequest = (matchId) => {
    console.log(`Sending connection request to user ${matchId}`);
    alert('Connection request sent!');
  };

  const startConversation = (matchId) => {
    console.log(`Starting conversation with user ${matchId}`);
    alert('Starting conversation...');
  };

  const saveMatch = (matchId) => {
    console.log(`Saving match ${matchId}`);
    alert('Match saved to favorites!');
  };

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
        <title>Peer Matching - Social - Digame</title>
        <meta name="description" content="Find and connect with like-minded professionals" />
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
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Peer Matching</h1>
              <p className="text-gray-600">Find and connect with like-minded professionals</p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, skills, or company..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <select
                  value={filters.industry}
                  onChange={(e) => setFilters({...filters, industry: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Industries</option>
                  <option value="technology">Technology</option>
                  <option value="finance">Finance</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="education">Education</option>
                </select>
                <select
                  value={filters.experience}
                  onChange={(e) => setFilters({...filters, experience: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Experience</option>
                  <option value="entry">Entry Level (0-2 years)</option>
                  <option value="mid">Mid Level (3-5 years)</option>
                  <option value="senior">Senior Level (6+ years)</option>
                </select>
                <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                  <Filter className="w-4 h-4" />
                  <span>More Filters</span>
                </button>
              </div>
            </div>
          </div>

          {/* Match Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Matches</p>
                  <p className="text-2xl font-bold text-gray-900">{matches.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">High Matches</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {matches.filter(m => m.matchScore >= 90).length}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Star className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Mutual Connections</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {matches.reduce((sum, m) => sum + m.mutualConnections, 0)}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <UserPlus className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Verified Profiles</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {matches.filter(m => m.verified).length}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Star className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Matches Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((match) => (
              <div key={match.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                {/* Profile Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                      <Users className="w-8 h-8 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900">{match.name}</h3>
                        {match.verified && (
                          <Star className="w-4 h-4 text-blue-500 fill-current" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{match.title}</p>
                      <p className="text-sm text-gray-500">{match.company}</p>
                      <div className="flex items-center space-x-1 mt-1">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">{match.location}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getMatchScoreColor(match.matchScore)}`}>
                        {match.matchScore}% match
                      </span>
                    </div>
                  </div>
                </div>

                {/* Profile Details */}
                <div className="p-6">
                  <p className="text-sm text-gray-600 mb-4">{match.bio}</p>
                  
                  <div className="space-y-3 mb-4">
                    <div>
                      <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Skills</h4>
                      <div className="flex flex-wrap gap-1">
                        {match.skills.slice(0, 3).map((skill, index) => (
                          <span key={index} className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded">
                            {skill}
                          </span>
                        ))}
                        {match.skills.length > 3 && (
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                            +{match.skills.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Interests</h4>
                      <div className="flex flex-wrap gap-1">
                        {match.interests.slice(0, 2).map((interest, index) => (
                          <span key={index} className="px-2 py-1 text-xs bg-green-100 text-green-600 rounded">
                            {interest}
                          </span>
                        ))}
                        {match.interests.length > 2 && (
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                            +{match.interests.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <div className="flex items-center space-x-1">
                      <Briefcase className="w-3 h-3" />
                      <span>{match.experience} experience</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="w-3 h-3" />
                      <span>{match.mutualConnections} mutual</span>
                    </div>
                    <span>Active {match.lastActive}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => sendConnectionRequest(match.id)}
                      className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Connect</span>
                    </button>
                    <button 
                      onClick={() => startConversation(match.id)}
                      className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Message</span>
                    </button>
                    <button 
                      onClick={() => saveMatch(match.id)}
                      className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                      <Heart className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}