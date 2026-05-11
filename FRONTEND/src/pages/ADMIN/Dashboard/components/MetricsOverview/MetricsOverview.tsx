import { ArrowDownIcon, ArrowUpIcon, DollarSign, ShoppingCart, Users, Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'
import CountUp from 'react-countup'
import { DashboardSummary } from '@/models/interface/dashboard.interface'
import isEqual from 'lodash/isEqual'
import { Skeleton } from '@/components/ui/skeleton'
import { useTranslation } from 'react-i18next'

interface MetricsOverviewProps {
  value?: DashboardSummary
  isLoading?: boolean
}

export const useMetrics = () => {
  const { t } = useTranslation('admin')
  return [
    {
      title: t('metrics.revenue'),
      key: 'totalRevenue',
      icon: DollarSign
    },
    {
      title: t('metrics.order'),
      key: 'bookings',
      icon: ShoppingCart
    },
    {
      title: t('metrics.new_customer'),
      key: 'totalUsers',
      icon: Users
    },
    {
      title: t('metrics.review'),
      key: 'reviews',
      icon: Activity
    }
  ] as const
}

export function MetricsOverview({ value = {}, isLoading = false }: MetricsOverviewProps) {
  const { t } = useTranslation(['admin'])
  const metrics = useMetrics()
  return (
    <div className='grid grid-cols-12 gap-2'>
      {metrics.map((metric) => {
        const data = value[metric.key as keyof DashboardSummary]
        const change = data?.change || 0
        const changeText = change > 0 ? `${change}%` : `${change}%`
        return (
          <Card key={metric.key} className='col-span-6 md:col-span-6 lg:col-span-3 p-2.5 md:py-6'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-lg font-semibold capitalize'>{metric.title}</CardTitle>
              <metric.icon className='size-4 text-muted-foreground' />
            </CardHeader>
            <CardContent className='px-2.5 md:px-6 truncate'>
              {isLoading ? (
                <>
                  <Skeleton className='h-8 w-3/4 mb-2' />
                  <Skeleton className='h-4 w-1/2' />
                </>
              ) : (
                <>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className='text-2xl font-bold'
                  >
                    <CountUp
                      end={Number(data?.value || 0)}
                      start={0}
                      prefix={Number(data?.value) > 0 ? '+' : ''}
                      suffix={isEqual(metric.key, 'totalRevenue') ? ' VND' : ''}
                      duration={1.5}
                    />
                  </motion.div>
                  <p className='text-sm text-muted-foreground'>
                    <span className={change > 0 ? 'text-green-700' : 'text-red-500'}>
                      {change > 0 ? (
                        <ArrowUpIcon className='inline size-4' />
                      ) : (
                        <ArrowDownIcon className='inline size-4' />
                      )}
                      {changeText} {t('admin:metrics.compared')}
                    </span>
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
