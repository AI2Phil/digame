import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import PageHeader from '../../src/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../src/components/ui/card';
import { Button } from '../../src/components/ui/button';
import { Badge } from '../../src/components/ui/badge';
import { Textarea } from '../../src/components/ui/textarea';
import { Input } from '../../src/components/ui/input';
import { Progress } from '../../src/components/ui/progress';
import { 
  Globe, 
  Mic, 
  Volume2, 
  BookOpen, 
  Brain, 
  Target, 
  Star,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  BarChart3,
  Users,
  Calendar,
  Award,
  Zap,
  MessageSquare,
  FileText
} from 'lucide-react';

const LanguageLearning = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('practice');
  const [selectedLanguage, setSelectedLanguage] = useState('spanish');
  const [currentText, setCurrentText] = useState('');
  const [translation, setTranslation] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [learningData, setLearningData] = useState(null);

  useEffect(() => {
    fetchLearningData();
  }, [selectedLanguage]);

  const fetchLearningData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/ai-tools/language?lang=${selectedLanguage}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setLearningData(data);
      }
    } catch (error) {
      console.error('Error fetching language data:', error);
    } finally {
      setLoading(false);
    }
  };

  const translateText = async () => {
    if (!currentText.trim()) return;

    try {
      setLoading(true);
      const response = await fetch('/api/ai-tools/language', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          text: currentText,
          targetLanguage: selectedLanguage,
          action: 'translate'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setTranslation(data.translation);
      }
    } catch (error) {
      console.error('Error translating text:', error);
    } finally {
      setLoading(false);
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    // Implement voice recording logic
  };

  const stopRecording = () => {
    setIsRecording(false);
    // Process recorded audio
  };

  const playAudio = (text) => {
    setIsPlaying(true);
    // Implement text-to-speech
    setTimeout(() => setIsPlaying(false), 2000);
  };

  const mockLearningData = {
    profile: {
      currentLanguage: 'Spanish',
      level: 'Intermediate',
      streak: 15,
      totalLessons: 47,
      completedLessons: 32,
      accuracy: 87.5,
      weeklyGoal: 5,
      weeklyProgress: 3
    },
    languages: [
      { code: 'spanish', name: 'Spanish', flag: '🇪🇸', progress: 68, level: 'Intermediate' },
      { code: 'french', name: 'French', flag: '🇫🇷', progress: 34, level: 'Beginner' },
      { code: 'german', name: 'German', flag: '🇩🇪', progress: 12, level: 'Beginner' },
      { code: 'italian', name: 'Italian', flag: '🇮🇹', progress: 8, level: 'Beginner' },
      { code: 'portuguese', name: 'Portuguese', flag: '🇵🇹', progress: 0, level: 'Not Started' },
      { code: 'mandarin', name: 'Mandarin', flag: '🇨🇳', progress: 0, level: 'Not Started' }
    ],
    currentLesson: {
      title: 'Restaurant Conversations',
      type: 'Dialogue Practice',
      difficulty: 'Intermediate',
      estimatedTime: 15,
      topics: ['Food', 'Ordering', 'Polite Expressions'],
      progress: 60
    },
    vocabulary: {
      learned: 342,
      reviewing: 28,
      mastered: 267,
      newWords: 47,
      weeklyTarget: 50
    },
    achievements: [
      { id: 1, name: '15-Day Streak', icon: '🔥', earned: true, date: 'Today' },
      { id: 2, name: 'Conversation Master', icon: '💬', earned: true, date: '2 days ago' },
      { id: 3, name: 'Grammar Guru', icon: '📚', earned: false, progress: 75 },
      { id: 4, name: 'Pronunciation Pro', icon: '🎤', earned: false, progress: 45 }
    ],
    practiceExercises: [
      {
        id: 1,
        type: 'translation',
        question: 'How do you say "I would like to order" in Spanish?',
        options: ['Me gustaría pedir', 'Quiero comer', 'Tengo hambre', 'Está bien'],
        correct: 0,
        difficulty: 'Medium'
      },
      {
        id: 2,
        type: 'listening',
        question: 'Listen and select the correct translation',
        audio: 'spanish_audio_1.mp3',
        options: ['Good morning', 'Good afternoon', 'Good evening', 'Good night'],
        correct: 1,
        difficulty: 'Easy'
      },
      {
        id: 3,
        type: 'speaking',
        question: 'Pronounce: "¿Dónde está el baño?"',
        expectedText: '¿Dónde está el baño?',
        difficulty: 'Medium'
      }
    ],
    insights: [
      'Your pronunciation has improved 23% this week',
      'Focus on verb conjugations for faster progress',
      'Practice listening exercises to improve comprehension',
      'You learn best in the morning sessions'
    ],
    recommendations: [
      'Try conversation practice with native speakers',
      'Review vocabulary cards daily for better retention',
      'Set aside 20 minutes daily for consistent progress',
      'Use the mobile app for practice on the go'
    ]
  };

  const currentData = learningData || mockLearningData;

  const getProgressColor = (progress) => {
    if (progress >= 70) return 'text-green-600';
    if (progress >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getLevelColor = (level) => {
    switch (level.toLowerCase()) {
      case 'advanced': return 'default';
      case 'intermediate': return 'secondary';
      case 'beginner': return 'outline';
      default: return 'destructive';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Language Learning AI"
        subtitle="AI-powered language learning with personalized lessons and practice"
        icon={<Globe className="h-8 w-8" />}
        breadcrumb={[
          { label: 'AI Tools', href: '/ai-tools' },
          { label: 'Language', href: '/ai-tools/language' }
        ]}
        actions={
          <div className="flex gap-2">
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {currentData.languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>
        }
      />

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('practice')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'practice'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Brain className="h-4 w-4 inline mr-2" />
          Practice
        </button>
        <button
          onClick={() => setActiveTab('translate')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'translate'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Globe className="h-4 w-4 inline mr-2" />
          Translate
        </button>
        <button
          onClick={() => setActiveTab('lessons')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'lessons'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <BookOpen className="h-4 w-4 inline mr-2" />
          Lessons
        </button>
        <button
          onClick={() => setActiveTab('progress')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'progress'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <BarChart3 className="h-4 w-4 inline mr-2" />
          Progress
        </button>
      </div>

      {activeTab === 'practice' && (
        <div className="space-y-6">
          {/* Learning Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Current Streak</p>
                    <p className="text-2xl font-bold text-orange-600">{currentData.profile.streak}</p>
                    <p className="text-xs text-gray-500">days</p>
                  </div>
                  <div className="text-2xl">🔥</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Accuracy</p>
                    <p className="text-2xl font-bold text-green-600">{currentData.profile.accuracy}%</p>
                  </div>
                  <Target className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Vocabulary</p>
                    <p className="text-2xl font-bold text-purple-600">{currentData.vocabulary.learned}</p>
                    <p className="text-xs text-gray-500">words learned</p>
                  </div>
                  <BookOpen className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Weekly Goal</p>
                    <p className="text-2xl font-bold text-blue-600">{currentData.profile.weeklyProgress}/{currentData.profile.weeklyGoal}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Practice Exercises */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Practice Exercises
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {currentData.practiceExercises.map((exercise, index) => (
                  <div key={exercise.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="outline" className="capitalize">
                        {exercise.type}
                      </Badge>
                      <Badge variant={exercise.difficulty === 'Easy' ? 'default' : exercise.difficulty === 'Medium' ? 'secondary' : 'destructive'}>
                        {exercise.difficulty}
                      </Badge>
                    </div>
                    
                    <h4 className="font-medium mb-3">{exercise.question}</h4>
                    
                    {exercise.type === 'translation' && (
                      <div className="space-y-2">
                        {exercise.options.map((option, optIndex) => (
                          <button
                            key={optIndex}
                            className="w-full p-2 text-left border rounded hover:bg-gray-50"
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {exercise.type === 'listening' && (
                      <div className="space-y-3">
                        <Button variant="outline" className="w-full">
                          <Play className="h-4 w-4 mr-2" />
                          Play Audio
                        </Button>
                        <div className="space-y-2">
                          {exercise.options.map((option, optIndex) => (
                            <button
                              key={optIndex}
                              className="w-full p-2 text-left border rounded hover:bg-gray-50"
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {exercise.type === 'speaking' && (
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <Button
                            variant={isRecording ? 'destructive' : 'default'}
                            onClick={isRecording ? stopRecording : startRecording}
                            className="flex-1"
                          >
                            <Mic className="h-4 w-4 mr-2" />
                            {isRecording ? 'Stop Recording' : 'Start Recording'}
                          </Button>
                          <Button variant="outline" onClick={() => playAudio(exercise.expectedText)}>
                            <Volume2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-gray-600">Expected: {exercise.expectedText}</p>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Current Lesson */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Current Lesson
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">{currentData.currentLesson.title}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary">{currentData.currentLesson.type}</Badge>
                    <Badge variant={getLevelColor(currentData.currentLesson.difficulty)}>
                      {currentData.currentLesson.difficulty}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{currentData.currentLesson.progress}%</span>
                  </div>
                  <Progress value={currentData.currentLesson.progress} className="h-2" />
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Topics covered:</p>
                  <div className="flex flex-wrap gap-1">
                    {currentData.currentLesson.topics.map((topic, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>Estimated time: {currentData.currentLesson.estimatedTime} minutes</span>
                </div>

                <Button className="w-full">
                  Continue Lesson
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {currentData.achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`p-4 border rounded-lg text-center ${
                      achievement.earned ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="text-3xl mb-2">{achievement.icon}</div>
                    <h4 className="font-medium text-sm">{achievement.name}</h4>
                    {achievement.earned ? (
                      <p className="text-xs text-green-600 mt-1">Earned {achievement.date}</p>
                    ) : (
                      <div className="mt-2">
                        <Progress value={achievement.progress} className="h-1" />
                        <p className="text-xs text-gray-500 mt-1">{achievement.progress}% complete</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'translate' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                AI Translator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">From (Auto-detect)</label>
                  <Textarea
                    placeholder="Enter text to translate..."
                    value={currentText}
                    onChange={(e) => setCurrentText(e.target.value)}
                    rows={6}
                  />
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => playAudio(currentText)}>
                      <Volume2 className="h-4 w-4 mr-1" />
                      Listen
                    </Button>
                    <Button variant="outline" size="sm" onClick={startRecording}>
                      <Mic className="h-4 w-4 mr-1" />
                      Voice Input
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    To ({currentData.languages.find(l => l.code === selectedLanguage)?.name})
                  </label>
                  <Textarea
                    placeholder="Translation will appear here..."
                    value={translation}
                    readOnly
                    rows={6}
                    className="bg-gray-50"
                  />
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => playAudio(translation)}>
                      <Volume2 className="h-4 w-4 mr-1" />
                      Listen
                    </Button>
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-1" />
                      Copy
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <Button onClick={translateText} disabled={loading || !currentText.trim()}>
                  {loading ? 'Translating...' : 'Translate'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Phrases */}
          <Card>
            <CardHeader>
              <CardTitle>Common Phrases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  'Hello, how are you?',
                  'Thank you very much',
                  'Where is the bathroom?',
                  'How much does this cost?',
                  'I don\'t understand',
                  'Can you help me?',
                  'What time is it?',
                  'I would like to order',
                  'Excuse me',
                  'Have a good day'
                ].map((phrase, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="justify-start h-auto p-3"
                    onClick={() => setCurrentText(phrase)}
                  >
                    <div className="text-left">
                      <div className="text-sm">{phrase}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'lessons' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentData.languages
            .filter(lang => lang.progress > 0)
            .map((language) => (
              <Card key={language.code} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <span className="text-2xl">{language.flag}</span>
                    <div>
                      <h3 className="font-medium">{language.name}</h3>
                      <Badge variant={getLevelColor(language.level)}>
                        {language.level}
                      </Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span className={getProgressColor(language.progress)}>{language.progress}%</span>
                    </div>
                    <Progress value={language.progress} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <Button className="w-full">Continue Learning</Button>
                    <Button variant="outline" className="w-full">
                      Practice Vocabulary
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}

      {activeTab === 'progress' && (
        <div className="space-y-6">
          {/* Progress Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Lessons</p>
                    <p className="text-2xl font-bold">{currentData.profile.completedLessons}/{currentData.profile.totalLessons}</p>
                  </div>
                  <BookOpen className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Words Mastered</p>
                    <p className="text-2xl font-bold text-green-600">{currentData.vocabulary.mastered}</p>
                  </div>
                  <Star className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Current Level</p>
                    <p className="text-lg font-bold text-purple-600">{currentData.profile.level}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Study Streak</p>
                    <p className="text-2xl font-bold text-orange-600">{currentData.profile.streak}</p>
                  </div>
                  <Zap className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Insights and Recommendations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Learning Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentData.insights.map((insight, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                      <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{insight}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentData.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{recommendation}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Vocabulary Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Vocabulary Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{currentData.vocabulary.learned}</div>
                  <div className="text-sm text-gray-600">Total Learned</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{currentData.vocabulary.mastered}</div>
                  <div className="text-sm text-gray-600">Mastered</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600">{currentData.vocabulary.reviewing}</div>
                  <div className="text-sm text-gray-600">Reviewing</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{currentData.vocabulary.newWords}</div>
                  <div className="text-sm text-gray-600">New This Week</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default LanguageLearning;