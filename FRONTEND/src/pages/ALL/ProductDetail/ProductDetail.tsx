import { pic13 } from '@/assets/images'
import SectionBgGreen from '@/components/SectionBgGreen'
import SectionBgWhite from '@/components/SectionBgWhite'
import { AppContext } from '@/core/contexts/app.context'
import isEqual from 'lodash/isEqual'
import { Fragment, useContext, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import SectionInView from '@/components/SectionInView'
import { CalendarIcon, FlameIcon, MapPin, User } from 'lucide-react'
import RatingStars from '@/components/RatingStars/RatingStars'
import Comment from '@/components/Comment'
import { formatCurrentcy } from '@/utils/format'
import Product from '@/components/Product'
import { useForm } from 'react-hook-form'
import { BookingSchema } from '@/core/zod/booking.zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { IconMail } from '@/assets/icons/icon-mail'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/core/lib/utils'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { isPeriodic } from '@/core/constants/booking.const'
import { formatDateTime } from '@/core/helpers/date-time'
import { STANDARD_DATE_FORMAT_INVERSE } from '@/configs/consts'
import dayjs from 'dayjs'
import Slider from './components/Slider'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import WriteReview from './components/WriteReview'
import { useBookingMutation, usePrdDetailQuery } from '@/core/queries/product.query'
import { format } from 'date-fns/format'
import { scroller } from 'react-scroll'
import Helmet from '@/components/Helmet/Helmet'
import { useTranslation } from 'react-i18next'
import Payment from './components/Payment'

export default function ProductDetail() {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const { t } = useTranslation(['product', 'common', 'auth'])
  const { pathname } = useLocation()
  const pathString = pathname.split('$d$')
  const id = Number(pathString[pathString.length - 1] || 1)
  const { profile } = useContext(AppContext)
  const { categories } = useContext(AppContext)
  const { data } = usePrdDetailQuery({ id })
  const path = useLocation()
  const location = path.state?.location
  // form
  const form = useForm<z.infer<typeof BookingSchema>>({
    resolver: zodResolver(BookingSchema),
    defaultValues: {
      guestEmail: profile?.email || '',
      address: profile?.address || '',
      startTime: undefined,
      name: profile?.name || '',
      note: '',
      phone: profile?.phone || '',
      isPeriodic: 'false'
    }
  })
  const handleShowPayment = () => {
    setIsOpen((prev) => !prev)
  }
  const mutationBooking = useBookingMutation(handleShowPayment)
  const handleBooking = () => {
    const data = form.getValues()
    const dataAPI = {
      ...data,
      isPeriodic: isEqual(data.isPeriodic, isPeriodic.month) ? true : false,
      startTime: data.startTime.toISOString(),
      productIds: [Number(id)],
      phone: data.phone.toString()
    }
    const isLogin = profile ? true : false
    if (isLogin) {
      delete dataAPI.guestEmail
    }
    mutationBooking.mutate({ dataAPI, isLogin })
  }

  const product = data && data.data.data
  const category = categories?.find((item) => isEqual(item.id, Number(product?.categoryID)))
  const isSale = product && !isEqual(product?.discount, 0)
  useEffect(() => {
    if (location && product) {
      scroller.scrollTo(location, { smooth: true, duration: 1000 })
    }
  }, [location, product])

  return (
    <div className='md:pt-25 '>
      {product ? (
        <Fragment>
          <Helmet title={product?.name} description={product?.description} />
          <section className='bg-linear-to-br from-gray-100 to-slate-50 '>
            <div className='max-w-6xl mx-auto py-10 flex items-center px-4'>
              <h1 className='text-head font-semibold md:mr-12 w-full md:w-1/2 lg:w-2/3 text-center md:text-left'>
                <span className='text-main font-bold text-justify'>{t('common:catalog')}:</span> {category?.name}
              </h1>
              <div className='lg:w-1/3 md:w-1/2 md:block rounded-sm hidden'>
                <img src={category?.image} alt={category?.name} className='w-full h-auto object-cover' />
              </div>
            </div>
          </section>
          <SectionBgWhite>
            <div className=' grid grid-cols-1 md:grid-cols-12 gap-6  p-4'>
              <div className='col-span-1 md:col-span-4'>
                <Slider images={[product?.image || '', ...(product?.landingImages || [])].filter(Boolean)} />
              </div>
              <div className='col-span-1 md:col-span-8'>
                <SectionInView className='w-full h-full flex-col flex justify-center md:px-20'>
                  <h2 className='text-head font-semibold self-center text-center  md:text-left py-4'>
                    <span className='text-main font-bold text-justify mr-2'>{t('common:service')}:</span>
                    {product?.name}
                  </h2>
                  <p className='text-gray text-base text-justify'>{product?.description}</p>
                </SectionInView>
              </div>
            </div>
          </SectionBgWhite>

          <SectionBgGreen className='p-4 min-h-[300px] md:min-h-[600px] relative mt-8 w-6xl'>
            <h3 className='w-full text-center text-head font-semibold md:pb-10'>
              {t('service_package')} <span className='text-main text-head ml-2 z-10 font-bold'>DomiCare</span>
            </h3>
            <div className='grid h-full grid-cols-12 gap-4  '>
              <div className=' md:col-span-8 col-span-12 z-20 '>
                <SectionInView className='flex flex-col items-center justify-center gap-8 h-full py-8'>
                  {isSale ? (
                    <div className='flex flex-col items-center py-30 border-2 border-dashed rounded-lg border-gray px-10 '>
                      <span className='text-red-600 font-semibold px-4 py-2 rounded-3xl bg-orange-300 flex justify-center items-center'>
                        <FlameIcon />
                        {t('common:discount')} {product?.discount}%
                      </span>
                      <p className='text-head text-gray font-bold line-through'>
                        {formatCurrentcy(product?.price)} {t('common:currency')}
                      </p>
                      <p className='text-head text-main font-bold'>
                        {formatCurrentcy(product?.priceAfterDiscount)} {t('common:currency')}
                      </p>
                    </div>
                  ) : (
                    <div className='flex flex-col items-center py-30 border-2 border-dashed rounded-lg border-gray px-10'>
                      <p className='text-head text-gray  font-bold'>
                        {formatCurrentcy(product?.priceAfterDiscount)} {t('common:currency')}
                      </p>
                    </div>
                  )}
                </SectionInView>
              </div>
            </div>
            <div
              className='absolute inset-0 bg-no-repeat bg-contain bg-right-bottom !z-0 hidden md:block'
              style={{ backgroundImage: `url(${pic13})` }}
            />
          </SectionBgGreen>

          <SectionBgWhite id='rating'>
            <h2 className='text-head font-semibold text-center py-10'>{t('rating_and_comment')}</h2>
            <div className='grid grid-cols-12 gap-6 w-full md:w-2xl lg:w-4xl  xl:w-6xl'>
              <div className='col-span-12 md:col-span-6 flex flex-col items-center md:py-10'>
                <RatingStars
                  activeClassname='h-8 w-8 fill-yellow-300 text-yellow-300'
                  nonActiveClassname='h-8 w-8 fill-current text-gray-300'
                  rating={product.ratingStar || 0}
                />
                <div className='text-head font-bold mb-2'>{product.ratingStar}</div>
                <p className='text-lg text-gray'>
                  {product.reviewDTOs && product.reviewDTOs.length} {t('rating_count')}
                </p>
                <WriteReview productId={id} />
              </div>
              <div className='col-span-12 md:col-span-6 md:pb-5'>
                {product.reviewDTOs && product.reviewDTOs.length > 0 ? (
                  <Comment reviews={product.reviewDTOs} />
                ) : (
                  <h3 className='text-head font-semibold text-center py-5 px-8'>{t('service_no_rating')}</h3>
                )}
              </div>
              <div className='col-span-12 py-4'></div>
            </div>
          </SectionBgWhite>
          <SectionBgGreen id='booking'>
            <h2 className='text-head font-semibold text-center py-5 md:py-10'>{t('common:book_service')}</h2>
            <div className='grid grid-cols-12 gap-4'>
              <div className='order-2 md:order-0 col-span-12 md:col-span-6 flex justify-end'>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(handleBooking)}
                    className='w-full md:w-[90%]  space-y-2 px-4 mb-10'
                    noValidate
                  >
                    {!profile && (
                      <FormField
                        control={form.control}
                        name='guestEmail'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('auth:email')}</FormLabel>
                            <FormControl>
                              <Input
                                autoComplete='off'
                                placeholder={t('auth:email_placeholder')}
                                type='email'
                                className='w-full focus:outline-0 mt-1'
                                {...field}
                                icon={<IconMail />}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name='name'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('common:full_name')}</FormLabel>
                          <FormControl>
                            <Input
                              autoComplete='off'
                              placeholder={t('auth:full_name_placeholder')}
                              type='text'
                              className='w-full focus:outline-0 mt-1'
                              {...field}
                              icon={<User />}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className='flex gap-2'>
                      <FormField
                        control={form.control}
                        name='phone'
                        render={({ field }) => (
                          <FormItem className='basis-1/2'>
                            <FormLabel>{t('auth:phone')}</FormLabel>
                            <FormControl>
                              <Input
                                autoComplete='off'
                                placeholder={t('auth:phone_placeholder')}
                                type='text'
                                className='w-full focus:outline-0 mt-1'
                                {...field}
                                icon={<IconMail />}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name='startTime'
                        render={({ field }) => (
                          <FormItem className='basis-1/2'>
                            <FormLabel>{t('auth:time')}</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={'secondary'}
                                    className={cn(
                                      'w-full text-left justify-start mt-1 h-9.5 relative',
                                      !field.value && 'text-muted-foreground'
                                    )}
                                  >
                                    {field.value ? (
                                      formatDateTime(dayjs(field.value), STANDARD_DATE_FORMAT_INVERSE)
                                    ) : (
                                      <span>{t('auth:select_time')}</span>
                                    )}

                                    <CalendarIcon className='absolute right-2.5 ml-auto !h-6 !w-6' />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className='w-auto p-0' align='start'>
                                <Calendar
                                  mode='single'
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) => date < new Date('1900-01-01')}
                                  initialFocus
                                  formatters={{
                                    formatCaption: (date) => format(date, 'MM - yyyy')
                                  }}
                                />
                              </PopoverContent>
                            </Popover>

                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name='address'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('auth:address')}</FormLabel>
                          <FormControl>
                            <Input
                              placeholder={t('auth:address_placeholder')}
                              autoComplete='off'
                              className='w-full focus:outline-0 mt-1'
                              {...field}
                              icon={<MapPin />}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name='isPeriodic'
                      render={({ field }) => (
                        <FormItem className='flex items-center gap-4'>
                          <FormLabel className='mt-2'>{t('common:service_type')}</FormLabel>
                          <FormControl>
                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className='flex'>
                              <FormItem className='flex items-center space-x-3 space-y-0'>
                                <FormControl>
                                  <RadioGroupItem value={isPeriodic.oneTime} />
                                </FormControl>
                                <FormLabel className=' cursor-pointer'>{t('common:one_time')}</FormLabel>
                              </FormItem>
                              <FormItem className='flex items-center space-x-3 space-y-0'>
                                <FormControl>
                                  <RadioGroupItem value={isPeriodic.month} />
                                </FormControl>
                                <FormLabel className=' cursor-pointer'>{t('common:periodic')}</FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name='note'
                      render={({ field }) => (
                        <FormItem className='mb-4'>
                          <FormLabel>{t('common:note')}</FormLabel>
                          <FormControl>
                            <Textarea className='bg-white border-gray-200 h-20' id='note' {...field}></Textarea>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      loading={mutationBooking.isPending}
                      className='w-full capitalize text-lg cursor-pointer text-white h-12 bg-main py-3 hover:bg-main/80 duration-300 hover:shadow-lg '
                      type='submit'
                    >
                      {t('common:leave_info')}
                    </Button>
                  </form>
                </Form>
              </div>
              <div className='order-1 col-span-12 md:col-span-6 h-full flex justify-start items-center'>
                <p className='text-base md:text-xl text-justify md:pb-10 pb-5 px-5 mo:pr-20 '>
                  <span className='text-main mr-2 font-semibold'>Domicare Company</span> {t('company_infor')}
                </p>
              </div>
            </div>
          </SectionBgGreen>

          <SectionBgWhite>
            <h2 className='text-head font-semibold text-center py-10 '>{t('learn_more_our_services')}</h2>
            <div className='grid grid-cols-12 gap-4 mb-10'>
              {category?.products &&
                category?.products.map((prd) => {
                  return (
                    <div key={prd.id} className='col-span-6 mo:col-span-4 lg:col-span-3'>
                      <Product product={prd} />
                    </div>
                  )
                })}
            </div>
          </SectionBgWhite>
        </Fragment>
      ) : (
        <div className='max-w-7xl mx-auto p-2'>
          <div className='w-full flex flex-col md:flex-row gap-10 p-4'>
            <div className='w-full flex flex-col items-center md:w-1/2 md:max-w-[400px]'>
              <div className='relative pt-[100%] w-full overflow-hidden rounded-md'>
                <Skeleton className='absolute top-0 left-0 w-full h-full' />
              </div>

              <div className='w-full flex gap-2 mt-4'>
                {[...Array(4)].map((_, index) => (
                  <div key={index} className='h-20 relative w-1/4'>
                    <Skeleton className='absolute top-0 left-0 w-full h-full' />
                  </div>
                ))}
              </div>
            </div>

            <div className='w-full md:flex-1'>
              <div className='space-y-4'>
                <Skeleton className='h-8 w-1/3' />
                <div className='flex gap-3'>
                  <Skeleton className='h-10 w-full' />
                  <Skeleton className='h-10 w-full max-w-[180px]' />
                </div>
                <Skeleton className='h-10 w-full' />
                <div className='flex gap-6 items-center'>
                  <Skeleton className='h-5 w-5 rounded-full' />
                  <Skeleton className='h-5 w-20' />
                  <Skeleton className='h-5 w-5 rounded-full' />
                  <Skeleton className='h-5 w-20' />
                </div>
                <Skeleton className='h-30 w-full' />
                <Skeleton className='h-10 w-1/3 rounded-md' />
              </div>

              <div className='mt-6'>
                <Skeleton className='h-4 w-[80%] mb-2' />
                <Skeleton className='h-4 w-[90%] mb-2' />
                <Skeleton className='h-4 w-[70%]' />
              </div>
            </div>
          </div>
        </div>
      )}

      <Payment product={product} isOpen={isOpen} setIsOpen={setIsOpen} />
    </div>
  )
}
