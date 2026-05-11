import { Button } from '@/components/ui/button'
import { useProducts } from '@/core/contexts/product.context'
import { PlusCircle } from 'lucide-react'

export function ProductButtonAction() {
  const { setOpen } = useProducts()
  return (
    <div className='flex gap-2'>
      <Button
        className='space-x-1 bg-neutral-700 hover:bg-main duration-300 cursor-pointer'
        onClick={() => setOpen('add')}
      >
        <PlusCircle className='!size-5' /> <span>Thêm</span>
      </Button>
    </div>
  )
}
