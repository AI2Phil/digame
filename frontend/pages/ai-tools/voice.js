import React, { useState, useRef } from 'react';
import Head from 'next/head';
import { Mic, MicOff, Play, Pause, Download, Upload, Volume2, FileAudio, BarChart3 } from 'lucide-react';
import PageHeader from '../../components/PageHeader';

export default function VoiceProcessing() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioFile, setAudioFile] = useState(null);
  const [transcription, setTranscription] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [processingType, setProcessingType] = useState('transcribe');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  const processingOptions = [
    { id: 'transcribe', label: 'Speech to Text', icon: <FileAudio className="w-4 h-4" /> },
    { id: 'analyze', label: 'Voice Analysis', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'enhance', label: 'Audio Enhancement', icon: <Volume2 className="w-4 h-4" /> },
    { id: 'translate', label: 'Voice Translation', icon: <Volume2 className="w-4 h-4" /> }
  ];

  const mockTranscription = `Hello, this is a sample transcription of your audio. The AI has successfully converted your speech to text with high accuracy. This technology can be used for meeting notes, content creation, accessibility features, and much more. The system also provides confidence scores and timestamps for each segment.`;

  const mockAnalysis = {
    sentiment: {
      overall: 'positive',
      confidence: 0.87,
      emotions: [
        { emotion: 'confident', score: 0.82 },
        { emotion: 'enthusiastic', score: 0.76 },
        { emotion: 'calm', score: 0.68 },
        { emotion: 'professional', score: 0.91 }
      ]
    },
    voice_characteristics: {
      pitch: 'medium',
      pace: 'moderate',
      clarity: 'high',
      energy: 'medium-high'
    },
    speaking_patterns: {
      words_per_minute: 145,
      pause_frequency: 'normal',
      filler_words: 3,
      pronunciation_accuracy: 0.94
    },
    recommendations: [
      'Consider slightly slower pace for better comprehension',
      'Excellent clarity and pronunciation',
      'Good energy level for engagement',
      'Professional tone maintained throughout'
    ]
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('audio/')) {
      setAudioFile(file);
      setTranscription('');
      setAnalysis(null);
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    // Simulate recording - in real app, would use MediaRecorder API
    setTimeout(() => {
      setIsRecording(false);
      setAudioFile({ name: 'recorded_audio.wav', size: 1024000 });
    }, 3000);
  };

  const stopRecording = () => {
    setIsRecording(false);
  };

  const processAudio = async () => {
    if (!audioFile) return;
    
    setIsProcessing(true);
    
    // Simulate processing time
    setTimeout(() => {
      switch (processingType) {
        case 'transcribe':
          setTranscription(mockTranscription);
          break;
        case 'analyze':
          setAnalysis(mockAnalysis);
          break;
        case 'enhance':
          setTranscription('Audio enhancement completed. Noise reduced by 85%, clarity improved by 40%.');
          break;
        case 'translate':
          setTranscription('Translated text: Hola, esta es una transcripción de muestra de su audio...');
          break;
      }
      setIsProcessing(false);
    }, 2000);
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-100';
      case 'negative': return 'text-red-600 bg-red-100';
      case 'neutral': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <>
      <Head>
        <title>Voice Processing - AI Tools - Digame</title>
        <meta name="description" content="Advanced voice processing and analysis tools" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <PageHeader 
          title="Voice Processing"
          subtitle="Advanced speech-to-text, voice analysis, and audio enhancement"
          icon={<Mic className="w-6 h-6 text-purple-600" />}
          badge="AI VOICE"
        />

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Input Section */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Audio Input</h3>
                
                {/* Recording Controls */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-700 mb-3">Record Audio</h4>
                  <div className="flex items-center justify-center">
                    <button
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`p-4 rounded-full transition-all ${
                        isRecording 
                          ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                          : 'bg-blue-500 hover:bg-blue-600'
                      } text-white`}
                    >
                      {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                    </button>
                  </div>
                  {isRecording && (
                    <div className="text-center mt-2">
                      <p className="text-sm text-red-600 font-medium">Recording...</p>
                      <div className="flex justify-center mt-2">
                        <div className="flex space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className="w-1 bg-red-500 rounded-full animate-pulse"
                              style={{
                                height: `${Math.random() * 20 + 10}px`,
                                animationDelay: `${i * 0.1}s`
                              }}
                            ></div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* File Upload */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-700 mb-3">Upload Audio File</h4>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
                      Drag and drop an audio file, or click to browse
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="audio/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      Choose File
                    </button>
                  </div>
                  {audioFile && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <FileAudio className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">
                          {audioFile.name || 'Recorded Audio'}
                        </span>
                      </div>
                      {audioFile.size && (
                        <p className="text-xs text-blue-700 mt-1">
                          Size: {(audioFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Processing Options */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-700 mb-3">Processing Type</h4>
                  <div className="space-y-2">
                    {processingOptions.map((option) => (
                      <label key={option.id} className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name="processingType"
                          value={option.id}
                          checked={processingType === option.id}
                          onChange={(e) => setProcessingType(e.target.value)}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex items-center space-x-2">
                          {option.icon}
                          <span className="text-sm text-gray-700">{option.label}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Process Button */}
                <button
                  onClick={processAudio}
                  disabled={!audioFile || isProcessing}
                  className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      <span>Process Audio</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Results Section */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Results</h3>
                
                {!transcription && !analysis ? (
                  <div className="text-center py-12">
                    <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Upload or record audio and select processing type to see results</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Transcription Results */}
                    {transcription && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">
                          {processingType === 'transcribe' ? 'Transcription' : 
                           processingType === 'translate' ? 'Translation' : 'Processing Result'}
                        </h4>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-gray-700 leading-relaxed">{transcription}</p>
                        </div>
                        <div className="flex justify-end mt-3">
                          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                            <Download className="w-4 h-4" />
                            <span>Download Text</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Voice Analysis Results */}
                    {analysis && (
                      <div className="space-y-6">
                        {/* Sentiment Analysis */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Sentiment Analysis</h4>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-4">
                              <span className="text-sm text-gray-600">Overall Sentiment</span>
                              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getSentimentColor(analysis.sentiment.overall)}`}>
                                {analysis.sentiment.overall}
                              </span>
                            </div>
                            <div className="space-y-2">
                              {analysis.sentiment.emotions.map((emotion, index) => (
                                <div key={index} className="flex items-center justify-between">
                                  <span className="text-sm text-gray-700 capitalize">{emotion.emotion}</span>
                                  <div className="flex items-center space-x-2">
                                    <div className="w-24 bg-gray-200 rounded-full h-2">
                                      <div 
                                        className="bg-purple-600 h-2 rounded-full" 
                                        style={{ width: `${emotion.score * 100}%` }}
                                      ></div>
                                    </div>
                                    <span className="text-sm font-medium text-gray-900">
                                      {Math.round(emotion.score * 100)}%
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Voice Characteristics */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Voice Characteristics</h4>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="grid grid-cols-2 gap-4">
                              {Object.entries(analysis.voice_characteristics).map(([key, value]) => (
                                <div key={key} className="flex justify-between">
                                  <span className="text-sm text-gray-600 capitalize">{key.replace('_', ' ')}</span>
                                  <span className="text-sm font-medium text-gray-900 capitalize">{value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Speaking Patterns */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Speaking Patterns</h4>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="grid grid-cols-2 gap-4">
                              {Object.entries(analysis.speaking_patterns).map(([key, value]) => (
                                <div key={key} className="flex justify-between">
                                  <span className="text-sm text-gray-600 capitalize">{key.replace('_', ' ')}</span>
                                  <span className="text-sm font-medium text-gray-900">
                                    {typeof value === 'number' && value < 1 ? `${Math.round(value * 100)}%` : value}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Recommendations */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Recommendations</h4>
                          <div className="bg-blue-50 rounded-lg p-4">
                            <ul className="space-y-2">
                              {analysis.recommendations.map((rec, index) => (
                                <li key={index} className="flex items-start space-x-2">
                                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                                  <span className="text-sm text-blue-900">{rec}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}