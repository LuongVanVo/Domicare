import isEqual from 'lodash/isEqual'
import { DeleteDialog } from '@/components/DataTable'
import { ADMIN_STATUS, UserDialogType } from '@/configs/consts'
import { UserActionDialog } from './UserActionDialog'
import { useUsers } from '@/core/contexts/user.context'
import { useUserDelete } from '@/core/queries/user.query'

export function UserDialog() {
  const { open, setOpen, currentRow, setCurrentRow } = useUsers()
  const UserDelMutation = useUserDelete()
  return (
    <>
      <UserActionDialog
        key='User-add'
        open={isEqual(open, ADMIN_STATUS.ADD)}
        onOpenChange={() => setOpen(ADMIN_STATUS.ADD as UserDialogType)}
      />

      {currentRow && (
        <>
          <UserActionDialog
            key={`User-edit-${currentRow.id}`}
            open={isEqual(open, ADMIN_STATUS.EDIT)}
            onOpenChange={() => {
              setOpen(ADMIN_STATUS.EDIT as UserDialogType)
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <DeleteDialog
            key={`User-delete-${currentRow.id}`}
            open={isEqual(open, ADMIN_STATUS.DELETE)}
            onOpenChange={() => {
              setOpen(ADMIN_STATUS.DELETE as UserDialogType)
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentItem={currentRow}
            displayField='email'
            titleLabel='người dùng'
            getId={(c) => c.id as number}
            onDelete={(id) => UserDelMutation.mutate(Number(id))}
          />
        </>
      )}
    </>
  )
}
