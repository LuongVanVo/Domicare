import { Button } from '@/components/ui/button'
import { useUsers } from '@/core/contexts/user.context'
import { PlusCircle } from 'lucide-react'

export function UserButtonAction() {
  const { setOpen } = useUsers()
  return (
    <div className='flex gap-2'>
      <Button
        className='space-x-1 bg-neutral-700 hover:bg-main duration-300 cursor-pointer'
        onClick={() => setOpen('add')}
      >
        <PlusCircle className='!w-5 !h-5' /> <span>Thêm</span>
      </Button>
    </div>
  )
}
