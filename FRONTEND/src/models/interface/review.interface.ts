import { User } from './user.interface'

export interface Review {
  id?: number
  rating?: number
  comment?: string
  createAt?: string
  updateAt?: string
  createBy?: string
  updateBy?: string
  userId?: number
  productId?: number
  userDTO?: User
}

export interface ReviewRequest {
  rating: number
  comment?: string
  productId: number
}
