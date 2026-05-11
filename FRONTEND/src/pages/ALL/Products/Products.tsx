import Search from '@/components/Search'
import { usePrdQueryConfig } from '@/hooks/usePrdQueryConfig'
import { path } from '@/core/constants/path'

import Product from '@/components/Product'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

import { Fragment } from 'react/jsx-runtime'
import PaginationPage from '@/components/PaginationPage'
import SortProduct from './components/SortProduct'
import { useProductQuery } from '@/core/queries/product.query'
import { noPrdImg } from '@/assets/images'
import CategoryList from './components/CategoryList'
import { useTranslation } from 'react-i18next'

export default function Products() {
  const queryString = usePrdQueryConfig()
  const { t } = useTranslation(['product', 'common'])
  const { data: productsData, isLoading } = useProductQuery({ queryString })
  const prdList = productsData?.data.data.data
  const pageController = productsData?.data.data.meta

  return (
    <div className='bg-bg md:pt-25 '>
      <div className='max-w-7xl mx-auto p-4'>
        <Search queryString={queryString} />
        <div className='grid grid-cols-12 gap-3 lg:gap-6 p'>
          <div className=' col-span-12 md:col-span-3 w-full'>
            <CategoryList queryString={queryString} />
          </div>
          <div className='col-span-12 md:col-span-9 space-y-6 mb-4'>
            <div className='bg-white rounded-sm md:rounded-2xl'>
              <SortProduct pageSize={2} queryString={queryString} />
            </div>
            <div className='bg-white rounded-sm md:rounded-2xl'>
              {isLoading ? (
                <div className='grid grid-cols-12 gap-4 p-4'>
                  {Array(6)
                    .fill(0)
                    .map((_, index) => (
                      <Card key={index} className='col-span-6 lg:col-span-4 rounded-sm shadow  p-3'>
                        <Skeleton className=' w-full h-40 rounded-t-sm' />
                        <CardContent className='space-y-2 pt-4'>
                          <Skeleton className='h-4 w-3/4' />
                          <Skeleton className='h-12 w-full' />
                          <Skeleton className='h-5 w-20 mt-4' />
                        </CardContent>
                      </Card>
                    ))}
                </div>
              ) : (
                <div className='grid grid-cols-12 gap-4 p-4'>
                  {prdList && prdList.length > 0 ? (
                    <Fragment>
                      {prdList.map((prd) => {
                        return (
                          <div key={prd.id} className='col-span-6 lg:col-span-4'>
                            <Product product={prd} />
                          </div>
                        )
                      })}
                      <PaginationPage
                        currentPage={pageController?.page || 1}
                        pageSize={pageController?.totalPages || 10}
                        path={path.products}
                        queryString={queryString}
                      />
                    </Fragment>
                  ) : (
                    <div className='h-[500px] col-span-12 flex justify-center items-center '>
                      <div className='flex flex-col justify-center items-center'>
                        <img className='w-auto h-32' src={noPrdImg} alt='no_product' />
                        <p className='text-black text-center py-4'>{t('common:no_product')}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
