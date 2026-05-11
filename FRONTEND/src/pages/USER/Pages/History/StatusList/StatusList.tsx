import { Separator } from '@/components/ui/separator'
import { getBookingStatusExtra } from '@/configs/consts'
import { path } from '@/core/constants/path'
import { BookingQueryConfig } from '@/hooks/useBookingQueryConfig'
import classNames from 'classnames'
import isEqual from 'lodash/isEqual'
import { createSearchParams, Link } from 'react-router-dom'

interface StatusListProps {
  queryString: BookingQueryConfig
}
export default function StatusList({ queryString }: StatusListProps) {
  const isActive = (status: string) => {
    if (
      (isEqual(queryString.bookingStatus, undefined) || isEqual(queryString.bookingStatus, '')) &&
      isEqual(status, 'ALL')
    ) {
      return true
    } else {
      return isEqual(queryString.bookingStatus, status)
    }
  }
  const BookingStatusExtra = getBookingStatusExtra()
  return (
    <>
      <ul className='bg-white flex justify-around items-center  text-black overflow-x-auto overflow-y-hidden w-full rounded-xs '>
        {BookingStatusExtra.map((item) => {
          return (
            <li
              key={item.value}
              className={classNames('border-b-transparent  border-b-2 shrink-0 group cursor-pointer  h-full group', {
                'text-main  !border-b-main ': isActive(item.value)
              })}
            >
              <Link
                to={{
                  pathname: path.user.history,
                  search: createSearchParams({
                    ...queryString,
                    bookingStatus: isEqual(item.value, 'ALL') ? '' : item.value
                  }).toString()
                }}
                className={classNames('group-hover:text-main p-4  duration-300 block w-full h-full')}
              >
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
      <Separator />
    </>
  )
}
