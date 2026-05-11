import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useState } from 'react'
import { BookingDialogType } from '@/configs/consts'
import useDialogState from '@/hooks/useDialogState'
import { Booking } from '@/models/interface/booking.interface'

interface BookingContextType {
  open: BookingDialogType | null
  setOpen: (str: BookingDialogType | null) => void
  currentRow: Booking | null
  setCurrentRow: Dispatch<SetStateAction<Booking | null>>
}

const BookingContext = createContext<BookingContextType | null>(null)
interface Props {
  children: ReactNode
}
export function BookingProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<BookingDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Booking | null>(null)

  return (
    <BookingContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>{children}</BookingContext.Provider>
  )
}
// eslint-disable-next-line react-refresh/only-export-components
export function useBookings() {
  const context = useContext(BookingContext)
  if (!context) {
    throw new Error('useBookings must be used within a BookingProvider')
  }
  return context
}
