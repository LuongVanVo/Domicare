import { path } from '@/core/constants/path'
import { Category as CategoryType } from '@/models/interface/category.interface'

import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function Category({ category }: { category: CategoryType }) {
  const { t } = useTranslation(['common'])
  return (
    <div>
      <div className='rounded-xs shadow w-full flex  flex-col gap-3  pt-0 group hover:shadow-xl hover:translate-y-[-5px] duration-300'>
        <Link
          to={{
            pathname: path.products,
            search: `categoryId=${category.id}`
          }}
          className='w-full h-40 sm:h-55 group relative'
        >
          <img src={category.image} className='w-full h-full object-center object-cover' alt={category.name} />
          <div className='absolute inset-0 bg-gray-400 opacity-0 group-hover:opacity-40 transition-opacity duration-300'></div>
        </Link>
        <div className='flex flex-col  h-35 px-3 mb-4 cursor-default'>
          <h3 className='text-black text-sub0 font-semibold line-clamp-2'>{category.name}</h3>
          <p className='text-gray text-sub2 text-justify grow line-clamp-3 mt-1 '>{category.description}</p>
          <Link
            to={{
              pathname: path.products,
              search: `categoryid=${category.id}`
            }}
          >
            <p className='text-left text-blue text-sub1 pt-0.5 cursor-pointer'>{t('learn_more')}</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
