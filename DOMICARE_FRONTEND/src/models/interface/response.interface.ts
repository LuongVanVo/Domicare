export interface SuccessResponse<dataType> {
  data: dataType
  message?: string
  status?: number
}

export interface ErrorResponse {
  error: string
  message: string
  status: number
  details?: any
}

export interface FailResponse<dataType> {
  status?: number
  error?: string
  message?: string
  data?: dataType
}
export interface PaginationResponse {
  page?: number
  size?: number
  total?: number
  totalPages?: number
}
