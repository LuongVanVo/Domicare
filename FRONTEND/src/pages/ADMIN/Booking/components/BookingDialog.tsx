import { ADMIN_STATUS, BookingDialogType } from '@/configs/consts'
import isEqual from 'lodash/isEqual'
import { BookingActionDialog } from './BookingActionDialog'
import { useBookings } from '@/core/contexts/booking.context'
export function BookingDialog() {
  const { open, setOpen, currentRow, setCurrentRow } = useBookings()
  return (
    <>
      {currentRow && (
        <>
          <BookingActionDialog
            key={`Booking-edit-${currentRow.id}`}
            open={isEqual(open, ADMIN_STATUS.EDIT)}
            onOpenChange={() => {
              setOpen(ADMIN_STATUS.EDIT as BookingDialogType)
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />
        </>
      )}
    </>
  )
}
