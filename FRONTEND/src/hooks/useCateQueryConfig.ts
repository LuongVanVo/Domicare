import { CategoryListConfig } from '@/models/interface/category.interface'
import isUndefined from 'lodash/isUndefined'
import omitBy from 'lodash/omitBy'
import { useParamsString } from './usePrdQueryConfig'

export type QueryCateConfig = {
  [key in keyof CategoryListConfig]: string
}

export const useCateQueryConfig = () => {
  const queryString: QueryCateConfig = useParamsString()
  const queryConfig: QueryCateConfig = omitBy(
    {
      page: queryString.page || 1,
      size: queryString.size || 10,
      sortBy: queryString.sortBy,
      searchName: queryString.searchName,
      sortDirection: queryString.sortDirection
    },
    isUndefined
  )

  return queryConfig
}
