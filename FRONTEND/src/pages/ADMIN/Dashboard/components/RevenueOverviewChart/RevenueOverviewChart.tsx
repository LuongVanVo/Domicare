import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartConfig, ChartTooltipContent } from '@/components/ui/chart'
import { ChartContainer } from '@/components/ui/chart'
import { useGetRevenueQuery } from '@/core/queries/overview.query'
import { formatRevenueData } from '@/utils/format'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { CartesianGrid, Line, LineChart, XAxis, Tooltip, YAxis } from 'recharts'
import { Skeleton } from '@/components/ui/skeleton'
import { useTranslation } from 'react-i18next'

export function RevenueOverviewChart() {
  const chartConfig = {
    revenue: {
      label: 'Doanh thu ',
      color: '#02865a'
    }
  } satisfies ChartConfig
  const { t } = useTranslation(['admin'])
  const { data, isLoading } = useGetRevenueQuery()
  const chartList = formatRevenueData(data?.data?.totalRevenue || {})
  const growRate = data?.data?.growthRate

  return (
    <Card className='h-full'>
      <CardHeader>
        <CardTitle className='text-lg font-semibold capitalize'>{t('admin:chart.revenue')}</CardTitle>
        <CardDescription>{t('admin:chart.revenue_description')}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className='space-y-4'>
            <div className='px-5'>
              <Skeleton className='h-80  w-full ' />
            </div>

            <div className='flex justify-between items-center px-6'>
              <Skeleton className='h-4 w-[200px]' />
              <Skeleton className='h-4 w-[100px]' />
            </div>
          </div>
        ) : (
          <ChartContainer config={chartConfig}>
            <LineChart
              data={chartList}
              margin={{
                left: 0,
                right: 20
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey='month'
                tickLine={false}
                axisLine={false}
                tickMargin={0}
                tickFormatter={(value) => value}
              />
              <YAxis />
              <Tooltip content={<ChartTooltipContent hideLabel />} />
              <Line dataKey='revenue' type='natural' stroke='var(--color-revenue)' strokeWidth={3} dot={false} />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter className='flex-col items-start gap-2 text-sm'>
        {isLoading ? (
          <>
            <Skeleton className='h-4 w-[300px]' />
            <Skeleton className='h-4 w-[400px]' />
          </>
        ) : (
          <>
            <div className='flex gap-2 font-medium leading-none'>
              {growRate && growRate > 0 ? (
                <>
                  {t('admin:chart.growth_up')} {Number(growRate).toFixed(2)}% {t('admin:chart.compared')}{' '}
                  <TrendingUp className='h-4 w-4' />
                </>
              ) : (
                <>
                  {t('admin:chart.growth_down')}{' '}
                  <span className='text-red-500 font-semibold'>{growRate && Number(-growRate).toFixed(2)}% </span>{' '}
                  {t('admin:chart.compared')} <TrendingDown className='h-4 w-4' />
                </>
              )}
            </div>
            <div className='leading-none text-muted-foreground'>{t('admin:chart.revenue_description')}</div>
          </>
        )}
      </CardFooter>
    </Card>
  )
}
