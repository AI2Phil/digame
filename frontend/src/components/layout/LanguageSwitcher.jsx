import React from 'react';
// import { useRouter } from 'next/router';
// import { useTranslation } from 'next-i18next';
import { Select, MenuItem, FormControl, InputLabel, Box } from '@mui/material'; // Using MUI for consistency

// LANGUAGE SWITCHER - TEMPORARILY DISABLED
// TODO: Re-enable when implementing Spanish localization
// This component is disabled while i18n is deactivated to avoid duplicate /en/* pages

const LanguageSwitcher = () => {
  // Temporarily disabled - no locale routing
  // const router = useRouter();
  // const { i18n } = useTranslation(); // Get the i18n instance

  const handleLanguageChange = (event) => {
    // Temporarily disabled - show coming soon message
    alert('Multi-language support coming soon! 🌍\n\nSoporte multiidioma próximamente! 🇪🇸');
    
    // TODO: Re-enable when i18n is activated
    // const newLocale = event.target.value;
    // router.push(router.pathname, router.asPath, { locale: newLocale });
  };

  // Fixed to English for now
  const currentLanguage = 'en';

  // Supported locales - ready for future implementation
  const supportedLocales = ['en', 'es']; // Spanish ready to be enabled

  // Temporarily using hardcoded labels instead of translations
  // const { t: tCommon } = useTranslation('common');

  return (
    <Box sx={{ minWidth: 120, m: 1 }}>
      <FormControl fullWidth size="small">
        <InputLabel id="language-select-label">Language</InputLabel>
        <Select
          labelId="language-select-label"
          id="language-select"
          value={currentLanguage}
          label="Language"
          onChange={handleLanguageChange}
        >
          {supportedLocales.map((locale) => (
            <MenuItem key={locale} value={locale}>
              {locale === 'en' ? 'English' : locale === 'es' ? 'Español (Soon)' : locale.toUpperCase()}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default LanguageSwitcher;
