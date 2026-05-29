import { cn } from '@/core/lib/utils'
import { ReactNode } from 'react'
interface Props {
  children: ReactNode
  className?: string
  id?: string
}
export default function SectionBgGreen({ children, className, id }: Props) {
  return (
    <section id={id} className='bg-bg min-h-80 flex items-center'>
      <div className={cn('max-w-7xl mx-auto p-4 overflow-hidden', className)}>{children}</div>
    </section>
  )
}
