import { ReactNode } from 'react'
import SecctionInView from '../SectionInView'
import { cn } from '@/core/lib/utils'
interface FeatureCardProps {
  icon: ReactNode
  title: string
  description?: string
  classNameContainer?: string
  textClassname?: string
}
export default function FeatureCard({ icon, title, description, classNameContainer, textClassname }: FeatureCardProps) {
  return (
    <SecctionInView
      className={cn([classNameContainer, ' flex flex-col items-center justify-start sm:basis-1/3 group '])}
    >
      <div className='group-hover:rotate-5 duration-300'> {icon}</div>

      <div className='p-4 rounded-md flex items-start space-x-4'>
        <div>
          <h3 className={cn(['text-sub1 text-black font-semibold text-center my-2', textClassname])}>{title}</h3>
          {description && <p className={cn(['text-gray text-sm text-justify', textClassname])}>{description}</p>}
        </div>
      </div>
    </SecctionInView>
  )
}
