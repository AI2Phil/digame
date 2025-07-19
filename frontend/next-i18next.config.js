/** @type {import('next-i18next').UserConfig} */
// NEXT-I18NEXT CONFIG - TEMPORARILY DISABLED
// TODO: Re-enable when implementing Spanish localization
// This config is disabled while i18n is deactivated to avoid duplicate /en/* pages

module.exports = {
  // Commented out to disable i18n functionality
  // i18n: {
  //   defaultLocale: 'en',
  //   locales: ['en', 'es'], // English and Spanish ready for future implementation
  // },
  // localePath: typeof window === 'undefined' ? require('path').resolve('./public/locales') : '/locales',
  // reloadOnPrerender: process.env.NODE_ENV === 'development',
  // debug: process.env.NODE_ENV === 'development',
};
