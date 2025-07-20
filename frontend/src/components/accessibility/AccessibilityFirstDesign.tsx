import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Box,
import {
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Switch,
  FormControlLabel,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Chip,
  Alert,
  AlertTitle,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Fab,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Paper,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tabs,
  Tab,
  Badge,
  LinearProgress,
  CircularProgress,
  Skeleton,
  Snackbar,
  SnackbarContent
} from '@mui/material';
import {
  Accessibility as AccessibilityIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  VolumeUp as VolumeUpIcon,
  VolumeOff as VolumeOffIcon,
  Contrast as ContrastIcon,
  FormatSize as FontSizeIcon,
  Palette as PaletteIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
  KeyboardVoice as VoiceIcon,
  RecordVoiceOver as SpeechIcon,
  Hearing as HearingIcon,
  TouchApp as TouchIcon,
  Mouse as MouseIcon,
  Keyboard as KeyboardIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  HighlightAlt as HighlightIcon,
  CenterFocusStrong as FocusIcon,
  Speed as SpeedIcon,
  Timer as TimerIcon,
  Pause as PauseIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  SkipNext as NextIcon,
  SkipPrevious as PreviousIcon,
  Subtitles as SubtitlesIcon,
  ClosedCaption as CaptionsIcon,
  Translate as TranslateIcon,
  Language as LanguageIcon,
  TextFields as TextIcon,
  FormatBold as BoldIcon,
  FormatItalic as ItalicIcon,
  FormatUnderlined as UnderlineIcon,
  ColorLens as ColorIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';

// Accessibility preferences interface
export interface AccessibilityPreferences {
  // Visual preferences
  highContrast: boolean;
  darkMode: boolean;
  fontSize: number;
  fontFamily: string;
  colorBlindnessFilter: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  reducedMotion: boolean;
  focusIndicators: boolean;
  
  // Audio preferences
  soundEnabled: boolean;
  screenReaderEnabled: boolean;
  audioDescriptions: boolean;
  captionsEnabled: boolean;
  audioSpeed: number;
  
  // Motor preferences
  stickyKeys: boolean;
  slowKeys: boolean;
  bounceKeys: boolean;
  mouseKeys: boolean;
  clickAssist: boolean;
  hoverDelay: number;
  
  // Cognitive preferences
  simplifiedInterface: boolean;
  readingGuide: boolean;
  autoScroll: boolean;
  pauseAnimations: boolean;
  extendedTimeouts: boolean;
  
  // Language preferences
  language: string;
  textToSpeech: boolean;
  speechToText: boolean;
  translation: boolean;
}

// Screen reader announcements
export interface ScreenReaderAnnouncement {
  id: string;
  message: string;
  priority: 'polite' | 'assertive' | 'off';
  timestamp: number;
}

// Keyboard navigation helper
export interface KeyboardNavigation {
  currentFocus: string | null;
  focusHistory: string[];
  skipLinks: Array<{ id: string; label: string; target: string }>;
  shortcuts: Array<{ key: string; description: string; action: () => void }>;
}

// Color contrast checker
export interface ContrastResult {
  ratio: number;
  level: 'AA' | 'AAA' | 'fail';
  foreground: string;
  background: string;
}

// Accessibility-First Design Component
export const AccessibilityFirstDesign: React.FC = () => {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>({
    highContrast: false,
    darkMode: false,
    fontSize: 16,
    fontFamily: 'Arial',
    colorBlindnessFilter: 'none',
    reducedMotion: false,
    focusIndicators: true,
    soundEnabled: true,
    screenReaderEnabled: false,
    audioDescriptions: false,
    captionsEnabled: false,
    audioSpeed: 1.0,
    stickyKeys: false,
    slowKeys: false,
    bounceKeys: false,
    mouseKeys: false,
    clickAssist: false,
    hoverDelay: 500,
    simplifiedInterface: false,
    readingGuide: false,
    autoScroll: false,
    pauseAnimations: false,
    extendedTimeouts: false,
    language: 'en',
    textToSpeech: false,
    speechToText: false,
    translation: false
  });

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [announcements, setAnnouncements] = useState<ScreenReaderAnnouncement[]>([]);
  const [keyboardNav, setKeyboardNav] = useState<KeyboardNavigation>({
    currentFocus: null,
    focusHistory: [],
    skipLinks: [
      { id: 'main-content', label: 'Skip to main content', target: '#main-content' },
      { id: 'navigation', label: 'Skip to navigation', target: '#navigation' },
      { id: 'footer', label: 'Skip to footer', target: '#footer' }
    ],
    shortcuts: []
  });

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentReading, setCurrentReading] = useState<string | null>(null);

  const announcementRef = useRef<HTMLDivElement>(null);
  const speechSynthesis = useRef<SpeechSynthesis | null>(null);
  const speechRecognition = useRef<any>(null);

  // Initialize speech APIs
  useEffect(() => {
    if (typeof window !== 'undefined') {
      speechSynthesis.current = window.speechSynthesis;
      
      // Initialize speech recognition if available
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        speechRecognition.current = new SpeechRecognition();
        speechRecognition.current.continuous = true;
        speechRecognition.current.interimResults = true;
      }
    }
  }, []);

  // Load preferences from localStorage
  useEffect(() => {
    const savedPreferences = localStorage.getItem('accessibility-preferences');
    if (savedPreferences) {
      try {
        const parsed = JSON.parse(savedPreferences);
        setPreferences(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Failed to load accessibility preferences:', error);
      }
    }
  }, []);

  // Apply accessibility settings to DOM
  const applyAccessibilitySettings = useCallback((prefs: AccessibilityPreferences) => {
    const root = document.documentElement;
    
    // Font size
    root.style.setProperty('--base-font-size', `${prefs.fontSize}px`);
    
    // High contrast
    if (prefs.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    // Dark mode
    if (prefs.darkMode) {
      root.classList.add('dark-mode');
    } else {
      root.classList.remove('dark-mode');
    }
    
    // Reduced motion
    if (prefs.reducedMotion) {
      root.style.setProperty('--animation-duration', '0s');
      root.style.setProperty('--transition-duration', '0s');
    } else {
      root.style.removeProperty('--animation-duration');
      root.style.removeProperty('--transition-duration');
    }
    
    // Color blindness filters
    if (prefs.colorBlindnessFilter !== 'none') {
      root.classList.add(`filter-${prefs.colorBlindnessFilter}`);
    } else {
      root.classList.remove('filter-protanopia', 'filter-deuteranopia', 'filter-tritanopia');
    }
    
    // Focus indicators
    if (prefs.focusIndicators) {
      root.classList.add('enhanced-focus');
    } else {
      root.classList.remove('enhanced-focus');
    }
  }, []);

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem('accessibility-preferences', JSON.stringify(preferences));
    applyAccessibilitySettings(preferences);
  }, [preferences, applyAccessibilitySettings]);


  // Screen reader announcement
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' | 'off' = 'polite') => {
    const announcement: ScreenReaderAnnouncement = {
      id: Date.now().toString(),
      message,
      priority,
      timestamp: Date.now()
    };
    
    setAnnouncements(prev => [...prev, announcement]);
    
    // Remove announcement after 5 seconds
    setTimeout(() => {
      setAnnouncements(prev => prev.filter(a => a.id !== announcement.id));
    }, 5000);
  }, []);

  // Text-to-speech
  const speakText = useCallback((text: string) => {
    if (!speechSynthesis.current || !preferences.textToSpeech) return;
    
    // Cancel any ongoing speech
    speechSynthesis.current.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = preferences.audioSpeed;
    utterance.onstart = () => {
      setIsSpeaking(true);
      setCurrentReading(text);
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      setCurrentReading(null);
    };
    
    speechSynthesis.current.speak(utterance);
  }, [preferences.textToSpeech, preferences.audioSpeed]);

  // Stop speech
  const stopSpeech = useCallback(() => {
    if (speechSynthesis.current) {
      speechSynthesis.current.cancel();
      setIsSpeaking(false);
      setCurrentReading(null);
    }
  }, []);

  // Start speech recognition
  const startListening = useCallback(() => {
    if (!speechRecognition.current || !preferences.speechToText) return;
    
    try {
      speechRecognition.current.start();
      setIsListening(true);
      announce('Voice recognition started', 'polite');
    } catch (error) {
      console.error('Speech recognition error:', error);
      announce('Voice recognition failed to start', 'assertive');
    }
  }, [preferences.speechToText, announce]);

  // Stop speech recognition
  const stopListening = useCallback(() => {
    if (speechRecognition.current) {
      speechRecognition.current.stop();
      setIsListening(false);
      announce('Voice recognition stopped', 'polite');
    }
  }, [announce]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Skip links (Alt + S)
      if (event.altKey && event.key === 's') {
        event.preventDefault();
        const skipLinksMenu = document.getElementById('skip-links');
        if (skipLinksMenu) {
          skipLinksMenu.focus();
        }
      }
      
      // Help dialog (F1)
      if (event.key === 'F1') {
        event.preventDefault();
        setHelpOpen(true);
      }
      
      // Settings (Ctrl + ,)
      if (event.ctrlKey && event.key === ',') {
        event.preventDefault();
        setSettingsOpen(true);
      }
      
      // Toggle speech (Ctrl + Shift + S)
      if (event.ctrlKey && event.shiftKey && event.key === 'S') {
        event.preventDefault();
        if (isSpeaking) {
          stopSpeech();
        } else {
          const focusedElement = document.activeElement;
          if (focusedElement && focusedElement.textContent) {
            speakText(focusedElement.textContent);
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSpeaking, stopSpeech, speakText]);

  // Focus management
  const handleFocusChange = useCallback((elementId: string) => {
    setKeyboardNav(prev => ({
      ...prev,
      currentFocus: elementId,
      focusHistory: [...prev.focusHistory.slice(-9), elementId]
    }));
  }, []);

  // Color contrast checker
  const checkContrast = useCallback((foreground: string, background: string): ContrastResult => {
    // Simplified contrast calculation (in real implementation, use proper color contrast algorithms)
    const ratio = 4.5; // Placeholder
    const level = ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : 'fail';
    
    return { ratio, level, foreground, background };
  }, []);

  // Update preference
  const updatePreference = useCallback(<K extends keyof AccessibilityPreferences>(
    key: K,
    value: AccessibilityPreferences[K]
  ) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
    announce(`${key} ${value ? 'enabled' : 'disabled'}`, 'polite');
  }, [announce]);

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Skip Links */}
      <Box
        id="skip-links"
        sx={{
          position: 'absolute',
          top: -40,
          left: 0,
          zIndex: 9999,
          '&:focus-within': {
            top: 0
          }
        }}
      >
        {keyboardNav.skipLinks.map((link) => (
          <Button
            key={link.id}
            variant="contained"
            size="small"
            sx={{ mr: 1 }}
            onClick={() => {
              const target = document.querySelector(link.target);
              if (target) {
                (target as HTMLElement).focus();
                target.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            {link.label}
          </Button>
        ))}
      </Box>

      {/* Screen Reader Announcements */}
      <Box
        ref={announcementRef}
        aria-live="polite"
        aria-atomic="true"
        sx={{
          position: 'absolute',
          left: -10000,
          width: 1,
          height: 1,
          overflow: 'hidden'
        }}
      >
        {announcements.map((announcement) => (
          <div key={announcement.id} aria-live={announcement.priority}>
            {announcement.message}
          </div>
        ))}
      </Box>

      {/* Main Content */}
      <Box id="main-content" tabIndex={-1} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AccessibilityIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
            <Box>
              <Typography variant="h4">Accessibility-First Design</Typography>
              <Typography variant="body2" color="text.secondary">
                Inclusive design for all users with comprehensive accessibility features
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Accessibility Settings (Ctrl+,)">
              <IconButton onClick={() => setSettingsOpen(true)} aria-label="Open accessibility settings">
                <SettingsIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Help (F1)">
              <IconButton onClick={() => setHelpOpen(true)} aria-label="Open help">
                <HelpIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Accessibility Features Demo */}
        <Grid container spacing={3}>
          {/* Visual Accessibility */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <VisibilityIcon sx={{ mr: 1 }} />
                  Visual Accessibility
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.highContrast}
                        onChange={(e) => updatePreference('highContrast', e.target.checked)}
                      />
                    }
                    label="High Contrast Mode"
                  />
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.darkMode}
                        onChange={(e) => updatePreference('darkMode', e.target.checked)}
                      />
                    }
                    label="Dark Mode"
                  />
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography gutterBottom>Font Size: {preferences.fontSize}px</Typography>
                  <Slider
                    value={preferences.fontSize}
                    onChange={(_, value) => updatePreference('fontSize', value as number)}
                    min={12}
                    max={24}
                    step={1}
                    marks
                    valueLabelDisplay="auto"
                    aria-label="Font size"
                  />
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Color Blindness Filter</InputLabel>
                    <Select
                      value={preferences.colorBlindnessFilter}
                      label="Color Blindness Filter"
                      onChange={(e) => updatePreference('colorBlindnessFilter', e.target.value as any)}
                    >
                      <MenuItem value="none">None</MenuItem>
                      <MenuItem value="protanopia">Protanopia (Red-blind)</MenuItem>
                      <MenuItem value="deuteranopia">Deuteranopia (Green-blind)</MenuItem>
                      <MenuItem value="tritanopia">Tritanopia (Blue-blind)</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.reducedMotion}
                      onChange={(e) => updatePreference('reducedMotion', e.target.checked)}
                    />
                  }
                  label="Reduce Motion"
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Audio Accessibility */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <VolumeUpIcon sx={{ mr: 1 }} />
                  Audio Accessibility
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.textToSpeech}
                        onChange={(e) => updatePreference('textToSpeech', e.target.checked)}
                      />
                    }
                    label="Text-to-Speech"
                  />
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.speechToText}
                        onChange={(e) => updatePreference('speechToText', e.target.checked)}
                      />
                    }
                    label="Speech-to-Text"
                  />
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.captionsEnabled}
                        onChange={(e) => updatePreference('captionsEnabled', e.target.checked)}
                      />
                    }
                    label="Captions Enabled"
                  />
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography gutterBottom>Audio Speed: {preferences.audioSpeed}x</Typography>
                  <Slider
                    value={preferences.audioSpeed}
                    onChange={(_, value) => updatePreference('audioSpeed', value as number)}
                    min={0.5}
                    max={2.0}
                    step={0.1}
                    marks
                    valueLabelDisplay="auto"
                    aria-label="Audio playback speed"
                  />
                </Box>
                
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={isSpeaking ? <StopIcon /> : <PlayIcon />}
                    onClick={() => {
                      if (isSpeaking) {
                        stopSpeech();
                      } else {
                        speakText('This is a test of the text-to-speech functionality.');
                      }
                    }}
                    disabled={!preferences.textToSpeech}
                  >
                    {isSpeaking ? 'Stop' : 'Test TTS'}
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={isListening ? <StopIcon /> : <VoiceIcon />}
                    onClick={() => {
                      if (isListening) {
                        stopListening();
                      } else {
                        startListening();
                      }
                    }}
                    disabled={!preferences.speechToText}
                  >
                    {isListening ? 'Stop' : 'Test STT'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Motor Accessibility */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <TouchIcon sx={{ mr: 1 }} />
                  Motor Accessibility
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.stickyKeys}
                        onChange={(e) => updatePreference('stickyKeys', e.target.checked)}
                      />
                    }
                    label="Sticky Keys"
                  />
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.slowKeys}
                        onChange={(e) => updatePreference('slowKeys', e.target.checked)}
                      />
                    }
                    label="Slow Keys"
                  />
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.clickAssist}
                        onChange={(e) => updatePreference('clickAssist', e.target.checked)}
                      />
                    }
                    label="Click Assist"
                  />
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography gutterBottom>Hover Delay: {preferences.hoverDelay}ms</Typography>
                  <Slider
                    value={preferences.hoverDelay}
                    onChange={(_, value) => updatePreference('hoverDelay', value as number)}
                    min={0}
                    max={2000}
                    step={100}
                    marks
                    valueLabelDisplay="auto"
                    aria-label="Hover delay"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Cognitive Accessibility */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <FocusIcon sx={{ mr: 1 }} />
                  Cognitive Accessibility
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.simplifiedInterface}
                        onChange={(e) => updatePreference('simplifiedInterface', e.target.checked)}
                      />
                    }
                    label="Simplified Interface"
                  />
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.readingGuide}
                        onChange={(e) => updatePreference('readingGuide', e.target.checked)}
                      />
                    }
                    label="Reading Guide"
                  />
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.pauseAnimations}
                        onChange={(e) => updatePreference('pauseAnimations', e.target.checked)}
                      />
                    }
                    label="Pause Animations"
                  />
                </Box>
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.extendedTimeouts}
                      onChange={(e) => updatePreference('extendedTimeouts', e.target.checked)}
                    />
                  }
                  label="Extended Timeouts"
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Accessibility Testing Tools */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Accessibility Testing Tools
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <ContrastIcon sx={{ fontSize: 40, mb: 1, color: 'primary.main' }} />
                      <Typography variant="h6">Color Contrast</Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        Check color contrast ratios for WCAG compliance
                      </Typography>
                      <Button variant="outlined" size="small">
                        Test Contrast
                      </Button>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <KeyboardIcon sx={{ fontSize: 40, mb: 1, color: 'primary.main' }} />
                      <Typography variant="h6">Keyboard Navigation</Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        Test keyboard accessibility and focus management
                      </Typography>
                      <Button variant="outlined" size="small">
                        Test Navigation
                      </Button>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <SpeechIcon sx={{ fontSize: 40, mb: 1, color: 'primary.main' }} />
                      <Typography variant="h6">Screen Reader</Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        Test screen reader compatibility and announcements
                      </Typography>
                      <Button variant="outlined" size="small">
                        Test Reader
                      </Button>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Floating Action Button for Quick Access */}
      <SpeedDial
        ariaLabel="Accessibility quick actions"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        icon={<SpeedDialIcon icon={<AccessibilityIcon />} />}
      >
        <SpeedDialAction
          icon={<SettingsIcon />}
          tooltipTitle="Settings"
          onClick={() => setSettingsOpen(true)}
        />
        <SpeedDialAction
          icon={isSpeaking ? <StopIcon /> : <SpeechIcon />}
          tooltipTitle={isSpeaking ? 'Stop Speech' : 'Read Page'}
          onClick={() => {
            if (isSpeaking) {
              stopSpeech();
            } else {
              const mainContent = document.getElementById('main-content');
              if (mainContent && mainContent.textContent) {
                speakText(mainContent.textContent);
              }
            }
          }}
        />
        <SpeedDialAction
          icon={preferences.highContrast ? <ContrastIcon /> : <ContrastIcon />}
          tooltipTitle="Toggle High Contrast"
          onClick={() => updatePreference('highContrast', !preferences.highContrast)}
        />
        <SpeedDialAction
          icon={preferences.darkMode ? <LightModeIcon /> : <DarkModeIcon />}
          tooltipTitle="Toggle Dark Mode"
          onClick={() => updatePreference('darkMode', !preferences.darkMode)}
        />
      </SpeedDial>

      {/* Settings Dialog */}
      <Dialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        maxWidth="md"
        fullWidth
        aria-labelledby="accessibility-settings-title"
      >
        <DialogTitle id="accessibility-settings-title">
          Accessibility Settings
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" paragraph>
            Customize your accessibility preferences for the best experience.
          </Typography>
          
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Visual Preferences</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.highContrast}
                      onChange={(e) => updatePreference('highContrast', e.target.checked)}
                    />
                  }
                  label="High Contrast Mode"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.darkMode}
                      onChange={(e) => updatePreference('darkMode', e.target.checked)}
                    />
                  }
                  label="Dark Mode"
                />
                
                <Box>
                  <Typography gutterBottom>Font Size: {preferences.fontSize}px</Typography>
                  <Slider
                    value={preferences.fontSize}
                    onChange={(_, value) => updatePreference('fontSize', value as number)}
                    min={12}
                    max={24}
                    step={1}
                    marks
                    valueLabelDisplay="auto"
                    aria-label="Font size"
                  />
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>
          
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Audio Preferences</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.textToSpeech}
                      onChange={(e) => updatePreference('textToSpeech', e.target.checked)}
                    />
                  }
                  label="Text-to-Speech"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.speechToText}
                      onChange={(e) => updatePreference('speechToText', e.target.checked)}
                    />
                  }
                  label="Speech-to-Text"
                />
                
                <Box>
                  <Typography gutterBottom>Audio Speed: {preferences.audioSpeed}x</Typography>
                  <Slider
                    value={preferences.audioSpeed}
                    onChange={(_, value) => updatePreference('audioSpeed', value as number)}
                    min={0.5}
                    max={2.0}
                    step={0.1}
                    marks
                    valueLabelDisplay="auto"
                    aria-label="Audio playback speed"
                  />
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>
          
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Motor Preferences</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.stickyKeys}
                      onChange={(e) => updatePreference('stickyKeys', e.target.checked)}
                    />
                  }
                  label="Sticky Keys"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.clickAssist}
                      onChange={(e) => updatePreference('clickAssist', e.target.checked)}
                    />
                  }
                  label="Click Assist"
                />
                
                <Box>
                  <Typography gutterBottom>Hover Delay: {preferences.hoverDelay}ms</Typography>
                  <Slider
                    value={preferences.hoverDelay}
                    onChange={(_, value) => updatePreference('hoverDelay', value as number)}
                    min={0}
                    max={2000}
                    step={100}
                    marks
                    valueLabelDisplay="auto"
                    aria-label="Hover delay"
                  />
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>
            Close
          </Button>
          <Button variant="contained" onClick={() => setSettingsOpen(false)}>
            Save Settings
          </Button>
        </DialogActions>
      </Dialog>

      {/* Help Dialog */}
      <Dialog
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        maxWidth="md"
        fullWidth
        aria-labelledby="accessibility-help-title"
      >
        <DialogTitle id="accessibility-help-title">
          Accessibility Help
        </DialogTitle>
        <DialogContent>
          <Typography variant="h6" gutterBottom>
            Keyboard Shortcuts
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText
                primary="Alt + S"
                secondary="Show skip links"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="F1"
                secondary="Open help dialog"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Ctrl + ,"
                secondary="Open accessibility settings"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Ctrl + Shift + S"
                secondary="Toggle text-to-speech"
              />
            </ListItem>
          </List>
          
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Accessibility Features
          </Typography>
          <Typography variant="body2" paragraph>
            This application includes comprehensive accessibility features designed to support users with various needs:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon>
                <VisibilityIcon />
              </ListItemIcon>
              <ListItemText
                primary="Visual Accessibility"
                secondary="High contrast, dark mode, font size adjustment, color blindness filters"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <VolumeUpIcon />
              </ListItemIcon>
              <ListItemText
                primary="Audio Accessibility"
                secondary="Text-to-speech, speech-to-text, captions, audio speed control"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <TouchIcon />
              </ListItemIcon>
              <ListItemText
                primary="Motor Accessibility"
                secondary="Sticky keys, click assist, hover delay adjustment"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <FocusIcon />
              </ListItemIcon>
              <ListItemText
                primary="Cognitive Accessibility"
                secondary="Simplified interface, reading guide, extended timeouts"
              />
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHelpOpen(false)} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Current Reading Indicator */}
      {isSpeaking && currentReading && (
        <Snackbar
          open={isSpeaking}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          <SnackbarContent
            message={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <SpeechIcon sx={{ mr: 1 }} />
                <Typography variant="body2">
                  Reading: {currentReading.substring(0, 50)}...
                </Typography>
              </Box>
            }
            action={
              <IconButton
                size="small"
                color="inherit"
                onClick={stopSpeech}
                aria-label="Stop reading"
              >
                <StopIcon />
              </IconButton>
            }
          />
        </Snackbar>
      )}

      {/* Voice Recognition Indicator */}
      {isListening && (
        <Snackbar
          open={isListening}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <SnackbarContent
            message={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <VoiceIcon sx={{ mr: 1 }} />
                <Typography variant="body2">
                  Listening for voice commands...
                </Typography>
              </Box>
            }
            action={
              <IconButton
                size="small"
                color="inherit"
                onClick={stopListening}
                aria-label="Stop listening"
              >
                <StopIcon />
              </IconButton>
            }
          />
        </Snackbar>
      )}
    </Box>
  );
};

export default AccessibilityFirstDesign;