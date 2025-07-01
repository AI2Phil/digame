import React from 'react';
import { appWithTranslation } from 'next-i18next';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { SnackbarProvider } from 'notistack';
import { TenantProvider } from '../contexts/TenantContext';
import { AuthProvider } from '../contexts/AuthContext';

// Assuming you have a theme file, e.g., theme.js or similar
// import theme from '../styles/theme'; // Adjust path as necessary
// For now, let's use a default theme if one isn't readily available
import { createTheme } from '@mui/material/styles';
const defaultTheme = createTheme();


// Import global styles if you have them
// import '../styles/globals.css'; // Or your main CSS file like App.css or index.css if they contain global styles
// import '../App.css'; // Temporarily commented out due to PostCSS issues
import '../index.css'; // This also seems to be a global style sheet


const queryClient = new QueryClient();

function MyApp({ Component, pageProps }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={defaultTheme}> {/* Replace defaultTheme with your actual theme */}
        <CssBaseline /> {/* MUI's baseline CSS */}
        <SnackbarProvider maxSnack={3}> {/* Basic Notistack setup */}
          <AuthProvider>
            <TenantProvider>
              <Component {...pageProps} />
            </TenantProvider>
          </AuthProvider>
        </SnackbarProvider>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

// Make sure next-i18next.config.js is correctly set up
// and that you have your translation files in public/locales/{locale}/yourNamespace.json
export default appWithTranslation(MyApp);
