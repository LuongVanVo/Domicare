import { useCategories } from '@/core/contexts/category.context'
import { CategoryActionDialog } from './CategoryActionDialog'

import isEqual from 'lodash/isEqual'
import { DeleteDialog } from '@/components/DataTable'
import { useCategoryDelete } from '@/core/queries/product.query'
import { ADMIN_STATUS, CategoryDialogType } from '@/configs/consts'

export function CategoryDialog() {
  const { open, setOpen, currentRow, setCurrentRow } = useCategories()
  const categoryDelMutation = useCategoryDelete()
  return (
    <>
      <CategoryActionDialog
        key='category-add'
        open={isEqual(open, ADMIN_STATUS.ADD)}
        onOpenChange={() => setOpen(ADMIN_STATUS.ADD as CategoryDialogType)}
      />

      {currentRow && (
        <>
          <CategoryActionDialog
            key={`category-edit-${currentRow.id}`}
            open={isEqual(open, ADMIN_STATUS.EDIT)}
            onOpenChange={() => {
              setOpen(ADMIN_STATUS.EDIT as CategoryDialogType)
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <DeleteDialog
            key={`category-delete-${currentRow.id}`}
            open={isEqual(open, ADMIN_STATUS.DELETE)}
            onOpenChange={() => {
              setOpen(ADMIN_STATUS.DELETE as CategoryDialogType)
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentItem={currentRow}
            displayField='name'
            titleLabel='danh mục '
            getId={(c) => c.id}
            onDelete={(id) => categoryDelMutation.mutate(Number(id))}
          />
        </>
      )}
    </>
  )
}
