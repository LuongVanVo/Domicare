import { createSearchParams, useNavigate } from 'react-router-dom'
import omit from 'lodash/omit'
import classNames from 'classnames'
import { QueryPrdConfig } from '@/hooks/usePrdQueryConfig'
import { ProductListConfig } from '@/models/interface/product.interface'
import { path } from '@/core/constants/path'
import { sortDirection as direction, sortBy as sort_by } from '@/core/constants/product.const'
import { isActive } from '@/utils/isActiveLocation'
import { useTranslation } from 'react-i18next'

interface SortProductProps {
  queryString: QueryPrdConfig
  pageSize: number
}

export default function SortProduct({ queryString }: SortProductProps) {
  const navigate = useNavigate()
  const { t } = useTranslation(['product'])
  const { sortDirection = 'desc', sortBy = 'name' } = queryString
  const handleSort = (sortByValue: ProductListConfig['sortBy']) => {
    navigate({
      pathname: path.products,
      search: createSearchParams(
        omit(
          {
            ...queryString,
            sortBy: sortByValue || sort_by.name
          },
          ['order']
        )
      ).toString()
    })
  }
  const handleOrder = (value: ProductListConfig['sortDirection']) => {
    navigate({
      pathname: path.products,
      search: createSearchParams({
        ...queryString,
        sortDirection: value || direction.desc
      }).toString()
    })
  }

  return (
    <div className='bg-white py-4 px-3 rounded-xl'>
      <div className='flex justify-between items-center gap-2 flex-row  md:flex-row'>
        <div className='grid grid-cols-12 gap-2 w-full'>
          <div className='col-span-6 md:col-span-3 mo:!col-span-2  text-sm text-gray-600  flex justify-center items-center '>
            {t('sort_by')}
          </div>
          <button
            onClick={() => handleSort(sort_by.name as ProductListConfig['sortBy'])}
            className={classNames(
              'col-span-6 md:col-span-3 mo:!col-span-2  cursor-pointer py-2.5 capitalize rounded-[2px]  shadow hover:opacity-90 text-sm  lg:text-sm   duration-200',
              { 'bg-main text-white': isActive(sort_by.name, sortBy) },
              { 'bg-bg text-black': !isActive(sort_by.name, sortBy) }
            )}
          >
            {t('sort_by_name')}
          </button>
          <button
            onClick={() => handleSort(sort_by.price as ProductListConfig['sortBy'])}
            className={classNames(
              'col-span-6 md:col-span-3 mo:!col-span-2  cursor-pointer capitalize rounded-[2px] py-2.5 shadow hover:opacity-90 text-sm  lg:text-sm   duration-200',
              { 'bg-main text-white': isActive(sort_by.price, sortBy) },
              { 'bg-bg text-black': !isActive(sort_by.price, sortBy) }
            )}
          >
            {t('sort_by_price')}
          </button>
          <button
            onClick={() => handleSort(sort_by.discount as ProductListConfig['sortBy'])}
            className={classNames(
              'col-span-6 md:col-span-3 mo:!col-span-2  cursor-pointer capitalize rounded-[2px] py-2.5 shadow hover:opacity-90 text-sm  lg:text-sm   duration-200',
              { 'bg-main text-white': isActive(sort_by.discount, sortBy) },
              { 'bg-bg text-black': !isActive(sort_by.discount, sortBy) }
            )}
          >
            {t('sort_by_discount')}
          </button>
          <button
            onClick={() => handleSort(sort_by.ratingStar as ProductListConfig['sortBy'])}
            className={classNames(
              'col-span-6 md:col-span-3 mo:!col-span-2  cursor-pointer capitalize rounded-[2px] py-2.5 shadow hover:opacity-90 text-sm  lg:text-sm   duration-200',
              { 'bg-main text-white': isActive(sort_by.ratingStar, sortBy) },
              { 'bg-bg text-black': !isActive(sort_by.ratingStar, sortBy) }
            )}
          >
            {t('sort_by_rating')}
          </button>

          <select
            name='sortDirection'
            title='Sắp xếp'
            value={sortDirection}
            onChange={(event) => {
              handleOrder(event.target.value as ProductListConfig['sortDirection'])
            }}
            className={classNames(
              'col-span-6 md:col-span-3 mo:!col-span-2 text-center cursor-pointer focus:outline-0 capitalize rounded-[2px] py-2.5  hover:opacity-90 text-sm  lg:text-sm duration-200 bg-bg shadow flex justify-center items-center'
            )}
          >
            <option
              value={direction.desc}
              className='text-sm text-center  text-black  shadow lg:text-sm  my-1 px-2 capitalize'
            >
              {t('sort_by_desc')}
            </option>
            <option
              value={direction.asc}
              className='text-sm  text-center  shadow lg:text-sm text-black  my-1 px-2 capitalize'
            >
              {t('sort_by_asc')}
            </option>
          </select>
        </div>
      </div>
    </div>
  )
}
