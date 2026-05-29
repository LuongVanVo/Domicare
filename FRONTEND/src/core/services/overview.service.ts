import { DashboardData, DashboardListConfig, RevenueData } from '@/models/interface/dashboard.interface'
import axiosClient from './axios-client'
import { SuccessResponse } from '@/models/interface/response.interface'
import {
  MiniSale,
  roleAddRequest,
  User,
  UserRequest,
  UserResponse,
  UserUpdateRequest
} from '@/models/interface/user.interface'

const API_OVERVIEW_URL = '/users'
const API_TOPSALE_URL = '/dashboard/topsale'
const API_SUMMARY_URL = '/dashboard/summary'
const API_CHART_URL = '/dashboard/chart'

export const overviewApi = {
  getTopSale: (params: DashboardListConfig) => {
    return axiosClient.post<SuccessResponse<MiniSale[]>>(API_TOPSALE_URL, params)
  },
  getTotalRevenue: () => {
    return axiosClient.get<SuccessResponse<RevenueData>>(API_CHART_URL)
  },
  getSummary: (params: DashboardListConfig) => {
    return axiosClient.post<SuccessResponse<DashboardData>>(API_SUMMARY_URL, params)
  },
  delete: (id: number) => {
    return axiosClient.delete<SuccessResponse<null>>(`${API_OVERVIEW_URL}/${id}`)
  },
  update: (user: UserUpdateRequest) => {
    return axiosClient.put<SuccessResponse<User>>(API_OVERVIEW_URL, user)
  },
  getById: (id: number) => {
    return axiosClient.get<SuccessResponse<User>>(`${API_OVERVIEW_URL}/${id}`)
  },
  addRole: (params: roleAddRequest) => {
    return axiosClient.put<SuccessResponse<any>>(`${API_OVERVIEW_URL}/roles`, params)
  },
  add: (user: UserRequest) => {
    return axiosClient.post<SuccessResponse<UserResponse>>(API_OVERVIEW_URL, user)
  }
}
