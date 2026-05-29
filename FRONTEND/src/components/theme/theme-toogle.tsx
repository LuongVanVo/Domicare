import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'
import { useTheme } from '@/components/theme/theme-provider'
import classNames from 'classnames'
import isEqual from 'lodash/isEqual'
import { useTranslation } from 'react-i18next'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const { t } = useTranslation(['settings', 'common'])
  return (
    <div>
      <CardTitle className='mb-1 text-lg text-mainStrong'>{t('theme')}</CardTitle>
      <CardDescription className='mb-4 text-gray-500 dark:text-gray-400'>{t('theme_description')}</CardDescription>
      <div className='flex gap-6'>
        {/* Light Theme Card */}
        <Card
          onClick={() => setTheme('light')}
          className={classNames(
            'w-60 cursor-pointer transition-all border-2',
            {
              'border-primary shadow-lg': isEqual(theme, 'light'),
              'border-muted': !isEqual(theme, 'light')
            },
            'hover:border-primary'
          )}
        >
          <CardContent className='flex flex-col items-center p-4'>
            {/* Preview */}
            <div className='w-full h-20 rounded-md bg-gray-100 flex flex-col gap-2 p-3 mb-2'>
              <div className='h-3 w-1/2 bg-gray-300 rounded' />
              <div className='h-3 w-1/3 bg-gray-200 rounded' />
              <div className='flex gap-2'>
                <div className='h-3 w-3 bg-gray-300 rounded-full' />
                <div className='h-3 w-2/3 bg-gray-200 rounded' />
              </div>
              <div className='flex gap-2'>
                <div className='h-3 w-3 bg-gray-300 rounded-full' />
                <div className='h-3 w-2/3 bg-gray-200 rounded' />
              </div>
            </div>
            <span className={classNames('font-medium', { 'text-primary': isEqual(theme, 'light') })}>{t('light')}</span>
          </CardContent>
        </Card>

        <Card
          // chưa lam dark theme
          onClick={() => setTheme('light')}
          className={classNames(
            'w-60 cursor-pointer transition-all border-2',
            {
              'border-primary shadow-lg ': isEqual(theme, 'dark'),
              'border-muted': !isEqual(theme, 'dark')
            },
            'hover:border-primary bg-[#151a23]'
          )}
        >
          <CardContent className='flex flex-col items-center p-4'>
            {/* Preview */}
            <div className='w-full h-20 rounded-md bg-[#232b3a] flex flex-col gap-2 p-3 mb-2'>
              <div className='h-3 w-1/2 bg-[#4b5a6a] rounded' />
              <div className='h-3 w-1/3 bg-[#3a4656] rounded' />
              <div className='flex gap-2'>
                <div className='h-3 w-3 bg-[#4b5a6a] rounded-full' />
                <div className='h-3 w-2/3 bg-[#3a4656] rounded' />
              </div>
              <div className='flex gap-2'>
                <div className='h-3 w-3 bg-[#4b5a6a] rounded-full' />
                <div className='h-3 w-2/3 bg-[#3a4656] rounded' />
              </div>
            </div>
            <span className={classNames('font-medium text-white')}>{t('dark')}</span>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
