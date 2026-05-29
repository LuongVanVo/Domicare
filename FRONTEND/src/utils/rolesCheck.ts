import { ROLES } from '@/configs/consts'
import { role } from '@/models/interface/user.interface'
import isEqual from 'lodash/isEqual'

export const rolesCheck = {
  isAdminOrSale: (roles: role[]) =>
    roles.some((role) => isEqual(role.name, ROLES.SALE) || isEqual(role.name, ROLES.ADMIN)),
  isAdmin: (roles: role[]) => roles.some((role) => isEqual(role.name, ROLES.ADMIN)),
  isSale: (roles: role[]) => roles.some((role) => isEqual(role.name, ROLES.SALE)),
  isUser: (roles: role[]) => roles.some((role) => isEqual(role.name, ROLES.USER))
}
