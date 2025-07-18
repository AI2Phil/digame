import Head from 'next/head';
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeft, Award, Star, Calendar, Download, Share2, CheckCircle, Clock, BookOpen, Target, Users } from 'lucide-react';

export default const CertificationHub: React.FC = () => {
  const [certifications, setCertifications] = useState([]);
  const [availableCerts, setAvailableCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('earned');

  useEffect(() => {
    fetchCertifications();
  }, []);

  const fetchCertifications = async () => {
    try {
      const response = await fetch('/api/learning/certifications', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || 'demo-token'}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setCertifications(result.data.earned);
        setAvailableCerts(result.data.available);
      } else {
        const mockData = getMockCertifications();
        setCertifications(mockData.earned);
        setAvailableCerts(mockData.available);
      }
    } catch (error) {
      console.error('Error fetching certifications:', error);
      const mockData = getMockCertifications();
      setCertifications(mockData.earned);
      setAvailableCerts(mockData.available);
    } finally {
      setLoading(false);
    }
  };

  const getMockCertifications = () => ({
    earned: [
      {
        id: 1,
        title: 'Frontend Developer Certification',
        description: 'Comprehensive certification covering React, JavaScript, and modern frontend development practices.',
        issuer: 'Digame Learning',
        earnedDate: '2024-01-05T10:30:00Z',
        expiryDate: '2026-01-05T10:30:00Z',
        credentialId: 'FD-2024-001234',
        skills: ['React', 'JavaScript', 'HTML/CSS', 'TypeScript'],
        level: 'Advanced',
        category: 'Programming',
        verificationUrl: 'https://verify.digame.com/FD-2024-001234',
        badge: '/badges/frontend-developer.svg',
        score: 92,
        totalHours: 40
      },
      {
        id: 2,
        title: 'Digital Marketing Specialist',
        description: 'Certification in digital marketing strategies, SEO, social media marketing, and analytics.',
        issuer: 'Marketing Institute',
        earnedDate: '2024-01-02T16:45:00Z',
        expiryDate: '2025-01-02T16:45:00Z',
        credentialId: 'DMS-2024-005678',
        skills: ['SEO', 'Social Media Marketing', 'Google Analytics', 'Content Strategy'],
        level: 'Intermediate',
        category: 'Marketing',
        verificationUrl: 'https://verify.marketing-institute.com/DMS-2024-005678',
        badge: '/badges/digital-marketing.svg',
        score: 88,
        totalHours: 32
      },
      {
        id: 3,
        title: 'UX Design Professional',
        description: 'Professional certification in user experience design, research, and prototyping.',
        issuer: 'Design Academy',
        earnedDate: '2023-12-15T14:20:00Z',
        expiryDate: '2025-12-15T14:20:00Z',
        credentialId: 'UXP-2023-009876',
        skills: ['User Research', 'Prototyping', 'Design Thinking', 'Usability Testing'],
        level: 'Professional',
        category: 'Design',
        verificationUrl: 'https://verify.design-academy.com/UXP-2023-009876',
        badge: '/badges/ux-design.svg',
        score: 95,
        totalHours: 48
      },
      {
        id: 4,
        title: 'Data Analysis Fundamentals',
        description: 'Foundation certification in data analysis using Python, pandas, and statistical methods.',
        issuer: 'Data Science Institute',
        earnedDate: '2023-11-28T09:15:00Z',
        expiryDate: '2025-11-28T09:15:00Z',
        credentialId: 'DAF-2023-012345',
        skills: ['Python', 'Pandas', 'Statistics', 'Data Visualization'],
        level: 'Beginner',
        category: 'Data Science',
        verificationUrl: 'https://verify.data-institute.com/DAF-2023-012345',
        badge: '/badges/data-analysis.svg',
        score: 85,
        totalHours: 24
      },
      {
        id: 5,
        title: 'Project Management Professional',
        description: 'Comprehensive project management certification covering agile methodologies and leadership.',
        issuer: 'PM Institute',
        earnedDate: '2023-10-10T11:30:00Z',
        expiryDate: '2026-10-10T11:30:00Z',
        credentialId: 'PMP-2023-054321',
        skills: ['Agile', 'Scrum', 'Risk Management', 'Team Leadership'],
        level: 'Professional',
        category: 'Business',
        verificationUrl: 'https://verify.pm-institute.com/PMP-2023-054321',
        badge: '/badges/project-management.svg',
        score: 90,
        totalHours: 56
      }
    ],
    available: [
      {
        id: 6,
        title: 'Advanced React Development',
        description: 'Master advanced React concepts including performance optimization, testing, and architecture.',
        issuer: 'Digame Learning',
        requirements: ['Complete React Fundamentals', '40 hours of practice', 'Pass final assessment'],
        estimatedHours: 45,
        level: 'Advanced',
        category: 'Programming',
        skills: ['React', 'Performance Optimization', 'Testing', 'Architecture'],
        prerequisite: 'Frontend Developer Certification',
        price: 199,
        currency: 'USD',
        enrolled: false,
        progress: 0
      },
      {
        id: 7,
        title: 'Machine Learning Specialist',
        description: 'Comprehensive machine learning certification covering algorithms, model training, and deployment.',
        issuer: 'AI Academy',
        requirements: ['Python proficiency', 'Statistics knowledge', 'Complete 5 ML projects'],
        estimatedHours: 60,
        level: 'Advanced',
        category: 'Data Science',
        skills: ['Machine Learning', 'Python', 'TensorFlow', 'Model Deployment'],
        prerequisite: 'Data Analysis Fundamentals',
        price: 299,
        currency: 'USD',
        enrolled: true,
        progress: 35
      },
      {
        id: 8,
        title: 'Cloud Architecture Professional',
        description: 'Professional certification in cloud architecture design and implementation using AWS.',
        issuer: 'Cloud Institute',
        requirements: ['AWS basics', 'System design knowledge', 'Complete capstone project'],
        estimatedHours: 50,
        level: 'Professional',
        category: 'Technology',
        skills: ['AWS', 'Cloud Architecture', 'System Design', 'DevOps'],
        prerequisite: null,
        price: 249,
        currency: 'USD',
        enrolled: false,
        progress: 0
      },
      {
        id: 9,
        title: 'Growth Marketing Expert',
        description: 'Advanced marketing certification focusing on growth hacking and data-driven marketing.',
        issuer: 'Growth Academy',
        requirements: ['Marketing fundamentals', 'Analytics experience', 'Complete growth experiments'],
        estimatedHours: 35,
        level: 'Expert',
        category: 'Marketing',
        skills: ['Growth Hacking', 'A/B Testing', 'Marketing Analytics', 'Conversion Optimization'],
        prerequisite: 'Digital Marketing Specialist',
        price: 179,
        currency: 'USD',
        enrolled: false,
        progress: 0
      }
    ]
  });

  const getLevelColor = (level) => {
    const colors = {
      'Beginner': 'bg-green-100 text-green-600',
      'Intermediate': 'bg-yellow-100 text-yellow-600',
      'Advanced': 'bg-red-100 text-red-600',
      'Professional': 'bg-purple-100 text-purple-600',
      'Expert': 'bg-indigo-100 text-indigo-600'
    };
    return colors[level] || colors.Beginner;
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Programming': 'bg-blue-100 text-blue-600',
      'Design': 'bg-pink-100 text-pink-600',
      'Marketing': 'bg-orange-100 text-orange-600',
      'Business': 'bg-indigo-100 text-indigo-600',
      'Data Science': 'bg-purple-100 text-purple-600',
      'Technology': 'bg-gray-100 text-gray-600'
    };
    return colors[category] || colors.Technology;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isExpiringSoon = (expiryDate) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffMs = expiry - now;
    const diffDays = Math.floor(diffMs / 86400000);
    return diffDays <= 90 && diffDays > 0;
  };

  const isExpired = (expiryDate) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    return expiry < now;
  };

  const downloadCertificate = (certId) => {
    console.log(`Downloading certificate ${certId}`);
    alert('Certificate download started...');
  };

  const shareCertificate = (cert) => {
    const shareUrl = cert.verificationUrl;
    navigator.clipboard.writeText(shareUrl);
    alert('Certificate verification link copied to clipboard!');
  };

  const enrollInCertification = (certId) => {
    console.log(`Enrolling in certification ${certId}`);
    setAvailableCerts(availableCerts.map(cert => 
      cert.id === certId 
        ? { ...cert, enrolled: true }
        : cert
    ));
    alert('Successfully enrolled in certification program!');
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
        <title>Certification Hub - Learning - Digame</title>
        <meta name="description" content="Manage your certifications and explore new certification opportunities" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-3">
            <Link href="/learning" className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Back to Learning Hub</span>
            </Link>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Certification Hub</h1>
              <p className="text-gray-600">Manage your certifications and explore new certification opportunities</p>
            </div>
          </div>

          {/* Certification Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Earned Certifications</p>
                  <p className="text-2xl font-bold text-gray-900">{certifications.length}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Award className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {availableCerts.filter(c => c.enrolled).length}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {certifications.filter(c => isExpiringSoon(c.expiryDate)).length}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Calendar className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Hours</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {certifications.reduce((sum, cert) => sum + cert.totalHours, 0)}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <BookOpen className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-white rounded-lg shadow-sm mb-8">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: 'earned', label: 'Earned Certifications', icon: <Award className="w-4 h-4" /> },
                  { id: 'available', label: 'Available Certifications', icon: <Target className="w-4 h-4" /> },
                  { id: 'progress', label: 'In Progress', icon: <Clock className="w-4 h-4" /> }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-yellow-500 text-yellow-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {/* Earned Certifications Tab */}
              {activeTab === 'earned' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {certifications.map((cert) => (
                    <div key={cert.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      {/* Certificate Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-16 h-16 bg-yellow-100 rounded-lg flex items-center justify-center">
                          <Award className="w-8 h-8 text-yellow-600" />
                        </div>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => downloadCertificate(cert.id)}
                            className="p-2 text-gray-400 hover:text-blue-600"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => shareCertificate(cert)}
                            className="p-2 text-gray-400 hover:text-green-600"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Certificate Details */}
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{cert.title}</h3>
                        <p className="text-gray-600 text-sm mb-3">{cert.description}</p>
                        
                        <div className="flex items-center space-x-2 mb-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(cert.category)}`}>
                            {cert.category}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getLevelColor(cert.level)}`}>
                            {cert.level}
                          </span>
                        </div>

                        <div className="text-sm text-gray-600 space-y-1">
                          <div>Issued by: {cert.issuer}</div>
                          <div>Earned: {formatDate(cert.earnedDate)}</div>
                          <div className={`${isExpired(cert.expiryDate) ? 'text-red-600' : isExpiringSoon(cert.expiryDate) ? 'text-orange-600' : 'text-gray-600'}`}>
                            Expires: {formatDate(cert.expiryDate)}
                            {isExpired(cert.expiryDate) && ' (Expired)'}
                            {isExpiringSoon(cert.expiryDate) && ' (Expiring Soon)'}
                          </div>
                          <div>Score: {cert.score}%</div>
                          <div>Hours: {cert.totalHours}h</div>
                        </div>
                      </div>

                      {/* Skills */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Skills Covered</h4>
                        <div className="flex flex-wrap gap-1">
                          {cert.skills.map((skill, index) => (
                            <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Credential ID */}
                      <div className="bg-gray-50 rounded p-3">
                        <div className="text-xs font-medium text-gray-700 mb-1">Credential ID</div>
                        <div className="text-xs font-mono text-gray-600">{cert.credentialId}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Available Certifications Tab */}
              {activeTab === 'available' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availableCerts.filter(cert => !cert.enrolled).map((cert) => (
                    <div key={cert.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      {/* Certificate Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Target className="w-8 h-8 text-blue-600" />
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900">
                            {cert.price === 0 ? 'Free' : `$${cert.price}`}
                          </div>
                        </div>
                      </div>

                      {/* Certificate Details */}
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{cert.title}</h3>
                        <p className="text-gray-600 text-sm mb-3">{cert.description}</p>
                        
                        <div className="flex items-center space-x-2 mb-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(cert.category)}`}>
                            {cert.category}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getLevelColor(cert.level)}`}>
                            {cert.level}
                          </span>
                        </div>

                        <div className="text-sm text-gray-600 space-y-1">
                          <div>Issued by: {cert.issuer}</div>
                          <div>Estimated time: {cert.estimatedHours} hours</div>
                          {cert.prerequisite && (
                            <div>Prerequisite: {cert.prerequisite}</div>
                          )}
                        </div>
                      </div>

                      {/* Requirements */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Requirements</h4>
                        <ul className="text-xs text-gray-600 space-y-1">
                          {cert.requirements.map((req, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <CheckCircle className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                              <span>{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Skills */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Skills You'll Learn</h4>
                        <div className="flex flex-wrap gap-1">
                          {cert.skills.map((skill, index) => (
                            <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Enroll Button */}
                      <button 
                        onClick={() => enrollInCertification(cert.id)}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                      >
                        Enroll Now
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* In Progress Tab */}
              {activeTab === 'progress' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availableCerts.filter(cert => cert.enrolled).map((cert) => (
                    <div key={cert.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      {/* Certificate Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center">
                          <Clock className="w-8 h-8 text-green-600" />
                        </div>
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-600 rounded-full">
                          In Progress
                        </span>
                      </div>

                      {/* Certificate Details */}
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{cert.title}</h3>
                        <p className="text-gray-600 text-sm mb-3">{cert.description}</p>
                        
                        <div className="flex items-center space-x-2 mb-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(cert.category)}`}>
                            {cert.category}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getLevelColor(cert.level)}`}>
                            {cert.level}
                          </span>
                        </div>
                      </div>

                      {/* Progress */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Progress</span>
                          <span className="text-sm text-gray-600">{cert.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-green-600 h-3 rounded-full" 
                            style={{ width: `${cert.progress}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Continue Button */}
                      <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">
                        Continue Learning
                      </button>
                    </div>
                  ))}
                  
                  {availableCerts.filter(cert => cert.enrolled).length === 0 && (
                    <div className="col-span-full text-center py-12">
                      <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Certifications in Progress</h3>
                      <p className="text-gray-600 mb-4">Start working towards a new certification to track your progress here.</p>
                      <button 
                        onClick={() => setActiveTab('available')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Browse Available Certifications
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}