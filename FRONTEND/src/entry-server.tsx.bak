import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderToString } from 'react-dom/server'
import App from './App'
import { StaticRouter } from 'react-router-dom'
import { AppProvider } from './core/contexts/app.context'
import { ThemeProvider } from './components/theme/theme-provider'
import { I18nextProvider } from 'react-i18next'
import i18n from './core/configs/i18n'
// Fix CommonJS import for react-helmet-async in production
import HelmetAsyncPkg from 'react-helmet-async'
const { HelmetProvider } = HelmetAsyncPkg as any

export function render(url: string) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchIntervalInBackground: false,
        refetchOnWindowFocus: false,
        retry: false
      }
    }
  })

  return renderToString(
    <StaticRouter location={url}>
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <ThemeProvider>
            <I18nextProvider i18n={i18n}>
              <AppProvider>
                <App />
              </AppProvider>
            </I18nextProvider>
          </ThemeProvider>
        </HelmetProvider>
      </QueryClientProvider>
    </StaticRouter>
  )
}
