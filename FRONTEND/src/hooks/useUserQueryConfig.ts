import { UserListConfig } from '@/models/interface/user.interface'
import { useParamsString } from './usePrdQueryConfig'
import isUndefined from 'lodash/isUndefined'
import omitBy from 'lodash/omitBy'
import { ROLE_TYPE } from '@/models/types/user.type'

export type QueryUserConfig = {
  [key in keyof UserListConfig]: string
}

export function useUserQueryConfig(role: ROLE_TYPE) {
  const queryString: QueryUserConfig = useParamsString()
  const queryParams: QueryUserConfig = omitBy(
    {
      page: queryString.page || 1,
      size: queryString.size || 10,
      searchRoleName: queryString.searchRoleName || role,
      sortBy: queryString.sortBy,
      searchName: queryString.searchName,
      sortDirection: queryString.sortDirection
    },
    isUndefined
  )
  return queryParams
}
