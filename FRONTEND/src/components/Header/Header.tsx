import { logoSecond } from '@/assets/images'
import { path } from '@/core/constants/path'
import { Link } from 'react-router-dom'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  ListItem
} from '../ui/navigation-menu'
import classnames from 'classnames'
import { useContext, useState } from 'react'
import IconHeadphone from '@/assets/icons/icon-headphone'
import { AppContext } from '@/core/contexts/app.context'
import IconBar from '@/assets/icons/icon-bar'
import { useLogoutMutation } from '@/core/queries/auth.query'
import { useTranslation } from 'react-i18next'
import isEmpty from 'lodash/isEmpty'
import Contact from '../Contact'

export default function Header() {
  const { isAuthenticated, profile, categories } = useContext(AppContext)
  const { t } = useTranslation(['common', 'settings'])
  const [isShow, setIsShow] = useState<boolean>(false)

  const logoutMutation = useLogoutMutation()
  const handleLogout = () => {
    logoutMutation.mutate()
  }

  return (
    <header className='w-full h-10 md:h-16 z-50 relative mb-[64px] md:mb-0'>
      <div className='bg-secondary w-full h-10 md:h-16'>
        <div className='max-w-7xl mx-auto px-4 py-2 h-full flex justify-center md:justify-end items-center'>
          <a href='tel: 0986543xxx' type='phone'>
            <div className='flex justify-center items-center gap-1 cursor-pointer'>
              <IconHeadphone className='fill-black w-5 h-5  md:w-8 md:h-8' />
              <p className='text-black text-sm font-bold'> {t('support_customer')}</p>
            </div>
          </a>
        </div>
      </div>
      <div className='absolute top-10 md:top-[64px] mb-[64px] right-0 left-0 bg-white md:bg-white/80 h-[60px] md:h-[100px] z-90'>
        <div className='max-w-7xl mx-auto px-4  h-full flex justify-end items-center'>
          <div className='grid grid-cols-12 gap-4 w-full h-full'>
            <div className='col-span-8 md:col-span-3 order-2'>
              <div className='flex justify-center items-center h-full'>
                <Link to={path.home} className='flex justify-between items-center '>
                  <img className=' w-auto h-15 ' src={logoSecond} alt='logoDomicare' />
                </Link>
              </div>
            </div>
            <div className='col-span-7 order-2 hidden md:block'>
              <div className='flex h-full  items-center justify-center  gap-4 lg:gap-6 '>
                <NavigationMenu>
                  <NavigationMenuList>
                    <NavigationMenuItem>
                      <NavigationMenuTrigger>
                        <NavigationMenuLink asChild className={'hover:bg-transparent'}>
                          <Link to={path.products}>{t('category')}</Link>
                        </NavigationMenuLink>
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className='w-[200px] min-h-20 py-2 flex flex-col justify-center items-center gap-1  '>
                          {categories &&
                            categories.map((cate) => (
                              <ListItem
                                key={cate.id}
                                to={{
                                  pathname: path.products,
                                  search: `categoryid=${cate.id}`
                                }}
                                children={cate.name}
                              />
                            ))}
                          {isEmpty(categories) && <p>{t('empty_category')}</p>}
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                      <NavigationMenuLink asChild>
                        <Link to={path.blog}>{t('news')}</Link>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                      <NavigationMenuLink asChild>
                        <Link to={path.recuitment}>{t('recruitment')}</Link>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                      <NavigationMenuLink asChild>
                        <Link to={path.aboutUs}>{t('about_us')}</Link>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  </NavigationMenuList>
                </NavigationMenu>
              </div>
            </div>
            <div className='col-span-2 md:col-span-2 order-1 md:order-3'>
              <div className='flex h-full justify-end items-center '>
                {isAuthenticated && profile ? (
                  <NavigationMenu>
                    <NavigationMenuList>
                      <NavigationMenuItem>
                        <NavigationMenuTrigger className='!bg-transparent hover:!bg-transparent text-sm !text-tmain hover:!text-main duration-300 flex h-full justify-start md:justify-end items-center group cursor-pointer  w-full !p-0 !pl-0 md:!ml-4 md:!pr-0 '>
                          <div className='shrink-0 flex justify-center items-center  w-10 h-10  '>
                            <Avatar>
                              <AvatarImage
                                src={
                                  profile.avatar
                                    ? profile.avatar
                                    : 'https://photo.znews.vn/w660/Uploaded/mfnuy/2022_09_01/s1_1.jpg'
                                }
                                alt='@shadcn'
                              />
                              <AvatarFallback>CC</AvatarFallback>
                            </Avatar>
                          </div>
                          <p className='hidden md:block text-sm text-tmain group-hover:text-main md:max-w-23 lg:max-w-30 truncate duration-300  '>
                            {profile.name ? profile.name : profile.email}
                          </p>
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <ul className='w-[150px] min-h-10 py-2 flex flex-col justify-center items-center gap-1'>
                            <ListItem to={path.user.profile}>{t('settings:account')}</ListItem>
                            <ListItem to={path.user.history}>{t('settings:history')}</ListItem>
                            <ListItem to={path.user.settings}>{t('settings:settings')}</ListItem>

                            <ListItem to={path.login}>
                              <button onClick={handleLogout} className='cursor-pointer font-semibold'>
                                {t('logout')}
                              </button>
                            </ListItem>
                          </ul>
                        </NavigationMenuContent>
                      </NavigationMenuItem>
                    </NavigationMenuList>
                  </NavigationMenu>
                ) : (
                  <div className='flex justify-end h-full items-center '>
                    <Link
                      to={path.login}
                      className='rounded-sm  md:px-4 mo:!px-8 text-sub2 py-2 duration-300 md:bg-main md:text-white md:hover:bg-main/90 '
                    >
                      {t('login')}
                    </Link>
                  </div>
                )}

                {/* Đăng nhập */}
              </div>
            </div>
            <div className='col-span-2 order-3 md:hidden'>
              <button
                onClick={() => {
                  setIsShow((prev) => !prev)
                }}
                className='h-full w-full flex justify-end items-center p-2 pr-0 cursor-pointer'
              >
                <IconBar className='fill-black' />
              </button>
            </div>
          </div>
        </div>
        {/* popover */}
        <div
          className={classnames(
            'absotute top-[-100%] right-0 left-0 bg-white shadow h-80px] translate-y-[-80px] opacity-0 invisible duration-300 z-10',
            { 'translate-y-[0px] opacity-100 visible ': isShow }
          )}
        >
          <ul className='flex w-full flex-col justify-center items-center py-2'>
            <ListItem to={path.products}>
              <p className='text-sm text-tmain py-2 text-center line-clamp-2 group-hover:text-main duration-300'>
                {t('category')}
              </p>
            </ListItem>
            <ListItem to={path.blog}>
              <p className='text-sm text-tmain py-2 text-center line-clamp-2 group-hover:text-main duration-300'>
                {t('news')}
              </p>
            </ListItem>
            <ListItem to={path.recuitment}>
              <p className='text-sm text-tmain py-2 text-center line-clamp-2 group-hover:text-main duration-300'>
                {t('recruitment')}
              </p>
            </ListItem>
            <ListItem to={path.aboutUs}>
              <p className='text-sm text-tmain py-2 text-center line-clamp-2 group-hover:text-main duration-300'>
                {t('about_us')}
              </p>
            </ListItem>
          </ul>
        </div>
      </div>

      <Contact />
    </header>
  )
}
