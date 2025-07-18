import React from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { Select, MenuItem, FormControl, InputLabel, Box } from '@mui/material'; // Using MUI for consistency

const LanguageSwitcher = () => {
  const router = useRouter();
  const { i18n } = useTranslation(); // Get the i18n instance

  const handleLanguageChange = (event) => {
    const newLocale = event.target.value;
    // i18n.changeLanguage(newLocale); // This changes the language

    // Change the route to the new locale.
    // next-i18next handles language persistence (e.g., cookie)
    router.push(router.pathname, router.asPath, { locale: newLocale });
  };

  // Get current language from i18n instance or router
  const currentLanguage = i18n.language || router.locale || 'en';

  // Supported locales from next-i18next.config.js (passed via serverSideProps or context if needed,
  // or hardcoded here if they are static and known at build time)
  // For simplicity, directly using what's in next-i18next.config.js
  const supportedLocales = ['en', 'es']; // Removed 'ar', Portuguese 'pt' can be added later
  // A more robust way would be to get this from i18n.options.locales if populated by the config

  const { t: tCommon } = useTranslation('common'); // Ensure you have 'common' or your desired namespace

  return (
    <Box sx={{ minWidth: 120, m: 1 }}>
      <FormControl fullWidth size="small">
        <InputLabel id="language-select-label">{tCommon('languageSwitcherLabel', 'Language')}</InputLabel>
        <Select
          labelId="language-select-label"
          id="language-select"
          value={currentLanguage}
          label={tCommon('languageSwitcherLabel', 'Language')} // MUI Select requires label prop to be set for InputLabel animation
          onChange={handleLanguageChange}
        >
          {supportedLocales.map((locale) => (
            <MenuItem key={locale} value={locale}>
              {/* For more user-friendly names, you can map locale codes to full names */}
              {/* e.g., tCommon(`localeName_${locale}`, locale.toUpperCase()) */}
              {locale.toUpperCase()}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default LanguageSwitcher;
