import { FileResponse } from '@/models/interface/file.interface'
import axiosClient from './axios-client'
import { SuccessResponse } from '@/models/interface/response.interface'

const API_FILE_URL = '/api/cloudinary/files'
const API_FILE_URL_MULTIPLE = '/api/cloudinary/files/multiple'

export const fileApi = {
  getAll: () => {
    return axiosClient.get<SuccessResponse<FileResponse[]>>(`${API_FILE_URL}/all`)
  },
  post: (body: FormData, config = {}) => {
    return axiosClient.post<SuccessResponse<FileResponse>>(API_FILE_URL, body, {
      headers: { 'Content-Type': 'multipart/form-data' },
      ...config
    })
  },
  postMultiple: (body: FormData) => {
    return axiosClient.post<SuccessResponse<FileResponse[]>>(API_FILE_URL_MULTIPLE, body, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  delete: (id: number) => {
    return axiosClient.delete<SuccessResponse<null>>(`${API_FILE_URL}/${id}`)
  },
  getById: (id: number) => {
    return axiosClient.get<SuccessResponse<File>>(`${API_FILE_URL}/${id}`)
  }
}
