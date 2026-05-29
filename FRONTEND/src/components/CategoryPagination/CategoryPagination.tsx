import isEqual from 'lodash/isEqual'
import { Button } from '../ui/button'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { PaginationResponse } from '@/models/interface/response.interface'
import { QueryCateConfig } from '@/hooks/useCateQueryConfig'
interface CategoryPaginationProps {
  pageController?: PaginationResponse
  setParams: (params: QueryCateConfig) => void
  params: QueryCateConfig
}
export default function CategoryPagination({ pageController, setParams, params }: CategoryPaginationProps) {
  const FIRST_INDEX_PAGE = 1
  const LAST_INDEX_PAGE = pageController?.totalPages || 1
  const handleChangePage = (page: number) => {
    setParams({ ...params, page: page.toString() })
  }
  return (
    <div className='flex items-center justify-between space-x-2 px-2'>
      <Button
        variant='outline'
        className='h-8 w-8 p-0'
        onClick={() => handleChangePage((pageController?.page as number) - 1)}
        disabled={isEqual(pageController?.page || 1, FIRST_INDEX_PAGE)}
      >
        <span className='sr-only'>Trước</span>
        <ChevronLeftIcon className='h-4 w-4' />
      </Button>
      <p className='text-sm text-gray'>
        {pageController?.page} / {pageController?.totalPages}
      </p>
      <Button
        variant='outline'
        className='h-8 w-8 p-0'
        onClick={() => handleChangePage((pageController?.page as number) + 1)}
        disabled={isEqual(pageController?.page || 1, LAST_INDEX_PAGE)}
      >
        <span className='sr-only'>Sau</span>
        <ChevronRightIcon className='h-4 w-4' />
      </Button>
    </div>
  )
}
