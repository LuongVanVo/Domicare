import isUndefined from 'lodash/isUndefined'
import omitBy from 'lodash/omitBy'
import { useParamsString } from './usePrdQueryConfig'
import { BookingListConfig } from '@/models/interface/booking.interface'

interface BookingListConfigProps {
  userId?: number
}
export type BookingQueryConfig = {
  [key in keyof BookingListConfig]: string
}
export const useBookingQueryConfig = ({ userId }: BookingListConfigProps) => {
  const queryString: BookingQueryConfig = useParamsString()
  const queryConfig: BookingQueryConfig = omitBy(
    {
      page: queryString.page || '1',
      size: queryString.size || '10',
      sortBy: queryString.sortBy,
      sortDirection: queryString.sortDirection,
      userId: queryString.userId || userId,
      searchName: queryString.searchName,
      bookingStatus: queryString.bookingStatus,
      saleId: queryString.saleId
    },
    isUndefined
  )

  return queryConfig
}
