import { Separator } from '@/components/ui/separator'
import { ReactNode } from 'react'

interface HeaderProps {
  title: string
  description: string
  children: ReactNode
}
export default function HeaderSettings({ title, description, children }: HeaderProps) {
  return (
    <div className='p-2 md:px-20 md:py-10 max-w-5xl '>
      <h2 className='text-2xl font-semibold mb-2 text-mainStrong capitalize'>{title}</h2>
      <p className='text-gray-500 dark:text-gray-400 mb-6'>{description}</p>
      <Separator className='mb-6' />
      {children}
    </div>
  )
}
