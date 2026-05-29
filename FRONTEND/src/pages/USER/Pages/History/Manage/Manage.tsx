import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { path } from '@/core/constants/path'
import { useUpdateSttBookingMutation } from '@/core/queries/product.query'
import { BookingQueryConfig } from '@/hooks/useBookingQueryConfig'
import { Booking, BookingStatus } from '@/models/interface/booking.interface'
import { urlSEO } from '@/utils/urlSEO'
import { useQueryClient } from '@tanstack/react-query'
import isEqual from 'lodash/isEqual'
import { useNavigate } from 'react-router-dom'
import axiosClient from '@/core/services/axios-client'
import { CreditCard, RotateCcw } from 'lucide-react'
import { RefundDialog } from '@/components/RefundDialog'

interface ManaegeProps {
  booking: Booking
  queryString: BookingQueryConfig
}
export default function Manage({ booking, queryString }: ManaegeProps) {
  const [isRefundOpen, setIsRefundOpen] = useState(false)
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
  const handlePayRemaining = async () => {
    try {
      const remainingAmount = Number(booking.totalPrice) - Number(booking.amountPaid || 0)
      if (remainingAmount <= 0) return

      const response = await axiosClient.post('/payment/create-payment', {
        amount: remainingAmount,
        orderInfo: `Thanh toán còn lại cho Đơn hàng #${booking.id}`,
        orderId: String(booking.id)
      })

      const paymentURL = response.data.data.paymentUrl
      window.open(paymentURL, '_blank')
    } catch (error) {
      console.error('Error initiating remaining payment:', error)
    }
  }
  return (
    <>
      <div className='flex justify-end items-center pt-1.5 gap-2'>
        {Number(booking.amountPaid || 0) > 0 &&
          ['PENDING', 'ACCEPTED', 'PROCESSING'].includes(booking.bookingStatus || '') && (
            <Button
              onClick={() => setIsRefundOpen(true)}
              variant='outline'
              className='border-red-200 hover:bg-red-50 text-red-600 hover:text-red-700 font-semibold flex items-center gap-1.5 cursor-pointer'
            >
              <RotateCcw size={15} />
              Yêu cầu hoàn tiền
            </Button>
          )}
        {isEqual(booking.bookingStatus, BookingStatus.ACCEPTED) &&
          Number(booking.amountPaid || 0) < Number(booking.totalPrice) && (
            <Button
              onClick={handlePayRemaining}
              className='text-white bg-amber-600 hover:bg-amber-700 font-bold flex items-center gap-1.5 cursor-pointer animate-pulse'
            >
              <CreditCard size={15} />
              Thanh toán nốt
            </Button>
          )}
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
      <RefundDialog isOpen={isRefundOpen} onClose={() => setIsRefundOpen(false)} booking={booking} />
    </>
  )
}
