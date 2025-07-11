import '../src/styles/globals.css'
import '../src/App.css'
import '../src/styles/theme.css'
import { ThemeProvider } from '../src/contexts/ThemeContext'
import { ToastProvider } from '../src/components/ui/Toast'
import { AuthProvider } from '../src/contexts/AuthContext.tsx'
import LanguageSwitcher from '../src/components/Layout/LanguageSwitcher'

export default function App({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider position="top-right">
          <div className="App">
            <LanguageSwitcher />
            <Component {...pageProps} />
          </div>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}