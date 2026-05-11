import DateRangePicker from '@/components/DateRangePicker'
import { useOverviewQueryConfig } from '@/hooks/useOverviewQueryConfig'
import { useOverviewQuery } from '@/core/queries/overview.query'
import { overviewApi } from '@/core/services/overview.service'
import { BookingOverview as BookingOverviewProps, DashboardData } from '@/models/interface/dashboard.interface'
import { lazy, Suspense } from 'react'
import MetricsOverview from './components/MetricsOverview'
const RevenueOverviewChart = lazy(() => import('./components/RevenueOverviewChart'))
const BookingOverview = lazy(() => import('./components/BookingOverview'))
const SaleOverview = lazy(() => import('./components/SaleOverview'))

const ChartLoading = () => (
  <div className='w-full h-80 flex justify-center items-center bg-gray-100 rounded-lg'>
    <p>Loading chart...</p>
  </div>
)

export default function Dashboard() {
  const queryString = useOverviewQueryConfig()
  const queryFn = overviewApi.getSummary
  const { data, isLoading } = useOverviewQuery<DashboardData>({ queryString, queryFn })
  const summary = data?.data?.dashboardSummary
  const bookingOver = data?.data?.bookingOverview as BookingOverviewProps
  return (
    <div className='w-full mb-20'>
      <div className='flex justify-end'>
        <DateRangePicker queryString={queryString} />
      </div>
      <div className='pt-3'>
        <MetricsOverview value={summary} isLoading={isLoading} />
        <div className='grid grid-cols-12 gap-5 mt-5'>
          <div className='col-span-12 mo:col-span-7'>
            <Suspense fallback={<ChartLoading />}>
              <RevenueOverviewChart />
            </Suspense>
          </div>
          <div className='col-span-12 mo:col-span-5'>
            <Suspense fallback={<ChartLoading />}>
              <BookingOverview value={bookingOver} isLoading={isLoading} />
            </Suspense>
          </div>
          <div className='col-span-12'>
            <Suspense fallback={<ChartLoading />}>
              <SaleOverview queryString={queryString} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}
