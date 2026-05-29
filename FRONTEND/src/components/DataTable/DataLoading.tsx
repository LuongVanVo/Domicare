import { Skeleton } from '../ui/skeleton'
interface DataLoadingProps {
  columns: string[]
}
export default function DataLoading({ columns }: DataLoadingProps) {
  return (
    <div className='w-full overflow-x-auto'>
      <div className='flex justify-between items-center mb-4'>
        <Skeleton className='h-10 w-1/3' />
        <Skeleton className='h-10 w-24' />
      </div>
      <div className='w-full border rounded-md overflow-hidden'>
        <div className='flex justify-around gap-2 px-4 py-2 bg-gray-100 text-sm font-semibold'>
          {columns.map((text, id) => (
            <div key={id} className='truncate'>
              {text}
            </div>
          ))}
        </div>
        {[...Array(10)].map((_, i) => (
          <div key={i} className='grid grid-cols-10 gap-2 px-4 py-3 border-t items-center'>
            {Array.from({ length: 10 }).map((_, j) => (
              <Skeleton key={j} className='h-4 w-full' />
            ))}
          </div>
        ))}
      </div>
      <div className='flex justify-between items-center mt-4'>
        <Skeleton className='h-8 w-24' />
        <Skeleton className='h-8 w-32' />
      </div>
    </div>
  )
}
