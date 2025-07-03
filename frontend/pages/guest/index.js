import React, { useState } from 'react';
import Head from 'next/head';
import { UserPlus, Eye, TrendingUp, Zap, ArrowRight, Play, CheckCircle, Star, Users, BarChart3 } from 'lucide-react';
import PageHeader from '../../src/components/navigation/PageHeader';

export default function GuestDashboard() {
  const [activeDemo, setActiveDemo] = useState(null);

  const guestStats = {
    totalVisitors: 15847,
    conversionRate: 12.4,
    averageSessionTime: '4:32',
    topFeatures: ['Analytics', 'AI Tools', 'Digital Twin'],
    signupsToday: 23,
    activeTrials: 156
  };

  const featuredCapabilities = [
    {
      id: 'analytics',
      title: 'Advanced Analytics',
      description: 'Get deep insights into your data with AI-powered analytics and visualization tools',
      icon: BarChart3,
      demoUrl: '/demo/analytics',
      benefits: ['Real-time dashboards', 'Predictive insights', 'Custom reports'],
      tier: 'Individual Pro',
      popular: true
    },
    {
      id: 'digital-twin',
      title: 'Digital Twin AI',
      description: 'Create your personal AI assistant that learns and adapts to your work patterns',
      icon: Users,
      demoUrl: '/demo/digital-twin',
      benefits: ['Personal AI assistant', 'Behavior modeling', 'Smart predictions'],
      tier: 'Individual Pro',
      popular: false
    },
    {
      id: 'automation',
      title: 'Workflow Automation',
      description: 'Automate repetitive tasks and streamline your workflows with intelligent automation',
      icon: Zap,
      demoUrl: '/demo/automation',
      benefits: ['Task automation', 'Smart workflows', 'Time savings'],
      tier: 'Team',
      popular: false
    },
    {
      id: 'collaboration',
      title: 'Team Collaboration',
      description: 'Enhance team productivity with advanced collaboration and communication tools',
      icon: Users,
      demoUrl: '/demo/collaboration',
      benefits: ['Real-time collaboration', 'Project management', 'Team insights'],
      tier: 'Team',
      popular: false
    }
  ];

  const testimonials = [
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'Product Manager',
      company: 'TechCorp',
      avatar: '/avatars/sarah.jpg',
      rating: 5,
      text: 'Digame transformed how our team works. The AI insights are incredible and have saved us hours every week.',
      tier: 'Team'
    },
    {
      id: 2,
      name: 'Michael Chen',
      role: 'Data Analyst',
      company: 'DataFlow Inc',
      avatar: '/avatars/michael.jpg',
      rating: 5,
      text: 'The analytics capabilities are outstanding. I can create complex reports in minutes instead of hours.',
      tier: 'Individual Pro'
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      role: 'CEO',
      company: 'StartupXYZ',
      avatar: '/avatars/emily.jpg',
      rating: 5,
      text: 'As a startup, we needed powerful tools without the enterprise price tag. Digame delivered exactly that.',
      tier: 'Enterprise'
    }
  ];

  const pricingTiers = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for getting started',
      features: ['Basic dashboard', 'Limited analytics', 'Community support'],
      cta: 'Start Free',
      popular: false
    },
    {
      name: 'Individual Pro',
      price: '$29',
      period: 'per month',
      description: 'For professionals and power users',
      features: ['Advanced analytics', 'AI tools', 'Digital twin', 'Priority support'],
      cta: 'Start Free Trial',
      popular: true
    },
    {
      name: 'Team',
      price: '$99',
      period: 'per month',
      description: 'For teams and small businesses',
      features: ['Everything in Pro', 'Team collaboration', 'Advanced workflows', 'Admin controls'],
      cta: 'Start Free Trial',
      popular: false
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'contact us',
      description: 'For large organizations',
      features: ['Everything in Team', 'Custom integrations', 'Dedicated support', 'SLA guarantee'],
      cta: 'Contact Sales',
      popular: false
    }
  ];

  const startDemo = (demoId) => {
    setActiveDemo(demoId);
    // In a real implementation, this would launch an interactive demo
    alert(`Starting ${demoId} demo... This would launch an interactive product tour.`);
  };

  const startTrial = (tier) => {
    // In a real implementation, this would redirect to signup with the selected tier
    alert(`Starting ${tier} trial... This would redirect to the signup process.`);
  };

  return (
    <>
      <Head>
        <title>Welcome to Digame - AI-Powered Productivity Platform</title>
        <meta name="description" content="Discover the power of AI-driven productivity tools and analytics" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <PageHeader 
          title="Welcome to Digame"
          subtitle="Discover the power of AI-driven productivity tools and analytics"
          icon={<Zap className="w-6 h-6 text-blue-600" />}
        />

        <div className="container mx-auto px-4 py-8">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white p-8 mb-8">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl font-bold mb-4">Transform Your Productivity with AI</h1>
              <p className="text-xl mb-6 opacity-90">
                Join thousands of professionals using Digame to automate workflows, gain insights, and boost productivity
              </p>
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={() => startTrial('Individual Pro')}
                  className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Start Free Trial
                </button>
                <button
                  onClick={() => startDemo('analytics')}
                  className="flex items-center space-x-2 px-6 py-3 border border-white text-white rounded-lg hover:bg-white hover:text-blue-600 transition-colors"
                >
                  <Play className="w-4 h-4" />
                  <span>Watch Demo</span>
                </button>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{guestStats.totalVisitors.toLocaleString()}</div>
              <div className="text-gray-600">Active Users</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{guestStats.conversionRate}%</div>
              <div className="text-gray-600">Conversion Rate</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">{guestStats.averageSessionTime}</div>
              <div className="text-gray-600">Avg. Session Time</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">{guestStats.signupsToday}</div>
              <div className="text-gray-600">Signups Today</div>
            </div>
          </div>

          {/* Featured Capabilities */}
          <div className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Powerful Features at Your Fingertips</h2>
              <p className="text-xl text-gray-600">Explore what makes Digame the productivity platform of choice</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {featuredCapabilities.map((capability) => (
                <div key={capability.id} className="bg-white rounded-lg shadow-sm p-6 relative">
                  {capability.popular && (
                    <div className="absolute -top-3 left-6">
                      <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <capability.icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{capability.title}</h3>
                      <p className="text-gray-600 mb-4">{capability.description}</p>
                      
                      <div className="space-y-2 mb-4">
                        {capability.benefits.map((benefit, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-sm text-gray-700">{benefit}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-blue-600 font-medium">
                          Available in {capability.tier}+
                        </span>
                        <button
                          onClick={() => startDemo(capability.id)}
                          className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
                        >
                          <span>Try Demo</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonials */}
          <div className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
              <p className="text-xl text-gray-600">Join thousands of satisfied customers</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  
                  <p className="text-gray-700 mb-4">"{testimonial.text}"</p>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-600">{testimonial.role}, {testimonial.company}</div>
                      <div className="text-xs text-blue-600">{testimonial.tier} user</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <div className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Plan</h2>
              <p className="text-xl text-gray-600">Start free, upgrade when you're ready</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {pricingTiers.map((tier) => (
                <div key={tier.name} className={`bg-white rounded-lg shadow-sm p-6 relative ${tier.popular ? 'ring-2 ring-blue-600' : ''}`}>
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}
                  
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{tier.name}</h3>
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      {tier.price}
                      {tier.period !== 'contact us' && <span className="text-lg text-gray-600">/{tier.period}</span>}
                    </div>
                    <p className="text-gray-600">{tier.description}</p>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    {tier.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => startTrial(tier.name)}
                    className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                      tier.popular
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {tier.cta}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
            <p className="text-gray-600 mb-6">
              Join thousands of professionals who have transformed their productivity with Digame
            </p>
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={() => startTrial('Individual Pro')}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Start Your Free Trial
              </button>
              <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}