import isEqual from 'lodash/isEqual'
import { DeleteDialog } from '@/components/DataTable'

import { ADMIN_STATUS, ProductDialogType } from '@/configs/consts'
import { ProductActionDialog } from './ProductActionDialog'
import { useProducts } from '@/core/contexts/product.context'
import { useProductDelete } from '@/core/queries/product.query'

export function ProductDialog() {
  const { open, setOpen, currentRow, setCurrentRow } = useProducts()
  const ProductDelMutation = useProductDelete()
  return (
    <>
      <ProductActionDialog
        key='Product-add'
        open={isEqual(open, ADMIN_STATUS.ADD)}
        onOpenChange={() => setOpen(ADMIN_STATUS.ADD as ProductDialogType)}
      />

      {currentRow && (
        <>
          <ProductActionDialog
            key={`Product-edit-${currentRow.id}`}
            open={isEqual(open, ADMIN_STATUS.EDIT)}
            onOpenChange={() => {
              setOpen(ADMIN_STATUS.EDIT as ProductDialogType)
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <DeleteDialog
            key={`Product-delete-${currentRow.id}`}
            open={isEqual(open, ADMIN_STATUS.DELETE)}
            onOpenChange={() => {
              setOpen(ADMIN_STATUS.DELETE as ProductDialogType)
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentItem={currentRow}
            displayField='name'
            titleLabel='dịch vụ'
            getId={(c) => c.id as number}
            onDelete={(id) => ProductDelMutation.mutate(Number(id))}
          />
        </>
      )}
    </>
  )
}
