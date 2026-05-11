import { Checkbox } from '@/components/ui/checkbox'
import { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/DataTable/DataTableColumnHeader'
import { DataTableRowActions } from '@/components/DataTable/DataTableRowAction'
import { useBookings } from '@/core/contexts/booking.context'
import { cn } from '@/core/lib/utils'
import React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { Booking, BookingStatus } from '@/models/interface/booking.interface'
import { User } from '@/models/interface/user.interface'
import { Product } from '@/models/interface/product.interface'
import isEqual from 'lodash/isEqual'
import { Toast } from '@/utils/toastMessage'
import { useUpdateSttBookingMutation } from '@/core/queries/product.query'
import StatusBadge from '@/components/StatusBadge'
import { useTranslation } from 'react-i18next'
import { formatCurrentcy } from '@/utils/format'

export const useBookingColumns = (): ColumnDef<Booking>[] => {
  const { t } = useTranslation('admin')
  const { setOpen, setCurrentRow } = useBookings()
  const handleAddSaleBooking = useUpdateSttBookingMutation({
    successMessage: t('toast:accept_booking_success')
  })
  const handleRejectBooking = useUpdateSttBookingMutation({
    successMessage: t('booking.reject_booking_success')
  })
  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label='Select all'
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label='Select row'
        />
      ),
      enableSorting: false,
      enableHiding: false
    },
    {
      accessorKey: 'id',
      header: 'ID',
      meta: {
        displayName: t('table.id')
      },
      cell: ({ row }) => <div>#{row.getValue('id')}</div>,
      enableHiding: false
    },
    {
      accessorKey: 'userDTO',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.customer_name')} />,
      meta: {
        displayName: t('table.customer_name'),
        className: cn(
          'sticky lg:relative left-0 md:table-cell',
          'bg-white lg:bg-inherit',
          'transition-colors duration-200',
          'lg:[.group:hover_&]:!bg-muted',
          'lg:[.group[data-state=selected]_&]:!bg-muted',
          'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)] lg:drop-shadow-none'
        )
      },
      cell: ({ row }) => {
        const name = (row.getValue('userDTO') as User).name
          ? (row.getValue('userDTO') as User).name
          : (row.getValue('userDTO') as User).email
        return <div className='w-fit text-nowrap max-w-3xs md:max-w-md truncate'>{name}</div>
      },
      enableSorting: false
    },
    {
      accessorKey: 'address',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.address')} />,
      meta: {
        displayName: t('table.address')
      },
      cell: ({ row }) => (
        <div className='w-fit text-nowrap max-w-3xs md:max-w-md truncate'>{row.getValue('address') || '--'}</div>
      ),
      enableSorting: false
    },
    {
      accessorKey: 'totalPrice',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.total_price')} />,
      meta: {
        displayName: t('table.total_price')
      },
      cell: ({ row }) => {
        const totalPrice = row.getValue('totalPrice') as number
        return <div className='text-center'>{formatCurrentcy(totalPrice) || '--'}</div>
      },
      enableSorting: true
    },
    {
      accessorKey: 'bookingStatus',
      header: () => <div className='text-center capitalize w-full'>{t('table.status')}</div>,
      meta: {
        displayName: t('table.status')
      },
      cell: ({ row }) => {
        const status = row.getValue('bookingStatus') as BookingStatus
        return (
          <div className='text-center'>
            <StatusBadge status={status} />
          </div>
        )
      },
      enableSorting: true
    },
    {
      accessorKey: 'products',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.service_name')} />,
      meta: {
        displayName: t('table.service_name')
      },
      cell: ({ row }) => {
        const product = (row.getValue('products') as Product[])[0]
        return <div className='text-left'>{product.name || '--'}</div>
      },
      enableSorting: true
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DataTableRowActions
          row={row}
          onAccepted={(row: Booking) => {
            if (!row.saleDTO) {
              // call API
              handleAddSaleBooking.mutate({ bookingId: row.id, status: BookingStatus.ACCEPTED })
            } else {
              Toast.error({ description: t('toast.booking_has_sale') })
            }
          }}
          onRejected={(row) => {
            if (!row.saleDTO && isEqual(row.bookingStatus, BookingStatus.PENDING)) {
              // call API
              handleRejectBooking.mutate({ bookingId: row.id, status: BookingStatus.REJECTED })
            } else {
              Toast.error({ description: t('toast.error_reject_booking') })
            }
          }}
          onView={(row) => {
            setCurrentRow(row)
          }}
          onEdit={(row) => {
            if (
              !isEqual(row.bookingStatus, BookingStatus.PENDING) &&
              !isEqual(row.bookingStatus, BookingStatus.ACCEPTED)
            ) {
              Toast.error({ description: t('toast.cannot_edit_booking') })
            } else {
              setCurrentRow(row)
              setOpen('edit')
            }
          }}
        />
      ),
      enableHiding: false
    }
  ]
}

const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  { asChild?: boolean } & React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button'
  return <Comp ref={ref} {...props} />
})
SidebarMenuButton.displayName = 'SidebarMenuButton'
