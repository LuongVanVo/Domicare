import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import config from '@/configs'
import { ICON_SIZE_EXTRA } from '@/configs/icon-size'
import { AppContext } from '@/core/contexts/app.context'
import { ChatSchema } from '@/core/zod/chat.zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { MessageSquare, Send, ArrowLeft, CreditCard, Sparkles, RotateCcw } from 'lucide-react'
import { useContext, useEffect, useRef, useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Form, FormControl, FormField, FormItem } from '../ui/form'
import { useGetConversationByReceiverId } from '@/core/queries/chat.query'
import { Conversation, Cursor } from '@/models/interface/chat.interface'
import MessageChat from '../MessageChat'
import { RefundDialog } from '../RefundDialog'
import { useWebSocket } from '@/hooks/useWebSocket'
import { rolesCheck } from '@/utils/rolesCheck'
import { chatApi } from '@/core/services/chat.service'
import { bookingApi } from '@/core/services/booking.service'
import { useUserBookingQuery } from '@/core/queries/product.query'
import { formatCurrentcy } from '@/utils/format'
import axiosClient from '@/core/services/axios-client'
import { Booking } from '@/models/interface/booking.interface'

export function Chat() {
  const [messages, setMessages] = useState<Conversation[]>([])
  const cursorRef = useRef<Cursor>({ last_message_id: '', last_updated_at: '' })
  const chatMutation = useGetConversationByReceiverId()
  const { profile } = useContext(AppContext)

  // Sheet open state
  const [isOpen, setIsOpen] = useState(false)
  const [isRefundOpen, setIsRefundOpen] = useState(false)

  // Roles check
  const isStaff = useMemo(() => {
    return profile?.roles && rolesCheck.isAdminOrSale(profile.roles)
  }, [profile])

  // Selected customer for admin/sales chat
  const [selectedReceiver, setSelectedReceiver] = useState<{ id: string; name: string } | null>(null)

  // Mapped booking for display
  const [associatedBooking, setAssociatedBooking] = useState<Booking | null>(null)
  const [selectedUserBooking, setSelectedUserBooking] = useState<Booking | null>(null)

  // List of active chats for staff
  const [conversationsList, setConversationsList] = useState<any[]>([])

  // Load conversations list for admin/sales
  const loadConversations = () => {
    if (isStaff) {
      chatApi
        .query({})
        .then((res) => {
          setConversationsList(res.data.data || [])
        })
        .catch((err) => console.error('Error fetching conversations:', err))
    }
  }

  useEffect(() => {
    if (isOpen) {
      loadConversations()
    }
  }, [isOpen, isStaff])

  // Listen to open_admin_chat event from BookingColumns.tsx
  useEffect(() => {
    const handleOpenAdminChat = (e: Event) => {
      const detail = (e as CustomEvent).detail
      setSelectedReceiver({ id: detail.customerId, name: detail.customerName })
      setAssociatedBooking(detail.booking)
      setIsOpen(true)
    }
    window.addEventListener('open_admin_chat', handleOpenAdminChat)
    return () => window.removeEventListener('open_admin_chat', handleOpenAdminChat)
  }, [])

  // Customer Mode: Query latest booking to check remaining balance
  const { data: userBookingsData } = useUserBookingQuery({
    queryString: { page: 1, size: 1, userId: Number(profile?.id) },
    enabled: Boolean(profile?.id && !isStaff)
  })
  const userLatestBooking = userBookingsData?.data?.data?.data?.[0]

  // Staff Mode: Query customer's latest booking if selected from list
  useEffect(() => {
    if (isStaff && selectedReceiver?.id && !associatedBooking) {
      bookingApi
        .query({ page: 1, size: 1, userId: Number(selectedReceiver.id) })
        .then((res) => {
          setSelectedUserBooking(res.data.data.data?.[0] || null)
        })
        .catch((err) => console.error('Error fetching customer booking:', err))
    } else if (!selectedReceiver) {
      setSelectedUserBooking(null)
    }
  }, [selectedReceiver, associatedBooking, isStaff])

  const activeBooking = useMemo(() => {
    if (isStaff) {
      return associatedBooking || selectedUserBooking
    }
    return userLatestBooking
  }, [isStaff, associatedBooking, selectedUserBooking, userLatestBooking])

  const isFullyPaid = useMemo(() => {
    if (!activeBooking) return false
    const remaining = Number(activeBooking.totalPrice) - Number(activeBooking.amountPaid || 0)
    return remaining <= 0 || activeBooking.bookingStatus === 'SUCCESS'
  }, [activeBooking])

  const currentUserIdStr = useMemo(() => (profile?.id ? String(profile.id) : ''), [profile])

  // Resolve target receiver ID
  const targetReceiverId = useMemo(() => {
    if (isStaff) {
      return selectedReceiver?.id || null
    }
    return currentUserIdStr || null
  }, [isStaff, selectedReceiver, currentUserIdStr])

  // WS Connection Setup
  const webSocketConfig = useMemo(
    () => ({
      url: `${config.baseUrl}/ws`,
      topics: {
        chat_message: (data: Conversation) => {
          // If we receive a message relevant to current active chat
          const isRelevant = isStaff
            ? (data.sender_id === targetReceiverId && data.receiver_id === currentUserIdStr) ||
              (data.sender_id === currentUserIdStr && data.receiver_id === targetReceiverId)
            : data.sender_id === currentUserIdStr || data.receiver_id === currentUserIdStr

          if (isRelevant) {
            setMessages((prev) => [...prev, data])
          }
          // Refresh list for staff
          loadConversations()
        },
        chat_message_delete: (data: { message_id: string }) => {
          setMessages((prev) => prev.filter((msg) => msg._id !== data.message_id))
        }
      }
    }),
    [targetReceiverId, currentUserIdStr, isStaff]
  )

  const { sendMessage } = useWebSocket(webSocketConfig)

  const handleDeleteMessage = (messageId: string) => {
    chatApi
      .deleteMessage(messageId)
      .then(() => {
        setMessages((prev) => prev.filter((msg) => msg._id !== messageId))
      })
      .catch((err) => console.error('Error deleting message:', err))
  }

  // Fetch message history when target customer changes
  useEffect(() => {
    if (targetReceiverId) {
      chatMutation
        .mutateAsync({ receiverId: targetReceiverId, params: { limit: 50 } })
        .then((conversations) => {
          const historyChats = conversations.data.data.data
          cursorRef.current = conversations.data.data.cursor
          setMessages(historyChats)
        })
        .catch((error) => {
          console.error('Error loading chat history:', error)
        })
    } else {
      setMessages([])
    }
  }, [targetReceiverId])

  const handleSendMessage = () => {
    const message = form.getValues('message')
    if (!message.trim() || !targetReceiverId) return

    sendMessage('send_chat', {
      receiver_id: targetReceiverId,
      message: message
    })
    form.setValue('message', '')
  }

  const form = useForm<z.infer<typeof ChatSchema>>({
    resolver: zodResolver(ChatSchema),
    defaultValues: {
      message: ''
    }
  })

  const fetchMoreConversation = () => {
    if (targetReceiverId) {
      chatMutation
        .mutateAsync({
          receiverId: targetReceiverId,
          params: {
            limit: 50,
            last_updated_at: cursorRef.current.last_updated_at,
            last_message_id: cursorRef.current.last_message_id
          }
        })
        .then((conversations) => {
          const historyChats = conversations.data.data.data
          cursorRef.current = conversations.data.data.cursor
          setMessages((prev) => [...historyChats, ...prev])
        })
        .catch((error) => {
          console.error(error)
        })
    }
  }

  // Handle remaining balance payment
  const handlePayRemaining = async () => {
    if (!activeBooking) return
    try {
      const remainingAmount = Number(activeBooking.totalPrice) - Number(activeBooking.amountPaid || 0)
      if (remainingAmount <= 0) return

      const response = await axiosClient.post('/payment/create-payment', {
        amount: remainingAmount,
        orderInfo: `Thanh toán còn lại cho Đơn hàng #${activeBooking.id}`,
        orderId: String(activeBooking.id)
      })

      const paymentURL = response.data.data.paymentUrl
      window.open(paymentURL, '_blank')
    } catch (error) {
      console.error('Error initiating remaining payment:', error)
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <div className='flex rounded-full mt-6 shadow-sm m-2 items-center justify-center size-16 cursor-pointer text-white bg-emerald-400 hover:bg-emerald-500 transition-colors duration-200'>
          <MessageSquare width={ICON_SIZE_EXTRA} height={ICON_SIZE_EXTRA} />
        </div>
      </SheetTrigger>
      <SheetContent className='flex flex-col h-full w-[400px] sm:w-[440px] p-0 gap-0'>
        {/* Render Conversation List for Staff */}
        {isStaff && !selectedReceiver ? (
          <div className='flex flex-col h-full bg-slate-50'>
            <SheetHeader className='p-4 border-b bg-white'>
              <SheetTitle className='flex items-center gap-2 text-slate-800'>
                <Sparkles className='text-amber-500 size-5' />
                Danh sách hỗ trợ khách hàng
              </SheetTitle>
            </SheetHeader>
            <div className='flex-1 overflow-y-auto p-2 space-y-2'>
              {conversationsList.length === 0 ? (
                <div className='text-center py-10 text-slate-400 text-sm'>Chưa có cuộc trò chuyện nào.</div>
              ) : (
                conversationsList.map((conv) => (
                  <div
                    key={conv.receiver.id}
                    onClick={() => {
                      setSelectedReceiver({
                        id: String(conv.receiver.id),
                        name: conv.receiver.name || conv.receiver.email
                      })
                      setAssociatedBooking(null)
                    }}
                    className='flex flex-col p-3 bg-white rounded-xl shadow-sm border border-slate-100 hover:border-emerald-300 hover:bg-emerald-50/20 cursor-pointer transition-all duration-150'
                  >
                    <div className='flex items-center justify-between mb-1'>
                      <span className='font-semibold text-slate-800 text-sm truncate max-w-[240px]'>
                        {conv.receiver.name || conv.receiver.email}
                      </span>
                      <span className='text-[10px] text-slate-400'>
                        {new Date(conv.last_message.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className='text-xs text-slate-500 truncate'>{conv.last_message.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          /* Render Active Chat View */
          <div className='flex flex-col h-full bg-white'>
            <SheetHeader className='p-3 border-b flex flex-row items-center gap-3 bg-white space-y-0'>
              {isStaff && (
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={() => {
                    setSelectedReceiver(null)
                    setAssociatedBooking(null)
                  }}
                  className='h-8 w-8 text-slate-500 hover:bg-slate-100 rounded-full'
                >
                  <ArrowLeft size={18} />
                </Button>
              )}
              <SheetTitle className='text-slate-800 text-base font-bold truncate max-w-[280px]'>
                {isStaff ? selectedReceiver?.name : 'Hỗ trợ trực tuyến'}
              </SheetTitle>
            </SheetHeader>

            {/* Premium Booking Details Banner */}
            {activeBooking &&
              (isFullyPaid ? (
                <div className='bg-gradient-to-r from-emerald-50 to-emerald-100/30 border-b border-emerald-200/50 p-3 flex flex-col gap-2'>
                  <div className='flex justify-between items-center text-xs'>
                    <span className='text-slate-600 font-medium'>Đơn hàng #{activeBooking.id}</span>
                    <span className='bg-emerald-500 text-white font-bold text-[9px] px-1.5 py-0.5 rounded flex items-center gap-1'>
                      <Sparkles className='size-2.5 animate-bounce' /> Đã hoàn thành đơn hàng
                    </span>
                  </div>
                  <div className='flex justify-between items-center text-xs'>
                    <div className='flex flex-col'>
                      <span className='text-slate-500 text-[10px]'>Trạng thái thanh toán</span>
                      <span className='font-bold text-emerald-700 text-sm'>
                        Đã thanh toán đầy đủ ({formatCurrentcy(Number(activeBooking.totalPrice))})
                      </span>
                    </div>
                    {Number(activeBooking.amountPaid || 0) > 0 &&
                      ['ACCEPTED', 'PENDING', 'PROCESSING'].includes(activeBooking.bookingStatus || '') && (
                        <Button
                          size='sm'
                          variant='outline'
                          onClick={() => setIsRefundOpen(true)}
                          className='border-emerald-300 hover:bg-emerald-50 text-emerald-700 font-bold text-xs gap-1.5 rounded-lg py-1 px-3 shadow-sm'
                        >
                          <RotateCcw size={13} />
                          Yêu cầu hoàn tiền
                        </Button>
                      )}
                  </div>
                </div>
              ) : (
                <div className='bg-gradient-to-r from-amber-50 to-amber-100/50 border-b border-amber-200/60 p-3 flex flex-col gap-2'>
                  <div className='flex justify-between items-center text-xs'>
                    <span className='text-slate-600 font-medium'>Đơn hàng #{activeBooking.id}</span>
                    <span className='bg-amber-500 text-white font-bold text-[9px] px-1.5 py-0.5 rounded'>
                      Đã cọc: {formatCurrentcy(Number(activeBooking.amountPaid || 0))}
                    </span>
                  </div>
                  <div className='flex justify-between items-center text-xs'>
                    <div className='flex flex-col'>
                      <span className='text-slate-500 text-[10px]'>Số tiền còn lại</span>
                      <span className='font-bold text-slate-800 text-sm'>
                        {formatCurrentcy(Number(activeBooking.totalPrice) - Number(activeBooking.amountPaid || 0))}
                      </span>
                    </div>
                    <div className='flex gap-1.5'>
                      {Number(activeBooking.amountPaid || 0) > 0 &&
                        ['PENDING', 'ACCEPTED', 'PROCESSING'].includes(activeBooking.bookingStatus || '') && (
                          <Button
                            size='sm'
                            variant='outline'
                            onClick={() => setIsRefundOpen(true)}
                            className='border-amber-300 hover:bg-amber-50 text-amber-700 font-bold text-xs gap-1.5 rounded-lg py-1 px-3 shadow-sm hover:text-amber-800 hover:border-amber-400'
                          >
                            <RotateCcw size={13} />
                            Hoàn tiền
                          </Button>
                        )}
                      {!isStaff &&
                        Number(activeBooking.amountPaid || 0) < Number(activeBooking.totalPrice) &&
                        ['PENDING', 'ACCEPTED', 'PROCESSING'].includes(activeBooking.bookingStatus || '') && (
                          <Button
                            size='sm'
                            onClick={handlePayRemaining}
                            className='bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs gap-1.5 rounded-lg py-1 px-3 shadow-sm transition animate-pulse'
                          >
                            <CreditCard size={13} />
                            Thanh toán nốt
                          </Button>
                        )}
                    </div>
                  </div>
                </div>
              ))}

            <div className='flex-1 min-h-0 bg-slate-50'>
              <MessageChat
                hasMore={Boolean(cursorRef.current && cursorRef.current.last_message_id)}
                messages={messages}
                userId={currentUserIdStr}
                fetchMoreConversation={fetchMoreConversation}
                onDeleteMessage={handleDeleteMessage}
              />
            </div>

            <SheetFooter className='p-3 border-t bg-white'>
              <Form {...form}>
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSendMessage()
                  }}
                  className='flex gap-2 w-full justify-center items-center'
                  noValidate
                >
                  <FormField
                    control={form.control}
                    name='message'
                    render={({ field }) => (
                      <FormItem className='flex-grow'>
                        <FormControl>
                          <Input
                            className='focus:outline-0 mt-0 h-10 rounded-xl bg-slate-50 border-slate-200'
                            placeholder='Nhập tin nhắn...'
                            type='text'
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <Button
                    type='submit'
                    className='h-10 w-10 p-0 rounded-xl bg-emerald-500 hover:bg-emerald-600 transition-colors duration-200'
                  >
                    <Send size={16} />
                  </Button>
                </form>
              </Form>
            </SheetFooter>
            <RefundDialog isOpen={isRefundOpen} onClose={() => setIsRefundOpen(false)} booking={activeBooking} />
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
