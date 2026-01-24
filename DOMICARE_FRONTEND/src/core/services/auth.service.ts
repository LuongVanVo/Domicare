import axiosClient from '@/core/services/axios-client'
import { LoginResponse, RegisterReponse, SentEmailResponse } from '@/models/interface/auth.interface'
import { SuccessResponse } from '@/models/interface/response.interface'
import { LoginType } from '@/models/types/login.type'
import { RegisterType } from '@/models/types/register.type'
const API_LOGIN_URL = '/auth/login'
const API_LOGOUT_URL = '/auth/logout'
const API_REGISTER_URL = '/auth/register'
const API_SENT_EMAIL_URL = '/auth/email/verify'
const API_RESET_PASS_URL = '/auth/email/reset-password'
const API_LOGIN_GOOGLE = '/auth/google/callback'

export const authApi = {
  login: (params: LoginType) => {
    return axiosClient.post<SuccessResponse<LoginResponse>>(API_LOGIN_URL, params)
  },
  register: (params: RegisterType) => {
    return axiosClient.post<SuccessResponse<RegisterReponse>>(API_REGISTER_URL, params)
  },
  resetPassword: (params: { email?: string }) => {
    return axiosClient.get<SuccessResponse<SentEmailResponse>>(API_RESET_PASS_URL, {
      params
    })
  },
  sentEmailAuth: (params: { email: string }) => {
    return axiosClient.get<SuccessResponse<SentEmailResponse>>(API_SENT_EMAIL_URL, {
      params
    })
  },
  logout: () => {
    return axiosClient.post<SuccessResponse<null>>(API_LOGOUT_URL)
  },
  loginWithGG: (params: { code: string }) => {
    return axiosClient.get<SuccessResponse<LoginResponse>>(API_LOGIN_GOOGLE, { params })
  }
}
