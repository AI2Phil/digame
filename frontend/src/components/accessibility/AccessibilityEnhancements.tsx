import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
import {
  Box,
  Button,
  IconButton,
  Typography,
  Switch,
  FormControlLabel,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
import {
  Card,
  CardContent,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Tooltip,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab,
  Zoom
} from '@mui/material';
import {
  Accessibility as AccessibilityIcon,
  Contrast as ContrastIcon,
  FormatSize as FontSizeIcon,
  VolumeUp as VolumeUpIcon,
  Keyboard as KeyboardIcon,
  Mouse as MouseIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Settings as SettingsIcon,
  Close as CloseIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  SkipNext as SkipNextIcon,
  SkipPrevious as SkipPreviousIcon,
  Help as HelpIcon
} from '@mui/icons-material';

// Types for accessibility features
export interface AccessibilitySettings {
  highContrast: boolean;
  fontSize: number;
  reducedMotion: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  focusIndicators: boolean;
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  textToSpeech: boolean;
  speechRate: number;
  autoplay: boolean;
  captions: boolean;
}

export interface FocusManager {
  trapFocus: (element: HTMLElement) => () => void;
  restoreFocus: () => void;
  announceLiveRegion: (message: string, priority?: 'polite' | 'assertive') => void;
}

// Accessibility Context
const AccessibilityContext = React.createContext<{
  settings: AccessibilitySettings;
  updateSettings: (settings: Partial<AccessibilitySettings>) => void;
  focusManager: FocusManager;
} | null>(null);

// Custom hook for accessibility
export const useAccessibility = () => {
  const context = React.useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
};

// Focus Management Hook
export const useFocusManagement = () => {
  const [focusedElement, setFocusedElement] = useState<HTMLElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const liveRegionRef = useRef<HTMLDivElement | null>(null);

  const trapFocus = useCallback((element: HTMLElement) => {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    element.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      element.removeEventListener('keydown', handleTabKey);
    };
  }, []);

  const restoreFocus = useCallback(() => {
    if (previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, []);

  const announceLiveRegion = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!liveRegionRef.current) {
      const liveRegion = document.createElement('div');
      liveRegion.setAttribute('aria-live', priority);
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.style.position = 'absolute';
      liveRegion.style.left = '-10000px';
      liveRegion.style.width = '1px';
      liveRegion.style.height = '1px';
      liveRegion.style.overflow = 'hidden';
      document.body.appendChild(liveRegion);
      liveRegionRef.current = liveRegion;
    }

    liveRegionRef.current.textContent = message;
  }, []);

  useEffect(() => {
    return () => {
      if (liveRegionRef.current) {
        document.body.removeChild(liveRegionRef.current);
      }
    };
  }, []);

  return {
    trapFocus,
    restoreFocus,
    announceLiveRegion,
    setFocusedElement,
    focusedElement
  };
};

// Keyboard Navigation Hook
export const useKeyboardNavigation = (enabled: boolean = true) => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip to main content (Alt + M)
      if (e.altKey && e.key === 'm') {
        const mainContent = document.querySelector('main, [role="main"]') as HTMLElement;
        if (mainContent) {
          mainContent.focus();
          e.preventDefault();
        }
      }

      // Skip to navigation (Alt + N)
      if (e.altKey && e.key === 'n') {
        const navigation = document.querySelector('nav, [role="navigation"]') as HTMLElement;
        if (navigation) {
          navigation.focus();
          e.preventDefault();
        }
      }

      // Open accessibility menu (Alt + A)
      if (e.altKey && e.key === 'a') {
        const accessibilityButton = document.querySelector('[data-accessibility-menu]') as HTMLElement;
        if (accessibilityButton) {
          accessibilityButton.click();
          e.preventDefault();
        }
      }

      // Escape key handling
      if (e.key === 'Escape') {
        const activeModal = document.querySelector('[role="dialog"][aria-hidden="false"]');
        if (activeModal) {
          const closeButton = activeModal.querySelector('[aria-label*="close"], [aria-label*="Close"]') as HTMLElement;
          if (closeButton) {
            closeButton.click();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [enabled]);
};

// Text-to-Speech Hook
export const useTextToSpeech = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if ('speechSynthesis' in window) {
      setIsSupported(true);
      
      const loadVoices = () => {
        setVoices(speechSynthesis.getVoices());
      };

      loadVoices();
      speechSynthesis.addEventListener('voiceschanged', loadVoices);

      return () => {
        speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      };
    }
  }, []);

  const speak = useCallback((text: string, options: {
    rate?: number;
    pitch?: number;
    volume?: number;
    voice?: SpeechSynthesisVoice;
  } = {}) => {
    if (!isSupported) return;

    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options.rate || 1;
    utterance.pitch = options.pitch || 1;
    utterance.volume = options.volume || 1;
    
    if (options.voice) {
      utterance.voice = options.voice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    speechSynthesis.speak(utterance);
  }, [isSupported]);

  const stop = useCallback(() => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  const pause = useCallback(() => {
    speechSynthesis.pause();
  }, []);

  const resume = useCallback(() => {
    speechSynthesis.resume();
  }, []);

  return {
    isSupported,
    isSpeaking,
    voices,
    speak,
    stop,
    pause,
    resume
  };
};

// Accessibility Settings Panel
export const AccessibilityPanel: React.FC<{
  open: boolean;
  onClose: () => void;
  settings: AccessibilitySettings;
  onSettingsChange: (settings: Partial<AccessibilitySettings>) => void;
}> = ({ open, onClose, settings, onSettingsChange }) => {
  const { speak, stop, isSpeaking, voices } = useTextToSpeech();

  const handleSettingChange = (key: keyof AccessibilitySettings, value: any) => {
    onSettingsChange({ [key]: value });
  };

  const testTextToSpeech = () => {
    if (isSpeaking) {
      stop();
    } else {
      speak('This is a test of the text to speech feature.', { rate: settings.speechRate });
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: 350, p: 2 }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Accessibility Settings</Typography>
        <IconButton onClick={onClose} aria-label="Close accessibility settings">
          <CloseIcon />
        </IconButton>
      </Box>

      <List>
        {/* Visual Settings */}
        <ListItem>
          <ListItemIcon>
            <ContrastIcon />
          </ListItemIcon>
          <ListItemText primary="High Contrast Mode" />
          <Switch
            checked={settings.highContrast}
            onChange={(e) => handleSettingChange('highContrast', e.target.checked)}
            inputProps={{ 'aria-label': 'Toggle high contrast mode' }}
          />
        </ListItem>

        <ListItem>
          <ListItemIcon>
            <FontSizeIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Font Size" 
            secondary={`${settings.fontSize}%`}
          />
        </ListItem>
        <ListItem>
          <Slider
            value={settings.fontSize}
            onChange={(_, value) => handleSettingChange('fontSize', value)}
            min={75}
            max={150}
            step={25}
            marks
            valueLabelDisplay="auto"
            aria-label="Font size"
          />
        </ListItem>

        <ListItem>
          <ListItemIcon>
            <VisibilityIcon />
          </ListItemIcon>
          <ListItemText primary="Color Blind Support" />
        </ListItem>
        <ListItem>
          <FormControl fullWidth size="small">
            <InputLabel>Color Blind Mode</InputLabel>
            <Select
              value={settings.colorBlindMode}
              onChange={(e) => handleSettingChange('colorBlindMode', e.target.value)}
              label="Color Blind Mode"
            >
              <MenuItem value="none">None</MenuItem>
              <MenuItem value="protanopia">Protanopia (Red-blind)</MenuItem>
              <MenuItem value="deuteranopia">Deuteranopia (Green-blind)</MenuItem>
              <MenuItem value="tritanopia">Tritanopia (Blue-blind)</MenuItem>
            </Select>
          </FormControl>
        </ListItem>

        <Divider sx={{ my: 2 }} />

        {/* Motion Settings */}
        <ListItem>
          <ListItemIcon>
            <MouseIcon />
          </ListItemIcon>
          <ListItemText primary="Reduced Motion" />
          <Switch
            checked={settings.reducedMotion}
            onChange={(e) => handleSettingChange('reducedMotion', e.target.checked)}
            inputProps={{ 'aria-label': 'Toggle reduced motion' }}
          />
        </ListItem>

        <Divider sx={{ my: 2 }} />

        {/* Navigation Settings */}
        <ListItem>
          <ListItemIcon>
            <KeyboardIcon />
          </ListItemIcon>
          <ListItemText primary="Enhanced Keyboard Navigation" />
          <Switch
            checked={settings.keyboardNavigation}
            onChange={(e) => handleSettingChange('keyboardNavigation', e.target.checked)}
            inputProps={{ 'aria-label': 'Toggle enhanced keyboard navigation' }}
          />
        </ListItem>

        <ListItem>
          <ListItemIcon>
            <VisibilityIcon />
          </ListItemIcon>
          <ListItemText primary="Enhanced Focus Indicators" />
          <Switch
            checked={settings.focusIndicators}
            onChange={(e) => handleSettingChange('focusIndicators', e.target.checked)}
            inputProps={{ 'aria-label': 'Toggle enhanced focus indicators' }}
          />
        </ListItem>

        <Divider sx={{ my: 2 }} />

        {/* Audio Settings */}
        <ListItem>
          <ListItemIcon>
            <VolumeUpIcon />
          </ListItemIcon>
          <ListItemText primary="Text-to-Speech" />
          <Switch
            checked={settings.textToSpeech}
            onChange={(e) => handleSettingChange('textToSpeech', e.target.checked)}
            inputProps={{ 'aria-label': 'Toggle text-to-speech' }}
          />
        </ListItem>

        {settings.textToSpeech && (
          <>
            <ListItem>
              <ListItemText 
                primary="Speech Rate" 
                secondary={`${settings.speechRate}x`}
              />
            </ListItem>
            <ListItem>
              <Slider
                value={settings.speechRate}
                onChange={(_, value) => handleSettingChange('speechRate', value)}
                min={0.5}
                max={2}
                step={0.1}
                marks
                valueLabelDisplay="auto"
                aria-label="Speech rate"
              />
            </ListItem>
            <ListItem>
              <Button
                variant="outlined"
                onClick={testTextToSpeech}
                startIcon={isSpeaking ? <PauseIcon /> : <PlayArrowIcon />}
                fullWidth
              >
                {isSpeaking ? 'Stop' : 'Test'} Text-to-Speech
              </Button>
            </ListItem>
          </>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Screen Reader Settings */}
        <ListItem>
          <ListItemIcon>
            <AccessibilityIcon />
          </ListItemIcon>
          <ListItemText primary="Screen Reader Optimizations" />
          <Switch
            checked={settings.screenReader}
            onChange={(e) => handleSettingChange('screenReader', e.target.checked)}
            inputProps={{ 'aria-label': 'Toggle screen reader optimizations' }}
          />
        </ListItem>
      </List>

      <Box sx={{ mt: 2 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            Keyboard shortcuts: Alt+M (main content), Alt+N (navigation), Alt+A (accessibility menu)
          </Typography>
        </Alert>
        
        <Button
          variant="outlined"
          fullWidth
          onClick={() => {
            // Reset to defaults
            onSettingsChange({
              highContrast: false,
              fontSize: 100,
              reducedMotion: false,
              screenReader: false,
              keyboardNavigation: true,
              focusIndicators: true,
              colorBlindMode: 'none',
              textToSpeech: false,
              speechRate: 1,
              autoplay: false,
              captions: false
            });
          }}
        >
          Reset to Defaults
        </Button>
      </Box>
    </Drawer>
  );
};

// Accessibility Provider Component
export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    // Load from localStorage or use defaults
    const saved = localStorage.getItem('accessibility-settings');
    return saved ? JSON.parse(saved) : {
      highContrast: false,
      fontSize: 100,
      reducedMotion: false,
      screenReader: false,
      keyboardNavigation: true,
      focusIndicators: true,
      colorBlindMode: 'none',
      textToSpeech: false,
      speechRate: 1,
      autoplay: false,
      captions: false
    };
  });

  const [panelOpen, setPanelOpen] = useState(false);
  const focusManager = useFocusManagement();

  // Apply settings to document
  useEffect(() => {
    const root = document.documentElement;
    
    // High contrast
    root.classList.toggle('high-contrast', settings.highContrast);
    
    // Font size
    root.style.fontSize = `${settings.fontSize}%`;
    
    // Reduced motion
    root.classList.toggle('reduced-motion', settings.reducedMotion);
    
    // Enhanced focus indicators
    root.classList.toggle('enhanced-focus', settings.focusIndicators);
    
    // Color blind mode
    root.setAttribute('data-colorblind-mode', settings.colorBlindMode);
    
    // Save to localStorage
    localStorage.setItem('accessibility-settings', JSON.stringify(settings));
  }, [settings]);

  // Keyboard navigation
  useKeyboardNavigation(settings.keyboardNavigation);

  const updateSettings = useCallback((newSettings: Partial<AccessibilitySettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const contextValue = {
    settings,
    updateSettings,
    focusManager
  };

  return (
    <AccessibilityContext.Provider value={contextValue}>
      {children}
      
      {/* Accessibility FAB */}
      <Zoom in={true}>
        <Fab
          color="primary"
          aria-label="Open accessibility settings"
          data-accessibility-menu
          onClick={() => setPanelOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 16,
            left: 16,
            zIndex: 1000
          }}
        >
          <AccessibilityIcon />
        </Fab>
      </Zoom>

      {/* Accessibility Panel */}
      <AccessibilityPanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        settings={settings}
        onSettingsChange={updateSettings}
      />

      {/* Skip Links */}
      <Box
        component="nav"
        aria-label="Skip links"
        sx={{
          position: 'absolute',
          top: -40,
          left: 6,
          zIndex: 9999,
          '&:focus-within': {
            top: 6
          }
        }}
      >
        <Button
          variant="contained"
          size="small"
          href="#main-content"
          sx={{
            mr: 1,
            '&:focus': {
              position: 'relative',
              top: 46
            }
          }}
        >
          Skip to main content
        </Button>
        <Button
          variant="contained"
          size="small"
          href="#navigation"
          sx={{
            '&:focus': {
              position: 'relative',
              top: 46
            }
          }}
        >
          Skip to navigation
        </Button>
      </Box>
    </AccessibilityContext.Provider>
  );
};

// HOC for making components accessible
export const withAccessibility = <P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> => {
  return (props: P) => {
    const { settings } = useAccessibility();
    
    return (
      <Box
        className={`
          ${settings.highContrast ? 'high-contrast' : ''}
          ${settings.reducedMotion ? 'reduced-motion' : ''}
          ${settings.focusIndicators ? 'enhanced-focus' : ''}
        `}
        data-colorblind-mode={settings.colorBlindMode}
        style={{ fontSize: `${settings.fontSize}%` }}
      >
        <Component {...props} />
      </Box>
    );
  };
};

export default AccessibilityProvider;