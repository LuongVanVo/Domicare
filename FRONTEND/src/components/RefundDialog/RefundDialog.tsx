import { useState, useEffect, useContext, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Copy, Check, AlertCircle, Building, User, CreditCard, RotateCcw, Landmark } from 'lucide-react'
import { Booking } from '@/models/interface/booking.interface'
import { formatCurrentcy } from '@/utils/format'
import { AppContext } from '@/core/contexts/app.context'
import { rolesCheck } from '@/utils/rolesCheck'
import { useUpdateBookingMutation, useUpdateSttBookingMutation } from '@/core/queries/product.query'
import { useQueryClient } from '@tanstack/react-query'
import { path } from '@/core/constants/path'
import { chatApi } from '@/core/services/chat.service'
import { bookingApi } from '@/core/services/booking.service'

interface RefundDialogProps {
  isOpen: boolean
  onClose: () => void
  booking: Booking | null
  onSendSystemMessage?: (msg: string) => void
}

export function RefundDialog({ isOpen, onClose, booking, onSendSystemMessage }: RefundDialogProps) {
  const { profile } = useContext(AppContext)
  const queryClient = useQueryClient()
  const [copiedField, setCopiedField] = useState<string | null>(null)

  // Local state to track the freshest booking details fetched on-the-fly
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null)

  // Local form states for Customer
  const [bankName, setBankName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountHolder, setAccountHolder] = useState('')

  // Determine if current user is staff (Sale/Admin)
  const isStaff = useMemo(() => {
    return profile?.roles && rolesCheck.isAdminOrSale(profile.roles)
  }, [profile])

  // Mutations to update booking details and status
  const updateBookingMutation = useUpdateBookingMutation()
  const updateStatusMutation = useUpdateSttBookingMutation({
    successMessage: 'Đã xác nhận hoàn tiền thành công.'
  })

  // Fetch the latest booking data whenever the dialog is opened
  useEffect(() => {
    if (booking && isOpen) {
      setCurrentBooking(booking)
      setBankName(booking.refundBankName || '')
      setAccountNumber(booking.refundAccountNumber || '')
      setAccountHolder(booking.refundAccountHolder || '')

      // Query database directly to get the freshest data
      bookingApi
        .getById(Number(booking.id))
        .then((res) => {
          const freshBooking = res.data.data as unknown as Booking
          if (freshBooking) {
            setCurrentBooking(freshBooking)
            setBankName(freshBooking.refundBankName || '')
            setAccountNumber(freshBooking.refundAccountNumber || '')
            setAccountHolder(freshBooking.refundAccountHolder || '')
          }
        })
        .catch((err) => console.error('Error fetching fresh booking in RefundDialog:', err))
    }
  }, [booking, isOpen])

  if (!currentBooking) return null

  const refundAmount = Number(currentBooking.amountPaid || 0)
  const description = `DOMICARE REFUND DH${currentBooking.id}`

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const handleSubmitRefundDetails = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!bankName.trim() || !accountNumber.trim() || !accountHolder.trim()) return

    try {
      await updateBookingMutation.mutateAsync({
        bookingId: currentBooking.id,
        refundBankName: bankName,
        refundAccountNumber: accountNumber,
        refundAccountHolder: accountHolder
      })

      // Send structured system message via API (broadcasts automatically to both groups)
      const messageText = `[YÊU CẦU HOÀN TIỀN] Đơn hàng #${currentBooking.id} - STK: ${accountNumber} - Ngân hàng: ${bankName} - Chủ TK: ${accountHolder.toUpperCase()}. Số tiền: ${formatCurrentcy(refundAmount)}`
      await chatApi.sendMessage(String(profile?.id || currentBooking.userDTO?.id || ''), messageText)

      // Also call WebSocket callback if defined
      if (onSendSystemMessage) {
        onSendSystemMessage(messageText)
      }

      // Invalidate queries to refresh lists
      queryClient.invalidateQueries({ queryKey: [path.user.history] })
      queryClient.invalidateQueries({ queryKey: [path.admin.booking] })
      queryClient.invalidateQueries({ queryKey: [path.sale.booking] })

      onClose()
    } catch (error) {
      console.error('Error submitting refund bank details:', error)
    }
  }

  const handleConfirmRefund = async () => {
    try {
      // Update status to CANCELLED representing successful refund/cancel
      await updateStatusMutation.mutateAsync({
        bookingId: currentBooking.id,
        status: 'CANCELLED' as any
      })

      // Send system message notifying refund success
      const messageText = `[HỆ THỐNG] Đã hoàn tiền thành công cho Đơn đặt lịch #${currentBooking.id}. Số tiền hoàn trả: ${formatCurrentcy(refundAmount)}.`
      await chatApi.sendMessage(String(currentBooking.userDTO?.id || profile?.id || ''), messageText)

      // Invalidate query cache
      queryClient.invalidateQueries({ queryKey: [path.user.history] })
      queryClient.invalidateQueries({ queryKey: [path.admin.booking] })
      queryClient.invalidateQueries({ queryKey: [path.sale.booking] })

      onClose()
    } catch (error) {
      console.error('Error confirming refund:', error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='sm:max-w-[440px] rounded-3xl border border-slate-100/80 shadow-2xl p-5 bg-white overflow-hidden gap-0'>
        <DialogHeader className='space-y-1 pb-3 border-b border-slate-100'>
          <DialogTitle className='text-lg font-bold text-slate-800 flex items-center gap-2'>
            <div className='p-1.5 rounded-lg bg-emerald-50 text-emerald-600'>
              <Landmark size={18} />
            </div>
            {isStaff ? 'Thông tin hoàn tiền cho khách' : 'Thông tin tài khoản nhận hoàn tiền'}
          </DialogTitle>
          <DialogDescription className='text-slate-500 text-xs'>
            {isStaff
              ? 'Chuyển khoản hoàn cọc theo thông tin tài khoản khách hàng.'
              : 'Vui lòng cung cấp tài khoản để nhận tiền hoàn trả.'}
          </DialogDescription>
        </DialogHeader>

        <div className='pt-4'>
          {isStaff ? (
            /* STAFF DETAIL LAYOUT: Shows Credit Card representation + Copy triggers */
            !currentBooking.refundAccountNumber ? (
              <div className='text-center py-6 px-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2'>
                <AlertCircle className='mx-auto text-amber-500 size-6' />
                <div className='space-y-0.5'>
                  <p className='font-semibold text-slate-700 text-xs'>Khách chưa nhập thông tin</p>
                  <p className='text-[11px] text-slate-400 max-w-[260px] mx-auto'>
                    Khách hàng chưa cung cấp tài khoản hoàn tiền. Hãy yêu cầu họ cập nhật qua khung chat.
                  </p>
                </div>
              </div>
            ) : (
              <div className='space-y-4'>
                {/* Credit Card Mockup displaying Customer's Bank Details */}
                <div className='relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 p-5 text-white shadow-lg border border-emerald-500/20'>
                  {/* Ambient glows */}
                  <div className='absolute top-0 right-0 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl' />
                  <div className='absolute -left-10 -bottom-10 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl' />

                  <div className='flex justify-between items-start mb-4 z-10 relative'>
                    <div className='space-y-0.5'>
                      <p className='text-[9px] text-emerald-300 uppercase tracking-widest font-bold'>Nhận hoàn tiền</p>
                      <h4 className='text-sm font-bold text-white'>Đơn hàng #{currentBooking.id}</h4>
                    </div>
                    <span className='px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-[10px] font-semibold border border-emerald-500/30 text-emerald-300'>
                      Khách hàng
                    </span>
                  </div>

                  <div className='space-y-3 z-10 relative'>
                    <div>
                      <span className='text-[8px] text-emerald-400 block uppercase tracking-wider font-semibold'>
                        Ngân hàng
                      </span>
                      <span className='text-xs font-semibold flex items-center gap-1.5 text-slate-100'>
                        <Building size={12} className='text-emerald-400' />
                        {currentBooking.refundBankName}
                      </span>
                    </div>

                    <div className='flex justify-between items-end'>
                      <div>
                        <span className='text-[8px] text-emerald-400 block uppercase tracking-wider font-semibold'>
                          Số tài khoản (STK)
                        </span>
                        <span className='text-sm font-mono font-bold tracking-widest text-white block'>
                          {currentBooking.refundAccountNumber}
                        </span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(currentBooking.refundAccountNumber || '', 'accountNumber')}
                        className='py-0.5 px-2 rounded-md bg-emerald-500/20 hover:bg-emerald-500/30 active:bg-emerald-500/40 transition-colors border border-emerald-500/30 flex items-center gap-1 text-[9px] font-semibold text-emerald-300'
                      >
                        {copiedField === 'accountNumber' ? (
                          <>
                            <Check size={10} className='text-emerald-400' />
                            <span>Đã chép</span>
                          </>
                        ) : (
                          <>
                            <Copy size={10} />
                            <span>Sao chép</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className='flex justify-between items-end pt-2 border-t border-white/10'>
                      <div>
                        <span className='text-[8px] text-emerald-400 block uppercase tracking-wider font-semibold'>
                          Chủ tài khoản
                        </span>
                        <span className='text-[11px] font-semibold uppercase tracking-widest text-emerald-100 flex items-center gap-1.5'>
                          <User size={11} className='text-emerald-400' />
                          {currentBooking.refundAccountHolder}
                        </span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(currentBooking.refundAccountHolder || '', 'accountHolder')}
                        className='py-0.5 px-2 rounded-md bg-emerald-500/20 hover:bg-emerald-500/30 active:bg-emerald-500/40 transition-colors border border-emerald-500/30 text-[9px] font-semibold text-emerald-300'
                      >
                        {copiedField === 'accountHolder' ? 'Đã chép' : 'Chép tên'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Refund summary info */}
                <div className='space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs'>
                  <div className='flex justify-between items-center'>
                    <span className='text-slate-500'>Số tiền hoàn trả:</span>
                    <span className='font-bold text-emerald-600'>{formatCurrentcy(refundAmount)}</span>
                  </div>

                  <div className='flex justify-between items-center pt-2 border-t border-dashed border-slate-200'>
                    <span className='text-slate-500'>Nội dung chuyển khoản gợi ý:</span>
                    <div className='flex items-center gap-1.5'>
                      <span className='font-mono font-semibold text-slate-700 bg-slate-200/60 px-1.5 py-0.5 rounded text-[10px]'>
                        {description}
                      </span>
                      <button
                        onClick={() => copyToClipboard(description, 'description')}
                        className='p-1 hover:bg-slate-200 rounded text-slate-500 transition-colors'
                      >
                        {copiedField === 'description' ? (
                          <Check size={11} className='text-emerald-600' />
                        ) : (
                          <Copy size={11} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <DialogFooter className='pt-3 border-t border-slate-100 flex gap-2 sm:justify-end'>
                  <Button
                    variant='outline'
                    onClick={onClose}
                    className='rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 h-9 text-xs'
                  >
                    Đóng
                  </Button>
                  {currentBooking.bookingStatus !== 'CANCELLED' && (
                    <Button
                      onClick={handleConfirmRefund}
                      loading={updateStatusMutation.isPending}
                      className='rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-9 text-xs px-4 shadow-md shadow-emerald-600/10'
                    >
                      Xác nhận đã hoàn tiền
                    </Button>
                  )}
                </DialogFooter>
              </div>
            )
          ) : (
            /* CUSTOMER FORM LAYOUT: Shorter, compact form with no card preview */
            <form onSubmit={handleSubmitRefundDetails} className='space-y-3.5'>
              <div className='space-y-1'>
                <Label htmlFor='bankName' className='text-slate-700 text-xs font-semibold'>
                  Tên ngân hàng thụ hưởng
                </Label>
                <div className='relative'>
                  <Building className='absolute left-3 top-2.5 text-slate-400 size-3.5' />
                  <Input
                    id='bankName'
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder='Ví dụ: MB Bank, Vietcombank, Techcombank...'
                    className='pl-9 rounded-xl border-slate-200 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 h-9 text-xs'
                    required
                  />
                </div>
              </div>

              <div className='space-y-1'>
                <Label htmlFor='accountNumber' className='text-slate-700 text-xs font-semibold'>
                  Số tài khoản (STK) nhận tiền
                </Label>
                <div className='relative'>
                  <CreditCard className='absolute left-3 top-2.5 text-slate-400 size-3.5' />
                  <Input
                    id='accountNumber'
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder='Nhập số tài khoản ngân hàng'
                    className='pl-9 rounded-xl border-slate-200 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 h-9 text-xs font-mono tracking-wide'
                    required
                  />
                </div>
              </div>

              <div className='space-y-1'>
                <Label htmlFor='accountHolder' className='text-slate-700 text-xs font-semibold'>
                  Tên chủ tài khoản ngân hàng
                </Label>
                <div className='relative'>
                  <User className='absolute left-3 top-2.5 text-slate-400 size-3.5' />
                  <Input
                    id='accountHolder'
                    value={accountHolder}
                    onChange={(e) => setAccountHolder(e.target.value)}
                    placeholder='Ví dụ: NGUYEN VAN A'
                    className='pl-9 rounded-xl border-slate-200 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 h-9 text-xs uppercase font-semibold'
                    required
                  />
                </div>
              </div>

              <div className='space-y-1.5 p-3 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] text-slate-600'>
                <div className='flex justify-between items-center'>
                  <span>Đơn hàng áp dụng:</span>
                  <span className='font-semibold text-slate-700'>#{currentBooking.id}</span>
                </div>
                <div className='flex justify-between items-center'>
                  <span>Số tiền cọc được hoàn trả:</span>
                  <span className='font-bold text-emerald-600 text-xs'>{formatCurrentcy(refundAmount)}</span>
                </div>
              </div>

              <DialogFooter className='pt-3 border-t border-slate-100 flex gap-2 sm:justify-end'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={onClose}
                  className='rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 h-9 text-xs'
                >
                  Hủy
                </Button>
                <Button
                  type='submit'
                  loading={updateBookingMutation.isPending}
                  className='rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 px-4 shadow-md shadow-emerald-600/10 h-9 text-xs'
                >
                  <RotateCcw size={12} />
                  Gửi thông tin hoàn tiền
                </Button>
              </DialogFooter>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
