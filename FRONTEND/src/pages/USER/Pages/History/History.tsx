import { useBookingQueryConfig } from '@/hooks/useBookingQueryConfig'
import SectionUser from '../../Layouts/SectionUser'
import { useContext } from 'react'
import { AppContext } from '@/core/contexts/app.context'
import { useUserBookingQuery } from '@/core/queries/product.query'
import StatusList from './StatusList'
import PaginationPage from '@/components/PaginationPage'
import { path } from '@/core/constants/path'
import { noPrdImg } from '@/assets/images'
import { formatCurrentcy } from '@/utils/format'
import { statusLabels } from '@/configs/consts'
import { BookingStatus } from '@/models/interface/booking.interface'
import Manage from './Manage'
import { useTranslation } from 'react-i18next'

export default function History() {
  const { profile } = useContext(AppContext)
  const queryString = useBookingQueryConfig({ userId: profile?.id })
  const { t } = useTranslation(['common'])
  const { data } = useUserBookingQuery({ queryString })
  const bookingList = data?.data?.data.data
  const pageController = data?.data?.data.meta

  return (
    <SectionUser title={t('history_title')} description={t('history_description')}>
      <div className='md:mx-2 pb-5 pt-1 overflow-hidden'>
        <StatusList queryString={queryString} />
        <div className=' rounded-xs py-3  bg-white '>
          {bookingList && bookingList.length > 0 ? (
            bookingList.map((item) => {
              return (
                <div key={item.id} className='my-2 p-4 bg-white max-w-7xl mx-auto border-b border-gray-200'>
                  <div className='grid grid-cols-12 '>
                    <div className='col-span-12 mo:col-span-8 flex items-center justify-start gap-4'>
                      <div className=' grow flex justify-start items-center gap-4 '>
                        <div className='flex justify-center items-center shrink-0 size-24 shadow overflow-hidden'>
                          <img
                            className='object-cover w-full h-full'
                            src={item.products?.[0].image}
                            alt={item.products?.[0].name}
                          />
                        </div>
                        <div className=''>
                          <p className=' text-black line-clamp-2 text-xl'>{item.products?.[0].name}</p>
                          <div className='flex justify-start items-center  cursor-default gap-1'>
                            <span className='text-gray text-sm line-through'>
                              {t('currency')}
                              {formatCurrentcy(item.products?.[0].price)}
                            </span>
                            <span className='text-sm text-mainStrong'>
                              {t('currency')}
                              {formatCurrentcy(item.totalPrice)}
                            </span>
                          </div>
                          <p className='text-sm text-black line-clamp-2'>
                            {t('service_type')}: {item.isPeriodic ? t('periodic') : t('one_time')}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className='col-span-12 mo:col-span-4 flex justify-end items-center'>
                      <div className=' mt-2 mo:mt-0 w-full'>
                        <div className='text-base text-right uppercase text-mainStrong'>
                          {statusLabels[(item?.bookingStatus as keyof typeof statusLabels) || BookingStatus.PENDING]}
                        </div>
                        <div className='flex justify-end mo:col-span-2 cursor-default gap-1 items-end'>
                          <p className='text-gray'>{t('total_price')}:</p>
                          <p className='text-mainStrong text-2xl line-clamp-1'>
                            {t('currency')}
                            {formatCurrentcy(item.totalPrice)}
                          </p>
                        </div>
                        <Manage queryString={queryString} booking={item} />
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className='flex flex-col justify-center items-center pt-5'>
              <img className='w-auto h-32' src={noPrdImg} alt='no_product' />
              <p className='text-black text-center py-4'>{t('empty_category')}</p>
            </div>
          )}
          <PaginationPage
            path={path.user.history}
            queryString={queryString}
            pageSize={pageController?.totalPages || 1}
            currentPage={pageController?.page || 1}
          />
        </div>
      </div>
    </SectionUser>
  )
}
