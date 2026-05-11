import { addDays } from 'date-fns/addDays'
import { format } from 'date-fns/format'
import { Calendar as CalendarIcon } from 'lucide-react'
import { DateRange } from 'react-day-picker'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { HTMLAttributes, useEffect, useState } from 'react'
import { cn } from '@/core/lib/utils'
import { STANDARD_DATE_FORMAT_INVERSE } from '@/configs/consts'
import dayjs from 'dayjs'
import { formatDateTime } from '@/core/helpers/date-time'
import { createSearchParams, useNavigate } from 'react-router-dom'
import { path } from '@/core/constants/path'
import { OverviewQueryConfig } from '@/hooks/useOverviewQueryConfig'
import { useTranslation } from 'react-i18next'

const initialDateRange: DateRange = {
  to: new Date(),
  from: addDays(new Date(), -30)
}
interface DateRangePickerProps {
  queryString: OverviewQueryConfig
  className?: HTMLAttributes<HTMLDivElement>
}
export function DateRangePicker({ className, queryString }: DateRangePickerProps) {
  const [date, setDate] = useState<DateRange | undefined>(initialDateRange)
  const { t } = useTranslation(['admin'])
  const navigate = useNavigate()
  const handleChangeDate = (range: DateRange) => {
    setDate(range)
  }
  useEffect(() => {
    const date = {
      to: new Date(queryString.endDate ?? new Date()),
      from: new Date(queryString.startDate ?? addDays(new Date(), -30))
    }
    setDate(date)
  }, [queryString])
  const handleQuery = () => {
    navigate({
      pathname: path.admin.dashboard,
      search: createSearchParams({
        ...queryString,
        endDate: date?.to ? date.to.toISOString() : new Date().toISOString(),
        startDate: date?.from ? date.from.toISOString() : addDays(new Date(), -30).toISOString()
      }).toString()
    })
  }
  return (
    <div className={cn('flex gap-2', className)}>
      <Button onClick={handleQuery} variant={'default'} className='cursor-pointer'>
        {t('query')}
      </Button>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id='date'
            variant={'outline'}
            className={cn(
              'px-2.5 md:px-6 justify-start text-left font-normal border-gray-200',
              !date && 'text-muted-foreground'
            )}
          >
            <CalendarIcon />
            {date?.from ? (
              date.to ? (
                <>
                  {formatDateTime(dayjs(date.from), STANDARD_DATE_FORMAT_INVERSE)} -{' '}
                  {formatDateTime(dayjs(date.to), STANDARD_DATE_FORMAT_INVERSE)}
                </>
              ) : (
                format(date.from, 'LLL dd, y')
              )
            ) : (
              <span>{t('auth:select_time')}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto p-0' align='start'>
          <Calendar
            initialFocus
            mode='range'
            defaultMonth={date?.from}
            selected={date}
            onSelect={(range) => handleChangeDate(range as DateRange)}
            numberOfMonths={2}
            formatters={{
              formatCaption: (date) => format(date, 'MM - yyyy')
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
