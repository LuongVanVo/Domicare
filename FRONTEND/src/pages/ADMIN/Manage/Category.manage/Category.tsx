import { path } from '@/core/constants/path'
import { useCategoryColumns } from './components/CategoryColumns'
import CategoryProvider from '@/core/contexts/category.context'
import DataTable from '@/components/DataTable'
import { CategoryDialog } from './components/CategoryDialog'
import { CategoryButtonAction } from './components/CategoryButtonAction'
import { useCateQueryConfig } from '@/hooks/useCateQueryConfig'
import { useCategoryQuery } from '@/core/queries/product.query'
import { DataTablePagination } from '@/components/DataTable/DataTablePagination'
import DataLoading from '@/components/DataTable/DataLoading'
import { tableLoadingData } from '@/core/constants/initialValue.const'

export default function Category() {
  return (
    <CategoryProvider>
      <CategoryContent />
    </CategoryProvider>
  )
}

function CategoryContent() {
  const queryString = useCateQueryConfig()
  const { data, isLoading } = useCategoryQuery({ queryString })
  const categoryList = data?.data?.data?.data
  const pageController = data?.data?.data?.meta
  const columns = useCategoryColumns()

  return (
    <>
      <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
        {isLoading ? (
          <DataLoading columns={tableLoadingData.category} />
        ) : (
          <DataTable
            ButtonAction={<CategoryButtonAction />}
            columns={columns}
            data={categoryList || []}
            searchKey='searchName'
            searchPlaceholder='Tìm kiếm theo tên danh mục'
            DataTablePagination={
              <DataTablePagination
                pageController={pageController}
                path={path.admin.manage.category}
                queryString={queryString}
              />
            }
          />
        )}
      </div>
      <CategoryDialog />
    </>
  )
}
