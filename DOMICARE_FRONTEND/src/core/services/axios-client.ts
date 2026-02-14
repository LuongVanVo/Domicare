import config from '@/configs'

import { SuccessResponse } from '@/models/interface/response.interface'
import { clearLS, getAccessTokenFromLS, getRefreshTokenFromLS, setAccessTokenToLS, setRefreshTokenToLS } from '@/utils/storage'
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  HttpStatusCode,
  InternalAxiosRequestConfig
} from 'axios'
import isEqual from 'lodash/isEqual'

interface TokenResponse {
  access_token: string
  refresh_token?: string
  email: string
}

interface ExtendedAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean
}

let isRefreshing: boolean = false
type RefreshSubscriber = (token: string) => void
let refreshSubscribers: RefreshSubscriber[] = []

const addSubscriber = (callback: RefreshSubscriber): void => {
  refreshSubscribers.push(callback)
}

const onRefreshed = (token: string): void => {
  refreshSubscribers.forEach((callback) => callback(token))
  refreshSubscribers = []
}

const axiosClient: AxiosInstance = axios.create({
  baseURL: config.baseUrl,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = getAccessTokenFromLS()
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError): Promise<AxiosError> => {
    return Promise.reject(error)
  }
)

// Response interceptor
axiosClient.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    return response
  },
  async (error: AxiosError): Promise<AxiosError> => {
    const originalRequest = error.config as ExtendedAxiosRequestConfig
    const errorMessage = (error.response?.data as any)?.message?.toLowerCase() || ''

    console.log('🔴 API Error:', {
      url: originalRequest?.url,
      status: error.response?.status,
      message: (error.response?.data as any)?.message
    })

    if (!originalRequest) {
      return Promise.reject(error)
    }

    const isUnauthorized = error.response?.status === 401
    const isForbidden = error.response?.status === 403
    const isTokenExpired = errorMessage.includes('expired') || errorMessage.includes('token')
    
    if (
      error.response && 
      (isUnauthorized || (isForbidden && isTokenExpired)) && 
      !originalRequest._retry
    ) {
      if (!isRefreshing) {
        originalRequest._retry = true
        isRefreshing = true

        try {
          const refreshToken = getRefreshTokenFromLS()

          if (!refreshToken) {
            isRefreshing = false
            logout()
            return Promise.reject(error)
          }


          const response = await axios.post<SuccessResponse<TokenResponse>>(
            `${config.baseUrl}/auth/refresh-token`,
            { refresh_token: refreshToken }
          )

          if (isEqual(response.status, HttpStatusCode.Ok)) {
            const { access_token, refresh_token } = response.data.data

            setAccessTokenToLS(access_token)
            
            if (refresh_token) {
              setRefreshTokenToLS(refresh_token)
            }

            axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`

            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${access_token}`
            }

            onRefreshed(access_token)

            isRefreshing = false
            return axiosClient(originalRequest)
          } else {
            isRefreshing = false
            logout()
            return Promise.reject(error)
          }
        } catch (refreshError) {
          isRefreshing = false
          logout()
          return Promise.reject(refreshError)
        }
      } else {
        return new Promise((resolve, reject) => {
          addSubscriber((token: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`
            }
            resolve(axiosClient(originalRequest))
          })
          
          setTimeout(() => {
            reject(new Error('Refresh token timeout'))
          }, 10000)
        })
      }
    }

    return Promise.reject(error)
  }
)

const logout = (): void => {
  console.log('🚪 Logging out...')
  clearLS()
  window.dispatchEvent(new CustomEvent('auth:logout'))
  window.location.replace('/login')
}

export default axiosClient
