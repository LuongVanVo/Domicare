import { Button } from '@/components/ui/button'
import { path } from '@/core/constants/path'
import { useUpdateSttBookingMutation } from '@/core/queries/product.query'
import { BookingQueryConfig } from '@/hooks/useBookingQueryConfig'
import { Booking, BookingStatus } from '@/models/interface/booking.interface'
import { urlSEO } from '@/utils/urlSEO'
import { useQueryClient } from '@tanstack/react-query'
import isEqual from 'lodash/isEqual'
import { useNavigate } from 'react-router-dom'

interface ManaegeProps {
  booking: Booking
  queryString: BookingQueryConfig
}
export default function Manage({ booking, queryString }: ManaegeProps) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const handleCancleBooking = useUpdateSttBookingMutation({
    successMessage: 'Huỷ đặt dịch vụ thành công.'
  })
  const handleCancle = async () => {
    await handleCancleBooking.mutateAsync({ bookingId: booking.id, status: BookingStatus.CANCELLED })
    queryClient.invalidateQueries({ queryKey: [path.user.history, queryString] })
  }

  const handleRating = () => {
    navigate(
      {
        pathname: `${path.product}/${urlSEO(booking.products?.[0].id?.toString() || ' ', booking.products?.[0]?.name as string)}`
      },
      {
        state: {
          location: 'rating'
        }
      }
    )
  }
  const handleBookingAgain = () => {
    navigate(
      {
        pathname: `${path.product}/${urlSEO(booking.products?.[0].id?.toString() || ' ', booking.products?.[0]?.name as string)}`
      },
      {
        state: {
          location: 'booking'
        }
      }
    )
  }
  return (
    <div className='flex justify-end items-center pt-1.5 gap-2'>
      {isEqual(booking.bookingStatus, BookingStatus.PENDING) && (
        <Button
          onClick={handleCancle}
          disabled={handleCancleBooking.isPending}
          variant={'destructive'}
          className='text-white bg-red-500 cursor-pointer'
        >
          Huỷ dịch vụ
        </Button>
      )}
      {isEqual(booking.bookingStatus, BookingStatus.SUCCESS) && (
        <>
          <Button onClick={handleRating} variant={'outline'} className='cursor-pointer'>
            Đánh giá
          </Button>
          <Button onClick={handleBookingAgain} variant={'default'} className='text-white bg-main cursor-pointer'>
            Đặt lại dịch vụ
          </Button>
        </>
      )}
    </div>
  )
}
