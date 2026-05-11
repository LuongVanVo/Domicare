// export interface IAppProps {}

import { path } from '@/core/constants/path'
import DataTable from '@/components/DataTable'
import { DataTablePagination } from '@/components/DataTable/DataTablePagination'
import { BookingDialog } from './components/BookingDialog'

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
  const queryString = useBookingQueryConfig({})
  const { data: bookingsData, isLoading } = useBookingQuery({ queryString })
  const bookingList = bookingsData?.data?.data.data
  const pageController = bookingsData?.data?.data.meta
  const columns = useBookingColumns()

  // realtime webSocket
  const memoizedQueryKey = [path.admin.booking, queryString]
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
              <DataTablePagination
                pageController={pageController}
                path={path.admin.booking}
                queryString={queryString}
              />
            }
            ButtonAction={<BookingButtonAction />}
          />
        )}
      </div>
      <BookingDialog />
    </>
  )
}
