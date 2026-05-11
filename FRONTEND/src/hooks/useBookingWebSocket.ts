import { useCallback, useMemo } from 'react'
import { useWebSocket } from './useWebSocket'
import { useQueryClient } from '@tanstack/react-query'
import { Toast } from '@/utils/toastMessage'
import { Booking } from '@/models/interface/booking.interface'
import config from '@/configs'

interface BookingWebSocketProps {
  queryKey: (string | object)[]
  isUser?: boolean
  userId?: number
  refetch?: () => void
}

export const useBookingWebSocket = ({ queryKey, isUser = false, userId }: BookingWebSocketProps) => {
  const queryClient = useQueryClient()

  const handleNewBooking = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKey })
  }, [queryClient, queryKey])

  const handleUpdateBooking = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKey })
  }, [queryClient, queryKey])

  const handleUpdateBookingUser = useCallback(
    (message: Booking) => {
      const prdName = message.products?.[0]?.name
      queryClient.invalidateQueries({ queryKey: queryKey })
      Toast.info({
        title: 'Thông báo',
        description: `Có sự thay đổi trạng thái cho đơn đặt hàng ${prdName} , vui lòng kiểm tra thông tin của bạn.`
      })
    },
    [queryClient, queryKey]
  )

  const register = {
    user: {
      [`/topic/bookings/new/${userId}`]: handleNewBooking,
      [`/topic/bookings/update/${userId}`]: handleUpdateBookingUser
    },
    admin: {
      '/topic/bookings/new': handleNewBooking,
      '/topic/bookings/update': handleUpdateBooking
    }
  }

  const webSocketConfig = useMemo(
    () => ({
      url: `${config.baseUrl}/ws`,
      topics: isUser ? register.user : register.admin,
      onError: (error: any) => console.error('useBookingWebSocket: WebSocket error', error)
    }),
    [isUser]
  )

  const { isConnected } = useWebSocket(webSocketConfig)
  return {
    isConnected
  }
}
