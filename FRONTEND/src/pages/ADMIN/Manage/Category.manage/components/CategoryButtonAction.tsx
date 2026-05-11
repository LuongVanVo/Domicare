import { Button } from '@/components/ui/button'
import { useCategories } from '@/core/contexts/category.context'
import { PlusCircle } from 'lucide-react'

export function CategoryButtonAction() {
  const { setOpen } = useCategories()
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
