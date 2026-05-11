import { path } from '@/core/constants/path'
import DataTable from '@/components/DataTable'
import { UserProvider } from '@/core/contexts/user.context'
import { useUserQuery } from '@/core/queries/user.query'
import { DataTablePagination } from '@/components/DataTable/DataTablePagination'
import { UserButtonAction } from '../User.manage/components/UserButtonAction'
import { useSaleColumns } from './components/SaleColumns'
import { UserDialog } from '../User.manage/components/UserDialog'
import { useUserQueryConfig } from '@/hooks/useUserQueryConfig'
import { ROLE_SALE } from '@/configs/consts'
import { tableLoadingData } from '@/core/constants/initialValue.const'
import DataLoading from '@/components/DataTable/DataLoading'

export default function Sale() {
  return (
    <UserProvider>
      <SaleContent />
    </UserProvider>
  )
}
function SaleContent() {
  const queryString = useUserQueryConfig(ROLE_SALE)
  const { data: usersData, isLoading } = useUserQuery({ queryString })
  const userList = usersData?.data?.data.data
  const pageController = usersData?.data?.data.meta
  const columns = useSaleColumns()

  return (
    <>
      <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
        {isLoading ? (
          <DataLoading columns={tableLoadingData.sale} />
        ) : (
          <DataTable
            ButtonAction={<UserButtonAction />}
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
