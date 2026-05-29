import { ProductListConfig } from '@/models/interface/product.interface'
import isUndefined from 'lodash/isUndefined'
import omitBy from 'lodash/omitBy'
import { useSearchParams } from 'react-router-dom'

export type QueryPrdConfig = {
  [key in keyof ProductListConfig]: string
}
export const useParamsString = () => {
  const [searchParams] = useSearchParams()
  return Object.fromEntries(searchParams.entries())
}
export const usePrdQueryConfig = () => {
  const queryString: QueryPrdConfig = useParamsString()
  const queryConfig: QueryPrdConfig = omitBy(
    {
      page: queryString.page || 1,
      size: queryString.size || 10,
      categoryId: queryString.categoryId,
      sortDirection: queryString.sortDirection || 'desc',
      sortBy: queryString.sortBy,
      filter: queryString.filter,
      searchName: queryString.searchName
    },
    isUndefined
  )

  return queryConfig
}
