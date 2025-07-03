const express = require('express');
const router = express.Router();

// Mock settings data
const mockSettings = {
  general: {
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    theme: 'light',
    autoSave: true,
    confirmActions: true
  },
  notifications: {
    email: {
      enabled: true,
      frequency: 'immediate',
      types: {
        security: true,
        updates: true,
        marketing: false,
        digest: true,
        mentions: true,
        assignments: true
      }
    },
    push: {
      enabled: true,
      types: {
        messages: true,
        updates: false,
        reminders: true,
        mentions: true
      }
    },
    inApp: {
      enabled: true,
      sound: true,
      desktop: true
    }
  },
  privacy: {
    profileVisibility: 'team',
    activityTracking: true,
    dataCollection: false,
    thirdPartySharing: false,
    searchIndexing: true,
    publicProfile: false
  },
  security: {
    twoFactorAuth: false,
    sessionTimeout: 30,
    loginNotifications: true,
    deviceTracking: true,
    ipWhitelist: [],
    passwordExpiry: 90,
    requireStrongPassword: true
  },
  integrations: {
    allowedDomains: [],
    apiAccess: false,
    webhookUrls: [],
    ssoEnabled: false,
    dataSync: true
  },
  billing: {
    autoRenew: true,
    invoiceEmail: '',
    billingAddress: {
      street: '',
      city: '',
      state: '',
      zip: '',
      country: ''
    },
    paymentMethod: 'card'
  },
  advanced: {
    debugMode: false,
    betaFeatures: false,
    analyticsOptOut: false,
    dataRetention: 365,
    exportFormat: 'json',
    backupFrequency: 'weekly'
  }
};

// Tier-based feature availability
const tierFeatures = {
  'Free': {
    maxIntegrations: 2,
    apiAccess: false,
    ssoEnabled: false,
    advancedSecurity: false,
    customDomains: false,
    prioritySupport: false,
    dataRetentionDays: 30,
    teamFeatures: false,
    advancedAnalytics: false,
    customBranding: false
  },
  'Individual Pro': {
    maxIntegrations: 10,
    apiAccess: true,
    ssoEnabled: false,
    advancedSecurity: true,
    customDomains: false,
    prioritySupport: true,
    dataRetentionDays: 365,
    teamFeatures: false,
    advancedAnalytics: true,
    customBranding: false
  },
  'Team': {
    maxIntegrations: 25,
    apiAccess: true,
    ssoEnabled: true,
    advancedSecurity: true,
    customDomains: true,
    prioritySupport: true,
    dataRetentionDays: 730,
    teamFeatures: true,
    advancedAnalytics: true,
    customBranding: true
  },
  'Enterprise': {
    maxIntegrations: -1, // unlimited
    apiAccess: true,
    ssoEnabled: true,
    advancedSecurity: true,
    customDomains: true,
    prioritySupport: true,
    dataRetentionDays: -1, // unlimited
    teamFeatures: true,
    advancedAnalytics: true,
    customBranding: true
  }
};

// Get all settings
router.get('/', (req, res) => {
  // In a real implementation, get user tier from authentication
  const userTier = req.user?.subscriptionTier || 'Individual Pro';
  const features = tierFeatures[userTier] || tierFeatures['Free'];
  
  res.json({
    settings: mockSettings,
    tierFeatures: features,
    userTier
  });
});

// Get specific settings section
router.get('/:section', (req, res) => {
  const { section } = req.params;
  
  if (!mockSettings[section]) {
    return res.status(404).json({ error: 'Settings section not found' });
  }
  
  const userTier = req.user?.subscriptionTier || 'Individual Pro';
  const features = tierFeatures[userTier] || tierFeatures['Free'];
  
  res.json({
    settings: mockSettings[section],
    tierFeatures: features,
    userTier,
    section
  });
});

// Update settings
router.put('/', (req, res) => {
  const { section, data } = req.body;
  
  if (!section || !data) {
    return res.status(400).json({ error: 'Section and data are required' });
  }
  
  if (!mockSettings[section]) {
    return res.status(404).json({ error: 'Settings section not found' });
  }
  
  const userTier = req.user?.subscriptionTier || 'Individual Pro';
  const features = tierFeatures[userTier] || tierFeatures['Free'];
  
  // Validate tier-specific restrictions
  if (section === 'integrations') {
    if (data.apiAccess && !features.apiAccess) {
      return res.status(403).json({ 
        error: 'API access not available in your current plan',
        requiredTier: 'Individual Pro'
      });
    }
    
    if (data.ssoEnabled && !features.ssoEnabled) {
      return res.status(403).json({ 
        error: 'SSO not available in your current plan',
        requiredTier: 'Team'
      });
    }
  }
  
  if (section === 'security') {
    if ((data.deviceTracking || data.ipWhitelist) && !features.advancedSecurity) {
      return res.status(403).json({ 
        error: 'Advanced security features not available in your current plan',
        requiredTier: 'Individual Pro'
      });
    }
  }
  
  if (section === 'advanced') {
    if (data.dataRetention > features.dataRetentionDays && features.dataRetentionDays !== -1) {
      return res.status(403).json({ 
        error: `Data retention limited to ${features.dataRetentionDays} days in your current plan`,
        maxRetention: features.dataRetentionDays
      });
    }
  }
  
  // Update settings
  Object.assign(mockSettings[section], data);
  
  res.json({
    message: 'Settings updated successfully',
    settings: mockSettings[section],
    section,
    updatedAt: new Date().toISOString()
  });
});

// Update specific setting
router.put('/:section/:key', (req, res) => {
  const { section, key } = req.params;
  const { value } = req.body;
  
  if (!mockSettings[section]) {
    return res.status(404).json({ error: 'Settings section not found' });
  }
  
  if (!(key in mockSettings[section])) {
    return res.status(404).json({ error: 'Setting key not found' });
  }
  
  mockSettings[section][key] = value;
  
  res.json({
    message: 'Setting updated successfully',
    section,
    key,
    value,
    updatedAt: new Date().toISOString()
  });
});

// Reset settings to defaults
router.post('/reset', (req, res) => {
  const { section } = req.body;
  
  const defaultSettings = {
    general: {
      language: 'en',
      timezone: 'UTC',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h',
      theme: 'light',
      autoSave: true,
      confirmActions: true
    },
    notifications: {
      email: {
        enabled: true,
        frequency: 'immediate',
        types: {
          security: true,
          updates: true,
          marketing: false,
          digest: true,
          mentions: true,
          assignments: true
        }
      },
      push: {
        enabled: true,
        types: {
          messages: true,
          updates: false,
          reminders: true,
          mentions: true
        }
      },
      inApp: {
        enabled: true,
        sound: true,
        desktop: true
      }
    },
    privacy: {
      profileVisibility: 'team',
      activityTracking: true,
      dataCollection: false,
      thirdPartySharing: false,
      searchIndexing: true,
      publicProfile: false
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      loginNotifications: true,
      deviceTracking: true,
      ipWhitelist: [],
      passwordExpiry: 90,
      requireStrongPassword: true
    },
    integrations: {
      allowedDomains: [],
      apiAccess: false,
      webhookUrls: [],
      ssoEnabled: false,
      dataSync: true
    },
    billing: {
      autoRenew: true,
      invoiceEmail: '',
      billingAddress: {
        street: '',
        city: '',
        state: '',
        zip: '',
        country: ''
      },
      paymentMethod: 'card'
    },
    advanced: {
      debugMode: false,
      betaFeatures: false,
      analyticsOptOut: false,
      dataRetention: 365,
      exportFormat: 'json',
      backupFrequency: 'weekly'
    }
  };
  
  if (section) {
    if (!defaultSettings[section]) {
      return res.status(404).json({ error: 'Settings section not found' });
    }
    
    mockSettings[section] = { ...defaultSettings[section] };
    
    res.json({
      message: `${section} settings reset to defaults`,
      settings: mockSettings[section],
      section
    });
  } else {
    // Reset all settings
    Object.assign(mockSettings, defaultSettings);
    
    res.json({
      message: 'All settings reset to defaults',
      settings: mockSettings
    });
  }
});

// Export settings
router.get('/export/:format?', (req, res) => {
  const { format = 'json' } = req.params;
  const { sections } = req.query;
  
  let exportData = mockSettings;
  
  if (sections) {
    const sectionList = sections.split(',');
    exportData = {};
    sectionList.forEach(section => {
      if (mockSettings[section]) {
        exportData[section] = mockSettings[section];
      }
    });
  }
  
  const exportMetadata = {
    exportedAt: new Date().toISOString(),
    version: '1.0',
    userTier: req.user?.subscriptionTier || 'Individual Pro',
    format
  };
  
  const fullExport = {
    metadata: exportMetadata,
    settings: exportData
  };
  
  switch (format.toLowerCase()) {
    case 'json':
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="settings-export.json"');
      res.json(fullExport);
      break;
      
    case 'csv':
      // Convert settings to CSV format
      let csvContent = 'Section,Key,Value\n';
      
      Object.keys(exportData).forEach(section => {
        Object.keys(exportData[section]).forEach(key => {
          const value = typeof exportData[section][key] === 'object' 
            ? JSON.stringify(exportData[section][key]) 
            : exportData[section][key];
          csvContent += `${section},${key},"${value}"\n`;
        });
      });
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="settings-export.csv"');
      res.send(csvContent);
      break;
      
    default:
      res.status(400).json({ error: 'Unsupported export format' });
  }
});

// Import settings
router.post('/import', (req, res) => {
  const { settings, overwrite = false } = req.body;
  
  if (!settings || typeof settings !== 'object') {
    return res.status(400).json({ error: 'Settings object is required' });
  }
  
  const userTier = req.user?.subscriptionTier || 'Individual Pro';
  const features = tierFeatures[userTier] || tierFeatures['Free'];
  
  let importedSections = [];
  let skippedSections = [];
  let errors = [];
  
  Object.keys(settings).forEach(section => {
    if (!mockSettings[section]) {
      skippedSections.push(section);
      return;
    }
    
    try {
      // Validate tier restrictions for certain sections
      if (section === 'integrations') {
        if (settings[section].apiAccess && !features.apiAccess) {
          errors.push(`API access not available in ${userTier} plan`);
          return;
        }
        if (settings[section].ssoEnabled && !features.ssoEnabled) {
          errors.push(`SSO not available in ${userTier} plan`);
          return;
        }
      }
      
      if (overwrite) {
        mockSettings[section] = { ...settings[section] };
      } else {
        Object.assign(mockSettings[section], settings[section]);
      }
      
      importedSections.push(section);
    } catch (error) {
      errors.push(`Error importing ${section}: ${error.message}`);
    }
  });
  
  res.json({
    message: 'Settings import completed',
    imported: importedSections,
    skipped: skippedSections,
    errors,
    importedAt: new Date().toISOString()
  });
});

// Get tier features and limitations
router.get('/tier/features', (req, res) => {
  const userTier = req.user?.subscriptionTier || 'Individual Pro';
  const features = tierFeatures[userTier] || tierFeatures['Free'];
  
  res.json({
    userTier,
    features,
    allTiers: tierFeatures
  });
});

// Validate setting against tier restrictions
router.post('/validate', (req, res) => {
  const { section, key, value } = req.body;
  
  if (!section || !key) {
    return res.status(400).json({ error: 'Section and key are required' });
  }
  
  const userTier = req.user?.subscriptionTier || 'Individual Pro';
  const features = tierFeatures[userTier] || tierFeatures['Free'];
  
  let isValid = true;
  let errors = [];
  let requiredTier = null;
  
  // Tier-specific validations
  if (section === 'integrations') {
    if (key === 'apiAccess' && value && !features.apiAccess) {
      isValid = false;
      errors.push('API access not available in your current plan');
      requiredTier = 'Individual Pro';
    }
    
    if (key === 'ssoEnabled' && value && !features.ssoEnabled) {
      isValid = false;
      errors.push('SSO not available in your current plan');
      requiredTier = 'Team';
    }
  }
  
  if (section === 'security') {
    if ((key === 'deviceTracking' || key === 'ipWhitelist') && value && !features.advancedSecurity) {
      isValid = false;
      errors.push('Advanced security features not available in your current plan');
      requiredTier = 'Individual Pro';
    }
  }
  
  if (section === 'advanced') {
    if (key === 'dataRetention' && value > features.dataRetentionDays && features.dataRetentionDays !== -1) {
      isValid = false;
      errors.push(`Data retention limited to ${features.dataRetentionDays} days in your current plan`);
      requiredTier = 'Team';
    }
  }
  
  res.json({
    isValid,
    errors,
    requiredTier,
    currentTier: userTier,
    features
  });
});

module.exports = router;