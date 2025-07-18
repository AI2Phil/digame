import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function HowItWorks() {
  return (
    <>
      <Head>
        <title>How it Works - Digame</title>
        <meta
          name="description"
          content="Learn how Digame creates your digital professional twin and transforms your career."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Navigation */}
        <nav className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">D</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Digame</span>
            </Link>
            <div className="hidden md:flex space-x-8">
              <Link href="/features" className="text-gray-600 hover:text-gray-900">
                Features
              </Link>
              <Link href="/how-it-works" className="text-blue-600 font-medium">
                How it Works
              </Link>
              <Link href="/pricing" className="text-gray-600 hover:text-gray-900">
                Pricing
              </Link>
            </div>
            <Link
              href="/"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              🚀 Get Started
            </Link>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              How Digame
              <span className="text-blue-600"> Works</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover the simple 4-step process that creates your digital professional twin and
              accelerates your career growth.
            </p>
          </div>

          {/* Steps */}
          <div className="max-w-6xl mx-auto">
            {/* Step 1 */}
            <div className="flex flex-col lg:flex-row items-center mb-20">
              <div className="lg:w-1/2 lg:pr-12 mb-8 lg:mb-0">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                    1
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">Connect Your Data</h2>
                </div>
                <p className="text-lg text-gray-600 mb-6">
                  Securely connect your professional tools and platforms. Digame integrates with
                  your calendar, email, project management tools, and more to understand your work
                  patterns.
                </p>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>Calendar integration (Google,
                    Outlook)
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>Email analysis (Gmail, Outlook)
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>Project tools (Slack, Asana,
                    Trello)
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>Code repositories (GitHub, GitLab)
                  </li>
                </ul>
              </div>
              <div className="lg:w-1/2">
                <div className="bg-white rounded-2xl p-8 shadow-xl">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                      <div className="text-2xl mb-2">📅</div>
                      <div className="text-sm font-medium">Calendar</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                      <div className="text-2xl mb-2">📧</div>
                      <div className="text-sm font-medium">Email</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg text-center">
                      <div className="text-2xl mb-2">💬</div>
                      <div className="text-sm font-medium">Slack</div>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg text-center">
                      <div className="text-2xl mb-2">📊</div>
                      <div className="text-sm font-medium">Projects</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col lg:flex-row-reverse items-center mb-20">
              <div className="lg:w-1/2 lg:pl-12 mb-8 lg:mb-0">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                    2
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">AI Analysis</h2>
                </div>
                <p className="text-lg text-gray-600 mb-6">
                  Our advanced AI algorithms analyze your data to understand your work patterns,
                  communication style, productivity habits, and professional strengths.
                </p>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>Behavioral pattern recognition
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>Communication style analysis
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>Productivity optimization
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>Skill assessment
                  </li>
                </ul>
              </div>
              <div className="lg:w-1/2">
                <div className="bg-white rounded-2xl p-8 shadow-xl">
                  <div className="text-center mb-6">
                    <div className="text-4xl mb-4">🧠</div>
                    <div className="text-lg font-semibold">AI Processing</div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2 mr-3">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: '95%' }}
                        ></div>
                      </div>
                      <span className="text-sm">95%</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2 mr-3">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: '88%' }}
                        ></div>
                      </div>
                      <span className="text-sm">88%</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2 mr-3">
                        <div
                          className="bg-purple-600 h-2 rounded-full"
                          style={{ width: '92%' }}
                        ></div>
                      </div>
                      <span className="text-sm">92%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col lg:flex-row items-center mb-20">
              <div className="lg:w-1/2 lg:pr-12 mb-8 lg:mb-0">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                    3
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">Digital Twin Creation</h2>
                </div>
                <p className="text-lg text-gray-600 mb-6">
                  Your digital professional twin is created - a comprehensive model that represents
                  your work style, skills, goals, and career trajectory.
                </p>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>Personalized professional profile
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>Skill and competency mapping
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>Career trajectory modeling
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>Goal alignment analysis
                  </li>
                </ul>
              </div>
              <div className="lg:w-1/2">
                <div className="bg-white rounded-2xl p-8 shadow-xl">
                  <div className="text-center mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white font-bold text-2xl">You</span>
                    </div>
                    <div className="text-lg font-semibold">Your Digital Twin</div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-blue-50 p-3 rounded text-center">
                      <div className="font-medium">Productivity</div>
                      <div className="text-blue-600 font-bold">87%</div>
                    </div>
                    <div className="bg-green-50 p-3 rounded text-center">
                      <div className="font-medium">Skills</div>
                      <div className="text-green-600 font-bold">15+</div>
                    </div>
                    <div className="bg-purple-50 p-3 rounded text-center">
                      <div className="font-medium">Goals</div>
                      <div className="text-purple-600 font-bold">8</div>
                    </div>
                    <div className="bg-orange-50 p-3 rounded text-center">
                      <div className="font-medium">Growth</div>
                      <div className="text-orange-600 font-bold">+12%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col lg:flex-row-reverse items-center mb-20">
              <div className="lg:w-1/2 lg:pl-12 mb-8 lg:mb-0">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                    4
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">Continuous Growth</h2>
                </div>
                <p className="text-lg text-gray-600 mb-6">
                  Receive personalized insights, recommendations, and coaching to accelerate your
                  professional growth and achieve your career goals.
                </p>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>Daily productivity insights
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>Personalized recommendations
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>Goal tracking and optimization
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>Career coaching and guidance
                  </li>
                </ul>
              </div>
              <div className="lg:w-1/2">
                <div className="bg-white rounded-2xl p-8 shadow-xl">
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <span className="text-blue-600 mr-2">💡</span>
                        <span className="font-medium">Today's Insight</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Your focus time is 23% higher on Tuesdays. Schedule important tasks
                        accordingly.
                      </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <span className="text-green-600 mr-2">🎯</span>
                        <span className="font-medium">Goal Progress</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        You're 78% towards your Q1 productivity goal. Keep up the great work!
                      </p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <span className="text-purple-600 mr-2">🚀</span>
                        <span className="font-medium">Recommendation</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Consider learning React.js to enhance your frontend development skills.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center bg-white rounded-2xl p-12 shadow-xl">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Create Your Digital Twin?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Join thousands of professionals who are already accelerating their careers with
              Digame.
            </p>
            <Link
              href="/"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors text-lg inline-block"
            >
              🚀 Start Your Journey
            </Link>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-8 mt-16">
          <div className="container mx-auto px-4 text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">D</span>
              </div>
              <span className="text-lg font-bold">Digame</span>
            </div>
            <p className="text-gray-400">
              © 2025 Digame. Your Digital Professional Twin Platform.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
