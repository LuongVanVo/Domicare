import { path } from '@/core/constants/path'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

export const IconLeftArrow = (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    fill='none'
    viewBox='0 0 24 24'
    strokeWidth={1.5}
    stroke='currentColor'
    className='w-6 h-6'
  >
    <path strokeLinecap='round' strokeLinejoin='round' d='M6.75 15.75L3 12m0 0l3.75-3.75M3 12h18' />
  </svg>
)
const PageNotFound = () => {
  const { t } = useTranslation(['common'])
  return (
    <div className='flex bg-bg flex-col items-center justify-center h-[500px] mt-20'>
      <h1 className='font-bold text-7xl'>404</h1>
      <h2 className='mb-5'>Page not found</h2>
      <Link to={path.home} className='flex items-center gap-2 hover:text-primary'>
        {IconLeftArrow}
        {t('common:home')}
      </Link>
    </div>
  )
}

export default PageNotFound
