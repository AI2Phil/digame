import React from 'react';
import { useTranslation } from 'next-i18next';
import { format } from 'date-fns';
import { enUS, es, arSA } from 'date-fns/locale'; // Import desired locales (arSA for Arabic (Saudi Arabia) as an example)
import { Paper, Typography, Grid, Box } from '@mui/material';

const localeMap = {
  en: enUS,
  es: es,
  ar: arSA, // Using arSA for Arabic example, can be other variants like arEG, etc.
};

const LocalizedFormattingDemo = () => {
  const { i18n, t } = useTranslation('common'); // Assuming 'common' namespace has a greeting or title
  const currentLocaleCode = i18n.language || 'en';
  const dateFnsLocale = localeMap[currentLocaleCode] || enUS;

  const exampleDate = new Date(2025, 5, 24, 14, 30, 0); // June 24, 2025, 2:30 PM
  const exampleNumber = 1234567.89;

  // Date formatting examples
  const formattedDateFull = format(exampleDate, 'PPPPpppp', { locale: dateFnsLocale });
  const formattedDateShort = format(exampleDate, 'P', { locale: dateFnsLocale });
  const formattedTime = format(exampleDate, 'pp', { locale: dateFnsLocale });

  // Number formatting examples
  // Basic number formatting
  const formattedNumberDefault = new Intl.NumberFormat(currentLocaleCode).format(exampleNumber);

  // Currency formatting (example: USD, EUR, SAR)
  // Note: For currency, it's best if the currency code is also dynamic or context-aware
  let currencyCode = 'USD';
  if (currentLocaleCode === 'es') currencyCode = 'EUR';
  if (currentLocaleCode === 'ar') currencyCode = 'SAR';

  const formattedCurrency = new Intl.NumberFormat(currentLocaleCode, {
    style: 'currency',
    currency: currencyCode,
  }).format(exampleNumber);

  // Percentage formatting
  const examplePercentage = 0.75;
  const formattedPercentage = new Intl.NumberFormat(currentLocaleCode, {
    style: 'percent',
    minimumFractionDigits: 1,
  }).format(examplePercentage);

  return (
    <Paper elevation={3} sx={{ p: 3, m: 2 }}>
      <Typography variant="h5" gutterBottom>
        {t('localizedFormattingDemoTitle', 'Localized Formatting Demo')}
      </Typography>

      <Box my={2}>
        <Typography variant="h6" gutterBottom>{t('dateFormattingTitle', 'Date Formatting')}</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1">{t('currentLanguage', 'Current Language')}: {currentLocaleCode.toUpperCase()}</Typography>
            <Typography variant="body1">{t('exampleDateLabel', 'Example Date')}: {exampleDate.toString()}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body1"><strong>{t('fullDate', 'Full Date')}:</strong> {formattedDateFull}</Typography>
            <Typography variant="body1"><strong>{t('shortDate', 'Short Date')}:</strong> {formattedDateShort}</Typography>
            <Typography variant="body1"><strong>{t('time', 'Time')}:</strong> {formattedTime}</Typography>
          </Grid>
        </Grid>
      </Box>

      <Box my={2}>
        <Typography variant="h6" gutterBottom>{t('numberFormattingTitle', 'Number Formatting')}</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1">{t('exampleNumberLabel', 'Example Number')}: {exampleNumber}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body1"><strong>{t('defaultNumber', 'Default Number')}:</strong> {formattedNumberDefault}</Typography>
            <Typography variant="body1"><strong>{t('currencyFormat', 'Currency ({currencyCode})', { currencyCode })}:</strong> {formattedCurrency}</Typography>
            <Typography variant="body1"><strong>{t('percentageFormat', 'Percentage')}:</strong> {formattedPercentage}</Typography>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default LocalizedFormattingDemo;
