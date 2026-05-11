import { Person, pic7 } from '@/assets/images'
import CardItem from '@/components/CardItem'
import Company from './Company'
import SecctionInView from '@/components/SectionInView'
import FeatureCard from '@/components/FeatureCard'
import { Button } from '@/components/ui/button'
import { IconGood } from '@/assets/icons/icon-good'
import { IconQuickly } from '@/assets/icons/icon-quickly'
import { IconStaff } from '@/assets/icons/icon-staff'
import { Link, useNavigate } from 'react-router-dom'
import { path } from '@/core/constants/path'

import Comment from '@/components/Comment'
import Category from '@/components/Category'
import { Fragment } from 'react/jsx-runtime'
import { useContext, useEffect, useRef } from 'react'
import { AppContext } from '@/core/contexts/app.context'
import SectionBgGreen from '@/components/SectionBgGreen/SectionBgGreen'
import SectionBgWhite from '@/components/SectionBgWhite/SectionBgWhite'
import CountUp from 'react-countup'
import { Clock, Smile, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useParamsString } from '@/hooks/usePrdQueryConfig'
import { useGetMe } from '@/core/queries/user.query'
import { setAccessTokenToLS, setRefreshTokenToLS } from '@/utils/storage'
import { Toast } from '@/utils/toastMessage'

const HomePage = () => {
  const { categories } = useContext(AppContext)
  const { t } = useTranslation(['home', 'common'])
  const navigate = useNavigate()
  const { access_token, refresh_token } = useParamsString()
  const getMeMutation = useGetMe()
  const processedRef = useRef(false)

  // Xử lý OAuth callback
  useEffect(() => {
    if (access_token && refresh_token && !processedRef.current) {
      processedRef.current = true
      console.log('🔐 OAuth tokens received in HomePage')
      
      setAccessTokenToLS(access_token as string)
      setRefreshTokenToLS(refresh_token as string)
      getMeMutation.mutate()
    }
  }, [access_token, refresh_token])

  useEffect(() => {
    if (getMeMutation.isSuccess) {
      Toast.success({ 
        title: 'Thành công', 
        description: 'Đăng nhập với Google thành công! 🚀⚡' 
      })
      // Reload page để cập nhật context
      setTimeout(() => {
        window.location.href = '/'
      }, 1000)
    }
  }, [getMeMutation.isSuccess])

  useEffect(() => {
    if (getMeMutation.isError) {
      Toast.error({ 
        description: 'Không thể lấy thông tin người dùng!' 
      })
    }
  }, [getMeMutation.isError])
  
  const handleBooking = () => {
    navigate({ pathname: path.products })
  }
  return (
    <div className='w-full min-h-96 bg-secondary'>
      <div
        style={{ backgroundImage: `url('${pic7}')` }}
        className='bg-center min-h-[300px] md:min-h-[500px] lg:min-h-[800px] bg-no-repeat bg-cover'
      ></div>
      <SectionBgGreen>
        <h2 className='text-head text-black text-center py-5 font-semibold '>{t('our_partner')}</h2>
        <SecctionInView>
          <Company />
        </SecctionInView>
      </SectionBgGreen>
      <SectionBgWhite>
        <div className='flex flex-col justify-between items-center'>
          <h2 className='text-head text-black text-center py-5 font-semibold '>{t('impressive')}</h2>
          <p className='text-sub0  text-black text-justify md:text-center '>{t('impressive_description')}</p>

          <div className='w-full mo:w-auto flex flex-col mo:flex-row justify-between items-center gap-3 mt-10 mb-3 mo:gap-10'>
            <CardItem icon={<Clock />} sub={t('work_time')}>
              <CountUp end={600} start={0} suffix={'+'} duration={6} />
            </CardItem>
            <CardItem icon={<Users />} sub={t('number_of_followers')}>
              <CountUp end={11} start={0} suffix={'K'} prefix='+' duration={6} />
            </CardItem>
            <CardItem icon={<Smile />} sub={t('satisfied_customer')}>
              <CountUp end={99} start={0} suffix='%' duration={6} />
            </CardItem>
          </div>
        </div>
      </SectionBgWhite>
      <SectionBgGreen>
        <div className='flex flex-col sm:flex-row gap-4 items-start sm:max-w-7xl max-w-9/12 mx-auto mt-8'>
          <FeatureCard icon={<IconGood />} title={t('professional')} description={t('professional_description')} />
          <FeatureCard icon={<IconQuickly />} title={t('easy_to_use')} description={t('easy_to_use_description')} />
          <FeatureCard
            icon={<IconStaff />}
            title={t('standard_employee')}
            description={t('standard_employee_description')}
          />
        </div>
        <div className='flex justify-center my-5'>
          <Button
            onClick={handleBooking}
            className=' text-white text-xl  px-8 rounded-md py-6 bg-main hover:bg-main/80 transition duration-300 cursor-pointer'
          >
            {t('common:book_service')}
          </Button>
        </div>
      </SectionBgGreen>
      <SectionBgWhite>
        <div className='w-full py-20 px-4'>
          <h2 className=' text-head text-black text-center mb-6 md:mb-16 font-semibold '>{t('common:category')}</h2>
          <div className='flex justify-end items-center'>
            <Link to={path.products} className=' text-right text-black text-sub2 py-2 hover:underline duration-200'>
              {t('common:view_all')}
            </Link>
          </div>
          <div className='grid grid-cols-12 gap-2 md:gap-4'>
            <Fragment>
              {categories &&
                categories.slice(0, 4).map((cate) => {
                  return (
                    <div key={cate.id} className='col-span-6 md:col-span-3  '>
                      <Category category={cate} />
                    </div>
                  )
                })}
            </Fragment>
          </div>
        </div>
      </SectionBgWhite>
      <SectionBgGreen className='my-5'>
        <div className='flex flex-col justify-between items-center '>
          <h2 className='text-head text-black text-center py-5 font-semibold flex flex-col sm:flex-row gap-2 cursor-default mb-4 md:mb-10'>
            {t('customer_say')} <p className='text-main font-semibold'>DomiCare</p>
          </h2>
        </div>
        <SecctionInView>
          <div className='w-full flex justify-center'>
            <Comment />
          </div>
        </SecctionInView>
      </SectionBgGreen>
      <SectionBgWhite className=' p-4 h-[300px] md:h-[500px] relative mt-8'>
        <div className='grid h-full grid-cols-12 gap-4  '>
          <div className='md:col-start-5 md:col-span-8 col-span-12 z-20 '>
            <SecctionInView className='flex flex-col items-center justify-center gap-8 h-full'>
              <h2 className='text-black text-head text-center'>
                {t('why_choose')} <span className='text-main font-semibold'>Domicare</span>
                {t('why_choose_description')}
              </h2>
              <Link
                to={path.aboutUs}
                className='bg-brown rounded-sm text-center border duration-300 hover:bg-brown/80 uppercase text-white text-lg cursor-pointer w-4/6 py-2.5 md:py-4'
              >
                {t('common:learn_more')}
              </Link>
            </SecctionInView>
          </div>
        </div>

        <div
          className='absolute inset-0 bg-no-repeat bg-contain bg-left-bottom hidden md:block z-10'
          style={{ backgroundImage: `url(${Person})` }}
        ></div>
      </SectionBgWhite>
    </div>
  )
}

export default HomePage
