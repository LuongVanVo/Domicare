import { Checkbox } from '@/components/ui/checkbox'
import { Product } from '@/models/interface/product.interface'
import { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/DataTable/DataTableColumnHeader'
import { DataTableRowActions } from '@/components/DataTable/DataTableRowAction'
import { useProducts } from '@/core/contexts/product.context'
import { CategoryMini } from '@/models/interface/category.interface'
import { formatCurrentcy } from '@/utils/format'
import { cn } from '@/core/lib/utils'
import { useTranslation } from 'react-i18next'

export const useProductColumns = (): ColumnDef<Product>[] => {
  const { setOpen, setCurrentRow } = useProducts()
  const { t } = useTranslation('admin')
  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label='Select all'
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label='Select row'
        />
      ),
      enableSorting: false,
      enableHiding: false
    },
    {
      accessorKey: 'id',
      header: 'ID',
      meta: {
        displayName: t('table.id')
      },
      cell: ({ row }) => <div>#{row.getValue('id')}</div>,
      enableHiding: false
    },
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.service_name')} />,
      meta: {
        displayName: t('table.service_name'),
        className: cn(
          'sticky lg:relative left-0 md:table-cell',
          'bg-white lg:bg-inherit',
          'transition-colors duration-200',
          'lg:[.group:hover_&]:!bg-muted',
          'lg:[.group[data-state=selected]_&]:!bg-muted',
          'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)] lg:drop-shadow-none'
        )
      },
      cell: ({ row }) => (
        <div className='w-fit  text-nowrap max-w-3xs md:max-w-md truncate'>{row.getValue('name')}</div>
      ),
      enableSorting: true,
      enableGlobalFilter: true
    },
    {
      accessorKey: 'categoryMini',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.category_name')} />,
      meta: {
        displayName: t('table.category_name')
      },
      cell: ({ row }) => {
        const categoryMini: CategoryMini = row.getValue('categoryMini')
        return <div className='w-fit text-nowrap max-w-3xs md:max-w-md truncate'>{categoryMini?.name}</div>
      },
      enableSorting: false
    },
    {
      accessorKey: 'price',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.price_before_discount')} />,
      meta: {
        displayName: t('table.price_before_discount')
      },
      cell: ({ row }) => {
        const price = row.getValue('price') as number
        return <div>{price ? `${formatCurrentcy(price)} VND` : '--'}</div>
      }
    },
    {
      accessorKey: 'discount',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.discount')} />,
      meta: {
        displayName: t('table.discount')
      },
      cell: ({ row }) => {
        const discount = row.getValue('discount') as number
        return <div className='text-center'>{discount != null ? `${discount}%` : '--'}</div>
      },
      enableSorting: false
    },
    {
      accessorKey: 'priceAfterDiscount',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.price_after_discount')} />,
      meta: {
        displayName: t('table.price_after_discount')
      },
      cell: ({ row }) => {
        const priceAfter = row.getValue('priceAfterDiscount') as number
        return <div>{priceAfter ? `${formatCurrentcy(priceAfter)} VND` : '--'}</div>
      }
    },
    {
      accessorKey: 'ratingStar',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.rating')} />,
      meta: {
        displayName: t('table.rating'),
        sortKey: 'overalRating'
      },
      cell: ({ row }) => {
        const rating = row.getValue('ratingStar') as number
        return <div className='text-center'>{rating != null ? rating : '--'}</div>
      }
    },
    {
      accessorKey: 'createAt',
      header: () => <div className='text-center capitalize'>{t('table.created_at')}</div>,
      meta: {
        displayName: t('table.created_at')
      },
      cell: ({ row }) => {
        const date = row.getValue('createAt') as string
        return <div className='text-center'>{date ? new Date(date).toLocaleDateString() : '--'}</div>
      },
      enableHiding: false
    },
    {
      accessorKey: 'updateAt',
      header: () => <div className='text-center capitalize'>{t('table.updated_at')}</div>,
      meta: {
        displayName: t('table.updated_at')
      },
      cell: ({ row }) => {
        const date = row.getValue('updateAt') as string
        return <div className='text-center'>{date ? new Date(date).toLocaleDateString() : '-'}</div>
      },
      enableHiding: false
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DataTableRowActions
          row={row}
          onEdit={(row) => {
            setCurrentRow(row)
            setOpen('edit')
          }}
          onDelete={(row) => {
            setCurrentRow(row)
            setOpen('delete')
          }}
        />
      ),
      enableHiding: false
    }
  ]
}
