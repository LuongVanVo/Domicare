import { Product } from './product.interface'
import { PaginationResponse } from './response.interface'

export interface Category {
  id: number
  name?: string
  description?: string
  products?: Product[]
  image?: string
  createBy?: string
  updateBy?: string
  createAt?: string
  updateAt?: string
}
export interface CategoryMini {
  id?: number
  name: string
}
export interface CategoryResponse {
  meta: PaginationResponse
  data: Category[]
}
export interface CategoryRequest {
  name: string
  description?: string
  imageId?: string
}
export interface CategoryListConfig {
  page?: number
  size?: number
  searchName?: string
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
}
