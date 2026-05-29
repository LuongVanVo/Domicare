import HttpStatusCode from '@/core/constants/http'
import { FailResponse } from '@/models/interface/response.interface'
import { AxiosError } from 'axios'
import isEqual from 'lodash/isEqual'

export const isError422 = <T>(error: AxiosError): error is AxiosError<FailResponse<T>> => {
  if (isEqual(error.status, HttpStatusCode.UnprocessableEntity)) {
    return true
  }
  return false
}
