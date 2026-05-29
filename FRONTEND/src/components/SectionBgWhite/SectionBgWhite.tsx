import { cn } from '@/core/lib/utils'
import { ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
  id?: string
}
export default function SectionBgWhite({ children, className, id }: Props) {
  return (
    <section id={id} className={'bg-white min-h-96 flex items-center'}>
      <div className={cn('max-w-7xl mx-auto p-4', className)}>{children}</div>
    </section>
  )
}
