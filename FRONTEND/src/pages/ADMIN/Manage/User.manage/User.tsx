import { path } from '@/core/constants/path'
import { useUserColumns } from './components/UserColumns'
import DataTable from '@/components/DataTable'
import { UserProvider } from '@/core/contexts/user.context'
import { useUserQuery } from '@/core/queries/user.query'
import { DataTablePagination } from '@/components/DataTable/DataTablePagination'
import { UserDialog } from './components/UserDialog'
import { useUserQueryConfig } from '@/hooks/useUserQueryConfig'
import { ROLE_USER } from '@/configs/consts'
import DataLoading from '@/components/DataTable/DataLoading'
import { tableLoadingData } from '@/core/constants/initialValue.const'

export default function User() {
  return (
    <UserProvider>
      <UserContent />
    </UserProvider>
  )
}

function UserContent() {
  const queryString = useUserQueryConfig(ROLE_USER)
  const { data: usersData, isLoading } = useUserQuery({ queryString })
  const userList = usersData?.data?.data.data
  const pageController = usersData?.data?.data.meta
  const columns = useUserColumns()

  return (
    <>
      <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
        {isLoading ? (
          <DataLoading columns={tableLoadingData.user} />
        ) : (
          <DataTable
            columns={columns}
            data={userList || []}
            searchKey='searchName'
            DataTablePagination={
              <DataTablePagination
                pageController={pageController}
                path={path.admin.manage.user}
                queryString={queryString}
              />
            }
          />
        )}
      </div>
      <UserDialog />
    </>
  )
}
