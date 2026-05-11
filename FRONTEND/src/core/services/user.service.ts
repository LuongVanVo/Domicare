import axiosClient from './axios-client'
import { SuccessResponse } from '@/models/interface/response.interface'
import {
  roleAddRequest,
  User,
  UserListConfig,
  UserRequest,
  UserResponse,
  UserUpdateRequest
} from '@/models/interface/user.interface'

const API_USER_URL = '/users'
const API_GET_ME_URL = '/users/me'

export const userApi = {
  get: (params: UserListConfig) => {
    return axiosClient.get<SuccessResponse<UserResponse>>(API_USER_URL, { params })
  },
  delete: (id: number) => {
    return axiosClient.delete<SuccessResponse<null>>(`${API_USER_URL}/${id}/delete`)
  },
  update: (user: UserUpdateRequest) => {
    return axiosClient.patch<SuccessResponse<User>>(`${API_USER_URL}/update `, user)
  },
  getById: (id: number) => {
    return axiosClient.get<SuccessResponse<User>>(`${API_USER_URL}/${id}`)
  },
  addRole: (params: roleAddRequest) => {
    return axiosClient.patch<SuccessResponse<any>>(`${API_USER_URL}/update/roles`, params)
  },
  add: (user: UserRequest) => {
    return axiosClient.post<SuccessResponse<UserResponse>>(`${API_USER_URL}/admin`, user)
  },
  getMe: () => {
    return axiosClient.get<SuccessResponse<User>>(API_GET_ME_URL)
  }
}
