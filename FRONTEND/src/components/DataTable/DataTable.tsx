import {
  ColumnDef,
  ColumnFiltersState,
  RowData,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table'

import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cloneElement, ReactElement, ReactNode, useState } from 'react'
import { noPrdImg } from '@/assets/images'
import { DataTablePaginationProps } from './DataTablePagination'
import { useNavigate, useLocation } from 'react-router-dom'
import { DataTableSearch } from './DataTableSearch'
import { useTranslation } from 'react-i18next'

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    className?: string
    displayName?: string
    sortKey?: string
  }
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  name?: string
  searchKey?: string
  searchPlaceholder?: string
  isBooking?: boolean
  ButtonAction?: ReactNode
  DataTablePagination?: ReactElement<DataTablePaginationProps<any, TData>>
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder,
  ButtonAction,
  DataTablePagination
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})

  const navigate = useNavigate()
  const location = useLocation()

  const handleSortingChange = (updater: SortingState | ((prev: SortingState) => SortingState)) => {
    const newSortingState = typeof updater === 'function' ? updater(sorting) : updater
    setSorting(newSortingState)

    const searchParams = new URLSearchParams(location.search)
    if (newSortingState.length > 0) {
      const sort = newSortingState[0]
      const column = table.getColumn(sort.id)
      const sortKey = column?.columnDef.meta?.sortKey || sort.id
      searchParams.set('sortBy', sortKey)
      searchParams.set('sortDirection', sort.desc ? 'desc' : 'asc')
    } else {
      searchParams.delete('sortBy')
      searchParams.delete('sortDirection')
    }
    navigate({ search: searchParams.toString() })
  }

  const table = useReactTable({
    data,
    columns,
    onSortingChange: handleSortingChange,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection
    },
    enableMultiSort: true,
    enableFilters: true
  })
  const { t } = useTranslation('common')
  return (
    <div className='w-full'>
      <div className='flex items-center justify-between py-2'>
        {searchKey && (
          <DataTableSearch
            searchKey={searchKey}
            placeholder={searchPlaceholder}
            currentParams={Object.fromEntries(new URLSearchParams(location.search))}
            pathname={location.pathname}
          />
        )}
        {ButtonAction}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline' className='ml-auto'>
              {t('display')} <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className='capitalize'
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.columnDef.meta?.displayName || column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className='rounded-md overflow-hidden border border-neutral-900'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className='group/row'>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={header.column.columnDef.meta?.className ?? ''}
                    >
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getCoreRowModel().rows?.length ? (
              table.getCoreRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'} className='group/row'>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className={cell.column.columnDef.meta?.className ?? ''}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className='h-24 text-center'>
                  <div className='flex flex-col justify-center items-center pt-5'>
                    <img className='w-auto h-32' src={noPrdImg} alt='no_product' />
                    <p className='text-black text-center py-4'>{t('empty_category')}</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {DataTablePagination && cloneElement(DataTablePagination, { table })}
    </div>
  )
}
