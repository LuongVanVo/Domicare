import { CategoryMini } from './category.interface'
import { Review } from './review.interface'

export interface Product {
  id?: number
  name?: string
  description?: string
  price?: number
  image?: string
  ratingStar?: number
  discount?: number
  priceAfterDiscount?: number
  landingImages?: string[]
  categoryID?: number
  categoryMini?: CategoryMini
  reviewDTOs?: Review[]
  createBy?: string
  updateBy?: string
  createAt?: string
  updateAt?: string
}

export interface ProductResponse {
  meta: {
    page?: number
    size?: number
    total?: number
    totalPages?: number
  }
  data: Product[]
}

export interface ProductListConfig {
  page?: number
  size?: number
  sortBy?: 'price' | 'name' | 'discount' | 'overalRating'
  sortDirection?: 'desc' | 'asc'
  filter?: string
  categoryId?: number
  searchName?: string
}
export interface ProductRequest {
  categoryId: number
  description?: string
  mainImageId?: string
  name: string
  price: number
  discount: number
  landingImageIds?: number[]
  oldCategoryId?: number
  oldProductId?: number
}
