import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import App from './App'
import './index.css'
import { Toaster } from './components/ui/sonner'
import { AppProvider } from './core/contexts/app.context'
import ScrollToTop from './app/layout/ScrollToTop'
import { ThemeProvider } from './components/theme/theme-provider'
import { HelmetProvider } from 'react-helmet-async'
import { I18nextProvider } from 'react-i18next'
import i18n from './core/configs/i18n'
import ErrorBoundary from './components/ErrorBoundary'
import { StrictMode } from 'react'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchIntervalInBackground: false,
      refetchOnWindowFocus: false,
      retry: false
    }
  }
})

const container = document.getElementById('root')!

const AppWithProviders = () => (
  <ErrorBoundary>
    <StrictMode>
      <BrowserRouter>
        <ToastContainer />
        <QueryClientProvider client={queryClient}>
          <HelmetProvider>
            <ThemeProvider>
              <ScrollToTop>
                <I18nextProvider i18n={i18n}>
                  <AppProvider>
                    <App />
                  </AppProvider>
                </I18nextProvider>
              </ScrollToTop>
            </ThemeProvider>
          </HelmetProvider>
          <Toaster richColors closeButton />
        </QueryClientProvider>
      </BrowserRouter>
    </StrictMode>
  </ErrorBoundary>
)

if (container.hasChildNodes()) {
  hydrateRoot(container, <AppWithProviders />)
} else {
  createRoot(container).render(<AppWithProviders />)
}
