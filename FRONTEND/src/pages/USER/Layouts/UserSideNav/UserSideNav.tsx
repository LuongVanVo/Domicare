import { ListItem } from '@/components/ui/navigation-menu'
import { path } from '@/core/constants/path'
import { AppContext } from '@/core/contexts/app.context'
import { isActive } from '@/utils/isActiveLocation'
import classNames from 'classnames'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronUp, ClipboardList, KeyRound, Settings, SquarePen, User } from 'lucide-react'
import { useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'

export default function UserSideNav() {
  const { t } = useTranslation(['settings', 'common', 'auth'])
  const { profile } = useContext(AppContext)
  const [isShow, setIsShow] = useState<boolean>(false)
  const { pathname } = useLocation()

  return (
    <div className='flex flex-col justify-center items-start'>
      <div
        onClick={() => setIsShow((prev) => !prev)}
        className='flex w-full gap-2 items-center justify-center pb-5 md:pt-3 border-b border-b-gray-200 relative'
      >
        <div className='shrink-0 rounded-full overflow-hidden shadow'>
          <img src={profile?.avatar} className='w-10 h-10 object-cover' alt={profile?.email} />
        </div>
        <div className='grow overflow-hidden'>
          <p className='text-black font-semibold text-sm truncate'>
            {profile ? profile.name || profile.email : 'unknown'}
          </p>

          <Link to={path.user.profile} className='md:flex gap-1 items-center hidden'>
            <SquarePen className='!w-4 h-auto text-gray' />
            <p className='text-gray text-sm capitalize'>{t('edit_profile')}</p>
          </Link>
          <div className='flex gap-1 items-center md:hidden'>
            <SquarePen className='!w-4 h-auto text-gray' />
            <p className='text-gray text-sm capitalize'>{t('edit_profile')}</p>
          </div>
        </div>
        <div className='md:hidden flex items-center justify-center'>
          <div className='w-4 h-4 fill-black'>
            <ChevronUp className={classNames('w-5 h-auto text-black duration-200', { 'rotate-180': !isShow })} />
          </div>
        </div>
        <AnimatePresence>
          {isShow && (
            <motion.ul
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className='md:hidden absolute top-full left-0 right-0 bg-bg !z-99 overflow-hidden  pl-3 border-b border-gray-200'
            >
              <ListItem
                to={path.user.profile}
                LinkClassName='flex gap-4 py-2'
                className='text-black text-base group hover:translate-x-2.5 duration-300 hover:bg-transparent'
              >
                <User className='!w-6 h-auto text-blue' />
                <p
                  className={classNames('capitalize group-hover:text-main duration-300', {
                    'text-main font-semibold': isActive(path.user.profile, pathname)
                  })}
                >
                  {t('account')}
                </p>
              </ListItem>
              <ListItem
                to={path.user.history}
                LinkClassName='flex gap-4 py-2'
                className='text-black text-base group hover:translate-x-2.5 duration-300 hover:bg-transparent'
              >
                <ClipboardList className='!w-6 h-auto text-orange-400' />
                <p
                  className={classNames('capitalize group-hover:text-main duration-300', {
                    'text-main font-semibold': isActive(path.user.history, pathname)
                  })}
                >
                  {t('history')}
                </p>
              </ListItem>
              <ListItem
                to={path.user.change_password}
                LinkClassName='flex gap-4 py-2'
                className='text-black text-base group hover:translate-x-2.5 duration-300 hover:bg-transparent'
              >
                <KeyRound className='!w-6 h-auto text-yellow-600' />
                <p
                  className={classNames('capitalize group-hover:text-main duration-300', {
                    'text-main font-semibold': isActive(path.user.change_password, pathname)
                  })}
                >
                  {t('auth:change_password')}
                </p>
              </ListItem>
              <ListItem
                to={path.user.settings}
                LinkClassName='flex gap-4 py-2'
                className='text-black text-base group hover:translate-x-2.5 duration-300 hover:bg-transparent'
              >
                <Settings className='!w-6 h-auto text-gray-600' />
                <p
                  className={classNames('capitalize group-hover:text-main duration-300', {
                    'text-main font-semibold': isActive(path.user.settings, pathname)
                  })}
                >
                  {t('settings')}
                </p>
              </ListItem>
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
      <div className='mt-6 hidden md:block'>
        <ul className=' '>
          <ListItem
            to={path.user.profile}
            LinkClassName='flex gap-4 py-2'
            className='group text-base text-black hover:translate-x-2.5 duration-300 hover:bg-transparent'
          >
            <User className='!w-6 h-auto text-blue' />
            <p
              className={classNames('capitalize group-hover:text-main duration-300', {
                'text-main font-semibold': isActive(path.user.profile, pathname)
              })}
            >
              {t('account')}
            </p>
          </ListItem>
          <ListItem
            to={path.user.history}
            LinkClassName='flex gap-4 py-2'
            className='text-black text-base group hover:translate-x-2.5 duration-300 hover:bg-transparent'
          >
            <ClipboardList className='!w-6 h-auto text-orange-400' />
            <p
              className={classNames('capitalize group-hover:text-main duration-300', {
                'text-main font-semibold': isActive(path.user.history, pathname)
              })}
            >
              {t('history')}
            </p>
          </ListItem>
          <ListItem
            to={path.user.change_password}
            LinkClassName='flex gap-4 py-2'
            className='text-black text-base group hover:translate-x-2.5 duration-300 hover:bg-transparent'
          >
            <KeyRound className='!w-6 h-auto text-yellow-600' />
            <p
              className={classNames('capitalize group-hover:text-main duration-300', {
                'text-main font-semibold': isActive(path.user.change_password, pathname)
              })}
            >
              {t('auth:change_password')}
            </p>
          </ListItem>
          <ListItem
            to={path.user.settings}
            LinkClassName='flex gap-4 py-2'
            className='text-black text-base group hover:translate-x-2.5 duration-300 hover:bg-transparent'
          >
            <Settings className='!w-6 h-auto text-gray-600' />
            <p
              className={classNames('capitalize group-hover:text-main duration-300', {
                'text-main font-semibold': isActive(path.user.settings, pathname)
              })}
            >
              {t('settings')}
            </p>
          </ListItem>
        </ul>
      </div>
    </div>
  )
}
