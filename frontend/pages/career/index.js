import React, { useState } from 'react';
import Head from 'next/head';
import { TrendingUp, Target, BookOpen, Award, Users, Calendar, Star, Crown, CheckCircle, ArrowRight } from 'lucide-react';
import PageHeader from '../../components/PageHeader';

export default function CareerDevelopment() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedGoal, setSelectedGoal] = useState(null);

  const careerStats = {
    current_level: 'Senior Developer',
    experience_years: 5.2,
    skills_mastered: 23,
    certifications: 4,
    career_score: 847,
    next_milestone: 'Tech Lead',
    progress_to_next: 0.68
  };

  const skillCategories = [
    {
      category: 'Technical Skills',
      skills: [
        { name: 'JavaScript', level: 9, trend: '+0.5', demand: 'high', salary_impact: '+15%' },
        { name: 'React', level: 8, trend: '+0.3', demand: 'high', salary_impact: '+12%' },
        { name: 'Node.js', level: 7, trend: '+0.8', demand: 'high', salary_impact: '+10%' },
        { name: 'Python', level: 6, trend: '+1.2', demand: 'very high', salary_impact: '+18%' },
        { name: 'AWS', level: 5, trend: '+1.5', demand: 'very high', salary_impact: '+22%' },
        { name: 'Docker', level: 4, trend: '+0.9', demand: 'high', salary_impact: '+8%' }
      ]
    },
    {
      category: 'Leadership Skills',
      skills: [
        { name: 'Team Management', level: 6, trend: '+0.7', demand: 'high', salary_impact: '+25%' },
        { name: 'Project Planning', level: 7, trend: '+0.4', demand: 'high', salary_impact: '+15%' },
        { name: 'Mentoring', level: 5, trend: '+0.6', demand: 'medium', salary_impact: '+12%' },
        { name: 'Strategic Thinking', level: 4, trend: '+0.8', demand: 'high', salary_impact: '+20%' }
      ]
    },
    {
      category: 'Business Skills',
      skills: [
        { name: 'Product Strategy', level: 5, trend: '+0.5', demand: 'high', salary_impact: '+18%' },
        { name: 'Data Analysis', level: 6, trend: '+0.3', demand: 'very high', salary_impact: '+16%' },
        { name: 'Communication', level: 8, trend: '+0.2', demand: 'high', salary_impact: '+10%' },
        { name: 'Stakeholder Management', level: 4, trend: '+0.9', demand: 'high', salary_impact: '+14%' }
      ]
    }
  ];

  const careerGoals = [
    {
      id: 1,
      title: 'Become Tech Lead',
      description: 'Lead a team of 5-8 developers and drive technical decisions',
      target_date: '2024-06-01',
      progress: 0.68,
      priority: 'high',
      category: 'promotion',
      milestones: [
        { task: 'Complete leadership training', completed: true },
        { task: 'Lead 2 major projects', completed: true },
        { task: 'Mentor 3 junior developers', completed: false },
        { task: 'Present technical strategy to executives', completed: false },
        { task: 'Get 360-degree feedback score >4.5', completed: false }
      ],
      required_skills: ['Team Management', 'Strategic Thinking', 'Mentoring'],
      estimated_salary_increase: '25-35%'
    },
    {
      id: 2,
      title: 'Master Cloud Architecture',
      description: 'Become proficient in AWS/Azure cloud architecture and DevOps',
      target_date: '2024-04-15',
      progress: 0.45,
      priority: 'high',
      category: 'skill',
      milestones: [
        { task: 'Complete AWS Solutions Architect certification', completed: false },
        { task: 'Design and implement microservices architecture', completed: false },
        { task: 'Set up CI/CD pipeline for 3 projects', completed: true },
        { task: 'Lead cloud migration project', completed: false }
      ],
      required_skills: ['AWS', 'Docker', 'System Design'],
      estimated_salary_increase: '20-30%'
    },
    {
      id: 3,
      title: 'Expand Network in Tech Industry',
      description: 'Build relationships with 50+ industry professionals',
      target_date: '2024-12-31',
      progress: 0.32,
      priority: 'medium',
      category: 'networking',
      milestones: [
        { task: 'Attend 6 tech conferences', completed: false },
        { task: 'Speak at 2 industry events', completed: false },
        { task: 'Connect with 20 senior engineers', completed: true },
        { task: 'Join 3 professional communities', completed: true },
        { task: 'Publish 5 technical articles', completed: false }
      ],
      required_skills: ['Communication', 'Personal Branding'],
      estimated_salary_increase: '10-15%'
    }
  ];

  const learningPaths = [
    {
      id: 1,
      title: 'Leadership Excellence Track',
      description: 'Comprehensive program for technical leaders',
      duration: '6 months',
      modules: 8,
      difficulty: 'advanced',
      provider: 'Tech Leadership Institute',
      rating: 4.8,
      enrolled: 1247,
      skills_covered: ['Team Management', 'Strategic Thinking', 'Communication'],
      certification: true
    },
    {
      id: 2,
      title: 'Cloud Architecture Mastery',
      description: 'Deep dive into modern cloud architecture patterns',
      duration: '4 months',
      modules: 12,
      difficulty: 'intermediate',
      provider: 'Cloud Academy',
      rating: 4.9,
      enrolled: 2156,
      skills_covered: ['AWS', 'System Design', 'DevOps'],
      certification: true
    },
    {
      id: 3,
      title: 'Data Science for Engineers',
      description: 'Apply data science techniques to engineering problems',
      duration: '3 months',
      modules: 10,
      difficulty: 'intermediate',
      provider: 'DataCamp Pro',
      rating: 4.7,
      enrolled: 892,
      skills_covered: ['Python', 'Data Analysis', 'Machine Learning'],
      certification: true
    }
  ];

  const industryInsights = {
    salary_trends: {
      current_role: '$95,000',
      market_average: '$98,500',
      top_10_percent: '$135,000',
      growth_projection: '+8% annually'
    },
    in_demand_skills: [
      { skill: 'AI/Machine Learning', growth: '+45%', avg_salary: '$125,000' },
      { skill: 'Cloud Architecture', growth: '+38%', avg_salary: '$118,000' },
      { skill: 'DevOps/SRE', growth: '+32%', avg_salary: '$112,000' },
      { skill: 'Cybersecurity', growth: '+28%', avg_salary: '$108,000' },
      { skill: 'Data Engineering', growth: '+25%', avg_salary: '$115,000' }
    ],
    career_opportunities: [
      {
        title: 'Senior Software Engineer',
        company: 'TechCorp Inc.',
        location: 'San Francisco, CA',
        salary: '$120,000 - $150,000',
        match_score: 0.92,
        skills_match: ['JavaScript', 'React', 'Node.js', 'AWS']
      },
      {
        title: 'Technical Lead',
        company: 'Innovation Labs',
        location: 'Austin, TX',
        salary: '$130,000 - $160,000',
        match_score: 0.85,
        skills_match: ['Team Management', 'Python', 'System Design']
      },
      {
        title: 'Cloud Solutions Architect',
        company: 'CloudFirst Solutions',
        location: 'Remote',
        salary: '$140,000 - $170,000',
        match_score: 0.78,
        skills_match: ['AWS', 'Docker', 'System Design']
      }
    ]
  };

  const getSkillColor = (level) => {
    if (level >= 8) return 'bg-green-500';
    if (level >= 6) return 'bg-yellow-500';
    if (level >= 4) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getDemandColor = (demand) => {
    switch (demand) {
      case 'very high': return 'text-green-700 bg-green-100';
      case 'high': return 'text-blue-700 bg-blue-100';
      case 'medium': return 'text-yellow-700 bg-yellow-100';
      case 'low': return 'text-gray-700 bg-gray-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <>
      <Head>
        <title>Career Development - Digame</title>
        <meta name="description" content="Accelerate your career growth with personalized insights" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <PageHeader 
          title="Career Development"
          subtitle="Accelerate your professional growth with AI-powered insights"
          icon={<TrendingUp className="w-6 h-6 text-green-600" />}
          badge="CAREER"
        />

        <div className="container mx-auto px-4 py-8">
          {/* Career Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Career Level</p>
                  <p className="text-xl font-bold text-gray-900">{careerStats.current_level}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm text-blue-600">
                  <Crown className="w-4 h-4 mr-1" />
                  {careerStats.experience_years} years experience
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Skills Mastered</p>
                  <p className="text-xl font-bold text-gray-900">{careerStats.skills_mastered}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm text-green-600">
                  <Award className="w-4 h-4 mr-1" />
                  {careerStats.certifications} certifications
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Career Score</p>
                  <p className="text-xl font-bold text-gray-900">{careerStats.career_score}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Star className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm text-purple-600">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  Top 15% in your field
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Next Milestone</p>
                  <p className="text-xl font-bold text-gray-900">{careerStats.next_milestone}</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Target className="w-6 h-6 text-orange-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-orange-600 h-2 rounded-full" 
                    style={{ width: `${careerStats.progress_to_next * 100}%` }}
                  ></div>
                </div>
                <div className="text-sm text-orange-600 mt-1">
                  {Math.round(careerStats.progress_to_next * 100)}% complete
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-white rounded-lg shadow-sm mb-8">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: 'overview', label: 'Overview', icon: <TrendingUp className="w-4 h-4" /> },
                  { id: 'skills', label: 'Skills', icon: <Target className="w-4 h-4" /> },
                  { id: 'goals', label: 'Goals', icon: <CheckCircle className="w-4 h-4" /> },
                  { id: 'learning', label: 'Learning', icon: <BookOpen className="w-4 h-4" /> },
                  { id: 'opportunities', label: 'Opportunities', icon: <Star className="w-4 h-4" /> }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
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
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  {/* Salary Insights */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Salary Insights</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="text-lg font-bold text-blue-600">{industryInsights.salary_trends.current_role}</div>
                        <div className="text-sm text-blue-700">Your Current Range</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="text-lg font-bold text-green-600">{industryInsights.salary_trends.market_average}</div>
                        <div className="text-sm text-green-700">Market Average</div>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4">
                        <div className="text-lg font-bold text-purple-600">{industryInsights.salary_trends.top_10_percent}</div>
                        <div className="text-sm text-purple-700">Top 10%</div>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-4">
                        <div className="text-lg font-bold text-orange-600">{industryInsights.salary_trends.growth_projection}</div>
                        <div className="text-sm text-orange-700">Growth Projection</div>
                      </div>
                    </div>
                  </div>

                  {/* In-Demand Skills */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">High-Demand Skills</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {industryInsights.in_demand_skills.map((skill, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{skill.skill}</h4>
                            <span className="text-sm font-medium text-green-600">{skill.growth}</span>
                          </div>
                          <div className="text-sm text-gray-600">Avg. Salary: {skill.avg_salary}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Skills Tab */}
              {activeTab === 'skills' && (
                <div className="space-y-8">
                  {skillCategories.map((category, categoryIndex) => (
                    <div key={categoryIndex}>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">{category.category}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {category.skills.map((skill, skillIndex) => (
                          <div key={skillIndex} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium text-gray-900">{skill.name}</h4>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-green-600">{skill.trend}</span>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDemandColor(skill.demand)}`}>
                                  {skill.demand}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-gray-600">Proficiency</span>
                              <span className="text-sm font-medium text-gray-900">{skill.level}/10</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                              <div 
                                className={`h-2 rounded-full ${getSkillColor(skill.level)}`}
                                style={{ width: `${skill.level * 10}%` }}
                              ></div>
                            </div>
                            <div className="text-sm text-blue-600">Salary Impact: {skill.salary_impact}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Goals Tab */}
              {activeTab === 'goals' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Career Goals</h3>
                    <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      <Target className="w-4 h-4" />
                      <span>Add Goal</span>
                    </button>
                  </div>

                  <div className="space-y-6">
                    {careerGoals.map((goal) => (
                      <div key={goal.id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="font-semibold text-gray-900">{goal.title}</h4>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(goal.priority)}`}>
                                {goal.priority} priority
                              </span>
                            </div>
                            <p className="text-gray-600 mb-3">{goal.description}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>Target: {new Date(goal.target_date).toLocaleDateString()}</span>
                              <span>Salary Impact: {goal.estimated_salary_increase}</span>
                            </div>
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Progress</span>
                            <span className="text-sm font-medium text-gray-900">{Math.round(goal.progress * 100)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${goal.progress * 100}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h5 className="font-medium text-gray-900">Milestones</h5>
                          {goal.milestones.map((milestone, index) => (
                            <div key={index} className="flex items-center space-x-3">
                              <CheckCircle className={`w-4 h-4 ${milestone.completed ? 'text-green-600' : 'text-gray-400'}`} />
                              <span className={`text-sm ${milestone.completed ? 'text-gray-900 line-through' : 'text-gray-700'}`}>
                                {milestone.task}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex items-center justify-between">
                            <div className="flex flex-wrap gap-2">
                              {goal.required_skills.map((skill, index) => (
                                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                  {skill}
                                </span>
                              ))}
                            </div>
                            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                              View Details <ArrowRight className="w-4 h-4 inline ml-1" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Learning Tab */}
              {activeTab === 'learning' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Recommended Learning Paths</h3>
                    <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      <BookOpen className="w-4 h-4" />
                      <span>Browse All Courses</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {learningPaths.map((path) => (
                      <div key={path.id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-2">{path.title}</h4>
                            <p className="text-gray-600 mb-3">{path.description}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                              <span>{path.duration}</span>
                              <span>{path.modules} modules</span>
                              <span>{path.enrolled.toLocaleString()} enrolled</span>
                            </div>
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(path.difficulty)}`}>
                            {path.difficulty}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2 mb-4">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-4 h-4 ${i < Math.floor(path.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                            ))}
                          </div>
                          <span className="text-sm text-gray-600">{path.rating}</span>
                          {path.certification && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              Certificate
                            </span>
                          )}
                        </div>

                        <div className="mb-4">
                          <h5 className="text-sm font-medium text-gray-900 mb-2">Skills Covered</h5>
                          <div className="flex flex-wrap gap-2">
                            {path.skills_covered.map((skill, index) => (
                              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">by {path.provider}</span>
                          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                            Enroll Now
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Opportunities Tab */}
              {activeTab === 'opportunities' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Career Opportunities</h3>
                  
                  <div className="space-y-6">
                    {industryInsights.career_opportunities.map((opportunity, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="font-semibold text-gray-900">{opportunity.title}</h4>
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                {Math.round(opportunity.match_score * 100)}% match
                              </span>
                            </div>
                            <div className="text-gray-600 mb-2">{opportunity.company} • {opportunity.location}</div>
                            <div className="text-lg font-semibold text-green-600 mb-3">{opportunity.salary}</div>
                          </div>
                        </div>

                        <div className="mb-4">
                          <h5 className="text-sm font-medium text-gray-900 mb-2">Matching Skills</h5>
                          <div className="flex flex-wrap gap-2">
                            {opportunity.skills_match.map((skill, skillIndex) => (
                              <span key={skillIndex} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex space-x-3">
                          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                            View Details
                          </button>
                          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">
                            Save for Later
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}