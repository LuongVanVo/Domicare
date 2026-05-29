import { IconStar } from '@/assets/icons/icon-star'
import { path } from '@/core/constants/path'
import { Product as ProductType } from '@/models/interface/product.interface'
import { urlSEO } from '@/utils/urlSEO'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function Product({ product }: { product: ProductType }) {
  const { t } = useTranslation(['common'])
  const isDiscount = Boolean(product?.discount && product.discount > 0)
  return (
    <div className='rounded-xs shadow w-full flex flex-col gap-3 pt-0 group hover:shadow-xl hover:-translate-y-1.5 duration-300 bg-white overflow-hidden'>
      <Link
        to={`${path.product}/${urlSEO(product.id ? product.id.toString() : '', product.name as string)}`}
        className='w-full h-40 sm:h-55 relative'
      >
        <img className='w-full h-full object-center object-cover' src={product.image} alt={product.name} />
        <div className='absolute inset-0 bg-gray-400 opacity-0 group-hover:opacity-40 transition-opacity duration-300'></div>
      </Link>

      <div className='relative flex flex-col px-3 pb-4 pt-0 cursor-default'>
        <div className='absolute left-0 right-0 bottom-0 bg-white bg-opacity-95 p-3 opacity-0 group-hover:opacity-100 translate-y-full group-hover:translate-y-0 transition-all duration-300 z-10'>
          <Link
            to={`${path.product}/${urlSEO(product.id ? product.id.toString() : '', product.name as string)}`}
            className='pointer-events-auto block'
          >
            <p className='text-gray text-sub2 text-justify line-clamp-4'>{product.description}</p>
          </Link>
        </div>

        <h3 className='text-black text-sub0 font-semibold line-clamp-2 min-h-[48px]'>{product.name}</h3>

        <p className='text-black text-sub1 font-bold'>
          {product.priceAfterDiscount
            ? product.priceAfterDiscount.toLocaleString('vi-VN')
            : product.price?.toLocaleString('vi-VN')}{' '}
          VNĐ
        </p>
        {isDiscount ? (
          <p className='text-red text-sub2 text-justify  line-clamp-3 '>
            {t('common:discount')} {product.discount}%
          </p>
        ) : (
          <p className='min-h-5 py-1'> </p>
        )}
        <div className='flex justify-between items-center z-0'>
          <Link
            className='flex items-center gap-2'
            to={`${path.product}/${urlSEO(product.id ? product.id.toString() : '', product.name as string)}`}
          >
            <p className='text-left text-blue text-sub1 pt-0.5 cursor-pointer'>{t('common:detail')}</p>
          </Link>
          <div className='flex items-center gap-1'>
            <p className='text-lg'>{product.ratingStar}</p>
            <IconStar />
          </div>
        </div>
      </div>
    </div>
  )
}
