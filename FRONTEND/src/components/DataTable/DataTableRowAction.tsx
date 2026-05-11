import { Row } from '@tanstack/react-table'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

import { Ellipsis, Eye, Headset, Key, MessageCircleX, SquarePen, Trash2 } from 'lucide-react'

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
  onEdit?: (row: TData) => void
  onDelete?: (row: TData) => void
  onView?: (row: TData) => void
  onReset?: (row: TData) => void
  onAccepted?: (row: TData) => void
  onRejected?: (row: TData) => void
}

export function DataTableRowActions<TData>({
  row,
  onEdit,
  onDelete,
  onReset,
  onView,
  onAccepted,
  onRejected
}: DataTableRowActionsProps<TData>) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='data-[state=open]:bg-muted flex h-8 w-8 p-0'>
          <Ellipsis className='h-4 w-4' />
          <span className='sr-only'>Mở</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-[160px]'>
        {onView && (
          <DropdownMenuItem onClick={() => onView(row.original)}>
            Xem chi tiết
            <DropdownMenuShortcut>
              <Eye size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        )}
        {onAccepted && (
          <DropdownMenuItem onClick={() => onAccepted(row.original)}>
            Tư vấn
            <DropdownMenuShortcut>
              <Headset size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        )}
        {onRejected && (
          <DropdownMenuItem onClick={() => onRejected(row.original)}>
            Từ chối
            <DropdownMenuShortcut>
              <MessageCircleX size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        )}

        {onEdit && (
          <DropdownMenuItem onClick={() => onEdit(row.original)}>
            Chỉnh sửa
            <DropdownMenuShortcut>
              <SquarePen size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        )}

        {onReset && (
          <DropdownMenuItem onClick={() => onReset(row.original)}>
            Đặt lại mật khẩu
            <DropdownMenuShortcut>
              <Key size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        )}

        {onDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(row.original)}
              className='text-red-500! hover:text-white! hover:bg-red-500!'
            >
              Xoá
              <DropdownMenuShortcut>
                <Trash2 size={16} />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
