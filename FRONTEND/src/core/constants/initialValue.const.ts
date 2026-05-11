import { Review } from '@/models/interface/review.interface'
import i18next from 'i18next'

export const initialComment = {
  comment: i18next.t('comment_1'),
  address: ' Hoà Khánh',
  avatar: 'https://github.com/shadcn.png',
  gender: 'OTHER',
  name: 'Trung Ánh',
  rating: 5
}
export const getInitialReviews = (): Review[] => [
  {
    id: 1,
    rating: 5,
    comment: i18next.t('comment_1'),
    createAt: '2025-04-15T00:00:00Z',
    updateAt: undefined,
    createBy: 'Nhung Phan',
    updateBy: undefined,
    userId: 101,
    productId: 1001
  },
  {
    id: 2,
    rating: 5,
    comment: i18next.t('comment_2'),
    createAt: '2025-04-15T00:00:00Z',
    updateAt: undefined,
    createBy: 'Tô Loan',
    updateBy: undefined,
    userId: 102,
    productId: 1001
  },
  {
    id: 3,
    rating: 5,
    comment: i18next.t('comment_3'),
    createAt: '2025-04-15T00:00:00Z',
    updateAt: undefined,
    createBy: 'J97',
    updateBy: undefined,
    userId: 103,
    productId: 1001
  }
]

export const initialChangePW = {
  oldPassword: '',
  confirmPassword: '',
  newPassword: ''
}
export const initialParams = {
  page: '1',
  size: '10'
}
export const discountValues = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 99, 100]

export const tableLoadingData = {
  product: [
    i18next.t('admin:table.id'),
    i18next.t('admin:table.name'),
    i18next.t('admin:table.category_name'),
    i18next.t('admin:table.price'),
    i18next.t('admin:table.discount'),
    i18next.t('admin:table.price_after_discount'),
    i18next.t('admin:table.rating'),
    i18next.t('admin:table.created_at'),
    i18next.t('admin:table.updated_at'),
    ''
  ],
  category: [
    i18next.t('admin:table.id'),
    i18next.t('admin:table.name'),
    i18next.t('admin:table.product_count'),
    i18next.t('admin:table.created_at'),
    i18next.t('admin:table.updated_at')
  ],
  booking: [
    i18next.t('admin:table.id'),
    i18next.t('admin:table.customer_name'),
    i18next.t('admin:table.address'),
    i18next.t('admin:table.total_price'),
    i18next.t('admin:table.status'),
    i18next.t('admin:table.service_name')
  ],
  sale: [
    i18next.t('admin:table.id'),
    i18next.t('admin:table.name'),
    i18next.t('admin:table.email'),
    i18next.t('admin:table.phone'),
    i18next.t('admin:table.address'),
    i18next.t('admin:table.status'),
    i18next.t('admin:table.total_booking'),
    i18next.t('admin:table.success_rate'),
    i18next.t('admin:table.updated_at')
  ],
  user: [
    i18next.t('admin:table.id'),
    i18next.t('admin:table.name'),
    i18next.t('admin:table.email'),
    i18next.t('admin:table.phone'),
    i18next.t('admin:table.address'),
    i18next.t('admin:table.gender'),
    i18next.t('admin:table.status'),
    i18next.t('admin:table.booking_success'),
    i18next.t('admin:table.booking_failed'),
    i18next.t('admin:table.created_at'),
    i18next.t('admin:table.updated_at')
  ]
}
