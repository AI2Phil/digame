import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { appWithTranslation } from 'next-i18next';
import LocalizedFormattingDemo from './LocalizedFormattingDemo';
import { useRouter } from 'next/router';

// Mock next/router as it's used by useTranslation -> i18n.language indirectly
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

// Mock i18n config
const mockI18nConfig = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es', 'ar'],
  },
  // if you have namespaces
  ns: ['common'],
  defaultNS: 'common',
};

// HOC for providing appWithTranslation context
const AppWithTranslation = appWithTranslation(({ children }) => <>{children}</>, mockI18nConfig);

// Mock translations that would normally come from public/locales/{lng}/common.json
// We only need to mock the keys used by LocalizedFormattingDemo for this test.
// A more robust solution might use `jest.mock('next-i18next', () => ({ ... }))`
// and provide a mock `useTranslation` hook.
// For this setup, appWithTranslation will try to load translations,
// which won't work in Jest unless configured.
// A simpler way is to directly mock useTranslation:
jest.mock('next-i18next', () => ({
  ...jest.requireActual('next-i18next'), // Import and retain default behavior
  useTranslation: (namespace) => {
    const translations = {
      en: {
        localizedFormattingDemoTitle: "Localized Formatting Demo (EN Test)",
        dateFormattingTitle: "Date Formatting (EN Test)",
        currentLanguage: "Current Language",
        exampleDateLabel: "Example Date",
        fullDate: "Full Date",
        shortDate: "Short Date",
        time: "Time",
        numberFormattingTitle: "Number Formatting (EN Test)",
        exampleNumberLabel: "Example Number",
        defaultNumber: "Default Number",
        currencyFormat: "Currency ({currencyCode})",
        percentageFormat: "Percentage"
      },
      es: {
        localizedFormattingDemoTitle: "Demostración de Formateo Localizado (ES Test)",
        // ... other es translations
      },
      ar: {
        localizedFormattingDemoTitle: "عرض تنسيق مترجم (AR Test)",
        // ... other ar translations
      }
    };
    const lang = useRouter().locale || 'en'; // Get locale from mocked router
    return {
      t: (key, fallbackOrOptions, options) => {
        const translation = translations[lang]?.[key] || fallbackOrOptions || key;
        if (typeof fallbackOrOptions === 'object' && fallbackOrOptions !== null) { // Interpolation
            options = fallbackOrOptions;
        }
        if (options && typeof options === 'object') {
            let result = translation;
            for (const interpKey in options) {
                result = result.replace(`{${interpKey}}`, options[interpKey]);
            }
            return result;
        }
        return translation;
      },
      i18n: {
        language: lang,
        changeLanguage: jest.fn(),
        dir: () => (lang === 'ar' ? 'rtl' : 'ltr'),
      },
    };
  },
}));


describe('LocalizedFormattingDemo', () => {
  beforeEach(() => {
    // Set default router mock for each test
    useRouter.mockReturnValue({
      locale: 'en', // Default to English for tests unless overridden
      pathname: '/',
      asPath: '/',
      query: {},
    });
  });

  test('renders titles and date/number formats in English', () => {
    render(<LocalizedFormattingDemo />);

    expect(screen.getByText('Localized Formatting Demo (EN Test)')).toBeInTheDocument();
    expect(screen.getByText('Date Formatting (EN Test)')).toBeInTheDocument();
    expect(screen.getByText('Number Formatting (EN Test)')).toBeInTheDocument();

    // Check for a formatted date snippet (e.g., year 2025)
    // Note: Exact date strings are locale-sensitive and fragile in tests.
    // Check for parts of the date or use regex.
    expect(screen.getByText(/June 24, 2025/i)).toBeInTheDocument(); // PPPP format for en-US

    // Check for a formatted number (commas for thousands in EN)
    expect(screen.getByText('1,234,567.89')).toBeInTheDocument(); // Default number format for EN

    // Check for currency (USD for EN)
    expect(screen.getByText(/\$\s*1,234,567\.89/)).toBeInTheDocument(); // Regex for USD currency

    // Check for percentage
    expect(screen.getByText(/75\.0%/)).toBeInTheDocument();
  });

  test('renders titles and date/number formats in Spanish when locale is es', () => {
    useRouter.mockReturnValue({
      locale: 'es', // Switch to Spanish
      pathname: '/',
      asPath: '/',
      query: {},
    });

    // Re-render or ensure the component picks up the new locale via context/provider if necessary.
    // With the direct mock of useTranslation, re-rendering is enough.
    render(<LocalizedFormattingDemo />);

    expect(screen.getByText('Demostración de Formateo Localizado (ES Test)')).toBeInTheDocument();

    // Example: Check for Spanish date format (e.g., "de" for month separator)
    // PPPP for 'es' is "martes, 24 de junio de 2025"
    expect(screen.getByText(/24 de junio de 2025/i)).toBeInTheDocument();

    // Example: Check for Spanish number format (dots for thousands, comma for decimal)
    // Intl.NumberFormat('es').format(1234567.89) -> "1.234.567,89"
    expect(screen.getByText('1.234.567,89')).toBeInTheDocument();

    // Currency for ES (EUR)
    // Intl.NumberFormat('es', { style: 'currency', currency: 'EUR' }).format(1234567.89)
    // -> "1.234.567,89 €" (space before € can vary, be careful with exact match)
    expect(screen.getByText(/1\.234\.567,89\s*€/)).toBeInTheDocument();
  });

  // Test for Arabic (ar) would be similar, checking for AR specific formats and text.
});
