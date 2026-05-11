import SecctionInView from '@/components/SectionInView'
import Company from '../Home/Company'
import { pic8 } from '@/assets/images'
import { Link } from 'react-router-dom'
import { path } from '@/core/constants/path'
import Comment from '@/components/Comment'
import FeatureCard from '@/components/FeatureCard'
import SectionBgGreen from '@/components/SectionBgGreen'
import { getServices, useFeatures } from '@/core/constants/UI.const'
import { useTranslation } from 'react-i18next'

export default function AboutUs() {
  const { t } = useTranslation(['about_us', 'common'])
  const services = getServices()
  const features = useFeatures()
  return (
    <div className='w-full min-h-96 bg-secondary'>
      {/* banner */}
      <div
        style={{ backgroundImage: `url('${pic8}')` }}
        className='bg-left min-h-[300px] md:min-h-[500px] lg:min-h-[800px] bg-no-repeat bg-cover flex items-center'
      >
        <div className='w-7xl mx-auto p-4  cursor-default'>
          <div className='grid grid-cols-10 gap-4 w-full'>
            <div className='col-span-6 col-start-5  lg:col-start-4'>
              <div className='flex flex-col justify-center items-start'>
                <h2 className='text-head font-bold  '>{t('benefit')}</h2>
                <h2 className='text-main text-head font-bold'>DomiCare</h2>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* feature card */}
      <section className='bg-white min-h-[500px] flex items-center'>
        <div className='max-w-7xl mx-auto p-4'>
          <div className='flex flex-col items-center justify-center gap-4 mx-10 md:mx-4'>
            <h2 className='text-head font-semibold text-center cursor-default '>
              <span className='text-main pr-2'>DomiCare</span>
              {t('right_choice')}
            </h2>
            <p className='text-sub0 text-justify md:text-center font-semibold'>{t('reasons')}</p>
          </div>
          <div className='grid grid-cols-12 gap-5 mx-10 md:mx-4 mt-4 md:mt-8'>
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                classNameContainer='col-span-12 md:col-span-3'
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </div>
      </section>
      {/* commitment to quality */}
      <section className='bg-bg min-h-80 md:min-h-96 flex items-center'>
        <div className='max-w-7xl mx-auto p-4'>
          <div className='flex flex-col justify-between items-center mx-8 '>
            <h1 className='text-head text-black text-justify md:text-center py-8 font-bold  px-6 rounded-2xl border-3 md:border-5 border-[#000]'>
              {t('commit_1')} <span className='text-yellow '>{t('customer')}</span> {t('commit_2')}
            </h1>
          </div>
        </div>
      </section>
      {/* services */}
      <section className='bg-white min-h-[600px] flex items-center'>
        <div className='max-w-7xl mx-auto p-4'>
          <div className='flex flex-col justify-between items-center'>
            <h2 className='text-head text-black text-center py-3 font-semibold  flex justify-center gap-2 cursor-default mb-4 '>
              <p className='text-main font-semibold'>{t('expert')}</p> {t('common:cleaning')}
            </h2>
            <div className='grid  grid-cols-12 grid-rows-2 gap-6'>
              {services.map((service, index) => (
                <div
                  key={index}
                  className='col-span-6 md:col-span-4 rounded-sm shadow bg-yellowBg hover:translate-y-[-5px] duration-300 cursor-default'
                >
                  <FeatureCard
                    classNameContainer='pt-4'
                    textClassname=' text-greenStrong font-bold'
                    icon={service.icon}
                    title={service.title}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* comments */}

      <SectionBgGreen className='my-5'>
        <div className='flex flex-col justify-between items-center '>
          <h2 className='text-head text-black text-center py-5 font-semibold flex flex-col sm:flex-row gap-2 cursor-default mb-4 md:mb-10'>
            {t('customer_feedback')}
          </h2>
        </div>
        <SecctionInView>
          <div className='w-full flex justify-center'>
            <Comment />
          </div>
        </SecctionInView>
      </SectionBgGreen>
      <section className='bg-white min-h-80 flex items-center'>
        <div className='max-w-7xl mx-auto p-4'>
          <h2 className='text-head text-black text-center py-5 font-semibold flex-wrap flex justify-center gap-2 cursor-default mb-4 md:mb-10'>
            <p className='shrink-0'>{t('brand')}</p> <p className='text-main font-semibold'>DomiCare</p>
          </h2>
          <SecctionInView>
            <Company />
          </SecctionInView>
        </div>
      </section>

      <section className='bg-bg min-h-[300px] md:min-h-[400px] flex items-end  '>
        <div className='max-w-7xl mx-auto p-4 h-[300px] md:h-[400px] relative'>
          <div className='grid h-full grid-cols-12 gap-4  '>
            <div className=' col-span-12  '>
              <div className='flex flex-col items-center justify-center gap-8 h-full'>
                <h2 className='text-black text-head text-center'>{t('wait_no_more')}</h2>
                <Link
                  to={path.products}
                  className='bg-main font-semibold rounded-sm text-center border duration-300 hover:bg-main/80 capitalize text-white text-lg cursor-pointer w-[60%] mo:w-[40%] py-2.5 md:py-4'
                >
                  {t('common:book_service')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
