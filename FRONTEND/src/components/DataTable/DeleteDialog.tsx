import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import ConfirmDialog from '@/components/ConfirmDialog'
import { Trash2, TriangleAlert } from 'lucide-react'
import { ICON_SIZE_EXTRA } from '@/core/configs/icon-size'

interface DeleteDialogProps<T, TId = string | number> {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentItem: T
  displayField: keyof T
  titleLabel?: string
  onDelete: (id: TId) => void
  getId: (item: T) => string | number
}

export function DeleteDialog<T>({
  open,
  onOpenChange,
  currentItem,
  displayField,
  onDelete,
  getId,
  titleLabel = 'mục'
}: DeleteDialogProps<T>) {
  const [value, setValue] = useState<string>('')

  const handleDelete = () => {
    if (value.trim() !== String(currentItem[displayField])) return
    onDelete(getId(currentItem))
    onOpenChange(false)
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={value.trim() !== String(currentItem[displayField])}
      title={
        <span className='text-destructive flex items-center'>
          <TriangleAlert className='stroke-destructive mr-1 inline-block text-red' size={ICON_SIZE_EXTRA} />
          Xoá {titleLabel}
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            Bạn có chắc chắn muốn xoá&nbsp;{titleLabel}
            <span className='font-bold'>{String(currentItem[displayField])}</span>?
          </p>

          <Label className='my-4'>
            Nhập chính xác tên {titleLabel}:
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              icon={<Trash2 />}
              placeholder={`Nhập chính xác tên ${titleLabel} để xoá`}
            />
          </Label>

          <Alert className='mt-3' variant='destructive'>
            <AlertTitle>Cẩn thận!</AlertTitle>
            <AlertDescription>Chú ý, sau khi xác nhận dữ liệu sẽ bị xoá vĩnh viễn khỏi hệ thống.</AlertDescription>
          </Alert>
        </div>
      }
      confirmText={
        <>
          <Trash2 /> Xoá
        </>
      }
      destructive
    />
  )
}
