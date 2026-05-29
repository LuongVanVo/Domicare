import { useEffect, useState } from 'react'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { ThemeToggle } from '@/components/theme/theme-toogle'
import HeaderSettings from '../HeaderSettings'
import { languagesDefault } from '@/configs/consts'
import { useTranslation } from 'react-i18next'
import { CardDescription } from '@/components/ui/card'

export default function SystemSetting() {
  const { i18n, t } = useTranslation(['settings', 'common'])
  const [language, setLanguage] = useState<string>('vi')

  // Initialize language from localStorage on client side only
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedLang = localStorage.getItem('i18nextLng') || 'vi'
      setLanguage(storedLang)
    }
  }, [])

  const handleChange = (lng: string) => {
    setLanguage(lng)
    i18n.changeLanguage(lng)
  }

  return (
    <HeaderSettings title={t('system_settings')} description={t('settings_description')}>
      {/* Language */}
      <div className='mb-6 max-w-xs mt-5'>
        <Label htmlFor='lang-select' className='mb-2 block text-lg text-mainStrong'>
          {t('language')}
        </Label>
        <Select value={language} onValueChange={handleChange}>
          <SelectTrigger id='lang-select'>
            <SelectValue placeholder={t('language_placeholder')} />
          </SelectTrigger>
          <SelectContent>
            {languagesDefault.map((lang) => (
              <SelectItem key={lang.code} value={lang.code}>
                {lang.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <CardDescription className='text-sm text-gray-500 mt-1'>{t('language_description')}</CardDescription>
      </div>
      {/* Theme */}
      <div className='mb-6'>
        <ThemeToggle />
      </div>
    </HeaderSettings>
  )
}
