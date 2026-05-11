import { path } from '@/core/constants/path'
import { useProductColumns } from './components/ProductColumns'
import DataTable from '@/components/DataTable'
import { ProductDialog } from './components/ProductDialog'
import { ProductButtonAction } from './components/ProductButtonAction'
import ProductProvider from '@/core/contexts/product.context'
import { useProductQuery } from '@/core/queries/product.query'
import { usePrdQueryConfig } from '@/hooks/usePrdQueryConfig'
import { DataTablePagination } from '@/components/DataTable/DataTablePagination'
import DataLoading from '@/components/DataTable/DataLoading'
import { tableLoadingData } from '@/core/constants/initialValue.const'

export default function Product() {
  return (
    <ProductProvider>
      <ProductContent />
    </ProductProvider>
  )
}

function ProductContent() {
  const queryString = usePrdQueryConfig()
  const { data: productsData, isLoading } = useProductQuery({ queryString })
  const prdList = productsData?.data?.data?.data
  const pageController = productsData?.data?.data?.meta
  const columns = useProductColumns()

  return (
    <>
      <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
        {isLoading ? (
          <DataLoading columns={tableLoadingData.product} />
        ) : (
          <DataTable
            ButtonAction={<ProductButtonAction />}
            columns={columns}
            data={prdList || []}
            searchKey='searchName'
            DataTablePagination={
              <DataTablePagination
                pageController={pageController}
                path={path.admin.manage.product}
                queryString={queryString}
              />
            }
          />
        )}
      </div>
      <ProductDialog />
    </>
  )
}
