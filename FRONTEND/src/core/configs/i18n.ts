import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import detector from 'i18next-browser-languagedetector'
import Backend from 'i18next-http-backend'

// Helper to get language safely
const getInitialLanguage = (): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('i18nextLng') || 'vi'
  }
  return 'vi'
}

i18n
  .use(detector)
  .use(Backend)
  .use(initReactI18next)
  .init({
    ns: ['common', 'auth', 'settings', 'product', 'toast', 'about_us', 'home', 'admin'],
    defaultNS: 'common',
    lng: getInitialLanguage(),
    fallbackLng: 'vi',
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json'
    },
    interpolation: { escapeValue: false }
  })

export default i18n
