import { ReactNode } from 'react'
import SecctionInView from '../SectionInView'
interface CartItemProps {
  icon: ReactNode
  children: ReactNode
  sub: string
}
export default function CardItem({ icon, children, sub }: CartItemProps) {
  return (
    <SecctionInView className=' flex justify-start items-center min-w-[80%] md:min-w-[60%]  mo:!min-w-80 px-3 py-2 hover:shadow-lg duration-200 shadow-md  rounded-xs gap-5 '>
      <div className='md:w-18 md:h-18 h-12 w-12 flex justify-center items-center rounded-xs bg-neutral-200'>{icon}</div>
      <div className='flex flex-col items-start justify-center'>
        <h4 className='text-head font-bold text-black'>{children}</h4>
        <p className='text-sub2 text-gray'>{sub}</p>
      </div>
    </SecctionInView>
  )
}
