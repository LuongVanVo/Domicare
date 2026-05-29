import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChevronLeftIcon, ChevronRightIcon, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { createSearchParams, useNavigate } from 'react-router-dom'
import isEqual from 'lodash/isEqual'
import { PaginationResponse } from '@/models/interface/response.interface'
import { Table } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'

export interface DataTablePaginationProps<TQuery extends Record<string, string>, TData> {
  pageController?: PaginationResponse
  path: string
  queryString: TQuery
  table?: Table<TData>
}

export function DataTablePagination<TQuery extends Record<string, string>, TData>({
  pageController,
  path,
  queryString,
  table
}: DataTablePaginationProps<TQuery, TData>) {
  const FIRST_INDEX_PAGE = 1
  const { page = 1, size = 10, totalPages = 1 } = pageController || {}
  const LAST_INDEX_PAGE = totalPages
  const { t } = useTranslation('common')
  const navigatePage = (value: string) =>
    navigate({
      pathname: path,
      search: createSearchParams({
        ...queryString,
        page: value
      }).toString()
    })
  const navigate = useNavigate()
  return (
    <div
      className='flex items-center justify-end md:justify-between  overflow-clip px-2 mt-2'
      style={{ overflowClipMargin: 1 }}
    >
      <div className='text-muted-foreground hidden flex-1 text-sm sm:block'>
        {table && table.getFilteredSelectedRowModel().rows.length} / {table && table.getFilteredRowModel().rows.length}
        &nbsp; {t('selected_rows')}
      </div>
      <div className='flex items-center sm:space-x-6 lg:space-x-8'>
        <div className='flex items-center space-x-2'>
          <p className='hidden text-sm font-medium sm:block'>{t('rows_per_page')}</p>
          <Select
            value={`${size}`}
            onValueChange={(value) =>
              navigate({
                pathname: path,
                search: createSearchParams({
                  ...queryString,
                  size: value,
                  page: 1
                }).toString()
              })
            }
          >
            <SelectTrigger className='h-8 w-[70px]'>
              <SelectValue placeholder={size} />
            </SelectTrigger>
            <SelectContent side='top'>
              {[10, 15, 20].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className='flex w-[100px] items-center justify-center text-sm font-medium'>
          {t('page')} {page} / {totalPages}
        </div>
        <div className='flex items-center space-x-2'>
          <Button
            variant='outline'
            className='hidden h-8 w-8 p-0 lg:flex'
            onClick={() => navigatePage(FIRST_INDEX_PAGE.toString())}
            disabled={isEqual(page, FIRST_INDEX_PAGE)}
          >
            <span className='sr-only'>{t('first_page')}</span>
            <ChevronsLeft className='h-4 w-4' />
          </Button>
          <Button
            variant='outline'
            className='h-8 w-8 p-0'
            onClick={() => navigatePage((page ? page - 1 : FIRST_INDEX_PAGE).toString())}
            disabled={isEqual(page, FIRST_INDEX_PAGE)}
          >
            <span className='sr-only'>{t('previous_page')}</span>
            <ChevronLeftIcon className='h-4 w-4' />
          </Button>
          <Button
            variant='outline'
            className='h-8 w-8 p-0'
            onClick={() => navigatePage((page ? page + 1 : LAST_INDEX_PAGE).toString())}
            disabled={isEqual(page, LAST_INDEX_PAGE)}
          >
            <span className='sr-only'>{t('next_page')}</span>
            <ChevronRightIcon className='h-4 w-4' />
          </Button>
          <Button
            variant='outline'
            className='hidden h-8 w-8 p-0 lg:flex'
            onClick={() => navigatePage(LAST_INDEX_PAGE.toString())}
            disabled={isEqual(page, LAST_INDEX_PAGE)}
          >
            <span className='sr-only'>{t('last_page')}</span>
            <ChevronsRight className='h-4 w-4' />
          </Button>
        </div>
      </div>
    </div>
  )
}
