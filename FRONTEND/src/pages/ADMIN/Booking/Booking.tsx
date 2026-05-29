// export interface IAppProps {}

import { path } from '@/core/constants/path'
import DataTable from '@/components/DataTable'
import { DataTablePagination } from '@/components/DataTable/DataTablePagination'
import { BookingDialog } from './components/BookingDialog'
import { useLocation } from 'react-router-dom'

import { useBookingColumns } from './components/BookingColumns'
import { useBookingQueryConfig } from '@/hooks/useBookingQueryConfig'
import { BookingProvider } from '@/core/contexts/booking.context'
import { useBookingQuery } from '@/core/queries/product.query'
import { BookingButtonAction } from './components/BookingButtonAction'
import { useBookingWebSocket } from '@/hooks/useBookingWebSocket'
import { tableLoadingData } from '@/core/constants/initialValue.const'
import DataLoading from '@/components/DataTable/DataLoading'

export default function Booking() {
  return (
    <BookingProvider>
      <BookingContent />
    </BookingProvider>
  )
}

function BookingContent() {
  const location = useLocation()
  const isSaleRoute = location.pathname.startsWith('/sale')
  const basePath = isSaleRoute ? path.sale.booking : path.admin.booking

  const queryString = useBookingQueryConfig({})
  const { data: bookingsData, isLoading } = useBookingQuery({ queryString, basePath })
  const bookingList = bookingsData?.data?.data.data
  const pageController = bookingsData?.data?.data.meta
  const columns = useBookingColumns()

  // realtime webSocket
  const memoizedQueryKey = [basePath, queryString]
  useBookingWebSocket({ queryKey: memoizedQueryKey })

  return (
    <>
      <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
        {isLoading ? (
          <DataLoading columns={tableLoadingData.booking} />
        ) : (
          <DataTable
            columns={columns}
            data={bookingList || []}
            searchKey='searchName'
            DataTablePagination={
              <DataTablePagination pageController={pageController} path={basePath} queryString={queryString} />
            }
            ButtonAction={<BookingButtonAction />}
          />
        )}
      </div>
      <BookingDialog />
    </>
  )
}
