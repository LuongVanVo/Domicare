import { OverviewQueryConfig } from '@/hooks/useOverviewQueryConfig'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { STATE_TIME } from '@/configs/consts'
import { path } from '../constants/path'
import { AxiosResponse } from 'axios'
import { SuccessResponse } from '@/models/interface/response.interface'
import { overviewApi } from '../services/overview.service'

interface BookingQueryProps<T> {
  queryFn: (data: OverviewQueryConfig) => Promise<AxiosResponse<SuccessResponse<T>>>
  queryString: OverviewQueryConfig
}

/**
 * Custom hook for handling booking queries
 * @param {BookingQueryProps} props - The query function and configuration
 * @returns {UseQueryResult} The query result
 */
export const useOverviewQuery = <T>({ queryFn, queryString }: BookingQueryProps<T>) => {
  return useQuery({
    queryKey: [path.admin.dashboard, queryFn.name, queryString],
    queryFn: () => queryFn(queryString).then((res) => res.data),
    placeholderData: keepPreviousData,
    staleTime: STATE_TIME
  })
}

export const useGetRevenueQuery = () => {
  return useQuery({
    queryKey: [path.admin.dashboard, 'chart'],
    queryFn: () => overviewApi.getTotalRevenue().then((res) => res.data),
    placeholderData: keepPreviousData,
    staleTime: STATE_TIME
  })
}
