import axiosClient from '@/core/services/axios-client'
import { SuccessResponse } from '@/models/interface/response.interface'
import { Review, ReviewRequest } from '@/models/interface/review.interface'

const API_REVIEW_URL = '/reviews/'

export const reviewApi = {
  post: (params: ReviewRequest) => {
    return axiosClient.post<SuccessResponse<Review>>(API_REVIEW_URL, params)
  },
  postUnlogin: (params: ReviewRequest) => {
    return axiosClient.post<SuccessResponse<Review>>(API_REVIEW_URL, params, {
      headers: {
        Authorization: null
      }
    })
  }
}
